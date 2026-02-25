/**
 * Leadership Assessment — Intro / Landing Page
 *
 * Route: /tools/leadership
 * Standard PageLayout (nav + footer visible).
 *
 * Sections:
 *  1. Hero with AmbientBurst background
 *  2. Two version cards (Quick / Deep)
 *  3. How it works — 3-step process
 */

import { Metadata } from 'next';
import { FadeInUp, SectionLabel, Button, Card, Divider } from '@/components/ui';
import AmbientBurst from '@/components/assessment/AmbientBurst';

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
    description: 'Our Bayesian scoring engine processes your responses and AI generates a personalized analysis.',
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
      {/* ---- Hero ---- */}
      <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden">
        {/* AmbientBurst background */}
        <AmbientBurst className="absolute inset-0 opacity-40" />

        <div className="relative z-10 max-w-[900px] mx-auto px-6 md:px-10 text-center py-32">
          <FadeInUp>
            <SectionLabel label="Leadership Tool" className="mb-6" />
          </FadeInUp>

          <FadeInUp delay={0.08}>
            <h1 className="font-heading font-bold uppercase leading-[0.92] tracking-tight text-ops-text-primary text-5xl md:text-7xl lg:text-8xl">
              Leadership
              <br />
              Assessment
            </h1>
          </FadeInUp>

          <FadeInUp delay={0.16}>
            <p className="mt-6 font-heading font-light text-lg md:text-xl text-ops-text-secondary max-w-xl mx-auto">
              Discover your leadership archetype. Understand your strengths, blind spots, and the path forward.
            </p>
          </FadeInUp>
        </div>
      </section>

      {/* ---- Version Cards ---- */}
      <section className="max-w-[1400px] mx-auto px-6 md:px-10 py-24 md:py-32">
        <FadeInUp>
          <SectionLabel label="Choose Your Path" className="mb-10" />
        </FadeInUp>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {/* Quick Version */}
          <FadeInUp delay={0.06}>
            <Card className="p-8 md:p-10 flex flex-col h-full">
              <p className="font-caption text-ops-accent uppercase tracking-[0.2em] text-xs mb-4">
                Quick
              </p>
              <h2 className="font-heading text-3xl md:text-4xl font-semibold text-ops-text-primary mb-3">
                3 Minutes
              </h2>
              <p className="font-heading font-light text-ops-text-secondary mb-2">
                15 questions
              </p>
              <p className="font-body text-ops-text-secondary text-sm mb-8 flex-1">
                A focused snapshot of your leadership profile. Get your archetype, core strengths, and key blind spots.
              </p>
              <Button variant="solid" href="/tools/leadership/assess?version=quick">
                Start Quick Assessment
              </Button>
            </Card>
          </FadeInUp>

          {/* Deep Version */}
          <FadeInUp delay={0.12}>
            <Card className="p-8 md:p-10 flex flex-col h-full">
              <p className="font-caption text-ops-accent uppercase tracking-[0.2em] text-xs mb-4">
                Deep
              </p>
              <h2 className="font-heading text-3xl md:text-4xl font-semibold text-ops-text-primary mb-3">
                12 Minutes
              </h2>
              <p className="font-heading font-light text-ops-text-secondary mb-2">
                50 questions
              </p>
              <p className="font-body text-ops-text-secondary text-sm mb-8 flex-1">
                A comprehensive leadership profile with dimensional deep-dive, population comparison, and detailed AI analysis.
              </p>
              <Button variant="solid" href="/tools/leadership/assess?version=deep">
                Start Deep Assessment
              </Button>
            </Card>
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
                <p className="font-body text-ops-text-secondary text-sm leading-relaxed">
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
