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

export const metadata: Metadata = {
  title: 'Legal',
  description:
    'OPS Terms of Service, Privacy Policy, End User License Agreement, and Data Processing Agreement.',
};

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

  return (
    <div className="bg-ops-background-light text-ops-text-dark min-h-screen">
      <div className="max-w-[900px] mx-auto px-6 pt-32 py-16 mb-16">
        <SectionLabel label="LEGAL" className="text-ops-text-secondary" />

        <Suspense fallback={null}>
          <LegalTabs activeTab={activeTab} />
        </Suspense>

        <LegalContent document={activeDocument} />
      </div>
    </div>
  );
}
