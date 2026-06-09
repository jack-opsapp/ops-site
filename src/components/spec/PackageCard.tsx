'use client';

/**
 * PackageCard — full-width 3-up tier card (conversion rebuild).
 *
 * The deposit action no longer hides two clicks deep inside an accordion.
 * Always visible: name (+ recommended badge), tagline, the price headline,
 * the key feature list, the 30-day guarantee badge, and the deposit CTA
 * with a mono ledger line that frames the deposit as credited to the build.
 * A per-card "DETAILS" disclosure reveals field examples, the 4-milestone
 * bar, and the subscription/retainer lines — depth on demand, CTA never
 * buried.
 *
 * Accent (steel-blue) is reserved for the primary deposit CTA + focus rings
 * only; the recommended tier is elevated with neutral emphasis. Numbers:
 * JetBrains Mono, tabular-lining, slashed-zero.
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { theme } from '@/lib/theme';

const ease = theme.animation.easing as [number, number, number, number];

export interface PackageExample {
  trade: string;
  desc: string;
}

export interface PackageMilestoneLabels {
  /** "Deposit" / "Scope" / "Demo" / "Delivery" */
  p1: string;
  p2: string;
  p3: string;
  p4: string;
}

export interface PackageCardProps {
  tier: 'setup' | 'build' | 'enterprise';
  name: string;
  tagline: string;
  /** Pre-formatted P1 headline e.g. "Get started for $750". */
  startFrom: string;
  /** Pre-formatted sub-headline e.g. "$3,000 total · 4 milestones". */
  headlineSub: string;
  milestoneAmount: string;
  milestoneLabels: PackageMilestoneLabels;
  milestonesNote: string;
  features: string[];
  examples: PackageExample[];
  milestonesLabel: string;
  examplesLabel: string;
  subscriptionLabel: string;
  subscriptionEstimate: string;
  subscriptionNote: string;
  retainerLabel: string;
  retainerAmount: string;
  retainerNote: string;
  guaranteeBadge: string;
  /** Deposit CTA label (e.g. "Pay $750 Deposit") — used when depositsEnabled. */
  ctaText: string;
  recommended?: boolean;
  /** Badge shown on the recommended tier, e.g. "MOST CHOSEN". */
  recommendedBadge: string;
  /** Disclosure toggle label, e.g. "DETAILS". */
  detailsToggle: string;
  /** Mono ledger under the CTA, e.g. "RESERVES YOUR SLOT · CREDITED TO YOUR BUILD". */
  depositLedger: string;
  onDeposit: (tier: string) => void;
  /** Fired when the card's details open — keeps the phone scene tier in sync. */
  onSelect?: (tier: string) => void;
  /** Phase 0 safety — when false, render the contact link instead of Stripe. */
  depositsEnabled: boolean;
  contactCtaText: string;
  contactCtaHref: string;
}

export default function PackageCard({
  tier,
  name,
  tagline,
  startFrom,
  headlineSub,
  milestoneAmount,
  milestoneLabels,
  milestonesNote,
  features,
  examples,
  milestonesLabel,
  examplesLabel,
  subscriptionLabel,
  subscriptionEstimate,
  subscriptionNote,
  retainerLabel,
  retainerAmount,
  retainerNote,
  guaranteeBadge,
  ctaText,
  recommended,
  recommendedBadge,
  detailsToggle,
  depositLedger,
  onDeposit,
  onSelect,
  depositsEnabled,
  contactCtaText,
  contactCtaHref,
}: PackageCardProps) {
  const [showDetails, setShowDetails] = useState(false);

  function toggleDetails() {
    setShowDetails((v) => {
      if (!v) onSelect?.(tier);
      return !v;
    });
  }

  return (
    <motion.div
      layout
      transition={{ layout: { duration: 0.35, ease } }}
      className={`relative flex h-full flex-col rounded-[3px] border p-6 transition-colors duration-300 ${
        recommended
          ? 'border-white/[0.22] bg-white/[0.02]'
          : 'border-white/[0.08] hover:border-white/[0.15]'
      }`}
    >
      {/* Recommended badge */}
      {recommended && (
        <span className="absolute -top-px right-5 -translate-y-1/2 bg-ops-background px-2 font-mono text-[10px] uppercase tracking-[0.18em] text-ops-text-secondary [font-variant-numeric:tabular-nums_slashed-zero]">
          {recommendedBadge}
        </span>
      )}

      {/* Name + tagline */}
      <span className="font-caption text-xs uppercase tracking-[0.15em] text-ops-text-secondary [font-variant-numeric:tabular-nums_slashed-zero]">
        {name}
      </span>
      <p className="mt-2 font-heading font-light text-sm text-ops-text-secondary leading-relaxed">
        {tagline}
      </p>

      {/* Price headline */}
      <div className="mt-5">
        <p className="font-heading font-light text-xl text-ops-text-primary [font-variant-numeric:tabular-nums_slashed-zero]">
          {startFrom}
        </p>
        <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.12em] text-ops-text-tertiary [font-variant-numeric:tabular-nums_slashed-zero]">
          {headlineSub}
        </p>
      </div>

      {/* Key features — always visible */}
      <ul className="mt-6 flex flex-col gap-2.5">
        {features.map((feature) => (
          <li key={feature} className="flex gap-2.5 items-start">
            <svg
              className="w-3.5 h-3.5 mt-0.5 text-ops-text-tertiary flex-shrink-0"
              fill="none"
              viewBox="0 0 16 16"
              stroke="currentColor"
              strokeWidth="1.5"
              aria-hidden="true"
            >
              <path d="M3 8.5l3.5 3.5L13 4.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="font-heading font-light text-sm text-ops-text-secondary leading-snug">
              {feature}
            </span>
          </li>
        ))}
      </ul>

      {/* Details disclosure */}
      <button
        type="button"
        onClick={toggleDetails}
        aria-expanded={showDetails}
        className="mt-5 inline-flex items-center gap-1.5 self-start font-mono text-[10px] uppercase tracking-[0.16em] text-ops-text-tertiary transition-colors duration-150 ease-[cubic-bezier(0.22,1,0.36,1)] hover:text-ops-text-primary cursor-pointer focus-visible:outline focus-visible:outline-[1.5px] focus-visible:outline-ops-accent focus-visible:outline-offset-2"
      >
        {detailsToggle}
        <svg
          className={`w-3 h-3 transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${showDetails ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 12 12"
          stroke="currentColor"
          strokeWidth="1.5"
          aria-hidden="true"
        >
          <path d="M3 4.5L6 7.5L9 4.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      <AnimatePresence initial={false}>
        {showDetails && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease }}
            className="overflow-hidden"
          >
            <div className="pt-5">
              {/* Field examples */}
              <p className="font-caption text-[10px] text-white/30 uppercase tracking-[0.15em] mb-3">
                {examplesLabel}
              </p>
              <div className="flex flex-col gap-2 mb-6">
                {examples.map((ex) => (
                  <div
                    key={ex.trade}
                    className="flex gap-3 items-start p-3 rounded-[2px] bg-white/[0.02] border border-white/[0.06]"
                  >
                    <span className="font-caption text-[10px] text-ops-text-tertiary tracking-[0.1em] whitespace-nowrap pt-0.5">
                      {ex.trade}
                    </span>
                    <span className="font-heading font-light text-xs text-ops-text-secondary leading-relaxed">
                      {ex.desc}
                    </span>
                  </div>
                ))}
              </div>

              {/* Milestone breakdown */}
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ops-text-mute mb-4 [font-variant-numeric:tabular-nums_slashed-zero]">
                {milestonesLabel}
              </p>
              <MilestoneBar amount={milestoneAmount} labels={milestoneLabels} />
              <p className="mt-4 font-heading font-light text-xs text-ops-text-tertiary">
                {milestonesNote}
              </p>

              {/* Subscription + retainer */}
              <div className="border-t border-white/[0.06] pt-5 mt-6 flex flex-col gap-3">
                <SummaryRow label={subscriptionLabel} value={subscriptionEstimate} note={subscriptionNote} />
                <SummaryRow label={retainerLabel} value={retainerAmount} note={retainerNote} />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Guarantee badge */}
      <div className="mt-6 mb-4 pt-5 border-t border-white/[0.06]">
        <span className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.15em] text-ops-olive [font-variant-numeric:tabular-nums_slashed-zero]">
          <span aria-hidden="true" className="w-1 h-1 rounded-full bg-ops-olive" />
          {guaranteeBadge}
        </span>
      </div>

      {/* Deposit CTA — always visible, pinned to the bottom of the card */}
      <div className="mt-auto">
        {depositsEnabled ? (
          <button
            type="button"
            onClick={() => onDeposit(tier)}
            className={`block w-full text-center font-caption uppercase tracking-[0.15em] text-xs px-6 py-3.5 rounded-[5px] transition-all duration-200 cursor-pointer [font-variant-numeric:tabular-nums_slashed-zero] focus-visible:outline focus-visible:outline-[1.5px] focus-visible:outline-ops-accent focus-visible:outline-offset-2 ${
              recommended
                ? 'bg-ops-accent text-ops-background hover:bg-ops-accent/90'
                : 'bg-transparent text-ops-text-primary border border-ops-border hover:border-ops-border-hover'
            }`}
          >
            {ctaText}
          </button>
        ) : (
          <a
            href={contactCtaHref}
            className={`block w-full text-center font-caption uppercase tracking-[0.15em] text-xs px-6 py-3.5 rounded-[5px] transition-all duration-200 cursor-pointer [font-variant-numeric:tabular-nums_slashed-zero] focus-visible:outline focus-visible:outline-[1.5px] focus-visible:outline-ops-accent focus-visible:outline-offset-2 ${
              recommended
                ? 'bg-ops-accent text-ops-background hover:bg-ops-accent/90'
                : 'bg-transparent text-ops-text-primary border border-ops-border hover:border-ops-border-hover'
            }`}
          >
            {contactCtaText}
          </a>
        )}
        {/* Mono ledger — frames the deposit as credited to the build */}
        <p className="mt-2.5 text-center font-mono text-[9px] uppercase tracking-[0.14em] text-ops-text-mute [font-variant-numeric:tabular-nums_slashed-zero]">
          {depositLedger}
        </p>
      </div>
    </motion.div>
  );
}

/**
 * Horizontal 4-marker milestone bar. The first marker is steel-blue (the
 * deposit that reserves the slot); the remaining three are neutral (paid
 * as work clears review).
 */
function MilestoneBar({
  amount,
  labels,
}: {
  amount: string;
  labels: PackageMilestoneLabels;
}) {
  const milestones = [
    { key: 'p1', label: labels.p1, isDeposit: true },
    { key: 'p2', label: labels.p2, isDeposit: false },
    { key: 'p3', label: labels.p3, isDeposit: false },
    { key: 'p4', label: labels.p4, isDeposit: false },
  ];

  return (
    <div className="relative">
      <div aria-hidden="true" className="absolute left-2 right-2 top-[5px] h-px bg-white/[0.10]" />
      <ol className="relative grid grid-cols-4 gap-2" role="list">
        {milestones.map((m, i) => (
          <li key={m.key} className="flex flex-col items-center text-center">
            <span
              aria-hidden="true"
              className={`block w-2.5 h-2.5 rounded-full ${m.isDeposit ? 'bg-ops-accent' : 'bg-white/[0.35]'}`}
            />
            <span className="mt-3 font-mono text-[10px] uppercase tracking-[0.15em] text-ops-text-tertiary [font-variant-numeric:tabular-nums_slashed-zero]">
              P{i + 1}
            </span>
            <span className="mt-1 font-mono text-[12px] text-ops-text-primary [font-variant-numeric:tabular-nums_slashed-zero]">
              {amount}
            </span>
            <span className="mt-0.5 font-heading font-light text-[11px] text-ops-text-tertiary">
              {m.label}
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}

/**
 * Two-line key/value row used for the subscription + retainer lines.
 */
function SummaryRow({
  label,
  value,
  note,
}: {
  label: string;
  value: string;
  note: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-ops-text-mute pt-0.5 [font-variant-numeric:tabular-nums_slashed-zero]">
        {label}
      </span>
      <div className="text-right">
        <p className="font-mono text-[12px] text-ops-text-secondary [font-variant-numeric:tabular-nums_slashed-zero]">
          {value}
        </p>
        <p className="font-heading font-light text-[11px] text-ops-text-tertiary mt-0.5">
          {note}
        </p>
      </div>
    </div>
  );
}
