'use client';

import type { Dictionary } from '@/i18n/types';
import TailoredHero from './TailoredHero';
import HowItWorks from './HowItWorks';
import TailoredPricing, { type PackageData } from './TailoredPricing';
import WhatsIncluded from './WhatsIncluded';
import SocialProof from './SocialProof';
import TailoredFAQ from './TailoredFAQ';
import TailoredBottomCTA from './TailoredBottomCTA';

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

      <WhatsIncluded
        sectionLabel={t(dict, 'included.sectionLabel')}
        items={(dict['included.every'] as string[]) ?? []}
        ongoingLabel={t(dict, 'included.ongoingLabel')}
        ongoingItems={(dict['included.ongoing'] as string[]) ?? []}
      />

      <SocialProof
        subtitle={t(dict, 'proof.subtitle')}
        stats={[
          { value: t(dict, 'proof.stat1.value'), label: t(dict, 'proof.stat1.label') },
          { value: t(dict, 'proof.stat2.value'), label: t(dict, 'proof.stat2.label') },
          { value: t(dict, 'proof.stat3.value'), label: t(dict, 'proof.stat3.label') },
        ]}
      />

      <TailoredFAQ
        sectionLabel={t(dict, 'faq.sectionLabel')}
        items={(dict['faq.items'] as unknown as Array<{ question: string; answer: string }>) ?? []}
      />

      <TailoredBottomCTA
        heading={t(dict, 'bottomCta.heading')}
        subtitle={t(dict, 'bottomCta.subtitle')}
        ctaText={t(dict, 'bottomCta.ctaText')}
      />
    </main>
  );
}
