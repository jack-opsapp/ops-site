/**
 * DeviceShowcaseCard — Alternating text + device visual card
 *
 * Hover sequence (desktop only):
 * 1. Mouse enters → device tilts to isometric
 * 2. After 400ms → particle flow begins
 * 3. Mouse leaves → particle flow fades out
 * 4. After 600ms → device tilts back to head-on
 *
 * Mobile: static wireframes, no animation.
 */

'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
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
  isTilted,
  isFlowing,
}: {
  variant: Variant;
  device: DeviceType;
  isTilted: boolean;
  isFlowing: boolean;
}) {
  return (
    <div className="relative flex items-center justify-center overflow-visible">
      <div
        className="relative w-full overflow-visible"
        style={{ maxWidth: visualMaxWidth[device] }}
      >
        <DeviceShell device={device} variant={variant} isActive={isTilted} />
        <DataFunnel device={device} isActive={isFlowing} />
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
  const [isTilted, setIsTilted] = useState(false);
  const [isFlowing, setIsFlowing] = useState(false);
  const flowTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const tiltTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const handleMouseEnter = useCallback(() => {
    // Clear any pending untilt
    clearTimeout(tiltTimerRef.current);
    // Start tilting immediately
    setIsTilted(true);
    // Start particle flow after tilt settles
    clearTimeout(flowTimerRef.current);
    flowTimerRef.current = setTimeout(() => setIsFlowing(true), 400);
  }, []);

  const handleMouseLeave = useCallback(() => {
    // Stop flow immediately (DataFunnel fades particles over ~0.5s)
    clearTimeout(flowTimerRef.current);
    setIsFlowing(false);
    // Tilt back after particles have faded
    clearTimeout(tiltTimerRef.current);
    tiltTimerRef.current = setTimeout(() => setIsTilted(false), 600);
  }, []);

  // Cleanup timers
  useEffect(() => {
    return () => {
      clearTimeout(flowTimerRef.current);
      clearTimeout(tiltTimerRef.current);
    };
  }, []);

  return (
    <div
      className={`grid grid-cols-1 ${gridClass[device]} gap-12 md:gap-16 items-center`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
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
          <VisualSide
            variant={variant}
            device={device}
            isTilted={isTilted}
            isFlowing={isFlowing}
          />
        </>
      ) : (
        <>
          <div className="order-2 md:order-1">
            <VisualSide
              variant={variant}
              device={device}
              isTilted={isTilted}
              isFlowing={isFlowing}
            />
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
