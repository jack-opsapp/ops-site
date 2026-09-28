# Static Marketing Cache Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Every ops-site page that does not read per-request data renders statically with 5-minute ISR, locale comes from the route, SEO output is unchanged, and journal writes can refresh the site instantly.

**Architecture:** Two root layouts in route groups — `src/app/(en)/` (every route, URL unchanged) and `src/app/(es)/es/` (the eight translated routes) — each static and locale-aware; a React `cache` store carries the locale to deep server components; middleware keeps its redirect/cookie behaviour without rewriting or writing headers; `POST /api/revalidate/journal` revalidates the journal-dependent routes. Spec: `docs/superpowers/specs/2026-09-28-static-marketing-cache-design.md`.

**Tech Stack:** Next.js 16.1.6 App Router, React 19.2, TypeScript 5.9, node:test via tsx.

**Design System:** N/A — no visual change. Every rendered element keeps its existing classes.

**Required Skills:** superpowers:test-driven-development, superpowers:verification-before-completion. (`frontend-design`, `interface-design`, `elite-animations`, `ops-copywriter`, `audit-design-system`: not applicable — no UI, copy or motion changes.)

**Facts the implementer must not rediscover:**
- Implicit cache tags use the unnormalized route, so a typed `revalidatePath` pattern must include the group: `revalidatePath('/(en)/journal/[slug]', 'page')`. Concrete paths (`'/journal'`, `'/es'`) are group-agnostic. (Source: `node_modules/next/dist/server/lib/implicit-tags.js`.)
- `experimental.globalNotFound` is still experimental in 16.1.6. A catch-all `(en)/[...missing]` → `notFound()` renders Next's client-side error shell, so unmatched URLs use `src/app/global-not-found.tsx` with the flag on (changed during execution; see the spec § 404s).
- Next merges metadata shallowly per top-level key; a page's `openGraph` replaces the layout's.
- Builds: ONE local production build after implementation (Supabase keys exported from `ops-web/.env.local`, never printed); rebuild only if a defect is found. Vercel Preview env has no Supabase keys.

---

### Task 1: Pure locale routing module

**Files:** Create `src/i18n/routes.ts`, `src/i18n/__tests__/routes.test.ts`.

`routes.ts` (no imports except types) owns: `TRANSLATED_PATHS` (moved from `server.ts`, with its doc comment), `hasSpanishContent`, `buildLocaleAlternates`, `buildLocaleUrl` (moved verbatim), and `resolveLocaleRoute(pathname, cookieLocale)`:

```ts
export type LocaleRouteDecision =
  | { kind: 'redirect'; pathname: string }
  | { kind: 'spanish' }
  | { kind: 'default' };

export function resolveLocaleRoute(pathname: string, cookieLocale: string | undefined): LocaleRouteDecision {
  if (pathname === '/es' || pathname.startsWith('/es/')) {
    const internalPath = pathname === '/es' ? '/' : pathname.slice(3);
    return hasSpanishContent(internalPath) ? { kind: 'spanish' } : { kind: 'redirect', pathname: internalPath };
  }
  if (cookieLocale === 'es' && hasSpanishContent(pathname)) {
    return { kind: 'redirect', pathname: pathname === '/' ? '/es' : `/es${pathname}` };
  }
  return { kind: 'default' };
}
```

Tests (write first, see them fail on the missing module): the full decision matrix (`/es`, `/es/platform`, `/es/journal`, `/es/journal/x`, `/es/es/platform`, `/esp`, `/platform` ± cookie, `/journal` + cookie, `/` + cookie, cookie `en`); `buildLocaleAlternates` for a translated path in both locales and an untranslated path (pinned literal objects); `buildLocaleUrl` for `/` and `/platform` in both locales.

Run: `npx tsx --test src/i18n/__tests__/routes.test.ts` → PASS. Commit `refactor(i18n): pure locale routing module`.

### Task 2: Render-scoped locale

**Files:** Modify `src/i18n/server.ts`, `src/i18n/index.ts`.

`server.ts`: drop `next/headers`, `getPathname`; re-export the four pure helpers from `./routes`; add

```ts
const requestLocale = cache((): { current: Locale | null } => ({ current: null }));
export function setRequestLocale(locale: Locale): void { requestLocale().current = locale; }
export async function getLocale(): Promise<Locale> { /* throws a descriptive Error when unset */ }
export async function getDictionary(locale: Locale, namespace: Namespace): Promise<Dictionary> // was loadDictionary
```

`getTDict`/`getT` keep their signatures and read `getLocale()`. `index.ts` exports `setRequestLocale`, `getDictionary`.

### Task 3: Middleware without rewrite or headers

**Files:** Modify `src/middleware.ts` (and its header doc comment).

Import `resolveLocaleRoute` from `@/i18n/routes`; delete the mirrored `TRANSLATED_PATHS`. `redirect` → `NextResponse.redirect(clone with pathname, 308)`; `spanish` → `NextResponse.next()` + `ops-lang=es` cookie (same `path`, `maxAge`, `sameSite`); `default` → `NextResponse.next()`. Every branch still goes through `attachFirstTouch`. Matcher unchanged. Commit tasks 2–3 together only if the tree compiles; otherwise commit after Task 6.

### Task 4: Site metadata and document shell

**Files:** Create `src/lib/seo/site-metadata.ts`, `src/lib/seo/__tests__/site-metadata.test.ts`, `src/components/layout/SiteDocument.tsx`.

- `siteOpenGraph(locale)` → `{ type: 'website', locale: 'es_MX' | 'en_US', siteName: 'OPS', images: [og-image 1200×630 + alt] }`.
- `siteMetadata(locale)` → the old root `generateMetadata` output minus `openGraph.url` and `alternates` (metadataBase, title default/template, description, openGraph, twitter, icons) — strings copied verbatim.
- `routeMetadata(path, locale)` → `{ openGraph: { ...siteOpenGraph(locale), url: buildLocaleUrl(path, locale) }, alternates: buildLocaleAlternates(path, locale) }`.
- `SiteDocument({ locale, children })` → the old `RootLayout` JSX verbatim (html lang, font classes, body, `LanguageProvider`, `PageLayout`, sitewide JSON-LD, analytics, `BugReportShortcut`), imports `@/app/globals.css` last.

Tests pin the exact title/description strings for both locales and the `routeMetadata` shape.

### Task 5: Route groups

**Files:** `git mv` every route out of `src/app/` into `src/app/(en)/`: `page.tsx company compare error.tsx industries journal legal not-found.tsx plans platform resources shop spec tools`. Delete `src/app/layout.tsx`. `api`, `sitemap.ts`, `robots.ts`, `favicon.ico`, `icon.png`, `apple-icon.png`, `globals.css` stay.

Create:
- `src/app/(en)/layout.tsx` — `export const revalidate = 300; export const metadata = siteMetadata('en');` default renders `setRequestLocale('en')` then `<SiteDocument locale="en">`.
- `src/app/global-not-found.tsx` — `setRequestLocale('en')`, renders `<SiteDocument locale="en"><NotFoundContent /></SiteDocument>`; `experimental.globalNotFound: true` in `next.config.ts`.
- `src/lib/seo/legacy-metadata-rewrites.ts` + `next.config.ts` `rewrites()` — old `/industries|compare/<slug>/opengraph-image` URLs → the suffixed routes (added during execution after the parity diff).
- `src/app/(es)/es/layout.tsx` — same with `'es'`.
- `src/app/(es)/es/not-found.tsx`, `error.tsx` — render the same content as the English ones via shared `src/components/shared/NotFoundContent.tsx` and `ErrorContent.tsx` (the English files switch to those too).

### Task 6: Pages

**Translated routes** (`/`, platform, plans, spec, company, resources, tools, shop): move the body and metadata into `src/app/_localized/<route>.tsx` exporting `<route>Metadata(locale)` and a default page component (no route-segment config there). Metadata bodies are copied verbatim with `getLocale()` replaced by the `locale` argument and `getTDict` replaced by `getDictionary(locale, …)` (platform's unused dict/t in metadata is dropped). Route files in `(en)` and `(es)/es` are thin: `generateMetadata` → `<route>Metadata(locale)`; default → `setRequestLocale(locale)` then the shared component; `/` and `/shop` keep `export const revalidate = 300`; spec forwards `searchParams`.

**English-only routes** (journal, journal/[slug], industries, industries/[slug], compare, compare/[slug], legal, tools/leadership and its children, shop checkout/confirmation, spec sub-pages, screens-dev pages): every default export calls `setRequestLocale('en')` first; `getLocale()` and the unreachable `locale === 'es'` branches go (English strings kept verbatim); pages that inherited `openGraph`/`alternates` from the old layout spread `routeMetadata(path, 'en')` so their output is unchanged (token pages build the path from params; pages that set their own `openGraph` but not `alternates` add only `alternates`).

Gate: `npx tsc --noEmit` clean, `npx eslint src` clean.

### Task 7: Coverage tests

**Files:** `src/i18n/__tests__/route-locale-coverage.test.ts`.

- Every `page.tsx`/`layout.tsx` under `src/app/(en)` contains `setRequestLocale('en')`; under `src/app/(es)` contains `setRequestLocale('es')`.
- The set of routes under `src/app/(es)/es` (path of each `page.tsx`, `/es` stripped, `''` → `/`) equals `TRANSLATED_PATHS`.
- Nothing under `src/app` or `src/components` imports `next/headers` except the known per-request modules (`src/lib/auth/get-current-user.ts`, `spec/checkout/[buyer_checkout_token]/page.tsx`).

### Task 8: Journal revalidation endpoint

**Files:** Create `src/lib/journal-revalidation.ts`, `src/lib/__tests__/journal-revalidation.test.ts`, `src/app/api/revalidate/journal/route.ts`.

`journal-revalidation.ts`:
- `JOURNAL_DEPENDENT_ROUTES` = `[['/(en)/journal/[slug]','page'], ['/journal'], ['/'], ['/es'], ['/(en)/industries/[slug]','page'], ['/(en)/compare/[slug]','page'], ['/sitemap.xml']]`.
- `handleJournalRevalidation(request, { secret, revalidatePath, now })` → `Response`: 500 when `secret` unset; 401 on missing/wrong bearer (constant-time); 400 on invalid JSON or `slugs` not an array of ≤50 strings matching `^[a-z0-9]+(?:-[a-z0-9]+)*$`; otherwise calls `revalidatePath` for each dependent route plus `/journal/<slug>` for each slug, returns 200 `{ revalidated, slugs, at }` with `Cache-Control: no-store`. Empty body = no slugs.

`route.ts`: `export const dynamic = 'force-dynamic'`; `POST` delegates with `process.env.OPS_SITE_REVALIDATE_SECRET` and `revalidatePath` from `next/cache`.

Tests: every status path; the exact `revalidatePath` calls; each typed pattern resolves to an existing route file under `src/app` (strip `/(en)`, map to `page.tsx`); every route file that imports journal data — `@/lib/blog` or a component that does (JournalPreview, RelatedPosts, RelatedJournalPosts, PostList, BlogPostRow, CategoryFilter, PostHeader), directly or through `_localized` — is covered by a pattern or a concrete path.

### Task 9: Sitemap import

`src/app/sitemap.ts` imports `hasSpanishContent` from `@/i18n/routes`. No behaviour change.

### Task 10: Full test suite + build

- `npx tsx --test $(find src -name '*.test.ts*')` → all pass.
- Build once in the background with Supabase keys exported from `ops-web/.env.local` (never echoed): `npx next build` → save the route table to `docs/artifacts/2026-09-28-static-marketing-cache/route-table-after.txt`. Expected: journal, industries, compare, platform, plans, company, resources, tools, leadership (+demo/assess), shop and `/es/*` except `/es/spec` are `○`/`●` with `5m`; `ƒ` only for `/spec`, `/es/spec`, `/legal`, shop checkout/confirmation, SPEC flow/token pages, leadership results, API routes, the catch-all.

### Task 11: Parity + behaviour evidence (local `next start`)

Harness (scratchpad, one-off): fetch every sitemap URL plus the non-sitemap routes, `/legal?page=*`, `/spec?fit=ops`, fake-token pages and 404s from `https://opsapp.co` (before) and `http://localhost:<port>` (after); extract status, `html[lang]`, title, all `<meta>` name/property/content, canonical/alternate/icon links, JSON-LD (inline scripts and `self.__next_s` payloads, parsed); diff. Expected: identical except the documented 404 self-canonical/og:url. Middleware matrix (status, `location`, `ops-lang` cookie, first-touch cookie present) before vs after: identical (host-dependent cookie `domain`/`secure` normalized). Headers: second request to a journal article → `x-nextjs-cache: HIT`, `cache-control` with `s-maxage=300`. Revalidation: call endpoint with a local secret → 200 → next article request regenerates (`x-nextjs-cache` STALE→ new render timestamp); 401/400/500 paths. Save summaries to `docs/artifacts/2026-09-28-static-marketing-cache/`.

### Task 12: Vercel preview

`vercel deploy` (preview, not `--prod`) from the worktree with a throwaway runtime secret (`-e OPS_SITE_REVALIDATE_SECRET=…`). Record build route table and, for `/`, `/platform`, `/es/platform`, `/journal`, `/industries/<slug>`, `/compare/<slug>`: repeat-request `x-vercel-cache: HIT` and public cache-control; redirect/cookie matrix; revalidation endpoint 200 then `x-vercel-cache` REVALIDATED/STALE→HIT.

### Task 13: Bible, coordination, report

- Bible (`ops-software-bible/08_DEPLOYMENT_AND_OPERATIONS.md` § ops-site; SEO/i18n and the journal §21 in `07_SPECIALIZED_FEATURES.md`; route in `04_API_AND_INTEGRATION.md`) in a bible worktree; commit.
- Send the endpoint contract and a drop-in ops-web client to session "INSTAGRAM CLOUD EDITORIAL - P1-2" (owner of `feat/journal-autopublish-breaking`); do not edit their files.
- Memory update; plain-language report to Jackson with proofs; ask for GO on the secret and the push.
