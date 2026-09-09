/**
 * Tests for the attribution cookie's DOMAIN SCOPE (Unified Attribution P2).
 *
 * The middleware already captured first-touch attribution into `ops_attribution`
 * and SPEC checkout already read it. The defect was narrower and invisible:
 * the cookie was written HOST-ONLY on opsapp.co, so it was never sent to
 * app.opsapp.co — where the app needs it to attribute a signup.
 *
 * Scoping it to `.opsapp.co` is the entire handoff. These tests pin that
 * attribute so it cannot silently regress, and pin the first-touch semantics
 * that must survive the change.
 *
 * Runner: node:test via `npm test` (tsx --test src/lib/__tests__/*.test.ts).
 */

import { describe, it, afterEach } from 'node:test';
import assert from 'node:assert/strict';

import {
  ATTRIBUTION_COOKIE_NAME,
  ATTRIBUTION_MAX_AGE_SECONDS,
  maybeBuildFirstTouchPayload,
  readAttributionCookie,
  writeAttributionCookie,
  type OpsAttribution,
} from '../spec/attribution';

// ─── Minimal NextResponse stand-in ───────────────────────────────────────────

interface CookieSetCall {
  name: string;
  value: string;
  domain?: string;
  maxAge?: number;
  sameSite?: string;
  path?: string;
  httpOnly?: boolean;
  secure?: boolean;
}

function fakeResponse() {
  const calls: CookieSetCall[] = [];
  return {
    calls,
    cookies: {
      set(opts: CookieSetCall) {
        calls.push(opts);
      },
    },
  };
}

const ORIGINAL_ENV = process.env.NODE_ENV;

// `process.env` is a special object that rejects defineProperty, so assign
// through a widened view of it instead.
const env = process.env as Record<string, string | undefined>;

afterEach(() => {
  env.NODE_ENV = ORIGINAL_ENV;
});

function setNodeEnv(value: string): void {
  env.NODE_ENV = value;
}

// ─── Domain scope ────────────────────────────────────────────────────────────

describe('writeAttributionCookie — domain scope', () => {
  it('scopes to .opsapp.co in production so app.opsapp.co receives it', () => {
    // THE fix. A host-only cookie on opsapp.co is never sent to the app, so
    // the marketing-site → signup attribution handoff captured nothing.
    setNodeEnv('production');
    const res = fakeResponse();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    writeAttributionCookie(res as any, { landing_url: '/plans', first_touch_at: '2026-08-06T00:00:00.000Z' });
    assert.equal(res.calls[0].domain, '.opsapp.co');
  });

  it('omits the domain outside production so localhost still works', () => {
    // A dotted opsapp.co domain is rejected by the browser on localhost.
    setNodeEnv('development');
    const res = fakeResponse();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    writeAttributionCookie(res as any, { landing_url: '/plans', first_touch_at: '2026-08-06T00:00:00.000Z' });
    assert.equal(res.calls[0].domain, undefined);
  });

  it('keeps the existing cookie contract otherwise', () => {
    setNodeEnv('production');
    const res = fakeResponse();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    writeAttributionCookie(res as any, { utm_source: 'google', landing_url: '/', first_touch_at: '2026-08-06T00:00:00.000Z' });
    const c = res.calls[0];
    assert.equal(c.name, ATTRIBUTION_COOKIE_NAME);
    assert.equal(c.maxAge, ATTRIBUTION_MAX_AGE_SECONDS);
    assert.equal(ATTRIBUTION_MAX_AGE_SECONDS, 30 * 24 * 60 * 60);
    assert.equal(c.sameSite, 'lax');
    assert.equal(c.path, '/');
    // Not HttpOnly: client analytics scripts dedupe against it.
    assert.equal(c.httpOnly, false);
    assert.equal(c.secure, true);
  });

  it('writes the canonical versioned payload as JSON', () => {
    // The shared `__ops_first_touch` shape: versioned, identified, with a
    // canonical landing path — the same JSON app.opsapp.co parses.
    setNodeEnv('production');
    const res = fakeResponse();
    const payload: OpsAttribution = {
      utm_source: 'google',
      gclid: 'Cj0KCQ',
      landing_url: '/plans',
      first_touch_at: '2026-08-06T00:00:00.000Z',
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    writeAttributionCookie(res as any, payload);
    const written = JSON.parse(res.calls[0].value);
    assert.equal(written.version, 1);
    assert.match(written.anonymous_id, /^[0-9a-f-]{36}$/i);
    assert.equal(written.captured_at, '2026-08-06T00:00:00.000Z');
    assert.equal(written.landing_path, '/plans');
    assert.equal(written.utm_source, 'google');
    assert.equal(written.gclid, 'Cj0KCQ');
  });

  it('writes nothing when the payload has no landing path to anchor a first touch', () => {
    setNodeEnv('production');
    const res = fakeResponse();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    writeAttributionCookie(res as any, { first_touch_at: '2026-08-06T00:00:00.000Z' });
    assert.equal(res.calls.length, 0);
  });
});

// ─── First-touch semantics must survive the scope change ─────────────────────

describe('maybeBuildFirstTouchPayload — first touch wins', () => {
  it('captures UTM params and click ids on a first visit', () => {
    const p = maybeBuildFirstTouchPayload(
      new URL('https://opsapp.co/plans?utm_source=google&utm_medium=cpc&gclid=Cj0KCQ'),
      {}
    );
    assert.ok(p);
    assert.equal(p!.utm_source, 'google');
    assert.equal(p!.utm_medium, 'cpc');
    assert.equal(p!.gclid, 'Cj0KCQ');
    // Path only: the query string (and anything private in it) never lands in the cookie.
    assert.equal(p!.landing_url, '/plans');
    assert.ok(p!.first_touch_at);
  });

  it('does NOT overwrite an existing first touch', () => {
    // Credit belongs to whatever brought them in, not the last page touched.
    const existing: OpsAttribution = {
      utm_source: 'google',
      first_touch_at: '2026-08-01T00:00:00.000Z',
    };
    const p = maybeBuildFirstTouchPayload(
      new URL('https://opsapp.co/?utm_source=facebook'),
      existing
    );
    assert.equal(p, null);
  });

  it('records an untagged first visit so later visits cannot claim credit', () => {
    const p = maybeBuildFirstTouchPayload(new URL('https://opsapp.co/'), {});
    assert.ok(p);
    assert.equal(p!.landing_url, '/');
    assert.equal(p!.utm_source, undefined);
  });
});

// ─── Google click id variants ────────────────────────────────────────────────

describe('gbraid / wbraid — all three writers agree', () => {
  it('captures gbraid and wbraid from the landing URL', () => {
    const payload = maybeBuildFirstTouchPayload(
      new URL('https://opsapp.co/plans?gbraid=brand-1&wbraid=web-1'),
      {},
    );
    assert.equal(payload?.gbraid, 'brand-1');
    assert.equal(payload?.wbraid, 'web-1');
    assert.equal(payload?.gclid, undefined);
  });

  it('round-trips gbraid and wbraid through the written cookie', () => {
    setNodeEnv('production');
    const res = fakeResponse();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    writeAttributionCookie(res as any, {
      gbraid: 'brand-1',
      wbraid: 'web-1',
      landing_url: '/plans',
      first_touch_at: '2026-09-01T00:00:00.000Z',
    });
    const written = res.calls[0];
    const read = readAttributionCookie({
      get: (name: string) => (name === written.name ? { value: written.value } : undefined),
    });
    assert.equal(read.gbraid, 'brand-1');
    assert.equal(read.wbraid, 'web-1');
    assert.equal(read.landing_url, '/plans');
  });
});
