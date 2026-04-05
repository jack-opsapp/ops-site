'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { theme } from '@/lib/theme';

const ease = theme.animation.easing as [number, number, number, number];

export interface PackageExample {
  trade: string;
  desc: string;
}

export interface PackageCardProps {
  tier: 'setup' | 'build' | 'enterprise';
  name: string;
  tagline: string;
  price: string;
  deposit: string;
  features: string[];
  examples: PackageExample[];
  ongoing: string;
  ctaText: string;
  recommended?: boolean;
  isExpanded: boolean;
  isOtherExpanded: boolean;
  onToggle: () => void;
  onDeposit: (tier: string) => void;
}

export default function PackageCard({
  tier,
  name,
  tagline,
  price,
  deposit,
  features,
  examples,
  ongoing,
  ctaText,
  recommended,
  isExpanded,
  isOtherExpanded,
  onToggle,
  onDeposit,
}: PackageCardProps) {
  const isCompressed = !isExpanded && isOtherExpanded;

  return (
    <motion.div
      layout
      onClick={onToggle}
      className={`
        cursor-pointer rounded-[3px] transition-colors duration-300
        ${isExpanded
          ? 'border-2 border-ops-accent/50 bg-ops-accent/[0.04]'
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
          flex items-center justify-between
          ${isExpanded ? 'px-6 pt-6 pb-4' : isCompressed ? 'px-5 py-3' : 'px-6 py-5'}
        `}
      >
        <div>
          <span className={`
            font-caption uppercase tracking-[0.15em]
            ${isCompressed ? 'text-[10px] text-white/40' : 'text-xs text-ops-accent'}
          `}>
            {name}
          </span>
          {!isCompressed && (
            <p className="font-heading font-light text-sm text-ops-text-secondary mt-1">
              {tagline}
            </p>
          )}
        </div>
        <div className="text-right">
          <span className={`
            font-heading font-semibold
            ${isExpanded ? 'text-2xl' : isCompressed ? 'text-base text-white/40' : 'text-xl'}
            text-ops-text-primary
          `}>
            {price}
          </span>
          {!isCompressed && (
            <p className="font-caption text-[10px] text-ops-text-secondary mt-0.5">
              {deposit}
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
                    <svg className="w-3.5 h-3.5 mt-0.5 text-ops-accent flex-shrink-0" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="1.5">
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
                Examples — what this looks like
              </p>
              <div className="flex flex-col gap-2 mb-6">
                {examples.map((ex) => (
                  <div
                    key={ex.trade}
                    className="flex gap-3 items-start p-3 rounded-[2px] bg-ops-accent/[0.03] border border-ops-accent/[0.08]"
                  >
                    <span className="font-caption text-[10px] text-ops-accent tracking-[0.1em] whitespace-nowrap pt-0.5">
                      {ex.trade}
                    </span>
                    <span className="font-heading font-light text-xs text-ops-text-secondary leading-relaxed">
                      {ex.desc}
                    </span>
                  </div>
                ))}
              </div>

              {/* Ongoing costs + CTA */}
              <div className="flex items-center justify-between gap-4">
                <p className="font-heading font-light text-xs text-white/30">
                  {ongoing}
                </p>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeposit(tier);
                  }}
                  className={`
                    flex-shrink-0 font-caption uppercase tracking-[0.15em] text-xs px-6 py-3 rounded-[3px]
                    transition-all duration-200 cursor-pointer whitespace-nowrap
                    ${recommended
                      ? 'bg-ops-accent text-white hover:bg-ops-accent/90'
                      : 'bg-transparent text-ops-text-primary border border-ops-border hover:border-ops-border-hover'
                    }
                  `}
                >
                  {ctaText}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
