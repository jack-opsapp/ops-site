import type { Metadata } from 'next';
import Hero from '@/components/home/Hero';
import PainPoints from '@/components/home/PainPoints';
import PlatformShowcase from '@/components/home/PlatformShowcase';
import Starburst from '@/components/home/Starburst';
import SocialProof from '@/components/home/SocialProof';
import JournalPreview from '@/components/home/JournalPreview';
import FinalCTA from '@/components/home/FinalCTA';
import { getLocale } from '@/i18n/server';

export const revalidate = 300; // ISR: 5 min for blog data

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  return {
    title: locale === 'es'
      ? 'OPS — Sistema Operativo de Proyectos'
      : 'OPS — Operational Project System',
    description: locale === 'es'
      ? 'Dirige tu operación. Hecho para los oficios.'
      : 'Run your operation. Built for the trades.',
  };
}

export default function HomePage() {
  return (
    <>
      <Hero />
      <PainPoints />
      <PlatformShowcase />
      <Starburst />
      <SocialProof />
      <JournalPreview />
      <FinalCTA />
    </>
  );
}
