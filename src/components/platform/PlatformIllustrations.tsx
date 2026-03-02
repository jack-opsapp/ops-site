'use client';

/**
 * PlatformIllustrations — Elite animated SVG illustrations for each platform feature
 *
 * Each illustration:
 *  - Plays once when scrolled into view (useInView)
 *  - Hover to replay the animation sequence
 *  - Uses pathLength drawing effects + accent color highlights
 *  - Has a satisfying "star moment"
 *
 * ViewBox: 400 x 300 (4:3 ratio matching the feature block placeholder)
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, useInView } from 'framer-motion';

/* ─────────────────────────────────────────────────────────
 * SHARED UTILITIES
 * ───────────────────────────────────────────────────────── */

const ACCENT = '#597794';
const ACCENT_STROKE = 'rgba(89,119,148,0.6)';
const ACCENT_FILL = 'rgba(89,119,148,0.12)';

const spring = { type: 'spring' as const, stiffness: 200, damping: 15 };
const springBouncy = { type: 'spring' as const, stiffness: 300, damping: 12 };
const drawEase = [0.22, 1, 0.36, 1] as const;

/**
 * Phase-based animation sequencer — plays once, replayable.
 * Returns current phase (-1 = dormant) and a play() function.
 */
function useSequence(phaseCount: number, intervalMs = 380) {
  const [phase, setPhase] = useState(-1);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const isPlayingRef = useRef(false);

  const play = useCallback(() => {
    if (isPlayingRef.current) return;
    isPlayingRef.current = true;
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
    setPhase(-1);

    timersRef.current.push(
      setTimeout(() => {
        for (let i = 0; i < phaseCount; i++) {
          timersRef.current.push(
            setTimeout(() => {
              setPhase(i);
              if (i === phaseCount - 1) {
                setTimeout(() => {
                  isPlayingRef.current = false;
                }, 500);
              }
            }, i * intervalMs),
          );
        }
      }, 120),
    );
  }, [phaseCount, intervalMs]);

  useEffect(() => {
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  return { phase, play };
}

/** Hook to play on first viewport entry + replay on hover */
function useIllustration(phaseCount: number, intervalMs = 380) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.3 });
  const { phase, play } = useSequence(phaseCount, intervalMs);
  const hasPlayed = useRef(false);

  useEffect(() => {
    if (inView && !hasPlayed.current) {
      hasPlayed.current = true;
      play();
    }
  }, [inView, play]);

  return { ref, phase, replay: play };
}

/** Shared container */
function Container({
  children,
  innerRef,
  onHover,
}: {
  children: React.ReactNode;
  innerRef: React.RefObject<HTMLDivElement | null>;
  onHover?: () => void;
}) {
  return (
    <div
      ref={innerRef}
      onMouseEnter={onHover}
      className="w-full aspect-[4/3] bg-gradient-to-br from-ops-surface to-[#080808] border border-ops-border rounded-[3px] overflow-hidden flex items-center justify-center transition-colors duration-300 hover:border-ops-border-hover"
    >
      {children}
    </div>
  );
}

function GlowDefs() {
  return (
    <defs>
      <filter id="accentGlow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
  );
}

/* ─────────────────────────────────────────────────────────
 * 1. PROJECT MANAGEMENT — Command Center Assembly
 * ───────────────────────────────────────────────────────── */

export function ProjectManagementIllustration() {
  const { ref, phase: p, replay } = useIllustration(8, 380);

  return (
    <Container innerRef={ref} onHover={replay}>
      <svg viewBox="0 0 400 300" className="w-[85%] h-[85%]" fill="none">
        <GlowDefs />

        <motion.rect
          x="30" y="15" width="340" height="270" rx="6"
          stroke="rgba(255,255,255,0.15)" strokeWidth="1.5"
          animate={{ pathLength: p >= 0 ? 1 : 0, opacity: p >= 0 ? 1 : 0.3 }}
          transition={{ pathLength: { duration: 0.8, ease: drawEase }, opacity: { duration: 0.3 } }}
        />

        {/* Header bar */}
        <motion.rect
          x="30" y="15" width="340" height="38" rx="6"
          stroke="rgba(255,255,255,0.12)" strokeWidth="1" fill="rgba(255,255,255,0.03)"
          animate={{ opacity: p >= 1 ? 1 : 0 }}
          transition={{ duration: 0.3 }}
        />
        <motion.path
          d="M50 34 L180 34" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5"
          animate={{ pathLength: p >= 1 ? 1 : 0, opacity: p >= 1 ? 1 : 0 }}
          transition={{ pathLength: { duration: 0.5, ease: drawEase }, opacity: { duration: 0.2 } }}
        />

        {/* Photo — STAR MOMENT */}
        <motion.g
          style={{ transformOrigin: '115px 120px' }}
          animate={{ scale: p >= 2 ? 1 : 0, opacity: p >= 2 ? 1 : 0 }}
          transition={springBouncy}
        >
          <rect x="50" y="70" width="130" height="100" rx="4" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
          <rect x="50" y="70" width="130" height="100" rx="4" fill={ACCENT_FILL} />
          <path d="M70 150 L95 115 L115 140 L130 120 L160 150" stroke={ACCENT_STROKE} strokeWidth="1.2" fill="none" />
          <circle cx="145" cy="95" r="8" stroke={ACCENT_STROKE} strokeWidth="1" fill="none" />
        </motion.g>

        {/* Text lines */}
        {[0, 1, 2].map((i) => (
          <motion.path
            key={`line-${i}`}
            d={`M200 ${90 + i * 20} L${340 - i * 30} ${90 + i * 20}`}
            stroke="rgba(255,255,255,0.18)" strokeWidth="1.5"
            animate={{ x: p >= 3 ? 0 : 40, opacity: p >= 3 ? 1 : 0 }}
            transition={{ ...spring, delay: i * 0.08 }}
          />
        ))}

        {/* Task checkboxes */}
        {[0, 1].map((i) => (
          <motion.g key={`task-${i}`}>
            <motion.rect
              x="50" y={195 + i * 30} width="14" height="14" rx="2"
              stroke="rgba(255,255,255,0.2)" strokeWidth="1"
              animate={{ opacity: p >= 4 ? 1 : 0, scale: p >= 4 ? 1 : 0.5 }}
              transition={{ ...spring, delay: i * 0.1 }}
            />
            <motion.path
              d={`M75 ${202 + i * 30} L${200 - i * 40} ${202 + i * 30}`}
              stroke="rgba(255,255,255,0.15)" strokeWidth="1"
              animate={{ opacity: p >= 4 ? 1 : 0, x: p >= 4 ? 0 : 20 }}
              transition={{ ...spring, delay: i * 0.1 }}
            />
          </motion.g>
        ))}

        {/* Checkmark */}
        <motion.path
          d="M53 202 L56 206 L61 198"
          stroke={ACCENT} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
          animate={{ pathLength: p >= 5 ? 1 : 0, opacity: p >= 5 ? 1 : 0 }}
          transition={{ pathLength: { duration: 0.3, ease: drawEase }, opacity: { duration: 0.15 } }}
          filter={p >= 5 ? 'url(#accentGlow)' : undefined}
        />

        {/* Progress bar */}
        <motion.rect
          x="50" y="258" width="300" height="10" rx="5"
          stroke="rgba(255,255,255,0.1)" strokeWidth="1" fill="rgba(255,255,255,0.02)"
          animate={{ opacity: p >= 6 ? 1 : 0 }}
          transition={{ duration: 0.3 }}
        />
        <motion.rect
          x="50" y="258" width="200" height="10" rx="5" fill={ACCENT}
          animate={{ scaleX: p >= 6 ? 1 : 0, opacity: p >= 6 ? 0.6 : 0 }}
          style={{ transformOrigin: '50px 263px' }}
          transition={{ duration: 0.8, ease: drawEase }}
          filter={p >= 6 ? 'url(#accentGlow)' : undefined}
        />

        {/* Status badge */}
        <motion.circle
          cx="350" cy="34" r="8" fill={ACCENT}
          animate={{ scale: p >= 7 ? 1 : 0, opacity: p >= 7 ? 0.7 : 0 }}
          style={{ transformOrigin: '350px 34px' }}
          transition={springBouncy}
          filter={p >= 7 ? 'url(#accentGlow)' : undefined}
        />
      </svg>
    </Container>
  );
}

/* ─────────────────────────────────────────────────────────
 * 2. SCHEDULING — Month Calendar with Task Bars
 *
 * iOS-style month grid with day cells, colored task bars
 * spanning across dates like a construction crew's schedule.
 * ───────────────────────────────────────────────────────── */

export function SchedulingIllustration() {
  const { ref, phase: p, replay } = useIllustration(8, 400);

  const colW = 48;
  const rowH = 38;
  const gx = 26; // grid x start
  const gy = 52; // grid y start (below headers)
  const dayHeaders = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  // Month starts on Wednesday (col 3). Generate day positions.
  const days: { num: number; col: number; row: number }[] = [];
  let dayNum = 1;
  for (let row = 0; row < 5; row++) {
    for (let col = row === 0 ? 3 : 0; col < 7; col++) {
      if (dayNum <= 31) {
        days.push({ num: dayNum, col, row });
        dayNum++;
      }
    }
  }

  // Task bars: startCol, endCol, row, color, accent
  const bars = [
    { sc: 1, ec: 5, row: 1, color: ACCENT, opacity: 0.3, stroke: ACCENT_STROKE, glow: true },
    { sc: 3, ec: 5, row: 2, color: '#E5A02E', opacity: 0.25, stroke: 'rgba(229,160,46,0.5)', glow: false },
    { sc: 2, ec: 2, row: 3, color: 'rgba(255,255,255,0.15)', opacity: 0.15, stroke: 'rgba(255,255,255,0.15)', glow: false },
    { sc: 1, ec: 3, row: 4, color: ACCENT, opacity: 0.25, stroke: ACCENT_STROKE, glow: true },
    { sc: 5, ec: 5, row: 4, color: '#2EA043', opacity: 0.3, stroke: 'rgba(46,160,67,0.5)', glow: false },
  ];

  // "Today" indicator: day 16 = row 2, col 1
  const todayCol = 1;
  const todayRow = 2;

  return (
    <Container innerRef={ref} onHover={replay}>
      <svg viewBox="0 0 400 300" className="w-[85%] h-[85%]" fill="none">
        <GlowDefs />

        {/* Grid lines */}
        {Array.from({ length: 8 }, (_, i) => (
          <motion.path
            key={`v-${i}`}
            d={`M${gx + i * colW} ${gy} L${gx + i * colW} ${gy + 5 * rowH}`}
            stroke="rgba(255,255,255,0.06)" strokeWidth="1"
            animate={{ pathLength: p >= 0 ? 1 : 0, opacity: p >= 0 ? 1 : 0 }}
            transition={{ pathLength: { duration: 0.4, ease: drawEase, delay: i * 0.03 }, opacity: { duration: 0.2 } }}
          />
        ))}
        {Array.from({ length: 6 }, (_, i) => (
          <motion.path
            key={`h-${i}`}
            d={`M${gx} ${gy + i * rowH} L${gx + 7 * colW} ${gy + i * rowH}`}
            stroke="rgba(255,255,255,0.06)" strokeWidth="1"
            animate={{ pathLength: p >= 0 ? 1 : 0, opacity: p >= 0 ? 1 : 0 }}
            transition={{ pathLength: { duration: 0.4, ease: drawEase, delay: i * 0.03 }, opacity: { duration: 0.2 } }}
          />
        ))}

        {/* Day headers */}
        {dayHeaders.map((d, i) => (
          <motion.text
            key={`dh-${i}`}
            x={gx + i * colW + colW / 2} y={gy - 8}
            textAnchor="middle" fontSize="10" fontFamily="var(--font-mohave)"
            fill={i === 0 || i === 6 ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.35)'}
            animate={{ opacity: p >= 1 ? 1 : 0, y: p >= 1 ? 0 : -5 }}
            transition={{ ...spring, delay: i * 0.04 }}
          >
            {d}
          </motion.text>
        ))}

        {/* Day numbers */}
        {days.map((day, i) => (
          <motion.text
            key={`day-${day.num}`}
            x={gx + day.col * colW + 8} y={gy + day.row * rowH + 14}
            fontSize="9" fontFamily="var(--font-kosugi)"
            fill={day.col === 0 || day.col === 6 ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.3)'}
            animate={{ opacity: p >= 2 ? 1 : 0 }}
            transition={{ duration: 0.15, delay: i * 0.012 }}
          >
            {day.num}
          </motion.text>
        ))}

        {/* STAR MOMENT: Task bars drop in with bounce */}
        {bars.map((bar, i) => {
          const bx = gx + bar.sc * colW + 3;
          const bw = (bar.ec - bar.sc + 1) * colW - 6;
          const by = gy + bar.row * rowH + 20;
          return (
            <motion.rect
              key={`bar-${i}`}
              x={bx} y={by} width={bw} height="10" rx="3"
              fill={bar.color} fillOpacity={bar.opacity}
              stroke={bar.stroke} strokeWidth="1"
              style={{ transformOrigin: `${bx}px ${by + 5}px` }}
              animate={{ scaleX: p >= 3 + i ? 1 : 0, opacity: p >= 3 + i ? 1 : 0 }}
              transition={{ type: 'spring', stiffness: 250, damping: 14 }}
              filter={bar.glow && p >= 3 + i ? 'url(#accentGlow)' : undefined}
            />
          );
        })}

        {/* Today circle indicator */}
        <motion.circle
          cx={gx + todayCol * colW + colW / 2} cy={gy + todayRow * rowH + 10}
          r="12" stroke={ACCENT} strokeWidth="1.5" fill={ACCENT_FILL}
          style={{ transformOrigin: `${gx + todayCol * colW + colW / 2}px ${gy + todayRow * rowH + 10}px` }}
          animate={{ scale: p >= 7 ? 1 : 0, opacity: p >= 7 ? 1 : 0 }}
          transition={springBouncy}
          filter={p >= 7 ? 'url(#accentGlow)' : undefined}
        />
      </svg>
    </Container>
  );
}

/* ─────────────────────────────────────────────────────────
 * 3. TEAM MANAGEMENT — Crew Dashboard
 * ───────────────────────────────────────────────────────── */

export function TeamManagementIllustration() {
  const { ref, phase: p, replay } = useIllustration(7, 400);

  const rows = [50, 110, 170, 230];
  const statusColors = [ACCENT, ACCENT, '#E5A02E', 'rgba(255,255,255,0.2)'];

  return (
    <Container innerRef={ref} onHover={replay}>
      <svg viewBox="0 0 400 300" className="w-[85%] h-[85%]" fill="none">
        <GlowDefs />

        {/* Row separators */}
        {rows.map((y, i) => (
          <motion.path
            key={`row-${i}`}
            d={`M30 ${y + 40} L370 ${y + 40}`}
            stroke="rgba(255,255,255,0.06)" strokeWidth="1"
            animate={{ pathLength: p >= 0 ? 1 : 0, opacity: p >= 0 ? 1 : 0 }}
            transition={{ pathLength: { duration: 0.4, ease: drawEase, delay: i * 0.08 }, opacity: { duration: 0.2 } }}
          />
        ))}

        {/* Avatar circles */}
        {rows.map((y, i) => (
          <motion.circle
            key={`avatar-${i}`}
            cx="60" cy={y + 18} r="18"
            stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" fill="rgba(255,255,255,0.04)"
            style={{ transformOrigin: `60px ${y + 18}px` }}
            animate={{ scale: p >= 1 ? 1 : 0, opacity: p >= 1 ? 1 : 0 }}
            transition={{ ...springBouncy, delay: i * 0.08 }}
          />
        ))}

        {/* Name + role lines */}
        {rows.map((y, i) => (
          <motion.g
            key={`name-${i}`}
            animate={{ x: p >= 2 ? 0 : 30, opacity: p >= 2 ? 1 : 0 }}
            transition={{ ...spring, delay: i * 0.08 }}
          >
            <path d={`M92 ${y + 13} L${180 - i * 10} ${y + 13}`} stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" />
            <path d={`M92 ${y + 26} L${150 - i * 8} ${y + 26}`} stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
          </motion.g>
        ))}

        {/* Status dots */}
        {rows.map((y, i) => (
          <motion.circle
            key={`status-${i}`}
            cx="280" cy={y + 18} r="5"
            fill={statusColors[i]} fillOpacity={statusColors[i] === ACCENT ? 0.7 : 0.5}
            style={{ transformOrigin: `280px ${y + 18}px` }}
            animate={{ scale: p >= 3 ? 1 : 0, opacity: p >= 3 ? 1 : 0 }}
            transition={{ ...springBouncy, delay: i * 0.08 }}
            filter={statusColors[i] === ACCENT ? 'url(#accentGlow)' : undefined}
          />
        ))}

        {/* Job badges */}
        {rows.map((y, i) => (
          <motion.g
            key={`badge-${i}`}
            animate={{ opacity: p >= 4 ? 1 : 0, x: p >= 4 ? 0 : 15 }}
            transition={{ ...spring, delay: i * 0.08 }}
          >
            <rect x="310" y={y + 8} width="55" height="20" rx="3" stroke="rgba(255,255,255,0.1)" strokeWidth="1" fill="rgba(255,255,255,0.03)" />
            <path d={`M318 ${y + 18} L${350 - i * 5} ${y + 18}`} stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
          </motion.g>
        ))}

        {/* STAR MOMENT: Reassignment arrow — member 4 → member 2's job */}
        <motion.path
          d="M60 248 C60 275 340 275 337 128"
          stroke={ACCENT} strokeWidth="1.5" strokeDasharray="6 3"
          animate={{ pathLength: p >= 5 ? 1 : 0, opacity: p >= 5 ? 0.8 : 0 }}
          transition={{ pathLength: { duration: 0.8, ease: drawEase }, opacity: { duration: 0.2 } }}
          filter="url(#accentGlow)"
        />
        {/* Arrowhead — pointing UP (direction of travel) */}
        <motion.path
          d="M332 134 L337 128 L343 134"
          stroke={ACCENT} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
          animate={{ opacity: p >= 6 ? 0.8 : 0 }}
          transition={{ duration: 0.2 }}
          filter="url(#accentGlow)"
        />
      </svg>
    </Container>
  );
}

/* ─────────────────────────────────────────────────────────
 * 4. CLIENT MANAGEMENT — Client Profile Card
 * ───────────────────────────────────────────────────────── */

export function ClientManagementIllustration() {
  const { ref, phase: p, replay } = useIllustration(8, 370);

  return (
    <Container innerRef={ref} onHover={replay}>
      <svg viewBox="0 0 400 300" className="w-[85%] h-[85%]" fill="none">
        <GlowDefs />

        {/* Card outline */}
        <motion.rect
          x="70" y="10" width="260" height="280" rx="6"
          stroke="rgba(255,255,255,0.15)" strokeWidth="1.5"
          animate={{ pathLength: p >= 0 ? 1 : 0, opacity: p >= 0 ? 1 : 0.3 }}
          transition={{ pathLength: { duration: 0.7, ease: drawEase }, opacity: { duration: 0.3 } }}
        />

        {/* Avatar */}
        <motion.circle
          cx="200" cy="58" r="28"
          stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" fill="rgba(255,255,255,0.04)"
          style={{ transformOrigin: '200px 58px' }}
          animate={{ scale: p >= 1 ? 1 : 0, opacity: p >= 1 ? 1 : 0 }}
          transition={springBouncy}
        />
        <motion.g animate={{ opacity: p >= 1 ? 1 : 0 }} transition={{ duration: 0.3, delay: 0.15 }}>
          <circle cx="200" cy="50" r="8" stroke="rgba(255,255,255,0.25)" strokeWidth="1" fill="none" />
          <path d="M184 74 C184 62 216 62 216 74" stroke="rgba(255,255,255,0.25)" strokeWidth="1" fill="none" />
        </motion.g>

        {/* Name + company */}
        <motion.g animate={{ opacity: p >= 2 ? 1 : 0, y: p >= 2 ? 0 : 8 }} transition={spring}>
          <path d="M160 102 L240 102" stroke="rgba(255,255,255,0.25)" strokeWidth="2" />
          <path d="M170 116 L230 116" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
        </motion.g>

        {/* Contact info */}
        {[0, 1].map((i) => (
          <motion.g
            key={`contact-${i}`}
            animate={{ opacity: p >= 3 ? 1 : 0, x: p >= 3 ? 0 : -20 }}
            transition={{ ...spring, delay: i * 0.1 }}
          >
            <rect x="95" y={135 + i * 24} width="12" height="12" rx="2" stroke="rgba(255,255,255,0.15)" strokeWidth="1" fill="none" />
            <path d={`M115 ${141 + i * 24} L${240 - i * 30} ${141 + i * 24}`} stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
          </motion.g>
        ))}

        {/* Divider */}
        <motion.path
          d="M95 190 L305 190" stroke="rgba(255,255,255,0.08)" strokeWidth="1"
          animate={{ pathLength: p >= 4 ? 1 : 0, opacity: p >= 4 ? 1 : 0 }}
          transition={{ pathLength: { duration: 0.4, ease: drawEase }, opacity: { duration: 0.2 } }}
        />

        {/* "Recent Projects" header + stars (same row) */}
        <motion.path
          d="M95 210 L175 210" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5"
          animate={{ opacity: p >= 5 ? 1 : 0 }}
          transition={{ duration: 0.3 }}
        />

        {/* STAR MOMENT: Star rating — positioned within card bounds */}
        {[0, 1, 2, 3, 4].map((i) => (
          <motion.text
            key={`star-${i}`}
            x={215 + i * 16} y={213}
            fontSize="11" fill={ACCENT}
            animate={{ opacity: p >= 7 ? 0.8 : 0, scale: p >= 7 ? 1 : 0.3 }}
            style={{ transformOrigin: `${215 + i * 16}px 210px` }}
            transition={{ ...springBouncy, delay: i * 0.08 }}
            filter={p >= 7 ? 'url(#accentGlow)' : undefined}
          >
            ★
          </motion.text>
        ))}

        {/* Project items */}
        {[0, 1, 2].map((i) => (
          <motion.g
            key={`proj-${i}`}
            animate={{ opacity: p >= 6 ? 1 : 0, y: p >= 6 ? 0 : 10 }}
            transition={{ ...spring, delay: i * 0.08 }}
          >
            <circle cx="103" cy={230 + i * 20} r="3" fill={i === 0 ? ACCENT : 'rgba(255,255,255,0.15)'} fillOpacity={0.6} />
            <path d={`M115 ${230 + i * 20} L${260 - i * 20} ${230 + i * 20}`} stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
          </motion.g>
        ))}
      </svg>
    </Container>
  );
}

/* ─────────────────────────────────────────────────────────
 * 5. INVOICING — Invoice Flow
 * ───────────────────────────────────────────────────────── */

export function InvoicingIllustration() {
  const { ref, phase: p, replay } = useIllustration(8, 400);

  return (
    <Container innerRef={ref} onHover={replay}>
      <svg viewBox="0 0 400 300" className="w-[85%] h-[85%]" fill="none">
        <GlowDefs />

        <motion.rect
          x="60" y="10" width="280" height="280" rx="4"
          stroke="rgba(255,255,255,0.15)" strokeWidth="1.5"
          animate={{ pathLength: p >= 0 ? 1 : 0, opacity: p >= 0 ? 1 : 0.3 }}
          transition={{ pathLength: { duration: 0.7, ease: drawEase }, opacity: { duration: 0.3 } }}
        />

        {/* Header */}
        <motion.g animate={{ opacity: p >= 1 ? 1 : 0, y: p >= 1 ? 0 : -10 }} transition={spring}>
          <path d="M85 35 L200 35" stroke="rgba(255,255,255,0.25)" strokeWidth="2" />
          <path d="M85 48 L160 48" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
          <path d="M260 30 L315 30" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
          <path d="M260 42 L315 42" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
        </motion.g>

        {/* Column headers */}
        <motion.g animate={{ opacity: p >= 2 ? 1 : 0 }} transition={{ duration: 0.3 }}>
          <path d="M85 75 L180 75" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
          <path d="M260 75 L315 75" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
          <path d="M85 80 L315 80" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
        </motion.g>

        {/* Line items */}
        {[0, 1, 2].map((i) => (
          <motion.g
            key={`item-${i}`}
            animate={{ opacity: p >= 3 ? 1 : 0, x: p >= 3 ? 0 : -15 }}
            transition={{ ...spring, delay: i * 0.12 }}
          >
            <path d={`M85 ${100 + i * 30} L${220 - i * 20} ${100 + i * 30}`} stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
            <path d={`M85 ${112 + i * 30} L${180 - i * 15} ${112 + i * 30}`} stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
          </motion.g>
        ))}

        {/* Amounts */}
        {[0, 1, 2].map((i) => (
          <motion.path
            key={`amt-${i}`}
            d={`M280 ${100 + i * 30} L315 ${100 + i * 30}`}
            stroke="rgba(255,255,255,0.2)" strokeWidth="1.5"
            animate={{ opacity: p >= 4 ? 1 : 0, x: p >= 4 ? 0 : 10 }}
            transition={{ ...spring, delay: i * 0.1 }}
          />
        ))}

        {/* Subtotal + tax */}
        <motion.g animate={{ opacity: p >= 5 ? 1 : 0 }} transition={{ duration: 0.3 }}>
          <path d="M200 200 L315 200" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
          <path d="M220 215 L280 215" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
          <path d="M290 215 L315 215" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
          <path d="M220 230 L280 230" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
          <path d="M290 230 L315 230" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
        </motion.g>

        {/* Total — accent */}
        <motion.g animate={{ opacity: p >= 6 ? 1 : 0 }} transition={{ duration: 0.3 }}>
          <path d="M200 248 L315 248" stroke={ACCENT_STROKE} strokeWidth="1.5" />
          <path d="M220 262 L280 262" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" />
          <path d="M285 262 L315 262" stroke={ACCENT} strokeWidth="2" filter="url(#accentGlow)" />
        </motion.g>

        {/* STAR MOMENT: "PAID" stamp */}
        <motion.g
          style={{ transformOrigin: '160px 180px' }}
          animate={{ scale: p >= 7 ? 1 : 0, rotate: p >= 7 ? -12 : -40, opacity: p >= 7 ? 1 : 0 }}
          transition={{ type: 'spring', stiffness: 400, damping: 10 }}
        >
          <rect x="100" y="150" width="120" height="50" rx="4" stroke={ACCENT} strokeWidth="2.5" fill="none" filter="url(#accentGlow)" />
          <text x="160" y="182" textAnchor="middle" fontSize="24" fontFamily="var(--font-mohave)" fontWeight="bold" fill={ACCENT} filter="url(#accentGlow)">
            PAID
          </text>
        </motion.g>
      </svg>
    </Container>
  );
}

/* ─────────────────────────────────────────────────────────
 * 6. JOB BOARD — Kanban Flow
 * ───────────────────────────────────────────────────────── */

export function JobBoardIllustration() {
  const { ref, phase: p, replay } = useIllustration(8, 420);

  const colX = [20, 148, 276];
  const colW = 110;
  const headers = ['LEADS', 'ACTIVE', 'DONE'];

  return (
    <Container innerRef={ref} onHover={replay}>
      <svg viewBox="0 0 400 300" className="w-[85%] h-[85%]" fill="none">
        <GlowDefs />

        {/* Columns */}
        {colX.map((x, i) => (
          <motion.rect
            key={`col-${i}`}
            x={x} y="15" width={colW} height="270" rx="4"
            stroke="rgba(255,255,255,0.08)" strokeWidth="1" fill="rgba(255,255,255,0.02)"
            animate={{ opacity: p >= 0 ? 1 : 0 }}
            transition={{ duration: 0.4, delay: i * 0.1 }}
          />
        ))}

        {/* Headers */}
        {headers.map((header, i) => (
          <motion.text
            key={header}
            x={colX[i] + colW / 2} y="35"
            textAnchor="middle" fontSize="10" fontFamily="var(--font-mohave)" fontWeight="bold"
            fill="rgba(255,255,255,0.35)"
            animate={{ opacity: p >= 1 ? 1 : 0, y: p >= 1 ? 0 : -5 }}
            transition={{ ...spring, delay: i * 0.08 }}
          >
            {header}
          </motion.text>
        ))}

        {colX.map((x, i) => (
          <motion.path
            key={`hline-${i}`}
            d={`M${x + 8} 43 L${x + colW - 8} 43`}
            stroke="rgba(255,255,255,0.08)" strokeWidth="1"
            animate={{ pathLength: p >= 1 ? 1 : 0, opacity: p >= 1 ? 1 : 0 }}
            transition={{ pathLength: { duration: 0.3, ease: drawEase }, opacity: { duration: 0.2 } }}
          />
        ))}

        {/* LEADS cards */}
        {[0, 1, 2].map((i) => (
          <motion.g
            key={`lead-${i}`}
            style={{ transformOrigin: `${colX[0] + colW / 2}px ${55 + i * 50 + 17}px` }}
            animate={{ scale: p >= 2 ? 1 : 0, opacity: p >= 2 ? 1 : 0 }}
            transition={{ ...springBouncy, delay: i * 0.08 }}
          >
            <rect x={colX[0] + 8} y={55 + i * 50} width={colW - 16} height="38" rx="3" stroke="rgba(255,255,255,0.12)" strokeWidth="1" fill="rgba(255,255,255,0.03)" />
            <path d={`M${colX[0] + 16} ${68 + i * 50} L${colX[0] + colW - 24} ${68 + i * 50}`} stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
            <path d={`M${colX[0] + 16} ${78 + i * 50} L${colX[0] + 50} ${78 + i * 50}`} stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
          </motion.g>
        ))}

        {/* STAR MOMENT: Card slides LEADS → ACTIVE */}
        <motion.g
          animate={{ x: p >= 4 ? colX[1] - colX[0] : 0 }}
          transition={{ type: 'spring', stiffness: 150, damping: 14 }}
        >
          <motion.g animate={{ opacity: p >= 3 ? 1 : 0 }} transition={{ duration: 0.2 }}>
            <rect x={colX[0] + 8} y="205" width={colW - 16} height="38" rx="3" stroke={ACCENT_STROKE} strokeWidth="1.5" fill={ACCENT_FILL} filter={p >= 4 ? 'url(#accentGlow)' : undefined} />
            <path d={`M${colX[0] + 16} 218 L${colX[0] + colW - 24} 218`} stroke={ACCENT_STROKE} strokeWidth="1" />
            <path d={`M${colX[0] + 16} 228 L${colX[0] + 50} 228`} stroke="rgba(89,119,148,0.3)" strokeWidth="1" />
          </motion.g>
        </motion.g>

        {/* Card slides ACTIVE → DONE */}
        <motion.g
          animate={{ x: p >= 6 ? colX[2] - colX[1] : 0 }}
          transition={{ type: 'spring', stiffness: 150, damping: 14 }}
        >
          <motion.g
            animate={{ opacity: p >= 5 ? 1 : 0, scale: p >= 5 ? 1 : 0.9 }}
            transition={spring}
          >
            <rect x={colX[1] + 8} y="55" width={colW - 16} height="38" rx="3" stroke="rgba(255,255,255,0.12)" strokeWidth="1" fill="rgba(255,255,255,0.03)" />
            <path d={`M${colX[1] + 16} 68 L${colX[1] + colW - 24} 68`} stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
            <path d={`M${colX[1] + 16} 78 L${colX[1] + 50} 78`} stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
          </motion.g>
        </motion.g>

        {/* Checkmark on done card */}
        <motion.path
          d={`M${colX[2] + colW - 28} 62 L${colX[2] + colW - 24} 68 L${colX[2] + colW - 16} 58`}
          stroke={ACCENT} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          animate={{ pathLength: p >= 7 ? 1 : 0, opacity: p >= 7 ? 1 : 0 }}
          transition={{ pathLength: { duration: 0.3, ease: drawEase }, opacity: { duration: 0.15 } }}
          filter="url(#accentGlow)"
        />
      </svg>
    </Container>
  );
}

/* ─────────────────────────────────────────────────────────
 * 7. PIPELINE — Status Bars with Analytics
 *
 * Horizontal bar chart with colored stage bars + counts.
 * Each stage has a distinct color and fills to represent volume.
 * ───────────────────────────────────────────────────────── */

export function PipelineIllustration() {
  const { ref, phase: p, replay } = useIllustration(8, 400);

  const stages = [
    { label: 'LEADS', width: 180, count: '24', value: '$480K', color: 'rgba(255,255,255,0.2)', stroke: 'rgba(255,255,255,0.15)' },
    { label: 'QUALIFIED', width: 145, count: '18', value: '$360K', color: 'rgba(89,119,148,0.35)', stroke: ACCENT_STROKE },
    { label: 'PROPOSAL', width: 110, count: '12', value: '$240K', color: 'rgba(89,119,148,0.55)', stroke: ACCENT },
    { label: 'NEGOTIATE', width: 75, count: '6', value: '$120K', color: 'rgba(229,160,46,0.35)', stroke: 'rgba(229,160,46,0.6)' },
    { label: 'WON', width: 55, count: '4', value: '$96K', color: 'rgba(46,160,67,0.35)', stroke: 'rgba(46,160,67,0.6)' },
  ];

  const barX = 125;
  const startY = 40;
  const rowH = 48;
  const barH = 22;

  return (
    <Container innerRef={ref} onHover={replay}>
      <svg viewBox="0 0 400 300" className="w-[85%] h-[85%]" fill="none">
        <GlowDefs />

        {/* Stage labels */}
        {stages.map((stage, i) => (
          <motion.text
            key={`label-${i}`}
            x={barX - 10} y={startY + i * rowH + barH / 2 + 4}
            textAnchor="end" fontSize="9" fontFamily="var(--font-mohave)" fontWeight="bold"
            fill="rgba(255,255,255,0.35)"
            animate={{ opacity: p >= 0 ? 1 : 0, x: p >= 0 ? 0 : -10 }}
            transition={{ ...spring, delay: i * 0.06 }}
          >
            {stage.label}
          </motion.text>
        ))}

        {/* Bar backgrounds */}
        {stages.map((_, i) => (
          <motion.rect
            key={`bg-${i}`}
            x={barX} y={startY + i * rowH} width={180} height={barH} rx="3"
            stroke="rgba(255,255,255,0.05)" strokeWidth="1" fill="rgba(255,255,255,0.02)"
            animate={{ opacity: p >= 1 ? 1 : 0 }}
            transition={{ duration: 0.3, delay: i * 0.05 }}
          />
        ))}

        {/* Bar fills — stagger in one by one */}
        {stages.map((stage, i) => (
          <motion.rect
            key={`fill-${i}`}
            x={barX} y={startY + i * rowH} width={stage.width} height={barH} rx="3"
            fill={stage.color} stroke={stage.stroke} strokeWidth="1"
            style={{ transformOrigin: `${barX}px ${startY + i * rowH + barH / 2}px` }}
            animate={{ scaleX: p >= 2 + i ? 1 : 0, opacity: p >= 2 + i ? 1 : 0 }}
            transition={{ duration: 0.6, ease: drawEase }}
            filter={i === 4 && p >= 6 ? 'url(#accentGlow)' : undefined}
          />
        ))}

        {/* Analytics — count + value labels */}
        {stages.map((stage, i) => (
          <motion.g
            key={`analytics-${i}`}
            animate={{ opacity: p >= 7 ? 1 : 0, x: p >= 7 ? 0 : 8 }}
            transition={{ ...spring, delay: i * 0.05 }}
          >
            <text
              x={barX + stage.width + 10} y={startY + i * rowH + 10}
              fontSize="9" fontFamily="var(--font-mohave)" fontWeight="bold"
              fill="rgba(255,255,255,0.4)"
            >
              {stage.count}
            </text>
            <text
              x={barX + stage.width + 10} y={startY + i * rowH + 20}
              fontSize="8" fontFamily="var(--font-kosugi)"
              fill="rgba(255,255,255,0.2)"
            >
              {stage.value}
            </text>
          </motion.g>
        ))}

        {/* Conversion summary at bottom */}
        <motion.g
          animate={{ opacity: p >= 7 ? 1 : 0 }}
          transition={{ duration: 0.4 }}
        >
          <path d={`M${barX} ${startY + 5 * rowH + 5} L${barX + 180} ${startY + 5 * rowH + 5}`} stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
          <text
            x={barX} y={startY + 5 * rowH + 22}
            fontSize="9" fontFamily="var(--font-kosugi)"
            fill="rgba(255,255,255,0.25)"
          >
            WIN RATE
          </text>
          <text
            x={barX + 60} y={startY + 5 * rowH + 22}
            fontSize="11" fontFamily="var(--font-mohave)" fontWeight="bold"
            fill="rgba(46,160,67,0.7)"
          >
            17%
          </text>
          <text
            x={barX + 110} y={startY + 5 * rowH + 22}
            fontSize="9" fontFamily="var(--font-kosugi)"
            fill="rgba(255,255,255,0.25)"
          >
            TOTAL
          </text>
          <text
            x={barX + 145} y={startY + 5 * rowH + 22}
            fontSize="11" fontFamily="var(--font-mohave)" fontWeight="bold"
            fill={ACCENT}
          >
            $1.3M
          </text>
        </motion.g>
      </svg>
    </Container>
  );
}

/* ─────────────────────────────────────────────────────────
 * 8. INVENTORY — Stock Dashboard
 * ───────────────────────────────────────────────────────── */

export function InventoryIllustration() {
  const { ref, phase: p, replay } = useIllustration(8, 380);

  const items = [
    { x: 25, y: 20, level: 0.85, label: 'PICKET RAIL' },
    { x: 150, y: 20, level: 0.6, label: 'SELF TAPPERS' },
    { x: 275, y: 20, level: 0.15, label: 'LAG SCREWS', low: true },
    { x: 25, y: 160, level: 0.7, label: 'CAULKING' },
    { x: 150, y: 160, level: 0.45, label: 'TOP BRACKET' },
    { x: 275, y: 160, level: 0.9, label: 'GLASS PANEL' },
  ];

  const cellW = 110;
  const cellH = 120;
  const barH = 30;

  return (
    <Container innerRef={ref} onHover={replay}>
      <svg viewBox="0 0 400 300" className="w-[85%] h-[85%]" fill="none">
        <GlowDefs />

        {/* Grid cells */}
        {items.map((item, i) => (
          <motion.rect
            key={`cell-${i}`}
            x={item.x} y={item.y} width={cellW} height={cellH} rx="4"
            stroke="rgba(255,255,255,0.08)" strokeWidth="1" fill="rgba(255,255,255,0.02)"
            animate={{ opacity: p >= 0 ? 1 : 0 }}
            transition={{ duration: 0.3, delay: i * 0.05 }}
          />
        ))}

        {/* Item icons */}
        {items.map((item, i) => (
          <motion.g
            key={`icon-${i}`}
            style={{ transformOrigin: `${item.x + cellW / 2}px ${item.y + 30}px` }}
            animate={{ scale: p >= 1 ? 1 : 0, opacity: p >= 1 ? 1 : 0 }}
            transition={{ ...springBouncy, delay: i * 0.06 }}
          >
            <rect x={item.x + cellW / 2 - 15} y={item.y + 15} width="30" height="30" rx="3" stroke="rgba(255,255,255,0.15)" strokeWidth="1" fill="rgba(255,255,255,0.03)" />
            <path d={`M${item.x + cellW / 2 - 6} ${item.y + 30} L${item.x + cellW / 2 + 6} ${item.y + 30}`} stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
          </motion.g>
        ))}

        {/* Item names */}
        {items.map((item, i) => (
          <motion.text
            key={`name-${i}`}
            x={item.x + cellW / 2} y={item.y + 60}
            textAnchor="middle" fontSize="7" fontFamily="var(--font-mohave)"
            fill="rgba(255,255,255,0.3)"
            animate={{ opacity: p >= 2 ? 1 : 0 }}
            transition={{ duration: 0.3, delay: i * 0.04 }}
          >
            {item.label}
          </motion.text>
        ))}

        {/* Bar backgrounds */}
        {items.map((item, i) => (
          <motion.rect
            key={`barbg-${i}`}
            x={item.x + 10} y={item.y + cellH - barH - 10} width={cellW - 20} height={barH} rx="3"
            stroke="rgba(255,255,255,0.06)" strokeWidth="1" fill="rgba(255,255,255,0.02)"
            animate={{ opacity: p >= 3 ? 1 : 0 }}
            transition={{ duration: 0.3 }}
          />
        ))}

        {/* Bar fills */}
        {items.map((item, i) => (
          <motion.rect
            key={`bar-${i}`}
            x={item.x + 10} y={item.y + cellH - barH - 10}
            width={(cellW - 20) * item.level} height={barH} rx="3"
            fill={item.low ? '#E54D2E' : ACCENT}
            fillOpacity={item.low ? 0.4 : 0.2}
            stroke={item.low ? 'rgba(229,77,46,0.5)' : ACCENT_STROKE}
            strokeWidth="1"
            style={{ transformOrigin: `${item.x + 10}px ${item.y + cellH - barH - 10 + barH / 2}px` }}
            animate={{ scaleX: p >= 4 ? 1 : 0, opacity: p >= 4 ? 1 : 0 }}
            transition={{ duration: 0.6, ease: drawEase, delay: i * 0.06 }}
            filter={!item.low && p >= 4 ? 'url(#accentGlow)' : undefined}
          />
        ))}

        {/* STAR MOMENT: Low stock alert */}
        <motion.circle
          cx={275 + cellW - 5} cy={25} r="8"
          fill="#E54D2E" fillOpacity="0.7"
          animate={{ scale: p >= 5 ? 1 : 0, opacity: p >= 5 ? 1 : 0 }}
          style={{ transformOrigin: `${275 + cellW - 5}px 25px` }}
          transition={springBouncy}
        />
        <motion.text
          x={275 + cellW - 5} y={28}
          textAnchor="middle" fontSize="10" fill="white" fontWeight="bold"
          animate={{ opacity: p >= 5 ? 1 : 0 }}
          transition={{ duration: 0.2 }}
        >
          !
        </motion.text>

        {/* REORDER badge — styled pill, not plain text */}
        <motion.g
          style={{ transformOrigin: `${275 + cellW / 2}px ${20 + cellH + 18}px` }}
          animate={{ scale: p >= 6 ? 1 : 0, opacity: p >= 6 ? 1 : 0 }}
          transition={springBouncy}
        >
          <rect
            x={275 + cellW / 2 - 32} y={20 + cellH + 6}
            width="64" height="22" rx="4"
            fill="rgba(229,77,46,0.15)" stroke="rgba(229,77,46,0.5)" strokeWidth="1"
          />
          <text
            x={275 + cellW / 2} y={20 + cellH + 21}
            textAnchor="middle" fontSize="9" fontFamily="var(--font-mohave)" fontWeight="bold"
            fill="#E54D2E"
          >
            REORDER
          </text>
        </motion.g>

        {/* Restock arrow */}
        <motion.path
          d={`M${275 + cellW / 2} ${20 + cellH - 2} L${275 + cellW / 2} ${20 + cellH + 6}`}
          stroke="#E54D2E" strokeWidth="1.5" strokeLinecap="round"
          animate={{ pathLength: p >= 6 ? 1 : 0, opacity: p >= 6 ? 0.6 : 0 }}
          transition={{ pathLength: { duration: 0.3, ease: drawEase }, opacity: { duration: 0.2 } }}
        />
      </svg>
    </Container>
  );
}

/* ─────────────────────────────────────────────────────────
 * 9. PHOTO MARKUP — Deck Documentation
 *
 * Bird's-eye deck with boards, railing, a busted end,
 * and red "REPLACE" annotation markup.
 * ───────────────────────────────────────────────────────── */

export function PhotoMarkupIllustration() {
  const { ref, phase: p, replay } = useIllustration(8, 400);

  const markupColor = '#E54D2E';

  return (
    <Container innerRef={ref} onHover={replay}>
      <svg viewBox="0 0 400 300" className="w-[85%] h-[85%]" fill="none">
        <defs>
          <filter id="markupGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Photo frame */}
        <motion.rect
          x="30" y="15" width="340" height="250" rx="4"
          stroke="rgba(255,255,255,0.15)" strokeWidth="1.5"
          animate={{ pathLength: p >= 0 ? 1 : 0, opacity: p >= 0 ? 1 : 0.3 }}
          transition={{ pathLength: { duration: 0.7, ease: drawEase }, opacity: { duration: 0.3 } }}
        />

        {/* Deck structure — fades in */}
        <motion.g animate={{ opacity: p >= 1 ? 1 : 0 }} transition={{ duration: 0.5 }}>
          {/* Deck surface — angled for 3D feel */}
          <path d="M60 80 L350 60 L350 230 L60 240 Z" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />

          {/* Deck boards — horizontal parallel lines */}
          {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
            const y1 = 92 + i * 20;
            const y2 = 72 + i * 20;
            // Boards go full width except damaged area (last 2 boards at right end)
            const endX = i >= 5 ? 280 : 350;
            return (
              <path
                key={`board-${i}`}
                d={`M60 ${y1} L${endX} ${y2 + (endX === 350 ? 0 : (350 - endX) * -0.069)}`}
                stroke="rgba(255,255,255,0.08)"
                strokeWidth="1"
              />
            );
          })}

          {/* Railing posts along top edge */}
          {[0, 1, 2, 3, 4, 5, 6].map((i) => {
            const x = 80 + i * 40;
            const yTop = 60 + (x - 60) * -0.069;
            return (
              <g key={`post-${i}`}>
                <rect x={x - 3} y={yTop - 22} width="6" height="22" rx="1" stroke="rgba(255,255,255,0.12)" strokeWidth="1" fill="rgba(255,255,255,0.04)" />
              </g>
            );
          })}

          {/* Top rail connecting posts */}
          <path d="M77 38 L317 18" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" />

          {/* Stairs at bottom-center */}
          <rect x="160" y="240" width="80" height="15" rx="1" stroke="rgba(255,255,255,0.08)" strokeWidth="1" fill="rgba(255,255,255,0.02)" />
          <rect x="150" y="255" width="100" height="12" rx="1" stroke="rgba(255,255,255,0.06)" strokeWidth="1" fill="rgba(255,255,255,0.01)" />

          {/* Damaged area — jagged broken board ends */}
          <path d="M280 172 L290 168 L285 175 L295 170" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M280 192 L288 190 L283 196 L292 191" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M280 212 L286 210 L282 216 L290 212" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" strokeLinecap="round" />
          {/* Gap / missing boards indication */}
          <path d="M295 165 L340 161" stroke="rgba(255,255,255,0.04)" strokeWidth="1" strokeDasharray="4 6" />
          <path d="M295 185 L340 181" stroke="rgba(255,255,255,0.04)" strokeWidth="1" strokeDasharray="4 6" />
          <path d="M295 205 L340 201" stroke="rgba(255,255,255,0.04)" strokeWidth="1" strokeDasharray="4 6" />
        </motion.g>

        {/* STAR MOMENT: Red circle annotation around damaged area */}
        <motion.circle
          cx="310" cy="190" r="42"
          stroke={markupColor} strokeWidth="2.5"
          animate={{ pathLength: p >= 2 ? 1 : 0, opacity: p >= 2 ? 0.8 : 0 }}
          transition={{ pathLength: { duration: 0.6, ease: drawEase }, opacity: { duration: 0.2 } }}
          filter="url(#markupGlow)"
        />

        {/* Arrow from damaged area to label */}
        <motion.path
          d="M268 185 C230 180 190 150 155 140"
          stroke={markupColor} strokeWidth="2" strokeLinecap="round"
          animate={{ pathLength: p >= 3 ? 1 : 0, opacity: p >= 3 ? 0.8 : 0 }}
          transition={{ pathLength: { duration: 0.5, ease: drawEase }, opacity: { duration: 0.2 } }}
          filter="url(#markupGlow)"
        />
        <motion.path
          d="M160 145 L154 139 L148 145"
          stroke={markupColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          animate={{ opacity: p >= 3 ? 0.8 : 0 }}
          transition={{ duration: 0.2, delay: 0.3 }}
          filter="url(#markupGlow)"
        />

        {/* "REPLACE" label */}
        <motion.g
          animate={{ opacity: p >= 4 ? 1 : 0, x: p >= 4 ? 0 : 8 }}
          transition={spring}
        >
          <rect x="80" y="118" width="80" height="24" rx="3" fill="rgba(229,77,46,0.15)" stroke={markupColor} strokeWidth="1.5" />
          <text x="120" y="134" textAnchor="middle" fontSize="11" fontFamily="var(--font-mohave)" fontWeight="bold" fill={markupColor}>
            REPLACE
          </text>
        </motion.g>

        {/* Measurement line across damaged section */}
        <motion.g animate={{ opacity: p >= 5 ? 1 : 0 }} transition={{ duration: 0.3 }}>
          <motion.path
            d="M275 228 L345 224"
            stroke={markupColor} strokeWidth="1.5"
            animate={{ pathLength: p >= 5 ? 1 : 0 }}
            transition={{ pathLength: { duration: 0.5, ease: drawEase } }}
            filter="url(#markupGlow)"
          />
          <path d="M275 224 L275 232" stroke={markupColor} strokeWidth="1.5" />
          <motion.path d="M345 220 L345 228" stroke={markupColor} strokeWidth="1.5"
            animate={{ opacity: p >= 5 ? 1 : 0 }} transition={{ duration: 0.3, delay: 0.4 }}
          />
        </motion.g>

        {/* Dimension text */}
        <motion.text
          x="310" y="220" textAnchor="middle" fontSize="9" fontFamily="var(--font-kosugi)"
          fill={markupColor}
          animate={{ opacity: p >= 6 ? 0.8 : 0 }}
          transition={{ duration: 0.3 }}
        >
          6&apos; 4&quot;
        </motion.text>

        {/* Second small annotation — cracked post */}
        <motion.circle
          cx="320" cy="30" r="18"
          stroke={markupColor} strokeWidth="2"
          animate={{ pathLength: p >= 7 ? 1 : 0, opacity: p >= 7 ? 0.7 : 0 }}
          transition={{ pathLength: { duration: 0.5, ease: drawEase }, opacity: { duration: 0.2 } }}
          filter="url(#markupGlow)"
        />

        {/* Toolbar at bottom */}
        <motion.g animate={{ opacity: p >= 1 ? 0.4 : 0 }} transition={{ duration: 0.5, delay: 0.3 }}>
          <rect x="140" y="270" width="120" height="20" rx="10" stroke="rgba(255,255,255,0.1)" strokeWidth="1" fill="rgba(255,255,255,0.03)" />
          <circle cx="165" cy="280" r="4" stroke="rgba(255,255,255,0.15)" strokeWidth="1" fill="none" />
          <rect x="182" y="276" width="8" height="8" rx="1" stroke="rgba(255,255,255,0.15)" strokeWidth="1" fill="none" />
          <path d="M205 276 L210 284" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
          <path d="M225 276 L230 280 L235 276" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
        </motion.g>
      </svg>
    </Container>
  );
}
