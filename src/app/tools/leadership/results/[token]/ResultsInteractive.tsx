/**
 * ResultsInteractive — Client wrapper for interactive results elements
 *
 * Manages shared state between score dimension chips and the sphere.
 * Handles scroll-to-section interactions for badges.
 */

'use client';

import { useState, useCallback } from 'react';
import type { Dimension, SimpleScores, DimensionSubScores, AssessmentVersion } from '@/lib/assessment/types';
import { DIMENSIONS } from '@/lib/assessment/types';
import LeadershipSphere from '@/components/assessment/LeadershipSphere';
import { FadeInUp } from '@/components/ui';

/** Scroll to element with offset to avoid being hidden behind fixed header */
function scrollToWithOffset(elementId: string, offset = 80) {
  const el = document.getElementById(elementId);
  if (!el) return;
  const y = el.getBoundingClientRect().top + window.scrollY - offset;
  window.scrollTo({ top: y, behavior: 'smooth' });
}

interface ResultsInteractiveProps {
  scores: SimpleScores;
  subScores?: DimensionSubScores;
  dimensionDescriptions?: Record<Dimension, string>;
  version?: AssessmentVersion;
  archetypeName: string;
  secondaryArchetypeName?: string;
  strengths?: { title: string; description: string }[];
}

export default function ResultsInteractive({
  scores,
  subScores,
  dimensionDescriptions,
  version,
  archetypeName,
  secondaryArchetypeName,
  strengths,
}: ResultsInteractiveProps) {
  const [focusDimension, setFocusDimension] = useState<Dimension | null>(null);

  const handleDimensionChipClick = useCallback((dim: Dimension) => {
    setFocusDimension((prev) => prev === dim ? null : dim);
    // Scroll sphere into view
    document.getElementById('results-sphere')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, []);

  const handleDimensionFromSphere = useCallback((dim: Dimension) => {
    setFocusDimension(dim);
  }, []);

  return (
    <>
      {/* Archetype badge — tap scrolls to analysis */}
      <FadeInUp>
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <button
            type="button"
            onClick={() => scrollToWithOffset('results-analysis')}
            className="inline-flex items-center font-caption uppercase tracking-[0.15em] text-[10px] px-3 py-1 rounded-[3px] border border-ops-accent/30 text-ops-accent bg-ops-accent/5 cursor-pointer hover:bg-ops-accent/10 transition-colors"
          >
            {archetypeName}
          </button>
          {secondaryArchetypeName && (
            <span className="font-body text-ops-text-secondary text-xs">
              with traits of <span className="text-ops-text-primary/70">{secondaryArchetypeName}</span>
            </span>
          )}
        </div>
      </FadeInUp>

      {/* Score chips — tap orients the sphere */}
      <FadeInUp>
        <div className="flex flex-wrap gap-2 mb-6">
          {DIMENSIONS.map((dim) => (
            <button
              key={dim}
              type="button"
              onClick={() => handleDimensionChipClick(dim)}
              className={`inline-flex items-center gap-1.5 font-caption uppercase tracking-[0.1em] text-[10px] px-2.5 py-1 rounded-[3px] border transition-colors cursor-pointer ${
                focusDimension === dim
                  ? 'border-ops-accent/50 text-ops-accent bg-ops-accent/5'
                  : 'border-ops-border text-ops-text-secondary hover:border-ops-border-hover'
              }`}
            >
              {dim}
              <span className={`font-heading font-semibold text-xs ${
                focusDimension === dim ? 'text-ops-accent' : 'text-ops-text-primary'
              }`}>
                {scores[dim]}
              </span>
            </button>
          ))}
        </div>
      </FadeInUp>

      {/* Sphere — overflow-visible so mobile popup can extend below */}
      <FadeInUp>
        <div id="results-sphere" className="h-[350px] sm:h-[450px] md:h-[600px] w-full" style={{ overflow: 'visible' }}>
          <LeadershipSphere
            scores={scores}
            subScores={subScores}
            dimensionDescriptions={dimensionDescriptions}
            version={version}
            focusDimension={focusDimension}
            onDimensionClick={handleDimensionFromSphere}
            className="w-full h-full"
          />
        </div>
      </FadeInUp>

      {/* Strength badges — tap scrolls to strengths section */}
      {strengths && strengths.length > 0 && (
        <FadeInUp>
          <div className="flex flex-wrap gap-2 mt-4">
            {strengths.slice(0, 3).map((s) => (
              <button
                key={s.title}
                type="button"
                onClick={() => scrollToWithOffset('results-strengths')}
                className="font-body text-ops-text-secondary/60 text-[11px] px-3 py-1 rounded-[3px] border border-ops-border/50 cursor-pointer hover:border-ops-border hover:text-ops-text-secondary/80 transition-colors"
              >
                {s.title}
              </button>
            ))}
          </div>
        </FadeInUp>
      )}
    </>
  );
}
