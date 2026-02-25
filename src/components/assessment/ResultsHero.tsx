/**
 * ResultsHero — Archetype reveal with AmbientBurst backdrop
 *
 * Large archetype name, tagline, and subtle ambient animation.
 * Cinematic staggered entrance.
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
    <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
      {/* AmbientBurst background */}
      <AmbientBurst className="absolute inset-0 opacity-30" />

      <motion.div
        variants={containerVariants}
        initial="initial"
        animate="animate"
        className="relative z-10 max-w-[900px] mx-auto px-6 md:px-10 text-center py-32"
      >
        <motion.p
          variants={itemVariants}
          className="font-caption text-ops-text-secondary uppercase tracking-[0.2em] text-xs mb-6"
        >
          [ {firstName}&apos;s Leadership Profile ]
        </motion.p>

        <motion.h1
          variants={itemVariants}
          className="font-heading font-bold uppercase leading-[0.90] tracking-tight text-ops-text-primary text-5xl md:text-7xl lg:text-8xl"
        >
          {archetypeName}
        </motion.h1>

        <motion.p
          variants={itemVariants}
          className="mt-6 font-heading font-light text-lg md:text-xl text-ops-text-secondary max-w-xl mx-auto"
        >
          {tagline}
        </motion.p>

        {/* Subtle scroll indicator */}
        <motion.div
          variants={itemVariants}
          className="mt-16"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          >
            <svg width="20" height="32" viewBox="0 0 20 32" fill="none" className="mx-auto opacity-20">
              <rect x="1" y="1" width="18" height="30" rx="9" stroke="white" strokeWidth="1" />
              <motion.rect
                x="8" y="8" width="4" height="8" rx="2" fill="white"
                animate={{ y: [8, 16, 8] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              />
            </svg>
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
}
