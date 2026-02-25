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
import { FadeInUp, Divider } from '@/components/ui';
import BottomCTA from '@/components/shared/BottomCTA';
import ResultsHero from '@/components/assessment/ResultsHero';
import ResultsAnalysis from '@/components/assessment/ResultsAnalysis';
import ResultsShareBar from '@/components/assessment/ResultsShareBar';
import ResultsSphereSection from './ResultsSphereSection';

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
      {/* Hero — Archetype reveal */}
      <ResultsHero
        archetypeName={data.archetype.name}
        tagline={data.archetype.tagline}
        firstName={data.first_name}
      />

      {/* Leadership Sphere — Interactive 3D visualization */}
      <section className="py-8 md:py-16">
        <div className="max-w-[1100px] mx-auto px-6 md:px-10">
          <FadeInUp>
            <div className="h-[500px] md:h-[600px] w-full">
              <ResultsSphereSection
                scores={data.scores}
                subScores={data.analysis.sub_scores}
                dimensionDescriptions={dimensionDescriptions}
              />
            </div>
          </FadeInUp>
        </div>
      </section>

      <div className="max-w-[900px] mx-auto px-6 md:px-10">
        <Divider />
      </div>

      {/* AI Analysis sections */}
      <ResultsAnalysis analysis={data.analysis} />

      <div className="max-w-[900px] mx-auto px-6 md:px-10">
        <Divider />
      </div>

      {/* Share bar */}
      <ResultsShareBar token={token} />

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
