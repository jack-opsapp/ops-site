# Static marketing cache — design

Date: 2026-09-28 · Branch: `perf/static-marketing-cache` (worktree `ops-site-static-cache`, base `origin/main` 60f9e03 = production `dpl_7E4358Diuw7eD9cbkXuRTYSrEAPd`)

## Problem

Production renders every page per request. The `next build` route table for `dpl_7E4358Diuw7eD9cbkXuRTYSrEAPd` marks every route except icons, robots and sitemap `ƒ`, and `/journal/<slug>` answers `cache-control: private, no-cache, no-store` with `x-vercel-cache: MISS`, although the page exports `revalidate = 300` and `generateStaticParams`.

Root cause: request-bound reads in the root layout, which every route shares.

- `RootLayout` → `getLocale()` → `headers()` (`x-locale`, written by middleware), falling back to `cookies()` (`ops-lang`).
- Root `generateMetadata` → `getLocale()` + `getPathname()` → `headers()` (`x-pathname`).
- Page `generateMetadata` functions and deep server components (`getTDict`) → `getLocale()`.

The locale is already a pure function of the URL: middleware writes `x-locale=es` only for `/es` and `/es/<translated path>` and `x-locale=en` on every other matched request, so the cookie fallback is never reached on a routed page. Reading it from request headers costs a server render on every visit and buys nothing.

## Goals

1. Every page that does not read per-request data renders statically and refreshes by ISR: journal index and articles, industries, compare, platform, plans, company, resources, tools, leadership landing, shop, home — English and Spanish.
2. Locale comes from the route, never from `headers()` or `cookies()` during render.
3. Byte-identical SEO output on every 200 page: `<html lang>`, title, description, robots, canonical, hreflang alternates, Open Graph, Twitter, JSON-LD.
4. Identical middleware behaviour: `/es/<untranslated>` → 308 English; `ops-lang=es` on an unprefixed translated path → 308 `/es/...`; `/es/<translated>` sets `ops-lang=es`; first-touch attribution unchanged.
5. Nothing that is fresh today goes stale: data read by a page (journal lists, related-journal rails, shop products, the store-live flag in the nav) refreshes within 5 minutes, and journal changes refresh immediately through a secret-protected revalidation endpoint.

## Non-goals

- `/spec` and `/es/spec` read `?fit=` server-side (no-flash shared links) and fetch the live OPS BOARD per request; `/legal` renders its document from `?page=`. Both stay dynamic by design.
- Checkout, confirmation, token and leadership-results pages are per-request by nature and stay dynamic.
- The footer EN toggle loop (a Spanish visitor clicking EN is bounced back to Spanish by the cookie redirect) is a separate, pre-existing defect; this change keeps that redirect identical and flags the defect separately.

## Decision: two root layouts, locale from the route group

Considered:

- **A — `[locale]` dynamic root segment fed by a middleware rewrite** (`/platform` → `/en/platform`). Every URL is served from a different internal path, so `usePathname()` in the navigation, language toggle, banner and analytics sees the rewritten path on statically prerendered pages; file-convention OG image URLs gain an `/en` prefix; internal `/en/*` duplicates need guarding; untranslated routes would prerender a Spanish copy nobody may reach.
- **B — two root layouts in route groups, no rewrite** (chosen). `src/app/(en)/…` holds every existing route unchanged in URL; `src/app/(es)/es/…` holds exactly the eight translated routes. Each root layout is static and knows its locale. URLs equal file paths, so there is no rewrite, no `x-locale`/`x-pathname`, no `usePathname()` ambiguity and no OG image URL change. Moving between the English and Spanish shells is a full page load, which is already what the language toggle and banner do.

B removes the whole request-header channel instead of re-plumbing it.

## Structure

```
src/app/
  (en)/layout.tsx            root layout, lang="en", revalidate 300
  (en)/not-found.tsx, error.tsx
  (en)/<every existing route, same URL>
  (es)/es/layout.tsx         root layout, lang="es", revalidate 300
  (es)/es/not-found.tsx, error.tsx
  (es)/es/{page,platform,plans,spec,company,resources,tools,shop}
  _pages/<route>.tsx         shared page body + metadata for the eight translated routes
  global-not-found.tsx       full English 404 for unmatched URLs (experimental.globalNotFound)
  api/**, sitemap.ts, robots.ts, favicon.ico, icon.png, apple-icon.png, globals.css (unchanged)
```

- `SiteDocument` (`src/components/layout/SiteDocument.tsx`) renders the `<html>`/`<body>` shell, `LanguageProvider`, `PageLayout`, sitewide JSON-LD and analytics, taking `locale` as a prop. Both root layouts render it.
- `src/i18n/routes.ts` becomes the single source of truth for `TRANSLATED_PATHS` (pure, no imports) and is imported by middleware, `server.ts` and the sitemap; the middleware's hand-kept mirror is deleted. A test asserts the set equals the pages present under `(es)/es`.

## Locale inside a render

`src/i18n/server.ts` keeps `getTDict(namespace)` for the ~20 server components that call it, but the locale now comes from a render-scoped store (`React.cache`), set by `setRequestLocale(locale)` in every root layout and every page (pages render without their layout on client navigations to dynamic routes, so each sets it). `getLocale()` throws if nothing set it — a missing call fails the build or the request loudly instead of silently rendering the wrong language. A test walks every `page.tsx` and `layout.tsx` under both groups and asserts each calls `setRequestLocale`. `generateMetadata` never reads the store; it takes its locale explicitly (`getDictionary(locale, namespace)`).

## Metadata parity

Next merges metadata shallowly per key. Today the root layout derives `openGraph.url` and `alternates` from `x-pathname`; a static root layout cannot know the path. So:

- Root layout metadata keeps every site-level field (`metadataBase`, title default/template, description, `openGraph` type/locale/siteName/images, `twitter`, `icons`) and drops only the path-derived `openGraph.url` and `alternates`.
- Pages that already set `openGraph` and `alternates` are unchanged.
- Pages that relied on inheriting them (checkout, confirmation, SPEC flow and token pages, leadership assess/demo/results, screens-dev pages) declare them explicitly through `routeMetadata(path, locale)`, which returns exactly what the layout produced for that path: `openGraph = site Open Graph + url`, `alternates = buildLocaleAlternates(path, locale)`.
- 404 responses: today the layout stamps a canonical and `og:url` pointing at the missing URL. A static 404 cannot know that URL, so 404s lose that self-canonical. A canonical on a 404 has no indexing effect.
- Open Graph images: file-based metadata images under a route group get a hash suffix (`/industries/<slug>/opengraph-image-1s72ac`, compare `-1okiq5`), so `og:image` on the 57 industry and compare pages changes address; the image bytes are identical. Rewrites (`src/lib/seo/legacy-metadata-rewrites.ts`) keep the old addresses serving for cached link previews, and a test derives the suffixes from Next's normalizer.

These two are the only intended metadata differences.

## 404s

Unmatched URLs render `src/app/global-not-found.tsx` (the English site shell, prerendered once; `experimental.globalNotFound`, still experimental in Next 16.1). A catch-all route calling `notFound()` was tried first: Next answers it with its client-rendered error shell (`<html id="__next_error__">`), so crawlers and no-JS visitors would lose the full 404 page they get today. `notFound()` inside a page still renders its group's `not-found.tsx`, as it does in production today.

## Freshness

- Both root layouts export `revalidate = 300`, so every static route (including ones with no page-level revalidate: industries, compare, platform, plans, company, resources, tools, leadership) re-renders at most every 5 minutes. This keeps the nav's store-live flag and the related-journal rails on industries/compare as fresh as the pages that already set 300.
- `sitemap.xml` stays build-static and is additionally refreshed by the journal revalidation endpoint (today it only changes on deploy).

## Journal revalidation endpoint

`POST /api/revalidate/journal`

- Auth: `Authorization: Bearer ${OPS_SITE_REVALIDATE_SECRET}`, constant-time compare. Unset secret → 500; missing/wrong → 401.
- Body (optional JSON): `{ "slugs": string[] }` — the posts that changed (for a rename, old and new). Each slug must match `^[a-z0-9]+(?:-[a-z0-9]+)*$`, at most 50; otherwise 400.
- Effect: revalidates every route that renders journal data — `/journal/[slug]` (all articles: each carries a related-posts rail), `/journal`, `/`, `/es`, `/industries/[slug]`, `/compare/[slug]` (related-journal rails) and `/sitemap.xml` — plus each named `/journal/<slug>` path (covers a slug whose 404 was cached before it went live).
- Response 200: `{ revalidated: string[], slugs: string[], at: ISO }`. `Cache-Control: no-store`.
- The journal-dependent route list lives in one constant beside the endpoint; a test asserts every route file that imports journal data (directly or through the shared journal components) is covered.

The time-based 5-minute ISR remains the safety net for any writer that never calls the endpoint (the legacy Codex breaking-news automation writes `blog_posts` directly).

Callers (ops-web, owned by the Instagram overhaul's journal stream on `feat/journal-autopublish-breaking`; this change does not edit their files): after every successful write to `blog_posts` — admin blog API create/update/delete, editorial PUBLISH NOW, cron auto-publish, generated-photo replacement on a published post. A failed call must never fail the publish; it is logged and ISR catches up within 5 minutes. The contract and a drop-in client are handed to that stream.

Configuration: one new secret, same value in ops-site (Production + Preview) and ops-web (Production) as `OPS_SITE_REVALIDATE_SECRET`. Setting it is Jackson's action.

## Verification

1. `next build` route table: journal index and articles, industries, compare, platform, plans, company, resources, tools, leadership, shop, home and all eight `/es` routes are `○`/`●` with a 5-minute revalidate; only the request-bound routes above remain `ƒ`.
2. SEO parity harness (one-off, session scratchpad; results in `docs/artifacts/2026-09-28-static-marketing-cache/`): extracts status, `lang`, title, description, robots, canonical, hreflang, OG, Twitter and parsed JSON-LD for every sitemap URL plus the non-sitemap routes and 404s; before = production, after = local production build on the same database; diff must be empty except the two documented differences.
3. Middleware behaviour matrix (redirects, cookie writes) before vs after.
4. Response headers: local `next start` (`x-nextjs-cache` HIT/STALE, `s-maxage`) and a Vercel preview deployment (`x-vercel-cache` HIT on repeat, public cache-control).
5. Revalidation endpoint: 500/401/400/200 paths; after a 200, a journal page re-renders.
6. All ops-site tests: `npx tsx --test $(find src -name '*.test.ts*')`.

## Coordination

- `fix/ga4-collection` (ready, unpushed) edits `src/app/layout.tsx`; whichever lands second ports its 8-line change (head `GoogleAnalytics`, body `GoogleAnalyticsPageViews`) into `SiteDocument`.
- `fix/platform-phone-open-defects` and other open branches edit files under `src/app/platform/` etc.; git follows the renames into `(en)/`.
