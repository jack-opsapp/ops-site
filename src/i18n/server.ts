import { cookies } from 'next/headers';
import type { Locale, Namespace, Dictionary } from './types';
import { defaultLocale, supportedLocales, COOKIE_NAME } from './config';

/**
 * Read the current locale from the ops-lang cookie (Server Components only).
 */
export async function getLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(COOKIE_NAME)?.value;
  if (raw && supportedLocales.includes(raw as Locale)) {
    return raw as Locale;
  }
  return defaultLocale;
}

/**
 * Dynamically import a dictionary JSON file for the given locale + namespace.
 */
async function loadDictionary(locale: Locale, namespace: Namespace): Promise<Dictionary> {
  const mod = await import(`./dictionaries/${locale}/${namespace}.json`);
  // Handle both bundler styles: { default: {...} } or direct object
  return (mod.default ?? mod) as Dictionary;
}

/**
 * Get the full dictionary object for a namespace (Server Components).
 * Use this when you need to pass multiple keys as props.
 */
export async function getTDict(namespace: Namespace): Promise<Dictionary> {
  const locale = await getLocale();
  return loadDictionary(locale, namespace);
}

/**
 * Get a translation function for a namespace (Server Components).
 * Returns a function t(key) that looks up a key in the dictionary.
 */
export async function getT(namespace: Namespace): Promise<(key: string) => string> {
  const dict = await getTDict(namespace);
  return (key: string) => {
    const value = dict[key];
    if (typeof value === 'string') return value;
    return key;
  };
}
