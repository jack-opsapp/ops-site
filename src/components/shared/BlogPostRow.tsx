/**
 * BlogPostRow — Shared row component for blog post listings
 *
 * Client component (Framer Motion). Used on home page (JournalPreview) and journal index.
 * Layout: thumbnail left, title + teaser + meta stacked right.
 * Hover: row shifts right 4px, accent left border fades in, image scales, READ slides.
 * Respects prefers-reduced-motion via useReducedMotion.
 */

'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion, useReducedMotion } from 'framer-motion';
import { Divider } from '@/components/ui';
import type { BlogPostWithCategory } from '@/lib/blog';

interface BlogPostRowProps {
  post: BlogPostWithCategory;
}

const EASING = [0.22, 1, 0.36, 1] as const;
const TRANSITION = { duration: 0.3, ease: EASING };

const rowVariants = {
  idle: { x: 0 },
  hover: { x: 4 },
};

const borderVariants = {
  idle: { opacity: 0 },
  hover: { opacity: 1 },
};

const imageVariants = {
  idle: { scale: 1 },
  hover: { scale: 1.03 },
};

const readVariants = {
  idle: { x: 0 },
  hover: { x: 4 },
};

/* Reduced-motion: all variants collapse to identity */
const staticVariant = {
  idle: {},
  hover: {},
};

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
  const reducedMotion = useReducedMotion() ?? false;
  const hasThumbnail = !!post.thumbnail_url;

  const rv = reducedMotion ? staticVariant : rowVariants;
  const bv = reducedMotion ? staticVariant : borderVariants;
  const iv = reducedMotion ? staticVariant : imageVariants;
  const rdv = reducedMotion ? staticVariant : readVariants;

  return (
    <Link href={`/journal/${post.slug}`} className="block">
      <motion.div
        className="relative py-6"
        initial="idle"
        whileHover="hover"
        variants={rv}
        transition={TRANSITION}
      >
        {/* Accent left border — fades in on hover */}
        <motion.div
          className="absolute left-0 top-6 bottom-6 w-[2px] bg-ops-accent rounded-full"
          variants={bv}
          transition={TRANSITION}
          aria-hidden="true"
        />

        <div className="flex items-center gap-4 md:gap-5">
          {/* Thumbnail — left side */}
          {hasThumbnail && (
            <div className="shrink-0 relative w-16 h-16 md:w-20 md:h-20 rounded-[3px] overflow-hidden">
              <motion.div
                className="w-full h-full"
                variants={iv}
                transition={TRANSITION}
              >
                <Image
                  src={post.thumbnail_url!}
                  alt={post.title}
                  fill
                  className="object-cover"
                  sizes="(min-width: 768px) 80px, 64px"
                />
              </motion.div>
              {/* Feathered edge — fades right into background */}
              <div
                className="absolute inset-0 bg-gradient-to-r from-transparent to-ops-background/30 pointer-events-none"
                aria-hidden="true"
              />
            </div>
          )}

          {/* Content — stacked right */}
          <div className="flex-1 min-w-0 flex flex-col justify-center">
            {/* Title */}
            <h3 className="font-heading font-medium text-lg text-ops-text-primary leading-snug">
              {post.title}
            </h3>

            {/* Teaser */}
            {post.teaser && (
              <p className="font-heading font-light text-sm text-ops-text-secondary mt-1 line-clamp-2">
                {post.teaser}
              </p>
            )}

            {/* Meta row: date + category + READ */}
            <div className="flex items-center gap-3 mt-2">
              <span className="font-caption uppercase text-ops-text-secondary text-[10px] tracking-wide">
                {formatDate(post.published_at)}
              </span>

              {categoryName && (
                <>
                  <span className="text-ops-text-secondary text-[10px]" aria-hidden="true">&middot;</span>
                  <span className="font-caption uppercase text-[10px] text-ops-text-secondary tracking-wide">
                    {categoryName}
                  </span>
                </>
              )}

              <motion.span
                className="font-caption text-[11px] text-ops-text-secondary tracking-wide ml-auto"
                variants={rdv}
                transition={TRANSITION}
              >
                READ -&gt;
              </motion.span>
            </div>
          </div>
        </div>
      </motion.div>

      <Divider />
    </Link>
  );
}
