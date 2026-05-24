import type { Metadata } from 'next';
import ResourcesHero from '@/components/resources/ResourcesHero';
import QuickLinks from '@/components/resources/QuickLinks';
import ContactBlock from '@/components/resources/ContactBlock';
import FAQ from '@/components/shared/FAQ';
import BottomCTA from '@/components/shared/BottomCTA';
import { getLocale, getTDict, buildLocaleAlternates, buildLocaleUrl } from '@/i18n/server';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  return {
    title: locale === 'es' ? 'Ayuda y Soporte' : 'Help & Support',
    description: locale === 'es'
      ? 'Obtén ayuda con OPS. Descarga la app, lee las preguntas frecuentes, o habla directamente con el fundador. Sin tickets de soporte, sin chatbots.'
      : 'Get help with OPS. Download the app, read the FAQ, or talk directly to the founder. No support tickets. No chatbots. Real answers from the person who built it.',
    openGraph: {
      url: buildLocaleUrl('/resources', locale),
    },
    alternates: buildLocaleAlternates('/resources', locale),
  };
}

export default async function ResourcesPage() {
  const dict = await getTDict('resources');
  const t = (key: string) => {
    const value = dict[key];
    return typeof value === 'string' ? value : key;
  };

  const faqItems = [
    { question: t('faq.q1.question'), answer: t('faq.q1.answer') },
    { question: t('faq.q2.question'), answer: t('faq.q2.answer') },
    { question: t('faq.q3.question'), answer: t('faq.q3.answer') },
    { question: t('faq.q4.question'), answer: t('faq.q4.answer') },
    { question: t('faq.q5.question'), answer: t('faq.q5.answer') },
    { question: t('faq.q6.question'), answer: t('faq.q6.answer') },
  ];

  /* JSON-LD structured data — FAQPage from the on-page FAQ block,
     plus a breadcrumb trail. */
  const faqLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqItems.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  };

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://opsapp.co' },
      { '@type': 'ListItem', position: 2, name: 'Help & Support', item: 'https://opsapp.co/resources' },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />

      <ResourcesHero />

      <div className="max-w-[1400px] mx-auto px-6 md:px-10 py-12">
        <QuickLinks />
      </div>

      <div className="max-w-[1400px] mx-auto px-6 md:px-10">
        <ContactBlock id="contact" />
      </div>

      <FAQ label={t('faq.sectionLabel')} items={faqItems} id="faq" />

      <BottomCTA
        heading={t('bottomCta.heading')}
        subtext={t('bottomCta.subtext')}
        buttonText={t('bottomCta.buttonText')}
        buttonHref="https://apps.apple.com/us/app/ops-job-crew-management/id6746662078"
        external
        showNewsletter
        newsletterSource="resources-cta"
      />
    </>
  );
}
