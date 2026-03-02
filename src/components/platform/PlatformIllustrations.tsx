'use client';

/**
 * PlatformIllustrations — Elite animated SVG illustrations for each platform feature
 *
 * Each illustration:
 *  - Triggers when scrolled into view (useInView)
 *  - Runs a phased animation sequence with spring physics
 *  - Loops with a pause between cycles
 *  - Uses pathLength drawing effects + accent color highlights
 *  - Has a satisfying "star moment"
 *
 * ViewBox: 400 x 300 (4:3 ratio matching the feature block placeholder)
 */

import { useState, useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';

/* ─────────────────────────────────────────────────────────
 * SHARED UTILITIES
 * ───────────────────────────────────────────────────────── */

const ACCENT = '#597794';
const ACCENT_STROKE = 'rgba(89,119,148,0.6)';
const ACCENT_FILL = 'rgba(89,119,148,0.12)';
const ACCENT_GLOW = 'rgba(89,119,148,0.3)';

const spring = { type: 'spring' as const, stiffness: 200, damping: 15 };
const springBouncy = { type: 'spring' as const, stiffness: 300, damping: 12 };
const springGentle = { type: 'spring' as const, stiffness: 120, damping: 18 };
const drawEase = [0.22, 1, 0.36, 1] as const;

/**
 * Phase-based animation sequencer that loops.
 * Returns current phase (-1 = dormant, 0+ = active).
 */
function useSequence(
  inView: boolean,
  phaseCount: number,
  intervalMs = 380,
  loopPauseMs = 3000,
): number {
  const [phase, setPhase] = useState(-1);

  useEffect(() => {
    if (!inView) {
      setPhase(-1);
      return;
    }

    let timers: ReturnType<typeof setTimeout>[] = [];
    let loopTimer: ReturnType<typeof setInterval>;

    const run = () => {
      timers.forEach(clearTimeout);
      timers = [];
      for (let i = 0; i < phaseCount; i++) {
        timers.push(setTimeout(() => setPhase(i), i * intervalMs));
      }
    };

    run();
    const totalDuration = phaseCount * intervalMs + loopPauseMs;
    loopTimer = setInterval(() => {
      setPhase(-1);
      timers.forEach(clearTimeout);
      timers = [];
      setTimeout(run, 600);
    }, totalDuration);

    return () => {
      clearInterval(loopTimer);
      timers.forEach(clearTimeout);
    };
  }, [inView, phaseCount, intervalMs, loopPauseMs]);

  return phase;
}

/** Shared container for all illustrations */
function Container({
  children,
  innerRef,
}: {
  children: React.ReactNode;
  innerRef: React.RefObject<HTMLDivElement | null>;
}) {
  return (
    <div
      ref={innerRef}
      className="w-full aspect-[4/3] bg-gradient-to-br from-ops-surface to-[#080808] border border-ops-border rounded-[3px] overflow-hidden flex items-center justify-center"
    >
      {children}
    </div>
  );
}

/** Shared SVG defs for glow filter */
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
 *
 * Card outline draws → header bar → photo snaps in →
 * text lines slide in → tasks appear + checkbox check →
 * progress bar fills → status badge pops
 * ───────────────────────────────────────────────────────── */

export function ProjectManagementIllustration() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: false, amount: 0.3 });
  const p = useSequence(inView, 8, 380, 3200);

  return (
    <Container innerRef={ref}>
      <svg viewBox="0 0 400 300" className="w-[85%] h-[85%]" fill="none">
        <GlowDefs />

        {/* Base card outline — draws in */}
        <motion.rect
          x="30" y="15" width="340" height="270" rx="6"
          stroke="rgba(255,255,255,0.15)"
          strokeWidth="1.5"
          animate={{ pathLength: p >= 0 ? 1 : 0, opacity: p >= 0 ? 1 : 0.3 }}
          transition={{ pathLength: { duration: 0.8, ease: drawEase }, opacity: { duration: 0.3 } }}
        />

        {/* Header bar */}
        <motion.rect
          x="30" y="15" width="340" height="38" rx="6"
          stroke="rgba(255,255,255,0.12)"
          strokeWidth="1"
          fill="rgba(255,255,255,0.03)"
          animate={{ opacity: p >= 1 ? 1 : 0 }}
          transition={{ duration: 0.3 }}
        />
        <motion.path
          d="M50 34 L180 34"
          stroke="rgba(255,255,255,0.2)"
          strokeWidth="1.5"
          animate={{ pathLength: p >= 1 ? 1 : 0, opacity: p >= 1 ? 1 : 0 }}
          transition={{ pathLength: { duration: 0.5, ease: drawEase }, opacity: { duration: 0.2 } }}
        />

        {/* Photo thumbnail — STAR MOMENT: snaps in with spring bounce */}
        <motion.g
          style={{ transformOrigin: '115px 120px' }}
          animate={{
            scale: p >= 2 ? 1 : 0,
            opacity: p >= 2 ? 1 : 0,
          }}
          transition={springBouncy}
        >
          <rect x="50" y="70" width="130" height="100" rx="4" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
          <rect x="50" y="70" width="130" height="100" rx="4" fill={ACCENT_FILL} />
          {/* Mountain + sun icon inside photo */}
          <path d="M70 150 L95 115 L115 140 L130 120 L160 150" stroke={ACCENT_STROKE} strokeWidth="1.2" fill="none" />
          <circle cx="145" cy="95" r="8" stroke={ACCENT_STROKE} strokeWidth="1" fill="none" />
        </motion.g>

        {/* Text lines — slide in from right */}
        {[0, 1, 2].map((i) => (
          <motion.path
            key={`line-${i}`}
            d={`M200 ${90 + i * 20} L${340 - i * 30} ${90 + i * 20}`}
            stroke="rgba(255,255,255,0.18)"
            strokeWidth="1.5"
            animate={{
              x: p >= 3 ? 0 : 40,
              opacity: p >= 3 ? 1 : 0,
            }}
            transition={{ ...spring, delay: i * 0.08 }}
          />
        ))}

        {/* Task checkboxes */}
        {[0, 1].map((i) => (
          <motion.g key={`task-${i}`}>
            <motion.rect
              x="50" y={195 + i * 30} width="14" height="14" rx="2"
              stroke="rgba(255,255,255,0.2)"
              strokeWidth="1"
              animate={{ opacity: p >= 4 ? 1 : 0, scale: p >= 4 ? 1 : 0.5 }}
              transition={{ ...spring, delay: i * 0.1 }}
            />
            <motion.path
              d={`M75 ${202 + i * 30} L${200 - i * 40} ${202 + i * 30}`}
              stroke="rgba(255,255,255,0.15)"
              strokeWidth="1"
              animate={{ opacity: p >= 4 ? 1 : 0, x: p >= 4 ? 0 : 20 }}
              transition={{ ...spring, delay: i * 0.1 }}
            />
          </motion.g>
        ))}

        {/* Checkmark on first task */}
        <motion.path
          d="M53 202 L56 206 L61 198"
          stroke={ACCENT}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          animate={{ pathLength: p >= 5 ? 1 : 0, opacity: p >= 5 ? 1 : 0 }}
          transition={{ pathLength: { duration: 0.3, ease: drawEase }, opacity: { duration: 0.15 } }}
          filter={p >= 5 ? 'url(#accentGlow)' : undefined}
        />

        {/* Progress bar */}
        <motion.rect
          x="50" y="258" width="300" height="10" rx="5"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth="1"
          fill="rgba(255,255,255,0.02)"
          animate={{ opacity: p >= 6 ? 1 : 0 }}
          transition={{ duration: 0.3 }}
        />
        <motion.rect
          x="50" y="258" width="200" height="10" rx="5"
          fill={ACCENT}
          animate={{
            scaleX: p >= 6 ? 1 : 0,
            opacity: p >= 6 ? 0.6 : 0,
          }}
          style={{ transformOrigin: '50px 263px' }}
          transition={{ duration: 0.8, ease: drawEase }}
          filter={p >= 6 ? 'url(#accentGlow)' : undefined}
        />

        {/* Status badge — pops in top right */}
        <motion.circle
          cx="350" cy="34" r="8"
          fill={ACCENT}
          animate={{
            scale: p >= 7 ? 1 : 0,
            opacity: p >= 7 ? 0.7 : 0,
          }}
          style={{ transformOrigin: '350px 34px' }}
          transition={springBouncy}
          filter={p >= 7 ? 'url(#accentGlow)' : undefined}
        />
      </svg>
    </Container>
  );
}

/* ─────────────────────────────────────────────────────────
 * 2. SCHEDULING — Week at a Glance
 *
 * Grid draws → day headers stagger → time labels fade →
 * crew blocks drop in with bounce → "now" line sweeps →
 * notification dot pops
 * ───────────────────────────────────────────────────────── */

export function SchedulingIllustration() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: false, amount: 0.3 });
  const p = useSequence(inView, 7, 400, 3000);

  const days = ['M', 'T', 'W', 'T', 'F'];
  const times = ['8a', '10a', '12p', '2p'];
  const colW = 58;
  const rowH = 50;
  const gridX = 75;
  const gridY = 50;

  // Crew blocks: [col, row, span, colorIndex]
  const blocks = [
    { col: 0, row: 0, span: 1, color: ACCENT },
    { col: 1, row: 0, span: 2, color: ACCENT },
    { col: 2, row: 1, span: 1, color: 'rgba(255,255,255,0.15)' },
    { col: 0, row: 2, span: 1, color: ACCENT },
    { col: 3, row: 1, span: 1, color: ACCENT },
    { col: 4, row: 0, span: 2, color: 'rgba(255,255,255,0.15)' },
    { col: 1, row: 3, span: 1, color: ACCENT },
    { col: 3, row: 2, span: 2, color: ACCENT },
  ];

  return (
    <Container innerRef={ref}>
      <svg viewBox="0 0 400 300" className="w-[85%] h-[85%]" fill="none">
        <GlowDefs />

        {/* Grid lines — draw in */}
        {/* Vertical */}
        {Array.from({ length: 6 }, (_, i) => (
          <motion.path
            key={`v-${i}`}
            d={`M${gridX + i * colW} ${gridY} L${gridX + i * colW} ${gridY + 4 * rowH}`}
            stroke="rgba(255,255,255,0.08)"
            strokeWidth="1"
            animate={{ pathLength: p >= 0 ? 1 : 0, opacity: p >= 0 ? 1 : 0 }}
            transition={{ pathLength: { duration: 0.5, ease: drawEase, delay: i * 0.05 }, opacity: { duration: 0.2 } }}
          />
        ))}
        {/* Horizontal */}
        {Array.from({ length: 5 }, (_, i) => (
          <motion.path
            key={`h-${i}`}
            d={`M${gridX} ${gridY + i * rowH} L${gridX + 5 * colW} ${gridY + i * rowH}`}
            stroke="rgba(255,255,255,0.08)"
            strokeWidth="1"
            animate={{ pathLength: p >= 0 ? 1 : 0, opacity: p >= 0 ? 1 : 0 }}
            transition={{ pathLength: { duration: 0.5, ease: drawEase, delay: i * 0.05 }, opacity: { duration: 0.2 } }}
          />
        ))}

        {/* Day headers */}
        {days.map((day, i) => (
          <motion.text
            key={day + i}
            x={gridX + i * colW + colW / 2}
            y={gridY - 10}
            textAnchor="middle"
            fontSize="11"
            fontFamily="var(--font-mohave)"
            fill="rgba(255,255,255,0.4)"
            animate={{ opacity: p >= 1 ? 1 : 0, y: p >= 1 ? 0 : -8 }}
            transition={{ ...spring, delay: i * 0.06 }}
          >
            {day}
          </motion.text>
        ))}

        {/* Time labels */}
        {times.map((time, i) => (
          <motion.text
            key={time}
            x={gridX - 10}
            y={gridY + i * rowH + rowH / 2 + 4}
            textAnchor="end"
            fontSize="9"
            fontFamily="var(--font-kosugi)"
            fill="rgba(255,255,255,0.25)"
            animate={{ opacity: p >= 2 ? 1 : 0 }}
            transition={{ duration: 0.3, delay: i * 0.05 }}
          >
            {time}
          </motion.text>
        ))}

        {/* Crew blocks — STAR MOMENT: drop in with satisfying bounce */}
        {blocks.map((block, i) => (
          <motion.rect
            key={`block-${i}`}
            x={gridX + block.col * colW + 3}
            y={gridY + block.row * rowH + 3}
            width={colW - 6}
            height={block.span * rowH - 6}
            rx="3"
            fill={block.color}
            fillOpacity={block.color === ACCENT ? 0.25 : 0.08}
            stroke={block.color === ACCENT ? ACCENT_STROKE : 'rgba(255,255,255,0.1)'}
            strokeWidth="1"
            style={{
              transformOrigin: `${gridX + block.col * colW + colW / 2}px ${gridY + block.row * rowH}px`,
            }}
            animate={{
              scaleY: p >= 3 ? 1 : 0,
              opacity: p >= 3 ? 1 : 0,
            }}
            transition={{ ...springBouncy, delay: i * 0.06 }}
            filter={block.color === ACCENT && p >= 3 ? 'url(#accentGlow)' : undefined}
          />
        ))}

        {/* "Now" line sweeps across */}
        <motion.g
          animate={{ x: p >= 5 ? 0 : -(5 * colW) }}
          transition={{ duration: 1.5, ease: drawEase }}
        >
          <motion.path
            d={`M${gridX} ${gridY + 1.5 * rowH} L${gridX + 5 * colW} ${gridY + 1.5 * rowH}`}
            stroke={ACCENT}
            strokeWidth="2"
            strokeDasharray="4 4"
            animate={{ opacity: p >= 5 ? 0.7 : 0 }}
            transition={{ duration: 0.3 }}
            filter="url(#accentGlow)"
          />
        </motion.g>

        {/* Notification dot */}
        <motion.circle
          cx={gridX + 3 * colW + colW / 2}
          cy={gridY - 10}
          r="5"
          fill="#E54D2E"
          animate={{ scale: p >= 6 ? 1 : 0, opacity: p >= 6 ? 1 : 0 }}
          style={{ transformOrigin: `${gridX + 3 * colW + colW / 2}px ${gridY - 10}px` }}
          transition={springBouncy}
        />
      </svg>
    </Container>
  );
}

/* ─────────────────────────────────────────────────────────
 * 3. TEAM MANAGEMENT — Crew Dashboard
 *
 * Row lines draw → avatars bounce in → names slide →
 * status dots pulse → job badges appear →
 * reassignment arrow draws with glow
 * ───────────────────────────────────────────────────────── */

export function TeamManagementIllustration() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: false, amount: 0.3 });
  const p = useSequence(inView, 7, 400, 3000);

  const rows = [50, 110, 170, 230];
  const statusColors = [ACCENT, ACCENT, '#E5A02E', 'rgba(255,255,255,0.2)'];

  return (
    <Container innerRef={ref}>
      <svg viewBox="0 0 400 300" className="w-[85%] h-[85%]" fill="none">
        <GlowDefs />

        {/* Row separators */}
        {rows.map((y, i) => (
          <motion.path
            key={`row-${i}`}
            d={`M30 ${y + 40} L370 ${y + 40}`}
            stroke="rgba(255,255,255,0.06)"
            strokeWidth="1"
            animate={{ pathLength: p >= 0 ? 1 : 0, opacity: p >= 0 ? 1 : 0 }}
            transition={{ pathLength: { duration: 0.4, ease: drawEase, delay: i * 0.08 }, opacity: { duration: 0.2 } }}
          />
        ))}

        {/* Avatar circles — bounce in */}
        {rows.map((y, i) => (
          <motion.circle
            key={`avatar-${i}`}
            cx="60"
            cy={y + 18}
            r="18"
            stroke="rgba(255,255,255,0.2)"
            strokeWidth="1.5"
            fill="rgba(255,255,255,0.04)"
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
            cx="280"
            cy={y + 18}
            r="5"
            fill={statusColors[i]}
            fillOpacity={statusColors[i] === ACCENT ? 0.7 : 0.5}
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

        {/* STAR MOMENT: Reassignment arrow with glow — member 4 → member 2's job */}
        <motion.path
          d="M60 248 C60 275 340 275 337 128"
          stroke={ACCENT}
          strokeWidth="1.5"
          strokeDasharray="6 3"
          animate={{ pathLength: p >= 5 ? 1 : 0, opacity: p >= 5 ? 0.8 : 0 }}
          transition={{ pathLength: { duration: 0.8, ease: drawEase }, opacity: { duration: 0.2 } }}
          filter="url(#accentGlow)"
        />
        {/* Arrowhead */}
        <motion.path
          d="M332 122 L337 128 L343 122"
          stroke={ACCENT}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
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
 *
 * Card draws → avatar scales in → name appears →
 * contact lines slide → divider draws → project items stagger →
 * star rating fills one by one
 * ───────────────────────────────────────────────────────── */

export function ClientManagementIllustration() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: false, amount: 0.3 });
  const p = useSequence(inView, 8, 370, 3200);

  return (
    <Container innerRef={ref}>
      <svg viewBox="0 0 400 300" className="w-[85%] h-[85%]" fill="none">
        <GlowDefs />

        {/* Card outline */}
        <motion.rect
          x="70" y="10" width="260" height="280" rx="6"
          stroke="rgba(255,255,255,0.15)"
          strokeWidth="1.5"
          animate={{ pathLength: p >= 0 ? 1 : 0, opacity: p >= 0 ? 1 : 0.3 }}
          transition={{ pathLength: { duration: 0.7, ease: drawEase }, opacity: { duration: 0.3 } }}
        />

        {/* Avatar circle */}
        <motion.circle
          cx="200" cy="58" r="28"
          stroke="rgba(255,255,255,0.2)"
          strokeWidth="1.5"
          fill="rgba(255,255,255,0.04)"
          style={{ transformOrigin: '200px 58px' }}
          animate={{ scale: p >= 1 ? 1 : 0, opacity: p >= 1 ? 1 : 0 }}
          transition={springBouncy}
        />
        {/* Avatar person icon */}
        <motion.g
          animate={{ opacity: p >= 1 ? 1 : 0 }}
          transition={{ duration: 0.3, delay: 0.15 }}
        >
          <circle cx="200" cy="50" r="8" stroke="rgba(255,255,255,0.25)" strokeWidth="1" fill="none" />
          <path d="M184 74 C184 62 216 62 216 74" stroke="rgba(255,255,255,0.25)" strokeWidth="1" fill="none" />
        </motion.g>

        {/* Name + company */}
        <motion.g
          animate={{ opacity: p >= 2 ? 1 : 0, y: p >= 2 ? 0 : 8 }}
          transition={spring}
        >
          <path d="M160 102 L240 102" stroke="rgba(255,255,255,0.25)" strokeWidth="2" />
          <path d="M170 116 L230 116" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
        </motion.g>

        {/* Contact info — phone + email */}
        {[0, 1].map((i) => (
          <motion.g
            key={`contact-${i}`}
            animate={{ opacity: p >= 3 ? 1 : 0, x: p >= 3 ? 0 : -20 }}
            transition={{ ...spring, delay: i * 0.1 }}
          >
            {/* Icon placeholder */}
            <rect x="95" y={135 + i * 24} width="12" height="12" rx="2" stroke="rgba(255,255,255,0.15)" strokeWidth="1" fill="none" />
            <path d={`M115 ${141 + i * 24} L${240 - i * 30} ${141 + i * 24}`} stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
          </motion.g>
        ))}

        {/* Divider */}
        <motion.path
          d="M95 190 L305 190"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth="1"
          animate={{ pathLength: p >= 4 ? 1 : 0, opacity: p >= 4 ? 1 : 0 }}
          transition={{ pathLength: { duration: 0.4, ease: drawEase }, opacity: { duration: 0.2 } }}
        />

        {/* "Recent Projects" header */}
        <motion.path
          d="M95 210 L190 210"
          stroke="rgba(255,255,255,0.2)"
          strokeWidth="1.5"
          animate={{ opacity: p >= 5 ? 1 : 0 }}
          transition={{ duration: 0.3 }}
        />

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

        {/* STAR MOMENT: Star rating fills one by one */}
        {[0, 1, 2, 3, 4].map((i) => (
          <motion.text
            key={`star-${i}`}
            x={270 + i * 14}
            y={213}
            fontSize="11"
            fill={ACCENT}
            animate={{ opacity: p >= 7 ? 0.8 : 0, scale: p >= 7 ? 1 : 0.3 }}
            style={{ transformOrigin: `${270 + i * 14}px 210px` }}
            transition={{ ...springBouncy, delay: i * 0.08 }}
            filter={p >= 7 ? 'url(#accentGlow)' : undefined}
          >
            ★
          </motion.text>
        ))}
      </svg>
    </Container>
  );
}

/* ─────────────────────────────────────────────────────────
 * 5. INVOICING — Invoice Flow
 *
 * Invoice outline draws → header appears → line items type →
 * amounts populate → divider + subtotal → total highlights →
 * "PAID" stamp SLAMS in with massive bounce
 * ───────────────────────────────────────────────────────── */

export function InvoicingIllustration() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: false, amount: 0.3 });
  const p = useSequence(inView, 8, 400, 3500);

  return (
    <Container innerRef={ref}>
      <svg viewBox="0 0 400 300" className="w-[85%] h-[85%]" fill="none">
        <GlowDefs />

        {/* Invoice outline */}
        <motion.rect
          x="60" y="10" width="280" height="280" rx="4"
          stroke="rgba(255,255,255,0.15)"
          strokeWidth="1.5"
          animate={{ pathLength: p >= 0 ? 1 : 0, opacity: p >= 0 ? 1 : 0.3 }}
          transition={{ pathLength: { duration: 0.7, ease: drawEase }, opacity: { duration: 0.3 } }}
        />

        {/* Header area */}
        <motion.g
          animate={{ opacity: p >= 1 ? 1 : 0, y: p >= 1 ? 0 : -10 }}
          transition={spring}
        >
          <path d="M85 35 L200 35" stroke="rgba(255,255,255,0.25)" strokeWidth="2" />
          <path d="M85 48 L160 48" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
          <path d="M260 30 L315 30" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
          <path d="M260 42 L315 42" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
        </motion.g>

        {/* Column headers */}
        <motion.g
          animate={{ opacity: p >= 2 ? 1 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <path d="M85 75 L180 75" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
          <path d="M260 75 L315 75" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
          <path d="M85 80 L315 80" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
        </motion.g>

        {/* Line items — type out one by one */}
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

        {/* Amounts — appear with spring */}
        {[0, 1, 2].map((i) => (
          <motion.path
            key={`amt-${i}`}
            d={`M280 ${100 + i * 30} L315 ${100 + i * 30}`}
            stroke="rgba(255,255,255,0.2)"
            strokeWidth="1.5"
            animate={{ opacity: p >= 4 ? 1 : 0, x: p >= 4 ? 0 : 10 }}
            transition={{ ...spring, delay: i * 0.1 }}
          />
        ))}

        {/* Divider + subtotal */}
        <motion.g
          animate={{ opacity: p >= 5 ? 1 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <path d="M200 200 L315 200" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
          <path d="M220 215 L280 215" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
          <path d="M290 215 L315 215" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
          <path d="M220 230 L280 230" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
          <path d="M290 230 L315 230" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
        </motion.g>

        {/* Total line — accent highlight */}
        <motion.g
          animate={{ opacity: p >= 6 ? 1 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <path d="M200 248 L315 248" stroke={ACCENT_STROKE} strokeWidth="1.5" />
          <path d="M220 262 L280 262" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" />
          <path d="M285 262 L315 262" stroke={ACCENT} strokeWidth="2" filter="url(#accentGlow)" />
        </motion.g>

        {/* STAR MOMENT: "PAID" stamp slams in with massive bounce */}
        <motion.g
          style={{ transformOrigin: '160px 180px' }}
          animate={{
            scale: p >= 7 ? 1 : 0,
            rotate: p >= 7 ? -12 : -40,
            opacity: p >= 7 ? 1 : 0,
          }}
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
 *
 * Columns draw → headers appear → cards populate →
 * card slides LEAD → ACTIVE → card slides ACTIVE → DONE →
 * checkmark draws on completed card
 * ───────────────────────────────────────────────────────── */

export function JobBoardIllustration() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: false, amount: 0.3 });
  const p = useSequence(inView, 8, 420, 3000);

  const colX = [20, 148, 276];
  const colW = 110;
  const headerY = 25;
  const headers = ['LEADS', 'ACTIVE', 'DONE'];

  return (
    <Container innerRef={ref}>
      <svg viewBox="0 0 400 300" className="w-[85%] h-[85%]" fill="none">
        <GlowDefs />

        {/* Column backgrounds */}
        {colX.map((x, i) => (
          <motion.rect
            key={`col-${i}`}
            x={x} y="15" width={colW} height="270" rx="4"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth="1"
            fill="rgba(255,255,255,0.02)"
            animate={{ opacity: p >= 0 ? 1 : 0 }}
            transition={{ duration: 0.4, delay: i * 0.1 }}
          />
        ))}

        {/* Column headers */}
        {headers.map((header, i) => (
          <motion.text
            key={header}
            x={colX[i] + colW / 2}
            y={headerY + 10}
            textAnchor="middle"
            fontSize="10"
            fontFamily="var(--font-mohave)"
            fontWeight="bold"
            fill="rgba(255,255,255,0.35)"
            animate={{ opacity: p >= 1 ? 1 : 0, y: p >= 1 ? 0 : -5 }}
            transition={{ ...spring, delay: i * 0.08 }}
          >
            {header}
          </motion.text>
        ))}

        {/* Header underlines */}
        {colX.map((x, i) => (
          <motion.path
            key={`hline-${i}`}
            d={`M${x + 8} ${headerY + 18} L${x + colW - 8} ${headerY + 18}`}
            stroke="rgba(255,255,255,0.08)"
            strokeWidth="1"
            animate={{ pathLength: p >= 1 ? 1 : 0, opacity: p >= 1 ? 1 : 0 }}
            transition={{ pathLength: { duration: 0.3, ease: drawEase }, opacity: { duration: 0.2 } }}
          />
        ))}

        {/* Static cards in LEADS column */}
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

        {/* STAR MOMENT: Card slides from LEADS → ACTIVE */}
        <motion.g
          animate={{
            x: p >= 4 ? colX[1] - colX[0] : 0,
            y: p >= 4 ? 0 : 0,
          }}
          transition={{ type: 'spring', stiffness: 150, damping: 14 }}
        >
          <motion.g
            animate={{ opacity: p >= 3 ? 1 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <rect x={colX[0] + 8} y="205" width={colW - 16} height="38" rx="3" stroke={ACCENT_STROKE} strokeWidth="1.5" fill={ACCENT_FILL} filter={p >= 4 ? 'url(#accentGlow)' : undefined} />
            <path d={`M${colX[0] + 16} 218 L${colX[0] + colW - 24} 218`} stroke={ACCENT_STROKE} strokeWidth="1" />
            <path d={`M${colX[0] + 16} 228 L${colX[0] + 50} 228`} stroke="rgba(89,119,148,0.3)" strokeWidth="1" />
          </motion.g>
        </motion.g>

        {/* Card slides from ACTIVE → DONE */}
        <motion.g
          animate={{
            x: p >= 6 ? colX[2] - colX[1] : 0,
          }}
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

        {/* Checkmark on completed card */}
        <motion.path
          d={`M${colX[2] + colW - 28} 62 L${colX[2] + colW - 24} 68 L${colX[2] + colW - 16} 58`}
          stroke={ACCENT}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          animate={{ pathLength: p >= 7 ? 1 : 0, opacity: p >= 7 ? 1 : 0 }}
          transition={{ pathLength: { duration: 0.3, ease: drawEase }, opacity: { duration: 0.15 } }}
          filter="url(#accentGlow)"
        />
      </svg>
    </Container>
  );
}

/* ─────────────────────────────────────────────────────────
 * 7. PIPELINE — Sales Funnel Flow
 *
 * Funnel shape draws → stage dividers → labels appear →
 * lead dots flow through stages → some exit → dollars accumulate →
 * conversion percentage counter
 * ───────────────────────────────────────────────────────── */

export function PipelineIllustration() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: false, amount: 0.3 });
  const p = useSequence(inView, 8, 420, 3200);

  const stages = ['NEW', 'QUAL', 'PROP', 'CLOSE'];
  const funnelTop = 40;
  const funnelBot = 240;

  return (
    <Container innerRef={ref}>
      <svg viewBox="0 0 400 300" className="w-[85%] h-[85%]" fill="none">
        <GlowDefs />

        {/* Funnel shape — trapezoid */}
        <motion.path
          d="M40 40 L360 40 L300 240 L100 240 Z"
          stroke="rgba(255,255,255,0.15)"
          strokeWidth="1.5"
          strokeLinejoin="round"
          animate={{ pathLength: p >= 0 ? 1 : 0, opacity: p >= 0 ? 1 : 0.3 }}
          transition={{ pathLength: { duration: 0.8, ease: drawEase }, opacity: { duration: 0.3 } }}
        />

        {/* Stage dividers */}
        {[0, 1, 2].map((i) => {
          const y = funnelTop + (i + 1) * ((funnelBot - funnelTop) / 4);
          const shrink = ((i + 1) * 15);
          return (
            <motion.path
              key={`div-${i}`}
              d={`M${40 + shrink} ${y} L${360 - shrink} ${y}`}
              stroke="rgba(255,255,255,0.08)"
              strokeWidth="1"
              animate={{ pathLength: p >= 1 ? 1 : 0, opacity: p >= 1 ? 1 : 0 }}
              transition={{ pathLength: { duration: 0.3, ease: drawEase, delay: i * 0.1 }, opacity: { duration: 0.2 } }}
            />
          );
        })}

        {/* Stage labels */}
        {stages.map((label, i) => {
          const y = funnelTop + i * ((funnelBot - funnelTop) / 4) + 28;
          return (
            <motion.text
              key={label}
              x="200"
              y={y}
              textAnchor="middle"
              fontSize="10"
              fontFamily="var(--font-mohave)"
              fill="rgba(255,255,255,0.3)"
              animate={{ opacity: p >= 2 ? 1 : 0 }}
              transition={{ duration: 0.3, delay: i * 0.08 }}
            >
              {label}
            </motion.text>
          );
        })}

        {/* Lead dots entering funnel */}
        {[0, 1, 2, 3, 4].map((i) => (
          <motion.circle
            key={`dot-${i}`}
            cx={120 + i * 40}
            r="5"
            fill={ACCENT}
            fillOpacity={0.6}
            animate={{
              cy: p >= 3 ? funnelTop + 15 : funnelTop - 20,
              opacity: p >= 3 ? 1 : 0,
            }}
            transition={{ ...springBouncy, delay: i * 0.06 }}
          />
        ))}

        {/* Dots flowing down (survivors) */}
        {[0, 1, 2].map((i) => (
          <motion.circle
            key={`flow-${i}`}
            cx={160 + i * 40}
            r="5"
            fill={ACCENT}
            fillOpacity={0.7}
            animate={{
              cy: p >= 5 ? funnelBot - 15 : p >= 4 ? funnelTop + 65 + i * 50 : funnelTop + 15,
              opacity: p >= 4 ? 1 : 0,
            }}
            transition={{ duration: 0.8, ease: drawEase }}
            filter={p >= 5 ? 'url(#accentGlow)' : undefined}
          />
        ))}

        {/* Exiting dots (lost leads) */}
        {[0, 1].map((i) => (
          <motion.circle
            key={`lost-${i}`}
            cx={140 + i * 120}
            r="4"
            fill="rgba(255,255,255,0.2)"
            animate={{
              cx: p >= 5 ? (i === 0 ? 20 : 380) : 140 + i * 120,
              cy: p >= 5 ? 120 + i * 60 : funnelTop + 65,
              opacity: p >= 4 ? (p >= 6 ? 0 : 0.5) : 0,
            }}
            transition={{ duration: 0.6, ease: drawEase }}
          />
        ))}

        {/* STAR MOMENT: Dollar signs accumulate at bottom */}
        {[0, 1, 2].map((i) => (
          <motion.text
            key={`dollar-${i}`}
            x={170 + i * 30}
            y={268}
            textAnchor="middle"
            fontSize="18"
            fill={ACCENT}
            animate={{
              opacity: p >= 6 ? 0.8 : 0,
              scale: p >= 6 ? 1 : 0.3,
              y: p >= 6 ? 0 : 10,
            }}
            style={{ transformOrigin: `${170 + i * 30}px 268px` }}
            transition={{ ...springBouncy, delay: i * 0.1 }}
            filter="url(#accentGlow)"
          >
            $
          </motion.text>
        ))}

        {/* Conversion rate */}
        <motion.text
          x="200"
          y={290}
          textAnchor="middle"
          fontSize="11"
          fontFamily="var(--font-kosugi)"
          fill="rgba(255,255,255,0.35)"
          animate={{ opacity: p >= 7 ? 1 : 0 }}
          transition={{ duration: 0.3 }}
        >
          60% CONVERSION
        </motion.text>
      </svg>
    </Container>
  );
}

/* ─────────────────────────────────────────────────────────
 * 8. INVENTORY — Stock Dashboard
 *
 * Grid draws → item icons appear → names fade →
 * quantity bars fill → one bar turns red → alert icon →
 * restock arrow animates
 * ───────────────────────────────────────────────────────── */

export function InventoryIllustration() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: false, amount: 0.3 });
  const p = useSequence(inView, 8, 380, 3000);

  const items = [
    { x: 25, y: 20, level: 0.85, label: '2x4 STUDS' },
    { x: 150, y: 20, level: 0.6, label: 'SCREWS' },
    { x: 275, y: 20, level: 0.15, label: 'BRACKETS', low: true },
    { x: 25, y: 160, level: 0.7, label: 'NAILS' },
    { x: 150, y: 160, level: 0.45, label: 'CAULK' },
    { x: 275, y: 160, level: 0.9, label: 'TAPE' },
  ];

  const cellW = 110;
  const cellH = 120;
  const barH = 30;

  return (
    <Container innerRef={ref}>
      <svg viewBox="0 0 400 300" className="w-[85%] h-[85%]" fill="none">
        <GlowDefs />

        {/* Grid cells */}
        {items.map((item, i) => (
          <motion.rect
            key={`cell-${i}`}
            x={item.x} y={item.y} width={cellW} height={cellH} rx="4"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth="1"
            fill="rgba(255,255,255,0.02)"
            animate={{ opacity: p >= 0 ? 1 : 0 }}
            transition={{ duration: 0.3, delay: i * 0.05 }}
          />
        ))}

        {/* Item icons — simple box */}
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
            x={item.x + cellW / 2}
            y={item.y + 60}
            textAnchor="middle"
            fontSize="8"
            fontFamily="var(--font-mohave)"
            fill="rgba(255,255,255,0.3)"
            animate={{ opacity: p >= 2 ? 1 : 0 }}
            transition={{ duration: 0.3, delay: i * 0.04 }}
          >
            {item.label}
          </motion.text>
        ))}

        {/* Quantity bar backgrounds */}
        {items.map((item, i) => (
          <motion.rect
            key={`bar-bg-${i}`}
            x={item.x + 10} y={item.y + cellH - barH - 10} width={cellW - 20} height={barH} rx="3"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth="1"
            fill="rgba(255,255,255,0.02)"
            animate={{ opacity: p >= 3 ? 1 : 0 }}
            transition={{ duration: 0.3 }}
          />
        ))}

        {/* Quantity bar fills */}
        {items.map((item, i) => (
          <motion.rect
            key={`bar-${i}`}
            x={item.x + 10}
            y={item.y + cellH - barH - 10}
            width={(cellW - 20) * item.level}
            height={barH}
            rx="3"
            fill={item.low ? '#E54D2E' : ACCENT}
            fillOpacity={item.low ? 0.4 : 0.2}
            stroke={item.low ? 'rgba(229,77,46,0.5)' : ACCENT_STROKE}
            strokeWidth="1"
            style={{ transformOrigin: `${item.x + 10}px ${item.y + cellH - barH - 10 + barH / 2}px` }}
            animate={{
              scaleX: p >= 4 ? 1 : 0,
              opacity: p >= 4 ? 1 : 0,
            }}
            transition={{ duration: 0.6, ease: drawEase, delay: i * 0.06 }}
            filter={item.low && p >= 5 ? undefined : (p >= 4 ? 'url(#accentGlow)' : undefined)}
          />
        ))}

        {/* STAR MOMENT: Low stock alert — red pulse */}
        <motion.g
          animate={{
            opacity: p >= 5 ? [0, 1, 1, 0.5, 1] : 0,
          }}
          transition={{ duration: 1.5, repeat: p >= 5 ? Infinity : 0, repeatType: 'mirror' }}
        >
          <circle cx={275 + cellW - 5} cy={25} r="8" fill="#E54D2E" fillOpacity="0.6" filter="url(#accentGlow)" />
          <text x={275 + cellW - 5} y={28} textAnchor="middle" fontSize="10" fill="white" fontWeight="bold">!</text>
        </motion.g>

        {/* Restock arrow */}
        <motion.path
          d={`M${275 + cellW / 2} ${20 + cellH + 5} L${275 + cellW / 2} ${20 + cellH + 25}`}
          stroke={ACCENT}
          strokeWidth="1.5"
          markerEnd="url(#arrowhead)"
          animate={{ pathLength: p >= 6 ? 1 : 0, opacity: p >= 6 ? 0.7 : 0 }}
          transition={{ pathLength: { duration: 0.4, ease: drawEase }, opacity: { duration: 0.2 } }}
          filter="url(#accentGlow)"
        />

        {/* Restock label */}
        <motion.text
          x={275 + cellW / 2}
          y={20 + cellH + 38}
          textAnchor="middle"
          fontSize="8"
          fontFamily="var(--font-mohave)"
          fill={ACCENT}
          animate={{ opacity: p >= 7 ? 0.7 : 0 }}
          transition={{ duration: 0.3 }}
        >
          REORDER
        </motion.text>
      </svg>
    </Container>
  );
}

/* ─────────────────────────────────────────────────────────
 * 9. PHOTO MARKUP — Site Documentation
 *
 * Photo frame draws → landscape image fades in →
 * red circle draws around point → arrow draws →
 * text label types → measurement line draws →
 * second annotation circle
 * ───────────────────────────────────────────────────────── */

export function PhotoMarkupIllustration() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: false, amount: 0.3 });
  const p = useSequence(inView, 8, 400, 3200);

  const markupColor = '#E54D2E';

  return (
    <Container innerRef={ref}>
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
          stroke="rgba(255,255,255,0.15)"
          strokeWidth="1.5"
          animate={{ pathLength: p >= 0 ? 1 : 0, opacity: p >= 0 ? 1 : 0.3 }}
          transition={{ pathLength: { duration: 0.7, ease: drawEase }, opacity: { duration: 0.3 } }}
        />

        {/* Landscape image — mountain + sky + sun */}
        <motion.g
          animate={{ opacity: p >= 1 ? 1 : 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Sky gradient feel */}
          <rect x="31" y="16" width="338" height="248" rx="3" fill="rgba(255,255,255,0.02)" />
          {/* Mountain range */}
          <path d="M31 220 L100 120 L150 170 L200 90 L260 150 L320 100 L369 180 L369 264 L31 264 Z" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
          {/* Sun */}
          <circle cx="310" cy="55" r="18" stroke="rgba(255,255,255,0.1)" strokeWidth="1" fill="rgba(255,255,255,0.03)" />
          {/* Building/structure wireframe */}
          <rect x="80" y="155" width="60" height="80" stroke="rgba(255,255,255,0.08)" strokeWidth="1" fill="rgba(255,255,255,0.02)" />
          <path d="M80 155 L110 135 L140 155" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
          <rect x="95" y="195" width="15" height="25" stroke="rgba(255,255,255,0.06)" strokeWidth="1" fill="none" />
          <rect x="120" y="170" width="10" height="10" stroke="rgba(255,255,255,0.06)" strokeWidth="1" fill="none" />
        </motion.g>

        {/* STAR MOMENT: Red circle annotation draws around damage point */}
        <motion.circle
          cx="120" cy="175"
          r="35"
          stroke={markupColor}
          strokeWidth="2.5"
          animate={{ pathLength: p >= 2 ? 1 : 0, opacity: p >= 2 ? 0.8 : 0 }}
          transition={{ pathLength: { duration: 0.6, ease: drawEase }, opacity: { duration: 0.2 } }}
          filter="url(#markupGlow)"
        />

        {/* Arrow annotation — curves from circle to label area */}
        <motion.path
          d="M155 170 C200 165 220 130 260 120"
          stroke={markupColor}
          strokeWidth="2"
          strokeLinecap="round"
          animate={{ pathLength: p >= 3 ? 1 : 0, opacity: p >= 3 ? 0.8 : 0 }}
          transition={{ pathLength: { duration: 0.5, ease: drawEase }, opacity: { duration: 0.2 } }}
          filter="url(#markupGlow)"
        />
        {/* Arrowhead */}
        <motion.path
          d="M255 125 L262 119 L258 113"
          stroke={markupColor}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          animate={{ opacity: p >= 3 ? 0.8 : 0 }}
          transition={{ duration: 0.2, delay: 0.3 }}
          filter="url(#markupGlow)"
        />

        {/* Text label */}
        <motion.g
          animate={{ opacity: p >= 4 ? 1 : 0, x: p >= 4 ? 0 : 8 }}
          transition={spring}
        >
          <rect x="260" y="106" width="65" height="22" rx="2" fill="rgba(229,77,46,0.15)" stroke={markupColor} strokeWidth="1" />
          <text x="293" y="121" textAnchor="middle" fontSize="10" fontFamily="var(--font-mohave)" fontWeight="bold" fill={markupColor}>
            REPAIR
          </text>
        </motion.g>

        {/* Measurement line — horizontal with end markers */}
        <motion.g
          animate={{ opacity: p >= 5 ? 1 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <motion.path
            d="M200 220 L340 220"
            stroke={markupColor}
            strokeWidth="1.5"
            animate={{ pathLength: p >= 5 ? 1 : 0 }}
            transition={{ pathLength: { duration: 0.5, ease: drawEase } }}
            filter="url(#markupGlow)"
          />
          {/* End markers */}
          <path d="M200 215 L200 225" stroke={markupColor} strokeWidth="1.5" />
          <motion.path
            d="M340 215 L340 225"
            stroke={markupColor}
            strokeWidth="1.5"
            animate={{ opacity: p >= 5 ? 1 : 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
          />
          {/* Dimension text */}
          <motion.text
            x="270" y="215"
            textAnchor="middle"
            fontSize="9"
            fontFamily="var(--font-kosugi)"
            fill={markupColor}
            animate={{ opacity: p >= 6 ? 0.8 : 0 }}
            transition={{ duration: 0.3 }}
          >
            12&apos; 6&quot;
          </motion.text>
        </motion.g>

        {/* Second circle annotation */}
        <motion.circle
          cx="300" cy="100"
          r="22"
          stroke={markupColor}
          strokeWidth="2"
          animate={{ pathLength: p >= 7 ? 1 : 0, opacity: p >= 7 ? 0.7 : 0 }}
          transition={{ pathLength: { duration: 0.5, ease: drawEase }, opacity: { duration: 0.2 } }}
          filter="url(#markupGlow)"
        />

        {/* Toolbar hint at bottom */}
        <motion.g
          animate={{ opacity: p >= 1 ? 0.4 : 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <rect x="140" y="270" width="120" height="20" rx="10" stroke="rgba(255,255,255,0.1)" strokeWidth="1" fill="rgba(255,255,255,0.03)" />
          {/* Tool icons */}
          <circle cx="165" cy="280" r="4" stroke="rgba(255,255,255,0.15)" strokeWidth="1" fill="none" />
          <rect x="182" y="276" width="8" height="8" rx="1" stroke="rgba(255,255,255,0.15)" strokeWidth="1" fill="none" />
          <path d="M205 276 L210 284" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
          <path d="M225 276 L230 280 L235 276" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
        </motion.g>
      </svg>
    </Container>
  );
}
