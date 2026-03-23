/**
 * ContactBlock — Contact section with full form
 * Includes extra top padding so #contact anchor doesn't show from hero
 */

import { SectionLabel, FadeInUp } from '@/components/ui';
import ContactForm from './ContactForm';
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

  const formLabels = {
    name: t('contact.form.name'),
    email: t('contact.form.email'),
    message: t('contact.form.message'),
    submit: t('contact.form.submit'),
    sending: t('contact.form.sending'),
    success: t('contact.form.success'),
    error: t('contact.form.error'),
  };

  return (
    <section id={id} className="pt-32 pb-20 scroll-mt-24">
      <FadeInUp>
        <SectionLabel label={t('contact.sectionLabel')} className="mb-6" />

        <h2 className="font-heading font-bold uppercase leading-[0.95] tracking-tight text-ops-text-primary text-3xl md:text-4xl">
          {t('contact.heading')}
        </h2>

        <p className="mt-3 font-heading font-light text-ops-text-secondary max-w-lg">
          {t('contact.responseTime')}
        </p>

        <div className="mt-3 mb-10">
          <a
            href="mailto:info@opsapp.co"
            className="font-heading text-ops-text-secondary hover:text-ops-text-primary underline transition-colors duration-200 text-sm"
          >
            info@opsapp.co
          </a>
        </div>

        <div className="max-w-2xl">
          <ContactForm labels={formLabels} />
        </div>
      </FadeInUp>
    </section>
  );
}
