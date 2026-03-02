/**
 * Values — Four value statements in a 2-column grid
 */

import { SectionLabel, FadeInUp } from '@/components/ui';
import { getTDict } from '@/i18n/server';

export default async function Values() {
  const dict = await getTDict('company');
  const t = (key: string) => {
    const value = dict[key];
    return typeof value === 'string' ? value : key;
  };

  const values = [
    {
      label: t('values.simplicity.label'),
      description: t('values.simplicity.description'),
    },
    {
      label: t('values.reliability.label'),
      description: t('values.reliability.description'),
    },
    {
      label: t('values.respectForTime.label'),
      description: t('values.respectForTime.description'),
    },
    {
      label: t('values.ownership.label'),
      description: t('values.ownership.description'),
    },
  ];

  return (
    <section className="py-24 md:py-32 bg-ops-background">
      <div className="max-w-[1400px] mx-auto px-6 md:px-10">
        <FadeInUp>
          <SectionLabel label={t('values.sectionLabel')} className="mb-12" />
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
