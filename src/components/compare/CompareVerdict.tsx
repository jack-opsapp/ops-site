'use client';

import { SectionLabel, FadeInUp, Card } from '@/components/ui';

interface CompareVerdictProps {
  competitorName: string;
  summary: string;
  switchReasons: string[];
  competitorStrengths: string[];
  bestFor: {
    ops: string;
    competitor: string;
  };
}

export default function CompareVerdict({
  competitorName,
  summary,
  switchReasons,
  competitorStrengths,
  bestFor,
}: CompareVerdictProps) {
  return (
    <section className="py-24 md:py-32 bg-ops-background">
      <div className="max-w-[1400px] mx-auto px-6 md:px-10">
        <FadeInUp>
          <SectionLabel label="THE VERDICT" className="mb-5" />
          <h2
            className="font-heading font-bold uppercase leading-[0.95] tracking-tight text-ops-text-primary max-w-[700px]"
            style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)' }}
          >
            OPS VS {competitorName.toUpperCase()}
          </h2>
        </FadeInUp>

        {/* Summary — primary AI extraction target */}
        <FadeInUp delay={0.05}>
          <p className="mt-8 font-heading font-light text-lg md:text-xl text-ops-text-secondary max-w-[800px] leading-relaxed">
            {summary}
          </p>
        </FadeInUp>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Why switch to OPS */}
          <FadeInUp delay={0.1}>
            <Card className="p-8 h-full border-ops-accent/20">
              <p className="font-caption text-ops-accent uppercase tracking-[0.15em] text-xs mb-4">
                [ WHY SWITCH TO OPS ]
              </p>
              <ul className="space-y-3">
                {switchReasons.map((reason, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 20 20"
                      fill="none"
                      className="shrink-0 mt-0.5"
                      aria-hidden="true"
                    >
                      <path
                        d="M4 10.5L8 14.5L16 6.5"
                        stroke="#FFFFFF"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <span className="font-heading font-light text-sm text-ops-text-secondary leading-relaxed">
                      {reason}
                    </span>
                  </li>
                ))}
              </ul>
            </Card>
          </FadeInUp>

          {/* Where competitor is strong — honest, builds credibility */}
          <FadeInUp delay={0.15}>
            <Card className="p-8 h-full">
              <p className="font-caption text-ops-text-secondary uppercase tracking-[0.15em] text-xs mb-4">
                [ WHERE {competitorName.toUpperCase()} IS STRONG ]
              </p>
              <ul className="space-y-3">
                {competitorStrengths.map((strength, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="shrink-0 mt-0.5 text-ops-text-secondary/40 text-sm">&bull;</span>
                    <span className="font-heading font-light text-sm text-ops-text-secondary leading-relaxed">
                      {strength}
                    </span>
                  </li>
                ))}
              </ul>
            </Card>
          </FadeInUp>
        </div>

        {/* Best-for recommendation — structured for AI snippet extraction */}
        <FadeInUp delay={0.2}>
          <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border border-ops-accent/20 rounded-[8px] p-6">
              <p className="font-caption text-ops-accent uppercase tracking-[0.15em] text-xs mb-3">
                [ CHOOSE OPS IF ]
              </p>
              <p className="font-heading font-light text-sm text-ops-text-secondary leading-relaxed">
                {bestFor.ops}
              </p>
            </div>
            <div className="border border-ops-border rounded-[8px] p-6">
              <p className="font-caption text-ops-text-secondary uppercase tracking-[0.15em] text-xs mb-3">
                [ CHOOSE {competitorName.toUpperCase()} IF ]
              </p>
              <p className="font-heading font-light text-sm text-ops-text-secondary leading-relaxed">
                {bestFor.competitor}
              </p>
            </div>
          </div>
        </FadeInUp>
      </div>
    </section>
  );
}
