/**
 * Locale routing — the pure rules shared by middleware, pages and the
 * sitemap. The locale of a page is a function of its URL alone; these
 * tests pin that function and the SEO helpers built on it.
 *
 * Runner: node:test via `npx tsx --test $(find src -name '*.test.ts*')`.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  TRANSLATED_PATHS,
  buildLocaleAlternates,
  buildLocaleUrl,
  hasSpanishContent,
  resolveLocaleRoute,
} from '../routes';

describe('TRANSLATED_PATHS', () => {
  it('lists exactly the routes with Spanish page bodies', () => {
    assert.deepEqual(
      [...TRANSLATED_PATHS].sort(),
      ['/', '/company', '/plans', '/platform', '/resources', '/shop', '/spec', '/tools'],
    );
  });

  it('treats sub-paths of translated routes as untranslated', () => {
    assert.equal(hasSpanishContent('/platform'), true);
    assert.equal(hasSpanishContent('/spec/checkout/abc'), false);
    assert.equal(hasSpanishContent('/tools/leadership'), false);
    assert.equal(hasSpanishContent('/journal'), false);
  });
});

describe('resolveLocaleRoute', () => {
  const cases: Array<[string, string | undefined, ReturnType<typeof resolveLocaleRoute>]> = [
    // Spanish-prefixed URLs
    ['/es', undefined, { kind: 'spanish' }],
    ['/es/platform', undefined, { kind: 'spanish' }],
    ['/es/platform', 'en', { kind: 'spanish' }],
    ['/es/journal', undefined, { kind: 'redirect', pathname: '/journal' }],
    ['/es/journal/some-post', 'es', { kind: 'redirect', pathname: '/journal/some-post' }],
    ['/es/industries/plumbing', undefined, { kind: 'redirect', pathname: '/industries/plumbing' }],
    ['/es/spec/checkout/abc', undefined, { kind: 'redirect', pathname: '/spec/checkout/abc' }],
    ['/es/es/platform', undefined, { kind: 'redirect', pathname: '/es/platform' }],
    // Unprefixed URLs with the Spanish cookie
    ['/', 'es', { kind: 'redirect', pathname: '/es' }],
    ['/platform', 'es', { kind: 'redirect', pathname: '/es/platform' }],
    ['/journal', 'es', { kind: 'default' }],
    ['/tools/leadership', 'es', { kind: 'default' }],
    // Everything else is English
    ['/', undefined, { kind: 'default' }],
    ['/platform', 'en', { kind: 'default' }],
    ['/platform', 'fr', { kind: 'default' }],
    ['/esp', 'es', { kind: 'default' }],
    ['/espresso', undefined, { kind: 'default' }],
  ];

  for (const [pathname, cookie, expected] of cases) {
    it(`${pathname} with cookie ${cookie ?? '(none)'}`, () => {
      assert.deepEqual(resolveLocaleRoute(pathname, cookie), expected);
    });
  }
});

describe('buildLocaleAlternates', () => {
  it('cross-links both locales for a translated route', () => {
    const languages = {
      en: 'https://opsapp.co/platform',
      es: 'https://opsapp.co/es/platform',
      'x-default': 'https://opsapp.co/platform',
    };
    assert.deepEqual(buildLocaleAlternates('/platform', 'en'), {
      canonical: 'https://opsapp.co/platform',
      languages,
    });
    assert.deepEqual(buildLocaleAlternates('/platform', 'es'), {
      canonical: 'https://opsapp.co/es/platform',
      languages,
    });
  });

  it('handles the home page', () => {
    assert.deepEqual(buildLocaleAlternates('/', 'es'), {
      canonical: 'https://opsapp.co/es',
      languages: {
        en: 'https://opsapp.co',
        es: 'https://opsapp.co/es',
        'x-default': 'https://opsapp.co',
      },
    });
  });

  it('never advertises a Spanish version of an untranslated route', () => {
    assert.deepEqual(buildLocaleAlternates('/journal/some-post', 'en'), {
      canonical: 'https://opsapp.co/journal/some-post',
    });
    assert.deepEqual(buildLocaleAlternates('/journal/some-post', 'es'), {
      canonical: 'https://opsapp.co/journal/some-post',
    });
  });
});

describe('buildLocaleUrl', () => {
  it('builds absolute URLs per locale', () => {
    assert.equal(buildLocaleUrl('/', 'en'), 'https://opsapp.co');
    assert.equal(buildLocaleUrl('/', 'es'), 'https://opsapp.co/es');
    assert.equal(buildLocaleUrl('/plans', 'en'), 'https://opsapp.co/plans');
    assert.equal(buildLocaleUrl('/plans', 'es'), 'https://opsapp.co/es/plans');
  });
});
