/**
 * Leadership Assessment — Intro / Landing Page
 *
 * Route: /tools/leadership
 * Standard PageLayout (nav + footer visible).
 *
 * Sections:
 *  1. Hero with AmbientBurst background — left-aligned
 *  2. PathSelector — interactive fork canvas (replaces cards)
 *  3. How it works — 3-step grid, left-aligned
 */

import { Metadata } from 'next';
import { FadeInUp, SectionLabel, Divider } from '@/components/ui';
import AmbientBurst from '@/components/assessment/AmbientBurst';
import PathSelector from '@/components/assessment/PathSelector';

export const metadata: Metadata = {
  title: 'Leadership Assessment',
  description: 'Discover your leadership archetype with our AI-powered assessment. Understand your strengths, blind spots, and growth path.',
};

/* ------------------------------------------------------------------ */
/*  Steps data                                                         */
/* ------------------------------------------------------------------ */

const STEPS = [
  {
    number: '01',
    title: 'Answer',
    description: 'Respond to scenario-based questions designed to reveal your natural leadership patterns.',
  },
  {
    number: '02',
    title: 'Analyze',
    description: 'Our Bayesian scoring engine processes your responses and our trained LLM builds out a detailed character analysis.',
  },
  {
    number: '03',
    title: 'Discover',
    description: 'Get your leadership archetype, dimensional scores, strengths, blind spots, and growth actions.',
  },
];

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function LeadershipIntroPage() {
  return (
    <>
      {/* ---- Hero + Path Selector (single viewport) ---- */}
      <section className="relative min-h-screen flex flex-col overflow-hidden">
        {/* AmbientBurst background */}
        <AmbientBurst className="absolute inset-0 opacity-40" />

        <div className="relative z-10 max-w-[1400px] w-full mx-auto px-6 md:px-10 pt-28 md:pt-36">
          <FadeInUp>
            <SectionLabel label="Leadership Tool" className="mb-5" />
          </FadeInUp>

          <FadeInUp delay={0.08}>
            <h1 className="font-heading font-bold uppercase leading-[0.92] tracking-tight text-ops-text-primary text-3xl sm:text-5xl md:text-7xl lg:text-8xl">
              Leadership
              <br />
              Assessment
            </h1>
          </FadeInUp>

          <FadeInUp delay={0.16}>
            <p className="mt-4 font-heading font-light text-base md:text-lg text-ops-text-secondary max-w-xl">
              Discover your leadership archetype. Understand your strengths, blind spots, and the path forward.
            </p>
          </FadeInUp>
        </div>

        {/* Path Selector — fills remaining space */}
        <div className="relative z-10 flex-1 max-w-[1400px] w-full mx-auto px-6 md:px-10 pt-6 md:pt-10 pb-8">
          <FadeInUp delay={0.24}>
            <SectionLabel label="Choose Your Path" className="mb-4 md:mb-6" />
          </FadeInUp>

          <FadeInUp delay={0.30}>
            <PathSelector />
          </FadeInUp>
        </div>
      </section>

      <div className="max-w-[1400px] mx-auto px-6 md:px-10">
        <Divider />
      </div>

      {/* ---- How It Works ---- */}
      <section className="max-w-[1400px] mx-auto px-6 md:px-10 py-24 md:py-32">
        <FadeInUp>
          <SectionLabel label="How It Works" className="mb-10" />
        </FadeInUp>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-16">
          {STEPS.map((step, i) => (
            <FadeInUp key={step.number} delay={0.06 * (i + 1)}>
              <div>
                <p className="font-heading text-6xl md:text-7xl font-bold text-ops-accent/20 mb-4">
                  {step.number}
                </p>
                <h3 className="font-heading text-xl font-semibold text-ops-text-primary mb-3 uppercase">
                  {step.title}
                </h3>
                <p className="font-heading text-ops-text-secondary text-sm leading-relaxed">
                  {step.description}
                </p>
              </div>
            </FadeInUp>
          ))}
        </div>
      </section>
    </>
  );
}
