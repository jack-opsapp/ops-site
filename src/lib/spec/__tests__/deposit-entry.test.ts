import assert from 'node:assert/strict';
import { test } from 'node:test';

import { specBillingAddressPath } from '../deposit-entry';

// Locks the marketing-CTA entry to the actual /spec/billing-address route
// (app/spec/billing-address/page.tsx reads ?tier=). If the route moves, this
// fails loudly rather than silently dead-ending the deposit flow.
test('specBillingAddressPath targets the billing-address entry per tier', () => {
  assert.equal(specBillingAddressPath('setup'), '/spec/billing-address?tier=setup');
  assert.equal(specBillingAddressPath('build'), '/spec/billing-address?tier=build');
  assert.equal(specBillingAddressPath('enterprise'), '/spec/billing-address?tier=enterprise');
});
