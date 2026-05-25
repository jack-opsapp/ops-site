/**
 * RelatedJournalPosts — Curated journal posts surfaced on industry +
 * compare pages.
 *
 * Server component. Pulls live posts matching the provided slug list
 * directly from Supabase and renders them in the curator-supplied
 * order. Renders nothing when no slugs match (acceptable per audit:
 * quality > coverage).
 */

import Link from 'next/link';
import Image from 'next/image';
import { SectionLabel } from '@/components/ui';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import type { BlogPostWithCategory } from '@/lib/blog';

interface RelatedJournalPostsProps {
  slugs: string[];
  /** Optional override for the section heading. */
  heading?: string;
  /** Optional override for the section label. */
  sectionLabel?: string;
}

/**
 * Fetch live posts by slug list. Inline here (rather than in
 * `src/lib/blog.ts`) because the journal cluster is being worked in
 * a parallel session; keeping this self-contained avoids commingling.
 */
async function getPostsBySlugs(slugs: string[]): Promise<BlogPostWithCategory[]> {
  if (slugs.length === 0) return [];

  let client;
  try {
    client = getSupabaseAdmin();
  } catch {
    return [];
  }

  const { data, error } = await client
    .from('blog_posts')
    .select('*, blog_categories!category_id(name, slug)')
    .eq('is_live', true)
    .in('slug', slugs);

  if (error) {
    console.error('[RelatedJournalPosts] query error:', error.message);
    return [];
  }

  const bySlug = new Map<string, BlogPostWithCategory>();
  for (const post of (data ?? []) as BlogPostWithCategory[]) {
    bySlug.set(post.slug, post);
  }

  return slugs
    .map((slug) => bySlug.get(slug))
    .filter((p): p is BlogPostWithCategory => p !== undefined);
}

export default async function RelatedJournalPosts({
  slugs,
  heading = 'READ THE FIELD NOTES',
  sectionLabel = 'FROM THE JOURNAL',
}: RelatedJournalPostsProps) {
  if (!slugs || slugs.length === 0) return null;

  const posts = (await getPostsBySlugs(slugs)).slice(0, 5);
  if (posts.length === 0) return null;

  const gridCols =
    posts.length >= 4
      ? 'md:grid-cols-2 lg:grid-cols-4'
      : posts.length === 3
        ? 'md:grid-cols-3'
        : 'md:grid-cols-2';

  return (
    <section className="py-16 md:py-24 bg-ops-background border-t border-ops-border">
      <div className="max-w-[1400px] mx-auto px-6 md:px-10">
        <SectionLabel label={sectionLabel} />
        <h2 className="mt-4 font-heading font-bold uppercase text-ops-text-primary text-2xl md:text-3xl tracking-tight leading-[0.95]">
          {heading}
        </h2>

        <div className={`mt-10 md:mt-12 grid grid-cols-1 ${gridCols} gap-6`}>
          {posts.map((post) => {
            const categoryName = post.blog_categories?.name ?? null;
            return (
              <Link
                key={post.slug}
                href={`/journal/${post.slug}`}
                className="group flex flex-col bg-ops-surface border border-ops-border rounded-[3px] overflow-hidden transition-all duration-300 hover:border-ops-border-hover hover:-translate-y-1"
              >
                {post.thumbnail_url && (
                  <div className="relative aspect-[16/10] w-full overflow-hidden">
                    <Image
                      src={post.thumbnail_url}
                      alt={post.title}
                      fill
                      sizes="(min-width: 1024px) 320px, (min-width: 768px) 50vw, 100vw"
                      className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                    />
                    <div
                      className="absolute inset-0 bg-gradient-to-t from-ops-background/40 to-transparent"
                      aria-hidden="true"
                    />
                  </div>
                )}

                <div className="flex flex-col flex-1 p-5">
                  {categoryName && (
                    <p className="font-caption uppercase text-ops-text-secondary text-[10px] tracking-[0.15em]">
                      {categoryName}
                    </p>
                  )}

                  <h3 className="mt-2 font-heading font-medium text-base text-ops-text-primary leading-snug line-clamp-3">
                    {post.title}
                  </h3>

                  {post.teaser && (
                    <p className="mt-2 font-heading font-light text-sm text-ops-text-secondary leading-relaxed line-clamp-3 flex-1">
                      {post.teaser}
                    </p>
                  )}

                  <span className="mt-4 font-caption uppercase tracking-[0.15em] text-[11px] text-ops-accent group-hover:text-ops-text-primary transition-colors">
                    Read -&gt;
                  </span>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="mt-8">
          <Link
            href="/journal"
            className="font-caption uppercase tracking-[0.15em] text-xs text-ops-text-secondary hover:text-ops-accent transition-colors"
          >
            All field notes -&gt;
          </Link>
        </div>
      </div>
    </section>
  );
}
