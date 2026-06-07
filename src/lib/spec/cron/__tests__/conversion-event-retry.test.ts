import { strict as assert } from 'node:assert';
import { afterEach, test } from 'node:test';

import { runConversionEventOutboxRetry } from '../conversion-event-retry';
import { makeFakeSupabase } from './fake-supabase';

const ENV_KEYS = [
  'META_CAPI_PIXEL_ID',
  'META_CAPI_ACCESS_TOKEN',
  'GOOGLE_ADS_API_VERSION',
  'GOOGLE_ADS_DEVELOPER_TOKEN',
  'GOOGLE_ADS_CUSTOMER_ID',
  'GOOGLE_ADS_REFRESH_TOKEN',
  'GOOGLE_ADS_CLIENT_ID',
  'GOOGLE_ADS_CLIENT_SECRET',
  'GOOGLE_ADS_CONVERSION_ACTION_STRIPE_CHECKOUT_COMPLETED',
] as const;

const originalEnv = new Map<string, string | undefined>();
for (const key of ENV_KEYS) originalEnv.set(key, process.env[key]);

const originalFetch = globalThis.fetch;

function resetEnv() {
  for (const key of ENV_KEYS) {
    const value = originalEnv.get(key);
    if (value == null) delete process.env[key];
    else process.env[key] = value;
  }
}

function configureGoogleEnv() {
  process.env.GOOGLE_ADS_API_VERSION = 'v23';
  process.env.GOOGLE_ADS_DEVELOPER_TOKEN = 'dev-token';
  process.env.GOOGLE_ADS_CUSTOMER_ID = '1234567890';
  process.env.GOOGLE_ADS_REFRESH_TOKEN = 'refresh-token';
  process.env.GOOGLE_ADS_CLIENT_ID = 'client-id';
  process.env.GOOGLE_ADS_CLIENT_SECRET = 'client-secret';
  process.env.GOOGLE_ADS_CONVERSION_ACTION_STRIPE_CHECKOUT_COMPLETED = '111222333';
}

afterEach(() => {
  resetEnv();
  globalThis.fetch = originalFetch;
});

test('leaves pending conversion rows untouched when ad credentials are absent', async () => {
  resetEnv();
  const db = makeFakeSupabase({
    conversion_event_outbox: [{
      id: 'row-1',
      event_name: 'stripe_checkout_completed',
      payload: { email: 'buyer@example.com' },
      attempts: 0,
      status: 'pending',
      last_attempt_at: null,
      created_at: '2026-06-07T10:00:00.000Z',
    }],
  });

  const result = await runConversionEventOutboxRetry(
    db,
    new Date('2026-06-07T12:00:00.000Z'),
  );

  assert.equal(result.considered, 1);
  assert.equal(result.fired, 0);
  assert.equal(db.recordedUpdates.length, 0);
});

test('leaves rows untouched when only Meta credentials are present', async () => {
  resetEnv();
  process.env.META_CAPI_PIXEL_ID = 'pixel-1';
  process.env.META_CAPI_ACCESS_TOKEN = 'meta-token';

  const db = makeFakeSupabase({
    conversion_event_outbox: [{
      id: 'row-1',
      event_name: 'stripe_checkout_completed',
      payload: { email: 'buyer@example.com' },
      attempts: 0,
      status: 'pending',
      last_attempt_at: null,
      created_at: '2026-06-07T10:00:00.000Z',
    }],
  });

  const result = await runConversionEventOutboxRetry(
    db,
    new Date('2026-06-07T12:00:00.000Z'),
  );

  assert.equal(result.considered, 1);
  assert.equal(result.fired, 0);
  assert.match(result.details[0] ?? '', /Meta CAPI env vars present/);
  assert.equal(db.recordedUpdates.length, 0);
});

test('marks Google conversion rows sent when upload succeeds', async () => {
  configureGoogleEnv();
  const calls: string[] = [];
  globalThis.fetch = (async (url: string | URL | Request) => {
    calls.push(String(url));
    if (String(url) === 'https://oauth2.googleapis.com/token') {
      return Response.json({ access_token: 'access-token' });
    }
    return Response.json({ results: [{}] });
  }) as typeof fetch;

  const db = makeFakeSupabase({
    conversion_event_outbox: [{
      id: 'row-1',
      event_name: 'stripe_checkout_completed',
      payload: {
        email: 'buyer@example.com',
        phone: '+1 778 535 7941',
        gclid: 'gclid-1',
        value_cents: 75000,
        currency: 'CAD',
      },
      attempts: 0,
      status: 'pending',
      last_attempt_at: null,
      created_at: '2026-06-07T10:00:00.000Z',
    }],
  });

  const result = await runConversionEventOutboxRetry(
    db,
    new Date('2026-06-07T12:00:00.000Z'),
  );

  assert.equal(result.considered, 1);
  assert.equal(result.fired, 1);
  assert.equal(calls[1], 'https://googleads.googleapis.com/v23/customers/1234567890:uploadClickConversions');
  assert.deepEqual(db.recordedUpdates[0].patch, {
    status: 'sent',
    sent_at: '2026-06-07T12:00:00.000Z',
    last_attempt_at: '2026-06-07T12:00:00.000Z',
    last_error: null,
  });
});

test('marks Google conversion rows failed when upload rejects the match', async () => {
  configureGoogleEnv();
  globalThis.fetch = (async (url: string | URL | Request) => {
    if (String(url) === 'https://oauth2.googleapis.com/token') {
      return Response.json({ access_token: 'access-token' });
    }
    return Response.json({ partialFailureError: { message: 'bad conversion' } });
  }) as typeof fetch;

  const db = makeFakeSupabase({
    conversion_event_outbox: [{
      id: 'row-1',
      event_name: 'stripe_checkout_completed',
      payload: {
        email: 'buyer@example.com',
        value_cents: 75000,
        currency: 'CAD',
      },
      attempts: 0,
      status: 'pending',
      last_attempt_at: null,
      created_at: '2026-06-07T10:00:00.000Z',
    }],
  });

  const result = await runConversionEventOutboxRetry(
    db,
    new Date('2026-06-07T12:00:00.000Z'),
  );

  assert.equal(result.considered, 1);
  assert.equal(result.fired, 0);
  assert.deepEqual(db.recordedUpdates[0].patch, {
    status: 'failed',
    attempts: 1,
    last_attempt_at: '2026-06-07T12:00:00.000Z',
    last_error: 'bad conversion',
  });
});

test('marks Google conversion rows failed when conversion action ID is missing', async () => {
  configureGoogleEnv();
  delete process.env.GOOGLE_ADS_CONVERSION_ACTION_STRIPE_CHECKOUT_COMPLETED;

  const db = makeFakeSupabase({
    conversion_event_outbox: [{
      id: 'row-1',
      event_name: 'stripe_checkout_completed',
      payload: {
        email: 'buyer@example.com',
        value_cents: 75000,
        currency: 'CAD',
      },
      attempts: 0,
      status: 'pending',
      last_attempt_at: null,
      created_at: '2026-06-07T10:00:00.000Z',
    }],
  });

  const result = await runConversionEventOutboxRetry(
    db,
    new Date('2026-06-07T12:00:00.000Z'),
  );

  assert.equal(result.considered, 1);
  assert.equal(result.fired, 0);
  assert.deepEqual(db.recordedUpdates[0].patch, {
    status: 'failed',
    attempts: 1,
    last_attempt_at: '2026-06-07T12:00:00.000Z',
    last_error: 'missing_google_conversion_action_stripe_checkout_completed',
  });
});
