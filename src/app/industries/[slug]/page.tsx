// src/app/industries/[slug]/page.tsx

import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getLocale } from '@/i18n/server';
import { getIndustryBySlug, getAllIndustrySlugs, universalFAQ } from '@/lib/industries';
import type { IndustryContent } from '@/lib/industries';

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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      {/* Section components added in subsequent tasks */}
      <div data-industry={slug}>
        <p className="text-white p-20">Industry page: {industry.name}</p>
      </div>
    </>
  );
}
