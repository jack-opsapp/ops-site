import { cookies, headers } from 'next/headers';
import type { Locale, Namespace, Dictionary } from './types';
import { defaultLocale, supportedLocales, COOKIE_NAME } from './config';

/**
 * Read the current locale from request context.
 *
 *   1. `x-locale` header (set by middleware on every matched request)
 *   2. `ops-lang` cookie (fallback for any context the middleware misses)
 *   3. Default locale
 *
 * Calling this in a Server Component / generateMetadata opts the route
 * into dynamic rendering — that's intentional, since locale varies by
 * URL prefix. English pages stay statically optimized because the
 * default branch returns immediately.
 */
export async function getLocale(): Promise<Locale> {
  try {
    const h = await headers();
    const headerLocale = h.get('x-locale');
    if (headerLocale && supportedLocales.includes(headerLocale as Locale)) {
      return headerLocale as Locale;
    }
  } catch {
    // headers() may throw in non-request contexts (e.g. build-time prerender) —
    // fall through to the cookie / default path.
  }

  try {
    const cookieStore = await cookies();
    const raw = cookieStore.get(COOKIE_NAME)?.value;
    if (raw && supportedLocales.includes(raw as Locale)) {
      return raw as Locale;
    }
  } catch {
    // ignore
  }

  return defaultLocale;
}

/**
 * Read the original request pathname (set by middleware). Useful for
 * generating locale alternates without each page passing its own path in.
 */
export async function getPathname(): Promise<string> {
  try {
    const h = await headers();
    return h.get('x-pathname') ?? '/';
  } catch {
    return '/';
  }
}

/**
 * Routes that have fully-translated Spanish content (page chrome AND body).
 *
 * Routes NOT in this set serve English even when reached via /es/<path>:
 *  - /journal/*  blog posts live in Supabase with a single `content` field
 *  - /industries/*  data file has optional `content.es?` that nobody populated
 *  - /compare/*    same — `content.es?` exists but is unused
 *  - /tools/leadership   page body hardcodes English copy (only metadata is bilingual)
 *  - /legal       documents are intentionally English-only
 *
 * For untranslated routes:
 *  - sitemap.ts does not emit a /es/<path> entry
 *  - buildLocaleAlternates() drops the languages map so hreflang doesn't
 *    advertise a Spanish version that isn't really Spanish
 *  - middleware.ts redirects /es/<path> → /<path> so the URL doesn't pretend
 *
 * Add a route here only when its page body renders in Spanish end-to-end.
 */
export const TRANSLATED_PATHS: ReadonlySet<string> = new Set([
  '/',
  '/platform',
  '/plans',
  '/company',
  '/resources',
  '/tools',
  '/shop',
]);

export function hasSpanishContent(path: string): boolean {
  return TRANSLATED_PATHS.has(path);
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
  const base = 'https://opsapp.co';
  const cleanPath = path === '/' ? '' : path;
  const enUrl = `${base}${cleanPath}` || base;
  const esUrl = `${base}/es${cleanPath}`;

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
  const base = 'https://opsapp.co';
  const cleanPath = path === '/' ? '' : path;
  if (locale === 'es') return `${base}/es${cleanPath}`;
  return `${base}${cleanPath}` || base;
}

/**
 * Dynamically import a dictionary JSON file for the given locale + namespace.
 */
async function loadDictionary(locale: Locale, namespace: Namespace): Promise<Dictionary> {
  const mod = await import(`./dictionaries/${locale}/${namespace}.json`);
  return (mod.default ?? mod) as Dictionary;
}

/**
 * Get the full dictionary object for a namespace (Server Components).
 */
export async function getTDict(namespace: Namespace): Promise<Dictionary> {
  const locale = await getLocale();
  return loadDictionary(locale, namespace);
}

/**
 * Get a translation function for a namespace (Server Components).
 */
export async function getT(namespace: Namespace): Promise<(key: string) => string> {
  const dict = await getTDict(namespace);
  return (key: string) => {
    const value = dict[key];
    if (typeof value === 'string') return value;
    return key;
  };
}
