import { strict as assert } from 'node:assert';
import { afterEach, test } from 'node:test';

import {
  buildGoogleConversionRequest,
  formatGoogleAdsDateTime,
  googleConversionRole,
  isGoogleConversionConfigured,
  sendGoogleEnhancedConversion,
} from '../google-enhanced-conversions';

const ENV_KEYS = [
  'GOOGLE_ADS_API_VERSION',
  'GOOGLE_ADS_DEVELOPER_TOKEN',
  'GOOGLE_ADS_CUSTOMER_ID',
  'GOOGLE_ADS_REFRESH_TOKEN',
  'GOOGLE_ADS_CLIENT_ID',
  'GOOGLE_ADS_CLIENT_SECRET',
  'GOOGLE_ADS_LOGIN_CUSTOMER_ID',
  'GOOGLE_ADS_VALIDATE_ONLY',
  'GOOGLE_ADS_CONVERSION_ACTION_PAY_DEPOSIT_CLICK',
  'GOOGLE_ADS_CONVERSION_ACTION_BILLING_ADDRESS_SUBMITTED',
  'GOOGLE_ADS_CONVERSION_ACTION_STRIPE_CHECKOUT_OPENED',
  'GOOGLE_ADS_CONVERSION_ACTION_STRIPE_CHECKOUT_COMPLETED',
  'GOOGLE_ADS_CONVERSION_ACTION_INTAKE_SUBMITTED',
  'GOOGLE_ADS_CONVERSION_ACTION_DISCOVERY_BOOKED',
  'GOOGLE_ADS_CONVERSION_ACTION_DEFAULT_OPS_SIGNUP_COMPLETED',
  'GOOGLE_ADS_CONVERSION_ACTION_DEFAULT_OPS_TRIAL_ACTIVATED',
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
  process.env.GOOGLE_ADS_CUSTOMER_ID = '123-456-7890';
  process.env.GOOGLE_ADS_REFRESH_TOKEN = 'refresh-token';
  process.env.GOOGLE_ADS_CLIENT_ID = 'client-id';
  process.env.GOOGLE_ADS_CLIENT_SECRET = 'client-secret';
  process.env.GOOGLE_ADS_LOGIN_CUSTOMER_ID = '999-888-7777';
  process.env.GOOGLE_ADS_CONVERSION_ACTION_STRIPE_CHECKOUT_COMPLETED = '111222333';
  process.env.GOOGLE_ADS_CONVERSION_ACTION_PAY_DEPOSIT_CLICK = '444555666';
}

afterEach(() => {
  resetEnv();
  globalThis.fetch = originalFetch;
});

test('detects full Google conversion configuration', () => {
  resetEnv();
  assert.equal(isGoogleConversionConfigured(), false);
  configureGoogleEnv();
  assert.equal(isGoogleConversionConfigured(), true);
});

test('classifies primary, secondary, and internal events', () => {
  assert.equal(googleConversionRole('stripe_checkout_completed'), 'primary');
  assert.equal(googleConversionRole('pay_deposit_click'), 'secondary');
  assert.equal(googleConversionRole('page_view'), 'internal');
});

test('formats Google Ads datetime with UTC offset', () => {
  assert.equal(
    formatGoogleAdsDateTime(new Date('2026-06-07T12:34:56.789Z')),
    '2026-06-07 12:34:56+00:00',
  );
});

test('returns null for internal events', () => {
  configureGoogleEnv();
  assert.equal(buildGoogleConversionRequest('page_view', {}, new Date()), null);
});

test('throws when a measured Google event has no conversion action ID', () => {
  configureGoogleEnv();
  delete process.env.GOOGLE_ADS_CONVERSION_ACTION_STRIPE_CHECKOUT_COMPLETED;

  assert.throws(
    () => buildGoogleConversionRequest('stripe_checkout_completed', {
      email: 'buyer@example.com',
    }),
    /missing_google_conversion_action_stripe_checkout_completed/,
  );
});

test('builds uploadClickConversions body with gclid and hashed identifiers', () => {
  configureGoogleEnv();

  const body = buildGoogleConversionRequest(
    'stripe_checkout_completed',
    {
      spec_project_id: 'project-1',
      gclid: ' test-gclid ',
      email: ' BUYER@EXAMPLE.COM ',
      phone: '+1 (778) 535-7941',
      value_cents: 75000,
      currency: 'CAD',
    },
    new Date('2026-06-07T12:34:56.789Z'),
  );

  assert.ok(body);
  assert.equal(body.partialFailure, true);
  assert.equal(body.validateOnly, false);
  assert.equal(body.debugEnabled, false);
  assert.equal(body.conversions[0].conversionAction, 'customers/1234567890/conversionActions/111222333');
  assert.equal(body.conversions[0].conversionDateTime, '2026-06-07 12:34:56+00:00');
  assert.equal(body.conversions[0].conversionValue, 750);
  assert.equal(body.conversions[0].currencyCode, 'CAD');
  assert.equal(body.conversions[0].orderId, 'project-1');
  assert.equal(body.conversions[0].gclid, 'test-gclid');
  assert.equal(body.conversions[0].userIdentifiers?.length, 2);
  assert.match(
    (body.conversions[0].userIdentifiers?.[0] as { hashedEmail: string }).hashedEmail,
    /^[a-f0-9]{64}$/,
  );
  assert.match(
    (body.conversions[0].userIdentifiers?.[1] as { hashedPhoneNumber: string }).hashedPhoneNumber,
    /^[a-f0-9]{64}$/,
  );
});

test('sends to the v23 uploadClickConversions endpoint', async () => {
  configureGoogleEnv();
  const calls: Array<{ url: string; init: RequestInit }> = [];
  globalThis.fetch = (async (url: string | URL | Request, init?: RequestInit) => {
    calls.push({ url: String(url), init: init ?? {} });
    if (String(url) === 'https://oauth2.googleapis.com/token') {
      return Response.json({ access_token: 'access-token' });
    }
    return Response.json({ results: [{}] });
  }) as typeof fetch;

  const result = await sendGoogleEnhancedConversion('stripe_checkout_completed', {
    email: 'buyer@example.com',
    gclid: 'gclid-1',
    value_cents: 75000,
    currency: 'CAD',
  });

  assert.deepEqual(result, { ok: true, sent: true, error: null });
  assert.equal(calls[1].url, 'https://googleads.googleapis.com/v23/customers/1234567890:uploadClickConversions');
  assert.equal((calls[1].init.headers as Record<string, string>)['developer-token'], 'dev-token');
  assert.equal((calls[1].init.headers as Record<string, string>).authorization, 'Bearer access-token');
  assert.equal((calls[1].init.headers as Record<string, string>)['login-customer-id'], '9998887777');
});

test('reports Google Ads partial failure', async () => {
  configureGoogleEnv();
  globalThis.fetch = (async (url: string | URL | Request) => {
    if (String(url) === 'https://oauth2.googleapis.com/token') {
      return Response.json({ access_token: 'access-token' });
    }
    return Response.json({ partialFailureError: { message: 'bad conversion' } });
  }) as typeof fetch;

  const result = await sendGoogleEnhancedConversion('stripe_checkout_completed', {
    email: 'buyer@example.com',
    value_cents: 75000,
  });

  assert.deepEqual(result, { ok: false, sent: false, error: 'bad conversion' });
});

test('reports missing conversion action ID without hitting Google', async () => {
  configureGoogleEnv();
  delete process.env.GOOGLE_ADS_CONVERSION_ACTION_STRIPE_CHECKOUT_COMPLETED;
  const calls: string[] = [];
  globalThis.fetch = (async (url: string | URL | Request) => {
    calls.push(String(url));
    return Response.json({});
  }) as typeof fetch;

  const result = await sendGoogleEnhancedConversion('stripe_checkout_completed', {
    email: 'buyer@example.com',
    value_cents: 75000,
  });

  assert.deepEqual(result, {
    ok: false,
    sent: false,
    error: 'missing_google_conversion_action_stripe_checkout_completed',
  });
  assert.deepEqual(calls, []);
});
