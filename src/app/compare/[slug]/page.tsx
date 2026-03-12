// src/app/compare/[slug]/page.tsx

import type { Metadata } from 'next';
import Script from 'next/script';
import { notFound } from 'next/navigation';
import { getComparisonBySlug, getAllComparisonSlugs } from '@/lib/comparisons';
import type { ComparisonContent } from '@/lib/comparisons';
import IndustryHero from '@/components/industries/IndustryHero';
import IndustryPainPoints from '@/components/industries/IndustryPainPoints';
import IndustrySolutions from '@/components/industries/IndustrySolutions';
import IndustryComparison from '@/components/industries/IndustryComparison';
import IndustryFAQ from '@/components/industries/IndustryFAQ';
import IndustryCTA from '@/components/industries/IndustryCTA';
import CompareVerdict from '@/components/compare/CompareVerdict';
import { universalFAQ } from '@/lib/industries';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllComparisonSlugs().map((slug) => ({ slug }));
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

function buildProductJsonLd(competitorName: string, content: ComparisonContent) {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'OPS',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'iOS, Android',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
      description: 'Free to start. No credit card required.',
    },
    description: `OPS is a mobile-first field service management app and ${competitorName} alternative built for trade crews. Free to start with offline capability, real-time sync, and no long-term contracts.`,
  };
}

function buildBreadcrumbJsonLd(competitorName: string, slug: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://opsapp.co' },
      { '@type': 'ListItem', position: 2, name: 'Compare', item: 'https://opsapp.co/compare' },
      { '@type': 'ListItem', position: 3, name: `${competitorName} Alternative`, item: `https://opsapp.co/compare/${slug}` },
    ],
  };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const comparison = getComparisonBySlug(slug);
  if (!comparison) return {};

  const content = comparison.content.en;

  return {
    title: content.meta.title,
    description: content.meta.description,
    alternates: {
      canonical: `https://opsapp.co/compare/${slug}`,
    },
  };
}

export default async function ComparePage({ params }: PageProps) {
  const { slug } = await params;
  const comparison = getComparisonBySlug(slug);
  if (!comparison) notFound();

  const content = comparison.content.en;
  const uFaq = universalFAQ.en;

  const allFaq = [...uFaq, ...content.faq];
  const faqJsonLd = buildFaqJsonLd(allFaq);
  const productJsonLd = buildProductJsonLd(comparison.competitorName, content);
  const breadcrumbJsonLd = buildBreadcrumbJsonLd(comparison.competitorName, slug);

  // Map comparison data to IndustryComparison format
  const comparisonCompetitors: [string, string] = [
    comparison.competitorName,
    content.comparison.secondCompetitor,
  ];
  const comparisonRows = content.comparison.rows.map((row) => ({
    feature: row.feature,
    ops: row.ops,
    comp1: row.competitor,
    comp2: row.secondComp,
  }));

  return (
    <>
      {/* Structured data: FAQ, Product, Breadcrumb */}
      <Script
        id={`faq-jsonld-compare-${slug}`}
        type="application/ld+json"
        strategy="beforeInteractive"
      >
        {JSON.stringify(faqJsonLd)}
      </Script>
      <Script
        id={`product-jsonld-compare-${slug}`}
        type="application/ld+json"
        strategy="beforeInteractive"
      >
        {JSON.stringify(productJsonLd)}
      </Script>
      <Script
        id={`breadcrumb-jsonld-compare-${slug}`}
        type="application/ld+json"
        strategy="beforeInteractive"
      >
        {JSON.stringify(breadcrumbJsonLd)}
      </Script>

      <IndustryHero
        sectionLabel={content.hero.sectionLabel}
        headline={content.hero.headline}
        subtext={content.hero.subtext}
      />
      <CompareVerdict
        competitorName={comparison.competitorName}
        summary={content.verdict.summary}
        switchReasons={content.verdict.switchReasons}
        competitorStrengths={content.verdict.competitorStrengths}
        bestFor={content.verdict.bestFor}
      />
      <IndustryPainPoints
        painPoints={content.painPoints.map((pp, i) => ({
          ...pp,
          variant: comparison.painPointConfig[i]?.variant ?? 'messages',
        }))}
      />
      <IndustrySolutions
        solutions={content.solutions.map((sol, i) => ({
          ...sol,
          deviceType: comparison.solutionConfig[i]?.deviceType ?? 'phone',
          flowDirection: comparison.solutionConfig[i]?.flowDirection ?? 'left-to-right',
        }))}
      />
      <IndustryComparison
        competitors={comparisonCompetitors}
        rows={comparisonRows}
      />
      <IndustryFAQ universalFaq={uFaq} industryFaq={content.faq} />
      <IndustryCTA headline={content.cta.headline} subtext={content.cta.subtext} />
    </>
  );
}
