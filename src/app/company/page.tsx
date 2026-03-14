import type { Metadata } from 'next';
import CompanyHero from '@/components/company/CompanyHero';
import OriginStory from '@/components/company/OriginStory';
import Values from '@/components/company/Values';
import BottomCTA from '@/components/shared/BottomCTA';
import { getLocale, getTDict } from '@/i18n/server';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  return {
    title: locale === 'es' ? 'Nuestra Historia' : 'About OPS',
    description: locale === 'es'
      ? 'OPS fue creado por un contratista que escaló un negocio de decks de $0 a $1.6M en 4 años. Probó Jobber, ServiceTitan, Housecall Pro. Ninguno funcionó. Así que construyó el suyo.'
      : 'OPS was built by a contractor who scaled a deck and railing business from $0 to $1.6M in 4 years. Tried Jobber, ServiceTitan, Housecall Pro. None worked for his crew. So he built his own.',
    alternates: {
      canonical: 'https://opsapp.co/company',
    },
  };
}

export default async function CompanyPage() {
  const dict = await getTDict('company');
  const t = (key: string) => {
    const value = dict[key];
    return typeof value === 'string' ? value : key;
  };

  return (
    <>
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
