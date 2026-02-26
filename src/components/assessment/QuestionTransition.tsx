/**
 * QuestionTransition — Persistent background star field during questioning
 *
 * Stars are always present. They dim while a question is active and
 * brighten between questions. Full viewport height.
 *
 * Cursor repulsion pushes nearby stars away and blends them toward orange.
 * Vertical density concentrated toward the center with edge falloff.
 *
 * Fires `onBrightComplete` after the galaxy has been bright for a set
 * duration — used as the timing mechanism between questions.
 *
 * Pure Canvas 2D API — no animation libraries.
 */

'use client';

import { useRef, useEffect, useCallback } from 'react';

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const PARTICLE_COUNT = 50;
const ACCENT = { r: 89, g: 119, b: 148 };
const GREY = { r: 180, g: 180, b: 180 };
const ORANGE = { r: 210, g: 140, b: 60 };

// Cursor interaction
const REPULSE_RADIUS = 80;
const REPULSE_STRENGTH = 15;
const ORANGE_RADIUS = 70;

// Brightness levels (multiplier on base alpha)
const DIM_LEVEL = 0.4;
const BRIGHT_LEVEL = 1.0;
const BRIGHTNESS_SPEED = 5.0; // lerp speed per second

// Time to stay bright before firing complete callback
const BRIGHT_HOLD = 0.6;

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface QuestionTransitionProps {
  /** true while question is active, false during between-question transition */
  dimmed: boolean;
  /** Override the default dim level (0.4). E.g. 0.1 for forced_choice questions. */
  dimLevel?: number;
  /** Called after galaxy has been bright for BRIGHT_HOLD seconds */
  onBrightComplete?: () => void;
}

interface Star {
  baseX: number;
  baseY: number;
  size: number;
  baseAlpha: number;
  color: { r: number; g: number; b: number };
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

/** Vertical density — triangular distribution centered at 0.5 */
function sampleVerticalPosition(): number {
  const base = (Math.random() + Math.random()) / 2;
  return 0.05 + base * 0.9;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function QuestionTransition({
  dimmed,
  dimLevel,
  onBrightComplete,
}: QuestionTransitionProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animRef = useRef(0);
  const mouseRef = useRef({ x: -9999, y: -9999 });
  const dimmedRef = useRef(dimmed);
  const dimLevelRef = useRef(dimLevel ?? DIM_LEVEL);
  const onBrightCompleteRef = useRef(onBrightComplete);

  // Keep refs in sync with latest props
  dimmedRef.current = dimmed;
  dimLevelRef.current = dimLevel ?? DIM_LEVEL;
  onBrightCompleteRef.current = onBrightComplete;

  const resize = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const dpr = window.devicePixelRatio || 1;
    const rect = container.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;
    const ctx = canvas.getContext('2d');
    if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }, []);

  useEffect(() => {
    resize();

    const container = containerRef.current;
    let observer: ResizeObserver | null = null;
    if (container) {
      observer = new ResizeObserver(() => resize());
      observer.observe(container);
    }

    // Mouse tracking via document so it works through overlaying elements
    const handleMouseMove = (e: MouseEvent) => {
      const rect = container?.getBoundingClientRect();
      if (!rect) return;
      mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };
    const handleMouseLeave = () => {
      mouseRef.current = { x: -9999, y: -9999 };
    };
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);

    // Reduced motion: skip galaxy, just fire callback quickly
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      // Still need to handle transition timing
      let timer: ReturnType<typeof setInterval>;
      const check = () => {
        if (!dimmedRef.current) {
          onBrightCompleteRef.current?.();
          clearInterval(timer);
        }
      };
      timer = setInterval(check, 300);
      return () => {
        clearInterval(timer);
        if (observer) observer.disconnect();
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseleave', handleMouseLeave);
      };
    }

    // Generate stars once — they persist for the life of this component
    const stars: Star[] = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const roll = Math.random();
      stars.push({
        baseX: 0.05 + Math.random() * 0.9,
        baseY: sampleVerticalPosition(),
        size: 1 + Math.random() * 3.5,
        baseAlpha: 0.15 + Math.random() * 0.35,
        color: roll < 0.7 ? GREY : ACCENT,
      });
    }

    let prevTimestamp: number | null = null;
    let currentBrightness = dimmedRef.current ? dimLevelRef.current : BRIGHT_LEVEL;
    let brightTimer = 0;
    let completeFired = false;

    function draw(timestamp: number) {
      if (prevTimestamp === null) prevTimestamp = timestamp;
      const dt = Math.min((timestamp - prevTimestamp) / 1000, 0.1);
      prevTimestamp = timestamp;

      // Lerp brightness toward target
      const target = dimmedRef.current ? dimLevelRef.current : BRIGHT_LEVEL;
      const diff = target - currentBrightness;
      currentBrightness += diff * Math.min(1, BRIGHTNESS_SPEED * dt);

      // Track bright duration for transition complete callback
      if (!dimmedRef.current && currentBrightness > BRIGHT_LEVEL * 0.7) {
        brightTimer += dt;
        if (brightTimer >= BRIGHT_HOLD && !completeFired) {
          completeFired = true;
          onBrightCompleteRef.current?.();
        }
      } else {
        brightTimer = 0;
        completeFired = false;
      }

      const canvas = canvasRef.current;
      if (!canvas) { animRef.current = requestAnimationFrame(draw); return; }
      const ctx = canvas.getContext('2d');
      if (!ctx) { animRef.current = requestAnimationFrame(draw); return; }

      const w = parseFloat(canvas.style.width) || canvas.width;
      const h = parseFloat(canvas.style.height) || canvas.height;
      const mouse = mouseRef.current;

      ctx.clearRect(0, 0, w, h);

      for (const star of stars) {
        let px = star.baseX * w;
        let py = star.baseY * h;
        let alpha = star.baseAlpha * currentBrightness;

        // Vertical edge falloff — fade in the outer 15%
        const edgeDist = Math.min(star.baseY, 1 - star.baseY);
        alpha *= Math.min(1, edgeDist / 0.15);

        // Cursor repulsion
        const mdx = px - mouse.x;
        const mdy = py - mouse.y;
        const mDist = Math.sqrt(mdx * mdx + mdy * mdy);
        if (mDist < REPULSE_RADIUS && mDist > 0.1) {
          const force = (1 - mDist / REPULSE_RADIUS) * REPULSE_STRENGTH;
          px += (mdx / mDist) * force;
          py += (mdy / mDist) * force;
        }

        if (alpha < 0.005) continue;

        // Orange shift near cursor
        let cr = star.color.r, cg = star.color.g, cb = star.color.b;
        if (mDist < ORANGE_RADIUS && mDist > 0.1) {
          const orangeT = 1 - mDist / ORANGE_RADIUS;
          cr = Math.round(cr + (ORANGE.r - cr) * orangeT);
          cg = Math.round(cg + (ORANGE.g - cg) * orangeT);
          cb = Math.round(cb + (ORANGE.b - cb) * orangeT);
        }

        ctx.fillStyle = `rgba(${cr}, ${cg}, ${cb}, ${alpha})`;
        ctx.fillRect(px - star.size / 2, py - star.size / 2, star.size, star.size);
      }

      animRef.current = requestAnimationFrame(draw);
    }

    animRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animRef.current);
      if (observer) observer.disconnect();
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [resize]);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 z-[1] pointer-events-none"
    >
      <canvas
        ref={canvasRef}
        style={{ display: 'block', width: '100%', height: '100%' }}
      />
    </div>
  );
}
