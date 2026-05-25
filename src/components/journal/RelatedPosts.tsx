/**
 * RelatedPosts — Light-theme 3-card grid of related journal posts.
 *
 * Server component. Queries up to 3 live posts in the same category as
 * the current post (falling back to most-recent live posts when the
 * category has fewer than 3 others). Renders inside the journal post
 * article body, after the FAQ block.
 *
 * Light theme to match the post template (white background, dark text).
 */

import Link from 'next/link';
import Image from 'next/image';
import { getRelatedLivePosts } from '@/lib/blog';

interface RelatedPostsProps {
  currentSlug: string;
  currentCategoryId: string | null;
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d
    .toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
    .toUpperCase();
}

export default async function RelatedPosts({
  currentSlug,
  currentCategoryId,
}: RelatedPostsProps) {
  const posts = await getRelatedLivePosts(currentSlug, currentCategoryId, 3);

  if (posts.length === 0) return null;

  return (
    <section
      aria-label="More from the journal"
      className="bg-ops-background-light py-16 border-t border-[rgba(26,26,26,0.08)]"
    >
      <div className="max-w-[1080px] mx-auto px-6">
        {/* Section header — bracketed caption + Mohave headline */}
        <div className="mb-10">
          <p className="font-caption text-ops-text-secondary uppercase tracking-[0.2em] text-xs">
            [ KEEP READING ]
          </p>
          <h2 className="font-heading font-bold uppercase text-ops-text-dark mt-3 text-2xl md:text-3xl tracking-tight">
            More from the journal
          </h2>
        </div>

        {/* 3-up card grid */}
        <ul className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 list-none p-0">
          {posts.map((post) => {
            const categoryName = post.blog_categories?.name ?? null;
            const teaser = post.teaser || post.summary || '';

            return (
              <li key={post.id}>
                <Link
                  href={`/journal/${post.slug}`}
                  className="group block h-full"
                >
                  <article className="h-full flex flex-col">
                    {/* Thumbnail */}
                    {post.thumbnail_url ? (
                      <div className="relative w-full aspect-[16/10] rounded-[3px] overflow-hidden bg-[rgba(26,26,26,0.04)]">
                        <Image
                          src={post.thumbnail_url}
                          alt={post.title}
                          fill
                          className="object-cover transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.03]"
                          sizes="(min-width: 768px) 320px, 100vw"
                        />
                      </div>
                    ) : (
                      <div
                        className="relative w-full aspect-[16/10] rounded-[3px] overflow-hidden"
                        style={{
                          background:
                            'linear-gradient(135deg, #1A1A1A 0%, #6F94B0 100%)',
                        }}
                        aria-hidden="true"
                      />
                    )}

                    {/* Meta row — category + date */}
                    <div className="flex items-center gap-3 mt-5">
                      {categoryName && (
                        <span className="font-caption uppercase text-[10px] tracking-[0.15em] text-ops-text-secondary">
                          {categoryName}
                        </span>
                      )}
                      {categoryName && post.published_at && (
                        <span
                          className="text-ops-text-secondary text-[10px]"
                          aria-hidden="true"
                        >
                          &middot;
                        </span>
                      )}
                      {post.published_at && (
                        <span className="font-caption uppercase text-[10px] tracking-[0.15em] text-ops-text-secondary">
                          {formatDate(post.published_at)}
                        </span>
                      )}
                    </div>

                    {/* Title */}
                    <h3 className="font-heading font-medium text-lg md:text-xl text-ops-text-dark leading-snug mt-3 transition-colors duration-200 group-hover:text-ops-accent">
                      {post.title}
                    </h3>

                    {/* Teaser */}
                    {teaser && (
                      <p className="font-heading font-light text-sm text-[rgba(26,26,26,0.65)] mt-2 line-clamp-3 leading-relaxed">
                        {teaser}
                      </p>
                    )}

                    {/* Read affordance */}
                    <span className="font-caption uppercase text-[11px] tracking-[0.15em] text-ops-text-secondary mt-4 inline-flex items-center gap-1.5 transition-colors duration-200 group-hover:text-ops-accent">
                      Read
                      <span
                        aria-hidden="true"
                        className="inline-block transition-transform duration-200 group-hover:translate-x-1"
                      >
                        &rarr;
                      </span>
                    </span>
                  </article>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
