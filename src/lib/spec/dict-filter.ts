/**
 * Phase-0 dictionary filter.
 *
 * While SPEC_LIVE_DEPOSITS_ENABLED is false, the /spec RSC payload must not
 * carry deposit-claim copy ("Pay $1,000 Deposit") that the visible UI isn't
 * selling — crawlers + AI agents read the payload, not the pixels.
 *
 * Scope is deliberately narrow (10_TIER_MODEL_V2 § 8.10): ONLY per-package
 * deposit claims (`packages.<tier>.ctaText` / `packages.<tier>.deposit`) and
 * the post-payment confirmation flow (`confirmation.*`). A suffix-global
 * `.ctaText` match is the historical bug — it blanked `bottomCta.ctaText`
 * in production. Never widen this pattern without a surviving-keys test.
 */

const DEPOSIT_KEY_RE = /^(packages\.[a-z0-9]+\.(ctaText|deposit)$)|^confirmation\./;

/** Strip package deposit claims + the confirmation flow from a spec dictionary. */
export function filterDepositClaims<T>(dict: Record<string, T>): Record<string, T> {
  return Object.fromEntries(
    Object.entries(dict).filter(([key]) => !DEPOSIT_KEY_RE.test(key)),
  );
}
