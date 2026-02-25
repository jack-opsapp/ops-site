/**
 * ResultsAnalysis — AI analysis sections for the results page
 *
 * Renders all AI-generated analysis sections with FadeInUp reveals:
 *  - Headline + Summary
 *  - Strengths cards
 *  - Blind Spots cards
 *  - Under Pressure text
 *  - Team Dynamics text
 *  - Growth Actions cards
 *  - Deep Insight text
 */

import { FadeInUp, SectionLabel, Card, Divider } from '@/components/ui';
import type { AIAnalysis } from '@/lib/assessment/types';

interface ResultsAnalysisProps {
  analysis: AIAnalysis;
}

export default function ResultsAnalysis({ analysis }: ResultsAnalysisProps) {
  return (
    <div className="max-w-[900px] mx-auto px-6 md:px-10">
      {/* ---- Headline + Summary ---- */}
      <section className="py-16 md:py-24">
        <FadeInUp>
          <SectionLabel label="Analysis" className="mb-6" />
        </FadeInUp>
        <FadeInUp delay={0.06}>
          <h2 className="font-heading text-3xl md:text-4xl font-semibold text-ops-text-primary mb-6">
            {analysis.headline}
          </h2>
        </FadeInUp>
        <FadeInUp delay={0.12}>
          <div className="font-body text-ops-text-secondary text-base leading-relaxed whitespace-pre-line">
            {analysis.summary}
          </div>
        </FadeInUp>
      </section>

      <Divider />

      {/* ---- Strengths ---- */}
      <section className="py-16 md:py-24">
        <FadeInUp>
          <SectionLabel label="Strengths" className="mb-8" />
        </FadeInUp>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {analysis.strengths.map((s, i) => (
            <FadeInUp key={s.title} delay={0.06 * (i + 1)}>
              <Card className="p-6 h-full" hoverable={false}>
                <h3 className="font-heading text-lg font-semibold text-ops-text-primary mb-3">
                  {s.title}
                </h3>
                <p className="font-body text-ops-text-secondary text-sm leading-relaxed">
                  {s.description}
                </p>
              </Card>
            </FadeInUp>
          ))}
        </div>
      </section>

      <Divider />

      {/* ---- Blind Spots ---- */}
      <section className="py-16 md:py-24">
        <FadeInUp>
          <SectionLabel label="Blind Spots" className="mb-8" />
        </FadeInUp>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {analysis.blind_spots.map((b, i) => (
            <FadeInUp key={b.title} delay={0.06 * (i + 1)}>
              <Card className="p-6 h-full" hoverable={false}>
                <h3 className="font-heading text-lg font-semibold text-ops-text-primary mb-3">
                  {b.title}
                </h3>
                <p className="font-body text-ops-text-secondary text-sm leading-relaxed">
                  {b.description}
                </p>
              </Card>
            </FadeInUp>
          ))}
        </div>
      </section>

      <Divider />

      {/* ---- Under Pressure ---- */}
      <section className="py-16 md:py-24">
        <FadeInUp>
          <SectionLabel label="Under Pressure" className="mb-6" />
        </FadeInUp>
        <FadeInUp delay={0.08}>
          <p className="font-body text-ops-text-secondary text-base leading-relaxed">
            {analysis.under_pressure}
          </p>
        </FadeInUp>
      </section>

      <Divider />

      {/* ---- Team Dynamics ---- */}
      <section className="py-16 md:py-24">
        <FadeInUp>
          <SectionLabel label="Team Dynamics" className="mb-6" />
        </FadeInUp>
        <FadeInUp delay={0.08}>
          <p className="font-body text-ops-text-secondary text-base leading-relaxed">
            {analysis.team_dynamics}
          </p>
        </FadeInUp>
      </section>

      <Divider />

      {/* ---- Growth Actions ---- */}
      <section className="py-16 md:py-24">
        <FadeInUp>
          <SectionLabel label="Growth Actions" className="mb-8" />
        </FadeInUp>
        <div className="space-y-5">
          {analysis.growth_actions.map((a, i) => (
            <FadeInUp key={a.title} delay={0.06 * (i + 1)}>
              <Card className="p-6" hoverable={false}>
                <div className="flex items-start gap-5">
                  <span className="font-heading text-3xl font-bold text-ops-accent/20 flex-shrink-0 leading-none mt-0.5">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <div>
                    <h3 className="font-heading text-lg font-semibold text-ops-text-primary mb-2">
                      {a.title}
                    </h3>
                    <p className="font-body text-ops-text-secondary text-sm leading-relaxed">
                      {a.description}
                    </p>
                  </div>
                </div>
              </Card>
            </FadeInUp>
          ))}
        </div>
      </section>

      <Divider />

      {/* ---- Deep Insight ---- */}
      <section className="py-16 md:py-24">
        <FadeInUp>
          <SectionLabel label="Deep Insight" className="mb-6" />
        </FadeInUp>
        <FadeInUp delay={0.08}>
          <p className="font-body text-ops-text-secondary text-base leading-relaxed italic">
            {analysis.deep_insight}
          </p>
        </FadeInUp>
      </section>
    </div>
  );
}
