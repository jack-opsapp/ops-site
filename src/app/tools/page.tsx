/**
 * Tools page — Purpose-built tools for trades professionals
 *
 * Three tool cards (Leadership Assessment, AI SEO Analysis, Estimating Calculator)
 * with animated wireframe illustrations and bottom CTA.
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

export const metadata: Metadata = {
  title: 'Tools',
  description:
    'Purpose-built tools for trades professionals. Leadership assessment, AI SEO analysis, and estimating calculator.',
};

const tools = [
  {
    name: 'LEADERSHIP ASSESSMENT',
    description:
      'Evaluate leadership aptitude and team dynamics. Built on research from construction industry management.',
    status: 'available' as const,
    href: '/tools/leadership',
    illustration: <LeadershipIllustration />,
  },
  {
    name: 'COURSES',
    description:
      'Practical, no-fluff courses built for trades professionals. Pricing, estimating, leadership, and more.',
    status: 'available' as const,
    href: 'https://learn.opsapp.co',
    external: true,
    illustration: <CoursesIllustration />,
  },
  {
    name: 'AI SEO ANALYSIS',
    description:
      'Analyze your web presence against competitors. Get actionable recommendations for local search dominance.',
    status: 'development' as const,
    illustration: <SeoIllustration />,
  },
  {
    name: 'ESTIMATING CALCULATOR',
    description:
      'Quick material and labor estimates from your phone. Built for the way trades actually price jobs.',
    status: 'development' as const,
    illustration: <CalculatorIllustration />,
  },
];

export default function ToolsPage() {
  return (
    <>
      <ToolsHero />

      {/* Tool cards */}
      <section className="py-16 bg-ops-background">
        <div className="max-w-[1400px] mx-auto px-6 md:px-10">
          <FadeInUp>
            <SectionLabel label="TOOLS" className="mb-10" />
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
                />
              </FadeInUp>
            ))}
          </div>
        </div>
      </section>

      <BottomCTA
        heading="EXPLORE THE PLATFORM"
        buttonText="SEE PLATFORM"
        buttonHref="/platform"
      />
    </>
  );
}
