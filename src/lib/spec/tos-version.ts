/**
 * SPEC Terms of Service version hash — build-time pinned.
 *
 * COORDINATION NOTE (Stage C.1 / P1-2-6):
 *  - Stage G port (P1-2-5) owns this file in its final form. Stage G derives
 *    `SPEC_TERMS_VERSION_HASH` from the build-time hash of the registered
 *    spec-terms commit (via `src/lib/legal-content.ts` registration).
 *  - This file currently exports a placeholder `pending-stage-g-port` hash so
 *    `/api/spec/create-checkout-session` (Stage C.1) compiles + runs end-to-end
 *    against test Stripe keys.
 *  - When Stage G merges, this file will be REPLACED by its real implementation.
 *    Do NOT extend or refactor this file in Stage C.1 — it is a placeholder.
 *  - Master gate: `SPEC_LIVE_DEPOSITS_ENABLED=false` (default) ensures no live
 *    deposits fire against the placeholder; Stage G must merge before the flag
 *    flips true.
 *
 * Source: ops-software-bible/SPEC/04_CUSTOMER_UX.md § /legal?page=spec-terms;
 *         ops-software-bible/SPEC/07_ROLLOUT.md § 2 (Legal).
 */

export const SPEC_TERMS_VERSION_HASH = 'pending-stage-g-port';

/**
 * Build the URL with the ToS version hash appended as a URL fragment, per the
 * locked SPEC-STRIPE-ADDRESS-TAX-SPIKE resolution. Stripe Dashboard's ToS URL
 * field captures the base; the fragment lets the webhook pin the version that
 * was actually accepted.
 */
export function specTermsUrl(origin = 'https://opsapp.co'): string {
  return `${origin}/legal?page=spec-terms#v=${SPEC_TERMS_VERSION_HASH}`;
}
