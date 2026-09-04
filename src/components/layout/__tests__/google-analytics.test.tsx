import assert from 'node:assert/strict';
import test from 'node:test';
import { runInNewContext } from 'node:vm';
import { Children, isValidElement, type ReactElement } from 'react';

type AnalyticsExecutionContext = {
  window?: AnalyticsExecutionContext;
  location: {
    hostname: string;
    origin: string;
    pathname: string;
  };
  dataLayer?: IArguments[];
};

function executeConfigScript(script: string, hostname: string): unknown[][] {
  const context: AnalyticsExecutionContext = {
    location: {
      hostname,
      origin: `https://${hostname}`,
      pathname: '/journal',
    },
  };
  context.window = context;

  runInNewContext(script, context);

  return (context.dataLayer ?? []).map((entry) => Array.from(entry));
}

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

  const configScript = scripts[1]?.props.children ?? '';
  for (const hostname of ['opsapp.co', 'www.opsapp.co']) {
    const calls = executeConfigScript(configScript, hostname);
    assert.ok(
      calls.some(
        ([command, measurementId]) =>
          command === 'config' && measurementId === 'G-TEST123',
      ),
      `expected a GA config call on ${hostname}`,
    );
  }

  for (const hostname of [
    'localhost',
    '127.0.0.1',
    '[::1]',
    'try.opsapp.co',
    'ops-site-git-feature-ops-ltd.vercel.app',
    'example.com',
  ]) {
    assert.deepEqual(
      executeConfigScript(configScript, hostname),
      [],
      `expected no GA calls on ${hostname}`,
    );
  }
});
