/**
 * JournalPreview — Latest blog posts on the home page
 *
 * Async Server Component. Fetches the 3 most recent live posts
 * and renders them with BlogPostRow. If no posts exist, renders nothing.
 *
 * ISR: parent page.tsx controls revalidation via `export const revalidate`.
 */

import { SectionLabel, FadeInUp, Button } from '@/components/ui';
import BlogPostRow from '@/components/shared/BlogPostRow';
import { getLatestPosts } from '@/lib/blog';

export default async function JournalPreview() {
  const posts = await getLatestPosts(3);

  if (posts.length === 0) {
    return null;
  }

  return (
    <section className="py-24 md:py-32 bg-ops-background">
      <div className="max-w-[1400px] mx-auto px-6 md:px-10">
        {/* Header row */}
        <div className="flex items-start justify-between gap-8">
          <div>
            <FadeInUp>
              <SectionLabel label="JOURNAL" />
            </FadeInUp>
            <FadeInUp delay={0.05}>
              <h2 className="mt-4 font-heading font-bold uppercase leading-tight text-ops-text-primary text-4xl md:text-5xl lg:text-6xl">
                LATEST FROM THE TEAM
              </h2>
            </FadeInUp>
          </div>

          <FadeInUp delay={0.1}>
            <Button variant="ghost" href="/journal" className="shrink-0 mt-6">
              READ MORE -&gt;
            </Button>
          </FadeInUp>
        </div>

        {/* Post rows */}
        <div className="mt-12 md:mt-16">
          {posts.map((post, i) => (
            <FadeInUp key={post.id} delay={0.1 + i * 0.08}>
              <BlogPostRow post={post} />
            </FadeInUp>
          ))}
        </div>
      </div>
    </section>
  );
}
