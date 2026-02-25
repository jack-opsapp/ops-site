/**
 * PlatformShowcase — "The Solution" section
 *
 * Four benefit-focused cards with "Why it matters" format.
 * Copy aligned to try-ops authority.
 */

import { SectionLabel, FadeInUp, Card } from '@/components/ui';

const features = [
  {
    title: 'NO TRAINING REQUIRED',
    copy: 'Your crew opens it once. They see their jobs. They know what to do. That\'s it.',
    why: 'Every other tool requires days of training. Your guys won\'t use software they don\'t understand. OPS is obvious from the first tap.',
  },
  {
    title: 'PHOTO DOCUMENTATION THAT WORKS',
    copy: 'Before/after shots. Progress updates. Damage documentation. Markup with arrows and notes. All organized by job.',
    why: 'No more hunting through text chains for that one photo. Everything lives with the job it belongs to.',
  },
  {
    title: 'A SCHEDULE YOUR CREW ACTUALLY READS',
    copy: 'An intuitive job board and clean daily schedule. Your crew sees what\'s coming up, who\'s assigned where, and what needs to get done \u2014 all in one glance.',
    why: 'No more morning phone calls asking \u201Cwhere am I going today?\u201D Your crew opens the app and they\'re read in.',
  },
  {
    title: 'DIRECT LINE TO THE BUILDER',
    copy: 'Missing a feature? Speak directly to the founder. We listen. We build what you actually need.',
    why: 'No support tickets. No chatbots. You talk to the person who built it and uses it every day.',
  },
];

export default function PlatformShowcase() {
  return (
    <section className="py-24 md:py-32 bg-ops-background">
      <div className="max-w-[1400px] mx-auto px-6 md:px-10">
        {/* Section header */}
        <FadeInUp>
          <SectionLabel label="THE SOLUTION" />
          <h2
            className="mt-4 font-heading font-bold uppercase leading-[0.95] tracking-tight text-ops-text-primary max-w-[700px]"
            style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)' }}
          >
            BUILT BY SOMEONE WHO ACTUALLY RUNS CREWS
          </h2>
        </FadeInUp>

        {/* Feature cards — 2x2 grid */}
        <div className="mt-12 md:mt-20 grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((feature, i) => (
            <FadeInUp key={feature.title} delay={i * 0.08}>
              <Card hoverable className="p-8 h-full">
                <h3 className="font-heading font-bold text-lg text-ops-text-primary uppercase tracking-tight">
                  {feature.title}
                </h3>
                <p className="mt-3 font-heading font-light text-base text-ops-text-secondary leading-relaxed">
                  {feature.copy}
                </p>
                <p className="mt-3 font-heading font-light text-sm text-ops-text-secondary leading-relaxed">
                  <span className="text-ops-text-primary font-normal">Why it matters:</span> {feature.why}
                </p>
              </Card>
            </FadeInUp>
          ))}
        </div>
      </div>
    </section>
  );
}
