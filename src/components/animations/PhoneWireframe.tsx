/**
 * PhoneWireframe — SVG phone outline with variant-specific wireframe content
 * Applies 3D perspective tilt on hover via Framer Motion spring animation
 */

'use client';

import { motion } from 'framer-motion';

interface PhoneWireframeProps {
  variant: 'scheduling' | 'projects' | 'team';
  isActive: boolean;
}

function SchedulingWireframe() {
  return (
    <g>
      {/* Header bar */}
      <rect x="30" y="60" width="160" height="1" rx="0.5" fill="currentColor" opacity="0.3" />

      {/* "TODAY" label */}
      <rect x="30" y="72" width="40" height="4" rx="1" fill="currentColor" opacity="0.2" />

      {/* Time markers along left edge */}
      <text x="30" y="102" fontSize="5" fill="currentColor" opacity="0.15" fontFamily="monospace">8:00</text>
      <text x="30" y="142" fontSize="5" fill="currentColor" opacity="0.15" fontFamily="monospace">9:00</text>
      <text x="30" y="182" fontSize="5" fill="currentColor" opacity="0.15" fontFamily="monospace">10:00</text>
      <text x="30" y="222" fontSize="5" fill="currentColor" opacity="0.15" fontFamily="monospace">11:00</text>
      <text x="30" y="262" fontSize="5" fill="currentColor" opacity="0.15" fontFamily="monospace">12:00</text>
      <text x="30" y="302" fontSize="5" fill="currentColor" opacity="0.15" fontFamily="monospace">1:00</text>
      <text x="30" y="342" fontSize="5" fill="currentColor" opacity="0.15" fontFamily="monospace">2:00</text>

      {/* Horizontal timeline grid lines */}
      {[100, 140, 180, 220, 260, 300, 340].map((y) => (
        <line key={y} x1="50" y1={y} x2="190" y2={y} stroke="currentColor" strokeWidth="0.5" opacity="0.08" />
      ))}

      {/* Schedule blocks */}
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

function ProjectsWireframe() {
  return (
    <g>
      {/* Header */}
      <rect x="30" y="60" width="160" height="1" rx="0.5" fill="currentColor" opacity="0.3" />
      <rect x="30" y="72" width="50" height="4" rx="1" fill="currentColor" opacity="0.2" />

      {/* Project card 1 */}
      <rect x="30" y="90" width="160" height="70" rx="3" stroke="currentColor" strokeWidth="1" fill="currentColor" opacity="0.04" />
      <rect x="38" y="100" width="70" height="4" rx="1" fill="currentColor" opacity="0.25" />
      <rect x="38" y="108" width="45" height="3" rx="1" fill="currentColor" opacity="0.12" />
      {/* Progress bar */}
      <rect x="38" y="120" width="140" height="4" rx="2" fill="currentColor" opacity="0.08" />
      <rect x="38" y="120" width="95" height="4" rx="2" fill="currentColor" opacity="0.2" />
      {/* Status tag */}
      <rect x="38" y="132" width="30" height="10" rx="2" stroke="currentColor" strokeWidth="0.5" fill="currentColor" opacity="0.06" />
      <rect x="42" y="135.5" width="22" height="3" rx="1" fill="currentColor" opacity="0.15" />
      {/* Avatars */}
      <circle cx="155" cy="137" r="6" stroke="currentColor" strokeWidth="0.5" fill="currentColor" opacity="0.08" />
      <circle cx="168" cy="137" r="6" stroke="currentColor" strokeWidth="0.5" fill="currentColor" opacity="0.08" />

      {/* Project card 2 */}
      <rect x="30" y="172" width="160" height="70" rx="3" stroke="currentColor" strokeWidth="1" fill="currentColor" opacity="0.04" />
      <rect x="38" y="182" width="60" height="4" rx="1" fill="currentColor" opacity="0.25" />
      <rect x="38" y="190" width="50" height="3" rx="1" fill="currentColor" opacity="0.12" />
      {/* Progress bar */}
      <rect x="38" y="202" width="140" height="4" rx="2" fill="currentColor" opacity="0.08" />
      <rect x="38" y="202" width="55" height="4" rx="2" fill="currentColor" opacity="0.2" />
      {/* Status tag */}
      <rect x="38" y="214" width="35" height="10" rx="2" stroke="currentColor" strokeWidth="0.5" fill="currentColor" opacity="0.06" />
      <rect x="42" y="217.5" width="27" height="3" rx="1" fill="currentColor" opacity="0.15" />
      {/* Avatars */}
      <circle cx="145" cy="219" r="6" stroke="currentColor" strokeWidth="0.5" fill="currentColor" opacity="0.08" />
      <circle cx="158" cy="219" r="6" stroke="currentColor" strokeWidth="0.5" fill="currentColor" opacity="0.08" />
      <circle cx="171" cy="219" r="6" stroke="currentColor" strokeWidth="0.5" fill="currentColor" opacity="0.08" />

      {/* Project card 3 */}
      <rect x="30" y="254" width="160" height="70" rx="3" stroke="currentColor" strokeWidth="1" fill="currentColor" opacity="0.04" />
      <rect x="38" y="264" width="80" height="4" rx="1" fill="currentColor" opacity="0.25" />
      <rect x="38" y="272" width="40" height="3" rx="1" fill="currentColor" opacity="0.12" />
      {/* Progress bar */}
      <rect x="38" y="284" width="140" height="4" rx="2" fill="currentColor" opacity="0.08" />
      <rect x="38" y="284" width="120" height="4" rx="2" fill="currentColor" opacity="0.2" />
      {/* Status tag */}
      <rect x="38" y="296" width="28" height="10" rx="2" stroke="currentColor" strokeWidth="0.5" fill="currentColor" opacity="0.06" />
      <rect x="42" y="299.5" width="20" height="3" rx="1" fill="currentColor" opacity="0.15" />

      {/* Partial card 4 (peek) */}
      <rect x="30" y="336" width="160" height="40" rx="3" stroke="currentColor" strokeWidth="1" fill="currentColor" opacity="0.04" />
      <rect x="38" y="346" width="65" height="4" rx="1" fill="currentColor" opacity="0.25" />
      <rect x="38" y="354" width="38" height="3" rx="1" fill="currentColor" opacity="0.12" />
    </g>
  );
}

function TeamWireframe() {
  return (
    <g>
      {/* Header */}
      <rect x="30" y="60" width="160" height="1" rx="0.5" fill="currentColor" opacity="0.3" />
      <rect x="30" y="72" width="35" height="4" rx="1" fill="currentColor" opacity="0.2" />

      {/* Team member row 1 */}
      <circle cx="48" cy="102" r="14" stroke="currentColor" strokeWidth="1" fill="currentColor" opacity="0.06" />
      <rect x="70" y="95" width="65" height="4" rx="1" fill="currentColor" opacity="0.25" />
      <rect x="70" y="103" width="40" height="3" rx="1" fill="currentColor" opacity="0.12" />
      {/* Status dot */}
      <circle cx="176" cy="100" r="3" fill="currentColor" opacity="0.2" />

      {/* Divider */}
      <line x1="30" y1="126" x2="190" y2="126" stroke="currentColor" strokeWidth="0.5" opacity="0.08" />

      {/* Team member row 2 */}
      <circle cx="48" cy="148" r="14" stroke="currentColor" strokeWidth="1" fill="currentColor" opacity="0.06" />
      <rect x="70" y="141" width="55" height="4" rx="1" fill="currentColor" opacity="0.25" />
      <rect x="70" y="149" width="48" height="3" rx="1" fill="currentColor" opacity="0.12" />
      <circle cx="176" cy="146" r="3" fill="currentColor" opacity="0.2" />

      {/* Divider */}
      <line x1="30" y1="172" x2="190" y2="172" stroke="currentColor" strokeWidth="0.5" opacity="0.08" />

      {/* Team member row 3 */}
      <circle cx="48" cy="194" r="14" stroke="currentColor" strokeWidth="1" fill="currentColor" opacity="0.06" />
      <rect x="70" y="187" width="72" height="4" rx="1" fill="currentColor" opacity="0.25" />
      <rect x="70" y="195" width="35" height="3" rx="1" fill="currentColor" opacity="0.12" />
      <circle cx="176" cy="192" r="3" fill="currentColor" opacity="0.15" />

      {/* Divider */}
      <line x1="30" y1="218" x2="190" y2="218" stroke="currentColor" strokeWidth="0.5" opacity="0.08" />

      {/* Team member row 4 */}
      <circle cx="48" cy="240" r="14" stroke="currentColor" strokeWidth="1" fill="currentColor" opacity="0.06" />
      <rect x="70" y="233" width="58" height="4" rx="1" fill="currentColor" opacity="0.25" />
      <rect x="70" y="241" width="42" height="3" rx="1" fill="currentColor" opacity="0.12" />
      <circle cx="176" cy="238" r="3" fill="currentColor" opacity="0.2" />

      {/* Divider */}
      <line x1="30" y1="264" x2="190" y2="264" stroke="currentColor" strokeWidth="0.5" opacity="0.08" />

      {/* Team member row 5 */}
      <circle cx="48" cy="286" r="14" stroke="currentColor" strokeWidth="1" fill="currentColor" opacity="0.06" />
      <rect x="70" y="279" width="48" height="4" rx="1" fill="currentColor" opacity="0.25" />
      <rect x="70" y="287" width="55" height="3" rx="1" fill="currentColor" opacity="0.12" />
      <circle cx="176" cy="284" r="3" fill="currentColor" opacity="0.2" />

      {/* Divider */}
      <line x1="30" y1="310" x2="190" y2="310" stroke="currentColor" strokeWidth="0.5" opacity="0.08" />

      {/* Team member row 6 (partial) */}
      <circle cx="48" cy="332" r="14" stroke="currentColor" strokeWidth="1" fill="currentColor" opacity="0.06" />
      <rect x="70" y="325" width="62" height="4" rx="1" fill="currentColor" opacity="0.25" />
      <rect x="70" y="333" width="38" height="3" rx="1" fill="currentColor" opacity="0.12" />
      <circle cx="176" cy="330" r="3" fill="currentColor" opacity="0.15" />
    </g>
  );
}

const wireframeContent = {
  scheduling: SchedulingWireframe,
  projects: ProjectsWireframe,
  team: TeamWireframe,
};

export default function PhoneWireframe({ variant, isActive }: PhoneWireframeProps) {
  const WireframeContent = wireframeContent[variant];

  return (
    <div
      style={{ perspective: '800px' }}
      className="flex items-center justify-center"
    >
      <motion.svg
        viewBox="0 0 220 420"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="text-white/25 w-full max-w-[220px]"
        style={{ transformStyle: 'preserve-3d' }}
        animate={{
          rotateY: isActive ? 15 : 0,
          rotateX: isActive ? 5 : 0,
        }}
        transition={{
          type: 'spring',
          stiffness: 120,
          damping: 18,
        }}
      >
        {/* Phone outline */}
        <rect
          x="4"
          y="4"
          width="212"
          height="412"
          rx="24"
          stroke="currentColor"
          strokeWidth="1"
          fill="none"
        />

        {/* Screen area inner border */}
        <rect
          x="12"
          y="48"
          width="196"
          height="332"
          rx="4"
          stroke="currentColor"
          strokeWidth="0.5"
          fill="none"
          opacity="0.15"
        />

        {/* Notch / dynamic island */}
        <rect
          x="78"
          y="14"
          width="64"
          height="18"
          rx="9"
          fill="currentColor"
          opacity="0.15"
        />

        {/* Home indicator */}
        <rect
          x="80"
          y="396"
          width="60"
          height="4"
          rx="2"
          fill="currentColor"
          opacity="0.15"
        />

        {/* Variant-specific wireframe content */}
        <WireframeContent />
      </motion.svg>
    </div>
  );
}
