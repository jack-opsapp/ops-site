export function parseMeasurementId(value: string | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed && /^G-[A-Z0-9]+$/.test(trimmed) ? trimmed : null;
}

export function getConfiguredMeasurementId(
  value: string | undefined,
  environment: string | undefined,
): string | null {
  const measurementId = parseMeasurementId(value);
  if (environment === 'production' && value?.length && !measurementId) {
    throw new Error('Invalid NEXT_PUBLIC_GA_MEASUREMENT_ID');
  }
  return measurementId;
}

export function buildGoogleAnalyticsConfigScript(
  measurementId: string,
  allowedHostnames: readonly string[],
): string {
  return `
          (function() {
          var allowedHostnames = ${JSON.stringify(allowedHostnames)};
          if (!allowedHostnames.includes(window.location.hostname)) {
            return;
          }
          window.dataLayer = window.dataLayer || [];
          function gtag(){window.dataLayer.push(arguments);}
          window.gtag = window.gtag || gtag;
          gtag('js', new Date());
          gtag('consent', 'default', {
            'ad_storage': 'denied',
            'ad_user_data': 'denied',
            'ad_personalization': 'denied',
            'analytics_storage': 'granted'
          });
          gtag('config', ${JSON.stringify(measurementId)}, {
            page_location: window.location.origin + window.location.pathname,
            page_path: window.location.pathname
          });
          })();
        `;
}
