/**
 * SPEC — canonical deposit entry path.
 *
 * The marketing CTAs (package cards + the sticky deposit bar) must not POST
 * to /api/spec/create-checkout-session directly: that route requires an
 * authenticated OPS user, a resolved company, a billing address, and the
 * four Quebec attestations. The real pre-Stripe entry is the
 * /spec/billing-address page, which collects all of that and then POSTs to
 * the route on submit (Path A → Stripe, Path B → owner approval).
 *
 * Both marketing CTAs route here so they behave identically and stay correct
 * when SPEC_LIVE_DEPOSITS_ENABLED flips on. Pure — safe to import anywhere.
 */

import type { SpecTier } from './pricing';

export function specBillingAddressPath(tier: SpecTier): string {
  return `/spec/billing-address?tier=${encodeURIComponent(tier)}`;
}
