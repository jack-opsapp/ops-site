/**
 * Results Page — /tools/leadership/results/[token]
 *
 * Server component. Fetches results by token and renders the full
 * leadership profile. Shareable via URL (no auth required).
 *
 * Dynamic metadata for social sharing.
 */

import { Metadata } from 'next';
import Link from 'next/link';
import { getResults } from '@/lib/assessment/actions';
import type { AssessmentResult, Dimension } from '@/lib/assessment/types';
import { FadeInUp } from '@/components/ui';
import BottomCTA from '@/components/shared/BottomCTA';
import ResultsAnalysis from '@/components/assessment/ResultsAnalysis';
import ResultsShareBar from '@/components/assessment/ResultsShareBar';
import ResultsInteractive from './ResultsInteractive';

/* ------------------------------------------------------------------ */
/*  Dynamic metadata                                                   */
/* ------------------------------------------------------------------ */

interface PageProps {
  params: Promise<{ token: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { token } = await params;
  const result = await getResults(token);

  if ('error' in result) {
    return { title: 'Results Not Found' };
  }

  return {
    title: `${result.archetype.name} | Leadership Assessment`,
    description: result.archetype.tagline,
  };
}

/* ------------------------------------------------------------------ */
/*  Error State                                                        */
/* ------------------------------------------------------------------ */

function ResultsNotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <div className="text-center max-w-md px-6">
        <p className="font-caption text-ops-text-secondary uppercase tracking-[0.2em] text-xs mb-4">
          [ Results Not Found ]
        </p>
        <p className="font-body text-ops-text-secondary text-sm mb-8">
          This assessment may have expired or the link is incorrect.
        </p>
        <Link
          href="/tools/leadership"
          className="inline-flex items-center justify-center font-caption uppercase tracking-[0.15em] text-xs px-6 py-3 rounded-[3px] transition-all duration-200 bg-ops-text-primary text-ops-background hover:bg-white/90"
        >
          Take the Assessment
        </Link>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default async function ResultsPage({ params }: PageProps) {
  const { token } = await params;
  const result = await getResults(token);

  if ('error' in result) {
    return <ResultsNotFound />;
  }

  const data = result as AssessmentResult;

  // Build dimension descriptions from deep dive or generate template strings
  const dimensionDescriptions: Record<Dimension, string> | undefined =
    data.analysis.dimensional_deep_dive
      ? (data.analysis.dimensional_deep_dive as Record<Dimension, string>)
      : undefined;

  return (
    <>
      {/* Hero + Sphere — ResultsInteractive renders both */}
      <ResultsInteractive
        scores={data.scores}
        subScores={data.analysis.sub_scores}
        dimensionDescriptions={dimensionDescriptions}
        version={data.version}
        archetypeName={data.archetype.name}
        secondaryArchetypeName={data.secondary_archetype?.name}
        strengths={data.analysis.strengths}
        averageScores={data.population_averages ?? undefined}
        firstName={data.first_name}
        tagline={data.archetype.tagline}
      />

      {/* AI Analysis — expandable sections */}
      <ResultsAnalysis analysis={data.analysis} />

      {/* Share bar */}
      <ResultsShareBar token={token} />

      {/* Upgrade CTA — quick results only */}
      {data.version === 'quick' && (
        <section className="py-16 md:py-24">
          <div className="max-w-[1100px] mx-auto px-6 md:px-10">
            <FadeInUp>
              <p className="font-caption text-ops-accent uppercase tracking-[0.2em] text-xs mb-6">
                [ GO DEEPER ]
              </p>
            </FadeInUp>

            <FadeInUp>
              <h2 className="font-heading font-bold uppercase text-ops-text-primary text-3xl md:text-4xl leading-[0.92] tracking-tight mb-4">
                Continue your
                <br />
                assessment
              </h2>
            </FadeInUp>

            <FadeInUp>
              <div
                className="w-12 h-px mb-6"
                style={{ backgroundColor: 'rgba(89, 119, 148, 0.2)' }}
              />
            </FadeInUp>

            <FadeInUp>
              <p className="font-heading font-light text-ops-text-secondary/60 text-sm leading-relaxed max-w-lg mb-4">
                Your quick results are just the beginning. The full assessment
                unlocks sub-dimension scores, deeper analysis, and comprehensive
                leadership insights — and it builds on what you&apos;ve already
                answered.
              </p>
            </FadeInUp>

            <FadeInUp>
              <div className="flex items-center gap-6 mb-10">
                <span className="font-caption text-[10px] uppercase tracking-[0.2em] text-ops-text-secondary">
                  35 additional questions
                </span>
                <span className="w-px h-3 bg-white/[0.1]" />
                <span className="font-caption text-[10px] uppercase tracking-[0.2em] text-ops-text-secondary">
                  ~8 min
                </span>
              </div>
            </FadeInUp>

            <FadeInUp>
              <Link
                href={`/tools/leadership/assess?version=deep&upgrade_from=${token}`}
                className="w-full sm:w-auto inline-flex items-center justify-center font-caption uppercase tracking-[0.15em] text-xs px-8 py-3.5 rounded-[3px] transition-all duration-200 bg-ops-text-primary text-ops-background hover:bg-white/90"
              >
                <span className="hidden sm:inline">Continue My Progress in the Full Assessment</span>
                <span className="sm:hidden">Continue Full Assessment</span>
              </Link>
            </FadeInUp>

            <FadeInUp>
              <Link
                href="/tools/leadership/assess"
                className="w-full sm:w-auto inline-flex items-center justify-center font-caption uppercase tracking-[0.15em] text-xs px-8 py-3.5 rounded-[3px] transition-all duration-200 border border-ops-border text-ops-text-secondary hover:border-ops-border-hover hover:text-ops-text-primary mt-3"
              >
                Take the Test Again
              </Link>
            </FadeInUp>
          </div>
        </section>
      )}

      {/* Bottom CTA */}
      <BottomCTA
        heading="Run your operation."
        subtext="OPS is the project system built for the trades."
        buttonText="Explore the Platform"
        buttonHref="/platform"
      />
    </>
  );
}
