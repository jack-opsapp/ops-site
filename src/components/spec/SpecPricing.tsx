'use client';

import { motion } from 'framer-motion';
import { theme } from '@/lib/theme';
import { SectionLabel } from '@/components/ui';
import { trackSpecMarketingEvent } from '@/lib/marketing-analytics';
import PackageCard, {
  type PackageExample,
  type PackageMilestoneLabels,
} from './PackageCard';

const ease = theme.animation.easing as [number, number, number, number];

export interface PackageData {
  tier: 'setup' | 'build' | 'enterprise';
  name: string;
  tagline: string;
  startFrom: string;
  headlineSub: string;
  milestoneAmount: string;
  subscriptionEstimate: string;
  retainerAmount: string;
  features: string[];
  examples: PackageExample[];
  ctaText: string;
  recommended?: boolean;
}

interface SpecPricingProps {
  sectionLabel: string;
  packages: PackageData[];
  /** Shared labels reused across all three cards. */
  milestoneLabels: PackageMilestoneLabels;
  milestonesLabel: string;
  milestonesNote: string;
  examplesLabel: string;
  subscriptionLabel: string;
  subscriptionNote: string;
  retainerLabel: string;
  retainerNote: string;
  guaranteeBadge: string;
  recommendedBadge: string;
  detailsToggle: string;
  depositLedger: string;
  onTierSelect?: (tier: string | null) => void;
  /** Phase 0 safety — when false, CTAs become contact links, not Stripe triggers. */
  depositsEnabled: boolean;
  /** Copy + href used when depositsEnabled is false. */
  contactCtaText: string;
  contactCtaHref: string;
}

export default function SpecPricing({
  sectionLabel,
  packages,
  milestoneLabels,
  milestonesLabel,
  milestonesNote,
  examplesLabel,
  subscriptionLabel,
  subscriptionNote,
  retainerLabel,
  retainerNote,
  guaranteeBadge,
  recommendedBadge,
  detailsToggle,
  depositLedger,
  onTierSelect,
  depositsEnabled,
  contactCtaText,
  contactCtaHref,
}: SpecPricingProps) {
  async function handleDeposit(tier: string) {
    trackSpecMarketingEvent('pay_deposit_click', { tier });
    try {
      const res = await fetch('/api/spec/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ package: tier }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      console.error('Checkout error:', err);
    }
  }

  function handleSelect(tier: string) {
    trackSpecMarketingEvent('spec_card_expand', { tier, deposits_enabled: depositsEnabled });
    onTierSelect?.(tier);
  }

  return (
    <section id="packages" className="py-24 md:py-32 bg-ops-background">
      <div className="max-w-[1320px] mx-auto px-6 sm:px-10 md:px-16 lg:px-24">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease }}
          viewport={{ once: true, amount: 0.3 }}
        >
          <SectionLabel label={sectionLabel} className="mb-12" />
        </motion.div>

        {/* Full-width 3-up tier comparison. Build is elevated (recommended). */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-5 items-stretch">
          {packages.map((pkg, index) => (
            <motion.div
              key={pkg.tier}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.08, ease }}
              viewport={{ once: true, amount: 0.2 }}
              className="h-full"
            >
              <PackageCard
                {...pkg}
                milestoneLabels={milestoneLabels}
                milestonesLabel={milestonesLabel}
                milestonesNote={milestonesNote}
                examplesLabel={examplesLabel}
                subscriptionLabel={subscriptionLabel}
                subscriptionNote={subscriptionNote}
                retainerLabel={retainerLabel}
                retainerNote={retainerNote}
                guaranteeBadge={guaranteeBadge}
                recommendedBadge={recommendedBadge}
                detailsToggle={detailsToggle}
                depositLedger={depositLedger}
                onDeposit={handleDeposit}
                onSelect={handleSelect}
                depositsEnabled={depositsEnabled}
                contactCtaText={contactCtaText}
                contactCtaHref={contactCtaHref}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
