/**
 * Values — Four value statements in a 2-column grid
 *
 * Server component. Kosugi caps labels with Mohave Light descriptions,
 * staggered FadeInUp animations.
 */

import { SectionLabel, FadeInUp } from '@/components/ui';

const values = [
  {
    label: 'SIMPLICITY',
    description:
      'If it needs a training manual, it\u2019s too complicated. Every feature earns its place by being obvious.',
  },
  {
    label: 'RELIABILITY',
    description:
      'Your crew shows up at 6am. Your software should too. Works offline. Syncs when it can. Never loses data.',
  },
  {
    label: 'RESPECT FOR TIME',
    description:
      'A contractor\u2019s time is money. Literally. Every tap in OPS is one we\u2019ve justified. No busywork. No admin theater.',
  },
  {
    label: 'OWNERSHIP',
    description:
      'Your data. Your operation. Your rules. We don\u2019t lock you in. We keep your business by earning it every month.',
  },
];

export default function Values() {
  return (
    <section className="py-24 md:py-32 bg-ops-background">
      <div className="max-w-[1400px] mx-auto px-6 md:px-10">
        <FadeInUp>
          <SectionLabel label="WHAT WE BELIEVE" className="mb-12" />
        </FadeInUp>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {values.map((value, i) => (
            <FadeInUp key={value.label} delay={i * 0.1}>
              <div>
                <p className="font-caption uppercase text-ops-text-primary text-sm tracking-[0.15em] mb-3">
                  {value.label}
                </p>
                <p className="font-body font-light text-ops-text-secondary text-base leading-relaxed">
                  {value.description}
                </p>
              </div>
            </FadeInUp>
          ))}
        </div>
      </div>
    </section>
  );
}
