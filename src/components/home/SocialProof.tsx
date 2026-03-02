/**
 * SocialProof — Testimonials + trust metrics
 *
 * Real testimonials from contractors (kept in English), plus updated stat counters.
 */

import { SectionLabel, FadeInUp, Card } from '@/components/ui';
import { getTDict } from '@/i18n/server';

// Testimonials stay in original English per plan
const testimonials = [
  {
    quote: 'I came to OPS from Jobber. We went from our crew ignoring the app, to being excited to use it.',
    name: 'Ryan M.',
    trade: 'HVAC',
    location: 'Fraser Valley',
  },
  {
    quote: 'OPS is saving me likely 2 hours daily of coordination and back & forth, which has impressed me, but more surprising is how much more efficient my crew is. Can\'t explain it, but they are getting jobs done faster, and we are getting less callbacks. No complaints here.',
    name: 'Jorge R.',
    trade: 'Painting Contractor',
    location: 'Kelowna',
  },
  {
    quote: 'It\'s an absolute game changer.',
    name: 'Harrison S.',
    trade: 'Landscaping',
    location: 'Victoria',
  },
  {
    quote: 'I was quite literally on the verge of firing my foreman on one of my crews; we might\'ve been less organized than we could, but his complaining was getting deafening. At a team meeting we decided to adopt a new software and Jack set us up with OPS, since then he\'s happy as a dog with two tails - if that\'s not proof I don\'t know what is.',
    name: 'Bobby L.',
    trade: 'Plumbing',
    location: 'Kamloops',
  },
];

export default async function SocialProof() {
  const dict = await getTDict('home');
  const t = (key: string) => {
    const value = dict[key];
    return typeof value === 'string' ? value : key;
  };

  const stats = [
    { value: t('socialProof.stat1.value'), label: t('socialProof.stat1.label') },
    { value: t('socialProof.stat2.value'), label: t('socialProof.stat2.label') },
    { value: t('socialProof.stat3.value'), label: t('socialProof.stat3.label') },
  ];

  return (
    <section className="py-24 md:py-32 bg-ops-background">
      <div className="max-w-[1400px] mx-auto px-6 md:px-10">
        {/* Section label */}
        <FadeInUp>
          <SectionLabel label={t('socialProof.sectionLabel')} />
        </FadeInUp>

        {/* Heading */}
        <FadeInUp delay={0.05}>
          <h2
            className="mt-4 font-heading font-bold uppercase leading-[0.95] tracking-tight text-ops-text-primary max-w-[700px]"
            style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)' }}
          >
            {t('socialProof.heading')}
          </h2>
        </FadeInUp>

        {/* Stat counters */}
        <div className="mt-12 md:mt-16 flex flex-col sm:flex-row gap-12 sm:gap-16 md:gap-24">
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

        {/* Testimonials grid */}
        <div className="mt-16 md:mt-20 grid grid-cols-1 md:grid-cols-2 gap-6">
          {testimonials.map((testimonial, i) => (
            <FadeInUp key={testimonial.name} delay={0.1 + i * 0.08}>
              <Card hoverable={false} className="p-8 h-full flex flex-col">
                <p className="font-heading font-light text-base text-ops-text-secondary leading-relaxed flex-1">
                  &ldquo;{testimonial.quote}&rdquo;
                </p>
                <div className="mt-6">
                  <p className="font-caption uppercase text-[11px] tracking-[0.15em] text-ops-text-primary">
                    {testimonial.name}
                  </p>
                  <p className="font-caption text-[11px] text-ops-text-secondary">
                    {testimonial.trade}, {testimonial.location}
                  </p>
                </div>
              </Card>
            </FadeInUp>
          ))}
        </div>
      </div>
    </section>
  );
}
