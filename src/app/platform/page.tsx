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
import { getLocale, getTDict } from '@/i18n/server';
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
      ? 'Gestión de proyectos, programación de equipos, marcado de fotos, facturación, pipeline e inventario. Cada herramienta que un contratista necesita en una sola app. Sin entrenamiento.'
      : 'Project management, crew scheduling, photo markup, invoicing, pipeline, and inventory. Every tool a trades business needs in one app. No training required. See how OPS compares to Jobber and ServiceTitan.',
    alternates: {
      canonical: 'https://opsapp.co/platform',
    },
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

  return (
    <>
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
