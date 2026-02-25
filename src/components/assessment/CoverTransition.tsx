/**
 * CoverTransition — Galaxy burst canvas effect
 *
 * Plays between the cover page exit and first question entrance.
 * Three phases:
 *   1. Converge (0–0.9s): ~60 particles spawn from random positions,
 *      accelerating inward toward a focal point (left-third of screen).
 *   2. Flash (0.9–1.1s): Brief pulse at focal point. Particles hit peak alpha.
 *   3. Disperse (1.1–2.2s): Particles explode outward in all directions,
 *      trailing off screen. Alpha fades. Sky clears.
 *
 * Pure Canvas 2D API.
 */

'use client';

import { useRef, useEffect, useCallback } from 'react';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface CoverTransitionProps {
  onComplete: () => void;
}

interface GalaxyStar {
  // Spawn position (normalized 0-1)
  spawnX: number;
  spawnY: number;
  // Current position
  x: number;
  y: number;
  size: number;
  alpha: number;
  targetAlpha: number;
  color: { r: number; g: number; b: number };
  // Disperse velocity (normalized per second)
  disperseAngle: number;
  disperseSpeed: number;
  // Timing
  convergeDelay: number; // staggered start
}

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const PARTICLE_COUNT = 60;
const ACCENT = { r: 89, g: 119, b: 148 };
const GREY = { r: 160, g: 160, b: 160 };
const WHITE = { r: 220, g: 220, b: 220 };

// Focal point (normalized) — left-third, vertically centered
const FOCAL_X = 0.3;
const FOCAL_Y = 0.45;

// Phase timing (seconds)
const CONVERGE_END = 0.9;
const FLASH_END = 1.1;
const DISPERSE_END = 2.2;
const FADE_END = 2.4;

// Cursor interaction
const REPULSE_RADIUS = 80;
const REPULSE_STRENGTH = 12;

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function CoverTransition({ onComplete }: CoverTransitionProps) {
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
      const t = setTimeout(() => onCompleteRef.current(), 400);
      return () => {
        clearTimeout(t);
        if (observer) observer.disconnect();
        container?.removeEventListener('mousemove', handleMouseMove);
        container?.removeEventListener('mouseleave', handleMouseLeave);
      };
    }

    // Generate stars
    const stars: GalaxyStar[] = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const roll = Math.random();
      const color = roll < 0.5 ? GREY : roll < 0.85 ? ACCENT : WHITE;

      // Spawn from edges and random positions — more dramatic convergence
      const edgeSpawn = Math.random() < 0.6;
      let spawnX: number, spawnY: number;
      if (edgeSpawn) {
        const side = Math.floor(Math.random() * 4);
        switch (side) {
          case 0: spawnX = Math.random(); spawnY = -0.05; break;        // top
          case 1: spawnX = 1.05; spawnY = Math.random(); break;         // right
          case 2: spawnX = Math.random(); spawnY = 1.05; break;         // bottom
          default: spawnX = -0.05; spawnY = Math.random(); break;       // left
        }
      } else {
        spawnX = Math.random();
        spawnY = Math.random();
      }

      // Disperse angle: radiate outward from focal point
      const angleFromFocal = Math.atan2(spawnY - FOCAL_Y, spawnX - FOCAL_X);
      // Add some spread so it's not perfectly radial
      const disperseAngle = angleFromFocal + (Math.random() - 0.5) * 1.2;

      stars.push({
        spawnX,
        spawnY,
        x: spawnX,
        y: spawnY,
        size: 1 + Math.random() * 3,
        alpha: 0,
        targetAlpha: 0.12 + Math.random() * 0.3,
        color,
        disperseAngle,
        disperseSpeed: 0.4 + Math.random() * 0.8,
        convergeDelay: Math.random() * 0.3,
      });
    }

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
      const focalPx = FOCAL_X * w;
      const focalPy = FOCAL_Y * h;

      ctx.clearRect(0, 0, w, h);

      // Flash glow at focal point during flash phase
      if (elapsed >= CONVERGE_END && elapsed <= FLASH_END) {
        const flashT = (elapsed - CONVERGE_END) / (FLASH_END - CONVERGE_END);
        const flashAlpha = Math.sin(flashT * Math.PI) * 0.12;
        const grad = ctx.createRadialGradient(focalPx, focalPy, 0, focalPx, focalPy, 120);
        grad.addColorStop(0, `rgba(89, 119, 148, ${flashAlpha})`);
        grad.addColorStop(1, 'rgba(89, 119, 148, 0)');
        ctx.fillStyle = grad;
        ctx.fillRect(focalPx - 120, focalPy - 120, 240, 240);
      }

      for (const star of stars) {
        const starElapsed = Math.max(0, elapsed - star.convergeDelay);

        // Phase 1: Converge
        if (elapsed < CONVERGE_END) {
          const convergeT = Math.min(1, starElapsed / (CONVERGE_END - star.convergeDelay));
          const eased = easeInOut(convergeT);

          // Lerp from spawn to focal
          star.x = star.spawnX + (FOCAL_X - star.spawnX) * eased;
          star.y = star.spawnY + (FOCAL_Y - star.spawnY) * eased;

          // Fade in as they converge
          star.alpha = star.targetAlpha * easeOut(convergeT);
        }
        // Phase 2: Flash / hold at focal
        else if (elapsed < FLASH_END) {
          star.x = FOCAL_X;
          star.y = FOCAL_Y;
          star.alpha = star.targetAlpha;
        }
        // Phase 3: Disperse
        else if (elapsed < DISPERSE_END) {
          const disperseT = (elapsed - FLASH_END) / (DISPERSE_END - FLASH_END);
          const accel = easeIn(disperseT) * 2.5;

          star.x = FOCAL_X + Math.cos(star.disperseAngle) * accel * star.disperseSpeed;
          star.y = FOCAL_Y + Math.sin(star.disperseAngle) * accel * star.disperseSpeed;

          // Fade out
          star.alpha = star.targetAlpha * (1 - easeIn(disperseT * 0.85));
        }
        // Phase 4: Gone
        else {
          star.alpha = 0;
        }

        let px = star.x * w;
        let py = star.y * h;

        // Cursor repulsion
        const mdx = px - mouse.x;
        const mdy = py - mouse.y;
        const mDist = Math.sqrt(mdx * mdx + mdy * mdy);
        if (mDist < REPULSE_RADIUS && mDist > 0.1) {
          const force = (1 - mDist / REPULSE_RADIUS) * REPULSE_STRENGTH;
          px += (mdx / mDist) * force;
          py += (mdy / mDist) * force;
        }

        if (star.alpha < 0.01) continue;

        // Global fade for the canvas during final phase
        let globalAlpha = 1;
        if (elapsed > DISPERSE_END) {
          globalAlpha = Math.max(0, 1 - (elapsed - DISPERSE_END) / (FADE_END - DISPERSE_END));
        }

        ctx.fillStyle = `rgba(${star.color.r}, ${star.color.g}, ${star.color.b}, ${star.alpha * globalAlpha})`;
        const sz = star.size;
        ctx.fillRect(px - sz / 2, py - sz / 2, sz, sz);
      }

      // Fire completion
      if (elapsed >= FADE_END && !completed) {
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
    <div
      ref={containerRef}
      className="absolute inset-0 z-20 pointer-events-auto"
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

function easeInOut(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}
