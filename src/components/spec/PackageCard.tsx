'use client';

/**
 * PackageCard — one rung of the SPEC ladder (Tier Model v2).
 *
 * The three tiers render as an escalation — wire it → run it → own it —
 * not three equal cards (10_TIER_MODEL_V2 § 8.2). Material weight ascends
 * left→right: SPEC-01 is hairline-only, SPEC-02 carries the recommended
 * emphasis, SPEC-03 carries the strongest glass + the white-label chip.
 * The recommended flag (badge + default accent CTA) sits on SPEC-02 — the
 * guide's honesty rules drive prominence, not price.
 *
 * Always visible: designation lockup, tagline, the fixed total + payment
 * shape, the key feature list, the guarantee badge, and the CTA. A per-card
 * "DETAILS" disclosure reveals field examples, the real checkpoint schedule
 * (2 / 4 / 1+locked markers by tier), and the care-plan row.
 *
 * Accent (steel-blue) is reserved for the primary CTA + focus rings only.
 * Numbers: JetBrains Mono, tabular-lining, slashed-zero, from pricing.ts.
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { theme } from '@/lib/theme';

const ease = theme.animation.easing as [number, number, number, number];

export interface PackageExample {
  trade: string;
  desc: string;
}

/** One payment checkpoint, display-ready (amounts formatted upstream from pricing.ts). */
export interface PackageCheckpoint {
  key: 'p1' | 'p2' | 'p3' | 'p4';
  /** Human label, e.g. "Deposit" / "Delivery". */
  label: string;
  /** Formatted amount ("$1,875") or "—" when the total locks at scope sign-off. */
  amount: string;
  /** True for the slot-booking deposit marker (the one accent dot). */
  isDeposit: boolean;
}

export interface PackageWhiteLabelChip {
  label: string;
  line: string;
  priceLine: string;
}

export interface PackageCardProps {
  tier: 'spec01' | 'spec02' | 'spec03';
  /** Designation lockup, e.g. "SPEC-01 · WORKFLOWS". */
  designation: string;
  tagline: string;
  /** The price identity, e.g. "$2,000 fixed" / "from $25,000 — locked at scope sign-off". */
  totalLine: string;
  /** The payment shape at a glance, e.g. "$1,000 books it · $1,000 at delivery". */
  paymentLine: string;
  /** Care plan line, "—" when the tier carries none. */
  careLine: string;
  features: string[];
  examples: PackageExample[];
  /** Real per-tier checkpoint schedule (2 / 4 / 1+locked markers). */
  checkpoints: PackageCheckpoint[];
  checkpointsLabel: string;
  checkpointsNote: string;
  examplesLabel: string;
  careLabel: string;
  careNote: string;
  /** Quiet one-liner separating the OPS subscription from SPEC money. */
  subscriptionFootnote: string;
  guaranteeBadge: string;
  /** Deposit CTA label (e.g. "Pay $1,000 Deposit") — used when depositsEnabled. */
  ctaText: string;
  recommended?: boolean;
  /** Badge shown on the recommended tier, e.g. "MOST CHOSEN". */
  recommendedBadge: string;
  /** True when the guide picked this tier — neutral "YOUR FIT" emphasis. */
  isYourFit?: boolean;
  /** Label for the guide-fit tag, e.g. "// YOUR FIT". */
  yourFitLabel?: string;
  /** When true, this card's CTA carries the accent fill (the one primary). */
  ctaPrimary?: boolean;
  /** Disclosure toggle label, e.g. "DETAILS". */
  detailsToggle: string;
  /** Mono ledger under the CTA, e.g. "BOOKS YOUR SLOT · CREDITED TO YOUR BUILD". */
  depositLedger: string;
  /** SPEC-03 only — the quiet white-label chip. */
  whiteLabel?: PackageWhiteLabelChip;
  onDeposit: (tier: string) => void;
  /** Fired when the card's details open — keeps the phone scene tier in sync. */
  onSelect?: (tier: string) => void;
  /** Phase 0 safety — when false, render the contact link instead of Stripe. */
  depositsEnabled: boolean;
  contactCtaText: string;
  contactCtaHref: string;
}

/**
 * Material weight ascends the ladder (10_TIER_MODEL_V2 § 8.2). Fit/recommended
 * emphasis layers on top of the tier's base material.
 */
const TIER_MATERIAL: Record<PackageCardProps['tier'], string> = {
  spec01: 'border-white/[0.08] hover:border-white/[0.15]',
  spec02: 'border-white/[0.22] bg-white/[0.02]',
  spec03: 'border-white/[0.28] bg-white/[0.04]',
};

export default function PackageCard({
  tier,
  designation,
  tagline,
  totalLine,
  paymentLine,
  careLine,
  features,
  examples,
  checkpoints,
  checkpointsLabel,
  checkpointsNote,
  examplesLabel,
  careLabel,
  careNote,
  subscriptionFootnote,
  guaranteeBadge,
  ctaText,
  recommended,
  recommendedBadge,
  isYourFit,
  yourFitLabel,
  ctaPrimary,
  detailsToggle,
  depositLedger,
  whiteLabel,
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
        isYourFit ? 'border-white/30 bg-white/[0.03] ring-1 ring-white/10' : TIER_MATERIAL[tier]
      }`}
    >
      {/* Badge — guide fit overrides the static "most chosen". Both are
          neutral emphasis; accent stays on the CTA + focus rings only. */}
      {(isYourFit || recommended) && (
        <span
          className={`absolute -top-px right-5 -translate-y-1/2 bg-ops-background px-2 font-mono text-[10px] uppercase tracking-[0.18em] [font-variant-numeric:tabular-nums_slashed-zero] ${
            isYourFit ? 'text-ops-text-primary' : 'text-ops-text-secondary'
          }`}
        >
          {isYourFit ? yourFitLabel : recommendedBadge}
        </span>
      )}

      {/* Designation lockup + tagline */}
      <span className="font-mono text-xs uppercase tracking-[0.15em] text-ops-text-primary [font-variant-numeric:tabular-nums_slashed-zero]">
        {designation}
      </span>
      <p className="mt-2 font-heading font-light text-sm text-ops-text-secondary leading-relaxed">
        {tagline}
      </p>

      {/* Price identity + payment shape */}
      <div className="mt-5">
        <p className="font-heading font-light text-xl text-ops-text-primary [font-variant-numeric:tabular-nums_slashed-zero]">
          {totalLine}
        </p>
        <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.12em] text-ops-text-tertiary [font-variant-numeric:tabular-nums_slashed-zero]">
          {paymentLine}
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

              {/* Checkpoint schedule — the real per-tier shape */}
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ops-text-mute mb-4 [font-variant-numeric:tabular-nums_slashed-zero]">
                {checkpointsLabel}
              </p>
              <CheckpointBar checkpoints={checkpoints} />
              <p className="mt-4 font-heading font-light text-xs text-ops-text-tertiary">
                {checkpointsNote}
              </p>

              {/* Care plan + the subscription footnote */}
              <div className="border-t border-white/[0.06] pt-5 mt-6 flex flex-col gap-3">
                <div className="flex items-start justify-between gap-4">
                  <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-ops-text-mute pt-0.5 [font-variant-numeric:tabular-nums_slashed-zero]">
                    {careLabel}
                  </span>
                  <div className="text-right">
                    <p className="font-mono text-[12px] text-ops-text-secondary [font-variant-numeric:tabular-nums_slashed-zero]">
                      {careLine}
                    </p>
                    <p className="font-heading font-light text-[11px] text-ops-text-tertiary mt-0.5">
                      {careNote}
                    </p>
                  </div>
                </div>
                <p className="font-heading font-light text-[11px] text-ops-text-tertiary">
                  {subscriptionFootnote}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* White-label chip — SPEC-03 only, quiet, detail lives in the strip below */}
      {whiteLabel && (
        <div className="mt-6 rounded-[2px] border border-white/[0.10] bg-white/[0.02] p-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-ops-text-mute [font-variant-numeric:tabular-nums_slashed-zero]">
            {whiteLabel.label}
          </p>
          <p className="mt-1.5 font-heading font-light text-xs text-ops-text-secondary leading-snug">
            {whiteLabel.line}
          </p>
          <p className="mt-1 font-mono text-[10px] text-ops-text-tertiary [font-variant-numeric:tabular-nums_slashed-zero]">
            {whiteLabel.priceLine}
          </p>
        </div>
      )}

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
              ctaPrimary
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
              ctaPrimary
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
 * Horizontal checkpoint bar rendering the tier's REAL payment shape:
 * two markers (50/50), four markers (quarters), or deposit + three locked
 * markers (floor). The deposit marker is steel-blue; the rest are neutral.
 * Grid width follows the marker count so a 50/50 schedule reads as two
 * payments, not a 4-slot grid with holes.
 */
function CheckpointBar({ checkpoints }: { checkpoints: PackageCheckpoint[] }) {
  return (
    <div className="relative">
      <div aria-hidden="true" className="absolute left-2 right-2 top-[5px] h-px bg-white/[0.10]" />
      <ol
        className={`relative grid gap-2 ${checkpoints.length === 2 ? 'grid-cols-2' : 'grid-cols-4'}`}
        role="list"
      >
        {checkpoints.map((checkpoint) => (
          <li key={checkpoint.key} className="flex flex-col items-center text-center">
            <span
              aria-hidden="true"
              className={`block w-2.5 h-2.5 rounded-full ${
                checkpoint.isDeposit ? 'bg-ops-accent' : 'bg-white/[0.35]'
              }`}
            />
            <span className="mt-3 font-mono text-[10px] uppercase tracking-[0.15em] text-ops-text-tertiary [font-variant-numeric:tabular-nums_slashed-zero]">
              {checkpoint.key.toUpperCase()}
            </span>
            <span className="mt-1 font-mono text-[12px] text-ops-text-primary [font-variant-numeric:tabular-nums_slashed-zero]">
              {checkpoint.amount}
            </span>
            <span className="mt-0.5 font-heading font-light text-[11px] text-ops-text-tertiary">
              {checkpoint.label}
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}
