import Link from 'next/link';
import { FadeInUp } from '@/components/ui';

interface RelatedIndustriesProps {
  currentSlug: string;
  industries: Array<{ slug: string; label: string }>;
}

export default function RelatedIndustries({ currentSlug, industries }: RelatedIndustriesProps) {
  const related = industries
    .filter((ind) => ind.slug !== currentSlug)
    .slice(0, 8);

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
