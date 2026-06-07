'use client';

import { track } from '@vercel/analytics';

type AnalyticsValue = string | number | boolean;
type AnalyticsProperties = Record<string, AnalyticsValue | null | undefined>;

const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'] as const;
const CLICK_ID_KEYS = ['gclid', 'fbclid'] as const;
const SPEC_RAW_EVENTS = new Set([
  'page_view',
  'spec_card_expand',
  'pay_deposit_click',
  'spec_default_ops_cta_click',
]);

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

export function sanitizeMarketingPath(pathname: string): string {
  const path = pathname || '/';
  const normalized = path.startsWith('/') ? path : `/${path}`;
  const withoutLocale = normalized.startsWith('/es/') ? normalized.slice(3) : normalized;

  if (/^\/spec\/checkout\/[^/]+\/?$/.test(withoutLocale)) return '/spec/checkout/[token]';
  if (/^\/spec\/owner-approval\/[^/]+\/?$/.test(withoutLocale)) return '/spec/owner-approval/[token]';
  if (/^\/spec\/intake\/[^/]+\/?$/.test(withoutLocale)) return '/spec/intake/[token]';
  if (withoutLocale === '/spec/confirmation') return '/spec/confirmation';

  return normalized;
}

export function buildSafeSearchProperties(search: string): Record<string, AnalyticsValue> {
  const params = new URLSearchParams(search.startsWith('?') ? search.slice(1) : search);
  const out: Record<string, AnalyticsValue> = {};

  for (const key of UTM_KEYS) {
    const value = params.get(key);
    if (value) out[key] = value.slice(0, 180);
  }
  for (const key of CLICK_ID_KEYS) {
    if (params.has(key)) out[`has_${key}`] = true;
  }

  return out;
}

export function sanitizeMarketingUrl(raw: string, base?: string): string {
  try {
    const url = new URL(raw, base);
    const safeUrl = new URL(`${url.origin}${sanitizeMarketingPath(url.pathname)}`);
    for (const key of UTM_KEYS) {
      const value = url.searchParams.get(key);
      if (value) safeUrl.searchParams.set(key, value.slice(0, 180));
    }
    for (const key of CLICK_ID_KEYS) {
      if (url.searchParams.has(key)) safeUrl.searchParams.set(`has_${key}`, '1');
    }
    return safeUrl.toString();
  } catch {
    return sanitizeMarketingPath(raw.split('?')[0] ?? '/');
  }
}

export function buildMarketingProperties(
  properties: AnalyticsProperties,
): Record<string, AnalyticsValue> {
  return Object.fromEntries(
    Object.entries(properties)
      .filter((entry): entry is [string, AnalyticsValue] => entry[1] != null)
      .map(([key, value]) => [
        key,
        typeof value === 'string' ? value.slice(0, 180) : value,
      ]),
  );
}

export function buildSpecMarketingProperties(
  properties: AnalyticsProperties = {},
): Record<string, AnalyticsValue> {
  return buildMarketingProperties({
    surface: 'spec',
    ...properties,
  });
}

export function trackMarketingEvent(
  name: string,
  properties: AnalyticsProperties = {},
): void {
  if (typeof window === 'undefined') return;

  const payload = buildMarketingProperties({
    page_path: sanitizeMarketingPath(window.location.pathname),
    ...buildSafeSearchProperties(window.location.search),
    ...properties,
  });

  try {
    window.gtag?.('event', name, payload);
  } catch {
    // Client analytics must never block navigation or checkout.
  }

  try {
    track(name, payload);
  } catch {
    // Vercel Analytics can be absent in local/test runtimes.
  }
}

export function trackSpecMarketingEvent(
  name: string,
  properties: AnalyticsProperties = {},
): void {
  const payload = buildSpecMarketingProperties(properties);
  trackMarketingEvent(name, payload);
  enqueueSpecRawEvent(name, payload);
}

function enqueueSpecRawEvent(
  eventName: string,
  properties: AnalyticsProperties,
): void {
  if (!SPEC_RAW_EVENTS.has(eventName) || typeof window === 'undefined') return;

  const payload = buildMarketingProperties({
    page_path: sanitizeMarketingPath(window.location.pathname),
    ...buildSafeSearchProperties(window.location.search),
    ...properties,
  });
  const body = JSON.stringify({ eventName, payload });

  try {
    if (navigator.sendBeacon) {
      const blob = new Blob([body], { type: 'application/json' });
      navigator.sendBeacon('/api/spec/conversion-event', blob);
      return;
    }
  } catch {
    // Fall back to fetch below.
  }

  fetch('/api/spec/conversion-event', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
    keepalive: true,
  }).catch(() => {
    // Client-side analytics must never interrupt the customer flow.
  });
}
