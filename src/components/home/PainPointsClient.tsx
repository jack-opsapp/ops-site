'use client';

/**
 * PainPointsClient — Client-side wrapper for pain-point cards
 *
 * Desktop: hover cards with FadeInUp animations (same as before)
 * Mobile: compact 3-button grid with AnimatePresence expandable details
 *         (ported from try-ops PainSection)
 */

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FadeInUp } from '@/components/ui';
import PainPointCard from './PainPointCard';
import WireframeIllustration from '@/components/animations/WireframeIllustration';

export interface PainPointData {
  title: string;
  bullets: string[];
  forLine: string;
  variant: 'messages' | 'dashboard' | 'apps';
}

interface PainPointsClientProps {
  painPoints: PainPointData[];
  resolution: string;
}

export default function PainPointsClient({ painPoints, resolution }: PainPointsClientProps) {
  const [activeCard, setActiveCard] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hasAutoExpanded = useRef(false);

  // Auto-expand first card on mobile when section enters viewport
  useEffect(() => {
    if (typeof window === 'undefined' || window.innerWidth >= 768) return;
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAutoExpanded.current) {
          hasAutoExpanded.current = true;
          setActiveCard(painPoints[0].variant);
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(container);
    return () => observer.disconnect();
  }, [painPoints]);

  return (
    <div ref={containerRef}>
      {/* Mobile: compact icon grid + expandable details */}
      <div className="md:hidden mt-12">
        <div className="grid grid-cols-3 gap-3 mb-6">
          {painPoints.map((point) => {
            const isActive = activeCard === point.variant;
            return (
              <button
                key={point.variant}
                onClick={() => setActiveCard(isActive ? null : point.variant)}
                className={`flex flex-col items-center p-3 rounded-[3px] border transition-all duration-300 ${
                  isActive
                    ? 'border-ops-border-hover bg-ops-surface'
                    : 'border-ops-border bg-ops-surface/50'
                }`}
              >
                <WireframeIllustration variant={point.variant} isActive={isActive} size={48} />
                <span className="font-heading font-medium text-[11px] uppercase text-ops-text-secondary mt-2 text-center leading-tight">
                  {point.title}
                </span>
              </button>
            );
          })}
        </div>

        {/* Expanded card details */}
        <AnimatePresence mode="wait">
          {activeCard && (
            <motion.div
              key={activeCard}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="overflow-hidden"
            >
              {painPoints
                .filter((p) => p.variant === activeCard)
                .map((point) => (
                  <div
                    key={point.variant}
                    className="bg-ops-surface border border-ops-border rounded-[3px] p-6"
                  >
                    <ul className="font-heading font-light text-sm text-ops-text-secondary leading-relaxed space-y-1 mb-3">
                      {point.bullets.map((bullet, i) => (
                        <li key={i}>&bull; {bullet}</li>
                      ))}
                    </ul>
                    <p className="font-caption text-[12px] text-ops-text-secondary italic">
                      {point.forLine}
                    </p>
                  </div>
                ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Desktop: full hover cards in grid */}
      <div className="hidden md:grid md:grid-cols-3 md:gap-6 mt-12">
        {painPoints.map((point, i) => (
          <FadeInUp key={point.variant} delay={i * 0.1}>
            <PainPointCard
              title={point.title}
              bullets={point.bullets}
              forLine={point.forLine}
              variant={point.variant}
            />
          </FadeInUp>
        ))}
      </div>

      {/* Resolution callout */}
      <FadeInUp delay={0.3}>
        <div className="border-t-2 border-ops-border pt-6 mt-16 max-w-[700px]">
          <p className="font-heading font-light text-lg text-ops-text-primary leading-relaxed">
            {resolution}
          </p>
        </div>
      </FadeInUp>
    </div>
  );
}
