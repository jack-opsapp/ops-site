import Link from 'next/link';
import { SectionLabel, FadeInUp } from '@/components/ui';

/** Map competitor display names to their /compare/ slugs */
const COMPARE_SLUGS: Record<string, string> = {
  'Jobber': 'jobber',
  'ServiceTitan': 'servicetitan',
  'Housecall Pro': 'housecall-pro',
  'BuildOps': 'buildops',
  'FieldPulse': 'fieldpulse',
  'Simpro': 'simpro',
  'FieldEdge': 'fieldedge',
  'Zuper': 'zuper',
};

const CHECK = (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-label="Included">
    <path d="M4 10.5L8 14.5L16 6.5" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const CROSS = (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-label="Not included">
    <path d="M5 5L15 15M15 5L5 15" stroke="#555555" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

function renderCell(value: boolean | string) {
  if (value === true) return CHECK;
  if (value === false) return CROSS;
  return <span className="text-sm font-caption text-ops-text-secondary">{value}</span>;
}

interface ComparisonRow {
  feature: string;
  ops: boolean | string;
  comp1: boolean | string;
  comp2: boolean | string;
}

interface IndustryComparisonProps {
  competitors: [string, string];
  rows: ComparisonRow[];
}

export default function IndustryComparison({ competitors, rows }: IndustryComparisonProps) {
  return (
    <section className="py-24 md:py-32 bg-ops-background">
      <div className="max-w-[1400px] mx-auto px-6 md:px-10">
        <FadeInUp>
          <SectionLabel label="VS THE ALTERNATIVES" className="mb-5" />
          <h2 className="font-heading font-bold uppercase leading-[0.95] tracking-tight text-ops-text-primary text-3xl md:text-4xl lg:text-5xl">
            SEE HOW OPS COMPARES
          </h2>
        </FadeInUp>

        <FadeInUp delay={0.1}>
          <div className="mt-16 md:mt-20 overflow-x-auto -mx-6 md:mx-0 px-6 md:px-0">
            <table className="w-full min-w-[540px] border-collapse">
              <thead>
                <tr>
                  <th className="text-left p-4 pb-6 font-caption uppercase tracking-[0.15em] text-xs text-ops-text-secondary w-[180px] min-w-[140px]">
                    Feature
                  </th>
                  <th className="text-left p-4 pb-6 font-caption uppercase tracking-[0.15em] text-xs text-ops-text-primary border-t-2 border-t-ops-accent bg-ops-surface rounded-t-[3px]">
                    OPS
                  </th>
                  <th className="text-left p-4 pb-6 font-caption uppercase tracking-[0.15em] text-xs text-ops-text-secondary">
                    {COMPARE_SLUGS[competitors[0]] ? (
                      <Link href={`/compare/${COMPARE_SLUGS[competitors[0]]}`} className="hover:text-ops-text-primary transition-colors underline decoration-ops-border hover:decoration-ops-text-primary">
                        {competitors[0]}
                      </Link>
                    ) : competitors[0]}
                  </th>
                  <th className="text-left p-4 pb-6 font-caption uppercase tracking-[0.15em] text-xs text-ops-text-secondary">
                    {COMPARE_SLUGS[competitors[1]] ? (
                      <Link href={`/compare/${COMPARE_SLUGS[competitors[1]]}`} className="hover:text-ops-text-primary transition-colors underline decoration-ops-border hover:decoration-ops-text-primary">
                        {competitors[1]}
                      </Link>
                    ) : competitors[1]}
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => (
                  <tr key={row.feature} className={i < rows.length - 1 ? 'border-b border-ops-border' : ''}>
                    <td className="p-4 font-caption text-sm text-ops-text-secondary">{row.feature}</td>
                    <td className="p-4 bg-ops-surface">{renderCell(row.ops)}</td>
                    <td className="p-4">{renderCell(row.comp1)}</td>
                    <td className="p-4">{renderCell(row.comp2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </FadeInUp>
      </div>
    </section>
  );
}
