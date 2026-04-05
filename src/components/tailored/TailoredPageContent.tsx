'use client';

import type { Dictionary } from '@/i18n/types';
import TailoredHero from './TailoredHero';

interface TailoredPageContentProps {
  dict: Dictionary;
}

/** Helper to read a string key from the dictionary */
function t(dict: Dictionary, key: string): string {
  const value = dict[key];
  return typeof value === 'string' ? value : key;
}

export function TailoredPageContent({ dict }: TailoredPageContentProps) {
  return (
    <main className="bg-ops-background">
      <TailoredHero
        eyebrow={t(dict, 'hero.eyebrow')}
        heading={t(dict, 'hero.heading')}
        subtitle={t(dict, 'hero.subtitle')}
        ctaPackages={t(dict, 'hero.ctaPackages')}
        ctaHowItWorks={t(dict, 'hero.ctaHowItWorks')}
      />

      {/* Sections added in subsequent tasks */}
    </main>
  );
}
