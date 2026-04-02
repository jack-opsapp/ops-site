/**
 * Stripe server-side helpers.
 * Only used in API routes (server-side).
 */

import Stripe from 'stripe';

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) throw new Error('Missing STRIPE_SECRET_KEY environment variable.');
    _stripe = new Stripe(key);
  }
  return _stripe;
}

/** Format cents for display: 6500 → "$65.00" */
export function formatCents(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}
