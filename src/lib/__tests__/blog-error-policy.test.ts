/**
 * Journal data error policy.
 *
 * Journal pages are statically rendered and refreshed by ISR, so what a
 * query returns is cached for everyone:
 *   - Supabase not configured (local builds, Vercel Preview) → empty results,
 *     so builds without database keys succeed.
 *   - A query that fails against a configured database throws, so ISR keeps
 *     the last good page (and a build fails loudly) instead of caching a 404
 *     article, an empty journal or a sitemap without articles.
 */

import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';

import { unwrapQuery } from '../blog';

describe('unwrapQuery', () => {
  it('returns data when the query succeeded', () => {
    assert.deepEqual(unwrapQuery({ data: [{ slug: 'a' }], error: null }, 'test'), [{ slug: 'a' }]);
    assert.equal(unwrapQuery({ data: null, error: null }, 'test'), null);
  });

  it('throws with the query label when the query failed', () => {
    assert.throws(
      () => unwrapQuery({ data: null, error: { message: 'fetch failed' } }, 'getPostBySlug'),
      /\[blog\] getPostBySlug: fetch failed/,
    );
  });
});

describe('journal reads without Supabase configuration', () => {
  const KEYS = ['NEXT_PUBLIC_SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY'] as const;
  const saved: Partial<Record<(typeof KEYS)[number], string | undefined>> = {};

  before(() => {
    for (const key of KEYS) {
      saved[key] = process.env[key];
      delete process.env[key];
    }
  });
  after(() => {
    for (const key of KEYS) {
      if (saved[key] !== undefined) process.env[key] = saved[key];
    }
  });

  it('returns empty results instead of failing', async () => {
    const blog = await import('../blog');
    assert.deepEqual(await blog.getLatestPosts(3), []);
    assert.deepEqual(await blog.getAllLivePosts(), []);
    assert.deepEqual(await blog.getPostsByCategory('operations'), []);
    assert.equal(await blog.getPostBySlug('any-post'), null);
    assert.deepEqual(await blog.getBlogCategories(), []);
    assert.deepEqual(await blog.getRelatedLivePosts('any-post', null, 3), []);
    assert.deepEqual(await blog.getAllLiveSlugs(), []);
    assert.deepEqual(await blog.getLiveSitemapPosts(), []);
    assert.deepEqual(await blog.getLivePostsBySlugs(['a', 'b']), []);
  });
});
