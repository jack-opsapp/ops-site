/**
 * SPEC — Custom build packages, pricing, OPS BOARD, Stripe deposit checkout.
 *
 * Route: /spec (and /es/spec).
 *
 * Sticky scroll-driven 3D phone scene that morphs through five phases
 * (home → packages → analysis → building → custom). Three deposit
 * packages (Setup, Build, Enterprise) hit Stripe Checkout at
 * /api/spec/create-checkout-session.
 *
 * Phase 1 additions:
 *   - OPS BOARD section between HowItWorks and Pricing
 *   - "Standing Behind The Work" section between WhatsIncluded and FAQ
 *   - FAQ rewritten as native <details>/<summary> + FAQPage JSON-LD
 *     so answers ship in the initial HTML payload (SEO + AI discovery)
 *   - 4-milestone PackageCard breakdown
 *   - Founder presence text in hero
 *
 * The OPS BOARD snapshot is fetched at request time via
 * lib/spec/board.ts → public.spec_public_board_snapshot. The downstream
 * client component handles all interactivity and the static fallback if
 * the snapshot is unavailable or stale.
 */

import type { Metadata } from 'next';
import { getLocale, getTDict, buildLocaleAlternates, buildLocaleUrl } from '@/i18n/server';
import { SpecPageContent } from '@/components/spec/SpecPageContent';
import { getSpecBoardSnapshot } from '@/lib/spec/board';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  return {
    title: locale === 'es'
      ? 'OPS SPEC — Software Personalizado Para Tu Oficio'
      : 'OPS SPEC — Custom Software For Your Trade',
    description: locale === 'es'
      ? 'Construimos módulos personalizados para tu negocio sobre la plataforma OPS. Paquetes desde $3,000, pagados en 4 hitos. Construido por los oficios, para los oficios.'
      : 'We build custom modules for your business on the OPS platform. Packages from $3,000, paid in 4 milestones. Built by trades, for trades.',
    openGraph: {
      url: buildLocaleUrl('/spec', locale),
    },
    alternates: buildLocaleAlternates('/spec', locale),
  };
}

interface FAQItem {
  question: string;
  answer: string;
}

export default async function SpecPage() {
  const rawDict = await getTDict('spec');
  // Phase 0 safety — until SPEC_LIVE_DEPOSITS_ENABLED flips to 'true',
  // Pay Deposit buttons render as "Talk to the founder" links pointing
  // at the contact form. The Stripe route returns 503 on the API side.
  const depositsEnabled = process.env.SPEC_LIVE_DEPOSITS_ENABLED === 'true';

  // Strip deposit-claim copy from the dict before it lands in the RSC
  // hydration payload. Otherwise crawlers + AI agents see "Pay $750
  // Deposit" in the page source even though the visible UI renders the
  // "Talk to the founder" link.
  const dict = depositsEnabled
    ? rawDict
    : Object.fromEntries(
        Object.entries(rawDict).filter(
          ([key]) =>
            !(key.startsWith('packages.') && key.endsWith('.ctaText')) &&
            !(key.startsWith('packages.') && key.endsWith('.deposit')) &&
            !key.startsWith('confirmation.'),
        ),
      );

  // Server-fetch the OPS BOARD snapshot. Always resolves — falls back to
  // a stale-empty payload that the client component renders as the
  // dictionary-driven static board.
  const boardSnapshot = await getSpecBoardSnapshot();

  /* JSON-LD — Service (no Offers while deposits are paused per Phase 0).
     When SPEC_LIVE_DEPOSITS_ENABLED flips on, Offers with deposit prices
     are emitted again and availability flips back to InStock. Until then,
     the markup describes the service without advertising prices the page
     isn't actually selling — keeps search and AI agents consistent with
     the visible UI's "Talk to the founder" posture. */
  const productLd = depositsEnabled
    ? {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: 'OPS SPEC',
        description:
          'Custom modules built on the OPS platform — Setup, Build, and Enterprise packages. Built by trades, for trades. Paid in 4 milestones with a 30-day Guarantee Refund.',
        brand: { '@type': 'Brand', name: 'OPS' },
        url: 'https://opsapp.co/spec',
        offers: [
          {
            '@type': 'Offer',
            name: 'SPEC — Setup',
            price: '750',
            priceCurrency: 'CAD',
            description: '$750 P1 deposit on a $3,000 Setup package, paid in 4 milestones.',
            availability: 'https://schema.org/InStock',
          },
          {
            '@type': 'Offer',
            name: 'SPEC — Build',
            price: '2125',
            priceCurrency: 'CAD',
            description: '$2,125 P1 deposit on a $8,500 Build package, paid in 4 milestones.',
            availability: 'https://schema.org/InStock',
          },
          {
            '@type': 'Offer',
            name: 'SPEC — Enterprise',
            price: '4500',
            priceCurrency: 'CAD',
            description: '$4,500 P1 deposit on a $18,000 Enterprise package, paid in 4 milestones.',
            availability: 'https://schema.org/InStock',
          },
        ],
      }
    : {
        '@context': 'https://schema.org',
        '@type': 'Service',
        name: 'OPS SPEC',
        description:
          'Custom modules built on the OPS platform — Setup, Build, and Enterprise packages. Built by trades, for trades. Contact the founder to scope an engagement.',
        provider: { '@type': 'Organization', name: 'OPS', url: 'https://opsapp.co' },
        url: 'https://opsapp.co/spec',
        areaServed: { '@type': 'Country', name: 'Canada' },
      };

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://opsapp.co' },
      { '@type': 'ListItem', position: 2, name: 'SPEC', item: 'https://opsapp.co/spec' },
    ],
  };

  // FAQPage JSON-LD. Built from the same dictionary items rendered in
  // SpecFAQ — single source of truth. Each Question/Answer pair is
  // emitted in the markup. SEO crawlers + AI discovery agents read this
  // block first, then verify against the visible <details> content.
  const faqItems: FAQItem[] = (rawDict['faq.items'] as unknown as FAQItem[]) ?? [];
  const faqLd =
    faqItems.length > 0
      ? {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: faqItems.map((item) => ({
            '@type': 'Question',
            name: item.question,
            acceptedAnswer: {
              '@type': 'Answer',
              text: item.answer,
            },
          })),
        }
      : null;

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
      {faqLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
        />
      )}
      <SpecPageContent
        dict={dict}
        depositsEnabled={depositsEnabled}
        boardSnapshot={boardSnapshot}
      />
    </>
  );
}
