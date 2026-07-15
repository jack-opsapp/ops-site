'use client';

import { motion } from 'framer-motion';
import { theme } from '@/lib/theme';
import { SectionLabel } from '@/components/ui';
import { trackSpecMarketingEvent } from '@/lib/marketing-analytics';
import { specBillingAddressPath } from '@/lib/spec/deposit-entry';
import type { SpecTier } from '@/lib/spec/pricing';
import PackageCard, {
  type PackageExample,
  type PackageMilestoneLabels,
} from './PackageCard';

const ease = theme.animation.easing as [number, number, number, number];

export interface PackageData {
  tier: SpecTier;
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
  /** Questionnaire fit (null = none chosen). Drives card highlight + CTA primary. */
  highlightedTier: SpecTier | null;
  /** "// YOUR FIT" tag + banner eyebrow. */
  yourFitLabel: string;
  /** One-line rationale for the highlighted tier ('' when none). */
  fitRationale: string;
  /** "RETAKE" affordance label. */
  retakeLabel: string;
  /** Opt-in entry copy near the grid. */
  entryPrompt: string;
  entryCta: string;
  /** Opens the "help me choose" modal. */
  onOpenQuestionnaire: () => void;
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
  highlightedTier,
  yourFitLabel,
  fitRationale,
  retakeLabel,
  entryPrompt,
  entryCta,
  onOpenQuestionnaire,
}: SpecPricingProps) {
  function handleDeposit(tier: string) {
    // Route to the canonical pre-Stripe entry (/spec/billing-address →
    // create-checkout-session), shared with the sticky deposit bar. The old
    // direct POST sent { package } and read { url }, neither of which the
    // route accepts — it needs auth + billing + the Quebec attestations the
    // billing-address page collects.
    trackSpecMarketingEvent('pay_deposit_click', { tier, source: 'package_card' });
    window.location.href = specBillingAddressPath(tier as SpecTier);
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
          <SectionLabel label={sectionLabel} className="mb-6" />
        </motion.div>

        {/* Opt-in fit finder — swaps to the result once the buyer answers. */}
        {highlightedTier ? (
          <div className="mb-12 flex flex-wrap items-center gap-x-3 gap-y-1.5 border-l-2 border-white/20 pl-4">
            <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-ops-text-primary [font-variant-numeric:tabular-nums_slashed-zero]">
              {yourFitLabel}
            </span>
            <span className="text-ops-text-mute" aria-hidden="true">·</span>
            <span className="font-heading font-light text-sm text-ops-text-secondary">
              {fitRationale}
            </span>
            <button
              type="button"
              onClick={onOpenQuestionnaire}
              className="ml-1 cursor-pointer font-mono text-[10px] uppercase tracking-[0.18em] text-ops-text-tertiary transition-colors duration-150 hover:text-ops-text-primary focus-visible:outline focus-visible:outline-[1.5px] focus-visible:outline-ops-accent focus-visible:outline-offset-2"
            >
              {retakeLabel}
            </button>
          </div>
        ) : (
          <div className="mb-12 flex flex-wrap items-center gap-x-3 gap-y-1.5">
            <span className="font-heading font-light text-sm text-ops-text-tertiary">
              {entryPrompt}
            </span>
            <button
              type="button"
              onClick={onOpenQuestionnaire}
              className="inline-flex cursor-pointer items-center gap-1.5 border-b border-white/20 pb-0.5 font-mono text-[11px] uppercase tracking-[0.18em] text-ops-text-primary transition-colors duration-150 hover:border-white/50 focus-visible:outline focus-visible:outline-[1.5px] focus-visible:outline-ops-accent focus-visible:outline-offset-2"
            >
              {entryCta}
              <svg className="h-3 w-3" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                <path d="M2.5 6h7M6 2.5l3.5 3.5L6 9.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        )}

        {/* Full-width 3-up tier comparison. The fit (or Build by default) is elevated. */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-5 items-stretch">
          {packages.map((pkg, index) => {
            const isYourFit = highlightedTier === pkg.tier;
            // One accent CTA on the page: the fit card if chosen, else Build.
            const ctaPrimary = highlightedTier ? isYourFit : !!pkg.recommended;
            return (
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
                  isYourFit={isYourFit}
                  yourFitLabel={yourFitLabel}
                  ctaPrimary={ctaPrimary}
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
            );
          })}
        </div>
      </div>
    </section>
  );
}
