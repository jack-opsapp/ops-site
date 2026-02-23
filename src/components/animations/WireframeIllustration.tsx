'use client';

/**
 * WireframeIllustration — Animated SVG wireframes for PainPointCards
 *
 * Three variants:
 *   messages  — Group text chaos: bubbles appear sequentially, then jitter
 *   dashboard — Enterprise clutter: clean card gets buried in UI chrome
 *   apps      — Tool sprawl: icons scatter apart, dollar signs appear in gaps
 *
 * Controlled by isActive prop (driven by parent card hover).
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface WireframeIllustrationProps {
  variant: 'messages' | 'dashboard' | 'apps';
  isActive: boolean;
  size?: number;
}

/* ────────────────────────────────────────────
 * MESSAGES VARIANT — Group Text Hell
 * ──────────────────────────────────────────── */

function MessagesIllustration({ isActive, size }: { isActive: boolean; size: number }) {
  const [phase, setPhase] = useState(0);
  // Phases: 0=idle, 1=bubble1, 2=dots, 3=question, 4=bubble2, 5=bubble3, 6=chaos

  useEffect(() => {
    if (!isActive) {
      setPhase(0);
      return;
    }

    setPhase(1);
    const timers: ReturnType<typeof setTimeout>[] = [];

    timers.push(setTimeout(() => setPhase(2), 400));   // typing dots
    timers.push(setTimeout(() => setPhase(3), 800));   // ? confusion
    timers.push(setTimeout(() => setPhase(4), 1200));  // bubble 2
    timers.push(setTimeout(() => setPhase(5), 1800));  // bubble 3
    timers.push(setTimeout(() => setPhase(6), 2400));  // chaos jitter

    return () => timers.forEach(clearTimeout);
  }, [isActive]);

  const bubbleSpring = { type: 'spring' as const, stiffness: 180, damping: 14 };

  // Chaos jitter keyframes — includes opacity/scale so callers don't duplicate
  const jitterBubble = (seed: number) => ({
    opacity: 1,
    scale: 1,
    x: [0, 2 * Math.sin(seed), -3 * Math.cos(seed), 1.5, -2, 0],
    y: [0, -2 * Math.cos(seed), 3 * Math.sin(seed), -1.5, 2, 0],
    rotate: [0, seed % 3 - 1.5, -(seed % 3 - 1.5), seed % 2 - 1, 0],
  });

  const jitterText = (seed: number, baseOpacity: number) => ({
    opacity: baseOpacity,
    scale: 1,
    x: [0, 2 * Math.sin(seed), -3 * Math.cos(seed), 1.5, -2, 0],
    y: [0, -2 * Math.cos(seed), 3 * Math.sin(seed), -1.5, 2, 0],
    rotate: [0, seed % 3 - 1.5, -(seed % 3 - 1.5), seed % 2 - 1, 0],
  });

  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      className="text-white/30"
    >
      {/* Bubble 1 — left side */}
      <motion.g
        initial={isActive ? { opacity: 0, scale: 0.7, y: 10 } : { opacity: 1, scale: 1, y: 0 }}
        animate={
          phase >= 6
            ? jitterBubble(1)
            : phase >= 1
            ? { opacity: 1, scale: 1, y: 0 }
            : { opacity: 1, scale: 1, y: 0 }
        }
        transition={phase >= 6 ? { duration: 0.8, repeat: Infinity, repeatType: 'mirror' } : bubbleSpring}
      >
        <motion.rect x="20" y="40" width="90" height="36" rx="4" />
        {/* Text lines inside bubble */}
        <motion.line x1="30" y1="52" x2="80" y2="52" strokeWidth="1" />
        <motion.line x1="30" y1="60" x2="68" y2="60" strokeWidth="1" />
        {/* Tail */}
        <motion.path d="M30 76 L24 86 L42 76" strokeWidth="1" />
      </motion.g>

      {/* Typing dots — appear in phase 2 */}
      <motion.g
        initial={{ opacity: 0 }}
        animate={phase >= 2 && phase < 4 ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        <motion.circle cx="30" cy="100" r="2" fill="currentColor"
          animate={phase >= 2 ? { opacity: [0.3, 1, 0.3] } : {}}
          transition={{ duration: 0.8, repeat: Infinity, delay: 0 }}
        />
        <motion.circle cx="40" cy="100" r="2" fill="currentColor"
          animate={phase >= 2 ? { opacity: [0.3, 1, 0.3] } : {}}
          transition={{ duration: 0.8, repeat: Infinity, delay: 0.2 }}
        />
        <motion.circle cx="50" cy="100" r="2" fill="currentColor"
          animate={phase >= 2 ? { opacity: [0.3, 1, 0.3] } : {}}
          transition={{ duration: 0.8, repeat: Infinity, delay: 0.4 }}
        />
      </motion.g>

      {/* Question mark — appears in phase 3 */}
      <motion.text
        x="160"
        y="55"
        fontSize="24"
        fill="currentColor"
        stroke="none"
        initial={{ opacity: 0, scale: 0.5 }}
        animate={
          phase >= 6
            ? jitterText(3.7, 0.8)
            : phase >= 3
            ? { opacity: 0.8, scale: 1 }
            : { opacity: 0, scale: 0.5 }
        }
        transition={phase >= 6 ? { duration: 1, repeat: Infinity, repeatType: 'mirror' } : bubbleSpring}
      >
        ?
      </motion.text>

      {/* Bubble 2 — right side */}
      <motion.g
        initial={isActive ? { opacity: 0, scale: 0.7, y: 10 } : { opacity: 1, scale: 1, y: 0 }}
        animate={
          phase >= 6
            ? jitterBubble(2.3)
            : phase >= 4
            ? { opacity: 1, scale: 1, y: 0 }
            : isActive
            ? { opacity: 0, scale: 0.7, y: 10 }
            : { opacity: 1, scale: 1, y: 0 }
        }
        transition={phase >= 6 ? { duration: 0.7, repeat: Infinity, repeatType: 'mirror' } : bubbleSpring}
      >
        <motion.rect x="90" y="90" width="90" height="36" rx="4" />
        <motion.line x1="100" y1="102" x2="155" y2="102" strokeWidth="1" />
        <motion.line x1="100" y1="110" x2="140" y2="110" strokeWidth="1" />
        {/* Tail — right side */}
        <motion.path d="M168 126 L176 136 L158 126" strokeWidth="1" />
      </motion.g>

      {/* Bubble 3 — bottom left, overlapping */}
      <motion.g
        initial={isActive ? { opacity: 0, scale: 0.7, y: 10 } : { opacity: 1, scale: 1, y: 0 }}
        animate={
          phase >= 6
            ? jitterBubble(4.1)
            : phase >= 5
            ? { opacity: 1, scale: 1, y: 0 }
            : isActive
            ? { opacity: 0, scale: 0.7, y: 10 }
            : { opacity: 1, scale: 1, y: 0 }
        }
        transition={phase >= 6 ? { duration: 0.9, repeat: Infinity, repeatType: 'mirror' } : bubbleSpring}
      >
        <motion.rect x="10" y="136" width="100" height="36" rx="4" />
        <motion.line x1="20" y1="148" x2="85" y2="148" strokeWidth="1" />
        <motion.line x1="20" y1="156" x2="70" y2="156" strokeWidth="1" />
        <motion.path d="M24 172 L18 182 L36 172" strokeWidth="1" />
      </motion.g>

      {/* Extra question mark in chaos */}
      <motion.text
        x="130"
        y="170"
        fontSize="18"
        fill="currentColor"
        stroke="none"
        initial={{ opacity: 0, scale: 0.5 }}
        animate={
          phase >= 6
            ? jitterText(5.2, 0.6)
            : { opacity: 0, scale: 0.5 }
        }
        transition={phase >= 6 ? { duration: 0.6, repeat: Infinity, repeatType: 'mirror' } : bubbleSpring}
      >
        ?
      </motion.text>
    </motion.svg>
  );
}

/* ────────────────────────────────────────────
 * DASHBOARD VARIANT — Enterprise Overkill
 * ──────────────────────────────────────────── */

function DashboardIllustration({ isActive, size }: { isActive: boolean; size: number }) {
  const clutterSpring = { type: 'spring' as const, stiffness: 140, damping: 16 };

  const clutterIn = (delay: number) => ({
    initial: { opacity: 0, scale: 0.9 },
    animate: isActive
      ? { opacity: 1, scale: 1 }
      : { opacity: 0, scale: 0.9 },
    transition: { ...clutterSpring, delay: isActive ? delay : 0 },
  });

  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      className="text-white/30"
    >
      {/* Base simple card — always visible */}
      <motion.rect x="40" y="40" width="120" height="120" rx="3" />
      {/* Two clean content lines */}
      <motion.line x1="55" y1="80" x2="145" y2="80" strokeWidth="1" />
      <motion.line x1="55" y1="95" x2="125" y2="95" strokeWidth="1" />

      {/* CLUTTER ELEMENTS — only appear when active */}

      {/* Top header bar */}
      <motion.g {...clutterIn(0)}>
        <motion.rect x="40" y="40" width="120" height="20" rx="2" strokeWidth="1" />
        <motion.line x1="48" y1="50" x2="68" y2="50" strokeWidth="1" />
        <motion.circle cx="150" cy="50" r="3" strokeWidth="1" />
      </motion.g>

      {/* Left sidebar */}
      <motion.g {...clutterIn(0.15)}>
        <motion.rect x="10" y="40" width="30" height="120" rx="2" />
        {/* Sidebar menu items */}
        <motion.line x1="16" y1="54" x2="34" y2="54" strokeWidth="1" />
        <motion.line x1="16" y1="64" x2="30" y2="64" strokeWidth="1" />
        <motion.line x1="16" y1="74" x2="32" y2="74" strokeWidth="1" />
        <motion.line x1="16" y1="84" x2="28" y2="84" strokeWidth="1" />
        <motion.line x1="16" y1="94" x2="34" y2="94" strokeWidth="1" />
        <motion.line x1="16" y1="104" x2="26" y2="104" strokeWidth="1" />
      </motion.g>

      {/* Right sidebar / panel */}
      <motion.g {...clutterIn(0.3)}>
        <motion.rect x="160" y="60" width="30" height="100" rx="2" />
        <motion.line x1="166" y1="74" x2="184" y2="74" strokeWidth="1" />
        <motion.line x1="166" y1="84" x2="180" y2="84" strokeWidth="1" />
        <motion.line x1="166" y1="94" x2="182" y2="94" strokeWidth="1" />
      </motion.g>

      {/* Tab row */}
      <motion.g {...clutterIn(0.45)}>
        <motion.line x1="48" y1="66" x2="68" y2="66" strokeWidth="1" />
        <motion.line x1="74" y1="66" x2="94" y2="66" strokeWidth="1" />
        <motion.line x1="100" y1="66" x2="120" y2="66" strokeWidth="1" />
        {/* Active tab indicator */}
        <motion.line x1="48" y1="68" x2="68" y2="68" strokeWidth="2" />
      </motion.g>

      {/* Toggle switches row */}
      <motion.g {...clutterIn(0.6)}>
        <motion.rect x="55" y="108" width="16" height="8" rx="4" />
        <motion.circle cx="67" cy="112" r="3" fill="currentColor" strokeWidth="0" />
        <motion.rect x="80" y="108" width="16" height="8" rx="4" />
        <motion.circle cx="84" cy="112" r="3" fill="currentColor" strokeWidth="0" />
      </motion.g>

      {/* Mini chart in corner */}
      <motion.g {...clutterIn(0.75)}>
        <motion.rect x="55" y="122" width="40" height="25" rx="2" />
        <motion.path d="M60 140 L68 132 L74 136 L82 128 L90 130" strokeWidth="1" />
      </motion.g>

      {/* Another data panel */}
      <motion.g {...clutterIn(0.9)}>
        <motion.rect x="100" y="108" width="50" height="40" rx="2" />
        <motion.line x1="106" y1="118" x2="140" y2="118" strokeWidth="1" />
        <motion.line x1="106" y1="126" x2="132" y2="126" strokeWidth="1" />
        <motion.line x1="106" y1="134" x2="138" y2="134" strokeWidth="1" />
      </motion.g>

      {/* Top toolbar row */}
      <motion.g {...clutterIn(1.05)}>
        <motion.rect x="10" y="24" width="180" height="16" rx="2" />
        <motion.line x1="16" y1="32" x2="40" y2="32" strokeWidth="1" />
        <motion.line x1="46" y1="32" x2="66" y2="32" strokeWidth="1" />
        <motion.line x1="72" y1="32" x2="88" y2="32" strokeWidth="1" />
        <motion.circle cx="180" cy="32" r="3" strokeWidth="1" />
        <motion.circle cx="170" cy="32" r="3" strokeWidth="1" />
      </motion.g>

      {/* Bottom status bar */}
      <motion.g {...clutterIn(1.2)}>
        <motion.rect x="10" y="164" width="180" height="14" rx="2" />
        <motion.line x1="16" y1="171" x2="50" y2="171" strokeWidth="1" />
        <motion.circle cx="178" cy="171" r="3" strokeWidth="1" />
      </motion.g>
    </motion.svg>
  );
}

/* ────────────────────────────────────────────
 * APPS VARIANT — Tool Sprawl
 * ──────────────────────────────────────────── */

function AppsIllustration({ isActive, size }: { isActive: boolean; size: number }) {
  const [driftPhase, setDriftPhase] = useState(false);

  useEffect(() => {
    if (!isActive) {
      setDriftPhase(false);
      return;
    }

    const timer = setTimeout(() => setDriftPhase(true), 2000);
    return () => clearTimeout(timer);
  }, [isActive]);

  const toolSpring = { type: 'spring' as const, stiffness: 120, damping: 14 };

  // Positions: center cluster vs spread vs drift
  const toolPositions = {
    calendar: {
      center: { x: 80, y: 70 },
      spread: { x: 30, y: 24 },
      drift: { x: 10, y: 8 },
    },
    camera: {
      center: { x: 100, y: 70 },
      spread: { x: 140, y: 24 },
      drift: { x: 160, y: 8 },
    },
    clock: {
      center: { x: 80, y: 100 },
      spread: { x: 30, y: 150 },
      drift: { x: 10, y: 168 },
    },
    chat: {
      center: { x: 100, y: 100 },
      spread: { x: 150, y: 150 },
      drift: { x: 168, y: 168 },
    },
  };

  const getPos = (tool: keyof typeof toolPositions) => {
    if (!isActive) return toolPositions[tool].center;
    if (driftPhase) return toolPositions[tool].drift;
    return toolPositions[tool].spread;
  };

  // Dollar sign positions (in gaps between scattered tools)
  const dollarSigns = [
    { x: 90, y: 60, delay: 0.3 },
    { x: 70, y: 120, delay: 0.6 },
    { x: 130, y: 100, delay: 0.9 },
    { x: 100, y: 150, delay: 1.2 },
  ];

  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      className="text-white/30"
    >
      {/* Calendar icon */}
      <motion.g
        animate={getPos('calendar')}
        transition={toolSpring}
      >
        <motion.rect x="0" y="0" width="28" height="28" rx="3" />
        <motion.line x1="0" y1="8" x2="28" y2="8" strokeWidth="1" />
        <motion.line x1="7" y1="0" x2="7" y2="5" strokeWidth="1.5" />
        <motion.line x1="21" y1="0" x2="21" y2="5" strokeWidth="1.5" />
        {/* Grid dots for calendar days */}
        <motion.circle cx="8" cy="15" r="1" fill="currentColor" strokeWidth="0" />
        <motion.circle cx="14" cy="15" r="1" fill="currentColor" strokeWidth="0" />
        <motion.circle cx="20" cy="15" r="1" fill="currentColor" strokeWidth="0" />
        <motion.circle cx="8" cy="22" r="1" fill="currentColor" strokeWidth="0" />
        <motion.circle cx="14" cy="22" r="1" fill="currentColor" strokeWidth="0" />
      </motion.g>

      {/* Camera icon */}
      <motion.g
        animate={getPos('camera')}
        transition={toolSpring}
      >
        <motion.rect x="0" y="6" width="28" height="20" rx="3" />
        <motion.circle cx="14" cy="16" r="6" />
        <motion.path d="M9 6 L11 2 L17 2 L19 6" strokeWidth="1" />
      </motion.g>

      {/* Clock icon */}
      <motion.g
        animate={getPos('clock')}
        transition={toolSpring}
      >
        <motion.circle cx="14" cy="14" r="13" />
        <motion.line x1="14" y1="14" x2="14" y2="6" strokeWidth="1.5" />
        <motion.line x1="14" y1="14" x2="20" y2="14" strokeWidth="1.5" />
        <motion.circle cx="14" cy="14" r="1.5" fill="currentColor" strokeWidth="0" />
      </motion.g>

      {/* Chat bubble icon */}
      <motion.g
        animate={getPos('chat')}
        transition={toolSpring}
      >
        <motion.rect x="0" y="0" width="28" height="22" rx="4" />
        <motion.path d="M6 22 L2 30 L14 22" strokeWidth="1" />
        <motion.line x1="6" y1="8" x2="22" y2="8" strokeWidth="1" />
        <motion.line x1="6" y1="14" x2="18" y2="14" strokeWidth="1" />
      </motion.g>

      {/* Dollar signs — appear in gaps after spread */}
      {dollarSigns.map((ds, i) => (
        <motion.text
          key={i}
          x={ds.x}
          y={ds.y}
          fontSize="16"
          fill="currentColor"
          stroke="none"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={
            isActive
              ? { opacity: 0.5, scale: 1 }
              : { opacity: 0, scale: 0.5 }
          }
          transition={{
            type: 'spring',
            stiffness: 120,
            damping: 14,
            delay: isActive ? ds.delay : 0,
          }}
        >
          $
        </motion.text>
      ))}
    </motion.svg>
  );
}

/* ────────────────────────────────────────────
 * MAIN COMPONENT
 * ──────────────────────────────────────────── */

export default function WireframeIllustration({
  variant,
  isActive,
  size = 200,
}: WireframeIllustrationProps) {
  switch (variant) {
    case 'messages':
      return <MessagesIllustration isActive={isActive} size={size} />;
    case 'dashboard':
      return <DashboardIllustration isActive={isActive} size={size} />;
    case 'apps':
      return <AppsIllustration isActive={isActive} size={size} />;
  }
}
