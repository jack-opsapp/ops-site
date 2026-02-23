/**
 * ComparisonSection — OPS vs competitor comparison table
 *
 * Server component. Dark card-based grid comparing OPS against
 * Jobber, ServiceTitan, and Housecall Pro across key features.
 * OPS column has a subtle accent top border.
 * Responsive: horizontal scroll on mobile with sticky first column.
 */

import { SectionLabel, FadeInUp } from '@/components/ui';

const CHECK = (
  <svg
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-label="Included"
  >
    <path
      d="M4 10.5L8 14.5L16 6.5"
      stroke="#FFFFFF"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const DASH = <span className="text-ops-text-secondary">&mdash;</span>;

type CellValue = 'check' | 'dash' | string;

interface Row {
  feature: string;
  ops: CellValue;
  jobber: CellValue;
  servicetitan: CellValue;
  housecall: CellValue;
}

const rows: Row[] = [
  {
    feature: 'Price',
    ops: '$90-190/mo',
    jobber: '$49-299/mo',
    servicetitan: '$99-399/mo',
    housecall: '$49-199/mo',
  },
  {
    feature: 'Crew Scheduling',
    ops: 'check',
    jobber: 'check',
    servicetitan: 'check',
    housecall: 'check',
  },
  {
    feature: 'Project Tracking',
    ops: 'check',
    jobber: 'check',
    servicetitan: 'dash',
    housecall: 'dash',
  },
  {
    feature: 'Invoicing',
    ops: 'check',
    jobber: 'check',
    servicetitan: 'check',
    housecall: 'check',
  },
  {
    feature: 'Job Board',
    ops: 'check',
    jobber: 'dash',
    servicetitan: 'dash',
    housecall: 'dash',
  },
  {
    feature: 'Offline Mode',
    ops: 'check',
    jobber: 'dash',
    servicetitan: 'dash',
    housecall: 'dash',
  },
  {
    feature: 'Training Required',
    ops: 'None',
    jobber: '1-2 weeks',
    servicetitan: '1-2 weeks',
    housecall: '1-2 weeks',
  },
];

function renderCell(value: CellValue) {
  if (value === 'check') return CHECK;
  if (value === 'dash') return DASH;
  return <span className="text-sm font-caption">{value}</span>;
}

export default function ComparisonSection() {
  return (
    <section className="py-24 md:py-32 bg-ops-background">
      <div className="max-w-[1400px] mx-auto px-6 md:px-10">
        <FadeInUp>
          <SectionLabel label="WHY OPS" className="mb-5" />
          <h2 className="font-heading font-bold uppercase leading-[0.95] tracking-tight text-ops-text-primary text-3xl md:text-4xl lg:text-5xl">
            THE RIGHT TOOL. THE RIGHT PRICE.
          </h2>
        </FadeInUp>

        {/* Table wrapper — horizontal scroll on mobile */}
        <FadeInUp delay={0.1}>
          <div className="mt-16 md:mt-20 overflow-x-auto -mx-6 md:mx-0 px-6 md:px-0">
            <table className="w-full min-w-[640px] border-collapse">
              {/* Header row */}
              <thead>
                <tr>
                  <th className="text-left p-4 pb-6 font-caption uppercase tracking-[0.15em] text-xs text-ops-text-secondary w-[180px] min-w-[140px]">
                    Feature
                  </th>
                  {/* OPS column — accent top border */}
                  <th className="text-left p-4 pb-6 font-caption uppercase tracking-[0.15em] text-xs text-ops-text-primary border-t-2 border-t-ops-accent bg-ops-surface rounded-t-[3px]">
                    OPS
                  </th>
                  <th className="text-left p-4 pb-6 font-caption uppercase tracking-[0.15em] text-xs text-ops-text-secondary">
                    Jobber
                  </th>
                  <th className="text-left p-4 pb-6 font-caption uppercase tracking-[0.15em] text-xs text-ops-text-secondary">
                    ServiceTitan
                  </th>
                  <th className="text-left p-4 pb-6 font-caption uppercase tracking-[0.15em] text-xs text-ops-text-secondary">
                    Housecall Pro
                  </th>
                </tr>
              </thead>

              {/* Data rows */}
              <tbody>
                {rows.map((row, i) => (
                  <tr
                    key={row.feature}
                    className={
                      i < rows.length - 1
                        ? 'border-b border-ops-border'
                        : ''
                    }
                  >
                    <td className="p-4 font-caption text-sm text-ops-text-secondary">
                      {row.feature}
                    </td>
                    {/* OPS column — highlighted background */}
                    <td className="p-4 bg-ops-surface">
                      {renderCell(row.ops)}
                    </td>
                    <td className="p-4">{renderCell(row.jobber)}</td>
                    <td className="p-4">{renderCell(row.servicetitan)}</td>
                    <td className="p-4">{renderCell(row.housecall)}</td>
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
