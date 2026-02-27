/**
 * PainPoints — "The Problem" section
 *
 * Three animated pain-point cards with bullet format,
 * plus resolution callout. Copy aligned to try-ops authority.
 */

import { SectionLabel, FadeInUp } from '@/components/ui';
import PainPointCard from './PainPointCard';

const painPoints = [
  {
    title: 'GROUP TEXT HELL',
    bullets: [
      '"What\'s the address?"',
      '"Who\'s going where?"',
      '"Did anyone update the client?"',
      'Messages lost in scroll',
    ],
    forLine: 'For 1-10 person crews with no software',
    variant: 'messages' as const,
  },
  {
    title: 'ENTERPRISE OVERKILL',
    bullets: [
      'Training takes days',
      'Features you\'ll never use',
      '"It\'s just somewhat complicated"',
      'Your crew avoids opening it',
    ],
    forLine: 'For crews who tried Jobber/ServiceTitan and it\'s too much',
    variant: 'dashboard' as const,
  },
  {
    title: 'TOOL SPRAWL',
    bullets: [
      'Spreadsheets for scheduling',
      'Whiteboard for crew assignments',
      'Group texts for updates',
      'Sticky notes for everything else',
    ],
    forLine: 'For operations duct-taping manual solutions together',
    variant: 'apps' as const,
  },
];

export default function PainPoints() {
  return (
    <section className="py-24 md:py-32 bg-ops-background">
      <div className="max-w-[1400px] mx-auto px-6 md:px-10">
        {/* Section label */}
        <FadeInUp>
          <SectionLabel label="THE PROBLEM" />
        </FadeInUp>

        {/* Heading */}
        <FadeInUp delay={0.05}>
          <h2
            className="font-heading font-bold uppercase text-ops-text-primary leading-[0.95] tracking-tight mt-4 max-w-[800px]"
            style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)' }}
          >
            YOU&apos;RE EITHER DROWNING IN CHAOS OR PAYING FOR SOFTWARE NOBODY USES
          </h2>
        </FadeInUp>

        {/* Pain point cards — carousel on mobile, grid on desktop */}
        <div className="mt-12 -mx-6 px-6 md:mx-0 md:px-0">
          <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-4 md:grid md:grid-cols-3 md:gap-6 md:overflow-visible md:snap-none md:pb-0 scrollbar-hide">
            {painPoints.map((point, i) => (
              <FadeInUp key={point.variant} delay={i * 0.1}>
                <div className="min-w-[280px] w-[85vw] max-w-[340px] snap-center shrink-0 md:min-w-0 md:w-auto md:max-w-none md:snap-align-none">
                  <PainPointCard
                    title={point.title}
                    bullets={point.bullets}
                    forLine={point.forLine}
                    variant={point.variant}
                  />
                </div>
              </FadeInUp>
            ))}
          </div>
        </div>

        {/* Resolution callout */}
        <FadeInUp delay={0.3}>
          <div className="border-t-2 border-ops-border pt-6 mt-16 max-w-[700px]">
            <p className="font-heading font-light text-lg text-ops-text-primary leading-relaxed">
              One app. Your crew opens it and knows what to do. No manual. No training. No dedicated IT guy necessary.
            </p>
          </div>
        </FadeInUp>
      </div>
    </section>
  );
}
