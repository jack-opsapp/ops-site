/**
 * PainPoints — "The Problem" section
 *
 * Server component wrapper. Three animated pain-point cards in a
 * responsive grid, each revealing on scroll with staggered delays.
 */

import { SectionLabel, FadeInUp } from '@/components/ui';
import PainPointCard from './PainPointCard';

const painPoints = [
  {
    title: 'GROUP TEXT HELL',
    description:
      "Your crew's schedule lives in a group chat. Monday morning is 47 unread messages and nobody knows where to go.",
    variant: 'messages' as const,
  },
  {
    title: 'ENTERPRISE OVERKILL',
    description:
      'Software with 200 features when you need 6. Your crew opens it once, gets lost, and never opens it again.',
    variant: 'dashboard' as const,
  },
  {
    title: 'TOOL SPRAWL',
    description:
      'Calendar here. Invoices there. Photos somewhere. Five apps and a spreadsheet to run one operation.',
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
            className="font-heading font-bold uppercase text-ops-text-primary leading-[0.95] tracking-tight mt-4"
            style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)' }}
          >
            SOFTWARE BUILT BY PEOPLE WHO
            <br />
            NEVER SWUNG A HAMMER
          </h2>
        </FadeInUp>

        {/* Pain point cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          {painPoints.map((point, i) => (
            <FadeInUp key={point.variant} delay={i * 0.1}>
              <PainPointCard
                title={point.title}
                description={point.description}
                variant={point.variant}
              />
            </FadeInUp>
          ))}
        </div>
      </div>
    </section>
  );
}
