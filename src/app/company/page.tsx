import type { Metadata } from 'next';
import Link from 'next/link';
import CompanyHero from '@/components/company/CompanyHero';
import OriginStory from '@/components/company/OriginStory';
import Values from '@/components/company/Values';
import BottomCTA from '@/components/shared/BottomCTA';
import { FadeInUp, SectionLabel, Card } from '@/components/ui';
import { getLocale, getTDict, buildLocaleAlternates, buildLocaleUrl } from '@/i18n/server';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  return {
    title: locale === 'es' ? 'Nuestra Historia' : 'About OPS',
    description: locale === 'es'
      ? 'OPS fue creado por un contratista que escaló de $0 a $1.6M en 4 años. Probó Jobber, ServiceTitan, Housecall Pro. Construyó el suyo.'
      : 'Built by a contractor who scaled from $0 to $1.6M in 4 years. Tried Jobber, ServiceTitan, Housecall Pro. Crew refused to use them. So he built OPS.',
    openGraph: {
      url: buildLocaleUrl('/company', locale),
    },
    alternates: buildLocaleAlternates('/company', locale),
  };
}

export default async function CompanyPage() {
  const dict = await getTDict('company');
  const t = (key: string) => {
    const value = dict[key];
    return typeof value === 'string' ? value : key;
  };

  /* JSON-LD structured data — AboutPage describes this page; the
     full Organization schema lives in the root layout. Plus a
     breadcrumb trail. */
  const aboutPageLd = {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    url: 'https://opsapp.co/company',
    name: 'About OPS',
    description: 'Built by a contractor who scaled from $0 to $1.6M in 4 years. Tried Jobber, ServiceTitan, Housecall Pro. Crew refused to use them. So he built OPS.',
    mainEntity: {
      '@type': 'Organization',
      name: 'OPS',
      url: 'https://opsapp.co',
    },
  };

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://opsapp.co' },
      { '@type': 'ListItem', position: 2, name: 'Company', item: 'https://opsapp.co/company' },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutPageLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />

      <CompanyHero />
      <OriginStory />
      <Values />

      {/* Context links — addresses the audit-flagged dead-end problem on /company */}
      <section className="py-20 md:py-24 bg-ops-background border-t border-ops-border">
        <div className="max-w-[1400px] mx-auto px-6 md:px-10">
          <FadeInUp>
            <SectionLabel label="KEEP GOING" />
          </FadeInUp>
          <FadeInUp delay={0.05}>
            <h2 className="mt-4 font-heading font-bold uppercase text-ops-text-primary text-2xl md:text-3xl tracking-tight leading-[0.95] max-w-[600px]">
              MORE WHERE THAT CAME FROM.
            </h2>
          </FadeInUp>

          <div className="mt-10 md:mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            <FadeInUp delay={0.1}>
              <Link href="/journal" className="block h-full">
                <Card hoverable className="p-8 h-full flex flex-col">
                  <p className="font-caption uppercase tracking-[0.15em] text-[10px] text-ops-text-secondary">
                    Journal
                  </p>
                  <h3 className="mt-1 font-heading font-bold text-base text-ops-text-primary uppercase tracking-tight">
                    Field notes from Jack
                  </h3>
                  <p className="mt-4 font-heading font-light text-sm text-ops-text-secondary leading-relaxed flex-1">
                    Weekly writing from the founder. Crew retention, job costing, what works on the truck.
                  </p>
                  <span className="mt-5 inline-block font-caption uppercase tracking-[0.15em] text-[11px] text-ops-accent">
                    Read the journal -&gt;
                  </span>
                </Card>
              </Link>
            </FadeInUp>

            <FadeInUp delay={0.16}>
              <Link href="/platform" className="block h-full">
                <Card hoverable className="p-8 h-full flex flex-col">
                  <p className="font-caption uppercase tracking-[0.15em] text-[10px] text-ops-text-secondary">
                    Platform
                  </p>
                  <h3 className="mt-1 font-heading font-bold text-base text-ops-text-primary uppercase tracking-tight">
                    What he built
                  </h3>
                  <p className="mt-4 font-heading font-light text-sm text-ops-text-secondary leading-relaxed flex-1">
                    The product. Scheduling, photo documentation, offline mode, the lot. Built from the truck.
                  </p>
                  <span className="mt-5 inline-block font-caption uppercase tracking-[0.15em] text-[11px] text-ops-accent">
                    Tour the platform -&gt;
                  </span>
                </Card>
              </Link>
            </FadeInUp>

            <FadeInUp delay={0.22}>
              <Link href="/tools/leadership" className="block h-full">
                <Card hoverable className="p-8 h-full flex flex-col">
                  <p className="font-caption uppercase tracking-[0.15em] text-[10px] text-ops-text-secondary">
                    Tool
                  </p>
                  <h3 className="mt-1 font-heading font-bold text-base text-ops-text-primary uppercase tracking-tight">
                    Grade your leadership
                  </h3>
                  <p className="mt-4 font-heading font-light text-sm text-ops-text-secondary leading-relaxed flex-1">
                    Five-minute self-assessment for trade-business owners. Honest answers, no fluff.
                  </p>
                  <span className="mt-5 inline-block font-caption uppercase tracking-[0.15em] text-[11px] text-ops-accent">
                    Take the assessment -&gt;
                  </span>
                </Card>
              </Link>
            </FadeInUp>
          </div>
        </div>
      </section>

      <BottomCTA
        heading={t('bottomCta.heading')}
        buttonText={t('bottomCta.buttonText')}
        buttonHref="https://app.opsapp.co"
        external
        showNewsletter
        newsletterSource="company-cta"
      />
    </>
  );
}
