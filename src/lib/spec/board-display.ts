/**
 * SPEC OPS BOARD — snapshot → display-row derivation (shared, pure).
 *
 * Extracted from `SpecOpsBoard.tsx` so every surface that needs the
 * public capacity readout derives it the SAME way and can never drift:
 *   - `SpecOpsBoard` (the full board table + timeline)
 *   - `SpecStickyDepositBar` (the focal-tier readout in the sticky bar)
 *
 * Pure + framework-free: no React, no DOM, no `Date.now()` reads inside
 * the row math (callers pass any clock-derived inputs explicitly through
 * the snapshot's `next_start_week` strings, which are produced server-side
 * — see `lib/spec/board.ts` + `lib/spec/board-baseline.ts`). That keeps the
 * board rows identical across the SSR/CSR boundary (no hydration drift) and
 * makes the derivation trivially unit-testable.
 *
 * Numbers/dates render JetBrains Mono, tabular-lining, slashed-zero at the
 * component layer; unknown windows surface the em-dash empty state, never a
 * fabricated value.
 */

import {
  SPEC_BOARD_TIERS,
  type SpecBoardSnapshot,
  type SpecBoardTier,
  type SpecBoardTierRow,
} from './board';

/**
 * Per-tier duration window (days). Mirrors `public.spec_capacity` seed in
 * 02_DATA_MODEL.md. Used to project the delivery window from a tier's
 * next-open-slot Monday. Defensive defaults — if a snapshot row lacks
 * `next_start_week`, the caller falls back to a relative window string.
 */
export const TIER_DURATIONS: Record<
  SpecBoardTier,
  { discovery: [number, number]; build: [number, number] }
> = {
  setup: { discovery: [3, 5], build: [7, 14] },
  build: { discovery: [5, 7], build: [14, 21] },
  enterprise: { discovery: [7, 14], build: [28, 42] },
};

/** Section copy keys — pulled from spec.json so en/es swap cleanly. */
export interface SpecOpsBoardCopy {
  sectionLabel: string;
  subEyebrow: string;
  liveLabel: string;
  staleLabel: string;
  updatedPrefix: string;
  updatedJustNow: string;
  updatedMinAgo: string;
  updatedHrAgo: string;
  updatedDaysAgo: string;
  unavailableNote: string;
  headers: {
    tier: string;
    availability: string;
    waitlist: string;
    nextIntake: string;
    yourDelivery: string;
  };
  timeline: {
    today: string;
    discovery: string;
    build: string;
    delivery: string;
  };
  status: {
    open: string;
    limited: string;
    waitlist: string;
    closed: string;
  };
  waitlist: {
    zero: string;
    range: string;
    many: string;
  };
  closedPrefix: string;
  nextStartPrefix: string;
  deliveryPrefix: string;
  deliveryUnknown: string;
  fallback: Record<SpecBoardTier, { nextIntake: string; delivery: string }>;
  /** Per-tier display label (SETUP / BUILD / ENTERPRISE). */
  tierLabels: Record<SpecBoardTier, string>;
}

export interface DisplayRow {
  tier: SpecBoardTier;
  label: string;
  availability: 'OPEN' | 'LIMITED' | 'WAITLIST' | 'CLOSED';
  waitlistText: string;
  nextIntakeText: string;
  deliveryText: string;
  /** Parsed next-open-slot Monday for the timeline engine; null → engine projects forward. */
  startMonday: Date | null;
  isAcceptingBookings: boolean;
  publicNote: string | null;
}

/** Static fallback rows used when the snapshot carries no tier data at all. */
export function buildFallbackRows(copy: SpecOpsBoardCopy): DisplayRow[] {
  return SPEC_BOARD_TIERS.map((tier) => ({
    tier,
    label: copy.tierLabels[tier],
    availability: 'OPEN' as const,
    waitlistText: copy.waitlist.zero,
    nextIntakeText: copy.fallback[tier].nextIntake,
    deliveryText: copy.fallback[tier].delivery,
    startMonday: null,
    isAcceptingBookings: true,
    publicNote: null,
  }));
}

/** Parse ISO year-week like "2026-23" into the Monday of that week (UTC). */
export function parseIsoYearWeek(yearWeek: string): Date | null {
  const match = /^(\d{4})-?W?-?(\d{1,2})$/.exec(yearWeek);
  if (!match) return null;
  const year = Number(match[1]);
  const week = Number(match[2]);
  if (!Number.isFinite(year) || !Number.isFinite(week) || week < 1 || week > 53) return null;
  // ISO 8601: week 1 is the week containing the first Thursday.
  // Jan 4 always falls in week 1, so we work from there.
  const jan4 = new Date(Date.UTC(year, 0, 4));
  const jan4Day = jan4.getUTCDay() || 7; // 1..7 (Mon..Sun)
  const week1Monday = new Date(jan4);
  week1Monday.setUTCDate(jan4.getUTCDate() - (jan4Day - 1));
  const target = new Date(week1Monday);
  target.setUTCDate(week1Monday.getUTCDate() + (week - 1) * 7);
  return target;
}

const SHORT_MONTH = [
  'JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN',
  'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC',
];

export function formatShortDate(d: Date): string {
  return `${SHORT_MONTH[d.getUTCMonth()]} ${String(d.getUTCDate()).padStart(2, '0')}`;
}

/** Build display rows from a populated snapshot (live or baseline). */
export function buildLiveRows(
  snapshot: SpecBoardSnapshot,
  copy: SpecOpsBoardCopy,
): DisplayRow[] {
  // Index snapshot rows by tier for fast lookup. Tiers missing from the
  // snapshot fall back to OPEN / dictionary defaults.
  const byTier = new Map<SpecBoardTier, SpecBoardTierRow>();
  for (const row of snapshot.tiers) byTier.set(row.tier, row);

  return SPEC_BOARD_TIERS.map((tier) => {
    const row = byTier.get(tier);
    const fallbackText = copy.fallback[tier];
    if (!row) {
      return {
        tier,
        label: copy.tierLabels[tier],
        availability: 'OPEN' as const,
        waitlistText: copy.waitlist.zero,
        nextIntakeText: fallbackText.nextIntake,
        deliveryText: fallbackText.delivery,
        startMonday: null,
        isAcceptingBookings: true,
        publicNote: null,
      };
    }

    const isClosed = !row.is_accepting_bookings;
    const availability = isClosed ? 'CLOSED' : row.availability;

    const waitlistText =
      row.waitlist_bucket === '0'
        ? copy.waitlist.zero
        : row.waitlist_bucket === '1-2'
          ? copy.waitlist.range
          : copy.waitlist.many;

    let nextIntakeText = fallbackText.nextIntake;
    let deliveryText = fallbackText.delivery;
    let startMonday: Date | null = null;
    if (!isClosed && row.next_start_week) {
      startMonday = parseIsoYearWeek(row.next_start_week);
      if (startMonday) {
        nextIntakeText = `${copy.nextStartPrefix} ${formatShortDate(startMonday)}`;
        const { discovery, build } = TIER_DURATIONS[tier];
        const deliveryMin = new Date(startMonday);
        deliveryMin.setUTCDate(startMonday.getUTCDate() + discovery[0] + build[0]);
        const deliveryMax = new Date(startMonday);
        deliveryMax.setUTCDate(startMonday.getUTCDate() + discovery[1] + build[1]);
        deliveryText = `${formatShortDate(deliveryMin)} — ${formatShortDate(deliveryMax)}`;
      }
    } else if (isClosed) {
      nextIntakeText = row.public_note
        ? `${copy.closedPrefix} ${row.public_note.toUpperCase()}`
        : copy.closedPrefix;
      deliveryText = copy.deliveryUnknown;
    }

    return {
      tier,
      label: copy.tierLabels[tier],
      availability,
      waitlistText,
      nextIntakeText,
      deliveryText,
      startMonday,
      isAcceptingBookings: !isClosed,
      publicNote: row.public_note,
    };
  });
}

/**
 * Canonical snapshot → display-row selection. Single source of truth for
 * both the board and the sticky bar.
 *
 * A snapshot with zero tier rows (a real snapshot whose `data` array is
 * empty) falls back to the dictionary defaults. Any populated snapshot —
 * live, stale-but-populated, or the seeded operator baseline — renders its
 * rows; the `is_stale` flag drives the LIVE/FALLBACK badge at the component
 * layer, not whether real rows are shown.
 */
export function selectDisplayRows(
  snapshot: SpecBoardSnapshot,
  copy: SpecOpsBoardCopy,
): DisplayRow[] {
  if (snapshot.tiers.length === 0) return buildFallbackRows(copy);
  return buildLiveRows(snapshot, copy);
}

/** Earth-tone semantic colour for an availability bucket (no dimming logic). */
export function availabilityTone(availability: DisplayRow['availability']): string {
  switch (availability) {
    case 'OPEN':
      return 'text-ops-olive';
    case 'LIMITED':
      return 'text-ops-tan';
    case 'WAITLIST':
      return 'text-ops-tan';
    case 'CLOSED':
      return 'text-ops-rose';
  }
}

/** Map an availability bucket to its localized status label. */
export function availabilityLabel(
  availability: DisplayRow['availability'],
  copy: SpecOpsBoardCopy,
): string {
  switch (availability) {
    case 'OPEN':
      return copy.status.open;
    case 'LIMITED':
      return copy.status.limited;
    case 'WAITLIST':
      return copy.status.waitlist;
    case 'CLOSED':
      return copy.status.closed;
  }
}
