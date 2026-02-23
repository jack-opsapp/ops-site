/**
 * PostHeader — Hero section for a journal post
 *
 * Server component. Renders a full-bleed thumbnail (or gradient strip),
 * followed by the post title, category, and metadata on a white surface.
 */

import { SectionLabel } from '@/components/ui';
import type { BlogPostWithCategory } from '@/lib/blog';

interface PostHeaderProps {
  post: BlogPostWithCategory;
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).toUpperCase();
}

export default function PostHeader({ post }: PostHeaderProps) {
  const categoryName = post.blog_categories?.name;

  return (
    <header>
      {/* Hero image or gradient strip */}
      {post.thumbnail_url ? (
        <div className="relative w-full" style={{ height: '50vh' }}>
          <img
            src={post.thumbnail_url}
            alt={post.title}
            className="absolute inset-0 w-full h-full object-cover"
          />
          {/* Heavy gradient: transparent at top -> white at bottom */}
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(to bottom, transparent 20%, rgba(255,255,255,0.4) 50%, #FFFFFF 90%)',
            }}
          />
        </div>
      ) : (
        <div
          className="w-full"
          style={{
            height: '30vh',
            background:
              'linear-gradient(to bottom, #1A1A1A 0%, #FFFFFF 100%)',
          }}
        />
      )}

      {/* Post info on white surface */}
      <div className="max-w-[740px] mx-auto px-6">
        {categoryName && (
          <SectionLabel
            label={categoryName}
            className="mb-6 !text-ops-text-secondary"
          />
        )}

        <h1 className="font-heading font-bold text-3xl md:text-5xl text-ops-text-dark leading-tight">
          {post.title}
        </h1>

        <p className="font-caption uppercase text-[11px] tracking-[0.1em] text-ops-text-secondary mt-4">
          {post.author || 'OPS Team'}
          {post.published_at && (
            <>
              {' '}&middot;{' '}
              {formatDate(post.published_at)}
            </>
          )}
          {post.word_count > 0 && (
            <>
              {' '}&middot;{' '}
              {post.word_count.toLocaleString()} WORDS
            </>
          )}
        </p>
      </div>
    </header>
  );
}
