import { cache } from 'react';
import type { Locale, Namespace, Dictionary } from './types';

export {
  TRANSLATED_PATHS,
  hasSpanishContent,
  buildLocaleAlternates,
  buildLocaleUrl,
} from './routes';

/**
 * Render-scoped locale.
 *
 * The locale is decided by the route, not the request: every page and
 * layout under src/app/(en) calls `setRequestLocale('en')` and every one
 * under src/app/(es) calls `setRequestLocale('es')` before rendering
 * anything that translates. Server components deeper in the tree read it
 * through `getLocale()` / `getTDict()`.
 *
 * `cache()` scopes the store to a single server render, so static
 * prerendering, ISR regeneration and concurrent requests never share it.
 * Nothing here touches headers() or cookies(), which is what lets pages
 * render statically.
 *
 * Pages set it as well as layouts because a client-side navigation to a
 * dynamic page renders the page segment without re-rendering its layout.
 */
const requestLocale = cache((): { current: Locale | null } => ({ current: null }));

export function setRequestLocale(locale: Locale): void {
  requestLocale().current = locale;
}

/**
 * The locale of the page being rendered. Throws when no layout or page set
 * it: a missing `setRequestLocale()` must fail loudly rather than render
 * the wrong language.
 *
 * generateMetadata() runs outside the page render; it takes its locale
 * explicitly and uses getDictionary(locale, namespace) instead.
 */
export async function getLocale(): Promise<Locale> {
  const locale = requestLocale().current;
  if (!locale) {
    throw new Error(
      '[i18n] getLocale() was called before setRequestLocale(). Every page.tsx and ' +
        'layout.tsx under src/app/(en) and src/app/(es) must call setRequestLocale() ' +
        'before rendering translated content.',
    );
  }
  return locale;
}

/**
 * Load a dictionary JSON file for an explicit locale + namespace.
 */
export async function getDictionary(locale: Locale, namespace: Namespace): Promise<Dictionary> {
  const mod = await import(`./dictionaries/${locale}/${namespace}.json`);
  return (mod.default ?? mod) as Dictionary;
}

/**
 * Get the full dictionary object for a namespace in the current page's
 * locale (Server Components).
 */
export async function getTDict(namespace: Namespace): Promise<Dictionary> {
  const locale = await getLocale();
  return getDictionary(locale, namespace);
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
