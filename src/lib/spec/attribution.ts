/**
 * First-touch attribution cookie helpers for SPEC.
 *
 * Source: ops-software-bible/SPEC/04_CUSTOMER_UX.md § UTM + ad-click persistence.
 *
 * Model: first-touch. The shared `__ops_first_touch` cookie is set on
 * `.opsapp.co` with the allowlisted campaign fields and canonical landing
 * path. Subsequent visits do NOT overwrite. 30-day Max-Age. SameSite=Lax.
 *
 * Read at /api/spec/create-checkout-session time to:
 *  - Merge into Stripe metadata
 *  - Persist into spec_projects.attribution jsonb
 *  - Drive Meta CAPI + Google Enhanced server-side events
 */

import type { NextRequest, NextResponse } from 'next/server';
import {
  FIRST_TOUCH_COOKIE_NAME,
  serializeFirstTouchPayload,
  FIRST_TOUCH_MAX_AGE_SECONDS,
  LEGACY_ATTRIBUTION_COOKIE_NAME,
  parseFirstTouchValue,
} from '@/lib/analytics/first-touch';

export const ATTRIBUTION_COOKIE_NAME = FIRST_TOUCH_COOKIE_NAME;
export const ATTRIBUTION_MAX_AGE_SECONDS = FIRST_TOUCH_MAX_AGE_SECONDS;

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
  const canonical = cookies.get(ATTRIBUTION_COOKIE_NAME)?.value;
  if (canonical) {
    const parsed = parseFirstTouchValue(canonical);
    if (parsed) {
      return {
        utm_source: parsed.utm_source,
        utm_medium: parsed.utm_medium,
        utm_campaign: parsed.utm_campaign,
        utm_content: parsed.utm_content,
        utm_term: parsed.utm_term,
        gclid: parsed.gclid,
        fbclid: parsed.fbclid,
        landing_url: parsed.landing_path,
        first_touch_at: parsed.captured_at,
      };
    }
  }

  // Read-only rollout bridge for cookies issued before the shared payload.
  const legacy = cookies.get(LEGACY_ATTRIBUTION_COOKIE_NAME)?.value;
  if (!legacy) return {};
  try {
    const decoded = decodeURIComponent(legacy);
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
    landing_url: url.pathname,
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
 *
 * Scoped to `.opsapp.co` in production (Unified Attribution P2). ops-site
 * serves `opsapp.co` but the app serves `app.opsapp.co`, and a host-only
 * cookie is never sent across that boundary — so signup attribution saw
 * nothing at all. The dotted domain is what makes the handoff work; the app
 * reads this same cookie when a company is created.
 *
 * The domain is omitted outside production because a dotted opsapp.co domain
 * is rejected by the browser on localhost.
 */
export function writeAttributionCookie(
  response: NextResponse,
  payload: OpsAttribution,
): void {
  const anonymousId = crypto.randomUUID();
  const canonical = parseFirstTouchValue(
    encodeURIComponent(JSON.stringify(payload)),
    { legacyAnonymousId: anonymousId },
  );
  if (!canonical) return;
  response.cookies.set({
    name: ATTRIBUTION_COOKIE_NAME,
    value: serializeFirstTouchPayload(canonical),
    maxAge: ATTRIBUTION_MAX_AGE_SECONDS,
    sameSite: 'lax',
    path: '/',
    domain: process.env.NODE_ENV === 'production' ? '.opsapp.co' : undefined,
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
