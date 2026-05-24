/**
 * Journal Index -- /journal
 *
 * Async server component. Fetches all live posts and categories,
 * renders the hero and the client-side filterable post list.
 * ISR revalidation every 5 minutes.
 */

import type { Metadata } from 'next';
import JournalHero from '@/components/journal/JournalHero';
import PostList from '@/components/journal/PostList';
import NewsletterSignup from '@/components/shared/NewsletterSignup';
import { getAllLivePosts, getBlogCategories } from '@/lib/blog';
import { getLocale, buildLocaleAlternates, buildLocaleUrl } from '@/i18n/server';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  return {
    title: locale === 'es' ? 'Journal — Blog de OPS' : 'Journal — OPS Blog',
    description: locale === 'es'
      ? 'Conversación directa sobre cómo manejar un negocio de oficios. Costos de trabajo, manejo de equipos, vender tu empresa, y lecciones del campo. Escrito por contratistas, no consultores.'
      : 'Straight talk on running a trades business. Job costing, crew management, selling your company, and lessons from the field. Written by contractors, not consultants.',
    openGraph: {
      url: buildLocaleUrl('/journal', locale),
    },
    alternates: buildLocaleAlternates('/journal', locale),
  };
}

export const revalidate = 300;

export default async function JournalPage() {
  const [posts, categories] = await Promise.all([
    getAllLivePosts(),
    getBlogCategories(),
  ]);

  return (
    <>
      <JournalHero />
      <section className="py-12 bg-ops-background">
        <div className="max-w-[1400px] mx-auto px-6 md:px-10">
          <PostList posts={posts} categories={categories} />

          {/* Newsletter signup */}
          <div className="mt-16 pt-10 border-t border-ops-border max-w-md">
            <p className="font-caption text-ops-text-secondary uppercase tracking-[0.15em] text-[11px] mb-1">
              Stay in the loop
            </p>
            <p className="font-body text-ops-text-secondary/60 text-xs mb-4">
              Product updates and what we&apos;re building — once a month.
            </p>
            <NewsletterSignup source="journal" compact />
          </div>
        </div>
      </section>
    </>
  );
}
