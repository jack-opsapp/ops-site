/**
 * OriginStory — The founder's story in three paragraphs
 */

import { SectionLabel, FadeInUp } from '@/components/ui';
import { getTDict } from '@/i18n/server';

export default async function OriginStory() {
  const dict = await getTDict('company');
  const t = (key: string) => {
    const value = dict[key];
    return typeof value === 'string' ? value : key;
  };

  return (
    <section className="py-24 md:py-32 bg-ops-background">
      <div className="max-w-[1400px] mx-auto px-6 md:px-10">
        <FadeInUp>
          <SectionLabel label={t('origin.sectionLabel')} className="mb-12" />
        </FadeInUp>

        <div className="max-w-3xl space-y-8">
          <FadeInUp delay={0}>
            <p className="font-body text-lg md:text-xl font-light leading-relaxed text-ops-text-secondary">
              {t('origin.paragraph1')}
            </p>
          </FadeInUp>

          <FadeInUp delay={0.1}>
            <p className="font-body text-lg md:text-xl font-light leading-relaxed text-ops-text-secondary">
              {t('origin.paragraph2')}
            </p>
          </FadeInUp>

          <FadeInUp delay={0.2}>
            <p className="font-body text-lg md:text-xl font-light leading-relaxed text-ops-text-secondary">
              {t('origin.paragraph3')}
            </p>
          </FadeInUp>
        </div>
      </div>
    </section>
  );
}
