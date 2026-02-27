import type { Metadata } from 'next';
import CompanyHero from '@/components/company/CompanyHero';
import OriginStory from '@/components/company/OriginStory';
import Values from '@/components/company/Values';
import BottomCTA from '@/components/shared/BottomCTA';

export const metadata: Metadata = {
  title: 'Company',
  description:
    'OPS was founded by a contractor who scaled a deck and railing business from $0 to $1.6M — and built the software his crew would actually use.',
};

export default function CompanyPage() {
  return (
    <>
      <CompanyHero />
      <OriginStory />
      <Values />
      <BottomCTA
        heading="JOIN THE TRADES THAT RUN ON OPS"
        buttonText="GET OPS"
        buttonHref="/login?mode=signup"
      />
    </>
  );
}
