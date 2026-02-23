/**
 * Blog query helpers — Server-side Supabase queries for blog posts
 *
 * Uses the service role key to bypass RLS.
 * All functions are intended for use in Server Components and Route Handlers.
 */

import { createClient } from '@supabase/supabase-js';

// Server-side Supabase client with service role key (bypasses RLS)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

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
/*  Query helpers                                                             */
/* -------------------------------------------------------------------------- */

/**
 * Fetch the latest live blog posts, ordered by published_at desc.
 * Joins the category name and slug via the category_id foreign key.
 */
export async function getLatestPosts(
  limit: number
): Promise<BlogPostWithCategory[]> {
  const { data, error } = await supabaseAdmin
    .from('blog_posts')
    .select('*, blog_categories!category_id(name, slug)')
    .eq('is_live', true)
    .order('published_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('[blog] getLatestPosts error:', error.message);
    return [];
  }

  return (data ?? []) as BlogPostWithCategory[];
}

/**
 * Fetch all published blog posts, ordered by published_at desc.
 */
export async function getAllLivePosts(): Promise<BlogPostWithCategory[]> {
  const { data, error } = await supabaseAdmin
    .from('blog_posts')
    .select('*, blog_categories!category_id(name, slug)')
    .eq('is_live', true)
    .order('published_at', { ascending: false });

  if (error) {
    console.error('[blog] getAllLivePosts error:', error.message);
    return [];
  }

  return (data ?? []) as BlogPostWithCategory[];
}

/**
 * Fetch all live posts filtered by category slug.
 */
export async function getPostsByCategory(
  categorySlug: string
): Promise<BlogPostWithCategory[]> {
  // First resolve the category id from slug
  const { data: category, error: catError } = await supabaseAdmin
    .from('blog_categories')
    .select('id')
    .eq('slug', categorySlug)
    .single();

  if (catError || !category) {
    console.error('[blog] getPostsByCategory — category not found:', categorySlug);
    return [];
  }

  const { data, error } = await supabaseAdmin
    .from('blog_posts')
    .select('*, blog_categories!category_id(name, slug)')
    .eq('is_live', true)
    .eq('category_id', category.id)
    .order('published_at', { ascending: false });

  if (error) {
    console.error('[blog] getPostsByCategory error:', error.message);
    return [];
  }

  return (data ?? []) as BlogPostWithCategory[];
}

/**
 * Fetch a single live post by its slug.
 */
export async function getPostBySlug(
  slug: string
): Promise<BlogPostWithCategory | null> {
  const { data, error } = await supabaseAdmin
    .from('blog_posts')
    .select('*, blog_categories!category_id(name, slug)')
    .eq('slug', slug)
    .eq('is_live', true)
    .single();

  if (error) {
    console.error('[blog] getPostBySlug error:', error.message);
    return null;
  }

  return (data ?? null) as BlogPostWithCategory | null;
}

/**
 * Fetch all blog categories, ordered alphabetically by name.
 */
export async function getBlogCategories(): Promise<BlogCategory[]> {
  const { data, error } = await supabaseAdmin
    .from('blog_categories')
    .select('id, name, slug')
    .order('name', { ascending: true });

  if (error) {
    console.error('[blog] getBlogCategories error:', error.message);
    return [];
  }

  return (data ?? []) as BlogCategory[];
}

/**
 * Returns an array of { slug } for all live posts.
 * Intended for use with Next.js generateStaticParams.
 */
export async function getAllLiveSlugs(): Promise<{ slug: string }[]> {
  const { data, error } = await supabaseAdmin
    .from('blog_posts')
    .select('slug')
    .eq('is_live', true);

  if (error) {
    console.error('[blog] getAllLiveSlugs error:', error.message);
    return [];
  }

  return (data ?? []) as { slug: string }[];
}
