/**
 * Locale routing rules — pure, dependency-free, safe in the Edge runtime.
 *
 * URL structure:
 *   - English (default): /foo            → src/app/(en)/foo
 *   - Spanish:           /es/foo         → src/app/(es)/es/foo
 *                        only for routes in TRANSLATED_PATHS
 *
 * The locale of a page is a function of its URL alone. Middleware, pages,
 * metadata and the sitemap all read these rules; nothing reads the locale
 * from request headers or cookies during render, so every page can be
 * statically rendered.
 */

import type { Locale } from './types';

const SITE_ORIGIN = 'https://opsapp.co';

/**
 * Routes that have fully-translated Spanish content (page chrome AND body).
 *
 * Routes NOT in this set serve English even when reached via /es/<path>:
 *  - /journal/*  blog posts live in Supabase with a single `content` field
 *  - /industries/*  data file has optional `content.es?` that nobody populated
 *  - /compare/*    same — `content.es?` exists but is unused
 *  - /tools/leadership   page body hardcodes English copy
 *  - /legal       documents are intentionally English-only
 *
 * For untranslated routes:
 *  - sitemap.ts does not emit a /es/<path> entry
 *  - buildLocaleAlternates() drops the languages map so hreflang doesn't
 *    advertise a Spanish version that isn't really Spanish
 *  - middleware.ts redirects /es/<path> → /<path> so the URL doesn't pretend
 *
 * Each path here has a page under src/app/(es)/es/ and a test keeps the two
 * in lockstep. Add a route only when its page body renders in Spanish
 * end-to-end.
 */
export const TRANSLATED_PATHS: ReadonlySet<string> = new Set([
  '/',
  '/platform',
  '/plans',
  '/spec',
  '/company',
  '/resources',
  '/tools',
  '/shop',
]);

export function hasSpanishContent(path: string): boolean {
  return TRANSLATED_PATHS.has(path);
}

/**
 * What middleware does with a request, given its pathname and the
 * `ops-lang` cookie.
 *
 *   - /es/<translated path>   → serve it (Spanish); middleware persists ops-lang=es
 *   - /es/<untranslated path> → 308 to the English URL (no Spanish version exists)
 *   - /<translated path> with ops-lang=es → 308 to /es/<path>
 *   - everything else         → serve it (English)
 */
export type LocaleRouteDecision =
  | { kind: 'redirect'; pathname: string }
  | { kind: 'spanish' }
  | { kind: 'default' };

export function resolveLocaleRoute(
  pathname: string,
  cookieLocale: string | undefined,
): LocaleRouteDecision {
  if (pathname === '/es' || pathname.startsWith('/es/')) {
    const internalPath = pathname === '/es' ? '/' : pathname.slice(3);
    return hasSpanishContent(internalPath)
      ? { kind: 'spanish' }
      : { kind: 'redirect', pathname: internalPath };
  }

  if (cookieLocale === 'es' && hasSpanishContent(pathname)) {
    return { kind: 'redirect', pathname: pathname === '/' ? '/es' : `/es${pathname}` };
  }

  return { kind: 'default' };
}

/**
 * Build canonical + hreflang alternates for a given page path and locale.
 *
 * - `path`            — the canonical English path (e.g. '/platform').
 * - `currentLocale`   — drives which URL becomes the canonical for this
 *                       specific render. Each translated locale's page
 *                       has its own canonical pointing back at itself;
 *                       untranslated routes always canonicalize to English.
 *
 * Output shape matches Next.js's `alternates` metadata field. For
 * untranslated routes we deliberately omit `languages` so Google never
 * sees an hreflang declaring a Spanish version that doesn't exist.
 */
export function buildLocaleAlternates(path: string, currentLocale: Locale) {
  const cleanPath = path === '/' ? '' : path;
  const enUrl = `${SITE_ORIGIN}${cleanPath}` || SITE_ORIGIN;
  const esUrl = `${SITE_ORIGIN}/es${cleanPath}`;

  if (!hasSpanishContent(path)) {
    return {
      canonical: enUrl,
    };
  }

  return {
    canonical: currentLocale === 'es' ? esUrl : enUrl,
    languages: {
      en: enUrl,
      es: esUrl,
      'x-default': enUrl,
    },
  };
}

/**
 * Build a fully-qualified URL for a given path in a given locale.
 * Helper for openGraph.url, structured data, etc.
 */
export function buildLocaleUrl(path: string, locale: Locale): string {
  const cleanPath = path === '/' ? '' : path;
  if (locale === 'es') return `${SITE_ORIGIN}/es${cleanPath}`;
  return `${SITE_ORIGIN}${cleanPath}` || SITE_ORIGIN;
}
