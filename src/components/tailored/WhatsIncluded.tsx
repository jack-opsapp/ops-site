'use client';

import { motion } from 'framer-motion';
import { theme } from '@/lib/theme';
import { SectionLabel } from '@/components/ui';

const ease = theme.animation.easing as [number, number, number, number];

interface WhatsIncludedProps {
  sectionLabel: string;
  items: string[];
  ongoingLabel: string;
  ongoingItems: string[];
}

export default function WhatsIncluded({
  sectionLabel,
  items,
  ongoingLabel,
  ongoingItems,
}: WhatsIncludedProps) {
  return (
    <section className="py-24 md:py-32 bg-ops-background">
      <div className="max-w-[1400px] mx-auto px-6 sm:px-10 md:px-16 lg:px-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease }}
            viewport={{ once: true, amount: 0.3 }}
          >
            <SectionLabel label={sectionLabel} className="mb-8" />
            <div className="flex flex-col gap-3">
              {items.map((item) => (
                <div key={item} className="flex gap-3 items-start">
                  <svg className="w-3.5 h-3.5 mt-0.5 text-ops-accent flex-shrink-0" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="1.5">
                    <path d="M3 8.5l3.5 3.5L13 4.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span className="font-heading font-light text-sm text-ops-text-secondary leading-relaxed">
                    {item}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease }}
            viewport={{ once: true, amount: 0.3 }}
          >
            <SectionLabel label={ongoingLabel} className="mb-8" />
            <div className="flex flex-col gap-3">
              {ongoingItems.map((item) => (
                <div key={item} className="flex gap-3 items-start">
                  <span className="text-ops-accent text-xs mt-0.5 flex-shrink-0">&#9670;</span>
                  <span className="font-heading font-light text-sm text-ops-text-secondary leading-relaxed">
                    {item}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
