/**
 * DeviceShowcaseCard — Alternating text + device visual card
 * Replaces PhoneWireframeCard with multi-device support.
 * Hover activates on desktop; viewport entry activates on mobile.
 */

'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { SectionLabel, Button } from '@/components/ui';
import DeviceShell from '@/components/animations/DeviceShell';
import DataFunnel from '@/components/animations/DataFunnel';

type DeviceType = 'phone' | 'laptop' | 'tablet';
type Variant = 'scheduling' | 'projects' | 'team';

interface DeviceShowcaseCardProps {
  label: string;
  heading: string;
  body: string;
  ctaText: string;
  ctaHref: string;
  variant: Variant;
  device: DeviceType;
  direction: 'left' | 'right';
}

/* ─── Grid config per device type ─── */
const gridClass: Record<DeviceType, string> = {
  phone: 'md:grid-cols-2',
  laptop: 'md:grid-cols-[1fr_1.4fr]',
  tablet: 'md:grid-cols-[1fr_1.2fr]',
};

const visualMaxWidth: Record<DeviceType, string> = {
  phone: '220px',
  laptop: '440px',
  tablet: '400px',
};

/* ─── Text side ─── */
function TextSide({
  label,
  heading,
  body,
  ctaText,
  ctaHref,
}: {
  label: string;
  heading: string;
  body: string;
  ctaText: string;
  ctaHref: string;
}) {
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

/* ─── Visual side ─── */
function VisualSide({
  variant,
  device,
  isActive,
}: {
  variant: Variant;
  device: DeviceType;
  isActive: boolean;
}) {
  return (
    <div className="relative flex items-center justify-center">
      <div className="relative w-full" style={{ maxWidth: visualMaxWidth[device] }}>
        <DeviceShell device={device} variant={variant} isActive={isActive} />
        <DataFunnel device={device} isActive={isActive} />
      </div>
    </div>
  );
}

/* ─── Main Card ─── */
export default function DeviceShowcaseCard({
  label,
  heading,
  body,
  ctaText,
  ctaHref,
  variant,
  device,
  direction,
}: DeviceShowcaseCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isInView, setIsInView] = useState(false);

  // Active when hovered (desktop) OR in viewport (mobile fallback)
  const isActive = isHovered || isInView;

  return (
    <motion.div
      className={`grid grid-cols-1 ${gridClass[device]} gap-12 md:gap-16 items-center`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onViewportEnter={() => setIsInView(true)}
      onViewportLeave={() => setIsInView(false)}
      viewport={{ amount: 0.4 }}
      style={{ willChange: isActive ? 'transform' : 'auto' }}
    >
      {direction === 'left' ? (
        <>
          <TextSide
            label={label}
            heading={heading}
            body={body}
            ctaText={ctaText}
            ctaHref={ctaHref}
          />
          <VisualSide variant={variant} device={device} isActive={isActive} />
        </>
      ) : (
        <>
          <div className="order-2 md:order-1">
            <VisualSide variant={variant} device={device} isActive={isActive} />
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
    </motion.div>
  );
}
