/**
 * BlogPostRow — Shared row component for blog post listings
 *
 * Server component. Used on the home page (JournalPreview) and journal index.
 * Renders a single post as a horizontal row with date, title/teaser, and thumbnail.
 */

import Link from 'next/link';
import Image from 'next/image';
import { Divider } from '@/components/ui';
import type { BlogPostWithCategory } from '@/lib/blog';

interface BlogPostRowProps {
  post: BlogPostWithCategory;
}

function formatDate(dateString: string | null): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  }).format(date).toUpperCase();
}

export default function BlogPostRow({ post }: BlogPostRowProps) {
  const categoryName = post.blog_categories?.name ?? null;

  return (
    <Link
      href={`/journal/${post.slug}`}
      className="block group"
    >
      <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-8 py-6">
        {/* Date */}
        <div className="shrink-0 md:w-32">
          <span className="font-caption uppercase text-ops-text-secondary text-xs tracking-wide">
            {formatDate(post.published_at)}
          </span>
        </div>

        {/* Title + Teaser */}
        <div className="flex-1 min-w-0">
          <h3 className="font-heading font-medium text-lg text-ops-text-primary leading-snug group-hover:text-white/80 transition-colors duration-200">
            {post.title}
          </h3>
          {post.teaser && (
            <p className="font-heading font-light text-sm text-ops-text-secondary mt-1 truncate">
              {post.teaser}
            </p>
          )}
        </div>

        {/* Thumbnail */}
        {post.thumbnail_url && (
          <div className="shrink-0 relative w-16 h-16 rounded-[3px] overflow-hidden">
            <Image
              src={post.thumbnail_url}
              alt={post.title}
              fill
              className="object-cover"
              sizes="64px"
            />
            {/* Feathered edge */}
            <div
              className="absolute inset-0 bg-gradient-to-l from-transparent to-ops-background/30"
              aria-hidden="true"
            />
          </div>
        )}
      </div>

      {/* Meta row: category + read link */}
      <div className="flex items-center gap-4 pb-6">
        {categoryName && (
          <span className="font-caption uppercase text-[10px] text-ops-text-secondary tracking-wide">
            {categoryName}
          </span>
        )}
        <span className="font-caption text-[11px] text-ops-text-secondary group-hover:text-ops-text-primary transition-colors duration-200 tracking-wide">
          READ -&gt;
        </span>
      </div>

      <Divider />
    </Link>
  );
}
