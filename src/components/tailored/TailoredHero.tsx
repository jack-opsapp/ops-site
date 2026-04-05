'use client';

import { motion } from 'framer-motion';
import { theme } from '@/lib/theme';
import { SectionLabel } from '@/components/ui';

const ease = theme.animation.easing as [number, number, number, number];

interface TailoredHeroProps {
  eyebrow: string;
  heading: string;
  subtitle: string;
  ctaPackages: string;
  ctaHowItWorks: string;
}

function scrollTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
}

export default function TailoredHero({
  eyebrow,
  heading,
  subtitle,
  ctaPackages,
  ctaHowItWorks,
}: TailoredHeroProps) {
  return (
    <section className="relative min-h-screen w-full overflow-clip bg-ops-background">
      {/* Background gradients — matches PlatformHero */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#111111] via-ops-background to-[#050508]" />
      <div className="absolute inset-0 bg-gradient-to-tr from-[#0A0A0A] via-transparent to-[#0D1117]/30" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0A0E14]/20 to-ops-background/90" />

      {/* Noise texture */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")',
          backgroundRepeat: 'repeat',
          backgroundSize: '256px 256px',
        }}
        aria-hidden="true"
      />

      {/* Content */}
      <div className="relative z-10 min-h-screen flex items-center">
        <div className="max-w-[1400px] mx-auto px-6 sm:px-10 md:px-16 lg:px-24 w-full">
          <div className="max-w-[640px]">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease }}
            >
              <SectionLabel label={eyebrow} className="mb-6" />
            </motion.div>

            <motion.h1
              className="font-heading font-bold uppercase leading-[0.95] tracking-tight text-ops-text-primary text-[2.2rem] sm:text-[3.5rem] md:text-[4.5rem]"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1, ease }}
            >
              {heading}
            </motion.h1>

            <motion.p
              className="mt-6 font-heading font-light text-base sm:text-lg text-ops-text-secondary max-w-[500px] leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2, ease }}
            >
              {subtitle}
            </motion.p>

            <motion.div
              className="mt-10 flex gap-4"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.35, ease }}
            >
              <button
                onClick={() => scrollTo('packages')}
                className="inline-flex items-center justify-center font-caption uppercase tracking-[0.15em] text-xs px-6 py-3 rounded-[3px] transition-all duration-200 cursor-pointer bg-ops-accent text-white hover:bg-ops-accent/90 active:bg-ops-accent/80"
              >
                {ctaPackages}
              </button>
              <button
                onClick={() => scrollTo('process')}
                className="inline-flex items-center justify-center font-caption uppercase tracking-[0.15em] text-xs px-6 py-3 rounded-[3px] transition-all duration-200 cursor-pointer bg-transparent text-ops-text-primary border border-ops-border hover:border-ops-border-hover"
              >
                {ctaHowItWorks}
              </button>
            </motion.div>
          </div>

          {/* Right column — phone placeholder for Phase B */}
          {/* Phone will be positioned absolutely here, matching PlatformHero pattern */}
        </div>
      </div>
    </section>
  );
}
