/**
 * SPEC confirmation — per-tier payment-schedule presentation (Tier Model v2).
 *
 * Derives everything /spec/confirmation renders about money and checkpoints
 * from the canonical pricing source (`./pricing`), so the page can never
 * drift from the tier model again. Authority: 10_TIER_MODEL_V2.md § 2/§ 5/§ 6.
 *
 * Per-tier shapes on the rail:
 *  - spec01 (half_half)      — 3 stops. Deposit and delivery carry the two
 *    50% payments; scope sign-off stays on the rail as the evidence event it
 *    is (10 § 6: the schedule changes when money moves, not the evidence
 *    chain) but carries no invoice. There is no midpoint stop.
 *  - spec02 (quarters)       — 4 stops, $1,875 at each checkpoint.
 *  - spec03 (floor_quarters) — 4 stops. P1 fixed against the floor; P2-P4
 *    amounts are unknowable until the total locks at scope sign-off
 *    (`spec_projects.locked_total_cents`), so they render the design-system
 *    empty state `—` until then, exact thirds after.
 *
 * Stop keys stay the bible's checkpoint keys (p1/p2/p4 for spec01 — p3 does
 * not exist in its journey). Customers never see the raw keys: spec02/03
 * display P1-P4 (the rhythm Stripe checkout sold them — "P1 of 4"), spec01
 * displays plain 01/02/03 ordinals because its checkout copy never used
 * P-language and a rail reading P1/P2/P4 looks like a mistake.
 *
 * Pure functions. No I/O. Safe to import from RSC, client components, tests.
 */

import {
  TIER_TOTAL_CENTS,
  TIER_MILESTONE_SHAPE,
  computeTierCheckpoints,
  formatCad,
  isValidTier,
  type CheckpointKey,
  type SpecTier,
} from './pricing';

export type MilestoneStatus = 'complete' | 'current' | 'upcoming';

/** Whether a stop moves money or only evidence (spec01 scope sign-off). */
export type StopKind = 'payment' | 'evidence';

export interface ScheduleStop {
  /** Bible checkpoint key — stable identity, never shown to the customer. */
  key: CheckpointKey;
  /** Customer-facing marker line ordinal ("P2" / "02"). */
  ordinalLabel: string;
  label: string;
  detail: string;
  /**
   * Formatted amount. `null` = no amount concept exists at this stop
   * (evidence-only); `—` = a payment lands here but its size is not yet
   * known (spec03 before the total locks).
   */
  amountLabel: string | null;
  kind: StopKind;
  status: MilestoneStatus;
}

/** The slice of the spec_projects row the schedule derivation reads. */
export interface ScheduleProjectState {
  scope_doc_signed_at: string | null;
  midpoint_accepted_at: string | null;
  walkthrough_completed_at: string | null;
  locked_total_cents?: number | null;
}

/** Status chip text — completed evidence stops read SIGNED, never PAID. */
export function stopStatusLabel(stop: Pick<ScheduleStop, 'kind' | 'status'>): string {
  if (stop.status === 'complete') {
    return stop.kind === 'evidence' ? 'SIGNED' : 'PAID';
  }
  return stop.status === 'current' ? 'CURRENT' : 'UPCOMING';
}

/**
 * spec03's total is only real once locked at scope sign-off; guard against
 * absent or malformed rows (computeTierCheckpoints throws below the floor).
 */
function usableLockedTotal(
  tier: SpecTier,
  project: ScheduleProjectState | null
): number | undefined {
  if (TIER_MILESTONE_SHAPE[tier] !== 'floor_quarters') return undefined;
  const locked = project?.locked_total_cents;
  if (
    typeof locked === 'number' &&
    Number.isInteger(locked) &&
    locked >= TIER_TOTAL_CENTS[tier]
  ) {
    return locked;
  }
  return undefined;
}

interface StopTemplate {
  key: CheckpointKey;
  label: string;
  detail: string;
  kind: StopKind;
}

/** Per-stop copy. Labels/details mirror the Stripe deposit-line copy. */
function stopTemplates(tier: SpecTier, totalLocked: boolean): StopTemplate[] {
  switch (TIER_MILESTONE_SHAPE[tier]) {
    case 'half_half':
      return [
        {
          key: 'p1',
          label: 'Deposit',
          detail: 'Books your slot and funds discovery.',
          kind: 'payment',
        },
        {
          key: 'p2',
          label: 'Scope sign-off',
          detail: 'Work order signed before build starts. No invoice here.',
          kind: 'evidence',
        },
        {
          key: 'p4',
          label: 'Delivery walkthrough',
          detail: 'Invoiced net-15. Starts your 30-day Guarantee.',
          kind: 'payment',
        },
      ];
    case 'quarters':
      return [
        { key: 'p1', label: 'Deposit', detail: 'Funds discovery.', kind: 'payment' },
        {
          key: 'p2',
          label: 'Scope sign-off',
          detail: 'Funds build kickoff.',
          kind: 'payment',
        },
        {
          key: 'p3',
          label: 'Midpoint demo',
          detail: 'Bills when work clears review.',
          kind: 'payment',
        },
        {
          key: 'p4',
          label: 'Delivery walkthrough',
          detail: 'Starts your 30-day Guarantee.',
          kind: 'payment',
        },
      ];
    case 'floor_quarters':
      return [
        {
          key: 'p1',
          label: 'Deposit',
          detail: 'Fixed against the floor. Funds discovery.',
          kind: 'payment',
        },
        {
          key: 'p2',
          label: 'Scope sign-off',
          detail: totalLocked ? 'Funds build kickoff.' : 'Your total locks here.',
          kind: 'payment',
        },
        {
          key: 'p3',
          label: 'Midpoint demo',
          detail: 'Bills when work clears review.',
          kind: 'payment',
        },
        {
          key: 'p4',
          label: 'Delivery walkthrough',
          detail: 'Starts your 30-day Guarantee.',
          kind: 'payment',
        },
      ];
  }
}

/**
 * Journey completion per checkpoint key. p1 is always complete — the
 * schedule only renders on a paid session. Completion is monotone: a later
 * timestamp implies every earlier stop was passed, even if an earlier
 * timestamp is missing on the row.
 */
function completedIndex(stops: StopTemplate[], project: ScheduleProjectState | null): number {
  const done: Record<CheckpointKey, boolean> = {
    p1: true,
    p2: Boolean(project?.scope_doc_signed_at),
    p3: Boolean(project?.midpoint_accepted_at),
    p4: Boolean(project?.walkthrough_completed_at),
  };
  let last = 0;
  stops.forEach((stop, i) => {
    if (done[stop.key]) last = i;
  });
  return last;
}

/**
 * Build the confirmation rail for a tier + engagement state. An unknown tier
 * (malformed metadata) degrades to the generic 4-checkpoint rail with no
 * amounts — never a crash, never invented numbers.
 */
export function buildConfirmationSchedule(args: {
  tier: string | null;
  project: ScheduleProjectState | null;
}): ScheduleStop[] {
  const { project } = args;

  if (!isValidTier(args.tier)) {
    const generic = stopTemplates('spec02', false);
    const doneIdx = completedIndex(generic, project);
    return generic.map((stop, i) => ({
      ...stop,
      ordinalLabel: stop.key.toUpperCase(),
      amountLabel: null,
      status: statusFor(i, doneIdx, generic.length),
    }));
  }

  const tier = args.tier;
  const lockedTotal = usableLockedTotal(tier, project);
  const templates = stopTemplates(tier, lockedTotal !== undefined);
  const checkpoints = computeTierCheckpoints(tier, lockedTotal);
  const centsByKey = new Map(checkpoints.map((c) => [c.key, c.cents]));
  const floorQuartersUnlocked =
    TIER_MILESTONE_SHAPE[tier] === 'floor_quarters' && lockedTotal === undefined;
  const doneIdx = completedIndex(templates, project);

  return templates.map((stop, i) => {
    let amountLabel: string | null = null;
    if (stop.kind === 'payment') {
      // Before the spec03 total locks, only the deposit is a real number.
      amountLabel =
        floorQuartersUnlocked && stop.key !== 'p1'
          ? '—'
          : formatCad(centsByKey.get(stop.key) ?? 0);
    }
    return {
      ...stop,
      ordinalLabel:
        TIER_MILESTONE_SHAPE[tier] === 'half_half'
          ? String(i + 1).padStart(2, '0')
          : stop.key.toUpperCase(),
      amountLabel,
      status: statusFor(i, doneIdx, templates.length),
    };
  });
}

function statusFor(index: number, doneIdx: number, total: number): MilestoneStatus {
  if (index <= doneIdx) return 'complete';
  if (index === doneIdx + 1 && index < total) return 'current';
  return 'upcoming';
}

export interface TotalDisplay {
  /** Formatted total without currency code — the cell appends it. */
  value: string;
  /** Bracketed micro-hint under the value; null hides the hint line. */
  hint: string | null;
}

/**
 * The session card's TOTAL cell. spec01/02 totals are fixed constants;
 * spec03 shows the honest floor ("from $25,000") until the engagement row
 * carries a locked total. `fullPriceCents` (Stripe `metadata.full_price`) is
 * honored as a fallback signal for spec03 if a future builder sets it.
 */
export function confirmationTotalDisplay(args: {
  tier: string | null;
  project: ScheduleProjectState | null;
  fullPriceCents: number | null;
}): TotalDisplay {
  if (!isValidTier(args.tier)) {
    return { value: '—', hint: null };
  }
  const tier = args.tier;

  switch (TIER_MILESTONE_SHAPE[tier]) {
    case 'half_half':
      return {
        value: formatCad(TIER_TOTAL_CENTS[tier]),
        hint: '50/50 · second half at delivery',
      };
    case 'quarters':
      return {
        value: formatCad(TIER_TOTAL_CENTS[tier]),
        hint: 'across 4 checkpoints',
      };
    case 'floor_quarters': {
      const locked =
        usableLockedTotal(tier, args.project) ??
        (typeof args.fullPriceCents === 'number' &&
        Number.isInteger(args.fullPriceCents) &&
        args.fullPriceCents >= TIER_TOTAL_CENTS[tier]
          ? args.fullPriceCents
          : undefined);
      if (locked !== undefined) {
        return { value: formatCad(locked), hint: 'locked at scope sign-off' };
      }
      return {
        value: `from ${formatCad(TIER_TOTAL_CENTS[tier])}`,
        hint: 'locks at scope sign-off',
      };
    }
  }
}
