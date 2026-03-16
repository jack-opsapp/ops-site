import type { Metadata } from 'next';
import Hero from '@/components/home/Hero';
import PainPoints from '@/components/home/PainPoints';
import PlatformShowcase from '@/components/home/PlatformShowcase';
import Starburst from '@/components/home/Starburst';
import SocialProof from '@/components/home/SocialProof';
import WhatIsOps from '@/components/home/WhatIsOps';
import TradesList from '@/components/home/TradesList';
import JournalPreview from '@/components/home/JournalPreview';
import FinalCTA from '@/components/home/FinalCTA';
import { getLocale } from '@/i18n/server';

export const revalidate = 300; // ISR: 5 min for blog data

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  return {
    title: locale === 'es'
      ? 'OPS — Gestión de Trabajo para Negocios de Servicio y Equipos de Campo'
      : 'OPS — Job Management for Service-Based Businesses and Field Crews',
    description: locale === 'es'
      ? 'La app de gestión de trabajo que tu equipo realmente usará. Programación de equipos, seguimiento de proyectos, documentación fotográfica. Construida por un profesional del oficio. Gratis para empezar.'
      : 'The job management app your crew will actually use. Crew scheduling, project tracking, photo documentation. Built by a tradesperson who scaled to $1.6M. Free to start.',
    alternates: {
      canonical: 'https://opsapp.co',
    },
  };
}

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": "OPS",
            "applicationCategory": "BusinessApplication",
            "operatingSystem": "iOS, Web",
            "url": "https://opsapp.co",
            "description": "Field-first job management app for service-based businesses and trades crews. Track projects, schedule crews, document with photos, manage clients and invoicing. No training required — your crew opens it and knows what to do.",
            "offers": {
              "@type": "AggregateOffer",
              "lowPrice": "0",
              "highPrice": "190",
              "priceCurrency": "USD",
              "offerCount": "4"
            },
            "creator": {
              "@type": "Organization",
              "name": "OPS",
              "url": "https://opsapp.co"
            },
            "featureList": "Project Management, Crew Scheduling, Photo Documentation and Markup, Job Board, Client Management, Invoicing, Pipeline Tracking, Inventory Management, Offline Mode"
          })
        }}
      />
      <Hero />
      <PainPoints />
      <PlatformShowcase />
      <Starburst />
      <SocialProof />
      <WhatIsOps />
      <TradesList />
      <JournalPreview />
      <FinalCTA />
    </>
  );
}
