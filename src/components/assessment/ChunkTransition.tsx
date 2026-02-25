/**
 * ChunkTransition — Stars fade in, then funnel-whoosh away
 *
 * Stars appear one at a time at varying sizes/brightnesses across the canvas.
 * After a brief hold, they funnel into a stream and whoosh out to the right
 * (opposite the direction the next step enters from).
 * Cursor repulsion pushes nearby stars away.
 *
 * Pure Canvas 2D API — no animation libraries.
 */

'use client';

import { useRef, useEffect, useCallback, useState } from 'react';
import { motion } from 'framer-motion';

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const ACCENT = { r: 89, g: 119, b: 148 };
const GREY_STAR = { r: 180, g: 180, b: 180 };
const ORANGE = { r: 210, g: 140, b: 60 };
const PARTICLE_COUNT = 90;
const ORANGE_RADIUS = 90;

// Phase timing (seconds)
const FADE_IN_DURATION = 2.0;    // stars fade in one at a time
const HOLD_DURATION = 0.5;       // brief hold
const FUNNEL_DURATION = 1.2;     // funnel whoosh out

// Cursor repulsion
const REPULSE_RADIUS = 100;
const REPULSE_STRENGTH = 20;

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface TransitStar {
  // Base position (normalized 0-1)
  baseX: number;
  baseY: number;
  // Visual
  size: number;
  baseAlpha: number;
  // Base color: 'grey' (most) or 'blue' (some)
  baseColor: { r: number; g: number; b: number };
  // Staggered fade-in time (0 to FADE_IN_DURATION)
  fadeInTime: number;
  // Funnel params
  funnelSpeed: number; // horizontal speed multiplier
  funnelDrift: number; // Y drift toward center stream
}

interface ChunkTransitionProps {
  chunkNumber: number;
  totalChunks: number;
  onComplete: () => void;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function easeIn(t: number): number {
  return t * t * t;
}

function easeOut(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function ChunkTransition({ chunkNumber, totalChunks, onComplete }: ChunkTransitionProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animRef = useRef(0);
  const onCompleteRef = useRef(onComplete);
  const mouseRef = useRef({ x: -9999, y: -9999 });
  const [showAnalyzing, setShowAnalyzing] = useState(false);
  onCompleteRef.current = onComplete;

  // Show "Analyzing responses..." after 0.5s delay
  useEffect(() => {
    const t = setTimeout(() => setShowAnalyzing(true), 500);
    return () => clearTimeout(t);
  }, []);

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

    // Mouse tracking
    const handleMouseMove = (e: MouseEvent) => {
      const rect = container?.getBoundingClientRect();
      if (!rect) return;
      mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };
    const handleMouseLeave = () => {
      mouseRef.current = { x: -9999, y: -9999 };
    };
    container?.addEventListener('mousemove', handleMouseMove);
    container?.addEventListener('mouseleave', handleMouseLeave);

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReduced) {
      const t = setTimeout(() => onCompleteRef.current(), 800);
      return () => {
        clearTimeout(t);
        if (observer) observer.disconnect();
        container?.removeEventListener('mousemove', handleMouseMove);
        container?.removeEventListener('mouseleave', handleMouseLeave);
      };
    }

    // Generate stars scattered across canvas
    // ~70% grey, ~30% blue
    const stars: TransitStar[] = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const roll = Math.random();
      const baseColor = roll < 0.7 ? GREY_STAR : ACCENT;
      stars.push({
        baseX: 0.05 + Math.random() * 0.9,
        baseY: 0.05 + Math.random() * 0.9,
        size: 1 + Math.random() * 3.5,
        baseAlpha: 0.12 + Math.random() * 0.4,
        baseColor,
        fadeInTime: (i / PARTICLE_COUNT) * FADE_IN_DURATION * 0.85 + Math.random() * FADE_IN_DURATION * 0.15,
        funnelSpeed: 0.6 + Math.random() * 0.8,
        funnelDrift: 0.3 + Math.random() * 0.7,
      });
    }
    // Sort by fadeInTime so they appear sequentially
    stars.sort((a, b) => a.fadeInTime - b.fadeInTime);

    let prevTimestamp: number | null = null;
    let elapsed = 0;
    let completed = false;

    function draw(timestamp: number) {
      if (prevTimestamp === null) prevTimestamp = timestamp;
      const dt = Math.min((timestamp - prevTimestamp) / 1000, 0.1);
      prevTimestamp = timestamp;
      elapsed += dt;

      const canvas = canvasRef.current;
      if (!canvas) { animRef.current = requestAnimationFrame(draw); return; }
      const ctx = canvas.getContext('2d');
      if (!ctx) { animRef.current = requestAnimationFrame(draw); return; }

      const w = parseFloat(canvas.style.width) || canvas.width;
      const h = parseFloat(canvas.style.height) || canvas.height;
      const mouse = mouseRef.current;

      ctx.clearRect(0, 0, w, h);

      const totalDuration = FADE_IN_DURATION + HOLD_DURATION + FUNNEL_DURATION;
      const funnelStart = FADE_IN_DURATION + HOLD_DURATION;

      for (const star of stars) {
        // Fade-in: star appears when elapsed >= fadeInTime
        const fadeInT = Math.max(0, Math.min(1, (elapsed - star.fadeInTime) / 0.3));
        if (fadeInT <= 0) continue;

        let px = star.baseX * w;
        let py = star.baseY * h;
        let alpha = star.baseAlpha * easeOut(fadeInT);

        // Funnel whoosh phase
        if (elapsed > funnelStart) {
          const fT = Math.min(1, (elapsed - funnelStart) / FUNNEL_DURATION);
          const accel = easeIn(fT);

          // Move right (funnel out)
          px += accel * w * 1.5 * star.funnelSpeed;

          // Converge Y toward center (funnel narrowing)
          const centerY = h * 0.5;
          py += (centerY - py) * accel * star.funnelDrift;

          // Fade out
          alpha *= (1 - easeIn(fT * 0.9));
        }

        // Cursor repulsion
        const mdx = px - mouse.x;
        const mdy = py - mouse.y;
        const mDist = Math.sqrt(mdx * mdx + mdy * mdy);
        if (mDist < REPULSE_RADIUS && mDist > 0.1) {
          const force = (1 - mDist / REPULSE_RADIUS) * REPULSE_STRENGTH;
          px += (mdx / mDist) * force;
          py += (mdy / mDist) * force;
        }

        if (alpha < 0.01) continue;

        // Color: blend toward orange near cursor
        let cr = star.baseColor.r, cg = star.baseColor.g, cb = star.baseColor.b;
        if (mDist < ORANGE_RADIUS && mDist > 0.1) {
          const orangeT = (1 - mDist / ORANGE_RADIUS);
          cr = Math.round(cr + (ORANGE.r - cr) * orangeT);
          cg = Math.round(cg + (ORANGE.g - cg) * orangeT);
          cb = Math.round(cb + (ORANGE.b - cb) * orangeT);
        }

        // Draw star (square dot)
        ctx.fillStyle = `rgba(${cr}, ${cg}, ${cb}, ${alpha})`;
        const sz = star.size;
        ctx.fillRect(px - sz / 2, py - sz / 2, sz, sz);
      }

      // Fire completion
      if (elapsed >= totalDuration && !completed) {
        completed = true;
        onCompleteRef.current();
        return;
      }

      animRef.current = requestAnimationFrame(draw);
    }

    animRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animRef.current);
      if (observer) observer.disconnect();
      container?.removeEventListener('mousemove', handleMouseMove);
      container?.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [resize]);

  return (
    <div className="h-full flex flex-col items-center justify-center bg-ops-background relative">
      <div ref={containerRef} className="absolute inset-0">
        <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%' }} />
      </div>
      <div className="relative z-10 text-center">
        <motion.p
          initial={{ opacity: 0, y: 20, filter: 'blur(4px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="font-heading text-2xl font-semibold uppercase text-ops-text-primary tracking-wide"
        >
          Section Complete
        </motion.p>
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
          className="font-caption text-[10px] uppercase tracking-[0.2em] text-ops-text-secondary/60 mt-2"
        >
          Section {chunkNumber} of {totalChunks}
        </motion.p>
        {showAnalyzing && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="font-caption text-[10px] uppercase tracking-[0.2em] text-ops-text-secondary/40 mt-3"
          >
            Analyzing responses...
          </motion.p>
        )}
      </div>
    </div>
  );
}
