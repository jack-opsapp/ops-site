'use client';

import { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { theme } from '@/lib/theme';
import { SectionLabel } from '@/components/ui';

const ease = theme.animation.easing as [number, number, number, number];

interface Step {
  number: string;
  title: string;
  desc: string;
}

interface HowItWorksProps {
  sectionLabel: string;
  steps: Step[];
  onActiveStepChange?: (step: number) => void;
}

export default function HowItWorks({
  sectionLabel,
  steps,
  onActiveStepChange,
}: HowItWorksProps) {
  const [activeStep, setActiveStep] = useState(0);
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const observers: IntersectionObserver[] = [];

    stepRefs.current.forEach((ref, index) => {
      if (!ref) return;
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setActiveStep(index);
            onActiveStepChange?.(index);
          }
        },
        { threshold: 0.6, rootMargin: '-10% 0px -40% 0px' }
      );
      observer.observe(ref);
      observers.push(observer);
    });

    return () => observers.forEach((o) => o.disconnect());
  }, [onActiveStepChange]);

  return (
    <section id="process" className="py-24 md:py-32 bg-ops-background">
      <div className="max-w-[1400px] mx-auto px-6 sm:px-10 md:px-16 lg:px-24">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease }}
          viewport={{ once: true, amount: 0.3 }}
        >
          <SectionLabel label={sectionLabel} className="mb-12" />
        </motion.div>

        <div className="flex gap-16 lg:gap-24">
          {/* Left: Steps */}
          <div className="flex-1 max-w-[640px] flex flex-col gap-6">
            {steps.map((step, index) => {
              const isActive = index === activeStep;
              return (
                <motion.div
                  key={step.number}
                  ref={(el) => { stepRefs.current[index] = el; }}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.08, ease }}
                  viewport={{ once: true, amount: 0.3 }}
                  className={`
                    p-6 rounded-[3px] transition-all duration-300
                    border-l-2
                    ${isActive
                      ? 'border-l-ops-accent bg-ops-surface-elevated/50 opacity-100'
                      : 'border-l-transparent opacity-50'
                    }
                  `}
                >
                  <span className="font-caption text-ops-accent text-xs tracking-[0.15em]">
                    {step.number}
                  </span>
                  <h3 className="font-heading font-semibold text-lg text-ops-text-primary mt-2">
                    {step.title}
                  </h3>
                  <p className="font-heading font-light text-sm text-ops-text-secondary mt-2 leading-relaxed">
                    {step.desc}
                  </p>
                </motion.div>
              );
            })}
          </div>

          {/* Right: Phone placeholder — Phase B */}
          <div className="hidden lg:block w-[280px] flex-shrink-0">
            {/* 3D phone will be sticky here in Phase B */}
          </div>
        </div>
      </div>
    </section>
  );
}
