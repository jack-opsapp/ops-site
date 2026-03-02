/**
 * ContactBlock — Left-aligned contact section with email and CTA
 */

import { SectionLabel, FadeInUp } from '@/components/ui';
import Button from '@/components/ui/Button';
import { getTDict } from '@/i18n/server';

interface ContactBlockProps {
  id?: string;
}

export default async function ContactBlock({ id }: ContactBlockProps) {
  const dict = await getTDict('resources');
  const t = (key: string) => {
    const value = dict[key];
    return typeof value === 'string' ? value : key;
  };

  return (
    <section id={id} className="py-20">
      <FadeInUp>
        <SectionLabel label={t('contact.sectionLabel')} className="mb-6" />

        <h2 className="font-heading font-bold uppercase leading-[0.95] tracking-tight text-ops-text-primary text-3xl md:text-4xl">
          {t('contact.heading')}
        </h2>

        <div className="mt-8">
          <a
            href="mailto:hello@opsapp.co"
            className="font-heading text-ops-text-secondary hover:text-ops-text-primary underline transition-colors duration-200"
          >
            hello@opsapp.co
          </a>

          <p className="mt-3 font-heading font-light text-ops-text-secondary">
            {t('contact.responseTime')}
          </p>
        </div>

        <div className="mt-8">
          <Button variant="ghost" href="mailto:hello@opsapp.co" external>
            {t('contact.ctaText')}
          </Button>
        </div>
      </FadeInUp>
    </section>
  );
}
