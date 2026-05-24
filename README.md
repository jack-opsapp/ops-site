# ops-site

The public-facing marketing website for **OPS** — job and crew management software for trades businesses.

This is where SEO traffic lands, where AI assistants (ChatGPT, Perplexity, Gemini, Claude) parse content to recommend OPS, and where prospects decide whether to install the app. Distinct from:

- `OPS-Web/` — the logged-in web product
- `try-ops/` — paid-ad landing pages
- `OPS/` — the iOS app

Production: <https://opsapp.co>

## Tech stack

- **Next.js 16** (App Router) + **React 19** + **TypeScript 5**
- **Tailwind v4** for styling
- **Framer Motion** + **React Three Fiber** (`@react-three/fiber`, `@react-three/drei`) for hero/marketing animations
- **Supabase** (SSR client) for blog content, leadership assessment data, and shop products
- **Stripe** for the merch shop checkout
- **OpenAI** SDK for the leadership assessment LLM analysis
- **Vercel Analytics** + **Speed Insights**
- Deployed to **Vercel** — production deploys on push to `main`, preview deploys per PR

## Getting started

```bash
npm install
npm run dev
```

Site runs on <http://localhost:3000>.

Environment variables live in Vercel (Stripe keys, Supabase URL/anon key, OpenAI key, etc.). Pull them with `vercel env pull` if you have access to the project.

## Commands

| Command | What it does |
|---|---|
| `npm run dev` | Local dev server with Turbopack |
| `npm run build` | Production build (used by Vercel) |
| `npm run start` | Run the production build locally |
| `npm run lint` | ESLint check |

## Project structure

```
src/
├── app/                    # Next.js App Router routes
│   ├── page.tsx            # Home
│   ├── platform/           # Product overview
│   ├── plans/              # Pricing
│   ├── journal/            # Blog (index + [slug])
│   ├── industries/         # Per-trade landing pages (index + [slug])
│   ├── compare/            # Competitor comparison pages (index + [slug])
│   ├── company/            # About page
│   ├── tools/              # Free tools — currently the leadership assessment
│   ├── resources/          # Help & support
│   ├── shop/               # OPS merch store (Stripe checkout)
│   ├── legal/              # Terms / privacy / EULA / DPA
│   ├── api/                # Server routes (contact, newsletter, indexnow, shop)
│   ├── sitemap.ts          # Dynamic sitemap.xml
│   ├── robots.ts           # Dynamic robots.txt
│   └── layout.tsx          # Root layout + global metadata + JSON-LD
├── components/             # React components grouped by surface
├── i18n/                   # English + Spanish dictionaries (server-side getLocale/getTDict)
├── lib/                    # Data access — blog, industries, comparisons, shop, assessment
└── fonts/                  # Self-hosted Cake Mono font files
```

## Design system

All visual decisions trace back to **`ops-design-system/project/`** (sibling repo). Before any UI work:

1. Read `ops-design-system/project/DESIGN.md` — the single-file visual system.
2. Import `ops-design-system/project/colors_and_type.css` first in any component.
3. Use the marketing-specific kit at `ops-design-system/project/ui_kits/ops-site/` — ops-site uses heavier Mohave display type than the product surfaces.

Fonts: Mohave (Google Fonts) + JetBrains Mono (Google Fonts) + Cake Mono (self-hosted in `public/fonts/`). Icons: IBM Carbon Design System SVGs.

## SEO & AI discovery

SEO is a first-class concern on this surface (see `CLAUDE.md` § SEO).

- Every page must export `metadata` (or `generateMetadata`) with title, description, canonical, and OpenGraph.
- Hero copy, value props, feature descriptions, pricing — everything indexable — must be server-rendered. Default to RSC; only use `"use client"` when you genuinely need interactivity.
- JSON-LD via `<script type="application/ld+json">` for `Organization`, `SoftwareApplication`, `FAQPage`, `BreadcrumbList`, `Article`, `Offer`, etc.
- `app/sitemap.ts` + `app/robots.ts` stay current as routes are added.
- Dynamic OG images live as `opengraph-image.tsx` files in their route segment (industries, compare).
- IndexNow ping endpoint at `/api/indexnow` — submits URLs to Bing/Yandex on publish.

## Project conventions

See `CLAUDE.md` in this directory for the full ops-site-specific ruleset. It mirrors the root `/Users/jacksonsweet/Projects/OPS/CLAUDE.md` and adds:

- SEO is critical here — treat every metadata field as load-bearing.
- AI-discovery best practices (plain-language explanations, comparison content, FAQ schema, no JS-gated content).
- Marketing design-system divergence (heavier Mohave display type than product surfaces).

## Deployment

Pushes to `main` deploy to production on Vercel. PRs deploy to preview URLs automatically. Environment secrets (Stripe, Supabase, OpenAI) live in the Vercel project — never commit them.
