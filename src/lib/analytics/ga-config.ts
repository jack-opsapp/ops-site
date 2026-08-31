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

export function buildGoogleAnalyticsConfigScript(measurementId: string): string {
  return `
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', ${JSON.stringify(measurementId)}, {
            page_location: window.location.origin + window.location.pathname,
            page_path: window.location.pathname
          });
        `;
}
