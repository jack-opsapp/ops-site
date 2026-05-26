/**
 * SPEC milestone pricing — 25 / 25 / 25 / 25 across all tiers (locked).
 *
 * Source: ops-software-bible/SPEC/01_BUSINESS_MODEL.md § 2 Payment terms.
 *
 * P1 deposit is always 25% of the tier total. P2-P4 fire as Stripe Invoices
 * after each acceptance event (scope_signoff / midpoint_accepted / walkthrough).
 *
 * Stage C.1 only uses P1 (the deposit). Later stages (webhook + invoicing)
 * use P2-P4 amounts.
 */

export type SpecTier = 'setup' | 'build' | 'enterprise';

export const SPEC_TIER_TOTALS_CENTS: Record<SpecTier, number> = {
  setup: 300000, //  $3,000
  build: 850000, //  $8,500
  enterprise: 1800000, // $18,000
};

export const SPEC_TIER_DISPLAY_NAMES: Record<SpecTier, string> = {
  setup: 'OPS SPEC — Setup',
  build: 'OPS SPEC — Build',
  enterprise: 'OPS SPEC — Enterprise',
};

export function tierTotalCents(tier: SpecTier): number {
  return SPEC_TIER_TOTALS_CENTS[tier];
}

/**
 * P1 deposit = 25% of tier total. Locked: no rounding edge cases since
 * every tier total is divisible by 4.
 */
export function tierDepositCents(tier: SpecTier): number {
  const total = SPEC_TIER_TOTALS_CENTS[tier];
  if (total % 4 !== 0) {
    throw new Error(`SPEC tier total for ${tier} is not divisible by 4: ${total}`);
  }
  return total / 4;
}

export function tierMilestoneCents(tier: SpecTier): number {
  return tierDepositCents(tier);
}

export function isValidTier(value: unknown): value is SpecTier {
  return value === 'setup' || value === 'build' || value === 'enterprise';
}

export function formatTierCents(cents: number): string {
  return `$${(cents / 100).toLocaleString('en-CA', { maximumFractionDigits: 0 })}`;
}
