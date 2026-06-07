import { strict as assert } from 'node:assert';
import { test } from 'node:test';

import {
  buildMarketingProperties,
  buildSpecMarketingProperties,
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
