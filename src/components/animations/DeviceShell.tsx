/**
 * DeviceShell — SVG shells for Phone, Laptop, and Tablet devices
 * Each includes variant-specific wireframe content and 3D perspective tilt.
 * Respects prefers-reduced-motion via Framer Motion's useReducedMotion.
 */

'use client';

import { motion, useReducedMotion } from 'framer-motion';

type DeviceType = 'phone' | 'laptop' | 'tablet';
type Variant = 'scheduling' | 'projects' | 'team';

interface DeviceShellProps {
  device: DeviceType;
  variant: Variant;
  isActive: boolean;
}

/* ─── Screen bounds exported for DataFunnel positioning ─── */
export const screenBounds: Record<
  DeviceType,
  { left: number; right: number; top: number; bottom: number }
> = {
  phone: { left: 12, right: 208, top: 48, bottom: 380 },
  laptop: { left: 20, right: 500, top: 16, bottom: 272 },
  tablet: { left: 16, right: 464, top: 16, bottom: 324 },
};

/* ─── Wireframe Content ─── */

function SchedulingWireframe() {
  return (
    <g>
      <rect x="30" y="60" width="160" height="1" rx="0.5" fill="currentColor" opacity="0.3" />
      <rect x="30" y="72" width="40" height="4" rx="1" fill="currentColor" opacity="0.2" />

      <text x="30" y="102" fontSize="5" fill="currentColor" opacity="0.15" fontFamily="monospace">8:00</text>
      <text x="30" y="142" fontSize="5" fill="currentColor" opacity="0.15" fontFamily="monospace">9:00</text>
      <text x="30" y="182" fontSize="5" fill="currentColor" opacity="0.15" fontFamily="monospace">10:00</text>
      <text x="30" y="222" fontSize="5" fill="currentColor" opacity="0.15" fontFamily="monospace">11:00</text>
      <text x="30" y="262" fontSize="5" fill="currentColor" opacity="0.15" fontFamily="monospace">12:00</text>
      <text x="30" y="302" fontSize="5" fill="currentColor" opacity="0.15" fontFamily="monospace">1:00</text>
      <text x="30" y="342" fontSize="5" fill="currentColor" opacity="0.15" fontFamily="monospace">2:00</text>

      {[100, 140, 180, 220, 260, 300, 340].map((y) => (
        <line key={y} x1="50" y1={y} x2="190" y2={y} stroke="currentColor" strokeWidth="0.5" opacity="0.08" />
      ))}

      <rect x="54" y="100" width="132" height="36" rx="2" stroke="currentColor" strokeWidth="1" fill="currentColor" opacity="0.06" />
      <rect x="58" y="106" width="50" height="3" rx="1" fill="currentColor" opacity="0.2" />
      <rect x="58" y="112" width="30" height="3" rx="1" fill="currentColor" opacity="0.12" />
      <rect x="58" y="120" width="70" height="3" rx="1" fill="currentColor" opacity="0.1" />

      <rect x="54" y="180" width="132" height="56" rx="2" stroke="currentColor" strokeWidth="1" fill="currentColor" opacity="0.06" />
      <rect x="58" y="186" width="60" height="3" rx="1" fill="currentColor" opacity="0.2" />
      <rect x="58" y="192" width="35" height="3" rx="1" fill="currentColor" opacity="0.12" />
      <rect x="58" y="200" width="80" height="3" rx="1" fill="currentColor" opacity="0.1" />
      <rect x="58" y="208" width="45" height="3" rx="1" fill="currentColor" opacity="0.1" />

      <rect x="54" y="300" width="132" height="36" rx="2" stroke="currentColor" strokeWidth="1" fill="currentColor" opacity="0.06" />
      <rect x="58" y="306" width="55" height="3" rx="1" fill="currentColor" opacity="0.2" />
      <rect x="58" y="312" width="28" height="3" rx="1" fill="currentColor" opacity="0.12" />
    </g>
  );
}

function LaptopProjectsWireframe() {
  return (
    <g>
      {/* Sidebar */}
      <rect x="20" y="16" width="140" height="256" rx="2" fill="currentColor" opacity="0.03" />
      <line x1="160" y1="16" x2="160" y2="272" stroke="currentColor" strokeWidth="0.5" opacity="0.12" />

      <rect x="30" y="28" width="60" height="5" rx="1.5" fill="currentColor" opacity="0.25" />
      <rect x="30" y="38" width="40" height="3" rx="1" fill="currentColor" opacity="0.12" />

      {/* Sidebar project rows */}
      {[56, 82, 108, 134, 160, 186].map((y, i) => (
        <g key={y}>
          <rect x="28" y={y} width="120" height="20" rx="2" fill="currentColor" opacity={i === 0 ? 0.08 : 0.03} />
          <rect x="34" y={y + 4} width={50 + (i % 3) * 15} height="4" rx="1" fill="currentColor" opacity={i === 0 ? 0.3 : 0.18} />
          <rect x="34" y={y + 11} width={30 + (i % 2) * 12} height="3" rx="1" fill="currentColor" opacity="0.1" />
        </g>
      ))}

      {/* Main area */}
      <rect x="176" y="28" width="100" height="6" rx="2" fill="currentColor" opacity="0.28" />
      <rect x="176" y="40" width="60" height="3" rx="1" fill="currentColor" opacity="0.12" />

      {/* Progress bar */}
      <rect x="176" y="54" width="306" height="5" rx="2.5" fill="currentColor" opacity="0.07" />
      <rect x="176" y="54" width="210" height="5" rx="2.5" fill="currentColor" opacity="0.2" />

      <rect x="176" y="74" width="45" height="4" rx="1" fill="currentColor" opacity="0.18" />

      {/* Task rows */}
      {[88, 110, 132, 154].map((y, i) => (
        <g key={y}>
          <rect x="176" y={y} width="306" height="18" rx="2" stroke="currentColor" strokeWidth="0.5" fill="currentColor" opacity="0.03" />
          <circle cx="188" cy={y + 9} r="3" stroke="currentColor" strokeWidth="0.5" fill="none" opacity="0.2" />
          <rect x="196" y={y + 5} width={70 + (i % 3) * 20} height="4" rx="1" fill="currentColor" opacity="0.2" />
          <rect x="196" y={y + 11} width={40 + (i % 2) * 15} height="3" rx="1" fill="currentColor" opacity="0.1" />
          <circle cx={460 - i * 2} cy={y + 9} r="5" stroke="currentColor" strokeWidth="0.5" fill="currentColor" opacity="0.06" />
          <circle cx={472 - i * 2} cy={y + 9} r="5" stroke="currentColor" strokeWidth="0.5" fill="currentColor" opacity="0.06" />
        </g>
      ))}

      {/* Status tags */}
      <rect x="176" y="184" width="35" height="12" rx="3" stroke="currentColor" strokeWidth="0.5" fill="currentColor" opacity="0.06" />
      <rect x="180" y="188" width="27" height="3" rx="1" fill="currentColor" opacity="0.15" />
      <rect x="220" y="184" width="42" height="12" rx="3" stroke="currentColor" strokeWidth="0.5" fill="currentColor" opacity="0.06" />
      <rect x="224" y="188" width="34" height="3" rx="1" fill="currentColor" opacity="0.15" />

      {/* Notes */}
      <rect x="176" y="210" width="40" height="4" rx="1" fill="currentColor" opacity="0.16" />
      <rect x="176" y="220" width="280" height="3" rx="1" fill="currentColor" opacity="0.08" />
      <rect x="176" y="228" width="240" height="3" rx="1" fill="currentColor" opacity="0.08" />
      <rect x="176" y="236" width="200" height="3" rx="1" fill="currentColor" opacity="0.08" />
    </g>
  );
}

function TabletTeamWireframe() {
  return (
    <g>
      {/* Left panel */}
      <rect x="16" y="16" width="200" height="308" rx="2" fill="currentColor" opacity="0.02" />
      <line x1="216" y1="20" x2="216" y2="320" stroke="currentColor" strokeWidth="0.5" opacity="0.1" />
      <rect x="26" y="28" width="50" height="5" rx="1.5" fill="currentColor" opacity="0.25" />

      {/* Team rows */}
      {[50, 92, 134, 176, 218, 260].map((y, i) => (
        <g key={y}>
          <circle cx="44" cy={y + 16} r="12" stroke="currentColor" strokeWidth="0.8" fill="currentColor" opacity="0.06" />
          <rect x="62" y={y + 8} width={50 + (i % 3) * 12} height="4" rx="1" fill="currentColor" opacity="0.22" />
          <rect x="62" y={y + 16} width={35 + (i % 2) * 10} height="3" rx="1" fill="currentColor" opacity="0.1" />
          <circle cx="198" cy={y + 14} r="3" fill="currentColor" opacity={i < 4 ? 0.25 : 0.1} />
          {i < 5 && (
            <line x1="26" y1={y + 38} x2="206" y2={y + 38} stroke="currentColor" strokeWidth="0.5" opacity="0.06" />
          )}
        </g>
      ))}

      {/* Right panel: Map */}
      <rect x="226" y="28" width="226" height="290" rx="4" stroke="currentColor" strokeWidth="0.5" fill="currentColor" opacity="0.03" />

      {/* Roads */}
      <line x1="236" y1="100" x2="442" y2="100" stroke="currentColor" strokeWidth="1" opacity="0.08" />
      <line x1="236" y1="170" x2="442" y2="170" stroke="currentColor" strokeWidth="1.5" opacity="0.1" />
      <line x1="236" y1="240" x2="442" y2="240" stroke="currentColor" strokeWidth="1" opacity="0.08" />
      <line x1="290" y1="38" x2="290" y2="308" stroke="currentColor" strokeWidth="1" opacity="0.08" />
      <line x1="370" y1="38" x2="370" y2="308" stroke="currentColor" strokeWidth="1.5" opacity="0.1" />
      <line x1="236" y1="58" x2="442" y2="280" stroke="currentColor" strokeWidth="0.8" opacity="0.06" />

      {/* Crew dots + pulse rings */}
      <circle cx="290" cy="100" r="5" fill="currentColor" opacity="0.2" />
      <circle cx="290" cy="100" r="9" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.1" />
      <circle cx="370" cy="170" r="5" fill="currentColor" opacity="0.2" />
      <circle cx="370" cy="170" r="9" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.1" />
      <circle cx="330" cy="240" r="5" fill="currentColor" opacity="0.15" />
      <circle cx="330" cy="240" r="9" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.08" />
      <circle cx="410" cy="120" r="5" fill="currentColor" opacity="0.15" />
      <circle cx="410" cy="120" r="9" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.08" />

      <rect x="236" y="296" width="60" height="3" rx="1" fill="currentColor" opacity="0.08" />
    </g>
  );
}

/* ─── 3D tilt configs per device ─── */
const tiltConfigs: Record<
  DeviceType,
  {
    perspective: string;
    rotateY: number;
    rotateX: number;
    viewBox: string;
    maxWidth: string;
  }
> = {
  phone: { perspective: '800px', rotateY: 15, rotateX: 5, viewBox: '0 0 220 420', maxWidth: '220px' },
  laptop: { perspective: '1200px', rotateY: 8, rotateX: 4, viewBox: '0 0 520 340', maxWidth: '440px' },
  tablet: { perspective: '1000px', rotateY: -10, rotateX: 4, viewBox: '0 0 480 340', maxWidth: '400px' },
};

const springConfig = { type: 'spring' as const, stiffness: 120, damping: 18 };

/* ─── Phone Shell ─── */
function PhoneShell({ isActive, reducedMotion }: { isActive: boolean; reducedMotion: boolean }) {
  const cfg = tiltConfigs.phone;
  return (
    <div style={{ perspective: cfg.perspective }} className="flex items-center justify-center">
      <motion.svg
        viewBox={cfg.viewBox}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`text-white/25 w-full max-w-[${cfg.maxWidth}]`}
        style={{ transformStyle: 'preserve-3d', maxWidth: cfg.maxWidth }}
        animate={
          reducedMotion
            ? {}
            : { rotateY: isActive ? cfg.rotateY : 0, rotateX: isActive ? cfg.rotateX : 0 }
        }
        transition={springConfig}
      >
        <rect x="4" y="4" width="212" height="412" rx="24" stroke="currentColor" strokeWidth="1" fill="none" />
        <rect x="12" y="48" width="196" height="332" rx="4" stroke="currentColor" strokeWidth="0.5" fill="none" opacity="0.15" />
        <rect x="78" y="14" width="64" height="18" rx="9" fill="currentColor" opacity="0.15" />
        <rect x="80" y="396" width="60" height="4" rx="2" fill="currentColor" opacity="0.15" />
        <SchedulingWireframe />
      </motion.svg>
    </div>
  );
}

/* ─── Laptop Shell ─── */
function LaptopShell({ isActive, reducedMotion }: { isActive: boolean; reducedMotion: boolean }) {
  const cfg = tiltConfigs.laptop;
  return (
    <div style={{ perspective: cfg.perspective }} className="flex items-center justify-center">
      <motion.svg
        viewBox={cfg.viewBox}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="text-white/25 w-full"
        style={{ transformStyle: 'preserve-3d', maxWidth: cfg.maxWidth }}
        animate={
          reducedMotion
            ? {}
            : { rotateY: isActive ? cfg.rotateY : 0, rotateX: isActive ? cfg.rotateX : 0 }
        }
        transition={springConfig}
      >
        <rect x="4" y="4" width="512" height="280" rx="12" stroke="currentColor" strokeWidth="1" fill="none" />
        <rect x="20" y="16" width="480" height="256" rx="4" stroke="currentColor" strokeWidth="0.5" fill="none" opacity="0.15" />
        <path d="M30,288 L490,288 L504,320 L16,320 Z" stroke="currentColor" strokeWidth="1" fill="none" />
        <line x1="30" y1="288" x2="490" y2="288" stroke="currentColor" strokeWidth="0.5" opacity="0.2" />
        <rect x="210" y="296" width="100" height="16" rx="3" stroke="currentColor" strokeWidth="0.5" fill="none" opacity="0.1" />
        <LaptopProjectsWireframe />
      </motion.svg>
    </div>
  );
}

/* ─── Tablet Shell ─── */
function TabletShell({ isActive, reducedMotion }: { isActive: boolean; reducedMotion: boolean }) {
  const cfg = tiltConfigs.tablet;
  return (
    <div style={{ perspective: cfg.perspective }} className="flex items-center justify-center">
      <motion.svg
        viewBox={cfg.viewBox}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="text-white/25 w-full"
        style={{ transformStyle: 'preserve-3d', maxWidth: cfg.maxWidth }}
        animate={
          reducedMotion
            ? {}
            : { rotateY: isActive ? cfg.rotateY : 0, rotateX: isActive ? cfg.rotateX : 0 }
        }
        transition={springConfig}
      >
        <rect x="4" y="4" width="472" height="332" rx="16" stroke="currentColor" strokeWidth="1" fill="none" />
        <rect x="16" y="16" width="448" height="308" rx="4" stroke="currentColor" strokeWidth="0.5" fill="none" opacity="0.15" />
        <circle cx="240" cy="10" r="2.5" fill="currentColor" opacity="0.15" />
        <rect x="200" y="328" width="80" height="3" rx="1.5" fill="currentColor" opacity="0.15" />
        <TabletTeamWireframe />
      </motion.svg>
    </div>
  );
}

/* ─── Main Export ─── */
export default function DeviceShell({ device, variant, isActive }: DeviceShellProps) {
  const reducedMotion = useReducedMotion() ?? false;

  switch (device) {
    case 'phone':
      return <PhoneShell isActive={isActive} reducedMotion={reducedMotion} />;
    case 'laptop':
      return <LaptopShell isActive={isActive} reducedMotion={reducedMotion} />;
    case 'tablet':
      return <TabletShell isActive={isActive} reducedMotion={reducedMotion} />;
  }
}
