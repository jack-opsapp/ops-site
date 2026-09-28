import type { Rewrite } from 'next/dist/lib/load-custom-routes';

/**
 * Keep the pre-route-group Open Graph image URLs serving.
 *
 * File-based metadata images under a route group get a hash suffix
 * (`/industries/<slug>/opengraph-image-1s72ac`), so moving the routes into
 * src/app/(en) changed the og:image URL that link previews already cached
 * (`/industries/<slug>/opengraph-image`). These rewrites serve the same
 * image at the old address. A test derives each destination from Next's
 * own route normalizer, so a Next upgrade that changes the suffix fails CI
 * instead of silently breaking the old URLs.
 */
export const legacyMetadataImageRewrites: Rewrite[] = [
  {
    source: '/industries/:slug/opengraph-image',
    destination: '/industries/:slug/opengraph-image-1s72ac',
  },
  {
    source: '/compare/:slug/opengraph-image',
    destination: '/compare/:slug/opengraph-image-1okiq5',
  },
];
