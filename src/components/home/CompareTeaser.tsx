/**
 * CompareTeaser — Home-page section surfacing the comparison cluster.
 *
 * Renders four competitor cards linking to /compare/<slug>. Closes the
 * audit-flagged link gap (home page → /compare had zero direct links).
 * Visual pattern mirrors TradesList for cohesion.
 */

import Link from 'next/link';
import { SectionLabel, FadeInUp, Card } from '@/components/ui';

interface Competitor {
  slug: string;
  name: string;
  /** Single-sentence factual differentiator — OPS voice: concrete, no slander. */
  pitch: string;
}

const COMPETITORS: Competitor[] = [
  {
    slug: 'servicetitan',
    name: 'ServiceTitan',
    pitch: '$250+ per tech per month. Twelve-month contract. Three-month onboarding.',
  },
  {
    slug: 'jobber',
    name: 'Jobber',
    pitch: 'Per-user pricing. $169 a month for five people, then $29 for every seat after.',
  },
  {
    slug: 'housecall-pro',
    name: 'Housecall Pro',
    pitch: '$59 to start. $329 once the add-ons stack. AI-only support since 2025.',
  },
  {
    slug: 'fieldpulse',
    name: 'FieldPulse',
    pitch: 'Per-user pricing. Every new hire bumps the bill. No flat-rate option.',
  },
];

export default function CompareTeaser() {
  return (
    <section className="py-24 md:py-32 bg-ops-background">
      <div className="max-w-[1400px] mx-auto px-6 md:px-10">
        <FadeInUp>
          <SectionLabel label="COMPARE" />
        </FadeInUp>

        <FadeInUp delay={0.05}>
          <h2
            className="mt-4 font-heading font-bold uppercase leading-[0.95] tracking-tight text-ops-text-primary max-w-[680px]"
            style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)' }}
          >
            KNOW WHAT YOU&apos;RE SWITCHING FROM.
          </h2>
        </FadeInUp>

        <FadeInUp delay={0.1}>
          <p className="mt-4 font-heading font-light text-base text-ops-text-secondary max-w-[600px]">
            Side-by-side numbers on the apps trade crews actually pay for. No demo wall. No sales call.
          </p>
        </FadeInUp>

        <div className="mt-12 md:mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {COMPETITORS.map((competitor, i) => (
            <FadeInUp key={competitor.slug} delay={0.1 + i * 0.06}>
              <Card hoverable className="p-8 h-full flex flex-col">
                <p className="font-caption uppercase tracking-[0.15em] text-[10px] text-ops-text-secondary">
                  OPS vs
                </p>
                <h3 className="mt-1 font-heading font-bold text-base text-ops-text-primary uppercase tracking-tight">
                  {competitor.name}
                </h3>
                <p className="mt-4 font-heading font-light text-sm text-ops-text-secondary leading-relaxed flex-1">
                  {competitor.pitch}
                </p>
                <Link
                  href={`/compare/${competitor.slug}`}
                  className="mt-5 inline-block font-caption uppercase tracking-[0.15em] text-[11px] text-ops-accent hover:text-ops-text-primary transition-colors"
                >
                  Run the numbers -&gt;
                </Link>
              </Card>
            </FadeInUp>
          ))}
        </div>

        <FadeInUp delay={0.45}>
          <div className="mt-12">
            <Link
              href="/compare"
              className="font-caption uppercase tracking-[0.15em] text-xs text-ops-text-secondary hover:text-ops-accent transition-colors"
            >
              All comparisons -&gt;
            </Link>
          </div>
        </FadeInUp>
      </div>
    </section>
  );
}
