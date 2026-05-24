'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useLocale } from '@/i18n/client';
import { COOKIE_NAME, COOKIE_MAX_AGE } from '@/i18n/config';
import type { Dictionary } from '@/i18n/types';

interface LanguageBannerProps {
  commonDict: Dictionary;
}

function spanishUrl(pathname: string): string {
  const stripped = pathname === '/es' ? '/' : pathname.startsWith('/es/') ? pathname.slice(3) : pathname;
  return stripped === '/' ? '/es' : `/es${stripped}`;
}

export default function LanguageBanner({ commonDict }: LanguageBannerProps) {
  const { locale } = useLocale();
  const pathname = usePathname();
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Only show on first visit (no cookie set yet means locale came from default)
    // Check if the user's browser prefers Spanish
    const cookieExists = document.cookie.includes(`${COOKIE_NAME}=`);
    if (cookieExists) return;

    const browserLang = navigator.language || '';
    if (browserLang.startsWith('es')) {
      setShow(true);
    }
  }, []);

  if (!show || locale === 'es') return null;

  const handleSwitch = () => {
    setShow(false);
    // Navigate to the Spanish-prefixed equivalent of the current URL.
    // Middleware will set the ops-lang cookie when the request lands.
    window.location.href = spanishUrl(pathname);
  };

  const handleDismiss = () => {
    setShow(false);
    // Pin the user to English so the banner never returns.
    document.cookie = `${COOKIE_NAME}=en;path=/;max-age=${COOKIE_MAX_AGE};samesite=lax`;
  };

  return (
    <div className="fixed top-16 left-0 right-0 z-30 bg-ops-surface border-b border-ops-border">
      <div className="max-w-[1400px] mx-auto px-6 md:px-10 py-2.5 flex items-center justify-between">
        <p className="font-body text-sm text-ops-text-secondary">
          {String(commonDict['banner.message'] || 'This site is available in')}{' '}
          <button
            onClick={handleSwitch}
            className="text-ops-text-primary underline underline-offset-2 cursor-pointer font-normal hover:text-ops-accent transition-colors"
          >
            {String(commonDict['banner.language'] || 'Spanish')}
          </button>
        </p>
        <button
          onClick={handleDismiss}
          className="text-ops-text-secondary hover:text-ops-text-primary transition-colors cursor-pointer p-1"
          aria-label={String(commonDict['banner.dismiss'] || 'Dismiss')}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M4 4l8 8M12 4l-8 8" />
          </svg>
        </button>
      </div>
    </div>
  );
}
