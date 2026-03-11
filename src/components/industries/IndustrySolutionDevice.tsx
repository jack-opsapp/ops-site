'use client';

import { useRef, useState, useCallback, useEffect } from 'react';
import CardParticleFlow from '@/components/animations/CardParticleFlow';
import WireframeIllustration from '@/components/animations/WireframeIllustration';
import type { WireframeVariant, FlowDirection } from '@/lib/industries';

interface IndustrySolutionDeviceProps {
  variant: WireframeVariant;
  flowDirection: FlowDirection;
}

const MAX_TILT = 6;

export default function IndustrySolutionDevice({ variant, flowDirection }: IndustrySolutionDeviceProps) {
  const deviceRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0 });
  const [isActive, setIsActive] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // Mobile: IntersectionObserver
  useEffect(() => {
    if (!isMobile) return;
    const el = deviceRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setIsActive(entry.isIntersecting),
      { threshold: 0.6 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [isMobile]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const el = deviceRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    setTilt({
      rotateX: (0.5 - y) * MAX_TILT * 2,
      rotateY: (x - 0.5) * MAX_TILT * 2,
    });
  }, []);

  const handleMouseEnter = useCallback(() => setIsActive(true), []);

  const handleMouseLeave = useCallback(() => {
    if (!isMobile) {
      setIsActive(false);
      setTilt({ rotateX: 0, rotateY: 0 });
    }
  }, [isMobile]);

  const mobileTilt = isMobile && isActive
    ? { rotateX: 2, rotateY: -3 }
    : { rotateX: 0, rotateY: 0 };

  const activeTilt = isMobile ? mobileTilt : tilt;

  return (
    <div
      ref={deviceRef}
      className="w-full max-w-[400px] mx-auto"
      style={{ perspective: '800px' }}
      onMouseEnter={handleMouseEnter}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Device frame — phone aspect ratio */}
      <div
        className="relative"
        style={{
          transform: `rotateX(${activeTilt.rotateX}deg) rotateY(${activeTilt.rotateY}deg)`,
          transition: isActive ? 'transform 0.2s ease-out' : 'transform 0.3s ease-out',
          transformStyle: 'preserve-3d',
        }}
      >
        {/* Outer phone body */}
        <div className={`
          relative overflow-hidden rounded-[24px] border-2
          bg-[#111111] aspect-[9/16] max-h-[520px]
          transition-colors duration-200
          ${isActive ? 'border-ops-accent/40' : 'border-ops-border'}
        `}>
          {/* Top notch/speaker bar */}
          <div className="absolute top-0 inset-x-0 h-7 bg-[#111111] z-20 flex items-center justify-center">
            <div className="w-20 h-[5px] bg-[#1a1a1a] rounded-full" />
          </div>

          {/* Screen area */}
          <div className="absolute inset-3 top-8 bottom-4 rounded-[8px] overflow-hidden bg-ops-background/80">
            {/* Particle flow layer */}
            <div className="absolute inset-0 pointer-events-none z-10">
              <CardParticleFlow flowDirection={flowDirection} isActive={isActive} />
            </div>

            {/* Wireframe illustration centered on screen */}
            <div className="absolute inset-0 flex items-center justify-center z-0">
              <WireframeIllustration variant={variant} isActive={isActive} size={160} />
            </div>

            {/* Subtle scan line effect when active */}
            <div
              className={`absolute inset-0 pointer-events-none z-20 transition-opacity duration-300 ${isActive ? 'opacity-100' : 'opacity-0'}`}
              style={{
                background: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(89,119,148,0.015) 3px, rgba(89,119,148,0.015) 4px)',
              }}
            />
          </div>

          {/* Bottom home indicator */}
          <div className="absolute bottom-1.5 inset-x-0 flex items-center justify-center z-20">
            <div className="w-28 h-[4px] bg-[#222222] rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
