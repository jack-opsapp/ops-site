# Industry Landing Pages Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build SEO-focused industry landing pages at `/industries/{slug}` with research-driven copy, interactive pain point animations, competitor comparisons, and FAQPage JSON-LD schema.

**Architecture:** Single dynamic Next.js route (`app/industries/[slug]/page.tsx`) driven by a typed data file (`src/lib/industries.ts`). Industry content is locale-keyed (`en`/`es`). Six section components compose each page. A new `CardParticleFlow` canvas component provides card-scoped particle animations.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Framer Motion, Tailwind CSS, Canvas API

**Spec:** `docs/superpowers/specs/2026-03-11-industry-landing-pages-design.md`

---

## File Map

### New Files
| File | Responsibility |
|------|---------------|
| `src/lib/industries.ts` | Types + industry content data (all locales) |
| `src/app/industries/[slug]/page.tsx` | Dynamic route, metadata, JSON-LD, static params |
| `src/components/industries/IndustryHero.tsx` | Full-viewport hero with industry copy |
| `src/components/industries/IndustryPainPoints.tsx` | 3-card grid with tilt + particles (desktop + mobile) |
| `src/components/industries/IndustryPainPointCard.tsx` | Single card: 3D tilt, particle overlay, wireframe |
| `src/components/industries/IndustrySolutions.tsx` | Feature blocks mapped to pain points |
| `src/components/industries/IndustryComparison.tsx` | Comparison table (OPS vs 2 competitors) |
| `src/components/industries/IndustryFAQ.tsx` | FAQ section + JSON-LD schema generation |
| `src/components/industries/IndustryCTA.tsx` | Final CTA with two buttons |
| `src/components/animations/CardParticleFlow.tsx` | Lightweight card-scoped canvas particle animation |

### Modified Files
| File | Change |
|------|--------|
| `src/app/sitemap.ts` | Add industry slugs to sitemap |

### Reused (no changes)
`Button`, `SectionLabel`, `FadeInUp`, `Card`, `FAQ`, `FAQItem`, `WireframeIllustration`, `GradientOverlay`

---

## Chunk 1: Data Layer + Route Shell

### Task 1: Industry Types and Data File

**Files:**
- Create: `src/lib/industries.ts`

- [ ] **Step 1: Create the types and data file**

```typescript
// src/lib/industries.ts

// --- Types ---

export type FlowDirection = 'left-to-right' | 'top-to-bottom' | 'right-to-left';
export type WireframeVariant = 'messages' | 'dashboard' | 'apps';

export interface IndustryContent {
  meta: {
    title: string;
    description: string;
    keywords: string[];
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
    painPointRef: number;
  }>;
  comparison: {
    competitors: [string, string];
    rows: Array<{
      feature: string;
      ops: boolean | string;
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

export interface IndustryData {
  slug: string;
  name: string;
  painPointConfig: Array<{
    variant: WireframeVariant;
    flowDirection: FlowDirection;
  }>;
  content: {
    en: IndustryContent;
    es?: IndustryContent;
  };
}

// --- Universal FAQ (shared across all industries) ---

export const universalFAQ: { en: Array<{ question: string; answer: string }>; es: Array<{ question: string; answer: string }> } = {
  en: [
    {
      question: 'What does OPS cost?',
      answer: 'OPS is free to get started with full access to core features including scheduling, crew management, and project tracking. No credit card required. Paid plans unlock advanced features like analytics and priority support.',
    },
    {
      question: 'How do I get started with OPS?',
      answer: 'Download OPS from the App Store, create your account in under a minute, and start adding jobs immediately. No training required — your crew opens the app and knows what to do.',
    },
    {
      question: 'What devices does OPS work on?',
      answer: 'OPS is available on iPhone and iPad with an Android version in development. The app works offline so your crew can use it on job sites with no cell signal.',
    },
  ],
  es: [
    {
      question: '¿Cuánto cuesta OPS?',
      answer: 'OPS es gratis para comenzar con acceso completo a funciones principales. No se requiere tarjeta de crédito. Los planes pagados desbloquean funciones avanzadas.',
    },
    {
      question: '¿Cómo empiezo con OPS?',
      answer: 'Descarga OPS desde la App Store, crea tu cuenta en menos de un minuto y comienza a agregar trabajos de inmediato. Sin necesidad de entrenamiento.',
    },
    {
      question: '¿En qué dispositivos funciona OPS?',
      answer: 'OPS está disponible en iPhone y iPad con una versión de Android en desarrollo. La app funciona sin conexión.',
    },
  ],
};

// --- Industry Data ---
// POC industries populated after keyword research (Task 7+)

export const industries: IndustryData[] = [];

// --- Helpers ---

export function getIndustryBySlug(slug: string): IndustryData | undefined {
  return industries.find((i) => i.slug === slug);
}

export function getAllIndustrySlugs(): string[] {
  return industries.map((i) => i.slug);
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `cd /c/OPS/ops-site && npx tsc --noEmit src/lib/industries.ts 2>&1 | head -20`
Expected: No errors (or only unrelated project-wide errors)

- [ ] **Step 3: Commit**

```bash
git add src/lib/industries.ts
git commit -m "feat(industries): add typed data layer and helpers"
```

---

### Task 2: Dynamic Route Shell + Metadata

**Files:**
- Create: `src/app/industries/[slug]/page.tsx`

**Reference:**
- `src/app/page.tsx` (homepage structure)
- `src/app/platform/page.tsx` (metadata pattern)
- `src/i18n/server.ts` (`getLocale()`)

- [ ] **Step 1: Create the route page**

The page uses `generateStaticParams` to pre-render all industry pages at build time. `generateMetadata` produces unique SEO title, description, and FAQPage JSON-LD schema per industry. The page body composes all section components.

JSON-LD is injected via a `<script type="application/ld+json">` tag — this is the standard Next.js pattern for structured data. The content comes from our own typed data file, not user input, so there is no XSS risk.

```typescript
// src/app/industries/[slug]/page.tsx

import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getLocale } from '@/i18n/server';
import { getIndustryBySlug, getAllIndustrySlugs, universalFAQ } from '@/lib/industries';
import type { IndustryContent } from '@/lib/industries';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllIndustrySlugs().map((slug) => ({ slug }));
}

function buildFaqJsonLd(allFaq: Array<{ question: string; answer: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: allFaq.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const industry = getIndustryBySlug(slug);
  if (!industry) return {};

  const locale = await getLocale();
  const content: IndustryContent = industry.content[locale] ?? industry.content.en;

  return {
    title: content.meta.title,
    description: content.meta.description,
    alternates: {
      canonical: `https://opsapp.co/industries/${slug}`,
    },
  };
}

export default async function IndustryPage({ params }: PageProps) {
  const { slug } = await params;
  const industry = getIndustryBySlug(slug);
  if (!industry) notFound();

  const locale = await getLocale();
  const content: IndustryContent = industry.content[locale] ?? industry.content.en;
  const uFaq = universalFAQ[locale] ?? universalFAQ.en;

  const allFaq = [...uFaq, ...content.faq];
  const faqJsonLd = buildFaqJsonLd(allFaq);

  return (
    <>
      <script
        type="application/ld+json"
        // Safe: content from typed data file, not user input
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      {/* Section components added in subsequent tasks */}
      <div data-industry={slug}>
        <p className="text-white p-20">Industry page: {industry.name}</p>
      </div>
    </>
  );
}
```

- [ ] **Step 2: Verify the route compiles**

Run: `cd /c/OPS/ops-site && npx next build 2>&1 | tail -20`
Expected: Build succeeds (page renders empty since no industries in data yet)

- [ ] **Step 3: Commit**

```bash
git add src/app/industries/[slug]/page.tsx
git commit -m "feat(industries): add dynamic route with metadata and JSON-LD"
```

---

### Task 3: Add Industry Slugs to Sitemap

**Files:**
- Modify: `src/app/sitemap.ts`

- [ ] **Step 1: Update sitemap to include industry pages**

Add import at top of `src/app/sitemap.ts`:

```typescript
import { getAllIndustrySlugs } from '@/lib/industries';
```

Add after `blogPages` declaration, before the return statement:

```typescript
  // Industry landing pages
  const industrySlugs = getAllIndustrySlugs();
  const industryPages: MetadataRoute.Sitemap = industrySlugs.map((slug) => ({
    url: `${baseUrl}/industries/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }));
```

Update the return to: `return [...staticPages, ...blogPages, ...industryPages];`

- [ ] **Step 2: Verify build still passes**

Run: `cd /c/OPS/ops-site && npx next build 2>&1 | tail -10`

- [ ] **Step 3: Commit**

```bash
git add src/app/sitemap.ts
git commit -m "feat(industries): add industry pages to sitemap"
```

---

## Chunk 2: Section Components (Static)

### Task 4: IndustryHero

**Files:**
- Create: `src/components/industries/IndustryHero.tsx`

**Reference:**
- `src/components/home/Hero.tsx` (structure — min-h-screen, gradient stack, content at bottom)
- `src/components/ui/Button.tsx` — `variant: 'solid' | 'ghost'`, `href`, `external` props
- `src/components/ui/GradientOverlay.tsx` — `direction`, `opacity` props
- `src/components/ui/SectionLabel.tsx` — `label`, `className` props
- `src/components/ui/FadeInUp.tsx` — `delay`, `className` props

- [ ] **Step 1: Create IndustryHero component**

Server component. Full-viewport hero with dark gradient background (no hero image for SEO page weight). Industry-specific section label, headline, and subtext. Two CTA buttons. Trust line.

```typescript
// src/components/industries/IndustryHero.tsx

import { SectionLabel, FadeInUp, Button, GradientOverlay } from '@/components/ui';

const APP_STORE_URL = 'https://apps.apple.com/us/app/ops-job-crew-management/id6746662078';

interface IndustryHeroProps {
  sectionLabel: string;
  headline: string;
  subtext: string;
}

export default function IndustryHero({ sectionLabel, headline, subtext }: IndustryHeroProps) {
  return (
    <section className="relative min-h-[85vh] w-full overflow-hidden bg-ops-background">
      <div className="absolute inset-0 bg-gradient-to-br from-[#0f0f0f] via-ops-background to-[#060606]" />

      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")',
          backgroundRepeat: 'repeat',
          backgroundSize: '256px 256px',
        }}
        aria-hidden="true"
      />

      <GradientOverlay direction="to-bottom" opacity={0.6} />

      <div className="relative z-10 flex min-h-[85vh] flex-col justify-end px-6 pb-[clamp(4rem,10vh,8rem)] sm:px-10 md:px-16 lg:px-24">
        <FadeInUp>
          <SectionLabel label={sectionLabel} className="mb-4" />
        </FadeInUp>

        <FadeInUp delay={0.05}>
          <h1
            className="font-heading font-bold uppercase leading-[0.95] tracking-tight text-ops-text-primary max-w-[800px]"
            style={{ fontSize: 'clamp(2.5rem, 5vw, 4.5rem)' }}
          >
            {headline}
          </h1>
        </FadeInUp>

        <FadeInUp delay={0.1}>
          <p className="mt-4 font-heading font-light text-lg text-ops-text-secondary sm:text-xl md:text-2xl max-w-[600px]">
            {subtext}
          </p>
        </FadeInUp>

        <FadeInUp delay={0.15}>
          <div className="mt-8 flex items-center gap-4">
            <Button variant="solid" href={APP_STORE_URL} external>
              DOWNLOAD FREE
            </Button>
            <Button variant="ghost" href="https://try.opsapp.co/tutorial-intro" external>
              TRY IT FIRST
            </Button>
          </div>
          <p className="mt-4 font-caption text-xs text-ops-text-secondary tracking-[0.1em]">
            Get started for free · No credit card · No training required
          </p>
        </FadeInUp>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/industries/IndustryHero.tsx
git commit -m "feat(industries): add IndustryHero component"
```

---

### Task 5: IndustrySolutions

**Files:**
- Create: `src/components/industries/IndustrySolutions.tsx`

**Reference:**
- `src/components/platform/FeatureBlock.tsx` — alternating left/right grid layout

- [ ] **Step 1: Create IndustrySolutions component**

Server component. Section heading + alternating 2-column feature blocks. Each solution maps to a pain point. Visual placeholder on the non-text side (can be enhanced later).

```typescript
// src/components/industries/IndustrySolutions.tsx

import { SectionLabel, FadeInUp } from '@/components/ui';

interface Solution {
  title: string;
  copy: string;
  painPointRef: number;
}

interface IndustrySolutionsProps {
  solutions: Solution[];
}

export default function IndustrySolutions({ solutions }: IndustrySolutionsProps) {
  return (
    <section className="py-24 md:py-32 bg-ops-background">
      <div className="max-w-[1400px] mx-auto px-6 md:px-10">
        <FadeInUp>
          <SectionLabel label="THE SOLUTION" className="mb-5" />
          <h2
            className="font-heading font-bold uppercase leading-[0.95] tracking-tight text-ops-text-primary max-w-[700px]"
            style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)' }}
          >
            HOW OPS HANDLES IT
          </h2>
        </FadeInUp>

        <div className="mt-16 md:mt-20 space-y-20 md:space-y-28">
          {solutions.map((solution, i) => {
            const direction = i % 2 === 0 ? 'left' : 'right';
            const textOrder = direction === 'right' ? 'md:order-last' : '';

            return (
              <FadeInUp key={i} delay={0.05}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 items-center">
                  <div className={textOrder}>
                    <p className="font-caption text-ops-accent uppercase tracking-[0.15em] text-xs mb-3">
                      [ {String(i + 1).padStart(2, '0')} ]
                    </p>
                    <h3 className="font-heading font-bold uppercase leading-[0.95] tracking-tight text-ops-text-primary text-2xl md:text-3xl">
                      {solution.title}
                    </h3>
                    <p className="mt-4 font-heading font-light text-base md:text-lg text-ops-text-secondary max-w-lg leading-relaxed">
                      {solution.copy}
                    </p>
                  </div>
                  <div className={direction === 'right' ? 'md:order-first' : ''}>
                    <div className="w-full max-w-[500px] aspect-[4/3] bg-ops-surface border border-ops-border rounded-[3px]" />
                  </div>
                </div>
              </FadeInUp>
            );
          })}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/industries/IndustrySolutions.tsx
git commit -m "feat(industries): add IndustrySolutions component"
```

---

### Task 6: IndustryComparison

**Files:**
- Create: `src/components/industries/IndustryComparison.tsx`

**Reference:**
- `src/components/platform/ComparisonSection.tsx` — table structure, cell rendering. Uses `CellValue = 'check' | 'dash' | string` type. Our version uses `boolean | string` instead.

- [ ] **Step 1: Create IndustryComparison component**

Server component. Responsive comparison table. OPS column highlighted with accent border-top and surface background. Supports `boolean` (check/cross icons) and `string` (nuanced text) cell values.

```typescript
// src/components/industries/IndustryComparison.tsx

import { SectionLabel, FadeInUp } from '@/components/ui';

const CHECK = (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-label="Included">
    <path d="M4 10.5L8 14.5L16 6.5" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const CROSS = (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-label="Not included">
    <path d="M5 5L15 15M15 5L5 15" stroke="#555555" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

function renderCell(value: boolean | string) {
  if (value === true) return CHECK;
  if (value === false) return CROSS;
  return <span className="text-sm font-caption text-ops-text-secondary">{value}</span>;
}

interface ComparisonRow {
  feature: string;
  ops: boolean | string;
  comp1: boolean | string;
  comp2: boolean | string;
}

interface IndustryComparisonProps {
  competitors: [string, string];
  rows: ComparisonRow[];
}

export default function IndustryComparison({ competitors, rows }: IndustryComparisonProps) {
  return (
    <section className="py-24 md:py-32 bg-ops-background">
      <div className="max-w-[1400px] mx-auto px-6 md:px-10">
        <FadeInUp>
          <SectionLabel label="VS THE ALTERNATIVES" className="mb-5" />
          <h2 className="font-heading font-bold uppercase leading-[0.95] tracking-tight text-ops-text-primary text-3xl md:text-4xl lg:text-5xl">
            SEE HOW OPS COMPARES
          </h2>
        </FadeInUp>

        <FadeInUp delay={0.1}>
          <div className="mt-16 md:mt-20 overflow-x-auto -mx-6 md:mx-0 px-6 md:px-0">
            <table className="w-full min-w-[540px] border-collapse">
              <thead>
                <tr>
                  <th className="text-left p-4 pb-6 font-caption uppercase tracking-[0.15em] text-xs text-ops-text-secondary w-[180px] min-w-[140px]">
                    Feature
                  </th>
                  <th className="text-left p-4 pb-6 font-caption uppercase tracking-[0.15em] text-xs text-ops-text-primary border-t-2 border-t-ops-accent bg-ops-surface rounded-t-[3px]">
                    OPS
                  </th>
                  <th className="text-left p-4 pb-6 font-caption uppercase tracking-[0.15em] text-xs text-ops-text-secondary">
                    {competitors[0]}
                  </th>
                  <th className="text-left p-4 pb-6 font-caption uppercase tracking-[0.15em] text-xs text-ops-text-secondary">
                    {competitors[1]}
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => (
                  <tr key={row.feature} className={i < rows.length - 1 ? 'border-b border-ops-border' : ''}>
                    <td className="p-4 font-caption text-sm text-ops-text-secondary">{row.feature}</td>
                    <td className="p-4 bg-ops-surface">{renderCell(row.ops)}</td>
                    <td className="p-4">{renderCell(row.comp1)}</td>
                    <td className="p-4">{renderCell(row.comp2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </FadeInUp>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/industries/IndustryComparison.tsx
git commit -m "feat(industries): add IndustryComparison table component"
```

---

### Task 7: IndustryFAQ

**Files:**
- Create: `src/components/industries/IndustryFAQ.tsx`

**Reference:**
- `src/components/shared/FAQ.tsx` — wraps `FAQItem` list in `FadeInUp`, takes `label` and `items` props
- `src/components/shared/FAQItem.tsx` — client component, `question`/`answer` props, accordion with Framer Motion

- [ ] **Step 1: Create IndustryFAQ component**

Server component. Combines universal + industry-specific FAQ items. Reuses `FAQItem` directly.

```typescript
// src/components/industries/IndustryFAQ.tsx

import { SectionLabel, FadeInUp } from '@/components/ui';
import FAQItem from '@/components/shared/FAQItem';

interface FAQEntry {
  question: string;
  answer: string;
}

interface IndustryFAQProps {
  universalFaq: FAQEntry[];
  industryFaq: FAQEntry[];
}

export default function IndustryFAQ({ universalFaq, industryFaq }: IndustryFAQProps) {
  const allFaq = [...universalFaq, ...industryFaq];

  return (
    <section className="py-24 md:py-32 bg-ops-background">
      <div className="max-w-3xl mx-auto px-6 md:px-10">
        <FadeInUp>
          <SectionLabel label="FREQUENTLY ASKED" className="mb-12" />
          <div>
            {allFaq.map((item, index) => (
              <FAQItem key={index} question={item.question} answer={item.answer} />
            ))}
          </div>
        </FadeInUp>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/industries/IndustryFAQ.tsx
git commit -m "feat(industries): add IndustryFAQ component"
```

---

### Task 8: IndustryCTA

**Files:**
- Create: `src/components/industries/IndustryCTA.tsx`

**Reference:**
- `src/components/shared/BottomCTA.tsx` — gradient background, heading, subtext, one button. Our version adds a second button.
- `src/components/ui/Button.tsx` — `variant: 'solid' | 'ghost'`

- [ ] **Step 1: Create IndustryCTA component**

Server component. Full-width CTA section with gradient background, industry-specific headline + subtext, two CTA buttons, and trust line.

```typescript
// src/components/industries/IndustryCTA.tsx

import { Button, FadeInUp } from '@/components/ui';

const APP_STORE_URL = 'https://apps.apple.com/us/app/ops-job-crew-management/id6746662078';

interface IndustryCTAProps {
  headline: string;
  subtext: string;
}

export default function IndustryCTA({ headline, subtext }: IndustryCTAProps) {
  return (
    <section className="relative py-32 md:py-40 bg-ops-background overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'linear-gradient(180deg, #0A0A0A 0%, #111111 40%, #0E0E0E 70%, #0A0A0A 100%)',
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 max-w-[1400px] mx-auto px-6 md:px-10">
        <FadeInUp>
          <h2 className="font-heading font-bold uppercase leading-[0.95] tracking-tight text-ops-text-primary text-4xl md:text-6xl max-w-[800px]">
            {headline}
          </h2>
        </FadeInUp>

        <FadeInUp delay={0.08}>
          <p className="mt-6 font-heading font-light text-lg md:text-xl text-ops-text-secondary">
            {subtext}
          </p>
        </FadeInUp>

        <FadeInUp delay={0.14}>
          <div className="mt-10 flex items-center gap-4">
            <Button variant="solid" href={APP_STORE_URL} external>
              DOWNLOAD FREE
            </Button>
            <Button variant="ghost" href="https://try.opsapp.co/tutorial-intro" external>
              TRY IT FIRST
            </Button>
          </div>
          <p className="mt-4 font-caption text-xs text-ops-text-secondary tracking-[0.1em]">
            Get started for free · No credit card · No training required
          </p>
        </FadeInUp>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/industries/IndustryCTA.tsx
git commit -m "feat(industries): add IndustryCTA component"
```

---

## Chunk 3: Pain Point Animation System

### Task 9: CardParticleFlow Canvas Component

**Files:**
- Create: `src/components/animations/CardParticleFlow.tsx`

**Reference:**
- `src/components/animations/DataFunnel.tsx` — full particle engine to use as reference:
  - Lines 41-47: `seededRandom` — copy exactly
  - Lines 50-52: `hexToRgb` — copy exactly
  - Lines 55-77: `catmullRom` — copy exactly
  - Lines 214-218: `edgeFade` — copy exactly
  - Lines 28-30: color constants `BLUE=#597794`, `ORANGE=#B8764A`, `WHITE=#F5F5F5`
  - Lines 104-211: `generateLanes` — adapt for `FlowDirection` instead of `DeviceType`
  - Lines 230-249: `createParticles` — reduce to 8 lanes, 4 particles per lane
  - Lines 259-413: main component — simplify for card-sized container

**Key differences from DataFunnel:**
- 8 lanes (not 14), 4 particles per lane (not 6) — for performance in 3-card grid
- `BASE_SPEED = 0.005` (vs 0.006) — slightly slower for subtlety at card scale
- Particle radius: `1.2 + rand() * 0.6` (vs `1.5 + rand() * 0.8`) — smaller for card
- No negative insets — positioned `absolute inset-0` within card
- Props: `flowDirection: FlowDirection` + `isActive: boolean` (no `device` prop)
- `flowDirection` mapping:
  - `'left-to-right'` → horizontal flow like DataFunnel tablet mode (lines 111-166)
  - `'right-to-left'` → horizontal flow like DataFunnel phone mode (lines 111-166)
  - `'top-to-bottom'` → vertical flow like DataFunnel laptop mode (lines 167-211)

- [ ] **Step 1: Create CardParticleFlow**

```typescript
// src/components/animations/CardParticleFlow.tsx

'use client';

import { useRef, useEffect, useMemo, useState } from 'react';
import type { FlowDirection } from '@/lib/industries';

/* ─── Colors (same as DataFunnel) ─── */
const BLUE = '#597794';
const ORANGE = '#B8764A';
const WHITE = '#F5F5F5';

/* ─── Constants (reduced for card scale) ─── */
const LANE_COUNT = 8;
const PARTICLES_PER_LANE = 4;
const BASE_SPEED = 0.005;
const FADE_EDGE = 0.04;
const SCREEN_START = 0.375;
const SCREEN_END = 0.625;

/* ─── Seeded PRNG (copied from DataFunnel) ─── */
function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

/* ─── Color utilities (copied from DataFunnel) ─── */
function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

/* ─── Catmull-Rom spline (copied from DataFunnel) ─── */
function catmullRom(
  points: { x: number; y: number }[],
  t: number,
): { x: number; y: number } {
  const n = points.length - 1;
  const clamped = Math.max(0, Math.min(0.9999, t));
  const segFloat = clamped * n;
  const idx = Math.min(Math.floor(segFloat), n - 1);
  const u = segFloat - idx;
  const u2 = u * u;
  const u3 = u2 * u;

  const p0 = points[Math.max(idx - 1, 0)];
  const p1 = points[idx];
  const p2 = points[Math.min(idx + 1, n)];
  const p3 = points[Math.min(idx + 2, n)];

  return {
    x: 0.5 * (2 * p1.x + (-p0.x + p2.x) * u + (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * u2 + (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * u3),
    y: 0.5 * (2 * p1.y + (-p0.y + p2.y) * u + (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * u2 + (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * u3),
  };
}

/* ─── Edge fade (copied from DataFunnel) ─── */
function edgeFade(t: number): number {
  if (t < FADE_EDGE) return t / FADE_EDGE;
  if (t > 1 - FADE_EDGE) return (1 - t) / FADE_EDGE;
  return 1.0;
}

/* ─── Lane definition ─── */
interface Lane {
  waypoints: { x: number; y: number }[];
  entryRgb: [number, number, number];
  exitRgb: [number, number, number];
  sameColor: boolean;
  radius: number;
  speedMul: number;
}

/* ─── Get interpolated color at progress ─── */
function getColor(lane: Lane, progress: number): string {
  const [er, eg, eb] = lane.entryRgb;
  if (lane.sameColor) return `rgb(${er},${eg},${eb})`;
  if (progress <= SCREEN_START) return `rgb(${er},${eg},${eb})`;
  const [xr, xg, xb] = lane.exitRgb;
  if (progress >= SCREEN_END) return `rgb(${xr},${xg},${xb})`;
  const t = (progress - SCREEN_START) / (SCREEN_END - SCREEN_START);
  return `rgb(${Math.round(er + (xr - er) * t)},${Math.round(eg + (xg - eg) * t)},${Math.round(eb + (xb - eb) * t)})`;
}

/**
 * Generate lanes adapted from DataFunnel.generateLanes.
 * - left-to-right: horizontal like DataFunnel tablet mode
 * - right-to-left: horizontal like DataFunnel phone mode
 * - top-to-bottom: vertical like DataFunnel laptop mode
 */
function generateLanes(direction: FlowDirection, cw: number, ch: number): Lane[] {
  const seed = direction === 'left-to-right' ? 77 : direction === 'right-to-left' ? 42 : 99;
  const rand = seededRandom(seed);
  const lanes: Lane[] = [];
  const isBlue = (i: number) => i % 3 !== 1;

  if (direction === 'left-to-right' || direction === 'right-to-left') {
    const screenCY = 0.5;
    const tightBand = 0.015;
    const leftToRight = direction === 'left-to-right';

    for (let i = 0; i < LANE_COUNT; i++) {
      const blue = isBlue(i);
      const radius = 1.2 + rand() * 0.6;

      let entryHex: string;
      let exitHex: string;
      if (direction === 'right-to-left') {
        entryHex = blue ? BLUE : ORANGE;
        exitHex = blue ? BLUE : WHITE;
      } else {
        entryHex = blue ? WHITE : ORANGE;
        exitHex = BLUE;
      }

      const entryRgb = hexToRgb(entryHex);
      const exitRgb = hexToRgb(exitHex);
      const sameColor = entryHex === exitHex;

      const entryY = 0.08 + (i / (LANE_COUNT - 1)) * 0.84;
      const screenY = screenCY - tightBand + rand() * tightBand * 2;
      const separation = 0.12 + rand() * 0.18;
      const exitY = blue ? 0.5 - separation : 0.5 + separation;
      const farSeparation = 0.25 + rand() * 0.2;
      const farY = blue ? 0.5 - farSeparation : 0.5 + farSeparation;

      const xStopsLR = [0.0, 0.12, 0.26, 0.38, 0.50, 0.62, 0.74, 0.88, 1.0];
      const xStopsRL = [1.0, 0.88, 0.74, 0.62, 0.50, 0.38, 0.26, 0.12, 0.0];
      const xStops = leftToRight ? xStopsLR : xStopsRL;
      const yStops = [
        entryY,
        entryY * 0.75 + screenY * 0.25,
        entryY * 0.3 + screenY * 0.7,
        screenY,
        screenY + (rand() - 0.5) * 0.01,
        screenY,
        screenY * 0.5 + exitY * 0.5,
        exitY,
        farY,
      ];

      const waypoints = xStops.map((x, j) => ({ x: x * cw, y: yStops[j] * ch }));
      const speedMul = 0.95 + rand() * 0.1;
      lanes.push({ waypoints, entryRgb, exitRgb, sameColor, radius, speedMul });
    }
  } else {
    // top-to-bottom: vertical flow
    const screenCX = 0.5;
    const tightBand = 0.015;

    for (let i = 0; i < LANE_COUNT; i++) {
      const blue = isBlue(i);
      const radius = 1.2 + rand() * 0.6;

      const entryRgb = hexToRgb(WHITE);
      const exitRgb = hexToRgb(blue ? BLUE : ORANGE);

      const entryX = 0.08 + (i / (LANE_COUNT - 1)) * 0.84;
      const screenX = screenCX - tightBand + rand() * tightBand * 2;
      const separation = 0.12 + rand() * 0.18;
      const exitX = blue ? 0.5 - separation : 0.5 + separation;
      const farSeparation = 0.25 + rand() * 0.2;
      const farX = blue ? 0.5 - farSeparation : 0.5 + farSeparation;

      const yStops = [0.0, 0.12, 0.26, 0.38, 0.50, 0.62, 0.74, 0.88, 1.0];
      const xStops = [
        entryX,
        entryX * 0.75 + screenX * 0.25,
        entryX * 0.3 + screenX * 0.7,
        screenX,
        screenX + (rand() - 0.5) * 0.01,
        screenX,
        screenX * 0.5 + exitX * 0.5,
        exitX,
        farX,
      ];

      const waypoints = yStops.map((y, j) => ({ x: xStops[j] * cw, y: y * ch }));
      const speedMul = 0.95 + rand() * 0.1;
      lanes.push({ waypoints, entryRgb, exitRgb, sameColor: false, radius, speedMul });
    }
  }

  return lanes;
}

/* ─── Particle ─── */
interface Particle {
  laneIndex: number;
  progress: number;
  alive: boolean;
  radiusMul: number;
  speedFactor: number;
  offset: number;
}

function createParticles(laneCount: number, seed: number): Particle[] {
  const rand = seededRandom(seed + 1000);
  const particles: Particle[] = [];
  for (let l = 0; l < laneCount; l++) {
    for (let p = 0; p < PARTICLES_PER_LANE; p++) {
      const radiusMul = 0.6 + rand() * 0.8;
      const speedFactor = 0.7 - (radiusMul - 0.6) * 0.125;
      particles.push({
        laneIndex: l,
        progress: p / PARTICLES_PER_LANE,
        alive: false,
        radiusMul,
        speedFactor,
        offset: (rand() - 0.5) * 8,
      });
    }
  }
  return particles;
}

/* ─── Component ─── */
interface CardParticleFlowProps {
  flowDirection: FlowDirection;
  isActive: boolean;
}

export default function CardParticleFlow({ flowDirection, isActive }: CardParticleFlowProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);
  const particlesRef = useRef<Particle[]>([]);
  const wasActiveRef = useRef(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [dims, setDims] = useState({ w: 400, h: 300 });
  const isActiveRef = useRef(isActive);
  isActiveRef.current = isActive;

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      if (width > 0 && height > 0) setDims({ w: width, h: height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const lanes = useMemo(
    () => generateLanes(flowDirection, dims.w, dims.h),
    [flowDirection, dims.w, dims.h],
  );

  useEffect(() => {
    const seed = flowDirection === 'left-to-right' ? 77 : flowDirection === 'right-to-left' ? 42 : 99;
    particlesRef.current = createParticles(lanes.length, seed);
  }, [lanes, flowDirection]);

  useEffect(() => {
    if (reducedMotion) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let running = true;

    function draw() {
      if (!running || !ctx || !canvas) return;

      const dpr = window.devicePixelRatio || 1;
      const w = dims.w;
      const h = dims.h;

      const bw = Math.round(w * dpr);
      const bh = Math.round(h * dpr);
      if (canvas.width !== bw || canvas.height !== bh) {
        canvas.width = bw;
        canvas.height = bh;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      }

      ctx.clearRect(0, 0, w, h);

      const active = isActiveRef.current;
      const wasActive = wasActiveRef.current;
      const particles = particlesRef.current;

      if (active && !wasActive) {
        for (let j = 0; j < particles.length; j++) {
          const pt = particles[j];
          const slot = j % PARTICLES_PER_LANE;
          const laneDelay = pt.laneIndex * 0.02;
          pt.progress = -(slot / PARTICLES_PER_LANE) - laneDelay;
          pt.alive = true;
        }
      }
      wasActiveRef.current = active;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        if (!p.alive) continue;

        const lane = lanes[p.laneIndex];
        if (!lane) continue;

        p.progress += BASE_SPEED * lane.speedMul * p.speedFactor;

        if (p.progress >= 1) {
          if (active) {
            p.progress -= 1;
          } else {
            p.alive = false;
            continue;
          }
        }

        if (p.progress < 0) continue;

        const pos = catmullRom(lane.waypoints, p.progress);
        const nextPos = catmullRom(lane.waypoints, Math.min(0.999, p.progress + 0.02));
        const dx = nextPos.x - pos.x;
        const dy = nextPos.y - pos.y;
        const len = Math.sqrt(dx * dx + dy * dy) || 1;
        const drawX = pos.x + p.offset * (-dy / len);
        const drawY = pos.y + p.offset * (dx / len);

        const fade = edgeFade(p.progress);
        const alpha = fade * 0.55;
        if (alpha < 0.005) continue;

        const color = getColor(lane, p.progress);
        const r = lane.radius * p.radiusMul;

        ctx.beginPath();
        ctx.arc(drawX, drawY, r, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.globalAlpha = alpha;
        ctx.fill();
      }

      ctx.globalAlpha = 1;
      rafRef.current = requestAnimationFrame(draw);
    }

    rafRef.current = requestAnimationFrame(draw);
    return () => {
      running = false;
      cancelAnimationFrame(rafRef.current);
    };
  }, [reducedMotion, dims, lanes]);

  if (reducedMotion) return null;

  return (
    <div ref={containerRef} className="absolute inset-0 pointer-events-none">
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
}
```

- [ ] **Step 2: Verify build**

Run: `cd /c/OPS/ops-site && npx next build 2>&1 | tail -10`

- [ ] **Step 3: Commit**

```bash
git add src/components/animations/CardParticleFlow.tsx
git commit -m "feat(industries): add CardParticleFlow canvas animation"
```

---

### Task 10: IndustryPainPointCard with 3D Tilt

**Files:**
- Create: `src/components/industries/IndustryPainPointCard.tsx`

**Reference:**
- `src/components/home/PainPointCard.tsx` — card structure: `Card` wrapper, `WireframeIllustration`, title, bullets, forLine
- `src/components/ui/Card.tsx` — `hoverable`, `className` props. Set `hoverable={false}` since we handle hover ourselves.
- `src/components/animations/WireframeIllustration.tsx` — `variant`, `isActive`, `size` props
- `src/components/animations/CardParticleFlow.tsx` (Task 9) — `flowDirection`, `isActive` props

- [ ] **Step 1: Create IndustryPainPointCard**

Client component. Wraps `Card` with perspective container. Tracks mouse position for 3D tilt on desktop (max ±4 degrees). Composites `CardParticleFlow` as absolute overlay behind content. `WireframeIllustration` animates based on `isActive`.

```typescript
// src/components/industries/IndustryPainPointCard.tsx

'use client';

import { useRef, useState, useCallback } from 'react';
import { Card } from '@/components/ui';
import WireframeIllustration from '@/components/animations/WireframeIllustration';
import CardParticleFlow from '@/components/animations/CardParticleFlow';
import type { WireframeVariant, FlowDirection } from '@/lib/industries';

interface IndustryPainPointCardProps {
  title: string;
  bullets: string[];
  forLine: string;
  variant: WireframeVariant;
  flowDirection: FlowDirection;
  isActive: boolean;
  onActivate: () => void;
  onDeactivate: () => void;
}

const MAX_TILT = 4;

export default function IndustryPainPointCard({
  title, bullets, forLine, variant, flowDirection,
  isActive, onActivate, onDeactivate,
}: IndustryPainPointCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0 });

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    setTilt({
      rotateX: (0.5 - y) * MAX_TILT * 2,
      rotateY: (x - 0.5) * MAX_TILT * 2,
    });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setTilt({ rotateX: 0, rotateY: 0 });
    onDeactivate();
  }, [onDeactivate]);

  return (
    <div ref={cardRef} onMouseEnter={onActivate} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}
      style={{ perspective: '800px' }}>
      <div style={{
        transform: `rotateX(${tilt.rotateX}deg) rotateY(${tilt.rotateY}deg)`,
        transition: isActive ? 'transform 0.2s ease-out' : 'transform 0.3s ease-out',
      }}>
        <Card hoverable={false} className={`p-8 h-full relative overflow-hidden transition-colors duration-200 ${isActive ? 'border-ops-border-hover' : ''}`}>
          <div className="absolute inset-0 pointer-events-none">
            <CardParticleFlow flowDirection={flowDirection} isActive={isActive} />
          </div>
          <div className="relative z-10">
            <div className="mb-4">
              <WireframeIllustration variant={variant} isActive={isActive} size={200} />
            </div>
            <p className="font-heading font-bold text-ops-text-primary uppercase text-lg tracking-tight">{title}</p>
            <ul className="mt-3 space-y-1">
              {bullets.map((bullet, i) => (
                <li key={i} className="font-heading font-light text-ops-text-secondary text-sm leading-relaxed">&bull; {bullet}</li>
              ))}
            </ul>
            <p className="mt-4 font-caption text-[11px] text-ops-text-secondary italic">{forLine}</p>
          </div>
        </Card>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/industries/IndustryPainPointCard.tsx
git commit -m "feat(industries): add IndustryPainPointCard with 3D tilt and particles"
```

---

### Task 11: IndustryPainPoints Container

**Files:**
- Create: `src/components/industries/IndustryPainPoints.tsx`

**Reference:**
- `src/components/home/PainPointsClient.tsx` — desktop hover grid + mobile IntersectionObserver pattern (lines 36-51)

- [ ] **Step 1: Create IndustryPainPoints container**

Client component. Desktop: 3-column grid, hover activates one card at a time. Mobile: single-column stack, IntersectionObserver at 0.6 threshold activates the centered card.

```typescript
// src/components/industries/IndustryPainPoints.tsx

'use client';

import { useState, useRef, useEffect } from 'react';
import { SectionLabel, FadeInUp } from '@/components/ui';
import IndustryPainPointCard from './IndustryPainPointCard';
import type { WireframeVariant, FlowDirection } from '@/lib/industries';

interface PainPointItem {
  title: string;
  bullets: string[];
  forLine: string;
  variant: WireframeVariant;
  flowDirection: FlowDirection;
}

interface IndustryPainPointsProps {
  painPoints: PainPointItem[];
}

export default function IndustryPainPoints({ painPoints }: IndustryPainPointsProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    if (!isMobile) return;
    const observers: IntersectionObserver[] = [];
    cardRefs.current.forEach((el, index) => {
      if (!el) return;
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActiveIndex(index);
        },
        { threshold: 0.6 }
      );
      observer.observe(el);
      observers.push(observer);
    });
    return () => observers.forEach((o) => o.disconnect());
  }, [isMobile]);

  return (
    <section className="py-24 md:py-32 bg-ops-background">
      <div className="max-w-[1400px] mx-auto px-6 md:px-10">
        <FadeInUp>
          <SectionLabel label="THE PROBLEM" />
        </FadeInUp>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          {painPoints.map((point, i) => (
            <FadeInUp key={i} delay={i * 0.1}>
              <div ref={(el) => { cardRefs.current[i] = el; }}>
                <IndustryPainPointCard
                  title={point.title}
                  bullets={point.bullets}
                  forLine={point.forLine}
                  variant={point.variant}
                  flowDirection={point.flowDirection}
                  isActive={activeIndex === i}
                  onActivate={() => setActiveIndex(i)}
                  onDeactivate={() => { if (!isMobile) setActiveIndex(null); }}
                />
              </div>
            </FadeInUp>
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/industries/IndustryPainPoints.tsx
git commit -m "feat(industries): add IndustryPainPoints container with mobile scroll activation"
```

---

## Chunk 4: Wire Up Page + Keyword Research + POC Content

### Task 12: Wire All Sections Into Page

**Files:**
- Modify: `src/app/industries/[slug]/page.tsx`

- [ ] **Step 1: Add section component imports**

Add to the top of the file:

```typescript
import IndustryHero from '@/components/industries/IndustryHero';
import IndustryPainPoints from '@/components/industries/IndustryPainPoints';
import IndustrySolutions from '@/components/industries/IndustrySolutions';
import IndustryComparison from '@/components/industries/IndustryComparison';
import IndustryFAQ from '@/components/industries/IndustryFAQ';
import IndustryCTA from '@/components/industries/IndustryCTA';
```

- [ ] **Step 2: Replace placeholder JSX with composed sections**

Replace the `<div data-industry={slug}>` block with:

```tsx
return (
  <>
    <script
      type="application/ld+json"
      // Safe: content from typed data file, not user input
      dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
    />
    <IndustryHero
      sectionLabel={content.hero.sectionLabel}
      headline={content.hero.headline}
      subtext={content.hero.subtext}
    />
    <IndustryPainPoints
      painPoints={content.painPoints.map((pp, i) => ({
        ...pp,
        variant: industry.painPointConfig[i]?.variant ?? 'messages',
        flowDirection: industry.painPointConfig[i]?.flowDirection ?? 'left-to-right',
      }))}
    />
    <IndustrySolutions solutions={content.solutions} />
    <IndustryComparison
      competitors={content.comparison.competitors}
      rows={content.comparison.rows}
    />
    <IndustryFAQ universalFaq={uFaq} industryFaq={content.faq} />
    <IndustryCTA headline={content.cta.headline} subtext={content.cta.subtext} />
  </>
);
```

- [ ] **Step 3: Verify build**

Run: `cd /c/OPS/ops-site && npx next build 2>&1 | tail -10`

- [ ] **Step 4: Commit**

```bash
git add src/app/industries/[slug]/page.tsx
git commit -m "feat(industries): wire all section components into page"
```

---

### Task 13: Keyword Research — Landscaping

**Files:** None (research only — output feeds Task 16)

- [ ] **Step 1: Research high-traffic searches**

Use web search to find:
- Head terms: "landscaping software", "landscaping scheduling app", "lawn care business software"
- Long-tail: "best app for managing landscaping crews", "how to schedule landscaping jobs"
- Question queries: "how to manage multiple landscaping crews", "best free landscaping business app"
- Competitor queries: "Jobber alternative for landscapers", "LMN vs Aspire"
- Forum/Reddit: search r/landscaping, r/lawncare for pain points and software complaints

- [ ] **Step 2: Document keyword findings in a temporary note for Task 16**

---

### Task 14: Keyword Research — Auto Detailing

**Files:** None (research only — output feeds Task 17)

- [ ] **Step 1: Research high-traffic searches**

Use web search to find:
- Head terms: "auto detailing software", "detailing scheduling app", "mobile detailing business app"
- Long-tail: "best app for mobile auto detailing", "auto detailing appointment scheduling"
- Question queries: "how to manage auto detailing appointments", "best software for detailing business"
- Competitor queries: "Urable alternative", "DetailPro alternative"
- Forum/Reddit: search r/autodetailing, r/detailing for pain points

- [ ] **Step 2: Document keyword findings**

---

### Task 15: Keyword Research — Railings

**Files:** None (research only — output feeds Task 18)

- [ ] **Step 1: Research high-traffic searches**

Use web search to find:
- Head terms: "railing contractor software", "deck builder scheduling app", "fence contractor app"
- Long-tail: "best app for deck and railing contractors", "railing installation crew management"
- Question queries: "how to manage deck building projects", "best software for small railing company"
- Competitor queries: "Jobber for contractors", "BuilderTREND alternative"
- Forum/Reddit: search r/decks, contractor threads

- [ ] **Step 2: Document keyword findings**

---

### Task 16: Populate Landscaping Data

**Files:**
- Modify: `src/lib/industries.ts`

- [ ] **Step 1: Add landscaping industry entry**

Based on Task 13 keyword research, add a complete `IndustryData` object to the `industries` array:
- `slug: 'landscaping'`, `name: 'Landscaping'`
- `meta.title` targeting #1 keyword
- 3 pain points with 3-4 bullets each in a landscaper's voice
- 3 pain point configs with different wireframe variants and flow directions
- 3-4 solutions each mapping to a pain point
- Comparison with 2 real competitors and 5-6 honest rows
- 3-5 industry-specific FAQ entries matching searched question formats
- Industry-specific CTA headline

- [ ] **Step 2: Verify page renders at `/industries/landscaping`**

Run dev server and visit `http://localhost:3000/industries/landscaping`

- [ ] **Step 3: Commit**

```bash
git add src/lib/industries.ts
git commit -m "feat(industries): add landscaping industry content"
```

---

### Task 17: Populate Auto Detailing Data

**Files:**
- Modify: `src/lib/industries.ts`

- [ ] **Step 1: Add auto detailing industry entry**

Based on Task 14 research. `slug: 'auto-detailing'`. Different competitors, pain points specific to mobile detailing.

- [ ] **Step 2: Verify page renders at `/industries/auto-detailing`**

- [ ] **Step 3: Commit**

```bash
git add src/lib/industries.ts
git commit -m "feat(industries): add auto detailing industry content"
```

---

### Task 18: Populate Railings Data

**Files:**
- Modify: `src/lib/industries.ts`

- [ ] **Step 1: Add railings industry entry**

Based on Task 15 research. `slug: 'railings'`. Pain points specific to railing installation.

- [ ] **Step 2: Verify page renders at `/industries/railings`**

- [ ] **Step 3: Commit**

```bash
git add src/lib/industries.ts
git commit -m "feat(industries): add railings industry content"
```

---

## Chunk 5: Verification

### Task 19: Full Build + Visual Verification

- [ ] **Step 1: Production build**

Run: `cd /c/OPS/ops-site && npx next build 2>&1`
Expected: Build succeeds, 3 industry pages statically generated

- [ ] **Step 2: Verify sitemap**

Start prod server, fetch `/sitemap.xml`. Verify it contains `/industries/landscaping`, `/industries/auto-detailing`, `/industries/railings`.

- [ ] **Step 3: Verify JSON-LD schema**

View page source for each industry page. Confirm `<script type="application/ld+json">` contains `FAQPage` with 6-8 Question entities.

- [ ] **Step 4: Verify pages NOT in navigation**

Confirm no industry links in nav bar or mobile menu.

- [ ] **Step 5: Visual review all 3 pages**

Check each page:
- Hero renders with correct industry headline
- Pain point cards: 3D tilt on hover, particles flow, wireframes animate
- Solutions section alternates layout
- Comparison table has correct competitors
- FAQ accordion works
- CTA has two buttons
- Mobile: scroll-centering activates cards

- [ ] **Step 6: Commit any fixes**

```bash
git add -A
git commit -m "feat(industries): complete POC — landscaping, auto detailing, railings"
```
