import assert from 'node:assert/strict';
import test from 'node:test';
import { runInNewContext } from 'node:vm';
import {
  buildGoogleAnalyticsConfigScript,
  getConfiguredMeasurementId,
  parseMeasurementId,
} from '../ga-config';

const MARKETING_PRODUCTION_HOSTS = [
  'opsapp.co',
  'www.opsapp.co',
] as const;

type AnalyticsExecutionContext = {
  window?: AnalyticsExecutionContext;
  location: {
    hostname: string;
    origin: string;
    pathname: string;
  };
  dataLayer?: IArguments[];
};

function executeConfigScript(hostname: string): AnalyticsExecutionContext {
  const context: AnalyticsExecutionContext = {
    location: {
      hostname,
      origin: `https://${hostname}`,
      pathname: '/pricing',
    },
  };
  context.window = context;

  runInNewContext(
    buildGoogleAnalyticsConfigScript('G-TEST123', MARKETING_PRODUCTION_HOSTS),
    context,
  );

  return context;
}

test('accepts a trimmed GA4 measurement ID', () => {
  assert.equal(parseMeasurementId('  G-HKM7RWVTDV\n'), 'G-HKM7RWVTDV');
});

test('rejects missing and executable measurement ID text', () => {
  assert.equal(parseMeasurementId(undefined), null);
  assert.equal(parseMeasurementId(''), null);
  assert.equal(parseMeasurementId(`G-ABC');alert(1);//`), null);
  assert.equal(parseMeasurementId('UA-12345'), null);
});

test('serializes the measurement ID instead of interpolating executable text', () => {
  const script = buildGoogleAnalyticsConfigScript(
    'G-TEST123',
    MARKETING_PRODUCTION_HOSTS,
  );
  assert.match(script, /gtag\('consent', 'default', \{/);
  assert.match(script, /'ad_storage': 'denied'/);
  assert.match(script, /'ad_user_data': 'denied'/);
  assert.match(script, /'ad_personalization': 'denied'/);
  assert.match(script, /gtag\('config', "G-TEST123", \{/);
  assert.match(
    script,
    /page_location: window\.location\.origin \+ window\.location\.pathname/,
  );
  assert.doesNotMatch(script, /window\.location\.(?:href|search)/);
});

test('configures GA only on allowlisted production marketing hosts', () => {
  for (const hostname of MARKETING_PRODUCTION_HOSTS) {
    const context = executeConfigScript(hostname);
    const calls = (context.dataLayer ?? []).map((entry) => Array.from(entry));

    assert.ok(
      calls.some(
        ([command, measurementId]) =>
          command === 'config' && measurementId === 'G-TEST123',
      ),
      `expected a GA config call on ${hostname}`,
    );
  }
});

test('does not initialize or configure GA on local, preview, or arbitrary hosts', () => {
  const blockedHosts = [
    'localhost',
    '127.0.0.1',
    '[::1]',
    'try.opsapp.co',
    'ops-site-git-feature-ops-ltd.vercel.app',
    'example.com',
  ];

  for (const hostname of blockedHosts) {
    const context = executeConfigScript(hostname);

    assert.equal(
      context.dataLayer,
      undefined,
      `expected GA to remain uninitialized on ${hostname}`,
    );
  }
});

test('fails production configuration when a non-empty measurement ID is invalid', () => {
  assert.throws(
    () => getConfiguredMeasurementId('G-INVALID VALUE', 'production'),
    /Invalid NEXT_PUBLIC_GA_MEASUREMENT_ID/,
  );
  assert.equal(getConfiguredMeasurementId(undefined, 'production'), null);
  assert.equal(getConfiguredMeasurementId('G-INVALID VALUE', 'development'), null);
});
