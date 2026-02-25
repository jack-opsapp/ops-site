/**
 * PlansHero — Half-viewport hero for the Plans page
 *
 * Server component. Dark background, SectionLabel, heading, and subtext.
 * Content pushed to bottom of the hero area.
 */

import { SectionLabel, FadeInUp } from '@/components/ui';

export default function PlansHero() {
  return (
    <section className="min-h-[50vh] bg-ops-background flex flex-col justify-end">
      <div className="max-w-[1400px] mx-auto px-6 md:px-10 w-full pb-16">
        <FadeInUp>
          <SectionLabel label="PLANS" className="mb-6" />
        </FadeInUp>

        <FadeInUp delay={0.06}>
          <h1 className="font-heading font-bold uppercase text-4xl md:text-6xl text-ops-text-primary leading-[0.95] tracking-tight">
            START FREE. UPGRADE WHEN YOU&apos;RE READY.
          </h1>
        </FadeInUp>

        <FadeInUp delay={0.12}>
          <p className="font-caption uppercase tracking-[0.15em] text-[11px] text-ops-text-secondary mt-6">
            No credit card. No commitment. Cancel anytime.
          </p>
        </FadeInUp>
      </div>
    </section>
  );
}
