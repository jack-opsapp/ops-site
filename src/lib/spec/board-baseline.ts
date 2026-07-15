/**
 * SPEC OPS BOARD — operator-managed capacity baseline.
 *
 * The public board is driven by real operator data (`spec_public_board_snapshot`,
 * refreshed every 5 min). When that snapshot can't be read — Supabase env
 * missing (local dev / preview), a transient outage, or no snapshot row yet —
 * the board must still show plausible, honest capacity instead of a dead
 * all-OPEN / 0-waitlist grid.
 *
 * This module is that floor: an explicit, reviewable **operator baseline** —
 * NOT synthetic client-side randomness. The availability + waitlist buckets are
 * fixed editorial policy (a founder-run, slot-limited build service: Setup runs
 * open, Build runs limited with a short queue, Enterprise runs by waitlist).
 * Only the calendar advances: each tier's next-intake Monday rolls forward from
 * "today" so the dates never decay into the past, while the buckets stay put
 * until an operator changes them (here, or in production via the admin tool).
 *
 * Fabricated scarcity (random "2 slots left" tickers) is deliberately avoided —
 * it erodes trust, carries consumer-protection risk, and would fight the live
 * pipeline. Everything here is deterministic given `today`, so it is SSR/CSR
 * stable and unit-testable. The board badges this state as FALLBACK (not LIVE).
 */

import type {
  SpecBoardAvailability,
  SpecBoardSnapshot,
  SpecBoardTier,
  SpecBoardWaitlistBucket,
} from './board';
import { toUtcDay, upcomingMonday } from './timeline';

interface BaselineTier {
  tier: SpecBoardTier;
  availability: SpecBoardAvailability;
  waitlist_bucket: SpecBoardWaitlistBucket;
  /** Whole weeks from the upcoming Monday until this tier's next intake opens. */
  startOffsetWeeks: number;
}

/**
 * Operator baseline policy. Edit these buckets to reflect real standing
 * capacity; production overrides them per-tier through the live snapshot.
 */
export const SPEC_BOARD_BASELINE: readonly BaselineTier[] = [
  // SPEC-01 is light-touch + highest throughput → open, intake next Monday.
  { tier: 'spec01', availability: 'OPEN', waitlist_bucket: '0', startOffsetWeeks: 0 },
  // SPEC-02 is the recommended tier + carries the most demand → limited, short queue.
  { tier: 'spec02', availability: 'LIMITED', waitlist_bucket: '1-2', startOffsetWeeks: 2 },
  // SPEC-03 is founder-bandwidth bound → waitlist, intake a few weeks out.
  { tier: 'spec03', availability: 'WAITLIST', waitlist_bucket: '3+', startOffsetWeeks: 5 },
];

/**
 * ISO-8601 year-week ("2026-23") for a date — the inverse of
 * `parseIsoYearWeek` in board-display. The ISO year is taken from the
 * Thursday of the date's week, so it round-trips a Monday back to itself.
 */
export function toIsoYearWeek(d: Date): string {
  const date = toUtcDay(d);
  const day = date.getUTCDay() || 7; // Mon=1..Sun=7
  // Shift to the Thursday of this ISO week — Thursday fixes the ISO year.
  date.setUTCDate(date.getUTCDate() + 4 - day);
  const isoYear = date.getUTCFullYear();
  const yearStart = new Date(Date.UTC(isoYear, 0, 1));
  const week = Math.ceil(((date.getTime() - yearStart.getTime()) / 86_400_000 + 1) / 7);
  return `${isoYear}-${String(week).padStart(2, '0')}`;
}

/**
 * Build a snapshot from the operator baseline, with each tier's
 * `next_start_week` rolled forward relative to `today`. Returned as a
 * FALLBACK snapshot (`is_stale: true`, `refreshed_at: null`) so the board
 * renders the rows but hides the LIVE indicator.
 *
 * `today` is passed in (server clock at request time) so the result is
 * deterministic and stays identical across the SSR/CSR boundary once the
 * strings are serialized into the board's initial props.
 */
export function buildBaselineSnapshot(today: Date): SpecBoardSnapshot {
  const baseMonday = upcomingMonday(toUtcDay(today));
  const tiers = SPEC_BOARD_BASELINE.map((b) => {
    const start = new Date(baseMonday);
    start.setUTCDate(baseMonday.getUTCDate() + b.startOffsetWeeks * 7);
    return {
      tier: b.tier,
      availability: b.availability,
      waitlist_bucket: b.waitlist_bucket,
      next_start_week: toIsoYearWeek(start),
      is_accepting_bookings: true,
      public_note: null,
    };
  });
  return { tiers, refreshed_at: null, is_stale: true };
}
