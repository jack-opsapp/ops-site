/**
 * PlatformShowcase — "The Solution" section
 *
 * Four benefit-focused cards with "Why it matters" format.
 */

import { SectionLabel, FadeInUp, Card } from '@/components/ui';
import { getTDict } from '@/i18n/server';

export default async function PlatformShowcase() {
  const dict = await getTDict('home');
  const t = (key: string) => {
    const value = dict[key];
    return typeof value === 'string' ? value : key;
  };

  const features = [
    {
      title: t('showcase.feature1.title'),
      copy: t('showcase.feature1.copy'),
      why: t('showcase.feature1.why'),
    },
    {
      title: t('showcase.feature2.title'),
      copy: t('showcase.feature2.copy'),
      why: t('showcase.feature2.why'),
    },
    {
      title: t('showcase.feature3.title'),
      copy: t('showcase.feature3.copy'),
      why: t('showcase.feature3.why'),
    },
    {
      title: t('showcase.feature4.title'),
      copy: t('showcase.feature4.copy'),
      why: t('showcase.feature4.why'),
    },
  ];

  return (
    <section className="py-24 md:py-32 bg-ops-background">
      <div className="max-w-[1400px] mx-auto px-6 md:px-10">
        {/* Section header */}
        <FadeInUp>
          <SectionLabel label={t('showcase.sectionLabel')} />
          <h2
            className="mt-4 font-heading font-bold uppercase leading-[0.95] tracking-tight text-ops-text-primary max-w-[700px]"
            style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)' }}
          >
            {t('showcase.heading')}
          </h2>
        </FadeInUp>

        {/* Feature cards — 2x2 grid */}
        <div className="mt-12 md:mt-20 grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((feature, i) => (
            <FadeInUp key={feature.title} delay={i * 0.08}>
              <Card hoverable className="p-8 h-full">
                <h3 className="font-heading font-bold text-lg text-ops-text-primary uppercase tracking-tight">
                  {feature.title}
                </h3>
                <p className="mt-3 font-heading font-light text-base text-ops-text-secondary leading-relaxed">
                  {feature.copy}
                </p>
                <p className="mt-3 font-heading font-light text-sm text-ops-text-secondary leading-relaxed">
                  <span className="text-ops-text-primary font-normal">{t('showcase.whyItMatters')}</span> {feature.why}
                </p>
              </Card>
            </FadeInUp>
          ))}
        </div>
      </div>
    </section>
  );
}
