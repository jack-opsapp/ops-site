import { hashEmail, hashPhone } from './conversion-hash';
import type { ConversionEventPayload, SpecConversionEventName } from './conversion-events';

const GOOGLE_ADS_API_VERSION = process.env.GOOGLE_ADS_API_VERSION ?? 'v23';

const GOOGLE_PRIMARY_EVENTS = new Set<SpecConversionEventName>([
  'stripe_checkout_completed',
]);

const GOOGLE_SECONDARY_EVENTS = new Set<SpecConversionEventName>([
  'pay_deposit_click',
  'billing_address_submitted',
  'stripe_checkout_opened',
  'intake_submitted',
  'discovery_booked',
  'spec_default_ops_signup_completed',
  'spec_default_ops_trial_activated',
]);

const GOOGLE_CONVERSION_ACTION_ENV: Partial<Record<SpecConversionEventName, string>> = {
  pay_deposit_click: 'GOOGLE_ADS_CONVERSION_ACTION_PAY_DEPOSIT_CLICK',
  billing_address_submitted: 'GOOGLE_ADS_CONVERSION_ACTION_BILLING_ADDRESS_SUBMITTED',
  stripe_checkout_opened: 'GOOGLE_ADS_CONVERSION_ACTION_STRIPE_CHECKOUT_OPENED',
  stripe_checkout_completed: 'GOOGLE_ADS_CONVERSION_ACTION_STRIPE_CHECKOUT_COMPLETED',
  intake_submitted: 'GOOGLE_ADS_CONVERSION_ACTION_INTAKE_SUBMITTED',
  discovery_booked: 'GOOGLE_ADS_CONVERSION_ACTION_DISCOVERY_BOOKED',
  spec_default_ops_signup_completed: 'GOOGLE_ADS_CONVERSION_ACTION_DEFAULT_OPS_SIGNUP_COMPLETED',
  spec_default_ops_trial_activated: 'GOOGLE_ADS_CONVERSION_ACTION_DEFAULT_OPS_TRIAL_ACTIVATED',
};

type GoogleConversionRole = 'primary' | 'secondary' | 'internal';

export interface GoogleSendResult {
  ok: boolean;
  sent: boolean;
  error: string | null;
  retryable: boolean;
  configurationMissing: boolean;
}

interface GoogleAccessTokenResponse {
  access_token?: string;
  error?: string;
}

type GoogleUserIdentifier =
  | { hashedEmail: string; userIdentifierSource: 'FIRST_PARTY' }
  | { hashedPhoneNumber: string; userIdentifierSource: 'FIRST_PARTY' };

export interface GoogleConversionRequest {
  conversions: Array<{
    conversionAction: string;
    conversionDateTime: string;
    conversionValue: number;
    currencyCode: string;
    orderId?: string;
    gclid?: string;
    userIdentifiers?: GoogleUserIdentifier[];
  }>;
  partialFailure: true;
  validateOnly: boolean;
  debugEnabled: false;
}

export function isGoogleConversionConfigured(): boolean {
  return Boolean(
    process.env.GOOGLE_ADS_DEVELOPER_TOKEN &&
      process.env.GOOGLE_ADS_CUSTOMER_ID &&
      process.env.GOOGLE_ADS_REFRESH_TOKEN &&
      process.env.GOOGLE_ADS_CLIENT_ID &&
      process.env.GOOGLE_ADS_CLIENT_SECRET,
  );
}

export function googleConversionRole(eventName: SpecConversionEventName): GoogleConversionRole {
  if (GOOGLE_PRIMARY_EVENTS.has(eventName)) return 'primary';
  if (GOOGLE_SECONDARY_EVENTS.has(eventName)) return 'secondary';
  return 'internal';
}

function digitsOnly(value: string): string {
  return value.replace(/\D/g, '');
}

function cleanCustomerId(): string {
  const customerId = digitsOnly(process.env.GOOGLE_ADS_CUSTOMER_ID ?? '');
  if (!customerId) throw new Error('missing_google_ads_customer_id');
  return customerId;
}

function conversionActionResource(eventName: SpecConversionEventName): string | null {
  const envName = GOOGLE_CONVERSION_ACTION_ENV[eventName];
  const actionId = envName ? digitsOnly(process.env[envName] ?? '') : '';
  if (!actionId) return null;
  return `customers/${cleanCustomerId()}/conversionActions/${actionId}`;
}

function isConfigurationMissing(error: string | null): boolean {
  return Boolean(error?.startsWith('missing_google_conversion_action_'));
}

export function formatGoogleAdsDateTime(date: Date): string {
  return date.toISOString().replace('T', ' ').replace(/\.\d{3}Z$/, '+00:00');
}

async function fetchGoogleAccessToken(): Promise<string> {
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_ADS_CLIENT_ID ?? '',
      client_secret: process.env.GOOGLE_ADS_CLIENT_SECRET ?? '',
      refresh_token: process.env.GOOGLE_ADS_REFRESH_TOKEN ?? '',
      grant_type: 'refresh_token',
    }),
  });

  const data = (await response.json()) as GoogleAccessTokenResponse;
  if (!response.ok || !data.access_token) {
    throw new Error(`google_oauth_${response.status}_${data.error ?? 'missing_access_token'}`);
  }
  return data.access_token;
}

export function buildGoogleConversionRequest(
  eventName: SpecConversionEventName,
  payload: ConversionEventPayload,
  now = new Date(),
): GoogleConversionRequest | null {
  const role = googleConversionRole(eventName);
  if (role === 'internal') return null;

  const conversionAction = conversionActionResource(eventName);
  if (!conversionAction) {
    throw new Error(`missing_google_conversion_action_${eventName}`);
  }

  const hashedEmail = hashEmail(typeof payload.email === 'string' ? payload.email : null);
  const hashedPhone = hashPhone(typeof payload.phone === 'string' ? payload.phone : null);
  const userIdentifiers: GoogleUserIdentifier[] = [
    ...(hashedEmail ? [{ hashedEmail, userIdentifierSource: 'FIRST_PARTY' as const }] : []),
    ...(hashedPhone ? [{ hashedPhoneNumber: hashedPhone, userIdentifierSource: 'FIRST_PARTY' as const }] : []),
  ];

  const gclid = typeof payload.gclid === 'string' && payload.gclid.trim()
    ? payload.gclid.trim()
    : null;

  if (!gclid && userIdentifiers.length === 0) {
    throw new Error('missing_match_key');
  }

  return {
    conversions: [
      {
        conversionAction,
        conversionDateTime: formatGoogleAdsDateTime(now),
        conversionValue: typeof payload.value_cents === 'number' ? payload.value_cents / 100 : 0,
        currencyCode: typeof payload.currency === 'string' ? payload.currency : 'CAD',
        orderId: typeof payload.spec_project_id === 'string' ? payload.spec_project_id : undefined,
        ...(gclid ? { gclid } : {}),
        ...(userIdentifiers.length > 0 ? { userIdentifiers } : {}),
      },
    ],
    partialFailure: true,
    validateOnly: process.env.GOOGLE_ADS_VALIDATE_ONLY === 'true',
    debugEnabled: false,
  };
}

export async function sendGoogleEnhancedConversion(
  eventName: SpecConversionEventName,
  payload: ConversionEventPayload,
  occurredAt = new Date(),
): Promise<GoogleSendResult> {
  if (!isGoogleConversionConfigured()) {
    return { ok: true, sent: false, error: null, retryable: true, configurationMissing: true };
  }

  let body: GoogleConversionRequest | null;
  try {
    body = buildGoogleConversionRequest(eventName, payload, occurredAt);
  } catch (err) {
    return {
      ok: false,
      sent: false,
      error: err instanceof Error ? err.message : String(err),
      retryable: true,
      configurationMissing: isConfigurationMissing(err instanceof Error ? err.message : String(err)),
    };
  }

  if (!body) return { ok: true, sent: false, error: null, retryable: false, configurationMissing: false };

  let accessToken: string;
  try {
    accessToken = await fetchGoogleAccessToken();
  } catch (err) {
    return {
      ok: false,
      sent: false,
      error: err instanceof Error ? err.message : String(err),
      retryable: true,
      configurationMissing: false,
    };
  }

  const customerId = cleanCustomerId();
  const response = await fetch(
    `https://googleads.googleapis.com/${GOOGLE_ADS_API_VERSION}/customers/${customerId}:uploadClickConversions`,
    {
      method: 'POST',
      headers: {
        authorization: `Bearer ${accessToken}`,
        'content-type': 'application/json',
        'developer-token': process.env.GOOGLE_ADS_DEVELOPER_TOKEN ?? '',
        ...(process.env.GOOGLE_ADS_LOGIN_CUSTOMER_ID
          ? { 'login-customer-id': digitsOnly(process.env.GOOGLE_ADS_LOGIN_CUSTOMER_ID) }
          : {}),
      },
      body: JSON.stringify(body),
    },
  );

  const responseBody = (await response.json().catch(() => null)) as {
    partialFailureError?: { message?: string };
  } | null;

  if (!response.ok) {
    return {
      ok: false,
      sent: false,
      error: `google_ads_${response.status}`,
      retryable: response.status >= 500 || response.status === 429,
      configurationMissing: false,
    };
  }
  if (responseBody?.partialFailureError?.message) {
    return {
      ok: false,
      sent: false,
      error: responseBody.partialFailureError.message,
      retryable: false,
      configurationMissing: false,
    };
  }

  return { ok: true, sent: true, error: null, retryable: false, configurationMissing: false };
}
