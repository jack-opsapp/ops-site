import type { Metadata } from 'next';
import CompanyHero from '@/components/company/CompanyHero';
import OriginStory from '@/components/company/OriginStory';
import Values from '@/components/company/Values';
import BottomCTA from '@/components/shared/BottomCTA';
import { getLocale, getTDict } from '@/i18n/server';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  return {
    title: locale === 'es' ? 'Empresa' : 'Company',
    description: locale === 'es'
      ? 'OPS fue fundado por un contratista que escaló un negocio de decks y barandas de $0 a $1.6M — y construyó el software que su equipo realmente usaría.'
      : 'OPS was founded by a contractor who scaled a deck and railing business from $0 to $1.6M — and built the software his crew would actually use.',
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
