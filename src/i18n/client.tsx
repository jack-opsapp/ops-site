'use client';

import { createContext, useContext, useCallback, type ReactNode } from 'react';
import type { Locale, Dictionary } from './types';
import { defaultLocale, COOKIE_NAME, COOKIE_MAX_AGE } from './config';

interface LanguageContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
}

const LanguageContext = createContext<LanguageContextValue>({
  locale: defaultLocale,
  setLocale: () => {},
});

interface LanguageProviderProps {
  locale: Locale;
  children: ReactNode;
}

export function LanguageProvider({ locale, children }: LanguageProviderProps) {
  const setLocale = useCallback((newLocale: Locale) => {
    document.cookie = `${COOKIE_NAME}=${newLocale};path=/;max-age=${COOKIE_MAX_AGE};samesite=lax`;
    window.location.reload();
  }, []);

  return (
    <LanguageContext.Provider value={{ locale, setLocale }}>
      {children}
    </LanguageContext.Provider>
  );
}

/**
 * Get the current locale and setter from context (Client Components).
 */
export function useLocale() {
  return useContext(LanguageContext);
}

/**
 * Create a translation lookup from a pre-loaded dictionary (Client Components).
 * Pass the dictionary that was loaded server-side and passed via props.
 */
export function useT(dict: Dictionary): (key: string) => string {
  return useCallback(
    (key: string) => {
      const value = dict[key];
      if (typeof value === 'string') return value;
      return key;
    },
    [dict],
  );
}
