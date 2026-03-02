/**
 * ComparisonSection — OPS vs competitor comparison table
 *
 * Server component. Dark card-based grid comparing OPS against
 * Jobber, ServiceTitan, and Housecall Pro across key features.
 */

import { SectionLabel, FadeInUp } from '@/components/ui';
import { getTDict } from '@/i18n/server';

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

function renderCell(value: CellValue) {
  if (value === 'check') return CHECK;
  if (value === 'dash') return DASH;
  return <span className="text-sm font-caption">{value}</span>;
}

export default async function ComparisonSection() {
  const dict = await getTDict('platform');
  const t = (key: string) => {
    const value = dict[key];
    return typeof value === 'string' ? value : key;
  };

  const rows: { feature: string; ops: CellValue; jobber: CellValue; servicetitan: CellValue; housecall: CellValue }[] = [
    {
      feature: t('comparison.row.price'),
      ops: t('comparison.row.price.ops'),
      jobber: t('comparison.row.price.jobber'),
      servicetitan: t('comparison.row.price.servicetitan'),
      housecall: t('comparison.row.price.housecall'),
    },
    { feature: t('comparison.row.crewScheduling'), ops: 'check', jobber: 'check', servicetitan: 'check', housecall: 'check' },
    { feature: t('comparison.row.projectTracking'), ops: 'check', jobber: 'check', servicetitan: 'check', housecall: 'dash' },
    { feature: t('comparison.row.invoicing'), ops: 'check', jobber: 'check', servicetitan: 'check', housecall: 'check' },
    { feature: t('comparison.row.pipelineCrm'), ops: 'check', jobber: 'dash', servicetitan: 'check', housecall: 'dash' },
    { feature: t('comparison.row.inventoryTracking'), ops: 'check', jobber: 'dash', servicetitan: 'dash', housecall: 'dash' },
    { feature: t('comparison.row.photoMarkup'), ops: 'check', jobber: 'dash', servicetitan: 'dash', housecall: 'dash' },
    { feature: t('comparison.row.offlineMode'), ops: 'check', jobber: 'dash', servicetitan: 'dash', housecall: 'dash' },
    {
      feature: t('comparison.row.trainingRequired'),
      ops: t('comparison.row.trainingRequired.ops'),
      jobber: t('comparison.row.trainingRequired.jobber'),
      servicetitan: t('comparison.row.trainingRequired.servicetitan'),
      housecall: t('comparison.row.trainingRequired.housecall'),
    },
    { feature: t('comparison.row.allFeatures'), ops: 'check', jobber: 'dash', servicetitan: 'dash', housecall: 'dash' },
  ];

  return (
    <section className="py-24 md:py-32 bg-ops-background">
      <div className="max-w-[1400px] mx-auto px-6 md:px-10">
        <FadeInUp>
          <SectionLabel label={t('comparison.sectionLabel')} className="mb-5" />
          <h2 className="font-heading font-bold uppercase leading-[0.95] tracking-tight text-ops-text-primary text-3xl md:text-4xl lg:text-5xl">
            {t('comparison.heading')}
          </h2>
        </FadeInUp>

        <FadeInUp delay={0.1}>
          <div className="mt-16 md:mt-20 overflow-x-auto -mx-6 md:mx-0 px-6 md:px-0">
            <table className="w-full min-w-[640px] border-collapse">
              <thead>
                <tr>
                  <th className="text-left p-4 pb-6 font-caption uppercase tracking-[0.15em] text-xs text-ops-text-secondary w-[180px] min-w-[140px]">
                    {t('comparison.featureCol')}
                  </th>
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
