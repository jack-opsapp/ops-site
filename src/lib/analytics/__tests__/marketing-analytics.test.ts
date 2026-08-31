import assert from 'node:assert/strict';
import test from 'node:test';

test('drops page queries and strips outbound URLs to origin plus pathname', async () => {
  const calls: unknown[][] = [];
  const browser = {
    location: {
      pathname: '/pricing',
      search: '?email=operator%40example.com',
    },
    gtag: (...args: unknown[]) => calls.push(args),
  };
  Object.defineProperty(globalThis, 'window', {
    configurable: true,
    value: browser,
  });

  try {
    const { trackMarketingEvent } = await import('../../marketing-analytics');
    trackMarketingEvent('outbound_click', {
      link_url: 'https://vendor.example/demo?email=operator%40example.com#private',
      link_domain: 'vendor.example',
    });

    assert.equal(calls.length, 1);
    assert.deepEqual(calls[0], [
      'event',
      'outbound_click',
      {
        page_path: '/pricing',
        link_url: 'https://vendor.example/demo',
        link_domain: 'vendor.example',
      },
    ]);
  } finally {
    Reflect.deleteProperty(globalThis, 'window');
  }
});
