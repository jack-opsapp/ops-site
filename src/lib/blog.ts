/**
 * Blog query helpers — Server-side Supabase queries for blog posts
 *
 * Uses the service role key to bypass RLS.
 * All functions are intended for use in Server Components and Route Handlers.
 *
 * Error policy. Every page that reads journal data is statically rendered
 * and refreshed by ISR, so whatever a query returns is cached for everyone:
 *   - Supabase not configured (local builds without env vars, Vercel
 *     Preview) → empty results, so builds without database keys succeed.
 *   - A query that fails against a configured database throws (unwrapQuery).
 *     During ISR regeneration Next keeps serving the last good page, and a
 *     build fails loudly. Returning empty here would cache a 404 article, an
 *     empty journal or a sitemap without articles for the whole window.
 */

import { cache } from 'react';
import { getSupabaseAdmin } from './supabase-admin';

/* -------------------------------------------------------------------------- */
/*  Types (matching Supabase schema)                                          */
/* -------------------------------------------------------------------------- */

export interface BlogPost {
  id: string;
  title: string;
  subtitle: string | null;
  slug: string;
  author: string | null;
  content: string;
  summary: string | null;
  teaser: string | null;
  meta_title: string | null;
  thumbnail_url: string | null;
  category_id: string | null;
  is_live: boolean;
  display_views: number;
  word_count: number;
  faqs: { question: string; answer: string }[];
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface BlogCategory {
  id: string;
  name: string;
  slug: string;
}

/** BlogPost with joined category fields */
export type BlogPostWithCategory = BlogPost & {
  blog_categories: { name: string; slug: string } | null;
};

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                   */
/* -------------------------------------------------------------------------- */

/** Returns the Supabase client, or null if env vars aren't set. */
function tryGetClient() {
  try {
    return getSupabaseAdmin();
  } catch {
    console.warn('[blog] Supabase not configured — returning empty results.');
    return null;
  }
}

/**
 * Return a query's data, or throw when the query failed — see the error
 * policy above.
 */
export function unwrapQuery<T>(
  result: { data: T | null; error: { message: string } | null },
  label: string
): T | null {
  if (result.error) {
    throw new Error(`[blog] ${label}: ${result.error.message}`);
  }
  return result.data;
}

const POST_WITH_CATEGORY = '*, blog_categories!category_id(name, slug)';

/* -------------------------------------------------------------------------- */
/*  Query helpers                                                             */
/* -------------------------------------------------------------------------- */

/**
 * Fetch the latest live blog posts, ordered by published_at desc.
 * Joins the category name and slug via the category_id foreign key.
 */
export async function getLatestPosts(
  limit: number
): Promise<BlogPostWithCategory[]> {
  const client = tryGetClient();
  if (!client) return [];

  const data = unwrapQuery(
    await client
      .from('blog_posts')
      .select(POST_WITH_CATEGORY)
      .eq('is_live', true)
      .order('published_at', { ascending: false })
      .limit(limit),
    'getLatestPosts'
  );

  return (data ?? []) as BlogPostWithCategory[];
}

/**
 * Fetch all published blog posts, ordered by published_at desc.
 */
export async function getAllLivePosts(): Promise<BlogPostWithCategory[]> {
  const client = tryGetClient();
  if (!client) return [];

  const data = unwrapQuery(
    await client
      .from('blog_posts')
      .select(POST_WITH_CATEGORY)
      .eq('is_live', true)
      .order('published_at', { ascending: false }),
    'getAllLivePosts'
  );

  return (data ?? []) as BlogPostWithCategory[];
}

/**
 * Fetch all live posts filtered by category slug. An unknown category
 * yields no posts.
 */
export async function getPostsByCategory(
  categorySlug: string
): Promise<BlogPostWithCategory[]> {
  const client = tryGetClient();
  if (!client) return [];

  const category = unwrapQuery(
    await client
      .from('blog_categories')
      .select('id')
      .eq('slug', categorySlug)
      .maybeSingle(),
    'getPostsByCategory (category)'
  ) as { id: string } | null;
  if (!category) return [];

  const data = unwrapQuery(
    await client
      .from('blog_posts')
      .select(POST_WITH_CATEGORY)
      .eq('is_live', true)
      .eq('category_id', category.id)
      .order('published_at', { ascending: false }),
    'getPostsByCategory'
  );

  return (data ?? []) as BlogPostWithCategory[];
}

/**
 * Fetch a single live post by its slug; null when no live post has it.
 *
 * Memoized per render: an article's generateMetadata and page both read the
 * same post, and React `cache` lets them share one query.
 */
export const getPostBySlug = cache(async function getPostBySlug(
  slug: string
): Promise<BlogPostWithCategory | null> {
  const client = tryGetClient();
  if (!client) return null;

  const data = unwrapQuery(
    await client
      .from('blog_posts')
      .select(POST_WITH_CATEGORY)
      .eq('slug', slug)
      .eq('is_live', true)
      .maybeSingle(),
    'getPostBySlug'
  );

  return (data ?? null) as BlogPostWithCategory | null;
});

/**
 * Fetch live posts by slug, returned in the order the slugs were given.
 * Slugs with no live post are skipped.
 */
export async function getLivePostsBySlugs(
  slugs: string[]
): Promise<BlogPostWithCategory[]> {
  if (slugs.length === 0) return [];
  const client = tryGetClient();
  if (!client) return [];

  const data = unwrapQuery(
    await client
      .from('blog_posts')
      .select(POST_WITH_CATEGORY)
      .eq('is_live', true)
      .in('slug', slugs),
    'getLivePostsBySlugs'
  );

  const bySlug = new Map<string, BlogPostWithCategory>();
  for (const post of (data ?? []) as BlogPostWithCategory[]) {
    bySlug.set(post.slug, post);
  }

  return slugs
    .map((slug) => bySlug.get(slug))
    .filter((p): p is BlogPostWithCategory => p !== undefined);
}

/**
 * Fetch all blog categories, ordered alphabetically by name.
 */
export async function getBlogCategories(): Promise<BlogCategory[]> {
  const client = tryGetClient();
  if (!client) return [];

  const data = unwrapQuery(
    await client
      .from('blog_categories')
      .select('id, name, slug')
      .order('name', { ascending: true }),
    'getBlogCategories'
  );

  return (data ?? []) as BlogCategory[];
}

/**
 * Fetch related live posts for a given post.
 *
 * Returns up to `limit` live posts in the same category (excluding the
 * current slug), ordered by published_at desc. If the category yields
 * fewer than `limit` results — or `currentCategoryId` is null — the
 * shortfall is back-filled with the most recently published live posts
 * (excluding the current slug and any already returned).
 */
export async function getRelatedLivePosts(
  currentSlug: string,
  currentCategoryId: string | null,
  limit: number
): Promise<BlogPostWithCategory[]> {
  const client = tryGetClient();
  if (!client) return [];

  const collected: BlogPostWithCategory[] = [];
  const seenSlugs = new Set<string>([currentSlug]);

  if (currentCategoryId) {
    const data = unwrapQuery(
      await client
        .from('blog_posts')
        .select(POST_WITH_CATEGORY)
        .eq('is_live', true)
        .eq('category_id', currentCategoryId)
        .neq('slug', currentSlug)
        .order('published_at', { ascending: false })
        .limit(limit),
      'getRelatedLivePosts (category)'
    );
    for (const post of (data ?? []) as BlogPostWithCategory[]) {
      collected.push(post);
      seenSlugs.add(post.slug);
    }
  }

  if (collected.length < limit) {
    const remaining = limit - collected.length;
    const data = unwrapQuery(
      await client
        .from('blog_posts')
        .select(POST_WITH_CATEGORY)
        .eq('is_live', true)
        .neq('slug', currentSlug)
        .order('published_at', { ascending: false })
        .limit(remaining + collected.length),
      'getRelatedLivePosts (fallback)'
    );
    for (const post of (data ?? []) as BlogPostWithCategory[]) {
      if (collected.length >= limit) break;
      if (seenSlugs.has(post.slug)) continue;
      collected.push(post);
      seenSlugs.add(post.slug);
    }
  }

  return collected;
}

/**
 * Returns an array of { slug } for all live posts.
 * Intended for use with Next.js generateStaticParams.
 */
export async function getAllLiveSlugs(): Promise<{ slug: string }[]> {
  const client = tryGetClient();
  if (!client) return [];

  const data = unwrapQuery(
    await client.from('blog_posts').select('slug').eq('is_live', true),
    'getAllLiveSlugs'
  );

  return (data ?? []) as { slug: string }[];
}

/**
 * Every live post's slug with its last-change timestamps, for sitemap.xml.
 */
export async function getLiveSitemapPosts(): Promise<
  Pick<BlogPost, 'slug' | 'updated_at' | 'published_at'>[]
> {
  const client = tryGetClient();
  if (!client) return [];

  const data = unwrapQuery(
    await client
      .from('blog_posts')
      .select('slug, updated_at, published_at')
      .eq('is_live', true),
    'getLiveSitemapPosts'
  );

  return (data ?? []) as Pick<BlogPost, 'slug' | 'updated_at' | 'published_at'>[];
}
