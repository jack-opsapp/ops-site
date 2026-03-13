// src/app/compare/page.tsx

import type { Metadata } from 'next';
import Link from 'next/link';
import { getAllComparisons } from '@/lib/comparisons';
import { SectionLabel, FadeInUp } from '@/components/ui';

export const metadata: Metadata = {
  title: 'Compare OPS to Competitors | OPS',
  description:
    'See how OPS stacks up against ServiceTitan, Jobber, Housecall Pro, BuildOps, FieldPulse, Simpro, FieldEdge, and Zuper. Feature comparisons, pricing breakdowns, and honest assessments.',
  alternates: {
    canonical: 'https://opsapp.co/compare',
  },
};

export default function ComparePage() {
  const comparisons = getAllComparisons();

  return (
    <div className="min-h-screen bg-ops-background">
      {/* ── Hero ─────────────────────────────────────── */}
      <section className="pt-36 pb-16 md:pt-44 md:pb-24">
        <div className="max-w-[1100px] mx-auto px-6 md:px-10">
          <FadeInUp>
            <SectionLabel label="Competitor Comparisons" />
          </FadeInUp>
          <FadeInUp delay={0.05}>
            <h1 className="font-heading text-3xl md:text-5xl font-semibold uppercase tracking-tight mt-4 text-ops-text-primary leading-[1.1]">
              KNOW WHAT YOU&apos;RE SWITCHING FROM.
            </h1>
          </FadeInUp>
          <FadeInUp delay={0.1}>
            <p className="font-caption text-ops-text-secondary text-sm md:text-base max-w-[640px] mt-4 leading-relaxed">
              Every comparison page breaks down features, pricing, and real
              trade-worker frustrations — so you can decide with facts, not
              marketing.
            </p>
          </FadeInUp>
        </div>
      </section>

      {/* ── Divider ──────────────────────────────────── */}
      <div className="max-w-[1100px] mx-auto px-6 md:px-10">
        <div className="h-px bg-ops-border" />
      </div>

      {/* ── Grid ─────────────────────────────────────── */}
      <section className="py-16 md:py-24">
        <div className="max-w-[1100px] mx-auto px-6 md:px-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {comparisons.map((comp, i) => {
              const content = comp.content.en;
              return (
                <FadeInUp key={comp.slug} delay={0.04 * i}>
                  <Link
                    href={`/compare/${comp.slug}`}
                    className="group block h-full"
                  >
                    <div className="h-full bg-ops-surface border border-ops-border rounded-[3px] p-6 transition-all duration-300 hover:border-ops-border-hover hover:-translate-y-1">
                      {/* Competitor label */}
                      <p className="font-caption text-ops-text-secondary text-[11px] uppercase tracking-[0.15em]">
                        [ OPS vs ]
                      </p>

                      {/* Competitor name */}
                      <h2 className="font-heading text-xl md:text-2xl font-semibold uppercase tracking-tight text-ops-text-primary mt-2">
                        {comp.competitorName}
                      </h2>

                      {/* Description excerpt */}
                      <p className="font-caption text-ops-text-secondary text-xs mt-3 leading-relaxed line-clamp-3">
                        {content.meta.description}
                      </p>

                      {/* Arrow indicator */}
                      <div className="flex items-center gap-2 mt-5">
                        <span className="font-heading text-xs uppercase tracking-[0.1em] text-ops-accent transition-colors duration-200 group-hover:text-ops-text-primary">
                          Read comparison
                        </span>
                        <svg
                          className="w-3.5 h-3.5 text-ops-accent transition-all duration-200 group-hover:translate-x-1 group-hover:text-ops-text-primary"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </div>
                    </div>
                  </Link>
                </FadeInUp>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Footer note ──────────────────────────────── */}
      <section className="pb-24 md:pb-32">
        <div className="max-w-[1100px] mx-auto px-6 md:px-10">
          <FadeInUp>
            <div className="h-px bg-ops-border mb-8" />
            <p className="font-caption text-ops-text-secondary text-xs leading-relaxed max-w-[560px]">
              All comparisons are based on publicly available pricing and
              features as of March 2026. We update these pages regularly.
              If something looks wrong,{' '}
              <Link
                href="/resources#contact"
                className="text-ops-accent hover:text-ops-text-primary transition-colors duration-200 underline underline-offset-2"
              >
                let us know
              </Link>
              .
            </p>
          </FadeInUp>
        </div>
      </section>
    </div>
  );
}
