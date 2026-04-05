'use client';

import { useState, useCallback } from 'react';
import type { Dictionary } from '@/i18n/types';
import TailoredHero from './TailoredHero';
import HowItWorks from './HowItWorks';
import TailoredPricing, { type PackageData } from './TailoredPricing';
import WhatsIncluded from './WhatsIncluded';
import SocialProof from './SocialProof';
import TailoredFAQ from './TailoredFAQ';
import TailoredBottomCTA from './TailoredBottomCTA';
import TailoredPhoneWrapper from './phone-scene/TailoredPhoneWrapper';
import type { TailoredPhase } from './phone-scene/constants';

interface TailoredPageContentProps {
  dict: Dictionary;
}

/** Helper to read a string key from the dictionary */
function t(dict: Dictionary, key: string): string {
  const value = dict[key];
  return typeof value === 'string' ? value : key;
}

/** Map step index to phone phase */
const STEP_PHASES: TailoredPhase[] = ['packages', 'analysis', 'building', 'custom'];

export function TailoredPageContent({ dict }: TailoredPageContentProps) {
  const [phonePhase, setPhonePhase] = useState<TailoredPhase>('home');
  const [phoneTier, setPhoneTier] = useState<string | null>(null);

  const handleStepChange = useCallback((step: number) => {
    setPhonePhase(STEP_PHASES[step] ?? 'home');
    // Reset tier when scrolling through steps (not in packages section)
    setPhoneTier(null);
  }, []);

  const handleTierSelect = useCallback((tier: string | null) => {
    setPhonePhase('custom');
    setPhoneTier(tier);
  }, []);

  const packages: PackageData[] = (['setup', 'build', 'enterprise'] as const).map((tier) => ({
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
  }));

  return (
    <main className="bg-ops-background">
      <TailoredHero
        eyebrow={t(dict, 'hero.eyebrow')}
        heading={t(dict, 'hero.heading')}
        subtitle={t(dict, 'hero.subtitle')}
        ctaPackages={t(dict, 'hero.ctaPackages')}
        ctaHowItWorks={t(dict, 'hero.ctaHowItWorks')}
      />

      {/* Sticky phone container — spans How It Works + Pricing */}
      <div className="max-w-[1400px] mx-auto px-6 sm:px-10 md:px-16 lg:px-24">
        <div className="flex gap-16 lg:gap-24">
          {/* Left: scrollable content */}
          <div className="flex-1 min-w-0">
            <HowItWorks
              sectionLabel={t(dict, 'process.sectionLabel')}
              steps={[
                { number: t(dict, 'process.step1.number'), title: t(dict, 'process.step1.title'), desc: t(dict, 'process.step1.desc') },
                { number: t(dict, 'process.step2.number'), title: t(dict, 'process.step2.title'), desc: t(dict, 'process.step2.desc') },
                { number: t(dict, 'process.step3.number'), title: t(dict, 'process.step3.title'), desc: t(dict, 'process.step3.desc') },
                { number: t(dict, 'process.step4.number'), title: t(dict, 'process.step4.title'), desc: t(dict, 'process.step4.desc') },
              ]}
              onActiveStepChange={handleStepChange}
            />

            <TailoredPricing
              sectionLabel={t(dict, 'packages.sectionLabel')}
              packages={packages}
              onTierSelect={handleTierSelect}
            />
          </div>

          {/* Right: sticky phone (desktop only) */}
          <div className="hidden lg:block pt-24">
            <TailoredPhoneWrapper phase={phonePhase} tier={phoneTier} />
          </div>
        </div>
      </div>

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
