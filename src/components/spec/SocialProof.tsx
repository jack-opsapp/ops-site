'use client';

import { motion } from 'framer-motion';
import { theme } from '@/lib/theme';

const ease = theme.animation.easing as [number, number, number, number];

interface Stat {
  value: string;
  label: string;
}

interface SocialProofProps {
  subtitle: string;
  stats: Stat[];
}

export default function SocialProof({ subtitle, stats }: SocialProofProps) {
  return (
    <section className="py-16 md:py-24 bg-ops-background">
      <div className="max-w-[1400px] mx-auto px-6 sm:px-10 md:px-16 lg:px-24">
        <motion.p
          className="font-heading font-light text-sm text-ops-text-secondary text-center mb-10 max-w-[600px] mx-auto"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease }}
          viewport={{ once: true }}
        >
          {subtitle}
        </motion.p>

        <div className="flex justify-center gap-12 md:gap-20">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              className="text-center"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.08, ease }}
              viewport={{ once: true }}
            >
              <p className="font-heading font-semibold text-2xl md:text-3xl text-ops-text-primary">
                {stat.value}
              </p>
              <p className="font-caption text-[10px] text-ops-text-secondary uppercase tracking-[0.15em] mt-1">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
