/**
 * ToolsHero — Half-viewport hero for the Tools page
 */

import { SectionLabel, GradientOverlay } from '@/components/ui';
import { getTDict } from '@/i18n/server';

export default async function ToolsHero() {
  const dict = await getTDict('tools');
  const t = (key: string) => {
    const value = dict[key];
    return typeof value === 'string' ? value : key;
  };

  return (
    <section className="relative min-h-[50vh] w-full overflow-hidden bg-ops-background">
      <div className="absolute inset-0 bg-gradient-to-br from-[#111111] via-ops-background to-[#060608]" />
      <div className="absolute inset-0 bg-gradient-to-tr from-[#0A0A0A] via-transparent to-[#0D1117]/20" />

      <GradientOverlay direction="to-bottom" opacity={0.6} />

      <div className="relative z-10 flex min-h-[50vh] flex-col justify-end max-w-[1400px] mx-auto px-6 md:px-10 pb-16">
        <SectionLabel label={t('hero.sectionLabel')} className="mb-6" />

        <h1 className="font-heading font-bold uppercase text-4xl md:text-6xl text-ops-text-primary leading-[0.95] tracking-tight">
          {t('hero.heading')}
        </h1>

        <p className="font-caption uppercase tracking-[0.15em] text-[11px] text-ops-text-secondary mt-6">
          {t('hero.subtext')}
        </p>
      </div>
    </section>
  );
}
