import { strict as assert } from 'node:assert';
import { test } from 'node:test';

import {
  hashEmail,
  hashPhone,
  normalizeEmail,
  normalizePhone,
  sha256Hex,
} from '../conversion-hash';

test('normalizes email before hashing', () => {
  assert.equal(normalizeEmail('  JACK@OPSAPP.CO  '), 'jack@opsapp.co');
});

test('normalizes phone to digits only', () => {
  assert.equal(normalizePhone('+1 (778) 535-7941'), '17785357941');
});

test('hashes using sha256 lowercase hex', () => {
  assert.match(sha256Hex('jack@opsapp.co'), /^[a-f0-9]{64}$/);
});

test('hashEmail hashes the normalized email value', () => {
  assert.equal(hashEmail(' JACK@OPSAPP.CO '), sha256Hex('jack@opsapp.co'));
});

test('hashPhone hashes the normalized phone value', () => {
  assert.equal(hashPhone('+1 (778) 535-7941'), sha256Hex('17785357941'));
});
