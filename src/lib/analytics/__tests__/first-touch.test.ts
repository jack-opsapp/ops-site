import assert from 'node:assert/strict';
import { webcrypto } from 'node:crypto';
import test from 'node:test';
import {
  buildFirstTouchPayload,
  captureFirstTouchOnClient,
  encodeFirstTouchPayload,
  FIRST_TOUCH_COOKIE_NAME,
  FIRST_TOUCH_MAX_ENCODED_BYTES,
  parseFirstTouchValue,
  resolveFirstTouch,
} from '../first-touch';

const NOW = '2026-08-30T20:00:00.000Z';
const ANONYMOUS_ID = '11111111-1111-4111-8111-111111111111';
const UUID_V4_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

interface BrowserStub {
  href: string;
  cookie?: string;
  cookieError?: Error;
  crypto: unknown;
}

// Stands in for a browser tab: window.location, a document cookie jar that
// records writes, and whatever `crypto` that browser exposes.
function inBrowser<T>(stub: BrowserStub, run: (cookieWrites: string[]) => T): T {
  const url = new URL(stub.href);
  const cookieWrites: string[] = [];
  const globals = {
    window: {
      location: {
        href: url.href,
        hostname: url.hostname,
        protocol: url.protocol,
      },
    },
    document: {
      referrer: '',
      get cookie(): string {
        if (stub.cookieError) throw stub.cookieError;
        return stub.cookie ?? '';
      },
      set cookie(value: string) {
        if (stub.cookieError) throw stub.cookieError;
        cookieWrites.push(value);
      },
    },
    crypto: stub.crypto,
  };
  const originals = Object.keys(globals).map(
    (name) => [name, Object.getOwnPropertyDescriptor(globalThis, name)] as const,
  );
  for (const [name, value] of Object.entries(globals)) {
    Object.defineProperty(globalThis, name, { configurable: true, value });
  }
  try {
    return run(cookieWrites);
  } finally {
    for (const [name, descriptor] of originals) {
      if (descriptor) Object.defineProperty(globalThis, name, descriptor);
      else Reflect.deleteProperty(globalThis, name);
    }
  }
}

// What Chrome exposes on plain-http pages and what Safari < 15.4 and
// Chrome < 92 expose everywhere: getRandomValues, but no randomUUID.
const CRYPTO_WITHOUT_RANDOM_UUID = {
  getRandomValues: webcrypto.getRandomValues.bind(webcrypto),
};

test('captures first touch in a browser that withholds crypto.randomUUID', () => {
  inBrowser(
    {
      href: 'http://192.168.1.20:3000/plans?utm_source=google&gclid=click-1',
      crypto: CRYPTO_WITHOUT_RANDOM_UUID,
    },
    (cookieWrites) => {
      const touch = captureFirstTouchOnClient();

      assert.ok(touch);
      assert.match(touch.anonymous_id, UUID_V4_PATTERN);
      assert.equal(touch.landing_path, '/plans');
      assert.equal(touch.utm_source, 'google');
      assert.equal(touch.gclid, 'click-1');
      assert.equal(cookieWrites.length, 1);
      const [pair] = cookieWrites[0].split('; ');
      assert.equal(pair, `${FIRST_TOUCH_COOKIE_NAME}=${encodeFirstTouchPayload(touch)}`);
      assert.doesNotMatch(cookieWrites[0], /Secure|Domain=/);
    },
  );
});

test('keeps a returning visitor first touch in a browser without crypto.randomUUID', () => {
  const existing = buildFirstTouchPayload({
    url: 'https://opsapp.co/first?utm_source=meta',
    referrer: '',
    capturedAt: NOW,
    anonymousId: ANONYMOUS_ID,
  });
  assert.ok(existing);

  inBrowser(
    {
      href: 'https://opsapp.co/later?utm_source=google',
      cookie: `other=1; ${FIRST_TOUCH_COOKIE_NAME}=${encodeFirstTouchPayload(existing)}`,
      crypto: CRYPTO_WITHOUT_RANDOM_UUID,
    },
    (cookieWrites) => {
      assert.deepEqual(captureFirstTouchOnClient(), existing);
      assert.equal(cookieWrites.length, 0);
    },
  );
});

test('never throws when the browser has no secure random source at all', () => {
  inBrowser(
    { href: 'https://opsapp.co/', crypto: undefined },
    (cookieWrites) => {
      assert.equal(captureFirstTouchOnClient(), null);
      assert.equal(cookieWrites.length, 0);
    },
  );
});

test('never throws when the page cannot touch cookies', () => {
  const blocked = new Error('The operation is insecure.');
  blocked.name = 'SecurityError';
  inBrowser(
    { href: 'https://opsapp.co/', cookieError: blocked, crypto: webcrypto },
    () => {
      assert.equal(captureFirstTouchOnClient(), null);
    },
  );
});

test('captures only allowlisted campaign fields and a canonical landing path', () => {
  const touch = buildFirstTouchPayload({
    url:
      'https://opsapp.co/plans?utm_source=google&utm_medium=organic' +
      '&utm_campaign=fall&utm_content=hero&utm_term=field+service' +
      '&gclid=click-1&fbclid=click-2&email=operator%40example.com',
    referrer: 'https://www.google.com/search?q=private+query',
    capturedAt: NOW,
    anonymousId: ANONYMOUS_ID,
  });

  assert.deepEqual(touch, {
    version: 1,
    anonymous_id: ANONYMOUS_ID,
    captured_at: NOW,
    landing_path: '/plans',
    referrer_domain: 'google.com',
    utm_source: 'google',
    utm_medium: 'organic',
    utm_campaign: 'fall',
    utm_content: 'hero',
    utm_term: 'field service',
    gclid: 'click-1',
    fbclid: 'click-2',
  });
  assert.doesNotMatch(JSON.stringify(touch), /operator|private|email|q=/);
});

test('captures gbraid and wbraid as Google click ids alongside gclid', () => {
  const touch = buildFirstTouchPayload({
    url: 'https://opsapp.co/plans?gbraid=brand-1&wbraid=web-1',
    referrer: '',
    capturedAt: NOW,
    anonymousId: ANONYMOUS_ID,
  });

  assert.deepEqual(touch, {
    version: 1,
    anonymous_id: ANONYMOUS_ID,
    captured_at: NOW,
    landing_path: '/plans',
    gbraid: 'brand-1',
    wbraid: 'web-1',
  });
  assert.deepEqual(parseFirstTouchValue(encodeFirstTouchPayload(touch!)), touch);
});

test('keeps gbraid and wbraid right behind gclid when bounding an oversized payload', () => {
  const touch = buildFirstTouchPayload({
    url:
      'https://opsapp.co/plans?' +
      ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term']
        .map((key) => `${key}=${key.slice(4, 5).repeat(300)}`)
        .join('&') +
      `&gclid=${'g'.repeat(600)}&gbraid=${'b'.repeat(600)}&wbraid=${'w'.repeat(600)}&fbclid=${'f'.repeat(600)}`,
    referrer: `https://${'r'.repeat(240)}.example.com/`,
    capturedAt: NOW,
    anonymousId: ANONYMOUS_ID,
  });
  assert.ok(touch);
  assert.ok(encodeURIComponent(JSON.stringify(touch)).length > FIRST_TOUCH_MAX_ENCODED_BYTES);
  const encoded = encodeFirstTouchPayload(touch);
  assert.ok(encoded.length <= FIRST_TOUCH_MAX_ENCODED_BYTES);
  const parsed = parseFirstTouchValue(encoded);
  assert.equal(parsed?.gclid, 'g'.repeat(256));
  assert.equal(parsed?.gbraid, 'b'.repeat(256));
  assert.equal(parsed?.wbraid, 'w'.repeat(256));
});

test('excludes OPS subdomains from referral classification', () => {
  const touch = buildFirstTouchPayload({
    url: 'https://opsapp.co/',
    referrer: 'https://app.opsapp.co/setup?company=private',
    capturedAt: NOW,
    anonymousId: ANONYMOUS_ID,
  });

  assert.equal(touch?.referrer_domain, undefined);
});

test('round-trips the versioned payload and rejects invalid identities', () => {
  const touch = buildFirstTouchPayload({
    url: 'https://opsapp.co/',
    referrer: '',
    capturedAt: NOW,
    anonymousId: ANONYMOUS_ID,
  });
  assert.ok(touch);
  assert.deepEqual(parseFirstTouchValue(encodeFirstTouchPayload(touch)), touch);

  const invalid = encodeURIComponent(
    JSON.stringify({
      ...touch,
      anonymous_id: 'not-a-uuid',
    }),
  );
  assert.equal(parseFirstTouchValue(invalid), null);
});

test('migrates the active legacy payload without preserving raw URLs', () => {
  const legacy = encodeURIComponent(
    JSON.stringify({
      utm_source: 'newsletter',
      landing_url: '/spec?email=operator%40example.com',
      first_touch_at: NOW,
    }),
  );

  const migrated = parseFirstTouchValue(legacy, {
    legacyAnonymousId: ANONYMOUS_ID,
  });
  assert.deepEqual(migrated, {
    version: 1,
    anonymous_id: ANONYMOUS_ID,
    captured_at: NOW,
    landing_path: '/spec',
    utm_source: 'newsletter',
  });
});

test('preserves an existing canonical first touch', () => {
  const existing = buildFirstTouchPayload({
    url: 'https://opsapp.co/first?utm_source=google',
    referrer: '',
    capturedAt: NOW,
    anonymousId: ANONYMOUS_ID,
  });
  assert.ok(existing);

  const decision = resolveFirstTouch({
    canonicalValue: encodeFirstTouchPayload(existing),
    legacyValue: undefined,
    url: 'https://opsapp.co/later?utm_source=meta',
    referrer: '',
    capturedAt: '2026-08-31T00:00:00.000Z',
    anonymousId: '22222222-2222-4222-8222-222222222222',
  });
  assert.deepEqual(decision, { payload: existing, shouldWrite: false });
});

test('bounds pathological campaign payloads below the browser cookie ceiling', () => {
  const touch = buildFirstTouchPayload({
    url:
      'https://opsapp.co/' + '路'.repeat(1800) +
      '?utm_source=' + encodeURIComponent('源'.repeat(500)) +
      '&utm_campaign=' + encodeURIComponent('春'.repeat(500)) +
      '&gclid=' + 'x'.repeat(900),
    referrer: 'https://google.ca/search?q=private',
    capturedAt: NOW,
    anonymousId: ANONYMOUS_ID,
  });
  assert.ok(touch);

  const encoded = encodeFirstTouchPayload(touch);
  assert.ok(encoded.length <= FIRST_TOUCH_MAX_ENCODED_BYTES);
  const parsed = parseFirstTouchValue(encoded);
  assert.ok(parsed);
  assert.equal(parsed.anonymous_id, ANONYMOUS_ID);
  assert.ok(parsed.landing_path.startsWith('/'));
});
