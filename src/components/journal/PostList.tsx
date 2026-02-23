/**
 * PostList -- Client component that manages category filtering for journal posts
 *
 * Renders CategoryFilter at top, then maps filtered posts to BlogPostRow
 * wrapped in FadeInUp with stagger delays.
 */

'use client';

import { useState } from 'react';
import { FadeInUp } from '@/components/ui';
import BlogPostRow from '@/components/shared/BlogPostRow';
import CategoryFilter from '@/components/journal/CategoryFilter';
import type { BlogPostWithCategory, BlogCategory } from '@/lib/blog';

interface PostListProps {
  posts: BlogPostWithCategory[];
  categories: BlogCategory[];
}

export default function PostList({ posts, categories }: PostListProps) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const filtered = activeCategory
    ? posts.filter((p) => p.blog_categories?.slug === activeCategory)
    : posts;

  return (
    <div>
      {/* Category filter bar */}
      <CategoryFilter
        categories={categories}
        activeSlug={activeCategory}
        onChange={setActiveCategory}
      />

      {/* Post rows */}
      <div className="mt-12">
        {filtered.length === 0 ? (
          <p className="font-heading font-light text-ops-text-secondary text-lg">
            No posts in this category.
          </p>
        ) : (
          filtered.map((post, i) => (
            <FadeInUp key={post.id} delay={i * 0.06}>
              <BlogPostRow post={post} />
            </FadeInUp>
          ))
        )}
      </div>
    </div>
  );
}
