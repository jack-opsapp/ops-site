'use client';

/**
 * GoogleAnalytics — Loads the GA4 gtag.js snippet when
 * NEXT_PUBLIC_GA_MEASUREMENT_ID is set in the environment.
 */

import Script from 'next/script';
import {
  buildGoogleAnalyticsConfigScript,
  getConfiguredMeasurementId,
} from '@/lib/analytics/ga-config';

const GA_ID = getConfiguredMeasurementId(
  process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID,
  process.env.NODE_ENV,
);

export default function GoogleAnalytics() {
  if (!GA_ID) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GA_ID)}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {buildGoogleAnalyticsConfigScript(GA_ID)}
      </Script>
    </>
  );
}
