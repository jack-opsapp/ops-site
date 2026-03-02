/**
 * PainPoints — "The Problem" section
 *
 * Three animated pain-point cards with bullet format,
 * plus resolution callout.
 */

import { SectionLabel, FadeInUp } from '@/components/ui';
import PainPointCard from './PainPointCard';
import { getTDict } from '@/i18n/server';

export default async function PainPoints() {
  const dict = await getTDict('home');
  const t = (key: string) => {
    const value = dict[key];
    return typeof value === 'string' ? value : key;
  };
  const tArr = (key: string): string[] => {
    const value = dict[key];
    return Array.isArray(value) ? (value as string[]) : [];
  };

  const painPoints = [
    {
      title: t('painPoints.card1.title'),
      bullets: tArr('painPoints.card1.bullets'),
      forLine: t('painPoints.card1.forLine'),
      variant: 'messages' as const,
    },
    {
      title: t('painPoints.card2.title'),
      bullets: tArr('painPoints.card2.bullets'),
      forLine: t('painPoints.card2.forLine'),
      variant: 'dashboard' as const,
    },
    {
      title: t('painPoints.card3.title'),
      bullets: tArr('painPoints.card3.bullets'),
      forLine: t('painPoints.card3.forLine'),
      variant: 'apps' as const,
    },
  ];

  return (
    <section className="py-24 md:py-32 bg-ops-background">
      <div className="max-w-[1400px] mx-auto px-6 md:px-10">
        {/* Section label */}
        <FadeInUp>
          <SectionLabel label={t('painPoints.sectionLabel')} />
        </FadeInUp>

        {/* Heading */}
        <FadeInUp delay={0.05}>
          <h2
            className="font-heading font-bold uppercase text-ops-text-primary leading-[0.95] tracking-tight mt-4 max-w-[800px]"
            style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)' }}
          >
            {t('painPoints.heading')}
          </h2>
        </FadeInUp>

        {/* Pain point cards — carousel on mobile, grid on desktop */}
        <div className="mt-12 -mx-6 px-6 md:mx-0 md:px-0">
          <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-4 md:grid md:grid-cols-3 md:gap-6 md:overflow-visible md:snap-none md:pb-0 scrollbar-hide">
            {painPoints.map((point, i) => (
              <FadeInUp key={point.variant} delay={i * 0.1}>
                <div className="min-w-[280px] w-[85vw] max-w-[340px] snap-center shrink-0 md:min-w-0 md:w-auto md:max-w-none md:snap-align-none">
                  <PainPointCard
                    title={point.title}
                    bullets={point.bullets}
                    forLine={point.forLine}
                    variant={point.variant}
                  />
                </div>
              </FadeInUp>
            ))}
          </div>
        </div>

        {/* Resolution callout */}
        <FadeInUp delay={0.3}>
          <div className="border-t-2 border-ops-border pt-6 mt-16 max-w-[700px]">
            <p className="font-heading font-light text-lg text-ops-text-primary leading-relaxed">
              {t('painPoints.resolution')}
            </p>
          </div>
        </FadeInUp>
      </div>
    </section>
  );
}
