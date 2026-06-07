import { strict as assert } from 'node:assert';
import { test } from 'node:test';

import {
  buildMarketingProperties,
  buildSafeSearchProperties,
  buildSpecMarketingProperties,
  sanitizeMarketingPath,
  sanitizeMarketingUrl,
} from '../marketing-analytics';

test('drops nullish marketing properties and truncates long strings', () => {
  const props = buildMarketingProperties({
    tier: 'build',
    empty: null,
    missing: undefined,
    long: 'x'.repeat(250),
  });

  assert.deepEqual(Object.keys(props).sort(), ['long', 'tier']);
  assert.equal(typeof props.long, 'string');
  assert.equal(String(props.long).length, 180);
});

test('adds SPEC surface to SPEC marketing events', () => {
  assert.deepEqual(buildSpecMarketingProperties({ tier: 'setup' }), {
    surface: 'spec',
    tier: 'setup',
  });
});

test('redacts tokenized SPEC paths before analytics dispatch', () => {
  assert.equal(
    sanitizeMarketingPath('/spec/checkout/buyer-token-123'),
    '/spec/checkout/[token]',
  );
  assert.equal(
    sanitizeMarketingPath('/spec/owner-approval/approval-token-123'),
    '/spec/owner-approval/[token]',
  );
  assert.equal(
    sanitizeMarketingPath('/spec/intake/intake-token-123'),
    '/spec/intake/[token]',
  );
});

test('keeps only safe attribution query properties', () => {
  assert.deepEqual(
    buildSafeSearchProperties('?session_id=cs_live_secret&utm_campaign=spec&gclid=abc123'),
    { utm_campaign: 'spec', has_gclid: true },
  );
});

test('redacts sensitive URL search params and token paths', () => {
  assert.equal(
    sanitizeMarketingUrl('https://opsapp.co/spec/confirmation?session_id=cs_live_secret&utm_source=google'),
    'https://opsapp.co/spec/confirmation?utm_source=google',
  );
  assert.equal(
    sanitizeMarketingUrl('https://opsapp.co/spec/intake/raw-token?fbclid=secret'),
    'https://opsapp.co/spec/intake/[token]?has_fbclid=1',
  );
});
