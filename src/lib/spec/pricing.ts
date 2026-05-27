/**
 * SPEC — milestone pricing helpers.
 *
 * Single source of truth for the 4-milestone (25/25/25/25) payment
 * structure introduced in Phase 1 ([01_BUSINESS_MODEL.md] § 2).
 * Every $ value rendered on /spec or written into the dictionary
 * traces back to this file. Stripe checkout (Stage C.1) consumes
 * the typed helpers + display names.
 *
 * Pure functions. No I/O. Safe to import from RSC, route handlers,
 * client components, and tests.
 */
export const SPEC_TIERS = ['setup', 'build', 'enterprise'] as const;
export type SpecTier = (typeof SPEC_TIERS)[number];

/**
 * Total tier price in CAD cents. Mirrors `public.spec_capacity.total_price_cents`
 * (verified against 02_DATA_MODEL.md § spec_capacity seed).
 */
export const TIER_TOTAL_CENTS: Record<SpecTier, number> = {
  setup: 300_000, //  $3,000
  build: 850_000, //  $8,500
  enterprise: 1_800_000, // $18,000
};

/**
 * Backwards-compatible alias kept for Stage C.2's webhook-handlers.ts (which
 * uses the C.1-era plural name) + any other Stage C.* consumers that imported
 * `SPEC_TIER_TOTALS_CENTS` before the Stage E ↔ Stage C.1 consolidation union
 * collapsed both names into `TIER_TOTAL_CENTS`. Same data, same shape — deprecate
 * by switching call sites to TIER_TOTAL_CENTS in a future polish pass.
 */
export const SPEC_TIER_TOTALS_CENTS = TIER_TOTAL_CENTS;

/**
 * Display names used in Stripe line_item descriptions + customer-facing
 * surfaces that need the tier presented in long-form. Consumed by
 * Stage C.1's create-checkout-session route.
 */
export const SPEC_TIER_DISPLAY_NAMES: Record<SpecTier, string> = {
  setup: 'OPS SPEC — Setup',
  build: 'OPS SPEC — Build',
  enterprise: 'OPS SPEC — Enterprise',
};

/**
 * Subscription multiplier estimate published on /spec for each tier.
 * Mirrors `spec_capacity.subscription_multiplier_estimate`. The actual
 * locked multiplier is determined during discovery and written into the
 * scope doc at P2 sign-off.
 */
export const TIER_SUBSCRIPTION_MULTIPLIER: Record<SpecTier, number> = {
  setup: 0.15,
  build: 0.3,
  enterprise: 0.5,
};

/**
 * Monthly retainer in CAD cents, billed after the support window ends.
 * Mirrors `spec_capacity.retainer_monthly_cents`. Opt-in only.
 */
export const TIER_RETAINER_MONTHLY_CENTS: Record<SpecTier, number> = {
  setup: 25_000, //  $250
  build: 45_000, //  $450
  enterprise: 75_000, //  $750
};

export interface MilestoneBreakdown {
  /** Tier total, in cents. */
  totalCents: number;
  /** Per-milestone amount, in cents (25% of total). */
  milestoneCents: number;
  /** P1 — deposit, paid at click-to-book to lock the slot. */
  p1Cents: number;
  /** P2 — scope sign-off. Stripe invoice, net-15. */
  p2Cents: number;
  /** P3 — midpoint demo accepted. Stripe invoice, net-15. */
  p3Cents: number;
  /** P4 — delivery walkthrough complete. Stripe invoice, net-15. */
  p4Cents: number;
}

/**
 * Compute the 4-milestone breakdown for a tier total (CAD cents).
 *
 * The 25/25/25/25 split is locked in 01_BUSINESS_MODEL.md § 2.
 * Rounding: every supported tier total is divisible by 4 with no
 * remainder ($3,000 → $750 × 4; $8,500 → $2,125 × 4; $18,000 → $4,500
 * × 4). If a future tier breaks that invariant, the helper splits the
 * residual cents onto the final milestone (delivery) so the sum of
 * milestones always equals the total.
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
 * Per-tier milestone summary used by PackageCard, JSON-LD generation,
 * and the Stripe checkout (Stage C). Exposed here so every surface
 * reads the same numbers.
 */
export function getTierMilestones(tier: SpecTier): MilestoneBreakdown {
  return computeMilestones(TIER_TOTAL_CENTS[tier]);
}

/**
 * Convenience wrappers used by Stage C.1's create-checkout-session route.
 * Implemented in terms of getTierMilestones so the math stays in one place.
 */
export function tierTotalCents(tier: SpecTier): number {
  return TIER_TOTAL_CENTS[tier];
}

export function tierDepositCents(tier: SpecTier): number {
  return getTierMilestones(tier).p1Cents;
}

export function tierMilestoneCents(tier: SpecTier): number {
  return getTierMilestones(tier).milestoneCents;
}

/**
 * Type guard used by API routes that accept a tier from the wire and
 * need to narrow `unknown` → `SpecTier` before passing to typed helpers.
 */
export function isValidTier(value: unknown): value is SpecTier {
  return value === 'setup' || value === 'build' || value === 'enterprise';
}

const CAD_FORMATTER = new Intl.NumberFormat('en-CA', {
  style: 'currency',
  currency: 'CAD',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

/**
 * Format a CAD cents value as "$3,000" (no decimal places — clean
 * tier pricing). Per OPS voice (DESIGN.md § 2): numbers always
 * formatted, never raw.
 */
export function formatCad(cents: number): string {
  return CAD_FORMATTER.format(Math.round(cents / 100));
}

/**
 * Backwards-compatible alias of formatCad, kept for the Stage C.1 +
 * C.3 routes that import `formatTierCents` (the name from C.1's
 * original pricing.ts before the Stage E/Stage C.1 consolidation
 * union). Identical output to formatCad for all integer-cents inputs;
 * deprecate by switching call sites to formatCad in a future polish
 * pass. Source: ops-site/src/app/spec/{awaiting-approval, billing-address,
 * owner-approval/[approval_token]}/page.tsx.
 */
export const formatTierCents = formatCad;
