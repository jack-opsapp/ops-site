/**
 * ResultsInteractive — Client wrapper for interactive results elements
 *
 * Manages shared state between score dimension chips, sub-dimension tags,
 * and the sphere. Handles scroll-to-section interactions for badges.
 */

'use client';

import { useState, useCallback } from 'react';
import type { Dimension, SimpleScores, DimensionSubScores, AssessmentVersion } from '@/lib/assessment/types';
import { DIMENSIONS } from '@/lib/assessment/types';
import LeadershipSphere, { SUB_NODE_COLORS } from '@/components/assessment/LeadershipSphere';
import ResultsHero from '@/components/assessment/ResultsHero';
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
  averageScores?: SimpleScores;
  firstName: string;
  tagline: string;
}

export default function ResultsInteractive({
  scores,
  subScores,
  dimensionDescriptions,
  version,
  archetypeName,
  secondaryArchetypeName,
  strengths,
  averageScores,
  firstName,
  tagline,
}: ResultsInteractiveProps) {
  const isDeep = version === 'deep';
  const [focusDimension, setFocusDimension] = useState<Dimension | null>(null);
  const [focusSubIndex, setFocusSubIndex] = useState<number | null>(null);
  const [hoveredSub, setHoveredSub] = useState<{ dim: Dimension; index: number } | null>(null);
  const [showAverages, setShowAverages] = useState(false);

  const handleDimensionChipClick = useCallback((dim: Dimension) => {
    setFocusDimension((prev) => {
      if (prev === dim) {
        setFocusSubIndex(null);
        return null;
      }
      setFocusSubIndex(null);
      return dim;
    });
    document.getElementById('results-sphere')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, []);

  const handleSubTagClick = useCallback((dim: Dimension, subIndex: number) => {
    // Focus on parent dimension and select the sub-node
    setFocusDimension(dim);
    setFocusSubIndex((prev) => prev === subIndex && focusDimension === dim ? null : subIndex);
    document.getElementById('results-sphere')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [focusDimension]);

  const handleDimensionFromSphere = useCallback((dim: Dimension) => {
    setFocusDimension(dim);
    setFocusSubIndex(null);
  }, []);

  return (
    <>
      {/* Hero with badges inline */}
      <ResultsHero
        archetypeName={archetypeName}
        tagline={tagline}
        firstName={firstName}
      >
        <div className="flex flex-wrap gap-x-8 gap-y-4">
          {/* Primary archetype group */}
          <div>
            <p className="font-caption text-ops-text-secondary/30 uppercase tracking-[0.2em] text-[8px] mb-1.5">
              Archetype
            </p>
            <div className="flex flex-wrap items-center gap-3">
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
          </div>

          {/* Key strengths group */}
          {strengths && strengths.length > 0 && (
            <div>
              <p className="font-caption text-ops-text-secondary/30 uppercase tracking-[0.2em] text-[8px] mb-1.5">
                Key Strengths
              </p>
              <div className="flex flex-wrap gap-2">
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
            </div>
          )}

          {/* Scores group */}
          <div>
            <p className="font-caption text-ops-text-secondary/30 uppercase tracking-[0.2em] text-[8px] mb-1.5">
              Scores
            </p>
            <div className="flex flex-wrap gap-2">
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
          </div>
        </div>
      </ResultsHero>

      {/* Sphere section */}
      <section id="results-content" className="py-8 md:py-16">
        <div className="max-w-[1100px] mx-auto px-6 md:px-10">

      {/* Sub-dimension tags — deep version only */}
      {isDeep && subScores && (
        <FadeInUp delay={0.06}>
          <div className="flex flex-wrap gap-1.5 mb-6">
            {DIMENSIONS.map((dim) => {
              const subs = subScores[dim];
              if (!subs) return null;
              return subs.map((sub, i) => {
                const color = SUB_NODE_COLORS[i % SUB_NODE_COLORS.length];
                const isHovered = hoveredSub?.dim === dim && hoveredSub?.index === i;
                const isActive = focusDimension === dim && focusSubIndex === i;
                return (
                  <button
                    key={`${dim}-${sub.label}`}
                    type="button"
                    onClick={() => handleSubTagClick(dim, i)}
                    onMouseEnter={() => setHoveredSub({ dim, index: i })}
                    onMouseLeave={() => setHoveredSub(null)}
                    className="inline-flex items-center gap-1 font-body text-[10px] px-2 py-0.5 rounded-[3px] border transition-all duration-200 cursor-pointer"
                    style={{
                      borderColor: isActive
                        ? `rgba(${color.r}, ${color.g}, ${color.b}, 0.5)`
                        : isHovered
                          ? `rgba(${color.r}, ${color.g}, ${color.b}, 0.3)`
                          : 'rgba(255, 255, 255, 0.06)',
                      color: isActive || isHovered
                        ? `rgb(${color.r}, ${color.g}, ${color.b})`
                        : 'rgba(255, 255, 255, 0.4)',
                      backgroundColor: isActive
                        ? `rgba(${color.r}, ${color.g}, ${color.b}, 0.06)`
                        : 'transparent',
                    }}
                  >
                    <span
                      className="inline-block w-1 h-1 rounded-full flex-shrink-0 transition-colors duration-200"
                      style={{
                        backgroundColor: isActive || isHovered
                          ? `rgb(${color.r}, ${color.g}, ${color.b})`
                          : 'rgba(255, 255, 255, 0.2)',
                      }}
                    />
                    {sub.label}
                    <span
                      className="font-heading font-semibold text-[10px] transition-colors duration-200"
                      style={{
                        color: isActive || isHovered
                          ? `rgb(${color.r}, ${color.g}, ${color.b})`
                          : 'rgba(255, 255, 255, 0.25)',
                      }}
                    >
                      {sub.score}
                    </span>
                  </button>
                );
              });
            })}
          </div>
        </FadeInUp>
      )}

      {/* Spacer for quick version (no sub-tags) */}
      {!isDeep && <div className="mb-4" />}

      {/* Sphere — overflow-visible so mobile popup can extend below */}
      <FadeInUp>
        <div id="results-sphere" className="h-[350px] sm:h-[450px] md:h-[600px] w-full" style={{ overflow: 'visible' }}>
          <LeadershipSphere
            scores={scores}
            subScores={subScores}
            dimensionDescriptions={dimensionDescriptions}
            version={version}
            focusDimension={focusDimension}
            focusSubIndex={focusSubIndex}
            onDimensionClick={handleDimensionFromSphere}
            comparisonScores={showAverages ? averageScores : undefined}
            showAverages={showAverages}
            onToggleAverages={averageScores ? () => setShowAverages((prev) => !prev) : undefined}
            className="w-full h-full"
          />
        </div>
      </FadeInUp>

      {/* Score comparison bars — user vs population average */}
      {averageScores && (
        <FadeInUp>
          <div className="mt-10 mb-6">
            <p className="font-caption text-ops-text-secondary/40 uppercase tracking-[0.2em] text-[9px] mb-4">
              [ Your Scores vs. Population Average ]
            </p>
            <div className="space-y-3">
              {DIMENSIONS.map((dim) => {
                const userScore = scores[dim];
                const avgScore = averageScores[dim];
                const diff = userScore - avgScore;
                return (
                  <div key={dim} className="group">
                    <div className="flex items-center justify-between mb-1">
                      <button
                        type="button"
                        onClick={() => handleDimensionChipClick(dim)}
                        className="font-caption uppercase tracking-[0.1em] text-[10px] text-ops-text-secondary hover:text-ops-text-primary transition-colors cursor-pointer"
                      >
                        {dim}
                      </button>
                      <div className="flex items-center gap-3 font-heading text-xs">
                        <span className="text-ops-accent font-semibold">{userScore}</span>
                        <span className="text-white/25">|</span>
                        <span className="text-white/40">{avgScore}</span>
                        <span className={`font-semibold text-[10px] ${
                          diff > 0 ? 'text-white/60' : diff < 0 ? 'text-white/30' : 'text-white/25'
                        }`}>
                          {diff > 0 ? `+${diff}` : diff === 0 ? '—' : `${diff}`}
                        </span>
                      </div>
                    </div>
                    <div className="relative h-1.5 rounded-full bg-white/[0.04]">
                      {/* Average marker */}
                      <div
                        className="absolute top-0 h-full rounded-full bg-white/10"
                        style={{ width: `${avgScore}%` }}
                      />
                      {/* User bar */}
                      <div
                        className="absolute top-0 h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${userScore}%`,
                          backgroundColor: `rgba(89, 119, 148, ${0.4 + (userScore / 100) * 0.4})`,
                        }}
                      />
                      {/* Average tick mark */}
                      <div
                        className="absolute top-[-2px] w-px h-[calc(100%+4px)] bg-white/30"
                        style={{ left: `${avgScore}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="flex items-center gap-4 mt-4">
              <div className="flex items-center gap-1.5">
                <span className="inline-block w-3 h-1 rounded-full" style={{ backgroundColor: 'rgba(89, 119, 148, 0.6)' }} />
                <span className="font-body text-[9px] text-ops-text-secondary/40">You</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="inline-block w-px h-2.5 bg-white/30" />
                <span className="font-body text-[9px] text-ops-text-secondary/40">Average</span>
              </div>
            </div>
          </div>
        </FadeInUp>
      )}

        </div>
      </section>
    </>
  );
}
