/**
 * PlatformShowcase — Section with 3 alternating PhoneWireframeCards
 * Server component wrapper, delegates interactivity to client children
 */

import { SectionLabel, FadeInUp } from '@/components/ui';
import PhoneWireframeCard from '@/components/home/PhoneWireframeCard';

const cards = [
  {
    label: 'SCHEDULING',
    heading: 'CREWS KNOW WHERE TO GO',
    body: 'Open the app. See today\u2019s jobs. Drive to the site. No calls. No texts. No Monday morning confusion.',
    ctaText: 'SEE SCHEDULING',
    ctaHref: '/platform',
    variant: 'scheduling' as const,
    direction: 'left' as const,
  },
  {
    label: 'PROJECTS',
    heading: 'EVERY JOB. ONE PLACE.',
    body: 'Photos, notes, tasks, and status \u2014 all attached to the project. Nothing falls through the cracks.',
    ctaText: 'SEE PROJECTS',
    ctaHref: '/platform',
    variant: 'projects' as const,
    direction: 'right' as const,
  },
  {
    label: 'TEAM',
    heading: 'YOUR CREW. CONNECTED.',
    body: 'Know who\u2019s where, what they\u2019re working on, and when they\u2019re done. Without a single phone call.',
    ctaText: 'SEE TEAM',
    ctaHref: '/platform',
    variant: 'team' as const,
    direction: 'left' as const,
  },
] as const;

export default function PlatformShowcase() {
  return (
    <section className="py-24 md:py-32 bg-ops-background">
      <div className="max-w-[1400px] mx-auto px-6 md:px-10">
        {/* Section header */}
        <FadeInUp>
          <SectionLabel label="THE PLATFORM" />
          <h2 className="mt-4 font-heading font-bold uppercase leading-tight text-ops-text-primary text-4xl md:text-5xl lg:text-6xl">
            ONE APP. EVERYTHING YOUR CREW NEEDS.
          </h2>
        </FadeInUp>

        {/* Cards */}
        <div className="mt-20 md:mt-28 space-y-24 md:space-y-32">
          {cards.map((card, i) => (
            <FadeInUp key={card.variant} delay={i * 0.15}>
              <PhoneWireframeCard
                label={card.label}
                heading={card.heading}
                body={card.body}
                ctaText={card.ctaText}
                ctaHref={card.ctaHref}
                variant={card.variant}
                direction={card.direction}
              />
            </FadeInUp>
          ))}
        </div>
      </div>
    </section>
  );
}
