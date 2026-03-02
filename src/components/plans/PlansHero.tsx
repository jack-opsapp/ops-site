/**
 * PlansHero — Half-viewport hero for the Plans page
 */

import { SectionLabel, FadeInUp } from '@/components/ui';
import { getTDict } from '@/i18n/server';

export default async function PlansHero() {
  const dict = await getTDict('plans');
  const t = (key: string) => {
    const value = dict[key];
    return typeof value === 'string' ? value : key;
  };

  return (
    <section className="min-h-[50vh] bg-ops-background flex flex-col justify-end">
      <div className="max-w-[1400px] mx-auto px-6 md:px-10 w-full pb-16">
        <FadeInUp>
          <SectionLabel label={t('hero.sectionLabel')} className="mb-6" />
        </FadeInUp>

        <FadeInUp delay={0.06}>
          <h1 className="font-heading font-bold uppercase text-4xl md:text-6xl text-ops-text-primary leading-[0.95] tracking-tight">
            {t('hero.heading')}
          </h1>
        </FadeInUp>

        <FadeInUp delay={0.12}>
          <p className="font-caption uppercase tracking-[0.15em] text-[11px] text-ops-text-secondary mt-6">
            {t('hero.subtext')}
          </p>
        </FadeInUp>
      </div>
    </section>
  );
}
