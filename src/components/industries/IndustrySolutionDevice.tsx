'use client';

import { useRef, useState, useCallback, useEffect } from 'react';
import CardParticleFlow from '@/components/animations/CardParticleFlow';
import type { DeviceType, FlowDirection } from '@/lib/industries';

interface IndustrySolutionDeviceProps {
  deviceType: DeviceType;
  flowDirection: FlowDirection;
}

const MAX_TILT = 6;

/* ─── Static wireframe screen content ─── */
function ScreenContent({ deviceType }: { deviceType: DeviceType }) {
  return (
    <div className="absolute inset-0 p-3 flex flex-col gap-2 opacity-30">
      {/* Top bar */}
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 rounded-[3px] border border-white/20" />
        <div className="flex-1 h-2 bg-white/10 rounded-full" />
        <div className="w-6 h-2 bg-white/10 rounded-full" />
      </div>

      {deviceType === 'phone' && (
        <>
          <div className="h-px bg-white/5 my-1" />
          <div className="flex-1 flex flex-col gap-2.5">
            {[0, 1, 2, 3].map((j) => (
              <div key={j} className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-[3px] border border-white/10 shrink-0" />
                <div className="flex-1 flex flex-col gap-1">
                  <div className="h-1.5 bg-white/8 rounded-full" style={{ width: `${60 + j * 10}%` }} />
                  <div className="h-1 bg-white/5 rounded-full w-3/4" />
                </div>
              </div>
            ))}
          </div>
          <div className="flex gap-2 mt-auto">
            {[0, 1, 2, 3].map((j) => (
              <div key={j} className="flex-1 h-6 flex flex-col items-center justify-center gap-0.5">
                <div className="w-3 h-3 rounded-[2px] border border-white/10" />
                <div className="w-full h-0.5 bg-white/5 rounded-full" />
              </div>
            ))}
          </div>
        </>
      )}

      {deviceType === 'laptop' && (
        <>
          <div className="h-px bg-white/5 my-0.5" />
          <div className="flex-1 flex gap-2">
            <div className="w-1/4 flex flex-col gap-2">
              {[0, 1, 2, 3, 4].map((j) => (
                <div key={j} className="h-1.5 bg-white/8 rounded-full" style={{ width: `${70 + j * 5}%` }} />
              ))}
            </div>
            <div className="flex-1 flex flex-col gap-2">
              <div className="flex gap-2">
                {[0, 1, 2].map((j) => (
                  <div key={j} className="flex-1 aspect-[4/3] rounded-[2px] border border-white/8" />
                ))}
              </div>
              <div className="flex-1 rounded-[2px] border border-white/6" />
            </div>
          </div>
        </>
      )}

      {deviceType === 'tablet' && (
        <>
          <div className="h-px bg-white/5 my-1" />
          <div className="flex-1 flex flex-col gap-2">
            <div className="flex gap-2">
              {[0, 1].map((j) => (
                <div key={j} className="flex-1 aspect-[3/2] rounded-[2px] border border-white/8" />
              ))}
            </div>
            {[0, 1, 2].map((j) => (
              <div key={j} className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-[3px] border border-white/10 shrink-0" />
                <div className="flex-1 flex flex-col gap-0.5">
                  <div className="h-1.5 bg-white/8 rounded-full" style={{ width: `${55 + j * 15}%` }} />
                  <div className="h-1 bg-white/5 rounded-full w-2/3" />
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {deviceType === 'desktop' && (
        <>
          <div className="h-px bg-white/5 my-0.5" />
          <div className="flex-1 flex gap-3">
            <div className="w-[18%] flex flex-col gap-1.5">
              {[0, 1, 2, 3, 4, 5].map((j) => (
                <div key={j} className="h-1 bg-white/8 rounded-full" style={{ width: `${65 + j * 5}%` }} />
              ))}
            </div>
            <div className="flex-1 flex flex-col gap-2">
              <div className="flex gap-2">
                {[0, 1, 2, 3].map((j) => (
                  <div key={j} className="flex-1 aspect-square rounded-[2px] border border-white/8 flex items-center justify-center">
                    <div className="w-1/2 h-1 bg-white/6 rounded-full" />
                  </div>
                ))}
              </div>
              <div className="flex-1 rounded-[2px] border border-white/6 flex items-end p-1.5">
                <div className="flex gap-1 items-end w-full">
                  {[40, 65, 30, 80, 55, 70, 45].map((h, j) => (
                    <div key={j} className="flex-1 bg-white/6 rounded-t-[1px]" style={{ height: `${h}%` }} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

/* ─── Device frames ─── */

function PhoneFrame({ isActive, children }: { isActive: boolean; children: React.ReactNode }) {
  return (
    <div className={`
      relative overflow-hidden rounded-[24px] border-2 bg-[#111111]
      aspect-[9/17] w-full max-w-[240px] mx-auto
      transition-colors duration-200
      ${isActive ? 'border-ops-accent/40' : 'border-ops-border'}
    `}>
      <div className="absolute top-0 inset-x-0 h-6 bg-[#111111] z-20 flex items-center justify-center">
        <div className="w-16 h-[4px] bg-[#1a1a1a] rounded-full" />
      </div>
      <div className="absolute inset-2.5 top-7 bottom-3 rounded-[8px] overflow-hidden bg-ops-background/60 z-10">
        {children}
      </div>
      <div className="absolute bottom-1 inset-x-0 flex items-center justify-center z-20">
        <div className="w-20 h-[3px] bg-[#222222] rounded-full" />
      </div>
    </div>
  );
}

function LaptopFrame({ isActive, children }: { isActive: boolean; children: React.ReactNode }) {
  return (
    <div className="w-full max-w-[480px] mx-auto">
      <div className={`
        relative overflow-hidden rounded-t-[8px] border-2 bg-[#111111]
        aspect-[16/10]
        transition-colors duration-200
        ${isActive ? 'border-ops-accent/40' : 'border-ops-border'}
      `}>
        <div className="absolute top-0 inset-x-0 h-3 bg-[#111111] z-20 flex items-center justify-center">
          <div className="w-2 h-2 rounded-full border border-[#222]" />
        </div>
        <div className="absolute inset-1.5 top-4 bottom-1.5 rounded-[3px] overflow-hidden bg-ops-background/60 z-10">
          {children}
        </div>
      </div>
      <div className={`
        h-3 rounded-b-[4px] border-x-2 border-b-2
        bg-[#0a0a0a] transition-colors duration-200
        ${isActive ? 'border-ops-accent/40' : 'border-ops-border'}
      `}>
        <div className="w-16 h-1 bg-[#151515] rounded-full mx-auto mt-0.5" />
      </div>
    </div>
  );
}

function TabletFrame({ isActive, children }: { isActive: boolean; children: React.ReactNode }) {
  return (
    <div className={`
      relative overflow-hidden rounded-[16px] border-2 bg-[#111111]
      aspect-[3/4] w-full max-w-[320px] mx-auto
      transition-colors duration-200
      ${isActive ? 'border-ops-accent/40' : 'border-ops-border'}
    `}>
      <div className="absolute inset-2.5 rounded-[6px] overflow-hidden bg-ops-background/60 z-10">
        {children}
      </div>
    </div>
  );
}

function DesktopFrame({ isActive, children }: { isActive: boolean; children: React.ReactNode }) {
  return (
    <div className="w-full max-w-[520px] mx-auto">
      <div className={`
        relative overflow-hidden rounded-[6px] border-2 bg-[#111111]
        aspect-[16/9]
        transition-colors duration-200
        ${isActive ? 'border-ops-accent/40' : 'border-ops-border'}
      `}>
        <div className="absolute inset-1.5 rounded-[2px] overflow-hidden bg-ops-background/60 z-10">
          {children}
        </div>
      </div>
      <div className={`
        w-10 h-8 mx-auto border-x-2 bg-[#0a0a0a]
        transition-colors duration-200
        ${isActive ? 'border-ops-accent/40' : 'border-ops-border'}
      `} />
      <div className={`
        w-28 h-1.5 mx-auto rounded-b-full border-x-2 border-b-2 bg-[#0a0a0a]
        transition-colors duration-200
        ${isActive ? 'border-ops-accent/40' : 'border-ops-border'}
      `} />
    </div>
  );
}

const FRAMES = {
  phone: PhoneFrame,
  laptop: LaptopFrame,
  tablet: TabletFrame,
  desktop: DesktopFrame,
} as const;

/* ─── Main component ─── */

export default function IndustrySolutionDevice({ deviceType, flowDirection }: IndustrySolutionDeviceProps) {
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

  useEffect(() => {
    if (!isMobile) return;
    const el = deviceRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setIsActive(entry.isIntersecting),
      { threshold: 0.4 },
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
  const Frame = FRAMES[deviceType];

  return (
    <div
      ref={deviceRef}
      className="relative w-full"
      style={{ perspective: '1000px' }}
      onMouseEnter={handleMouseEnter}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Particle flow — extends well beyond the device */}
      <div className="absolute pointer-events-none z-0" style={{ inset: '-100px' }}>
        <CardParticleFlow flowDirection={flowDirection} isActive={isActive} />
      </div>

      {/* Device with tilt */}
      <div
        className="relative z-10"
        style={{
          transform: `rotateX(${activeTilt.rotateX}deg) rotateY(${activeTilt.rotateY}deg)`,
          transition: isActive ? 'transform 0.2s ease-out' : 'transform 0.3s ease-out',
          transformStyle: 'preserve-3d',
        }}
      >
        <Frame isActive={isActive}>
          <ScreenContent deviceType={deviceType} />
        </Frame>
      </div>
    </div>
  );
}
