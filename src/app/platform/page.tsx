/**
 * Platform page — Feature deep-dive with alternating FeatureBlocks,
 * competitor comparison table, and bottom CTA.
 */

import type { Metadata } from 'next';
import PlatformHero from '@/components/platform/PlatformHero';
import FeatureBlock from '@/components/platform/FeatureBlock';
import ComparisonSection from '@/components/platform/ComparisonSection';
import BottomCTA from '@/components/shared/BottomCTA';
import { Divider } from '@/components/ui';
import { getLocale, getTDict, buildLocaleAlternates, buildLocaleUrl } from '@/i18n/server';
import {
  ProjectManagementIllustration,
  SchedulingIllustration,
  TeamManagementIllustration,
  ClientManagementIllustration,
  InvoicingIllustration,
  JobBoardIllustration,
  PipelineIllustration,
  InventoryIllustration,
  PhotoMarkupIllustration,
} from '@/components/platform/PlatformIllustrations';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const dict = await getTDict('platform');
  const t = (key: string, fallback: string) => {
    const value = dict[key];
    return typeof value === 'string' ? value : fallback;
  };
  return {
    title: locale === 'es' ? 'Plataforma — Funciones de OPS' : 'Platform — OPS Features',
    description: locale === 'es'
      ? 'Gestión de proyectos, programación, fotos, facturación, pipeline e inventario. Todo lo que tu equipo necesita en una app. Sin entrenamiento.'
      : 'Project tracking, crew scheduling, photo markup, invoicing, pipeline, and inventory. One app your crew actually opens. No training required.',
    openGraph: {
      url: buildLocaleUrl('/platform', locale),
    },
    alternates: buildLocaleAlternates('/platform', locale),
  };
}

export default async function PlatformPage() {
  const dict = await getTDict('platform');
  const t = (key: string) => {
    const value = dict[key];
    return typeof value === 'string' ? value : key;
  };

  const featureBlocks = [
    { key: 'projectManagement', direction: 'left' as const, visual: <ProjectManagementIllustration /> },
    { key: 'scheduling', direction: 'right' as const, visual: <SchedulingIllustration /> },
    { key: 'teamManagement', direction: 'left' as const, visual: <TeamManagementIllustration /> },
    { key: 'clientManagement', direction: 'right' as const, visual: <ClientManagementIllustration /> },
    { key: 'invoicing', direction: 'left' as const, inDevelopment: true, visual: <InvoicingIllustration /> },
    { key: 'jobBoard', direction: 'right' as const, visual: <JobBoardIllustration /> },
    { key: 'pipeline', direction: 'left' as const, inDevelopment: true, visual: <PipelineIllustration /> },
    { key: 'inventory', direction: 'right' as const, inDevelopment: true, visual: <InventoryIllustration /> },
    { key: 'photoMarkup', direction: 'left' as const, visual: <PhotoMarkupIllustration /> },
  ];

  /* JSON-LD structured data — SoftwareApplication describing the platform's
     feature set, plus a breadcrumb trail for hierarchical context. */
  const softwareApplicationLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'OPS',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'iOS, Web',
    url: 'https://opsapp.co/platform',
    description: 'Project tracking, crew scheduling, photo markup, invoicing, pipeline, and inventory — one app your crew actually opens.',
    featureList: featureBlocks.map((block) => t(`feature.${block.key}.label`)),
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
      description: 'Free to start. No credit card required.',
    },
  };

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://opsapp.co' },
      { '@type': 'ListItem', position: 2, name: 'Platform', item: 'https://opsapp.co/platform' },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareApplicationLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />

      <PlatformHero />

      {featureBlocks.map((block, i) => (
        <div key={block.key}>
          <FeatureBlock
            label={t(`feature.${block.key}.label`)}
            heading={t(`feature.${block.key}.heading`)}
            body={t(`feature.${block.key}.body`)}
            direction={block.direction}
            inDevelopment={'inDevelopment' in block && block.inDevelopment}
            visual={block.visual}
          />
          {i < featureBlocks.length - 1 && <Divider />}
        </div>
      ))}

      <ComparisonSection />

      <BottomCTA
        heading={t('bottomCta.heading')}
        buttonText={t('bottomCta.buttonText')}
        buttonHref="/plans"
      />
    </>
  );
}
