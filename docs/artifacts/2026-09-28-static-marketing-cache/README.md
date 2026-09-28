# Static marketing cache — verification (2026-09-28)

Branch `perf/static-marketing-cache` against production `dpl_7E4358Diuw7eD9cbkXuRTYSrEAPd` (= `origin/main` 60f9e03). Design: `docs/superpowers/specs/2026-09-28-static-marketing-cache-design.md`.

## 1. Route table

`route-table-after.txt` — local `next build` with the production database (read-only). Before: every route except icons, robots and sitemap was `ƒ`. After: every marketing page is `○`/`●` with a 5-minute revalidate, including all 84 live journal articles, 49 industry pages, 8 compare pages and the seven cacheable `/es` pages. Still `ƒ` by design: `/spec`, `/es/spec`, `/legal`, shop checkout/confirmation, SPEC flow and token pages, leadership results, API routes, dynamic Open Graph images. The Vercel preview build (`C6ErUQqqyze9Aa6hVqQigZWeJM5j`, no database keys) produced the same table.

## 2. SEO parity — production vs the new build

193 URLs: every sitemap URL (157) plus `/legal?page=*`, `/spec?fit=ops`, `/es/spec?fit=ops`, checkout/confirmation/SPEC flow pages, fake-token pages, unknown slugs, an unmatched URL, `/es/<untranslated>` redirects and cookie-redirect cases. Snapshots taken back to back (production, then a local `next start` of the build on the same database). Fields: status, redirect location, cookies, `<html lang>`, title, every `<meta>`, canonical/alternate/icon links, parsed JSON-LD (inline and `next/script`).

| Result | URLs |
|---|---|
| Identical on every field | 127 |
| `og:image` URL gained the route-group suffix (`…/opengraph-image-1s72ac`, compare `-1okiq5`); every other tag identical; old URL still serves byte-identical image (sha256 matches production) through `legacyMetadataImageRewrites` | 57 industry + compare pages |
| 404 responses lost the self-canonical / `og:url` pointing at the missing URL (a static 404 cannot know it; no indexing effect) | 6 |
| Duplicate `__ops_first_touch` Set-Cookie on redirecting pages collapsed to one | 3 (`/shop/confirmation`, `/spec/awaiting-approval`, `/spec/billing-address`) |

Status codes: 176 × 200, 8 × 308, 6 × 404, 3 × 307 — identical before and after. No title, description, canonical, hreflang, robots, JSON-LD or `lang` difference on any 200 page.

## 3. Locale routing

`locale-routing-matrix.txt` — 15 cases (Spanish pages, `/es/<untranslated>` redirects, cookie redirects with query strings, cookie on untranslated pages, `ops-lang=en`): identical status, location, `lang` and `ops-lang` cookie before and after.

## 4. Caching headers

Local `next start`: cached pages answer `x-nextjs-cache: HIT`, `Cache-Control: s-maxage=300, stale-while-revalidate=31535700`; `/spec` and `/legal` answer `private, no-cache, no-store`.

Vercel preview (`ops-site-3y4orha0c`): `/`, `/platform`, `/es/platform`, `/journal`, `/industries/plumbing`, `/compare/jobber`, `/tools/leadership` → `x-vercel-cache: PRERENDER`, then `HIT`, `HIT`; `cache-control: public, max-age=0, must-revalidate`. `/spec`, `/legal` → `MISS` every time, private. The unmatched-URL 404 → `HIT` from the second request. Cached responses still carry the middleware's `ops-lang=es` (on `/es/*`) and `__ops_first_touch` cookies; `/platform` with `ops-lang=es` → 308 `/es/platform`; `/es/journal` → 308 `/journal`.

## 5. Journal revalidation endpoint

- 401 without / with a wrong bearer, 400 on an invalid slug, 405 on GET (local), 200 with the revalidated list.
- Local: after one call every journal-dependent route re-rendered on its next request (`MISS` → `HIT`): two articles, `/journal`, `/`, `/es`, `/industries/plumbing`, `/compare/jobber`, `/sitemap.xml`; `/platform` and `/es/platform` stayed `HIT`.
- Vercel preview: `/journal`, `/`, `/es`, `/industries/plumbing`, `/compare/jobber`, `/sitemap.xml` → `REVALIDATED` → `HIT`; `/platform`, `/es/platform` → `HIT` throughout.

## 6. Tests

`npx tsx --test $(find src -name '*.test.ts*')` → 227 pass, 0 fail. `npx tsc --noEmit` clean. ESLint: no messages in any new or changed line (pre-existing messages in moved files are unchanged).
