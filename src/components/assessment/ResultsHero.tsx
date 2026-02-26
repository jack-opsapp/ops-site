/**
 * ResultsHero — Archetype reveal with AmbientBurst backdrop
 *
 * Left-aligned per design system. Section label in [ brackets ],
 * large archetype name, tagline, and down arrow scroll indicator.
 */

'use client';

import { motion } from 'framer-motion';
import AmbientBurst from './AmbientBurst';

interface ResultsHeroProps {
  archetypeName: string;
  tagline: string;
  firstName: string;
}

const containerVariants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.3 },
  },
};

const itemVariants = {
  initial: { opacity: 0, y: 24, filter: 'blur(8px)' },
  animate: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const },
  },
};

export default function ResultsHero({ archetypeName, tagline, firstName }: ResultsHeroProps) {
  return (
    <section className="relative min-h-[70vh] md:min-h-[85vh] flex items-center overflow-hidden">
      {/* AmbientBurst background */}
      <AmbientBurst className="absolute inset-0 opacity-30" />

      <motion.div
        variants={containerVariants}
        initial="initial"
        animate="animate"
        className="relative z-10 max-w-[1400px] w-full mx-auto px-6 md:px-10"
      >
        {/* Section label */}
        <motion.p
          variants={itemVariants}
          className="font-caption text-[10px] uppercase tracking-[0.25em] text-ops-text-secondary mb-8"
        >
          [ {firstName}&apos;s Leadership Profile ]
        </motion.p>

        {/* Archetype name */}
        <motion.h1
          variants={itemVariants}
          className="font-heading font-bold uppercase leading-[0.90] tracking-tight text-ops-text-primary text-3xl sm:text-5xl md:text-7xl lg:text-8xl"
        >
          {archetypeName}
        </motion.h1>

        {/* Accent divider */}
        <motion.div
          variants={itemVariants}
          className="w-16 h-px mt-8 mb-8"
          style={{ backgroundColor: 'rgba(89, 119, 148, 0.2)' }}
        />

        {/* Tagline */}
        <motion.p
          variants={itemVariants}
          className="font-heading font-light text-lg md:text-xl text-ops-text-secondary max-w-xl"
        >
          {tagline}
        </motion.p>

        {/* Down arrow — scrolls to first section */}
        <motion.div
          variants={itemVariants}
          className="mt-16"
        >
          <button
            type="button"
            onClick={() => document.getElementById('results-sphere')?.scrollIntoView({ behavior: 'smooth', block: 'center' })}
            className="cursor-pointer opacity-20 hover:opacity-40 transition-opacity duration-300"
            aria-label="Scroll to results"
          >
            <motion.div
              animate={{ y: [0, 6, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            >
              <svg width="16" height="24" viewBox="0 0 16 24" fill="none">
                <path
                  d="M8 2L8 20M8 20L2 14M8 20L14 14"
                  stroke="white"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </motion.div>
          </button>
        </motion.div>
      </motion.div>
    </section>
  );
}
