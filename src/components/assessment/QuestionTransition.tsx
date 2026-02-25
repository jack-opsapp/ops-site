/**
 * QuestionTransition — Direction-aware star galaxy effect
 *
 * Replaces blur-slide between questions with a canvas particle effect.
 * Stars build up, then slide out in the direction of navigation.
 *
 * Pure Canvas 2D API — no animation libraries.
 */

'use client';

import { useRef, useEffect, useCallback } from 'react';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface QuestionTransitionProps {
  direction: 'forward' | 'back';
  onComplete: () => void;
}

interface TransitStar {
  x: number;
  y: number;
  size: number;
  alpha: number;
  targetAlpha: number;
  // Base color: grey or accent
  color: { r: number; g: number; b: number };
  fadeInTime: number;
  slideSpeed: number;
}

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const PARTICLE_COUNT = 40;
const ACCENT = { r: 89, g: 119, b: 148 };
const GREY = { r: 180, g: 180, b: 180 };
const ORANGE = { r: 210, g: 140, b: 60 };

// Phase timing (seconds)
const BUILD_DURATION = 0.35;
const PEAK_START = 0.35;
const SLIDE_START = 0.35;
const TOTAL_DURATION = 1.0;

// Cursor interaction
const REPULSE_RADIUS = 80;
const REPULSE_STRENGTH = 15;
const ORANGE_RADIUS = 70;

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function QuestionTransition({
  direction,
  onComplete,
}: QuestionTransitionProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animRef = useRef(0);
  const onCompleteRef = useRef(onComplete);
  const mouseRef = useRef({ x: -9999, y: -9999 });
  onCompleteRef.current = onComplete;

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
      // Simple crossfade — fire after 300ms
      const t = setTimeout(() => onCompleteRef.current(), 300);
      return () => {
        clearTimeout(t);
        if (observer) observer.disconnect();
        container?.removeEventListener('mousemove', handleMouseMove);
        container?.removeEventListener('mouseleave', handleMouseLeave);
      };
    }

    // Slide direction: forward=left, back=right
    const slideDir = direction === 'forward' ? -1 : 1;

    // Generate stars
    const stars: TransitStar[] = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const roll = Math.random();
      const color = roll < 0.7 ? GREY : ACCENT;
      stars.push({
        x: 0.05 + Math.random() * 0.9,
        y: 0.05 + Math.random() * 0.9,
        size: 1 + Math.random() * 3.5,
        alpha: 0,
        targetAlpha: 0.15 + Math.random() * 0.35,
        color,
        fadeInTime: (i / PARTICLE_COUNT) * BUILD_DURATION * 0.85 + Math.random() * BUILD_DURATION * 0.15,
        slideSpeed: 0.6 + Math.random() * 0.8,
      });
    }
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

      for (const star of stars) {
        // Fade-in: star appears when elapsed >= fadeInTime
        const fadeInT = Math.max(0, Math.min(1, (elapsed - star.fadeInTime) / 0.25));
        if (fadeInT <= 0) continue;

        let px = star.x * w;
        let py = star.y * h;
        let alpha = star.targetAlpha * easeOut(fadeInT);

        // Slide phase
        if (elapsed > SLIDE_START) {
          const sT = Math.min(1, (elapsed - SLIDE_START) / (TOTAL_DURATION - SLIDE_START));
          const accel = easeIn(sT);

          // Move in slide direction
          px += slideDir * accel * w * 1.5 * star.slideSpeed;

          // Fade out as they leave
          alpha *= (1 - easeIn(sT * 0.9));
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
        let cr = star.color.r, cg = star.color.g, cb = star.color.b;
        if (mDist < ORANGE_RADIUS && mDist > 0.1) {
          const orangeT = (1 - mDist / ORANGE_RADIUS);
          cr = Math.round(cr + (ORANGE.r - cr) * orangeT);
          cg = Math.round(cg + (ORANGE.g - cg) * orangeT);
          cb = Math.round(cb + (ORANGE.b - cb) * orangeT);
        }

        // Draw square dot
        ctx.fillStyle = `rgba(${cr}, ${cg}, ${cb}, ${alpha})`;
        const sz = star.size;
        ctx.fillRect(px - sz / 2, py - sz / 2, sz, sz);
      }

      // Fire completion
      if (elapsed >= TOTAL_DURATION && !completed) {
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
  }, [resize, direction]);

  return (
    <div
      ref={containerRef}
      className="absolute inset-x-0 bottom-0 z-20 pointer-events-auto"
      style={{ top: '38%' }}
    >
      <canvas
        ref={canvasRef}
        style={{ display: 'block', width: '100%', height: '100%' }}
      />
    </div>
  );
}

/* ---- Easing helpers ---- */

function easeIn(t: number): number {
  return t * t * t;
}

function easeOut(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}
