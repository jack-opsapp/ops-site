'use client';

import { SectionLabel, FadeInUp } from '@/components/ui';
import IndustrySolutionDevice from './IndustrySolutionDevice';
import type { DeviceType, FlowDirection } from '@/lib/industries';

interface SolutionItem {
  title: string;
  copy: string;
  painPointRef: number;
  deviceType: DeviceType;
  flowDirection: FlowDirection;
}

interface IndustrySolutionsProps {
  solutions: SolutionItem[];
}

export default function IndustrySolutions({ solutions }: IndustrySolutionsProps) {
  return (
    <section className="py-24 md:py-32 bg-ops-background">
      <div className="max-w-[1400px] mx-auto px-6 md:px-10">
        <FadeInUp>
          <SectionLabel label="THE SOLUTION" className="mb-5" />
          <h2
            className="font-heading font-bold uppercase leading-[0.95] tracking-tight text-ops-text-primary max-w-[700px]"
            style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)' }}
          >
            HOW OPS HANDLES IT
          </h2>
        </FadeInUp>

        <div className="mt-16 md:mt-20 space-y-20 md:space-y-28">
          {solutions.map((solution, i) => {
            const direction = i % 2 === 0 ? 'left' : 'right';
            const textOrder = direction === 'right' ? 'md:order-last' : '';

            return (
              <FadeInUp key={i} delay={0.05}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 items-center">
                  <div className={textOrder}>
                    <p className="font-caption text-ops-accent uppercase tracking-[0.15em] text-xs mb-3">
                      [ {String(i + 1).padStart(2, '0')} ]
                    </p>
                    <h3 className="font-heading font-bold uppercase leading-[0.95] tracking-tight text-ops-text-primary text-2xl md:text-3xl">
                      {solution.title}
                    </h3>
                    <p className="mt-4 font-heading font-light text-base md:text-lg text-ops-text-secondary max-w-lg leading-relaxed">
                      {solution.copy}
                    </p>
                  </div>
                  <div className={direction === 'right' ? 'md:order-first' : ''}>
                    <IndustrySolutionDevice
                      deviceType={solution.deviceType}
                      flowDirection={solution.flowDirection}
                    />
                  </div>
                </div>
              </FadeInUp>
            );
          })}
        </div>
      </div>
    </section>
  );
}
