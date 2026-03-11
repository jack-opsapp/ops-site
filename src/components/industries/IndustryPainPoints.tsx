'use client';

import { useState, useRef, useEffect } from 'react';
import { SectionLabel, FadeInUp } from '@/components/ui';
import IndustryPainPointCard from './IndustryPainPointCard';
import type { WireframeVariant, FlowDirection } from '@/lib/industries';

interface PainPointItem {
  title: string;
  bullets: string[];
  forLine: string;
  variant: WireframeVariant;
  flowDirection: FlowDirection;
}

interface IndustryPainPointsProps {
  painPoints: PainPointItem[];
}

export default function IndustryPainPoints({ painPoints }: IndustryPainPointsProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    if (!isMobile) return;
    const observers: IntersectionObserver[] = [];
    cardRefs.current.forEach((el, index) => {
      if (!el) return;
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActiveIndex(index);
        },
        { threshold: 0.6 }
      );
      observer.observe(el);
      observers.push(observer);
    });
    return () => observers.forEach((o) => o.disconnect());
  }, [isMobile]);

  return (
    <section className="py-24 md:py-32 bg-ops-background">
      <div className="max-w-[1400px] mx-auto px-6 md:px-10">
        <FadeInUp>
          <SectionLabel label="THE PROBLEM" />
        </FadeInUp>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          {painPoints.map((point, i) => (
            <FadeInUp key={i} delay={i * 0.1}>
              <div ref={(el) => { cardRefs.current[i] = el; }}>
                <IndustryPainPointCard
                  title={point.title}
                  bullets={point.bullets}
                  forLine={point.forLine}
                  variant={point.variant}
                  flowDirection={point.flowDirection}
                  isActive={activeIndex === i}
                  onActivate={() => setActiveIndex(i)}
                  onDeactivate={() => { if (!isMobile) setActiveIndex(null); }}
                />
              </div>
            </FadeInUp>
          ))}
        </div>
      </div>
    </section>
  );
}
