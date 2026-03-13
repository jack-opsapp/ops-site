// src/app/industries/page.tsx

import type { Metadata } from 'next';
import Link from 'next/link';
import { getAllIndustries } from '@/lib/industries';
import { SectionLabel, FadeInUp } from '@/components/ui';

export const metadata: Metadata = {
  title: 'Industries We Serve | OPS',
  description:
    'OPS is built for trade crews — landscaping, concrete, flooring, drywall, pool service, tree service, appliance repair, and more. Find your trade.',
  alternates: {
    canonical: 'https://opsapp.co/industries',
  },
};

export default function IndustriesPage() {
  const industries = getAllIndustries();

  return (
    <div className="min-h-screen bg-ops-background">
      {/* ── Hero ─────────────────────────────────────── */}
      <section className="pt-36 pb-16 md:pt-44 md:pb-24">
        <div className="max-w-[1100px] mx-auto px-6 md:px-10">
          <FadeInUp>
            <SectionLabel label="Industries" />
          </FadeInUp>
          <FadeInUp delay={0.05}>
            <h1 className="font-heading text-3xl md:text-5xl font-semibold uppercase tracking-tight mt-4 text-ops-text-primary leading-[1.1]">
              FIND YOUR TRADE.
            </h1>
          </FadeInUp>
          <FadeInUp delay={0.1}>
            <p className="font-caption text-ops-text-secondary text-sm md:text-base max-w-[640px] mt-4 leading-relaxed">
              Every trade has different pain points, different workflows,
              and different reasons the software they tried didn&apos;t
              work. We wrote a page for each one.
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
            {industries.map((industry, i) => {
              const content = industry.content.en;
              return (
                <FadeInUp key={industry.slug} delay={0.04 * i}>
                  <Link
                    href={`/industries/${industry.slug}`}
                    className="group block h-full"
                  >
                    <div className="h-full bg-ops-surface border border-ops-border rounded-[3px] p-6 transition-all duration-300 hover:border-ops-border-hover hover:-translate-y-1">
                      {/* Section label */}
                      <p className="font-caption text-ops-text-secondary text-[11px] uppercase tracking-[0.15em]">
                        [ {content.hero.sectionLabel} ]
                      </p>

                      {/* Industry name */}
                      <h2 className="font-heading text-xl md:text-2xl font-semibold uppercase tracking-tight text-ops-text-primary mt-2">
                        {industry.name}
                      </h2>

                      {/* Description excerpt */}
                      <p className="font-caption text-ops-text-secondary text-xs mt-3 leading-relaxed line-clamp-3">
                        {content.meta.description}
                      </p>

                      {/* Arrow indicator */}
                      <div className="flex items-center gap-2 mt-5">
                        <span className="font-heading text-xs uppercase tracking-[0.1em] text-ops-accent transition-colors duration-200 group-hover:text-ops-text-primary">
                          View page
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
              Don&apos;t see your trade? OPS works for any crew-based
              operation.{' '}
              <Link
                href="/resources#contact"
                className="text-ops-accent hover:text-ops-text-primary transition-colors duration-200 underline underline-offset-2"
              >
                Tell us what you do
              </Link>{' '}
              and we&apos;ll show you how it fits.
            </p>
          </FadeInUp>
        </div>
      </section>
    </div>
  );
}
