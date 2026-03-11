# Industry Landing Pages — Design Spec

**Date:** 2026-03-11
**Status:** Approved

## Overview

SEO-focused landing pages for each industry OPS serves. Hidden from navigation, discoverable only through search engines and direct links. Each page has unique, research-driven copy tailored to that trade's specific pain points, workflows, and competitor landscape.

URL structure: `/industries/{slug}` (e.g., `/industries/landscaping`, `/industries/auto-detailing`, `/industries/railings`)

## Goals

1. Rank for industry-specific long-tail keywords (e.g., "landscaping crew scheduling app", "auto detailing job management")
2. Provide AI-parseable structured Q&A content via FAQPage JSON-LD schema
3. Convert organic search traffic with industry-relevant messaging
4. Scale to 20+ industries with a single reusable page component + data file

## Page Sections

Each industry page follows this section flow:

### 1. Hero
- Industry-specific headline targeting the #1 volume keyword for that trade
- Subtext that speaks to the daily reality of that trade
- Two CTAs: "Download Free" + "Try It First"
- Full-viewport dark background, same visual weight as homepage hero
- No hero image — keeps pages lightweight for SEO performance

### 2. Industry Pain Points
- 3 cards, each with a title + 3-4 bullet points
- Written in the voice of someone in that trade, using language from forums/Reddit
- Each card has a "For:" line identifying the specific persona
- **Animation:** On hover (desktop) or scroll-center (mobile), each card:
  - Tilts subtly in 3D via `perspective(800px) rotateX/Y` (±4deg max)
  - Desktop: tilt follows mouse position within the card
  - Mobile: fixed subtle tilt, triggered by IntersectionObserver (threshold: 0.6)
  - DataFunnel canvas particles begin streaming through the card
  - Each card has a unique flow direction (left-to-right, top-to-bottom, right-to-left)
  - Particles use existing blue/orange/white color transformation logic
  - SVG wireframe illustration plays its animation sequence
  - Border brightens slightly
  - 200ms transition in, 300ms transition out
  - Only one card active at a time on desktop
  - Respects `prefers-reduced-motion`

### 3. How OPS Solves It
- 3-4 feature blocks, each directly mapping to a pain point from section 2
- Alternating layout (text-left / text-right)
- Industry-specific framing of OPS features (same features, different context)
- Optional WireframeIllustration per block

### 4. Vs The Alternatives
- Comparison table: OPS vs 2 industry-relevant competitors
- 4-6 rows comparing features that matter to that specific trade
- OPS column visually highlighted
- Competitor names are real products used in that vertical
- Honest comparison — no strawmanning

### 5. FAQ (Q&A for AI SEO)
- **3 universal questions** (shared across all industry pages):
  1. What does OPS cost?
  2. How do I get started with OPS?
  3. What devices does OPS work on?
- **3-5 industry-specific questions** (unique per page):
  - Written to match how people actually search
  - Questions contain the industry keyword naturally
  - Answers are complete, self-contained paragraphs (optimized for AI extraction)
  - Examples: "How does OPS handle multi-crew landscaping schedules?", "Can my detailing techs see their appointments for the day?"
- Accordion-style expand/collapse UI
- `FAQPage` JSON-LD schema injected via `generateMetadata()` for each page
- Reuses existing `FAQ` / `FAQItem` components

### 6. Final CTA
- Industry-tailored closing headline and subtext
- Same two CTAs: "Download Free" + "Try It First"
- Reuses existing `BottomCTA` pattern

## Technical Architecture

### File Structure

```
src/
  app/industries/[slug]/page.tsx       # Dynamic route — single page component
  lib/industries.ts                    # All industry content, typed (follows src/lib/ convention)
  components/industries/
    IndustryHero.tsx                    # Hero with industry-specific copy
    IndustryPainPoints.tsx             # Pain point cards with tilt + particles
    IndustryPainPointCard.tsx          # Individual card with 3D tilt + particles
    IndustrySolutions.tsx              # Feature blocks mapped to pain points
    IndustryComparison.tsx             # Competitor comparison table
    IndustryFAQ.tsx                    # FAQ accordion + JSON-LD generation
    IndustryCTA.tsx                    # Final CTA section, data-driven with two buttons
  components/animations/
    CardParticleFlow.tsx               # NEW — lightweight card-scoped particle canvas
```

### Routing & Generation

- **Dynamic route:** `app/industries/[slug]/page.tsx`
- **`generateStaticParams()`** — enumerates all industry slugs from data file, pre-renders at build time
- **`generateMetadata()`** — unique title, description, keywords, and FAQPage JSON-LD per industry
- **Pure static generation** — no ISR needed since content lives in a TS data file and only changes on redeploy

### Data File: `src/lib/industries.ts`

Typed data structure containing all industry-specific content. Located in `src/lib/` to follow existing project conventions (`blog.ts`, `legal-content.ts`).

```typescript
// Content for a single locale
interface IndustryContent {
  meta: {
    title: string;                     // SEO title
    description: string;               // Meta description
    keywords: string[];                // Target keywords (for reference, not meta tag)
  };
  hero: {
    sectionLabel: string;
    headline: string;
    subtext: string;
  };
  painPoints: Array<{
    title: string;
    bullets: string[];
    forLine: string;
  }>;
  solutions: Array<{
    title: string;
    copy: string;
    painPointRef: number;              // Index of pain point this solves
  }>;
  comparison: {
    competitors: [string, string];     // Two competitor names
    rows: Array<{
      feature: string;
      ops: boolean | string;           // true/false for check/X, string for nuance ("Limited", "Add-on")
      comp1: boolean | string;
      comp2: boolean | string;
    }>;
  };
  faq: Array<{
    question: string;
    answer: string;
  }>;
  cta: {
    headline: string;
    subtext: string;
  };
}

interface IndustryData {
  slug: string;
  name: string;                        // Display name (e.g., "Landscaping")
  painPointConfig: Array<{
    variant: 'messages' | 'dashboard' | 'apps' | string;  // Extensible for future industry-specific variants
    flowDirection: 'left-to-right' | 'top-to-bottom' | 'right-to-left';
  }>;
  content: {
    en: IndustryContent;
    es?: IndustryContent;              // Spanish added later per-industry
  };
}
```

### SEO

- **Not in navigation** — no changes to `Navigation.tsx` or `MobileMenu.tsx`
- **In sitemap** — `sitemap.ts` updated to dynamically enumerate all industry slugs with `priority: 0.8`
- **JSON-LD FAQPage schema** — injected in page metadata for AI search and featured snippets
- **Canonical URLs** — self-referencing canonical per page
- **i18n** — data file uses locale-keyed content (`content.en`, `content.es`). Page component reads current locale via `getLocale()` and selects the matching content branch. Falls back to `en` if `es` is not yet available for an industry. Does NOT use the `src/i18n/dictionaries/` system — industry content is self-contained in the data file since it's unique per page, not shared translations

### Reused Components

- `Button` — CTAs
- `SectionLabel` — section headers
- `FadeInUp` — scroll reveal animations
- `Card` — pain point card wrapper
- `FAQ` / `FAQItem` — accordion Q&A
- `WireframeIllustration` — SVG wireframes on pain point cards

### New Components

- `CardParticleFlow` — **new lightweight canvas particle component** inspired by `DataFunnel` but designed for card-sized containers. Not a refactor of `DataFunnel` — a separate, simpler component that:
  - Takes `flowDirection` and `isActive` props
  - Renders in a card-sized container (no large negative insets)
  - Uses the same blue/orange/white color palette and Catmull-Rom spline math
  - Fewer lanes (6-8 vs DataFunnel's 14) and fewer particles for performance in a 3-card grid
  - Self-contained canvas with ResizeObserver
- `IndustryPainPointCard` — extends `PainPointCard` with:
  - 3D perspective tilt (mouse-tracked on desktop, fixed on mobile)
  - Composites `CardParticleFlow` as an absolute-positioned overlay
  - IntersectionObserver for mobile activation
- `IndustryComparison` — comparison table with competitor data, supports `boolean | string` cell values
- `IndustryFAQ` — FAQ accordion that also generates JSON-LD schema
- `IndustryCTA` — data-driven final CTA section with two buttons (headline + subtext from data file). Built from scratch rather than extending existing `BottomCTA`/`FinalCTA` which are not parameterized for this use case

## Content Pipeline

For each industry, before writing copy:

1. **Keyword Research** — search for high-volume head terms and long-tail high-intent queries
2. **Intent Mapping** — map keyword clusters to page sections (hero targets head terms, FAQ targets question queries, comparison targets "vs"/"alternative" queries)
3. **Competitor Analysis** — identify 2 real competitors in that vertical, research their strengths/weaknesses
4. **Forum/Reddit Research** — find actual language and pain points from trade workers
5. **Write Copy** — hero headline built around #1 volume keyword, pain points using real forum language, FAQ questions matching exact search phrasing
6. **AI SEO Optimization** — FAQ answers as complete self-contained paragraphs, natural keyword density, structured JSON-LD

## Proof of Concept Industries

Build these 3 first to validate the template:

1. **Landscaping** — high-volume outdoor trade, seasonal workflows, multi-crew dynamics
2. **Auto Detailing** — non-traditional field service, tests template flexibility beyond classic trades
3. **Railings** — niche trade, founder's vertical, validates template works for specialized industries

## Target Industries (Full List)

After POC validation, expand to:

**Core Trades:** Decks & fencing, roofing, siding, painting, concrete, framing, general contracting
**Mechanical Trades:** HVAC, plumbing, electrical
**Specialty/Outdoor:** Tree service, excavation, paving, pool installation
**Property Services:** Property maintenance, janitorial, pest control, snow removal

Each new industry requires only a new entry in the data file — no new components or routes needed.

## Animation Standards

Per project design system:
- No bounce, no spring, no decorative animation
- `transform` and `opacity` only — never animate layout
- 100-150ms micro-interactions, 200-250ms transitions
- Respect `prefers-reduced-motion` system settings
- DataFunnel particles: canvas-based for 60fps, retina-aware

**Note on tilt animation:** The 3D perspective tilt uses `transform` only (rotateX/Y). The DataFunnel is canvas-based. Both comply with the animation standards — no layout animation, no bounce physics.
