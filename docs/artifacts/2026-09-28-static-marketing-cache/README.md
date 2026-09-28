# Static marketing cache — verification (2026-09-28)

Branch `perf/static-marketing-cache` (with `origin/main` 2611c63 merged in) against production `dpl_CUFpTPnxjitej7VLzkvW7okKayvs` (= `origin/main` 2611c63, the contractor-copy sweep, deployed 2026-09-28 13:48 PDT while this work was in progress; the first rounds ran against `dpl_7E4358Diuw7eD9cbkXuRTYSrEAPd` / 60f9e03 with the same result). Design: `docs/superpowers/specs/2026-09-28-static-marketing-cache-design.md`.

## 1. Route table

`route-table-after.txt` — local `next build` with the production database (read-only). Before: every route except icons, robots and sitemap was `ƒ`. After: every marketing page is `○`/`●` with a 5-minute revalidate, including all 84 live journal articles, every industry page, 8 compare pages, the seven cacheable `/es` pages and the global 404. Still `ƒ` by design: `/spec`, `/es/spec`, `/legal`, shop checkout/confirmation, SPEC flow and token pages, leadership results, API routes, dynamic Open Graph images. The Vercel preview builds (`C6ErUQqqyze9Aa6hVqQigZWeJM5j`, final `8U5e9zsT5MvFzNWsCbfxdy5LhfDj`; no database keys) produced the same table.

## 2. SEO parity — production vs the new build

193 URLs: every sitemap URL (157) plus `/legal?page=*`, `/spec?fit=ops`, `/es/spec?fit=ops`, checkout/confirmation/SPEC flow pages, fake-token pages, unknown slugs, an unmatched URL, `/es/<untranslated>` redirects and cookie-redirect cases. Snapshots taken back to back (production, then a local `next start` of the build on the same database). Fields: status, redirect location, cookies, `<html lang>`, title, every `<meta>`, canonical/alternate/icon links, parsed JSON-LD (inline and `next/script`).

| Result | URLs |
|---|---|
| Identical on every field | 129 |
| `og:image` URL gained the route-group suffix (`…/opengraph-image-1s72ac`, compare `-1okiq5`); every other tag identical; old URL still serves byte-identical image (sha256 matches production) through `legacyMetadataImageRewrites` | 56 industry + compare pages (+2 unknown-slug 404s) |
| 404 responses lost the self-canonical / `og:url` pointing at the missing URL (a static 404 cannot know it; no indexing effect) | 6 |
| Duplicate `__ops_first_touch` Set-Cookie on redirecting pages collapsed to one | 2 |

Status codes: 175 × 200, 8 × 308, 6 × 404, 3 × 307, 1 × 301 (the retired general-contracting page) — identical before and after. Zero unexpected differences.

`sitemap.xml`: the same 161 URLs with identical hreflang alternates. `lastmod` changes by design: production stamps every URL with its render time; the branch stamps pages with the deploy's build time (stable when the journal endpoint regenerates the sitemap) and each article with its own `updated_at`. No title, description, canonical, hreflang, robots, JSON-LD or `lang` difference on any 200 page.

## 3. Locale routing

`locale-routing-matrix.txt` — 15 cases (Spanish pages, `/es/<untranslated>` redirects, cookie redirects with query strings, cookie on untranslated pages, `ops-lang=en`): identical status, location, `lang` and `ops-lang` cookie before and after.

## 4. Caching headers

Local `next start`: cached pages answer `x-nextjs-cache: HIT`, `Cache-Control: s-maxage=300, stale-while-revalidate=31535700`; `/spec` and `/legal` answer `private, no-cache, no-store`.

Vercel preview (`ops-site-3y4orha0c`, re-run on the final `ops-site-qhfzxpcu4` with the same results): `/`, `/platform`, `/es/platform`, `/journal`, `/industries/plumbing`, `/compare/jobber`, `/tools/leadership` → `x-vercel-cache: PRERENDER`, then `HIT`, `HIT`; `cache-control: public, max-age=0, must-revalidate`. `/spec`, `/legal` → `MISS` every time, private. The unmatched-URL 404 → `HIT` from the second request. Cached responses still carry the middleware's `ops-lang=es` (on `/es/*`) and `__ops_first_touch` cookies; `/platform` with `ops-lang=es` → 308 `/es/platform`; `/es/journal` → 308 `/journal`.

## 5. Journal revalidation endpoint

- 401 without / with a wrong bearer, 400 on an invalid slug, 405 on GET (local), 200 with the revalidated list.
- Local: after one call every journal-dependent route re-rendered on its next request (`MISS` → `HIT`): two articles, `/journal`, `/`, `/es`, `/industries/plumbing`, `/compare/jobber`, `/sitemap.xml`; `/platform` and `/es/platform` stayed `HIT`.
- Vercel preview: `/journal`, `/`, `/es`, `/industries/plumbing`, `/compare/jobber`, `/sitemap.xml` → `REVALIDATED` → `HIT`; `/platform`, `/es/platform` → `HIT` throughout.

## 6. Tests

`npx tsx --test $(find src -name '*.test.ts*')` → 242 pass, 0 fail (after merging main). `npx tsc --noEmit` clean. ESLint: no messages in any new or changed line (pre-existing messages in moved files are unchanged).

## 7. Browser

Local production build in the in-app browser: `/es/platform` and `/es/plans` render fully styled in Spanish; clicking PLANES on `/es/platform` lands on `/es/plans` (`lang="es"`, Spanish headline, `ops-lang=es` kept); `/journal/write-a-payment-schedule-that-gets-paid` renders with its related posts and no console errors. The five `<rect> attribute width: "null"` console errors seen after the platform → plans click reproduce identically on opsapp.co today (pre-existing).

## 8. Review fixes folded in

- Journal reads now throw on query errors (not-configured still returns empty), so ISR keeps the last good page instead of caching a 404 article, an empty journal or an article-less sitemap; the related-journal rail uses the same query policy; `getPostBySlug` is memoized per render.
- `sitemap.xml` lastmod no longer moves for unchanged pages when the journal endpoint regenerates it.
- `/shop` catalog reads return an empty store when Supabase is not configured (Vercel Preview), so builds without database keys succeed.
