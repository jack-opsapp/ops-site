/**
 * LegalTabs — Client-side tab switcher for Terms / Privacy / EULA
 *
 * Reads and updates the `page` search param via shallow navigation.
 */

'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { Divider } from '@/components/ui';
import type { Dictionary } from '@/i18n/types';

const tabKeys = [
  { key: 'terms', dictKey: 'tab.terms', fallback: 'TERMS' },
  { key: 'privacy', dictKey: 'tab.privacy', fallback: 'PRIVACY' },
  { key: 'eula', dictKey: 'tab.eula', fallback: 'EULA' },
  { key: 'dpa', dictKey: 'tab.dpa', fallback: 'DPA' },
] as const;

interface LegalTabsProps {
  activeTab: string;
  legalDict?: Dictionary;
}

export default function LegalTabs({ activeTab, legalDict }: LegalTabsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const t = (key: string, fallback: string) => {
    if (!legalDict) return fallback;
    const value = legalDict[key];
    return typeof value === 'string' ? value : fallback;
  };

  const handleTabClick = (key: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', key);
    router.push(`/legal?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="mt-8">
      <div className="flex items-center gap-8">
        {tabKeys.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => handleTabClick(tab.key)}
            className={`font-caption uppercase text-[11px] tracking-[0.15em] pb-2 transition-colors duration-200 ${
              activeTab === tab.key
                ? 'text-ops-text-dark border-b-2 border-ops-accent'
                : 'text-ops-text-secondary hover:text-ops-text-dark'
            }`}
          >
            {t(tab.dictKey, tab.fallback)}
          </button>
        ))}
      </div>
      <Divider className="mt-0 bg-ops-text-dark/10" />
    </div>
  );
}
