export type { Locale, Namespace, Dictionary } from './types';
export { defaultLocale, supportedLocales, COOKIE_NAME, COOKIE_MAX_AGE } from './config';
export { getLocale, getTDict, getT, getDictionary, setRequestLocale } from './server';
export { LanguageProvider, useLocale, useT } from './client';
