/**
 * PhoneWireframeCard — Alternating text + phone visual card
 * Tracks hover state and passes isActive to PhoneWireframe and DataStream
 * Responsive: stacks on mobile with text always first
 */

'use client';

import { useState } from 'react';
import { SectionLabel, Button } from '@/components/ui';
import PhoneWireframe from '@/components/animations/PhoneWireframe';
import DataStream from '@/components/animations/DataStream';

type Variant = 'scheduling' | 'projects' | 'team';

interface PhoneWireframeCardProps {
  label: string;
  heading: string;
  body: string;
  ctaText: string;
  ctaHref: string;
  variant: Variant;
  direction: 'left' | 'right';
}

function TextSide({
  label,
  heading,
  body,
  ctaText,
  ctaHref,
}: Omit<PhoneWireframeCardProps, 'variant' | 'direction'>) {
  return (
    <div className="flex flex-col justify-center">
      <SectionLabel label={label} />
      <h3 className="mt-4 font-heading font-bold text-3xl text-ops-text-primary uppercase leading-tight">
        {heading}
      </h3>
      <p className="mt-4 font-heading font-light text-lg text-ops-text-secondary leading-relaxed">
        {body}
      </p>
      <div className="mt-8">
        <Button variant="ghost" href={ctaHref}>
          {ctaText}
        </Button>
      </div>
    </div>
  );
}

function VisualSide({
  variant,
  isActive,
}: {
  variant: Variant;
  isActive: boolean;
}) {
  return (
    <div className="relative flex items-center justify-center">
      <div className="relative w-full max-w-[220px]">
        <PhoneWireframe variant={variant} isActive={isActive} />
        <DataStream variant={variant} isActive={isActive} />
      </div>
    </div>
  );
}

export default function PhoneWireframeCard({
  label,
  heading,
  body,
  ctaText,
  ctaHref,
  variant,
  direction,
}: PhoneWireframeCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 items-center"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {direction === 'left' ? (
        <>
          {/* Text left, visual right */}
          <TextSide
            label={label}
            heading={heading}
            body={body}
            ctaText={ctaText}
            ctaHref={ctaHref}
          />
          <VisualSide variant={variant} isActive={isHovered} />
        </>
      ) : (
        <>
          {/* Visual left, text right — on mobile, text still comes first via order */}
          <div className="order-2 md:order-1">
            <VisualSide variant={variant} isActive={isHovered} />
          </div>
          <div className="order-1 md:order-2">
            <TextSide
              label={label}
              heading={heading}
              body={body}
              ctaText={ctaText}
              ctaHref={ctaHref}
            />
          </div>
        </>
      )}
    </div>
  );
}
