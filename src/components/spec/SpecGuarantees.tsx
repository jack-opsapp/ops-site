'use client';

/**
 * SpecGuarantees — "Standing Behind The Work" 3-column section.
 *
 * Renders between WhatsIncluded and SpecFAQ per 04_CUSTOMER_UX.md § 7.
 * Three columns:
 *   1. "30 days to walk away"        — Guarantee Refund explainer
 *   2. "Pay as work clears review"   — 25/25/25/25 milestone explainer
 *   3. "Scope is written before build" — Acceptance criteria explainer
 *
 * Footer links to /legal?page=spec-terms (Stage G wires the actual
 * legal prose; the route is present in the existing /legal page).
 *
 * Voice: per ops-copywriter + OPS brand. Terse, tactical, declarative.
 * No emoji, no exclamation points, sentence case in headings, UPPERCASE
 * for the section authority label.
 */

import { motion } from 'framer-motion';
import { theme } from '@/lib/theme';
import { SectionLabel } from '@/components/ui';

const ease = theme.animation.easing as [number, number, number, number];

export interface SpecGuaranteeColumn {
  title: string;
  body: string;
}

interface SpecGuaranteesProps {
  sectionLabel: string;
  columns: [SpecGuaranteeColumn, SpecGuaranteeColumn, SpecGuaranteeColumn];
  footerPrefix: string;
  footerLinkText: string;
  footerLinkHref: string;
}

export default function SpecGuarantees({
  sectionLabel,
  columns,
  footerPrefix,
  footerLinkText,
  footerLinkHref,
}: SpecGuaranteesProps) {
  return (
    <section
      id="guarantees"
      aria-label="Standing behind the work"
      className="py-24 md:py-32 bg-ops-background"
    >
      <div className="max-w-[1320px] mx-auto px-6 sm:px-10 md:px-16 lg:px-24">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease }}
          viewport={{ once: true, amount: 0.3 }}
        >
          <SectionLabel label={sectionLabel} className="mb-12" />
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
          {columns.map((col, index) => (
            <motion.article
              key={col.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.08, ease }}
              viewport={{ once: true, amount: 0.3 }}
              className="relative pt-6 border-t border-white/[0.08]"
            >
              {/* Column number marker */}
              <span
                aria-hidden="true"
                className="absolute -top-px left-0 h-px w-12 bg-white/[0.25]"
              />
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ops-text-mute mb-4 [font-variant-numeric:tabular-nums_slashed-zero]">
                0{index + 1}
              </p>
              <h3 className="font-heading font-light text-2xl md:text-[28px] leading-[1.1] text-ops-text-primary tracking-tight">
                {col.title}
              </h3>
              <p className="mt-5 font-heading font-light text-sm md:text-[15px] text-ops-text-secondary leading-relaxed">
                {col.body}
              </p>
            </motion.article>
          ))}
        </div>

        {/* Footer link to full terms */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.3, ease }}
          viewport={{ once: true }}
          className="mt-12 font-mono text-[11px] uppercase tracking-[0.15em] text-ops-text-tertiary"
        >
          {footerPrefix}{' '}
          <a
            href={footerLinkHref}
            className="text-ops-text-secondary hover:text-ops-text-primary underline underline-offset-4 decoration-white/20 hover:decoration-white/40 transition-colors"
          >
            {footerLinkText}
          </a>
        </motion.p>
      </div>
    </section>
  );
}
