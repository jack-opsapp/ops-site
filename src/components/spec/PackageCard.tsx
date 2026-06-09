'use client';

/**
 * PackageCard — Phase 1 rewrite per 04_CUSTOMER_UX.md § 4.
 *
 * Collapsed state:
 *   {NAME}                                {Get started for $X}
 *   {Tagline}                             {$Total · 4 milestones}
 *
 * Expanded state adds:
 *   - Feature list (existing)
 *   - Trade-specific examples (existing)
 *   - 4-milestone breakdown bar (NEW) — P1 Deposit, P2 Scope,
 *     P3 Demo, P4 Delivery. Each row 25% of total.
 *   - Subscription estimate line (NEW) — "+15% on base OPS sub"
 *   - Retainer cost line (NEW) — "$250/mo after support window"
 *   - 30-DAY GUARANTEE REFUND badge (NEW)
 *   - CTA (existing) — Pay $X Deposit or "Talk to the founder"
 *     when depositsEnabled is false (Phase 0 safety).
 *
 * Numbers compliance: every visible $ value renders in JetBrains Mono
 * with `tabular-nums` and `font-variant-numeric: slashed-zero` per
 * DESIGN.md § 4. The values themselves come from the dictionary, which
 * mirrors lib/spec/pricing.ts (single source of truth).
 */

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
  /** Per-milestone amount string, e.g. "$750". */
  milestoneAmount: string;
  /** Shared milestone labels (Deposit / Scope / Demo / Delivery). */
  milestoneLabels: PackageMilestoneLabels;
  /** Explainer below the milestone bar. */
  milestonesNote: string;
  features: string[];
  examples: PackageExample[];
  /** Label rendered above the milestone bar (e.g. "4 MILESTONES"). */
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
  isExpanded: boolean;
  isOtherExpanded: boolean;
  onToggle: () => void;
  onDeposit: (tier: string) => void;
  /** Phase 0 safety — when false, render contact link instead of Stripe button. */
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
  isExpanded,
  isOtherExpanded,
  onToggle,
  onDeposit,
  depositsEnabled,
  contactCtaText,
  contactCtaHref,
}: PackageCardProps) {
  const isCompressed = !isExpanded && isOtherExpanded;

  return (
    <motion.div
      layout
      onClick={onToggle}
      className={`
        cursor-pointer rounded-[3px] transition-colors duration-300
        ${isExpanded
          ? 'border-2 border-white/[0.18] bg-white/[0.02]'
          : isCompressed
            ? 'border border-white/[0.04] opacity-50'
            : 'border border-white/[0.08] hover:border-white/[0.15]'
        }
      `}
      transition={{ layout: { duration: 0.4, ease } }}
    >
      {/* Collapsed header — always visible */}
      <motion.div
        layout="position"
        className={`
          flex items-start justify-between gap-4
          ${isExpanded ? 'px-6 pt-6 pb-4' : isCompressed ? 'px-5 py-3' : 'px-6 py-5'}
        `}
      >
        <div className="min-w-0">
          <span className={`
            font-caption uppercase tracking-[0.15em] [font-variant-numeric:tabular-nums_slashed-zero]
            ${isCompressed ? 'text-[10px] text-white/40' : 'text-xs text-ops-text-secondary'}
          `}>
            {name}
          </span>
          {!isCompressed && (
            <p className="font-heading font-light text-sm text-ops-text-secondary mt-1">
              {tagline}
            </p>
          )}
        </div>
        <div className="text-right shrink-0">
          {!isCompressed && (
            <p className="font-heading font-light text-base sm:text-lg text-ops-text-primary [font-variant-numeric:tabular-nums_slashed-zero]">
              {startFrom}
            </p>
          )}
          {isCompressed && (
            <span className="font-heading font-light text-base text-white/40 [font-variant-numeric:tabular-nums_slashed-zero]">
              {startFrom}
            </span>
          )}
          {!isCompressed && (
            <p className="font-mono text-[10px] text-ops-text-tertiary mt-1 uppercase tracking-[0.12em] [font-variant-numeric:tabular-nums_slashed-zero]">
              {headlineSub}
            </p>
          )}
        </div>
      </motion.div>

      {/* Expanded detail */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.35, ease }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-6">
              {/* Divider */}
              <div className="border-t border-white/[0.06] mb-5" />

              {/* Features grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 mb-6">
                {features.map((feature) => (
                  <div key={feature} className="flex gap-2 items-start">
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
                    <span className="font-heading font-light text-sm text-ops-text-secondary">
                      {feature}
                    </span>
                  </div>
                ))}
              </div>

              {/* Trade examples */}
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

              {/* Milestone breakdown — 4 markers */}
              <div className="mt-6 mb-6">
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ops-text-mute mb-4 [font-variant-numeric:tabular-nums_slashed-zero]">
                  {milestonesLabel}
                </p>
                <MilestoneBar
                  amount={milestoneAmount}
                  labels={milestoneLabels}
                />
                <p className="mt-4 font-heading font-light text-xs text-ops-text-tertiary">
                  {milestonesNote}
                </p>
              </div>

              {/* Subscription + Retainer rows */}
              <div className="border-t border-white/[0.06] pt-5 mb-5 flex flex-col gap-3">
                <SummaryRow
                  label={subscriptionLabel}
                  value={subscriptionEstimate}
                  note={subscriptionNote}
                />
                <SummaryRow
                  label={retainerLabel}
                  value={retainerAmount}
                  note={retainerNote}
                />
              </div>

              {/* Guarantee badge + CTA */}
              <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                <span
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[3px] bg-ops-olive/10 border border-ops-olive/30 font-mono text-[10px] uppercase tracking-[0.15em] text-ops-olive [font-variant-numeric:tabular-nums_slashed-zero]"
                >
                  <span aria-hidden="true" className="w-1 h-1 rounded-full bg-ops-olive" />
                  {guaranteeBadge}
                </span>
                {depositsEnabled ? (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeposit(tier);
                    }}
                    className={`
                      flex-shrink-0 font-caption uppercase tracking-[0.15em] text-xs px-6 py-3 rounded-[5px]
                      transition-all duration-200 cursor-pointer whitespace-nowrap [font-variant-numeric:tabular-nums_slashed-zero]
                      focus-visible:outline focus-visible:outline-[1.5px] focus-visible:outline-ops-accent focus-visible:outline-offset-2
                      ${recommended
                        ? 'bg-ops-accent text-ops-background hover:bg-ops-accent/90'
                        : 'bg-transparent text-ops-text-primary border border-ops-border hover:border-ops-border-hover'
                      }
                    `}
                  >
                    {ctaText}
                  </button>
                ) : (
                  <a
                    href={contactCtaHref}
                    onClick={(e) => e.stopPropagation()}
                    className={`
                      flex-shrink-0 font-caption uppercase tracking-[0.15em] text-xs px-6 py-3 rounded-[5px]
                      transition-all duration-200 cursor-pointer whitespace-nowrap inline-flex items-center justify-center
                      focus-visible:outline focus-visible:outline-[1.5px] focus-visible:outline-ops-accent focus-visible:outline-offset-2
                      ${recommended
                        ? 'bg-ops-accent text-ops-background hover:bg-ops-accent/90'
                        : 'bg-transparent text-ops-text-primary border border-ops-border hover:border-ops-border-hover'
                      }
                    `}
                  >
                    {contactCtaText}
                  </a>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/**
 * Horizontal 4-marker milestone bar. Each marker shows the same
 * amount + a label (Deposit / Scope / Demo / Delivery).
 * The first marker is steel-blue (the deposit you pay now to start);
 * the remaining three are neutral white/40 (paid as work clears review).
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
      {/* Hairline track */}
      <div
        aria-hidden="true"
        className="absolute left-2 right-2 top-[5px] h-px bg-white/[0.10]"
      />
      <ol className="relative grid grid-cols-4 gap-2" role="list">
        {milestones.map((m, i) => (
          <li key={m.key} className="flex flex-col items-center text-center">
            <span
              aria-hidden="true"
              className={`block w-2.5 h-2.5 rounded-full ${
                m.isDeposit ? 'bg-ops-accent' : 'bg-white/[0.35]'
              }`}
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
 * Two-line key/value row used for the subscription + retainer rows.
 * The label is on the left, the value + note are right-aligned. Value
 * gets mono treatment; note sits below in a softer tone.
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
