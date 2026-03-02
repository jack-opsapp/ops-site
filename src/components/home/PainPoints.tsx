/**
 * PainPoints — "The Problem" section
 *
 * Server component for i18n data fetching.
 * Delegates card layout/animations to PainPointsClient.
 */

import { SectionLabel, FadeInUp } from '@/components/ui';
import PainPointsClient from './PainPointsClient';
import type { PainPointData } from './PainPointsClient';
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

  const painPoints: PainPointData[] = [
    {
      title: t('painPoints.card1.title'),
      bullets: tArr('painPoints.card1.bullets'),
      forLine: t('painPoints.card1.forLine'),
      variant: 'messages',
    },
    {
      title: t('painPoints.card2.title'),
      bullets: tArr('painPoints.card2.bullets'),
      forLine: t('painPoints.card2.forLine'),
      variant: 'dashboard',
    },
    {
      title: t('painPoints.card3.title'),
      bullets: tArr('painPoints.card3.bullets'),
      forLine: t('painPoints.card3.forLine'),
      variant: 'apps',
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

        {/* Cards + resolution — client component for mobile interactivity */}
        <PainPointsClient
          painPoints={painPoints}
          resolution={t('painPoints.resolution')}
        />
      </div>
    </section>
  );
}
