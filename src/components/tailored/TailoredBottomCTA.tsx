'use client';

import { motion } from 'framer-motion';
import { theme } from '@/lib/theme';

const ease = theme.animation.easing as [number, number, number, number];

interface TailoredBottomCTAProps {
  heading: string;
  subtitle: string;
  ctaText: string;
}

function scrollTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
}

export default function TailoredBottomCTA({
  heading,
  subtitle,
  ctaText,
}: TailoredBottomCTAProps) {
  return (
    <section className="py-24 md:py-32 bg-ops-background">
      <div className="max-w-[800px] mx-auto px-6 sm:px-10 md:px-16 text-center">
        <motion.h2
          className="font-heading font-bold uppercase text-2xl md:text-3xl text-ops-text-primary tracking-tight"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease }}
          viewport={{ once: true }}
        >
          {heading}
        </motion.h2>
        <motion.p
          className="font-heading font-light text-sm text-ops-text-secondary mt-4"
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease }}
          viewport={{ once: true }}
        >
          {subtitle}
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2, ease }}
          viewport={{ once: true }}
        >
          <button
            onClick={() => scrollTo('packages')}
            className="mt-8 inline-flex items-center justify-center font-caption uppercase tracking-[0.15em] text-xs px-8 py-3.5 rounded-[3px] transition-all duration-200 cursor-pointer bg-ops-accent text-white hover:bg-ops-accent/90"
          >
            {ctaText}
          </button>
        </motion.div>
      </div>
    </section>
  );
}
