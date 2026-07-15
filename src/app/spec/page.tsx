/**
 * SPEC — the tier ladder, OPS BOARD, tier guide, Stripe deposit checkout.
 *
 * Route: /spec (and /es/spec).
 *
 * Sticky scroll-driven 3D phone scene that morphs through five phases
 * (home → packages → analysis → building → custom). Three escalating
 * tiers (SPEC-01 WORKFLOWS / SPEC-02 SYSTEMS / SPEC-03 PROPRIETARY,
 * 10_TIER_MODEL_V2) hit Stripe Checkout at /api/spec/create-checkout-session
 * when deposits are enabled.
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
import { filterDepositClaims } from '@/lib/spec/dict-filter';
import { isValidTier, type SpecTier } from '@/lib/spec/pricing';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  return {
    title: locale === 'es'
      ? 'OPS SPEC — Software Personalizado Para Tu Oficio'
      : 'OPS SPEC — Custom Software For Your Trade',
    description: locale === 'es'
      ? 'Tres construcciones de precio fijo para los oficios: tus herramientas conectadas ($2,000), una columna vertebral para tu operación ($7,500), o tu propia app independiente (desde $25,000). Pagos por puntos de control. 30 días para retirarte.'
      : 'Three fixed-price builds for the trades: your tools wired together ($2,000), one backbone for your operation ($7,500), or your own standalone app (from $25,000). Paid at checkpoints. 30 days to walk away.',
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

interface SpecPageProps {
  searchParams: Promise<{ fit?: string }>;
}

export default async function SpecPage({ searchParams }: SpecPageProps) {
  const rawDict = await getTDict('spec');
  // Shareable questionnaire result — /spec?fit=<tier> pre-highlights that tier
  // server-side (no hydration flash for a co-owner opening the link).
  const fitParam = (await searchParams)?.fit;
  const initialFit: SpecTier | null = isValidTier(fitParam) ? fitParam : null;
  // Phase 0 safety — until SPEC_LIVE_DEPOSITS_ENABLED flips to 'true',
  // Pay Deposit buttons render as "Talk to the founder" links pointing
  // at the contact form. The Stripe route returns 503 on the API side.
  const depositsEnabled = process.env.SPEC_LIVE_DEPOSITS_ENABLED === 'true';

  // Strip deposit-claim copy from the dict before it lands in the RSC
  // hydration payload. Otherwise crawlers + AI agents see "Pay $1,000
  // Deposit" in the page source even though the visible UI renders the
  // "Talk to the founder" link. Scoped to package deposit claims only —
  // see lib/spec/dict-filter.ts + its surviving-keys tests.
  const dict = depositsEnabled ? rawDict : filterDepositClaims(rawDict);

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
          'Fixed-price builds for the trades — SPEC-01 WORKFLOWS wires your tools together, SPEC-02 SYSTEMS runs your operation on one backbone, SPEC-03 PROPRIETARY is a standalone app built for one company. Paid at checkpoints, 30 days to walk away.',
        brand: { '@type': 'Brand', name: 'OPS' },
        url: 'https://opsapp.co/spec',
        offers: [
          {
            '@type': 'Offer',
            name: 'OPS SPEC-01 — WORKFLOWS',
            price: '1000',
            priceCurrency: 'CAD',
            description:
              '$1,000 deposit books the slot on a $2,000 fixed engagement — up to 3 production automations in your own accounts, 50/50 payment.',
            availability: 'https://schema.org/InStock',
          },
          {
            '@type': 'Offer',
            name: 'OPS SPEC-02 — SYSTEMS',
            price: '1875',
            priceCurrency: 'CAD',
            description:
              '$1,875 deposit books the slot on a $7,500 fixed engagement — one structured backbone for jobs, clients, and money, paid across 4 checkpoints. $395/mo care plan after the support window.',
            availability: 'https://schema.org/InStock',
          },
          {
            '@type': 'Offer',
            name: 'OPS SPEC-03 — PROPRIETARY',
            price: '6250',
            priceCurrency: 'CAD',
            description:
              '$6,250 deposit, fixed against the $25,000 floor, on a standalone trade tool built for one company. Total locks at scope sign-off. Care plan from $750/mo after the support window.',
            availability: 'https://schema.org/InStock',
          },
        ],
      }
    : {
        '@context': 'https://schema.org',
        '@type': 'Service',
        name: 'OPS SPEC',
        description:
          'Fixed-price builds for the trades — SPEC-01 WORKFLOWS wires your tools together, SPEC-02 SYSTEMS runs your operation on one backbone, SPEC-03 PROPRIETARY is a standalone app built for one company. Built by trades, for trades. Talk to the founder to scope an engagement.',
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
        initialFit={initialFit}
      />
    </>
  );
}
