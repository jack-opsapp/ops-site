import type { Metadata } from 'next';
import CompanyHero from '@/components/company/CompanyHero';
import OriginStory from '@/components/company/OriginStory';
import Values from '@/components/company/Values';
import BottomCTA from '@/components/shared/BottomCTA';
import { getLocale, getTDict, buildLocaleAlternates, buildLocaleUrl } from '@/i18n/server';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  return {
    title: locale === 'es' ? 'Nuestra Historia' : 'About OPS',
    description: locale === 'es'
      ? 'OPS fue creado por un contratista que escaló de $0 a $1.6M en 4 años. Probó Jobber, ServiceTitan, Housecall Pro. Construyó el suyo.'
      : 'Built by a contractor who scaled from $0 to $1.6M in 4 years. Tried Jobber, ServiceTitan, Housecall Pro. Crew refused to use them. So he built OPS.',
    openGraph: {
      url: buildLocaleUrl('/company', locale),
    },
    alternates: buildLocaleAlternates('/company', locale),
  };
}

export default async function CompanyPage() {
  const dict = await getTDict('company');
  const t = (key: string) => {
    const value = dict[key];
    return typeof value === 'string' ? value : key;
  };

  /* JSON-LD structured data — AboutPage describes this page; the
     full Organization schema lives in the root layout. Plus a
     breadcrumb trail. */
  const aboutPageLd = {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    url: 'https://opsapp.co/company',
    name: 'About OPS',
    description: 'Built by a contractor who scaled from $0 to $1.6M in 4 years. Tried Jobber, ServiceTitan, Housecall Pro. Crew refused to use them. So he built OPS.',
    mainEntity: {
      '@type': 'Organization',
      name: 'OPS',
      url: 'https://opsapp.co',
    },
  };

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://opsapp.co' },
      { '@type': 'ListItem', position: 2, name: 'Company', item: 'https://opsapp.co/company' },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutPageLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />

      <CompanyHero />
      <OriginStory />
      <Values />
      <BottomCTA
        heading={t('bottomCta.heading')}
        buttonText={t('bottomCta.buttonText')}
        buttonHref="https://app.opsapp.co"
        external
        showNewsletter
        newsletterSource="company-cta"
      />
    </>
  );
}
