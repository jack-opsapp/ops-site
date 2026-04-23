/**
 * Journal Post — /journal/[slug]
 *
 * Async server component. Fetches a single blog post by slug and renders
 * the full article with header, content, optional FAQ, and back link.
 * Light theme page (white background, dark text).
 *
 * ISR revalidation every 5 minutes.
 *
 * NOTE: dangerouslySetInnerHTML is used for JSON-LD structured data only.
 * The content is static schema.org metadata generated from trusted DB fields.
 */

import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getPostBySlug, getAllLiveSlugs } from '@/lib/blog';
import PostHeader from '@/components/journal/PostHeader';
import PostContent from '@/components/journal/PostContent';
import PostFAQ from '@/components/journal/PostFAQ';

export const revalidate = 300;

/* -------------------------------------------------------------------------- */
/*  Static params                                                             */
/* -------------------------------------------------------------------------- */

export async function generateStaticParams() {
  const slugs = await getAllLiveSlugs();
  return slugs.map(({ slug }) => ({ slug }));
}

/* -------------------------------------------------------------------------- */
/*  Metadata                                                                  */
/* -------------------------------------------------------------------------- */

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    return { title: 'Post Not Found' };
  }

  return {
    title: post.meta_title || post.title,
    description: post.summary || post.teaser || undefined,
    openGraph: {
      title: post.meta_title || post.title,
      description: post.summary || post.teaser || undefined,
      images: post.thumbnail_url
        ? [{ url: post.thumbnail_url, width: 1200, height: 630, alt: post.title }]
        : undefined,
      type: 'article',
      publishedTime: post.published_at || undefined,
      authors: [post.author || 'OPS Team'],
    },
    alternates: {
      canonical: `https://opsapp.co/journal/${post.slug}`,
    },
  };
}

/* -------------------------------------------------------------------------- */
/*  Page                                                                      */
/* -------------------------------------------------------------------------- */

export default async function JournalPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  /* JSON-LD structured data */
  const jsonLd: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.summary || post.teaser || undefined,
    author: { '@type': 'Person', name: post.author || 'OPS Team' },
    datePublished: post.published_at,
    url: `https://opsapp.co/journal/${post.slug}`,
    publisher: {
      '@type': 'Organization',
      name: 'OPS',
      url: 'https://opsapp.co',
      logo: {
        '@type': 'ImageObject',
        url: 'https://opsapp.co/brand/ops-lockup-email.png',
      },
    },
    image: post.thumbnail_url,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://opsapp.co/journal/${post.slug}`,
    },
    ...(post.word_count > 0 && { wordCount: post.word_count }),
  };

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://opsapp.co' },
      { '@type': 'ListItem', position: 2, name: 'Journal', item: 'https://opsapp.co/journal' },
      { '@type': 'ListItem', position: 3, name: post.title, item: `https://opsapp.co/journal/${post.slug}` },
    ],
  };

  /* Add FAQ schema if FAQs exist */
  const faqSchema =
    post.faqs?.length > 0
      ? {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: post.faqs.map((faq) => ({
            '@type': 'Question',
            name: faq.question,
            acceptedAnswer: {
              '@type': 'Answer',
              text: faq.answer,
            },
          })),
        }
      : null;

  return (
    <div className="bg-ops-background-light min-h-screen">
      {/* Article structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Breadcrumb structured data — values from trusted DB fields only */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />

      {/* FAQ structured data (separate schema) */}
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}

      <PostHeader post={post} />

      <PostContent content={post.content} />

      {post.faqs?.length > 0 && <PostFAQ faqs={post.faqs} />}

      {/* Back link */}
      <div className="bg-ops-background-light">
        <div className="max-w-[680px] mx-auto px-6 py-12">
          <Link
            href="/journal"
            className="inline-flex items-center font-caption uppercase tracking-[0.15em] text-xs text-ops-text-dark/60 hover:text-ops-accent transition-colors duration-200"
          >
            &larr; BACK TO JOURNAL
          </Link>
        </div>
      </div>
    </div>
  );
}
