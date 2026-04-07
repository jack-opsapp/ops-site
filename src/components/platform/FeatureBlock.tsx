'use client';

/**
 * FeatureBlock — Reusable alternating-layout feature section
 *
 * Two-column grid with text + visual placeholder,
 * wrapped in FadeInUp for scroll-triggered reveal.
 * direction='left' = text left, visual right
 * direction='right' = visual left, text right (on desktop)
 * Mobile always: text first, visual second.
 *
 * For in-development features, shows a "REQUEST EARLY ACCESS" button
 * that opens a modal to collect user details.
 */

import { useState } from 'react';
import { SectionLabel, Button, FadeInUp } from '@/components/ui';
import EarlyAccessModal from './EarlyAccessModal';

interface FeatureBlockProps {
  label: string;
  heading: string;
  body: string;
  ctaText?: string;
  ctaHref?: string;
  visual?: React.ReactNode;
  direction: 'left' | 'right';
  inDevelopment?: boolean;
}

export default function FeatureBlock({
  label,
  heading,
  body,
  ctaText,
  ctaHref,
  visual,
  direction,
  inDevelopment = false,
}: FeatureBlockProps) {
  const [showModal, setShowModal] = useState(false);
  const textOrder = direction === 'right' ? 'md:order-last' : '';
  const visualOrder = direction === 'right' ? 'md:order-first' : '';

  // Extract feature name from label (e.g. "[ PIPELINE ]" → "Pipeline")
  const featureName = label.replace(/[\[\]]/g, '').trim();

  return (
    <div className="py-20 md:py-28">
      <div className="max-w-[1400px] mx-auto px-6 md:px-10">
        <FadeInUp>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 items-center">
            {/* Text side */}
            <div className={textOrder}>
              <div className="flex items-center gap-3 mb-5">
                <SectionLabel label={label} />
                {inDevelopment && (
                  <span className="inline-block px-2.5 py-1 text-[10px] font-caption uppercase tracking-[0.15em] border border-ops-border text-ops-text-secondary rounded-sm whitespace-nowrap">
                    IN DEVELOPMENT
                  </span>
                )}
              </div>
              <h2 className="font-heading font-bold uppercase leading-[0.95] tracking-tight text-ops-text-primary text-3xl md:text-4xl">
                {heading}
              </h2>
              <p className="mt-5 font-heading font-light text-base md:text-lg text-ops-text-secondary max-w-lg leading-relaxed">
                {body}
              </p>
              {inDevelopment ? (
                <div className="mt-8">
                  <button
                    onClick={() => setShowModal(true)}
                    className="inline-flex items-center justify-center font-caption uppercase tracking-[0.15em] text-xs px-6 py-3 rounded-[3px] transition-all duration-200 cursor-pointer bg-transparent text-ops-text-primary border border-ops-border hover:border-ops-border-hover active:border-white/40"
                  >
                    REQUEST EARLY ACCESS
                  </button>
                </div>
              ) : ctaText && ctaHref ? (
                <div className="mt-8">
                  <Button variant="ghost" href={ctaHref}>
                    {ctaText}
                  </Button>
                </div>
              ) : null}
            </div>

            {/* Visual side */}
            <div className={visualOrder}>
              {visual || (
                <div className="w-full max-w-[500px] aspect-[4/3] bg-ops-surface border border-ops-border rounded-[3px]" />
              )}
            </div>
          </div>
        </FadeInUp>
      </div>

      {showModal && (
        <EarlyAccessModal
          feature={featureName}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
}
