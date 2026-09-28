/**
 * sitemap.xml lastmod. The journal revalidation endpoint regenerates the
 * sitemap whenever a post changes, so lastmod must not move for pages that
 * did not: pages without their own timestamp carry the deploy's build time
 * (OPS_SITE_BUILD_TIME, inlined from next.config.ts at build).
 */

import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';

describe('sitemap lastmod', () => {
  const saved = {
    build: process.env.OPS_SITE_BUILD_TIME,
    url: process.env.NEXT_PUBLIC_SUPABASE_URL,
    key: process.env.SUPABASE_SERVICE_ROLE_KEY,
  };

  before(() => {
    process.env.OPS_SITE_BUILD_TIME = '2026-09-28T12:00:00.000Z';
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
  });
  after(() => {
    if (saved.build === undefined) delete process.env.OPS_SITE_BUILD_TIME;
    else process.env.OPS_SITE_BUILD_TIME = saved.build;
    if (saved.url !== undefined) process.env.NEXT_PUBLIC_SUPABASE_URL = saved.url;
    if (saved.key !== undefined) process.env.SUPABASE_SERVICE_ROLE_KEY = saved.key;
  });

  it('stamps pages without their own timestamp with the build time, on every regeneration', async () => {
    const { default: sitemap } = await import('../../app/sitemap');
    for (const run of [await sitemap(), await sitemap()]) {
      assert.ok(run.length > 0);
      for (const entry of run) {
        assert.equal(
          (entry.lastModified as Date).toISOString(),
          '2026-09-28T12:00:00.000Z',
          entry.url,
        );
      }
    }
  });
});
