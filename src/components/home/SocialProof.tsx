/**
 * SocialProof — Trust metrics section
 *
 * Server component. Displays placeholder stat counters with
 * staggered scroll-triggered animation.
 */

import { SectionLabel, FadeInUp } from '@/components/ui';

const stats = [
  { value: '500+', label: 'ACTIVE CREWS' },
  { value: '$2.4M+', label: 'REVENUE MANAGED' },
  { value: '12K+', label: 'JOBS COMPLETED' },
];

export default function SocialProof() {
  return (
    <section className="pt-12 md:pt-16 pb-24 md:pb-32 bg-ops-background">
      <div className="max-w-[1400px] mx-auto px-6 md:px-10">
        {/* Section label */}
        <FadeInUp>
          <SectionLabel label="THE TRADES" />
        </FadeInUp>

        {/* Heading */}
        <FadeInUp delay={0.05}>
          <h2 className="mt-4 font-heading font-bold uppercase leading-tight text-ops-text-primary text-4xl md:text-5xl lg:text-6xl">
            TRUSTED BY CONTRACTORS WHO BUILD
          </h2>
        </FadeInUp>

        {/* Stat counters */}
        <div className="mt-16 md:mt-20 flex flex-col sm:flex-row gap-12 sm:gap-16 md:gap-24">
          {stats.map((stat, i) => (
            <FadeInUp key={stat.label} delay={0.1 + i * 0.1}>
              <div>
                <p className="font-heading font-bold text-5xl md:text-6xl lg:text-7xl text-ops-text-primary leading-none">
                  {stat.value}
                </p>
                <p className="mt-3 font-caption uppercase text-xs tracking-[0.15em] text-ops-text-secondary">
                  {stat.label}
                </p>
              </div>
            </FadeInUp>
          ))}
        </div>
      </div>
    </section>
  );
}
