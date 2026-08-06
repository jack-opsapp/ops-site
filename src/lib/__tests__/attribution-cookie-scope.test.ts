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
    writeAttributionCookie(res as any, { first_touch_at: '2026-08-06T00:00:00.000Z' });
    assert.equal(res.calls[0].domain, '.opsapp.co');
  });

  it('omits the domain outside production so localhost still works', () => {
    // A dotted opsapp.co domain is rejected by the browser on localhost.
    setNodeEnv('development');
    const res = fakeResponse();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    writeAttributionCookie(res as any, { first_touch_at: '2026-08-06T00:00:00.000Z' });
    assert.equal(res.calls[0].domain, undefined);
  });

  it('keeps the existing cookie contract otherwise', () => {
    setNodeEnv('production');
    const res = fakeResponse();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    writeAttributionCookie(res as any, { utm_source: 'google' });
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

  it('round-trips the payload as URI-encoded JSON', () => {
    setNodeEnv('production');
    const res = fakeResponse();
    const payload: OpsAttribution = { utm_source: 'google', gclid: 'Cj0KCQ' };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    writeAttributionCookie(res as any, payload);
    assert.deepEqual(JSON.parse(decodeURIComponent(res.calls[0].value)), payload);
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
    assert.equal(p!.landing_url, '/plans?utm_source=google&utm_medium=cpc&gclid=Cj0KCQ');
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
