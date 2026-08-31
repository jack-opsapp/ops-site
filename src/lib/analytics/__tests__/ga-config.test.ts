import assert from 'node:assert/strict';
import test from 'node:test';
import {
  buildGoogleAnalyticsConfigScript,
  getConfiguredMeasurementId,
  parseMeasurementId,
} from '../ga-config';

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
  const script = buildGoogleAnalyticsConfigScript('G-TEST123');
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

test('fails production configuration when a non-empty measurement ID is invalid', () => {
  assert.throws(
    () => getConfiguredMeasurementId('G-INVALID VALUE', 'production'),
    /Invalid NEXT_PUBLIC_GA_MEASUREMENT_ID/,
  );
  assert.equal(getConfiguredMeasurementId(undefined, 'production'), null);
  assert.equal(getConfiguredMeasurementId('G-INVALID VALUE', 'development'), null);
});
