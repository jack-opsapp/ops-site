/**
 * Legal page — /legal
 *
 * Server component that reads `?page=` search param to select
 * the active legal document (terms | privacy | eula).
 * Light theme page with white background and dark text.
 */

import type { Metadata } from 'next';
import { Suspense } from 'react';
import { SectionLabel } from '@/components/ui';
import LegalTabs from '@/components/legal/LegalTabs';
import LegalContent from '@/components/legal/LegalContent';
import { legalDocuments } from '@/lib/legal-content';
import { getLocale, getTDict } from '@/i18n/server';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  return {
    title: 'Legal',
    description: locale === 'es'
      ? 'Términos de Servicio, Política de Privacidad, Acuerdo de Licencia de Usuario Final y Acuerdo de Procesamiento de Datos de OPS.'
      : 'OPS Terms of Service, Privacy Policy, End User License Agreement, and Data Processing Agreement.',
  };
}

const VALID_TABS = ['terms', 'privacy', 'eula', 'dpa'] as const;

export default async function LegalPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const params = await searchParams;
  const rawTab = params.page ?? 'terms';
  const activeTab = VALID_TABS.includes(rawTab as (typeof VALID_TABS)[number])
    ? rawTab
    : 'terms';

  const activeDocument = legalDocuments[activeTab];
  const dict = await getTDict('legal');
  const t = (key: string) => {
    const value = dict[key];
    return typeof value === 'string' ? value : key;
  };

  const englishOnlyNotice = t('englishOnlyNotice');

  return (
    <div className="bg-ops-background-light text-ops-text-dark min-h-screen">
      <div className="max-w-[900px] mx-auto px-6 pt-32 py-16 mb-16">
        <SectionLabel label={t('sectionLabel')} className="text-ops-text-secondary" />

        <Suspense fallback={null}>
          <LegalTabs activeTab={activeTab} legalDict={dict} />
        </Suspense>

        {englishOnlyNotice && (
          <p className="font-body text-sm text-ops-text-secondary italic mt-4 mb-2">
            {englishOnlyNotice}
          </p>
        )}

        <LegalContent document={activeDocument} />
      </div>
    </div>
  );
}
