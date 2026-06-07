import { strict as assert } from 'node:assert';
import { test } from 'node:test';

import { SPEC_CONVERSION_EVENTS } from '../conversion-events';

test('exports the canonical SPEC paid launch conversion event registry', () => {
  assert.deepEqual(SPEC_CONVERSION_EVENTS, [
    'page_view',
    'spec_card_expand',
    'pay_deposit_click',
    'billing_address_submitted',
    'quebec_rejected',
    'owner_approval_requested',
    'owner_approval_granted',
    'stripe_checkout_opened',
    'stripe_checkout_completed',
    'intake_started',
    'intake_submitted',
    'discovery_booked',
    'spec_default_ops_cta_click',
    'spec_default_ops_signup_started',
    'spec_default_ops_signup_completed',
    'spec_default_ops_trial_activated',
    'refund_invoked',
  ]);
});
