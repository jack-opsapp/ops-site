/**
 * ResourcesHero — Half-viewport hero for the Resources page
 */

import { SectionLabel } from '@/components/ui';
import { getTDict } from '@/i18n/server';

export default async function ResourcesHero() {
  const dict = await getTDict('resources');
  const t = (key: string) => {
    const value = dict[key];
    return typeof value === 'string' ? value : key;
  };

  return (
    <section className="relative min-h-[50vh] w-full bg-ops-background">
      <div className="flex min-h-[50vh] max-w-[1400px] mx-auto flex-col justify-end px-6 md:px-10 pb-16">
        <SectionLabel label={t('hero.sectionLabel')} className="mb-6" />

        <h1 className="font-heading font-bold uppercase leading-[0.95] tracking-tight text-ops-text-primary text-4xl md:text-6xl">
          {t('hero.heading')}
        </h1>

        <p className="mt-4 font-caption uppercase tracking-[0.15em] text-sm text-ops-text-secondary">
          {t('hero.subtext')}
        </p>
      </div>
    </section>
  );
}
