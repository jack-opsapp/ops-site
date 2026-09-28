/**
 * /shop prerenders at build time. Where Supabase is not configured (Vercel
 * Preview, local builds without keys) the catalog reads must return an empty
 * catalog instead of failing the build — the same contract as src/lib/blog.ts.
 * Query errors against a configured database still throw (covered by the
 * unchanged error paths).
 */

import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';

const KEYS = ['NEXT_PUBLIC_SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY'] as const;
const saved: Partial<Record<(typeof KEYS)[number], string | undefined>> = {};

describe('shop catalog without Supabase configuration', () => {
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

  it('returns an empty catalog and no featured product', async () => {
    const { getCategories, getAllProductsWithDetails, getFeaturedProduct, isStoreLive } =
      await import('../queries');
    assert.deepEqual(await getCategories(), []);
    assert.deepEqual(await getAllProductsWithDetails(), []);
    assert.equal(await getFeaturedProduct(), null);
    assert.equal(await isStoreLive(), false);
  });
});
