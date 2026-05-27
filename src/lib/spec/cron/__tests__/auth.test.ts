import { strict as assert } from 'node:assert';
import { test } from 'node:test';

import { verifyCronAuth } from '../auth';

test('verifyCronAuth: missing CRON_SECRET → 500', () => {
  const original = process.env.CRON_SECRET;
  delete process.env.CRON_SECRET;
  try {
    const result = verifyCronAuth(new Request('https://example.com/api/cron/spec-nudges'));
    assert.equal(result.ok, false);
    if (result.ok === false) {
      assert.equal(result.status, 500);
    }
  } finally {
    if (original !== undefined) process.env.CRON_SECRET = original;
  }
});

test('verifyCronAuth: missing Authorization header → 401', () => {
  process.env.CRON_SECRET = 'top-secret';
  const result = verifyCronAuth(new Request('https://example.com/api/cron/spec-nudges'));
  assert.equal(result.ok, false);
  if (result.ok === false) {
    assert.equal(result.status, 401);
  }
});

test('verifyCronAuth: wrong bearer → 401', () => {
  process.env.CRON_SECRET = 'top-secret';
  const result = verifyCronAuth(
    new Request('https://example.com/api/cron/spec-nudges', {
      headers: { authorization: 'Bearer wrong' },
    }),
  );
  assert.equal(result.ok, false);
  if (result.ok === false) {
    assert.equal(result.status, 401);
  }
});

test('verifyCronAuth: correct bearer → ok', () => {
  process.env.CRON_SECRET = 'top-secret';
  const result = verifyCronAuth(
    new Request('https://example.com/api/cron/spec-nudges', {
      headers: { authorization: 'Bearer top-secret' },
    }),
  );
  assert.equal(result.ok, true);
});
