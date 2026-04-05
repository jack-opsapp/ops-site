/**
 * Tailored page — Custom build packages, pricing, Stripe deposit checkout
 */

import type { Metadata } from 'next';
import { getLocale, getTDict } from '@/i18n/server';
import { TailoredPageContent } from '@/components/tailored/TailoredPageContent';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  return {
    title: locale === 'es'
      ? 'OPS A Medida — Software Personalizado Para Tu Oficio'
      : 'OPS Tailored — Custom Software For Your Trade',
    description: locale === 'es'
      ? 'Construimos modulos personalizados para tu negocio sobre la plataforma OPS. Paquetes desde $3,000. Construido por un contratista, para contratistas.'
      : 'We build custom modules for your business on the OPS platform. Packages from $3,000. Built by a contractor, for contractors.',
    alternates: {
      canonical: 'https://opsapp.co/tailored',
    },
  };
}

export default async function TailoredPage() {
  const dict = await getTDict('tailored');

  return <TailoredPageContent dict={dict} />;
}
