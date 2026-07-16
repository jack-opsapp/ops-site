'use client';

/**
 * SpecPhoneWrapper — Sticky phone scene for /spec page.
 *
 * Dynamically imports the R3F scene (no SSR). Accepts phase and tier
 * props for scroll-driven screen transitions. Sticky positioned within
 * a parent container that spans How It Works → Packages sections.
 *
 * Hidden on mobile (<lg) — no Three.js loaded at all.
 */

import { useRef, useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import type { SpecPhase, SpecTierId } from './constants';

const SpecPhoneScene = dynamic(() => import('./SpecPhoneScene'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center">
      <div className="w-24 h-48 rounded-2xl border border-white/[0.06] animate-pulse" />
    </div>
  ),
});

interface SpecPhoneWrapperProps {
  phase: SpecPhase;
  tier: SpecTierId | null;
  isInHero: boolean;
}

export default function SpecPhoneWrapper({ phase, tier, isInHero }: SpecPhoneWrapperProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1024);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.1 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  if (isMobile) return null;

  return (
    <div
      ref={containerRef}
      className="w-full h-full"
    >
      <SpecPhoneScene isVisible={isVisible} phase={phase} tier={tier} isInHero={isInHero} />
    </div>
  );
}
