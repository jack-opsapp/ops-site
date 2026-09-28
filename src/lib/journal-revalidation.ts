/**
 * Journal on-demand revalidation — the logic behind
 * POST /api/revalidate/journal (src/app/api/revalidate/journal/route.ts).
 *
 * Journal pages are static and refresh every 5 minutes (ISR). ops-web calls
 * this endpoint after every write to `blog_posts` — publish, edit,
 * unpublish, delete, photo replacement — so the change is live on the next
 * request instead of within 5 minutes.
 *
 * Contract:
 *   POST /api/revalidate/journal
 *   Authorization: Bearer ${OPS_SITE_REVALIDATE_SECRET}
 *   Content-Type: application/json
 *   { "slugs": ["new-slug", "old-slug"] }   // optional; the posts that changed
 *
 *   200 { revalidated: string[], slugs: string[], at: ISO-8601 }
 *   400 invalid body · 401 missing/wrong secret · 500 secret not configured
 *
 * Every call revalidates all journal-dependent routes (each article carries
 * a related-posts rail, so one post's title or photo appears on others).
 * Named slugs are revalidated by URL as well, which also clears a 404
 * cached for a slug before it went live.
 */

import { timingSafeEqual } from 'node:crypto';

export type RevalidateType = 'page' | 'layout';

export interface JournalDependentRoute {
  path: string;
  type?: RevalidateType;
}

/**
 * Every route that renders journal data. Dynamic routes are keyed by their
 * group-qualified pattern because Next's implicit cache tags use the
 * unnormalized route (`/(en)/journal/[slug]/page`); static routes by URL.
 * A test derives the journal consumers from the import graph and fails if
 * one is missing here.
 */
export const JOURNAL_DEPENDENT_ROUTES: readonly JournalDependentRoute[] = [
  // Articles (each renders a related-posts rail)
  { path: '/(en)/journal/[slug]', type: 'page' },
  // Journal index
  { path: '/journal' },
  // Home pages (latest-posts preview)
  { path: '/' },
  { path: '/es' },
  // Related-journal rails
  { path: '/(en)/industries/[slug]', type: 'page' },
  { path: '/(en)/compare/[slug]', type: 'page' },
  // Sitemap (lists every live article)
  { path: '/sitemap.xml' },
];

export const MAX_SLUGS = 50;
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export interface JournalRevalidationDeps {
  secret: string | undefined;
  revalidatePath: (path: string, type?: RevalidateType) => void;
  now?: () => Date;
}

function json(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
  });
}

function constantTimeEquals(a: string, b: string): boolean {
  const aBuf = Buffer.from(a);
  const bBuf = Buffer.from(b);
  if (aBuf.length !== bBuf.length) {
    // Compare equal-length buffers anyway so timing does not leak the length.
    timingSafeEqual(aBuf, Buffer.alloc(aBuf.length));
    return false;
  }
  return timingSafeEqual(aBuf, bBuf);
}

function parseSlugs(raw: string): string[] | null {
  if (raw.trim() === '') return [];
  let body: unknown;
  try {
    body = JSON.parse(raw);
  } catch {
    return null;
  }
  if (typeof body !== 'object' || body === null || Array.isArray(body)) return null;
  const slugs = (body as { slugs?: unknown }).slugs;
  if (slugs === undefined) return [];
  if (!Array.isArray(slugs) || slugs.length > MAX_SLUGS) return null;
  if (!slugs.every((slug) => typeof slug === 'string' && SLUG_PATTERN.test(slug))) return null;
  return [...new Set(slugs as string[])];
}

export async function handleJournalRevalidation(
  request: Request,
  deps: JournalRevalidationDeps,
): Promise<Response> {
  if (!deps.secret) {
    return json(500, { error: 'OPS_SITE_REVALIDATE_SECRET is not configured' });
  }

  const header = request.headers.get('authorization');
  if (!header || !constantTimeEquals(header, `Bearer ${deps.secret}`)) {
    return json(401, { error: 'Unauthorized' });
  }

  const slugs = parseSlugs(await request.text());
  if (slugs === null) {
    return json(400, {
      error: `Body must be empty or {"slugs": string[]} with at most ${MAX_SLUGS} lowercase, hyphenated slugs`,
    });
  }

  const revalidated: string[] = [];
  for (const { path, type } of JOURNAL_DEPENDENT_ROUTES) {
    deps.revalidatePath(path, type);
    revalidated.push(type ? `${path} (${type})` : path);
  }
  for (const slug of slugs) {
    const path = `/journal/${slug}`;
    deps.revalidatePath(path);
    revalidated.push(path);
  }

  return json(200, {
    revalidated,
    slugs,
    at: (deps.now?.() ?? new Date()).toISOString(),
  });
}
