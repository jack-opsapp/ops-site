'use client';

import { usePathname } from 'next/navigation';
import { useLocale } from '@/i18n/client';

/**
 * Build the URL for the requested locale starting from the current pathname.
 *
 *   - Stripping any existing /es prefix first ensures consecutive
 *     toggles always land on the right URL.
 *   - Spanish targets prefix with /es; English targets drop the prefix.
 */
function buildLocaleUrl(pathname: string, targetLocale: 'en' | 'es'): string {
  const stripped = pathname === '/es' ? '/' : pathname.startsWith('/es/') ? pathname.slice(3) : pathname;
  if (targetLocale === 'es') {
    return stripped === '/' ? '/es' : `/es${stripped}`;
  }
  return stripped;
}

export default function LanguageToggle() {
  const { locale } = useLocale();
  const pathname = usePathname();

  const enUrl = buildLocaleUrl(pathname, 'en');
  const esUrl = buildLocaleUrl(pathname, 'es');

  return (
    <div className="flex items-center gap-1 font-caption text-[10px] uppercase tracking-[0.1em]">
      <a
        href={enUrl}
        className={`transition-colors cursor-pointer ${
          locale === 'en'
            ? 'text-ops-text-primary'
            : 'text-ops-text-secondary hover:text-ops-text-primary'
        }`}
      >
        EN
      </a>
      <span className="text-ops-text-secondary">|</span>
      <a
        href={esUrl}
        className={`transition-colors cursor-pointer ${
          locale === 'es'
            ? 'text-ops-text-primary'
            : 'text-ops-text-secondary hover:text-ops-text-primary'
        }`}
      >
        ES
      </a>
    </div>
  );
}
