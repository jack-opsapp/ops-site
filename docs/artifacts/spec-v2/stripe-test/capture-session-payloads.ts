/**
 * E1 — Stripe checkout payload proof for the two new v2 payment shapes.
 *
 * No test-mode Stripe key exists on this machine (the only local key is
 * live-mode, and E1 forbids live charges / dashboard changes), so this
 * proof captures the EXACT payloads the production code path submits to
 * `stripe.checkout.sessions.create` by patching the SDK singleton at the
 * API boundary — everything up to Stripe's front door is the real code
 * (`createSpecStripeCheckoutSession` in src/lib/spec/stripe-session.ts, the same
 * function /api/spec/create-checkout-session calls after its gates).
 *
 * The remaining step — Stripe ACCEPTING these params in test mode — is a
 * deposit-flip gate in 07_ROLLOUT § Phase 0 and needs a test key from the
 * Stripe dashboard (Jackson).
 *
 * Run: npx tsx docs/artifacts/spec-v2/stripe-test/capture-session-payloads.ts
 */
import { strict as assert } from 'node:assert';
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

import { getStripe } from '../../../../src/lib/shop/stripe';
import { createSpecStripeCheckoutSession } from '../../../../src/lib/spec/stripe-session';
import { SPEC_TERMS_VERSION_HASH } from '../../../../src/lib/spec/tos-version';

process.env.STRIPE_SECRET_KEY = 'sk_test_payload_capture_only';
process.env.NEXT_PUBLIC_OPS_SITE_URL = 'https://opsapp.co';

const stripe = getStripe();
const captured: Array<{ tier: string; params: Record<string, unknown> }> = [];
let pending: string = 'unset';

// Patch the SDK singleton at the API boundary — capture, don't transmit.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(stripe.customers as any).create = async () => ({ id: 'cus_capture_dummy' });
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(stripe.checkout.sessions as any).create = async (params: Record<string, unknown>) => {
  captured.push({ tier: pending, params });
  return { id: `cs_test_capture_${captured.length}`, url: 'https://checkout.stripe.com/c/pay/captured' };
};

async function capture(tier: 'spec01' | 'spec03') {
  pending = tier;
  await createSpecStripeCheckoutSession({
    tier,
    buyerEmail: 'e1-proof@opsapp.co',
    buyerUserId: '00000000-0000-0000-0000-0000000000e1',
    companyId: '00000000-0000-0000-0000-0000000000c0',
    companyName: 'E1 Proof Co',
    specProjectId: '00000000-0000-0000-0000-0000000000a1',
    existingStripeCustomerId: 'cus_capture_dummy',
    billing: {
      line1: '303-1121 Oscar Street',
      line2: null,
      city: 'Victoria',
      province: 'BC',
      postal_code: 'V8V2X3',
      country: 'CA',
    },
    attribution: {},
    origin: 'https://opsapp.co',
  });
}

async function main() {
await capture('spec01');
await capture('spec03');

// ── E1 assertions ───────────────────────────────────────────────────────────
type AnyRec = Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any

function checkCommon(p: AnyRec, tier: string, depositCents: number, nameIncludes: string) {
  assert.equal(p.mode, 'payment', `${tier}: mode`);
  assert.equal(p.automatic_tax?.enabled, true, `${tier}: automatic_tax`);
  assert.equal(p.consent_collection?.terms_of_service, 'required', `${tier}: ToS consent`);
  assert.equal(p.billing_address_collection, 'required', `${tier}: billing address`);
  assert.equal(p.phone_number_collection?.enabled, true, `${tier}: phone`);
  assert.equal(p.line_items.length, 1, `${tier}: one line item`);
  const li = p.line_items[0];
  assert.equal(li.price_data.currency, 'cad', `${tier}: CAD`);
  assert.equal(li.price_data.unit_amount, depositCents, `${tier}: deposit cents`);
  assert.equal(li.price_data.tax_behavior, 'exclusive', `${tier}: tax behavior`);
  assert.ok(li.price_data.product_data.name.includes(nameIncludes), `${tier}: line name`);
  assert.equal(p.metadata.type, 'spec_deposit', `${tier}: metadata.type`);
  assert.equal(p.metadata.tier, tier, `${tier}: metadata.tier v2 slug`);
  assert.equal(p.metadata.tos_version_hash, SPEC_TERMS_VERSION_HASH, `${tier}: v2 ToS hash pinned`);
  assert.deepEqual(p.payment_intent_data.metadata, p.metadata, `${tier}: PI metadata mirrors`);
  assert.ok(String(p.success_url).includes('/spec/confirmation'), `${tier}: success url`);
}

const [s1, s3] = captured;
checkCommon(s1.params as AnyRec, 'spec01', 100_000, 'OPS SPEC-01 — WORKFLOWS — 50% Deposit');
checkCommon(s3.params as AnyRec, 'spec03', 625_000, 'OPS SPEC-03 — PROPRIETARY — Deposit');
assert.ok(
  (s3.params as AnyRec).line_items[0].price_data.product_data.description.includes('$25,000 floor'),
  'spec03: floor language in line description',
);
assert.ok(
  (s1.params as AnyRec).line_items[0].price_data.product_data.description.includes('delivery walkthrough'),
  'spec01: 50/50 balance language in line description',
);

const here = dirname(fileURLToPath(import.meta.url));
writeFileSync(
  join(here, 'session-payloads.json'),
  JSON.stringify(
    {
      generatedAt: new Date().toISOString(),
      tosVersionHash: SPEC_TERMS_VERSION_HASH,
      note: 'Payloads captured at the stripe.checkout.sessions.create boundary from the production code path. Live test-mode acceptance is a deposit-flip gate (07_ROLLOUT § Phase 0) pending a test key.',
      sessions: captured,
    },
    null,
    2,
  ) + '\n',
);

console.log('E1 PAYLOAD PROOF PASS —', captured.length, 'sessions captured');
console.log('spec01 deposit:', (s1.params as AnyRec).line_items[0].price_data.unit_amount);
console.log('spec03 deposit:', (s3.params as AnyRec).line_items[0].price_data.unit_amount);
console.log('tos hash:', SPEC_TERMS_VERSION_HASH.slice(0, 16) + '…');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
