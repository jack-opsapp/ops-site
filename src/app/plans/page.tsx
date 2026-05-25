/**
 * Plans page — Pricing tiers, FAQ, and bottom CTA
 */

import type { Metadata } from 'next';
import Link from 'next/link';
import { FadeInUp, SectionLabel, Card } from '@/components/ui';
import PlansHero from '@/components/plans/PlansHero';
import PricingCard from '@/components/plans/PricingCard';
import FAQ from '@/components/shared/FAQ';
import BottomCTA from '@/components/shared/BottomCTA';
import { getLocale, getTDict, buildLocaleAlternates, buildLocaleUrl } from '@/i18n/server';

const APP_STORE_URL = 'https://apps.apple.com/us/app/ops-job-crew-management/id6746662078';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  return {
    title: locale === 'es' ? 'Precios — Planes de OPS' : 'Pricing — OPS Plans',
    description: locale === 'es'
      ? 'Empieza gratis. Planes desde $0 hasta $190/mes según el tamaño de tu equipo. Todas las funciones incluidas. Sin tarjeta de crédito.'
      : 'Start free. Plans from $0 to $190/month based on crew size. Every feature included at every tier. No credit card. No contract.',
    openGraph: {
      url: buildLocaleUrl('/plans', locale),
    },
    alternates: buildLocaleAlternates('/plans', locale),
  };
}

export default async function PlansPage() {
  const dict = await getTDict('plans');
  const t = (key: string) => {
    const value = dict[key];
    return typeof value === 'string' ? value : key;
  };

  const pricingTiers = [
    {
      name: t('tier.freeTrial.name'),
      price: 'FREE',
      interval: t('tier.freeTrial.interval'),
      users: t('tier.freeTrial.users'),
      bestFor: t('tier.freeTrial.bestFor'),
      features: [
        t('features.fullAccess'),
        t('features.upTo10Users'),
        t('features.noCreditCard'),
        t('features.taskManagement'),
        t('features.photoStorage'),
        t('features.projectDatabase'),
      ],
      ctaText: t('tier.freeTrial.ctaText'),
      ctaHref: APP_STORE_URL,
    },
    {
      name: t('tier.starter.name'),
      price: '$90',
      interval: t('tier.starter.interval'),
      users: t('tier.starter.users'),
      bestFor: t('tier.starter.bestFor'),
      features: [
        t('features.fullAccess'),
        t('features.taskManagementCrew'),
        t('features.photoStorage'),
        t('features.projectDatabase'),
        t('features.clientDatabase'),
        t('features.unlimitedStorage'),
      ],
      ctaText: t('tier.starter.ctaText'),
      ctaHref: APP_STORE_URL,
    },
    {
      name: t('tier.team.name'),
      price: '$140',
      interval: t('tier.team.interval'),
      users: t('tier.team.users'),
      bestFor: t('tier.team.bestFor'),
      features: [
        t('features.fullAccess'),
        t('features.taskManagementCrew'),
        t('features.photoStorage'),
        t('features.projectDatabase'),
        t('features.clientDatabase'),
        t('features.unlimitedStorage'),
      ],
      recommended: true,
      ctaText: t('tier.team.ctaText'),
      ctaHref: APP_STORE_URL,
    },
    {
      name: t('tier.business.name'),
      price: '$190',
      interval: t('tier.business.interval'),
      users: t('tier.business.users'),
      bestFor: t('tier.business.bestFor'),
      features: [
        t('features.fullAccess'),
        t('features.taskManagementCrew'),
        t('features.photoStorage'),
        t('features.projectDatabase'),
        t('features.clientDatabase'),
        t('features.unlimitedStorage'),
      ],
      ctaText: t('tier.business.ctaText'),
      ctaHref: APP_STORE_URL,
    },
  ];

  const faqItems = [
    { question: t('faq.q1.question'), answer: t('faq.q1.answer') },
    { question: t('faq.q2.question'), answer: t('faq.q2.answer') },
    { question: t('faq.q3.question'), answer: t('faq.q3.answer') },
    { question: t('faq.q4.question'), answer: t('faq.q4.answer') },
    { question: t('faq.q5.question'), answer: t('faq.q5.answer') },
    { question: t('faq.q6.question'), answer: t('faq.q6.answer') },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
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
          }),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'SoftwareApplication',
            name: 'OPS',
            applicationCategory: 'BusinessApplication',
            operatingSystem: 'iOS, Web',
            url: 'https://opsapp.co',
            offers: [
              {
                '@type': 'Offer',
                name: 'Free Trial',
                price: '0',
                priceCurrency: 'USD',
                description: 'Full access, up to 10 users. No credit card required.',
                availability: 'https://schema.org/InStock',
              },
              {
                '@type': 'Offer',
                name: 'Starter',
                price: '90',
                priceCurrency: 'USD',
                description: 'For crews of 11-25 users. All features included.',
                availability: 'https://schema.org/InStock',
                priceValidUntil: '2026-12-31',
              },
              {
                '@type': 'Offer',
                name: 'Team',
                price: '140',
                priceCurrency: 'USD',
                description: 'For crews of 26-50 users. All features included.',
                availability: 'https://schema.org/InStock',
                priceValidUntil: '2026-12-31',
              },
              {
                '@type': 'Offer',
                name: 'Business',
                price: '190',
                priceCurrency: 'USD',
                description: 'For crews of 51-100 users. All features included.',
                availability: 'https://schema.org/InStock',
                priceValidUntil: '2026-12-31',
              },
            ],
          }),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://opsapp.co' },
              { '@type': 'ListItem', position: 2, name: 'Pricing', item: 'https://opsapp.co/plans' },
            ],
          }),
        }}
      />

      <PlansHero />

      {/* Pricing cards */}
      <section className="py-16 md:py-24 bg-ops-background">
        <div className="max-w-[1400px] mx-auto px-6 md:px-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {pricingTiers.map((tier, index) => (
              <FadeInUp key={tier.name} delay={index * 0.08}>
                <PricingCard
                  name={tier.name}
                  price={tier.price}
                  interval={tier.interval}
                  users={tier.users}
                  bestFor={tier.bestFor}
                  features={tier.features}
                  recommended={tier.recommended}
                  ctaText={tier.ctaText}
                  ctaHref={tier.ctaHref}
                  bestForLabel={t('bestFor')}
                />
              </FadeInUp>
            ))}
          </div>

          {/* Callout */}
          <FadeInUp delay={0.4}>
            <p className="font-heading font-light text-sm text-ops-text-secondary text-center mt-12 max-w-[700px] mx-auto">
              {t('callout')}
            </p>
          </FadeInUp>
        </div>
      </section>

      {/* Context links — addresses the audit-flagged dead-end problem on /plans */}
      <section className="py-20 md:py-24 bg-ops-background border-t border-ops-border">
        <div className="max-w-[1400px] mx-auto px-6 md:px-10">
          <FadeInUp>
            <SectionLabel label="BEFORE YOU PICK A TIER" />
          </FadeInUp>
          <FadeInUp delay={0.05}>
            <h2 className="mt-4 font-heading font-bold uppercase text-ops-text-primary text-2xl md:text-3xl tracking-tight leading-[0.95] max-w-[600px]">
              SEE WHAT YOU&apos;RE GETTING.
            </h2>
          </FadeInUp>

          <div className="mt-10 md:mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            <FadeInUp delay={0.1}>
              <Link href="/compare" className="block h-full">
                <Card hoverable className="p-8 h-full flex flex-col">
                  <p className="font-caption uppercase tracking-[0.15em] text-[10px] text-ops-text-secondary">
                    Compare
                  </p>
                  <h3 className="mt-1 font-heading font-bold text-base text-ops-text-primary uppercase tracking-tight">
                    OPS vs the rest
                  </h3>
                  <p className="mt-4 font-heading font-light text-sm text-ops-text-secondary leading-relaxed flex-1">
                    Side-by-side numbers against ServiceTitan, Jobber, Housecall Pro, and five more.
                  </p>
                  <span className="mt-5 inline-block font-caption uppercase tracking-[0.15em] text-[11px] text-ops-accent">
                    Run the numbers -&gt;
                  </span>
                </Card>
              </Link>
            </FadeInUp>

            <FadeInUp delay={0.16}>
              <Link href="/platform" className="block h-full">
                <Card hoverable className="p-8 h-full flex flex-col">
                  <p className="font-caption uppercase tracking-[0.15em] text-[10px] text-ops-text-secondary">
                    Platform
                  </p>
                  <h3 className="mt-1 font-heading font-bold text-base text-ops-text-primary uppercase tracking-tight">
                    What you actually get
                  </h3>
                  <p className="mt-4 font-heading font-light text-sm text-ops-text-secondary leading-relaxed flex-1">
                    Every feature included at every tier. Scheduling, photo docs, offline mode, the lot.
                  </p>
                  <span className="mt-5 inline-block font-caption uppercase tracking-[0.15em] text-[11px] text-ops-accent">
                    Tour the platform -&gt;
                  </span>
                </Card>
              </Link>
            </FadeInUp>

            <FadeInUp delay={0.22}>
              <Link href="/industries" className="block h-full">
                <Card hoverable className="p-8 h-full flex flex-col">
                  <p className="font-caption uppercase tracking-[0.15em] text-[10px] text-ops-text-secondary">
                    Industries
                  </p>
                  <h3 className="mt-1 font-heading font-bold text-base text-ops-text-primary uppercase tracking-tight">
                    Built for your trade
                  </h3>
                  <p className="mt-4 font-heading font-light text-sm text-ops-text-secondary leading-relaxed flex-1">
                    49 trades, one app. See how crews like yours run their work without rewiring it.
                  </p>
                  <span className="mt-5 inline-block font-caption uppercase tracking-[0.15em] text-[11px] text-ops-accent">
                    Find your trade -&gt;
                  </span>
                </Card>
              </Link>
            </FadeInUp>
          </div>
        </div>
      </section>

      <FAQ label={t('faq.sectionLabel')} items={faqItems} />

      <BottomCTA
        heading={t('bottomCta.heading')}
        subtext={t('bottomCta.subtext')}
        buttonText={t('bottomCta.buttonText')}
        buttonHref={APP_STORE_URL}
        external
      />
    </>
  );
}
