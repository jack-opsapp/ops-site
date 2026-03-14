/**
 * TradesList — Trade-specific use cases for AI SEO
 *
 * Lists how different trade verticals use OPS with specific use cases.
 * Adds keyword-rich crawlable content (electrician, plumber, HVAC, etc.)
 * and links to industry-specific landing pages for internal linking.
 */

import Link from 'next/link';
import { SectionLabel, FadeInUp, Card } from '@/components/ui';
import { getTDict } from '@/i18n/server';

const TRADE_SLUGS: Record<string, string | null> = {
  trade1: 'electrical',
  trade2: 'plumbing',
  trade3: 'hvac',
  trade4: null, // landscaping — no industry page yet
  trade5: null, // painting — no industry page yet
  trade6: 'cleaning',
};

export default async function TradesList() {
  const dict = await getTDict('home');
  const t = (key: string) => {
    const value = dict[key];
    return typeof value === 'string' ? value : key;
  };

  const trades = [
    { key: 'trade1', name: t('trades.trade1.name'), copy: t('trades.trade1.copy') },
    { key: 'trade2', name: t('trades.trade2.name'), copy: t('trades.trade2.copy') },
    { key: 'trade3', name: t('trades.trade3.name'), copy: t('trades.trade3.copy') },
    { key: 'trade4', name: t('trades.trade4.name'), copy: t('trades.trade4.copy') },
    { key: 'trade5', name: t('trades.trade5.name'), copy: t('trades.trade5.copy') },
    { key: 'trade6', name: t('trades.trade6.name'), copy: t('trades.trade6.copy') },
  ];

  return (
    <section className="py-24 md:py-32 bg-ops-background">
      <div className="max-w-[1400px] mx-auto px-6 md:px-10">
        <FadeInUp>
          <SectionLabel label={t('trades.sectionLabel')} />
        </FadeInUp>

        <FadeInUp delay={0.05}>
          <h2
            className="mt-4 font-heading font-bold uppercase leading-[0.95] tracking-tight text-ops-text-primary max-w-[600px]"
            style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)' }}
          >
            {t('trades.heading')}
          </h2>
        </FadeInUp>

        <FadeInUp delay={0.1}>
          <p className="mt-4 font-heading font-light text-base text-ops-text-secondary max-w-[600px]">
            {t('trades.subtext')}
          </p>
        </FadeInUp>

        {/* Trade cards — 3x2 grid */}
        <div className="mt-12 md:mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trades.map((trade, i) => {
            const slug = TRADE_SLUGS[trade.key];
            return (
              <FadeInUp key={trade.key} delay={0.1 + i * 0.06}>
                <Card hoverable className="p-8 h-full flex flex-col">
                  <h3 className="font-heading font-bold text-sm text-ops-text-primary uppercase tracking-tight">
                    {trade.name}
                  </h3>
                  <p className="mt-3 font-heading font-light text-sm text-ops-text-secondary leading-relaxed flex-1">
                    {trade.copy}
                  </p>
                  {slug && (
                    <Link
                      href={`/industries/${slug}`}
                      className="mt-4 inline-block font-caption uppercase tracking-[0.15em] text-[11px] text-ops-accent hover:text-ops-text-primary transition-colors"
                    >
                      Learn more →
                    </Link>
                  )}
                </Card>
              </FadeInUp>
            );
          })}
        </div>

        {/* Not listed CTA */}
        <FadeInUp delay={0.5}>
          <div className="mt-12 pt-10 border-t border-ops-border max-w-[600px]">
            <p className="font-heading font-light text-sm text-ops-text-secondary leading-relaxed">
              {t('trades.notListed')}
            </p>
            <Link
              href="/resources#contact"
              className="mt-3 inline-block font-caption uppercase tracking-[0.15em] text-[11px] text-ops-accent hover:text-ops-text-primary transition-colors"
            >
              {t('trades.notListedCta')}
            </Link>
          </div>
        </FadeInUp>

        {/* Internal link to full industries page */}
        <FadeInUp delay={0.55}>
          <div className="mt-8">
            <Link
              href="/industries"
              className="font-caption uppercase tracking-[0.15em] text-xs text-ops-text-secondary hover:text-ops-accent transition-colors"
            >
              See all industries →
            </Link>
          </div>
        </FadeInUp>
      </div>
    </section>
  );
}
