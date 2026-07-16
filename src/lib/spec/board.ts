/**
 * SPEC — public OPS BOARD data fetch.
 *
 * Reads from `public.spec_public_board_snapshot` (single row, anon
 * SELECT granted, refreshed every 5 min by `pg_cron` via the
 * `private.refresh_spec_board_snapshot()` SECURITY DEFINER function).
 * Schema is documented in 02_DATA_MODEL.md § "Public board — snapshot
 * table".
 *
 * The snapshot is sanitized aggregate data only — no raw project rows
 * are exposed. The shape is intentionally coarse: availability bucket,
 * waitlist range, ISO-week of next-start, accepting-bookings flag,
 * public note. A competitor reading the payload sees only bucketed
 * state.
 *
 * This helper is the canonical reader. It's called from:
 *   - `/api/spec/board` route handler — for client-side refreshes /
 *     edge-cache hydration
 *   - `app/spec/page.tsx` RSC — for the initial render of SpecOpsBoard
 *
 * Failure modes (all return a FALLBACK snapshot — `is_stale: true` so the
 * UI hides the LIVE indicator and shifts the timestamp to amber):
 *   - Supabase env vars missing → seeded operator baseline (board-baseline)
 *   - Network / RLS error → seeded operator baseline
 *   - Snapshot row missing → seeded operator baseline
 *   - Snapshot row present but empty → dictionary static defaults
 *   - Snapshot row older than 72h → returns the data but flags
 *     `is_stale = true` so the UI shifts to amber
 *
 * The baseline keeps the board from ever rendering a dead all-OPEN grid;
 * it is explicit, reviewable operator policy with rolling next-intake
 * dates, NOT synthetic scarcity. See lib/spec/board-baseline.ts.
 */

import { createClient } from '@supabase/supabase-js';
import { buildBaselineSnapshot } from './board-baseline';

export const SPEC_BOARD_TIERS = ['spec01', 'spec02', 'spec03'] as const;
export type SpecBoardTier = (typeof SPEC_BOARD_TIERS)[number];

export type SpecBoardAvailability = 'OPEN' | 'LIMITED' | 'WAITLIST' | 'CLOSED';
export type SpecBoardWaitlistBucket = '0' | '1-2' | '3+';

export interface SpecBoardTierRow {
  tier: SpecBoardTier;
  availability: SpecBoardAvailability;
  waitlist_bucket: SpecBoardWaitlistBucket;
  /** ISO year-week, e.g. "2026-23". May be null when no future date can be derived. */
  next_start_week: string | null;
  is_accepting_bookings: boolean;
  /** Operator-set explainer surfaced when `is_accepting_bookings = false`. */
  public_note: string | null;
}

export interface SpecBoardSnapshot {
  tiers: SpecBoardTierRow[];
  /** ISO-8601 timestamp of the latest snapshot refresh. Null when the snapshot is unavailable. */
  refreshed_at: string | null;
  /**
   * True when:
   *   - the snapshot is unavailable (Supabase down, RLS denied, env missing), OR
   *   - the snapshot row is older than 72h.
   * The UI shifts the timestamp to amber and hides the "LIVE" indicator when true.
   */
  is_stale: boolean;
}

const STALE_AFTER_HOURS = 72;

interface SnapshotRow {
  data: unknown;
  refreshed_at: string;
}

const KNOWN_TIERS: ReadonlySet<string> = new Set(SPEC_BOARD_TIERS);
const KNOWN_AVAILABILITY: ReadonlySet<string> = new Set([
  'OPEN',
  'LIMITED',
  'WAITLIST',
  'CLOSED',
]);
const KNOWN_WAITLIST_BUCKET: ReadonlySet<string> = new Set(['0', '1-2', '3+']);

function isStringRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function coerceTierRow(raw: unknown): SpecBoardTierRow | null {
  if (!isStringRecord(raw)) return null;
  const tier = typeof raw.tier === 'string' ? raw.tier.toLowerCase() : '';
  if (!KNOWN_TIERS.has(tier)) return null;

  const availability = typeof raw.availability === 'string' ? raw.availability.toUpperCase() : '';
  const waitlistBucket = typeof raw.waitlist_bucket === 'string' ? raw.waitlist_bucket : '';
  const nextStartWeek = typeof raw.next_start_week === 'string' ? raw.next_start_week : null;
  const isAcceptingBookings = raw.is_accepting_bookings !== false;
  const publicNote = typeof raw.public_note === 'string' ? raw.public_note : null;

  return {
    tier: tier as SpecBoardTier,
    availability: (KNOWN_AVAILABILITY.has(availability)
      ? availability
      : 'OPEN') as SpecBoardAvailability,
    waitlist_bucket: (KNOWN_WAITLIST_BUCKET.has(waitlistBucket)
      ? waitlistBucket
      : '0') as SpecBoardWaitlistBucket,
    next_start_week: nextStartWeek,
    is_accepting_bookings: isAcceptingBookings,
    public_note: publicNote,
  };
}

/**
 * Fallback snapshot used whenever the live snapshot can't be read (env
 * missing, network/RLS error, or no snapshot row at all). Returns the
 * seeded operator baseline so the board never renders dead. `new Date()`
 * is read here at server request time and serialized into the board's
 * initial props, keeping the derived rows SSR/CSR-stable.
 */
function fallbackSnapshot(): SpecBoardSnapshot {
  return buildBaselineSnapshot(new Date());
}

function hoursBetween(latest: string, now: number): number {
  const t = Date.parse(latest);
  if (Number.isNaN(t)) return Infinity;
  return (now - t) / (1000 * 60 * 60);
}

/**
 * Fetch the current OPS BOARD snapshot.
 *
 * Always resolves (never throws). On any failure, returns the seeded
 * operator baseline (`fallbackSnapshot()`) with the "LIVE" indicator
 * hidden + amber timestamp, so the board shows plausible capacity rather
 * than a dead grid.
 */
export async function getSpecBoardSnapshot(): Promise<SpecBoardSnapshot> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // No Supabase configured (local dev without .env.local, build env
  // missing the key) — show the seeded operator baseline.
  if (!url || !anonKey) return fallbackSnapshot();

  let row: SnapshotRow | null = null;
  try {
    const client = createClient(url, anonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data, error } = await client
      .from('spec_public_board_snapshot')
      .select('data, refreshed_at')
      .limit(1)
      .maybeSingle();

    if (error || !data) return fallbackSnapshot();
    row = data as SnapshotRow;
  } catch {
    return fallbackSnapshot();
  }

  const refreshedAt = row.refreshed_at;
  const isStaleByAge = hoursBetween(refreshedAt, Date.now()) > STALE_AFTER_HOURS;

  // `data` is the jsonb column. Per the spec, it's a tier row array.
  const rawTiers = Array.isArray(row.data) ? row.data : [];
  const tiers = rawTiers
    .map(coerceTierRow)
    .filter((t): t is SpecBoardTierRow => t !== null);

  // Snapshot row exists but contains no tier data. Fall through to
  // static UI fallback rather than rendering an empty board.
  if (tiers.length === 0) {
    return { tiers: [], refreshed_at: refreshedAt, is_stale: true };
  }

  // Stable tier order: spec01, spec02, spec03.
  tiers.sort((a, b) => SPEC_BOARD_TIERS.indexOf(a.tier) - SPEC_BOARD_TIERS.indexOf(b.tier));

  return {
    tiers,
    refreshed_at: refreshedAt,
    is_stale: isStaleByAge,
  };
}
