# Handoff — journal site revalidation (ops-site → ops-web journal stream)

From: INSTAGRAM CLOUD EDITORIAL - P1-2-1-1 (ops-site static cache), 2026-09-28.
To: the Instagram overhaul's journal stream (ops-web worktree `ops-web-journal-desk`, branch `feat/journal-autopublish-breaking`) and whoever owns ops-web `blog_posts` writers.

## What changed on opsapp.co

Branch `perf/static-marketing-cache` (ops-site, not pushed; ships on Jackson's GO) makes every journal page static: all live articles prerender at build, and each page re-renders at most every 5 minutes (ISR). Without a signal, a publish, edit, rename, unpublish or delete reaches the site within ≤5 minutes instead of instantly.

## Contract

```
POST https://opsapp.co/api/revalidate/journal
Authorization: Bearer ${OPS_SITE_REVALIDATE_SECRET}
Content-Type: application/json

{"slugs": ["new-slug", "old-slug"]}   // optional; ≤50; each ^[a-z0-9]+(?:-[a-z0-9]+)*$
```

| Status | Meaning |
|---|---|
| 200 | `{ revalidated: string[], slugs: string[], at: ISO-8601 }` |
| 400 | body is not empty / `{}` / `{"slugs": [...]}` with valid slugs |
| 401 | missing or wrong secret |
| 500 | `OPS_SITE_REVALIDATE_SECRET` not configured on ops-site |

Effect: refreshes every article (each carries a related-posts rail), `/journal`, `/` and `/es` (latest-posts preview), every industry and compare page (related-journal rails), `sitemap.xml`, and `/journal/<slug>` for each named slug (clears a 404 cached for a slug before it went live). Verified locally: after one call every journal-dependent page re-rendered on its next request (`x-nextjs-cache: MISS` then `HIT`) while `/platform` and `/es/platform` stayed cached (`HIT`).

Source: `src/lib/journal-revalidation.ts`, `src/app/api/revalidate/journal/route.ts`.

## Secret

New env var `OPS_SITE_REVALIDATE_SECRET`, one value, set in Vercel **ops-web (Production)** and **ops-site (Production + Preview)**. Not set yet — Jackson's action, requested with the ship GO.

## Call sites in ops-web

Call after the write succeeds. Never fail the write when the call fails — the 5-minute window is the fallback. In route handlers, wrap in `after()` from `next/server` (ops-web is on Next 15) so the response is not delayed.

1. `src/app/api/blog/posts/route.ts` `POST` (create) → `[post.slug]`
2. `src/app/api/blog/posts/[id]/route.ts` `PUT` → `[previous slug, new slug]` (read the row before updating); `DELETE` → `[slug]` (read before deleting). Also covers `BLOG_API_KEY` writers.
3. Editorial PUBLISH NOW (`src/lib/journal/editorial/admin.ts` → `publish_journal_editorial_assignment`) → `[assignment slug]`
4. `/api/cron/journal-editorial` auto-publish (`listDue` → publish) → `[slug]`
5. Generated-photo replacement on a published post (`replace_journal_editorial_image`) → `[slug]`

The legacy Codex breaking-news automation writes `blog_posts` directly and will rely on the 5-minute window until the cloud breaking desk replaces it.

## Drop-in client (suggested `src/lib/journal/site-revalidation.ts`)

```ts
const ENDPOINT = "https://opsapp.co/api/revalidate/journal";
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/**
 * Refresh opsapp.co's static journal pages now. Never throws; when it
 * fails the site catches up within its 5-minute refresh window.
 */
export async function revalidateSiteJournal(
  slugs: Array<string | null | undefined> = [],
): Promise<boolean> {
  const secret = process.env.OPS_SITE_REVALIDATE_SECRET;
  if (!secret) {
    console.warn("[journal] OPS_SITE_REVALIDATE_SECRET unset; opsapp.co refreshes within 5 minutes");
    return false;
  }
  const unique = [
    ...new Set(slugs.filter((s): s is string => typeof s === "string" && SLUG.test(s))),
  ].slice(0, 50);
  try {
    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: { authorization: `Bearer ${secret}`, "content-type": "application/json" },
      body: JSON.stringify({ slugs: unique }),
      signal: AbortSignal.timeout(5000),
      cache: "no-store",
    });
    if (!res.ok) {
      console.error("[journal] site revalidation failed", res.status);
      return false;
    }
    return true;
  } catch (error) {
    console.error("[journal] site revalidation error", error);
    return false;
  }
}
```

## Notes for stream C (journal view beacon on ops-site)

- The article page now lives at `src/app/(en)/journal/[slug]/page.tsx` and is static. A view beacon must be a client component (or a `navigator.sendBeacon` from one); reading `headers()`/`cookies()` in the page would make every article dynamic again — `src/i18n/__tests__/route-locale-coverage.test.ts` fails if a rendering module imports `next/headers`.
- Every page and layout under `src/app/(en)` must call `setRequestLocale('en')` (enforced by the same test).
