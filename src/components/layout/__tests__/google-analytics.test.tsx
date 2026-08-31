import assert from 'node:assert/strict';
import test from 'node:test';
import { Children, isValidElement, type ReactElement } from 'react';

test('trims the configured measurement ID before building either GA script', async () => {
  process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID = 'G-TEST123\n';

  const { default: GoogleAnalytics } = await import('../GoogleAnalytics');
  const output = GoogleAnalytics();

  assert.ok(isValidElement(output));
  const scripts = Children.toArray(
    (output as ReactElement<{ children: React.ReactNode }>).props.children,
  ) as ReactElement<{ src?: string; children?: string }>[];

  assert.equal(
    scripts[0]?.props.src,
    'https://www.googletagmanager.com/gtag/js?id=G-TEST123',
  );
  assert.match(
    scripts[1]?.props.children ?? '',
    /gtag\('config', "G-TEST123", \{/,
  );
  assert.match(
    scripts[1]?.props.children ?? '',
    /page_location: window\.location\.origin \+ window\.location\.pathname/,
  );
  assert.doesNotMatch(scripts[1]?.props.children ?? '', /G-TEST123\n/);
});
