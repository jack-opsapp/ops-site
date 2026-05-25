import Link from 'next/link';
import { FadeInUp } from '@/components/ui';

interface RelatedIndustriesProps {
  currentSlug: string;
  industries: Array<{ slug: string; label: string }>;
}

/** Deterministic 32-bit hash of a string (FNV-1a variant). */
function hashSlug(slug: string): number {
  let hash = 2166136261;
  for (let i = 0; i < slug.length; i++) {
    hash ^= slug.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

/** Mulberry32 PRNG — deterministic, fast, good distribution for shuffling. */
function mulberry32(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state + 0x6D2B79F5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Seeded Fisher-Yates shuffle. Same slug → same order every render;
 * different slugs → different orders. Distributes the 41+ industries
 * that previously never appeared in any sibling's "related" block.
 */
function seededShuffle<T>(items: T[], seed: number): T[] {
  const out = items.slice();
  const rand = mulberry32(seed);
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export default function RelatedIndustries({ currentSlug, industries }: RelatedIndustriesProps) {
  const candidates = industries.filter((ind) => ind.slug !== currentSlug);
  const related = seededShuffle(candidates, hashSlug(currentSlug)).slice(0, 8);

  if (related.length === 0) return null;

  return (
    <section className="py-16 md:py-24 bg-ops-background">
      <div className="max-w-[1100px] mx-auto px-6 md:px-10">
        <FadeInUp>
          <h2 className="font-heading font-bold uppercase text-ops-text-primary text-2xl md:text-3xl tracking-tight leading-[0.95]">
            MORE TRADES WE SERVE
          </h2>
          <p className="font-body text-ops-text-secondary text-sm mt-3 max-w-[500px]">
            OPS works for any crew that runs jobs in the field.
          </p>
        </FadeInUp>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-8">
          {related.map((ind, i) => (
            <FadeInUp key={ind.slug} delay={i * 0.04}>
              <Link
                href={`/industries/${ind.slug}`}
                className="block px-4 py-3 border border-ops-border rounded-[3px] font-caption text-xs uppercase tracking-wide text-ops-text-secondary hover:text-ops-text-primary hover:border-ops-accent/40 transition-colors"
              >
                {ind.label}
              </Link>
            </FadeInUp>
          ))}
        </div>

        <FadeInUp delay={0.35}>
          <div className="mt-8 flex gap-4">
            <Link
              href="/industries"
              className="font-caption text-xs uppercase tracking-wide text-ops-accent hover:text-ops-text-primary transition-colors"
            >
              All industries -&gt;
            </Link>
            <Link
              href="/compare"
              className="font-caption text-xs uppercase tracking-wide text-ops-accent hover:text-ops-text-primary transition-colors"
            >
              Compare to competitors -&gt;
            </Link>
          </div>
        </FadeInUp>
      </div>
    </section>
  );
}
