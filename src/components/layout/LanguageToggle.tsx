'use client';

import { useLocale } from '@/i18n/client';

export default function LanguageToggle() {
  const { locale, setLocale } = useLocale();

  return (
    <div className="flex items-center gap-1 font-caption text-[10px] uppercase tracking-[0.1em]">
      <button
        onClick={() => setLocale('en')}
        className={`transition-colors cursor-pointer ${
          locale === 'en'
            ? 'text-ops-text-primary'
            : 'text-ops-text-secondary hover:text-ops-text-primary'
        }`}
      >
        EN
      </button>
      <span className="text-ops-text-secondary">|</span>
      <button
        onClick={() => setLocale('es')}
        className={`transition-colors cursor-pointer ${
          locale === 'es'
            ? 'text-ops-text-primary'
            : 'text-ops-text-secondary hover:text-ops-text-primary'
        }`}
      >
        ES
      </button>
    </div>
  );
}
