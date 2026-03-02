'use client';

import { useState, useEffect } from 'react';
import { useLocale } from '@/i18n/client';
import type { Dictionary } from '@/i18n/types';

interface LanguageBannerProps {
  commonDict: Dictionary;
}

export default function LanguageBanner({ commonDict }: LanguageBannerProps) {
  const { locale, setLocale } = useLocale();
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Only show on first visit (no cookie set yet means locale came from default)
    // Check if the user's browser prefers Spanish
    const cookieExists = document.cookie.includes('ops-lang=');
    if (cookieExists) return;

    const browserLang = navigator.language || '';
    if (browserLang.startsWith('es')) {
      setShow(true);
    }
  }, []);

  if (!show || locale === 'es') return null;

  const handleSwitch = () => {
    setShow(false);
    setLocale('es');
  };

  const handleDismiss = () => {
    setShow(false);
    // Set the cookie to 'en' so banner never returns
    setLocale('en');
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
