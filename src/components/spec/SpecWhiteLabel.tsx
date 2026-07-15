'use client';

/**
 * SpecWhiteLabel — the quiet white-label strip (10_TIER_MODEL_V2 § 8.6).
 *
 * One confident line + the numbers, with the honest operating detail
 * (OPS publisher-of-record, seller-line disclosure, App Transfer escape)
 * in small type. Sits after the SPEC-03 card zone. Deliberately quiet:
 * no CTA, no accent — a statement, not a pitch. The SPEC-03 card carries
 * the matching chip; this strip is where the detail lives.
 */

import { motion } from 'framer-motion';
import { theme } from '@/lib/theme';

const ease = theme.animation.easing as [number, number, number, number];

interface SpecWhiteLabelProps {
  label: string;
  line: string;
  priceLine: string;
  detail: string;
}

export default function SpecWhiteLabel({ label, line, priceLine, detail }: SpecWhiteLabelProps) {
  return (
    <section className="py-12 md:py-16 bg-ops-background">
      <div className="max-w-[1320px] mx-auto px-6 sm:px-10 md:px-16 lg:px-24">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease }}
          viewport={{ once: true, amount: 0.3 }}
          className="border-t border-b border-white/[0.08] py-8 md:flex md:items-baseline md:justify-between md:gap-12"
        >
          <div className="md:max-w-[52%]">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ops-text-mute [font-variant-numeric:tabular-nums_slashed-zero]">
              {label}
            </p>
            <p className="mt-3 font-heading font-light text-lg md:text-xl text-ops-text-primary leading-snug">
              {line}
            </p>
            <p className="mt-2 font-mono text-[11px] text-ops-text-tertiary [font-variant-numeric:tabular-nums_slashed-zero]">
              {priceLine}
            </p>
          </div>
          <p className="mt-6 md:mt-0 md:max-w-[40%] font-heading font-light text-xs text-ops-text-tertiary leading-relaxed">
            {detail}
          </p>
        </motion.div>
      </div>
    </section>
  );
}
