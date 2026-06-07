'use client';

import { track } from '@vercel/analytics';

type AnalyticsValue = string | number | boolean;
type AnalyticsProperties = Record<string, AnalyticsValue | null | undefined>;

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
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
    page_path: window.location.pathname,
    page_search: window.location.search || undefined,
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
  trackMarketingEvent(name, buildSpecMarketingProperties(properties));
}
