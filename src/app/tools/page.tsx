/**
 * Tools page — Purpose-built tools for trades professionals
 */

import type { Metadata } from 'next';
import { SectionLabel, FadeInUp } from '@/components/ui';
import ToolsHero from '@/components/tools/ToolsHero';
import ToolCard from '@/components/tools/ToolCard';
import {
  LeadershipIllustration,
  CoursesIllustration,
  SeoIllustration,
  CalculatorIllustration,
} from '@/components/tools/ToolIllustrations';
import BottomCTA from '@/components/shared/BottomCTA';
import { getLocale, getTDict } from '@/i18n/server';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  return {
    title: locale === 'es' ? 'Herramientas' : 'Tools',
    description: locale === 'es'
      ? 'Herramientas diseñadas para profesionales de los oficios. Evaluación de liderazgo, análisis SEO con IA y calculadora de estimaciones.'
      : 'Purpose-built tools for trades professionals. Leadership assessment, AI SEO analysis, and estimating calculator.',
  };
}

export default async function ToolsPage() {
  const dict = await getTDict('tools');
  const t = (key: string) => {
    const value = dict[key];
    return typeof value === 'string' ? value : key;
  };

  const tools = [
    {
      name: t('tool.leadership.name'),
      description: t('tool.leadership.description'),
      status: 'available' as const,
      href: '/tools/leadership',
      illustration: <LeadershipIllustration />,
    },
    {
      name: t('tool.courses.name'),
      description: t('tool.courses.description'),
      status: 'available' as const,
      href: 'https://learn.opsapp.co',
      external: true,
      illustration: <CoursesIllustration />,
    },
    {
      name: t('tool.seo.name'),
      description: t('tool.seo.description'),
      status: 'development' as const,
      illustration: <SeoIllustration />,
    },
    {
      name: t('tool.calculator.name'),
      description: t('tool.calculator.description'),
      status: 'development' as const,
      illustration: <CalculatorIllustration />,
    },
  ];

  return (
    <>
      <ToolsHero />

      <section className="py-16 bg-ops-background">
        <div className="max-w-[1400px] mx-auto px-6 md:px-10">
          <FadeInUp>
            <SectionLabel label={t('sectionLabel')} className="mb-10" />
          </FadeInUp>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {tools.map((tool, index) => (
              <FadeInUp key={tool.name} delay={index * 0.08}>
                <ToolCard
                  name={tool.name}
                  description={tool.description}
                  status={tool.status}
                  href={'href' in tool ? tool.href : undefined}
                  external={'external' in tool && tool.external ? true : undefined}
                  illustration={tool.illustration}
                  statusLabels={{
                    available: t('status.available'),
                    development: t('status.development'),
                  }}
                  ctaLabels={{
                    tryIt: t('cta.tryIt'),
                    explore: t('cta.explore'),
                  }}
                />
              </FadeInUp>
            ))}
          </div>
        </div>
      </section>

      <BottomCTA
        heading={t('bottomCta.heading')}
        buttonText={t('bottomCta.buttonText')}
        buttonHref="/platform"
      />
    </>
  );
}
