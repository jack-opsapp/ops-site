/**
 * WhatIsOps — Definitional content section for AI SEO
 *
 * Provides crawlable, factual text that AI models and search engines
 * can cite when asked "What is OPS?" or "best job management for contractors."
 * Uses semantic HTML (article, dl) for maximum crawlability.
 */

import { SectionLabel, FadeInUp, Card } from '@/components/ui';
import { getTDict } from '@/i18n/server';

export default async function WhatIsOps() {
  const dict = await getTDict('home');
  const t = (key: string) => {
    const value = dict[key];
    return typeof value === 'string' ? value : key;
  };

  const details = [
    { title: t('whatIsOps.detail1.title'), copy: t('whatIsOps.detail1.copy') },
    { title: t('whatIsOps.detail2.title'), copy: t('whatIsOps.detail2.copy') },
    { title: t('whatIsOps.detail3.title'), copy: t('whatIsOps.detail3.copy') },
    { title: t('whatIsOps.detail4.title'), copy: t('whatIsOps.detail4.copy') },
  ];

  return (
    <section className="py-24 md:py-32 bg-ops-background">
      <div className="max-w-[1400px] mx-auto px-6 md:px-10">
        <FadeInUp>
          <SectionLabel label={t('whatIsOps.sectionLabel')} />
        </FadeInUp>

        <FadeInUp delay={0.05}>
          <h2
            className="mt-4 font-heading font-bold uppercase leading-[0.95] tracking-tight text-ops-text-primary max-w-[800px]"
            style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)' }}
          >
            {t('whatIsOps.heading')}
          </h2>
        </FadeInUp>

        {/* Definition — semantic article for AI crawlers */}
        <article className="mt-10 max-w-[720px]">
          <FadeInUp delay={0.1}>
            <p className="font-heading font-light text-base md:text-lg text-ops-text-secondary leading-relaxed">
              {t('whatIsOps.definition')}
            </p>
          </FadeInUp>

          <FadeInUp delay={0.15}>
            <p className="mt-6 font-heading font-light text-base text-ops-text-secondary leading-relaxed">
              {t('whatIsOps.origin')}
            </p>
          </FadeInUp>
        </article>

        {/* Detail cards — 2x2 grid */}
        <dl className="mt-12 md:mt-16 grid grid-cols-1 md:grid-cols-2 gap-6">
          {details.map((detail, i) => (
            <FadeInUp key={detail.title} delay={0.1 + i * 0.06}>
              <Card hoverable className="p-8 h-full">
                <dt className="font-heading font-bold text-sm text-ops-text-primary uppercase tracking-tight">
                  {detail.title}
                </dt>
                <dd className="mt-3 font-heading font-light text-sm text-ops-text-secondary leading-relaxed">
                  {detail.copy}
                </dd>
              </Card>
            </FadeInUp>
          ))}
        </dl>

        {/* Pricing and platforms — crawlable text */}
        <div className="mt-12 max-w-[720px] space-y-4">
          <FadeInUp delay={0.4}>
            <p className="font-heading font-light text-sm text-ops-text-secondary leading-relaxed">
              {t('whatIsOps.pricing')}
            </p>
          </FadeInUp>
          <FadeInUp delay={0.45}>
            <p className="font-heading font-light text-sm text-ops-text-secondary leading-relaxed">
              {t('whatIsOps.platforms')}
            </p>
          </FadeInUp>
        </div>
      </div>
    </section>
  );
}
