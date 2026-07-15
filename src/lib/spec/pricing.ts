/**
 * SPEC — tier pricing + per-tier checkpoint shapes (Tier Model v2).
 *
 * Single source of truth for the SPEC-01/02/03 payment structures
 * ([10_TIER_MODEL_V2.md] § 2/§ 6). Every $ value rendered on /spec or
 * written into the dictionary traces back to this file. Stripe checkout
 * consumes the typed helpers + display names.
 *
 * v2 shapes:
 *  - SPEC-01 · WORKFLOWS   — $2,000 fixed, 50/50 (P1 books the slot, P4 at delivery).
 *  - SPEC-02 · SYSTEMS     — $7,500 fixed, quarters (P1-P4 × $1,875).
 *  - SPEC-03 · PROPRIETARY — from $25,000 (floor); P1 fixed at $6,250 against the
 *    floor; total locked at scope sign-off; P2-P4 split the locked remainder.
 *
 * Pure functions. No I/O. Safe to import from RSC, route handlers,
 * client components, and tests.
 */
export const SPEC_TIERS = ['spec01', 'spec02', 'spec03'] as const;
export type SpecTier = (typeof SPEC_TIERS)[number];

/**
 * Per-tier checkpoint shape (10_TIER_MODEL_V2 § 2):
 *  - half_half      — two payments: P1 (50%) + P4 (50%). Scope sign-off (P2)
 *    stays an evidence event but carries no invoice; there is no P3.
 *  - quarters       — four equal payments, residual cents on P4.
 *  - floor_quarters — P1 fixed at 25% of the published FLOOR; the remaining
 *    three checkpoints split (lockedTotal ?? floor) − P1, residual on P4.
 */
export type MilestoneShape = 'half_half' | 'quarters' | 'floor_quarters';

export const TIER_MILESTONE_SHAPE: Record<SpecTier, MilestoneShape> = {
  spec01: 'half_half',
  spec02: 'quarters',
  spec03: 'floor_quarters',
};

/**
 * Total tier price in CAD cents. Mirrors `public.spec_capacity.total_price_cents`
 * (re-seeded 2026-07-14, migrations/20260715035835_spec_tier_model_v2_reseed.sql).
 * For spec03 this is the FLOOR — the real total is locked at scope sign-off
 * and lives on the engagement row (`spec_projects.locked_total_cents`).
 */
export const TIER_TOTAL_CENTS: Record<SpecTier, number> = {
  spec01: 200_000, //  $2,000
  spec02: 750_000, //  $7,500
  spec03: 2_500_000, // $25,000 floor
};

/**
 * Backwards-compatible alias kept for Stage C.2's webhook-handlers.ts (which
 * uses the C.1-era plural name). Same data, same shape — deprecate by
 * switching call sites to TIER_TOTAL_CENTS in a future polish pass.
 */
export const SPEC_TIER_TOTALS_CENTS = TIER_TOTAL_CENTS;

/**
 * Display names used in Stripe line_item descriptions + customer-facing
 * surfaces that need the tier presented in long-form (10_TIER_MODEL_V2 § 2).
 */
export const SPEC_TIER_DISPLAY_NAMES: Record<SpecTier, string> = {
  spec01: 'OPS SPEC-01 — WORKFLOWS',
  spec02: 'OPS SPEC-02 — SYSTEMS',
  spec03: 'OPS SPEC-03 — PROPRIETARY',
};

/**
 * Care plan monthly price in CAD cents (10_TIER_MODEL_V2 § 2). Mirrors
 * `spec_capacity.retainer_monthly_cents` (0 in the DB ⇔ null here).
 * null = no care plan (SPEC-01). spec03 is the BASE — the white-label
 * add-on bumps it by WHITE_LABEL_CARE_BUMP_CENTS.
 * Billing starts when the support window ends.
 */
export const TIER_CARE_MONTHLY_CENTS: Record<SpecTier, number | null> = {
  spec01: null,
  spec02: 39_500, // $395/mo
  spec03: 75_000, // from $750/mo
};

/**
 * Change-hours included in each care plan per month (10_TIER_MODEL_V2 § 2).
 * Overage is CARE_OVERAGE_HOURLY_CENTS, always quoted before work starts.
 */
export const TIER_CARE_CHANGE_HOURS: Record<SpecTier, number | null> = {
  spec01: null,
  spec02: 2,
  spec03: 3,
};

/** White-label add-on, SPEC-03 only (10_TIER_MODEL_V2 § 3): one-time at build. */
export const WHITE_LABEL_ONE_TIME_CENTS = 400_000; // $4,000

/** White-label add-on: monthly bump applied on top of the spec03 care base. */
export const WHITE_LABEL_CARE_BUMP_CENTS = 20_000; // $200/mo

/** Care plan change-hour overage, per hour, quoted first (10_TIER_MODEL_V2 § 2). */
export const CARE_OVERAGE_HOURLY_CENTS = 20_000; // $200/hr

/** Support window per tier, in days. Mirrors `spec_capacity.support_window_days`. */
export const TIER_SUPPORT_WINDOW_DAYS: Record<SpecTier, number> = {
  spec01: 30,
  spec02: 60,
  spec03: 90,
};

export type CheckpointKey = 'p1' | 'p2' | 'p3' | 'p4';

export interface TierCheckpoint {
  /** Which engagement checkpoint the payment attaches to. */
  key: CheckpointKey;
  /** Payment amount at this checkpoint, CAD cents. */
  cents: number;
}

/**
 * Compute the per-tier payment checkpoints (10_TIER_MODEL_V2 § 2).
 *
 *  - spec01 (half_half): [p1 50%, p4 50%] — p2/p3 carry no payment.
 *  - spec02 (quarters): [p1..p4] equal, residual cents on p4.
 *  - spec03 (floor_quarters): p1 = 25% of the FLOOR, fixed at booking.
 *    P2-P4 split (lockedTotalCents ?? floor) − p1 evenly, residual on p4.
 *    Pass `lockedTotalCents` once the total is locked at scope sign-off.
 *
 * `lockedTotalCents` is only meaningful for the floor_quarters shape;
 * passing it for a fixed-total tier is a programming error and throws.
 */
export function computeTierCheckpoints(
  tier: SpecTier,
  lockedTotalCents?: number,
): TierCheckpoint[] {
  const floor = TIER_TOTAL_CENTS[tier];
  const shape = TIER_MILESTONE_SHAPE[tier];

  if (lockedTotalCents !== undefined && shape !== 'floor_quarters') {
    throw new Error(
      `computeTierCheckpoints: lockedTotalCents only applies to the floor_quarters shape, got ${tier}`,
    );
  }

  switch (shape) {
    case 'half_half': {
      const p1 = Math.floor(floor / 2);
      return [
        { key: 'p1', cents: p1 },
        { key: 'p4', cents: floor - p1 },
      ];
    }
    case 'quarters': {
      const q = Math.floor(floor / 4);
      return [
        { key: 'p1', cents: q },
        { key: 'p2', cents: q },
        { key: 'p3', cents: q },
        { key: 'p4', cents: floor - 3 * q },
      ];
    }
    case 'floor_quarters': {
      const p1 = Math.floor(floor / 4);
      if (lockedTotalCents !== undefined) {
        if (!Number.isInteger(lockedTotalCents) || lockedTotalCents < floor) {
          throw new Error(
            `computeTierCheckpoints: lockedTotalCents must be an integer ≥ the ${floor} floor, got ${lockedTotalCents}`,
          );
        }
      }
      const total = lockedTotalCents ?? floor;
      const remainder = total - p1;
      const part = Math.floor(remainder / 3);
      return [
        { key: 'p1', cents: p1 },
        { key: 'p2', cents: part },
        { key: 'p3', cents: part },
        { key: 'p4', cents: remainder - 2 * part },
      ];
    }
  }
}

/**
 * Legacy 4-milestone breakdown shape kept for back-compat with Stage C-era
 * consumers. p2/p3 are 0 for the half_half shape. `milestoneCents` is the
 * per-checkpoint amount for equal-split shapes and the deposit otherwise —
 * prefer computeTierCheckpoints() everywhere new.
 */
export interface MilestoneBreakdown {
  totalCents: number;
  milestoneCents: number;
  p1Cents: number;
  p2Cents: number;
  p3Cents: number;
  p4Cents: number;
}

/**
 * Back-compat wrapper over computeTierCheckpoints, keyed by tier.
 */
export function getTierMilestones(tier: SpecTier, lockedTotalCents?: number): MilestoneBreakdown {
  const checkpoints = computeTierCheckpoints(tier, lockedTotalCents);
  const byKey: Record<CheckpointKey, number> = { p1: 0, p2: 0, p3: 0, p4: 0 };
  for (const c of checkpoints) byKey[c.key] = c.cents;
  const totalCents = checkpoints.reduce((s, c) => s + c.cents, 0);
  return {
    totalCents,
    milestoneCents: TIER_MILESTONE_SHAPE[tier] === 'quarters' ? byKey.p2 : byKey.p1,
    p1Cents: byKey.p1,
    p2Cents: byKey.p2,
    p3Cents: byKey.p3,
    p4Cents: byKey.p4,
  };
}

/**
 * Legacy pure 25/25/25/25 split over an arbitrary total. Retained for
 * back-compat; v2 tier math must go through computeTierCheckpoints so the
 * per-tier shape applies.
 */
export function computeMilestones(totalCents: number): MilestoneBreakdown {
  if (!Number.isFinite(totalCents) || totalCents <= 0) {
    throw new Error(`computeMilestones: totalCents must be a positive number, got ${totalCents}`);
  }
  const milestoneCents = Math.floor(totalCents / 4);
  const residual = totalCents - milestoneCents * 4;
  return {
    totalCents,
    milestoneCents,
    p1Cents: milestoneCents,
    p2Cents: milestoneCents,
    p3Cents: milestoneCents,
    p4Cents: milestoneCents + residual,
  };
}

/**
 * Convenience wrappers used by the checkout/session routes.
 * Implemented in terms of computeTierCheckpoints so the math stays in one place.
 */
export function tierTotalCents(tier: SpecTier): number {
  return TIER_TOTAL_CENTS[tier];
}

export function tierDepositCents(tier: SpecTier): number {
  return computeTierCheckpoints(tier)[0].cents;
}

/**
 * Type guard used by API routes that accept a tier from the wire and
 * need to narrow `unknown` → `SpecTier` before passing to typed helpers.
 * v1 slugs (setup/build/enterprise) are invalid everywhere in v2.
 */
export function isValidTier(value: unknown): value is SpecTier {
  return value === 'spec01' || value === 'spec02' || value === 'spec03';
}

const CAD_FORMATTER = new Intl.NumberFormat('en-CA', {
  style: 'currency',
  currency: 'CAD',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

/**
 * Format a CAD cents value as "$2,000" (no decimal places — clean
 * tier pricing). Per OPS voice (DESIGN.md § 2): numbers always
 * formatted, never raw.
 */
export function formatCad(cents: number): string {
  return CAD_FORMATTER.format(Math.round(cents / 100));
}

/**
 * Backwards-compatible alias of formatCad, kept for the Stage C.1 +
 * C.3 routes that import `formatTierCents`. Identical output to
 * formatCad for all integer-cents inputs.
 */
export const formatTierCents = formatCad;
