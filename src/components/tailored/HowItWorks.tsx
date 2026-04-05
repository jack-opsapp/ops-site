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
      <div>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease }}
          viewport={{ once: true, amount: 0.3 }}
        >
          <SectionLabel label={sectionLabel} className="mb-12" />
        </motion.div>

        <div>
          <div className="max-w-[640px] flex flex-col gap-6">
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

        </div>
      </div>
    </section>
  );
}
