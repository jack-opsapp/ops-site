/**
 * FeatureBlock — Reusable alternating-layout feature section
 *
 * Server component. Two-column grid with text + visual placeholder,
 * wrapped in FadeInUp for scroll-triggered reveal.
 * direction='left' = text left, visual right
 * direction='right' = visual left, text right (on desktop)
 * Mobile always: text first, visual second.
 */

import { SectionLabel, Button, FadeInUp } from '@/components/ui';

interface FeatureBlockProps {
  label: string;
  heading: string;
  body: string;
  ctaText?: string;
  ctaHref?: string;
  visual?: React.ReactNode;
  direction: 'left' | 'right';
}

export default function FeatureBlock({
  label,
  heading,
  body,
  ctaText,
  ctaHref,
  visual,
  direction,
}: FeatureBlockProps) {
  const textOrder = direction === 'right' ? 'md:order-last' : '';
  const visualOrder = direction === 'right' ? 'md:order-first' : '';

  return (
    <div className="py-20 md:py-28">
      <div className="max-w-[1400px] mx-auto px-6 md:px-10">
        <FadeInUp>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 items-center">
            {/* Text side */}
            <div className={textOrder}>
              <SectionLabel label={label} className="mb-5" />
              <h2 className="font-heading font-bold uppercase leading-[0.95] tracking-tight text-ops-text-primary text-3xl md:text-4xl">
                {heading}
              </h2>
              <p className="mt-5 font-heading font-light text-base md:text-lg text-ops-text-secondary max-w-lg leading-relaxed">
                {body}
              </p>
              {ctaText && ctaHref && (
                <div className="mt-8">
                  <Button variant="ghost" href={ctaHref}>
                    {ctaText}
                  </Button>
                </div>
              )}
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
    </div>
  );
}
