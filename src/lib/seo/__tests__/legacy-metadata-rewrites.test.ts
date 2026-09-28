/**
 * Legacy Open Graph image URLs keep serving after the route-group move.
 *
 * Next suffixes file-based metadata images that live under a route group.
 * Each rewrite's destination must equal the route Next actually generates,
 * derived here with Next's own normalizer.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readdirSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

import { legacyMetadataImageRewrites } from '../legacy-metadata-rewrites';

const require = createRequire(import.meta.url);
const { normalizeMetadataRoute } = require('next/dist/lib/metadata/get-metadata-route.js') as {
  normalizeMetadataRoute: (page: string) => string;
};

const APP = fileURLToPath(new URL('../../../app', import.meta.url));

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    return statSync(full).isDirectory() ? walk(full) : [full];
  });
}

/** '/(en)/industries/[slug]/opengraph-image-1s72ac/route' → '/industries/:slug/opengraph-image-1s72ac' */
function toUrlPattern(route: string): string {
  return route
    .replace(/\/route$/, '')
    .split('/')
    .filter((segment) => !/^\(.*\)$/.test(segment))
    .map((segment) => segment.replace(/^\[(.+)\]$/, ':$1'))
    .join('/');
}

// Dynamic Open Graph / Twitter images under a route group.
const groupedImages = walk(APP)
  .filter((file) => /[/\\](opengraph|twitter)-image\.tsx$/.test(file))
  .map((file) => `/${relative(APP, file).split(sep).join('/').replace(/\.tsx$/, '')}`)
  .filter((page) => page.split('/').some((segment) => /^\(.*\)$/.test(segment)));

describe('legacyMetadataImageRewrites', () => {
  it('finds the grouped metadata images', () => {
    assert.deepEqual(groupedImages.sort(), [
      '/(en)/compare/[slug]/opengraph-image',
      '/(en)/industries/[slug]/opengraph-image',
    ]);
  });

  for (const page of groupedImages) {
    it(`serves the pre-group URL for ${page}`, () => {
      const legacy = toUrlPattern(page);
      const current = toUrlPattern(normalizeMetadataRoute(page));
      assert.notEqual(legacy, current);
      const rewrite = legacyMetadataImageRewrites.find((r) => r.source === legacy);
      assert.ok(rewrite, `no rewrite for ${legacy}`);
      assert.equal(rewrite.destination, current);
    });
  }

  it('has no stale entries', () => {
    assert.equal(legacyMetadataImageRewrites.length, groupedImages.length);
  });
});
