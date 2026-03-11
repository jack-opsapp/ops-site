// src/app/industries/[slug]/page.tsx

import type { Metadata } from 'next';
import Script from 'next/script';
import { notFound } from 'next/navigation';
import { getLocale } from '@/i18n/server';
import { getIndustryBySlug, getAllIndustrySlugs, universalFAQ } from '@/lib/industries';
import type { IndustryContent } from '@/lib/industries';
import IndustryHero from '@/components/industries/IndustryHero';
import IndustryPainPoints from '@/components/industries/IndustryPainPoints';
import IndustrySolutions from '@/components/industries/IndustrySolutions';
import IndustryComparison from '@/components/industries/IndustryComparison';
import IndustryFAQ from '@/components/industries/IndustryFAQ';
import IndustryCTA from '@/components/industries/IndustryCTA';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllIndustrySlugs().map((slug) => ({ slug }));
}

function buildFaqJsonLd(allFaq: Array<{ question: string; answer: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: allFaq.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const industry = getIndustryBySlug(slug);
  if (!industry) return {};

  const locale = await getLocale();
  const content: IndustryContent = industry.content[locale] ?? industry.content.en;

  return {
    title: content.meta.title,
    description: content.meta.description,
    alternates: {
      canonical: `https://opsapp.co/industries/${slug}`,
    },
  };
}

export default async function IndustryPage({ params }: PageProps) {
  const { slug } = await params;
  const industry = getIndustryBySlug(slug);
  if (!industry) notFound();

  const locale = await getLocale();
  const content: IndustryContent = industry.content[locale] ?? industry.content.en;
  const uFaq = universalFAQ[locale] ?? universalFAQ.en;

  const allFaq = [...uFaq, ...content.faq];
  const faqJsonLd = buildFaqJsonLd(allFaq);

  return (
    <>
      <Script
        id={`faq-jsonld-${slug}`}
        type="application/ld+json"
        strategy="beforeInteractive"
      >
        {JSON.stringify(faqJsonLd)}
      </Script>
      <IndustryHero
        sectionLabel={content.hero.sectionLabel}
        headline={content.hero.headline}
        subtext={content.hero.subtext}
      />
      <IndustryPainPoints
        painPoints={content.painPoints.map((pp, i) => ({
          ...pp,
          variant: industry.painPointConfig[i]?.variant ?? 'messages',
        }))}
      />
      <IndustrySolutions
        solutions={content.solutions.map((sol, i) => ({
          ...sol,
          deviceType: industry.solutionConfig[i]?.deviceType ?? 'phone',
          flowDirection: industry.solutionConfig[i]?.flowDirection ?? 'left-to-right',
        }))}
      />
      <IndustryComparison
        competitors={content.comparison.competitors}
        rows={content.comparison.rows}
      />
      <IndustryFAQ universalFaq={uFaq} industryFaq={content.faq} />
      <IndustryCTA headline={content.cta.headline} subtext={content.cta.subtext} />
    </>
  );
}
