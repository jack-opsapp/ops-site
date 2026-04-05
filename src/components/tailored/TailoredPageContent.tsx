'use client';

import type { Dictionary } from '@/i18n/types';
import TailoredHero from './TailoredHero';
import HowItWorks from './HowItWorks';
import TailoredPricing, { type PackageData } from './TailoredPricing';

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

      <HowItWorks
        sectionLabel={t(dict, 'process.sectionLabel')}
        steps={[
          { number: t(dict, 'process.step1.number'), title: t(dict, 'process.step1.title'), desc: t(dict, 'process.step1.desc') },
          { number: t(dict, 'process.step2.number'), title: t(dict, 'process.step2.title'), desc: t(dict, 'process.step2.desc') },
          { number: t(dict, 'process.step3.number'), title: t(dict, 'process.step3.title'), desc: t(dict, 'process.step3.desc') },
          { number: t(dict, 'process.step4.number'), title: t(dict, 'process.step4.title'), desc: t(dict, 'process.step4.desc') },
        ]}
      />

      <TailoredPricing
        sectionLabel={t(dict, 'packages.sectionLabel')}
        packages={
          (['setup', 'build', 'enterprise'] as const).map((tier) => ({
            tier,
            name: t(dict, `packages.${tier}.name`),
            tagline: t(dict, `packages.${tier}.tagline`),
            price: t(dict, `packages.${tier}.price`),
            deposit: t(dict, `packages.${tier}.deposit`),
            features: (dict[`packages.${tier}.features`] as string[]) ?? [],
            examples: (dict[`packages.${tier}.examples`] as unknown as Array<{ trade: string; desc: string }>) ?? [],
            ongoing: t(dict, `packages.${tier}.ongoing`),
            ctaText: t(dict, `packages.${tier}.ctaText`),
            recommended: tier === 'build',
          })) as PackageData[]
        }
      />

      {/* Remaining sections added in subsequent tasks */}
    </main>
  );
}
