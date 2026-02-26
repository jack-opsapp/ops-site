/**
 * ResultsAnalysis — AI analysis sections for the results page
 *
 * Compact layout with expandable sections. Headline + summary always visible,
 * all other sections are collapsible cards to reduce vertical sprawl.
 */

'use client';

import { useState } from 'react';
import { FadeInUp, SectionLabel } from '@/components/ui';
import type { AIAnalysis } from '@/lib/assessment/types';

/* ------------------------------------------------------------------ */
/*  Expandable Section                                                 */
/* ------------------------------------------------------------------ */

function ExpandableSection({
  label,
  children,
  defaultOpen = false,
  delay = 0,
  id,
}: {
  label: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  delay?: number;
  id?: string;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <FadeInUp delay={delay} id={id}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-4 group cursor-pointer"
      >
        <span className="font-caption uppercase tracking-[0.2em] text-[10px] text-ops-text-secondary group-hover:text-ops-text-primary transition-colors">
          [ {label} ]
        </span>
        <span
          className="text-ops-text-secondary/50 text-xs transition-transform duration-300"
          style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
        >
          &#x25BE;
        </span>
      </button>
      <div
        className="overflow-hidden transition-all duration-400 ease-out"
        style={{
          maxHeight: open ? '2000px' : '0',
          opacity: open ? 1 : 0,
        }}
      >
        <div className="pb-6">
          {children}
        </div>
      </div>
      <div className="h-px bg-ops-border/50" />
    </FadeInUp>
  );
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

interface ResultsAnalysisProps {
  analysis: AIAnalysis;
}

export default function ResultsAnalysis({ analysis }: ResultsAnalysisProps) {
  // Sanitize headline: strip duplicate "The The" → "The" (AI sometimes doubles the article)
  const headline = analysis.headline.replace(/^The The /i, 'The ');

  return (
    <div id="results-analysis" className="max-w-[900px] mx-auto px-6 md:px-10">
      {/* ---- Headline + Summary (always visible) ---- */}
      <section className="py-10 md:py-14">
        <FadeInUp>
          <SectionLabel label="Analysis" className="mb-5" />
        </FadeInUp>
        <FadeInUp delay={0.06}>
          <h2 className="font-heading text-2xl md:text-3xl font-semibold text-ops-text-primary mb-4">
            {headline}
          </h2>
        </FadeInUp>
        <FadeInUp delay={0.12}>
          <div className="font-body text-ops-text-secondary text-sm md:text-base leading-relaxed whitespace-pre-line">
            {analysis.summary}
          </div>
        </FadeInUp>
      </section>

      <div className="h-px bg-ops-border/50" />

      {/* ---- Expandable sections ---- */}

      <ExpandableSection label="Strengths" defaultOpen={true} delay={0.04} id="results-strengths">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {analysis.strengths.map((s) => (
            <div
              key={s.title}
              className="bg-ops-surface border border-ops-border rounded-[3px] p-4"
            >
              <h3 className="font-heading text-sm font-semibold text-ops-text-primary mb-1.5">
                {s.title}
              </h3>
              <p className="font-body text-ops-text-secondary text-xs leading-relaxed">
                {s.description}
              </p>
            </div>
          ))}
        </div>
      </ExpandableSection>

      <ExpandableSection label="Blind Spots" delay={0.06}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {analysis.blind_spots.map((b) => (
            <div
              key={b.title}
              className="bg-ops-surface border border-ops-border rounded-[3px] p-4"
            >
              <h3 className="font-heading text-sm font-semibold text-ops-text-primary mb-1.5">
                {b.title}
              </h3>
              <p className="font-body text-ops-text-secondary text-xs leading-relaxed">
                {b.description}
              </p>
            </div>
          ))}
        </div>
      </ExpandableSection>

      <ExpandableSection label="Growth Actions" delay={0.08}>
        <div className="space-y-3">
          {analysis.growth_actions.map((a, i) => (
            <div
              key={a.title}
              className="bg-ops-surface border border-ops-border rounded-[3px] p-4 flex items-start gap-4"
            >
              <span className="font-heading text-xl font-bold text-ops-accent/20 flex-shrink-0 leading-none mt-0.5">
                {String(i + 1).padStart(2, '0')}
              </span>
              <div>
                <h3 className="font-heading text-sm font-semibold text-ops-text-primary mb-1">
                  {a.title}
                </h3>
                <p className="font-body text-ops-text-secondary text-xs leading-relaxed">
                  {a.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </ExpandableSection>

      {/* Under Pressure + Team Dynamics + Deep Insight — combined, non-collapsible */}
      <FadeInUp delay={0.10}>
        <div className="py-6 space-y-5">
          <div>
            <span className="font-caption uppercase tracking-[0.2em] text-[10px] text-ops-text-secondary block mb-2">
              [ Under Pressure ]
            </span>
            <p className="font-body text-ops-text-secondary text-sm leading-relaxed">
              {analysis.under_pressure}
            </p>
          </div>
          <div>
            <span className="font-caption uppercase tracking-[0.2em] text-[10px] text-ops-text-secondary block mb-2">
              [ Team Dynamics ]
            </span>
            <p className="font-body text-ops-text-secondary text-sm leading-relaxed">
              {analysis.team_dynamics}
            </p>
          </div>
          <div>
            <span className="font-caption uppercase tracking-[0.2em] text-[10px] text-ops-text-secondary block mb-2">
              [ Deep Insight ]
            </span>
            <p className="font-body text-ops-text-secondary text-sm leading-relaxed italic">
              {analysis.deep_insight}
            </p>
          </div>
        </div>
        <div className="h-px bg-ops-border/50" />
      </FadeInUp>
    </div>
  );
}
