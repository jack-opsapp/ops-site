/**
 * LegalContent — Renders a single legal document with TOC and sections
 *
 * Client component for Framer Motion AnimatePresence transitions
 * between tab switches. Includes anchor-linked table of contents.
 */

'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Divider } from '@/components/ui';
import type { LegalDocument } from '@/lib/legal-content';

interface LegalContentProps {
  document: LegalDocument;
}

export default function LegalContent({ document: doc }: LegalContentProps) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={doc.title}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
        className="max-w-3xl"
      >
        {/* Last updated */}
        <p className="font-caption uppercase text-[10px] tracking-[0.15em] text-ops-text-secondary mt-10 mb-8">
          Last updated: {doc.lastUpdated}
        </p>

        {/* Table of contents */}
        <nav aria-label="Table of contents" className="space-y-2 mb-6">
          {doc.sections.map((section) => (
            <a
              key={section.id}
              href={`#${section.id}`}
              className="block font-caption uppercase text-[11px] tracking-[0.15em] text-ops-text-secondary hover:text-ops-accent transition-colors duration-200"
            >
              {section.title}
            </a>
          ))}
        </nav>

        <Divider className="bg-ops-text-dark/10" />

        {/* Sections */}
        {doc.sections.map((section) => (
          <div key={section.id}>
            <h2
              id={section.id}
              className="font-heading font-semibold text-xl text-ops-text-dark pt-8 pb-3"
            >
              {section.title}
            </h2>
            <p className="font-body text-base leading-relaxed text-ops-text-dark/80">
              {section.content}
            </p>
          </div>
        ))}
      </motion.div>
    </AnimatePresence>
  );
}
