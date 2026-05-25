/**
 * SPEC — Custom build packages, pricing, Stripe deposit checkout.
 *
 * Route: /spec (and /es/spec).
 *
 * Sticky scroll-driven 3D phone scene that morphs through five phases
 * (home → packages → analysis → building → custom). Three deposit
 * packages (Setup, Build, Enterprise) hit Stripe Checkout at
 * /api/spec/create-checkout-session.
 */

import type { Metadata } from 'next';
import { getLocale, getTDict, buildLocaleAlternates, buildLocaleUrl } from '@/i18n/server';
import { SpecPageContent } from '@/components/spec/SpecPageContent';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  return {
    title: locale === 'es'
      ? 'OPS SPEC — Software Personalizado Para Tu Oficio'
      : 'OPS SPEC — Custom Software For Your Trade',
    description: locale === 'es'
      ? 'Construimos módulos personalizados para tu negocio sobre la plataforma OPS. Paquetes desde $3,000. Construido por un contratista, para contratistas.'
      : 'We build custom modules for your business on the OPS platform. Packages from $3,000. Built by a contractor, for contractors.',
    openGraph: {
      url: buildLocaleUrl('/spec', locale),
    },
    alternates: buildLocaleAlternates('/spec', locale),
  };
}

export default async function SpecPage() {
  const dict = await getTDict('spec');

  /* JSON-LD — Product with three Offers (deposit prices), plus a
     breadcrumb trail. Lets search and AI agents understand SPEC as
     a discrete service offering with starting price points. */
  const productLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: 'OPS SPEC',
    description:
      'Custom modules built on the OPS platform — Setup, Build, and Enterprise packages. Built by a contractor, for contractors.',
    brand: { '@type': 'Brand', name: 'OPS' },
    url: 'https://opsapp.co/spec',
    offers: [
      {
        '@type': 'Offer',
        name: 'SPEC — Setup',
        price: '1500',
        priceCurrency: 'CAD',
        description: '$1,500 deposit on a $3,000 Setup package.',
        availability: 'https://schema.org/InStock',
      },
      {
        '@type': 'Offer',
        name: 'SPEC — Build',
        price: '4250',
        priceCurrency: 'CAD',
        description: '$4,250 deposit on a $8,500 Build package.',
        availability: 'https://schema.org/InStock',
      },
      {
        '@type': 'Offer',
        name: 'SPEC — Enterprise',
        price: '9000',
        priceCurrency: 'CAD',
        description: '$9,000 deposit on a $18,000 Enterprise package.',
        availability: 'https://schema.org/InStock',
      },
    ],
  };

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://opsapp.co' },
      { '@type': 'ListItem', position: 2, name: 'SPEC', item: 'https://opsapp.co/spec' },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      <SpecPageContent dict={dict} />
    </>
  );
}
