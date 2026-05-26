/**
 * First-touch attribution cookie helpers for SPEC.
 *
 * Source: ops-software-bible/SPEC/04_CUSTOMER_UX.md § UTM + ad-click persistence.
 *
 * Model: first-touch. On first visit to ops-site, `ops_attribution` is set
 * with the UTM/ad-click params + landing_url + first_touch_at. Subsequent
 * visits do NOT overwrite. 30-day Max-Age. SameSite=Lax.
 *
 * Read at /api/spec/create-checkout-session time to:
 *  - Merge into Stripe metadata
 *  - Persist into spec_projects.attribution jsonb
 *  - Drive Meta CAPI + Google Enhanced server-side events
 */

import type { NextRequest, NextResponse } from 'next/server';

export const ATTRIBUTION_COOKIE_NAME = 'ops_attribution';
export const ATTRIBUTION_MAX_AGE_SECONDS = 30 * 24 * 60 * 60; // 30 days

export interface OpsAttribution {
  utm_source?: string | null;
  utm_medium?: string | null;
  utm_campaign?: string | null;
  utm_content?: string | null;
  utm_term?: string | null;
  gclid?: string | null;
  fbclid?: string | null;
  landing_url?: string | null;
  first_touch_at?: string | null;
}

const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'] as const;
const CLICK_ID_KEYS = ['gclid', 'fbclid'] as const;

/**
 * Read the first-touch cookie from a Next.js request (server-side).
 * Returns an empty object when missing or malformed — never throws.
 */
export function readAttributionCookie(
  cookies: { get: (name: string) => { value: string } | undefined },
): OpsAttribution {
  const raw = cookies.get(ATTRIBUTION_COOKIE_NAME)?.value;
  if (!raw) return {};
  try {
    const decoded = decodeURIComponent(raw);
    const parsed = JSON.parse(decoded) as OpsAttribution;
    return sanitize(parsed);
  } catch {
    return {};
  }
}

/**
 * Sanitize an attribution payload to whitelisted keys + string-or-null values.
 * Prevents arbitrary cookie payload bloat from leaking into Stripe metadata or
 * the spec_projects.attribution column.
 */
function sanitize(input: unknown): OpsAttribution {
  if (!input || typeof input !== 'object') return {};
  const out: OpsAttribution = {};
  const record = input as Record<string, unknown>;
  for (const key of [...UTM_KEYS, ...CLICK_ID_KEYS, 'landing_url', 'first_touch_at'] as const) {
    const value = record[key];
    if (typeof value === 'string' && value.length > 0 && value.length <= 512) {
      out[key as keyof OpsAttribution] = value;
    }
  }
  return out;
}

/**
 * Build the subset of attribution fields that Stripe metadata accepts (string-only).
 * Stripe metadata values are capped at 500 chars and only string values; we lowercase
 * the keys + drop nulls.
 */
export function attributionToStripeMetadata(attr: OpsAttribution): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(attr)) {
    if (typeof v === 'string' && v.length > 0) {
      out[k] = v.length > 500 ? v.slice(0, 500) : v;
    }
  }
  return out;
}

/**
 * Capture UTM + ad-click params from the current request URL and merge into
 * the cookie payload. Only writes the cookie if no first_touch_at already exists
 * (first-touch model). Caller passes the existing payload (or {}) and we return
 * the payload to write (or null if no write needed).
 */
export function maybeBuildFirstTouchPayload(
  url: URL,
  existing: OpsAttribution,
): OpsAttribution | null {
  if (existing.first_touch_at) return null;

  const captured: OpsAttribution = {
    landing_url: url.pathname + (url.search || ''),
    first_touch_at: new Date().toISOString(),
  };

  let sawAny = false;
  for (const key of UTM_KEYS) {
    const v = url.searchParams.get(key);
    if (v) {
      captured[key] = v;
      sawAny = true;
    }
  }
  for (const key of CLICK_ID_KEYS) {
    const v = url.searchParams.get(key);
    if (v) {
      captured[key] = v;
      sawAny = true;
    }
  }

  // Even without UTM params we still record landing_url + first_touch_at —
  // the cookie's existence guards future overwrites.
  if (!sawAny && !existing.landing_url) {
    return captured;
  }
  return sawAny ? captured : null;
}

/**
 * Write the cookie onto a response. Caller controls when to call this
 * (typically only in middleware on first visit).
 */
export function writeAttributionCookie(
  response: NextResponse,
  payload: OpsAttribution,
): void {
  const value = encodeURIComponent(JSON.stringify(payload));
  response.cookies.set({
    name: ATTRIBUTION_COOKIE_NAME,
    value,
    maxAge: ATTRIBUTION_MAX_AGE_SECONDS,
    sameSite: 'lax',
    path: '/',
    httpOnly: false, // readable from client too so analytics scripts can dedupe
    secure: process.env.NODE_ENV === 'production',
  });
}

/**
 * Read attribution from a Next.js `NextRequest` — convenience wrapper.
 */
export function readAttributionFromRequest(req: NextRequest): OpsAttribution {
  return readAttributionCookie(req.cookies);
}
