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
import { getAllLivePosts, getBlogCategories } from '@/lib/blog';

export const metadata: Metadata = {
  title: 'Journal',
};

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
        </div>
      </section>
    </>
  );
}
