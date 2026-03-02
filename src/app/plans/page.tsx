/**
 * Plans page — Pricing tiers, FAQ, and bottom CTA
 */

import type { Metadata } from 'next';
import { FadeInUp } from '@/components/ui';
import PlansHero from '@/components/plans/PlansHero';
import PricingCard from '@/components/plans/PricingCard';
import FAQ from '@/components/shared/FAQ';
import BottomCTA from '@/components/shared/BottomCTA';
import { getLocale, getTDict } from '@/i18n/server';

const APP_STORE_URL = 'https://apps.apple.com/us/app/ops-job-crew-management/id6746662078';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  return {
    title: locale === 'es' ? 'Planes' : 'Plans',
    description: locale === 'es'
      ? 'Empieza gratis. Sube de plan cuando estés listo. Sin tarjeta de crédito, sin compromiso. Todos los planes incluyen todas las funciones.'
      : 'Start free. Upgrade when you\'re ready. No credit card, no commitment. All plans include every feature — you only pay based on crew size.',
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
