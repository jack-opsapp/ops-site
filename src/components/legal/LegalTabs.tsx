/**
 * LegalTabs — Client-side tab switcher for Terms / Privacy / EULA
 *
 * Reads and updates the `page` search param via shallow navigation.
 * Kosugi caps, 11px, tracked — matches CategoryFilter pattern.
 */

'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { Divider } from '@/components/ui';

const tabs = [
  { key: 'terms', label: 'TERMS' },
  { key: 'privacy', label: 'PRIVACY' },
  { key: 'eula', label: 'EULA' },
  { key: 'dpa', label: 'DPA' },
] as const;

interface LegalTabsProps {
  activeTab: string;
}

export default function LegalTabs({ activeTab }: LegalTabsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleTabClick = (key: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', key);
    router.push(`/legal?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="mt-8">
      <div className="flex items-center gap-8">
        {tabs.map((tab) => (
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
            {tab.label}
          </button>
        ))}
      </div>
      <Divider className="mt-0 bg-ops-text-dark/10" />
    </div>
  );
}
