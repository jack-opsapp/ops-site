/**
 * ToolIllustrations — Animated SVG wireframe illustrations for each tool card.
 *
 * Client component. Each illustration accepts isActive (hover state from ToolCard)
 * and animates on hover using Framer Motion.
 */

'use client';

import { motion } from 'framer-motion';

interface IllustrationProps {
  isActive?: boolean;
}

/**
 * LeadershipIllustration — Person silhouette + star/rating bars
 * On hover: bars fill, star brightens
 */
export function LeadershipIllustration({ isActive = false }: IllustrationProps) {
  return (
    <motion.svg
      viewBox="0 0 160 120"
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
      className="text-white/25 w-full h-full"
    >
      {/* Person silhouette — head */}
      <circle cx="45" cy="30" r="12" />
      {/* Person silhouette — body */}
      <path d="M30 52 C30 44 60 44 60 52 L60 80 L30 80 Z" />

      {/* Star */}
      <motion.path
        d="M110 18 L113 27 L122 27 L115 33 L117 42 L110 37 L103 42 L105 33 L98 27 L107 27 Z"
        animate={{
          stroke: isActive ? 'rgba(255,255,255,0.7)' : 'currentColor',
          fill: isActive ? 'rgba(255,255,255,0.08)' : 'transparent',
        }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      />

      {/* Rating bars */}
      <rect x="88" y="56" width="52" height="4" rx="1" opacity={0.3} />
      <motion.rect
        x="88"
        y="56"
        height="4"
        rx="1"
        animate={{ width: isActive ? 52 : 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: 0 }}
        fill="currentColor"
        stroke="none"
        opacity={0.5}
      />

      <rect x="88" y="68" width="52" height="4" rx="1" opacity={0.3} />
      <motion.rect
        x="88"
        y="68"
        height="4"
        rx="1"
        animate={{ width: isActive ? 40 : 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: 0.08 }}
        fill="currentColor"
        stroke="none"
        opacity={0.5}
      />

      <rect x="88" y="80" width="52" height="4" rx="1" opacity={0.3} />
      <motion.rect
        x="88"
        y="80"
        height="4"
        rx="1"
        animate={{ width: isActive ? 46 : 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: 0.16 }}
        fill="currentColor"
        stroke="none"
        opacity={0.5}
      />

      <rect x="88" y="92" width="52" height="4" rx="1" opacity={0.3} />
      <motion.rect
        x="88"
        y="92"
        height="4"
        rx="1"
        animate={{ width: isActive ? 34 : 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: 0.24 }}
        fill="currentColor"
        stroke="none"
        opacity={0.5}
      />
    </motion.svg>
  );
}

/**
 * SeoIllustration — Document outline with magnifying glass + chart lines
 * On hover: chart lines draw in, magnifying glass pulses
 */
export function SeoIllustration({ isActive = false }: IllustrationProps) {
  return (
    <motion.svg
      viewBox="0 0 160 120"
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
      className="text-white/25 w-full h-full"
    >
      {/* Document outline */}
      <rect x="20" y="10" width="60" height="80" rx="2" />
      {/* Document lines */}
      <line x1="30" y1="28" x2="70" y2="28" opacity={0.4} />
      <line x1="30" y1="38" x2="65" y2="38" opacity={0.4} />
      <line x1="30" y1="48" x2="70" y2="48" opacity={0.4} />
      <line x1="30" y1="58" x2="55" y2="58" opacity={0.4} />
      <line x1="30" y1="68" x2="62" y2="68" opacity={0.4} />

      {/* Chart area */}
      <rect x="95" y="50" width="50" height="40" rx="1" opacity={0.3} />

      {/* Chart lines — draw in on hover */}
      <motion.polyline
        points="100,82 112,72 124,78 136,60"
        strokeWidth="1.5"
        fill="none"
        animate={{
          pathLength: isActive ? 1 : 0,
          stroke: isActive ? 'rgba(255,255,255,0.6)' : 'currentColor',
        }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        style={{ pathLength: 0 }}
        strokeDasharray="1"
        strokeDashoffset="0"
      />

      <motion.polyline
        points="100,86 115,80 128,84 140,68"
        strokeWidth="1"
        fill="none"
        opacity={0.4}
        animate={{
          pathLength: isActive ? 1 : 0,
        }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
        style={{ pathLength: 0 }}
        strokeDasharray="1"
        strokeDashoffset="0"
      />

      {/* Magnifying glass */}
      <motion.g
        animate={{
          scale: isActive ? [1, 1.08, 1] : 1,
          opacity: isActive ? 0.8 : 0.4,
        }}
        transition={{
          scale: { duration: 0.8, ease: [0.22, 1, 0.36, 1], repeat: isActive ? Infinity : 0, repeatDelay: 1.2 },
          opacity: { duration: 0.4 },
        }}
      >
        <circle cx="120" cy="26" r="12" strokeWidth="1.5" />
        <line x1="129" y1="35" x2="138" y2="44" strokeWidth="2" strokeLinecap="round" />
      </motion.g>
    </motion.svg>
  );
}

/**
 * CalculatorIllustration — Calculator outline with number rows + output display
 * On hover: numbers cascade in, display shows result
 */
/**
 * CoursesIllustration — Book/graduation cap + progress bars
 * On hover: progress bars fill, cap shifts up
 */
export function CoursesIllustration({ isActive = false }: IllustrationProps) {
  return (
    <motion.svg
      viewBox="0 0 160 120"
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
      className="text-white/25 w-full h-full"
    >
      {/* Book */}
      <rect x="25" y="30" width="50" height="60" rx="2" />
      <line x1="50" y1="30" x2="50" y2="90" opacity={0.4} />
      {/* Book spine detail */}
      <line x1="30" y1="45" x2="46" y2="45" opacity={0.3} />
      <line x1="30" y1="52" x2="43" y2="52" opacity={0.3} />
      <line x1="54" y1="45" x2="70" y2="45" opacity={0.3} />
      <line x1="54" y1="52" x2="67" y2="52" opacity={0.3} />

      {/* Graduation cap */}
      <motion.g
        animate={{ y: isActive ? -4 : 0, opacity: isActive ? 0.8 : 0.4 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <polygon points="50,12 72,22 50,32 28,22" />
        <line x1="50" y1="32" x2="50" y2="24" />
        <line x1="68" y1="23" x2="68" y2="34" />
        <circle cx="68" cy="35" r="1.5" fill="currentColor" stroke="none" />
      </motion.g>

      {/* Progress bars */}
      <rect x="90" y="40" width="50" height="5" rx="1" opacity={0.3} />
      <motion.rect
        x="90" y="40" height="5" rx="1"
        animate={{ width: isActive ? 50 : 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: 0 }}
        fill="currentColor" stroke="none" opacity={0.5}
      />

      <rect x="90" y="54" width="50" height="5" rx="1" opacity={0.3} />
      <motion.rect
        x="90" y="54" height="5" rx="1"
        animate={{ width: isActive ? 35 : 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
        fill="currentColor" stroke="none" opacity={0.5}
      />

      <rect x="90" y="68" width="50" height="5" rx="1" opacity={0.3} />
      <motion.rect
        x="90" y="68" height="5" rx="1"
        animate={{ width: isActive ? 20 : 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
        fill="currentColor" stroke="none" opacity={0.5}
      />

      {/* Completion label */}
      <motion.text
        x="115" y="88"
        textAnchor="middle"
        fontSize="8"
        fontFamily="monospace"
        fill="currentColor"
        stroke="none"
        animate={{ opacity: isActive ? 0.6 : 0 }}
        transition={{ duration: 0.3, delay: 0.4 }}
      >
        3 / 5
      </motion.text>
    </motion.svg>
  );
}

export function CalculatorIllustration({ isActive = false }: IllustrationProps) {
  const buttonPositions = [
    // Row 1
    { x: 38, y: 54 },
    { x: 58, y: 54 },
    { x: 78, y: 54 },
    // Row 2
    { x: 38, y: 70 },
    { x: 58, y: 70 },
    { x: 78, y: 70 },
    // Row 3
    { x: 38, y: 86 },
    { x: 58, y: 86 },
    { x: 78, y: 86 },
  ];

  const buttonLabels = ['7', '8', '9', '4', '5', '6', '1', '2', '3'];

  return (
    <motion.svg
      viewBox="0 0 160 120"
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
      className="text-white/25 w-full h-full"
    >
      {/* Calculator body */}
      <rect x="25" y="8" width="70" height="100" rx="3" />

      {/* Display area */}
      <rect x="32" y="16" width="56" height="22" rx="1" opacity={0.3} />

      {/* Display text — shows on hover */}
      <motion.text
        x="82"
        y="32"
        textAnchor="end"
        fontSize="12"
        fontFamily="monospace"
        fill="currentColor"
        stroke="none"
        animate={{ opacity: isActive ? 0.7 : 0 }}
        transition={{ duration: 0.3, delay: 0.5 }}
      >
        $4,280
      </motion.text>

      {/* Calculator buttons */}
      {buttonPositions.map((pos, i) => (
        <g key={i}>
          <rect x={pos.x - 7} y={pos.y - 5} width="14" height="10" rx="1" opacity={0.2} />
          <motion.text
            x={pos.x}
            y={pos.y + 3}
            textAnchor="middle"
            fontSize="7"
            fontFamily="monospace"
            fill="currentColor"
            stroke="none"
            animate={{ opacity: isActive ? 0.6 : 0 }}
            transition={{ duration: 0.2, delay: i * 0.04 }}
          >
            {buttonLabels[i]}
          </motion.text>
        </g>
      ))}

      {/* Side panel — output breakdown */}
      <rect x="108" y="20" width="40" height="72" rx="2" opacity={0.2} />

      {/* Output lines */}
      {[0, 1, 2, 3, 4].map((i) => (
        <motion.line
          key={`line-${i}`}
          x1="114"
          y1={32 + i * 12}
          x2="142"
          y2={32 + i * 12}
          opacity={0.3}
          animate={{
            opacity: isActive ? 0.5 : 0.15,
            x2: isActive ? 142 : 126,
          }}
          transition={{ duration: 0.4, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }}
        />
      ))}
    </motion.svg>
  );
}
