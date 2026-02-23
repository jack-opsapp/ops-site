/**
 * DataFunnel — Particles scatter wide → funnel tight into device screen →
 * exit the other side as two color-separated streams (blue + orange).
 *
 * Uses Canvas for smooth 60fps particle rendering with proper retina support.
 * Respects prefers-reduced-motion (shows nothing when reduced).
 */

'use client';

import { useRef, useEffect, useMemo, useState, useCallback } from 'react';
import { screenBounds } from '@/components/animations/DeviceShell';

type DeviceType = 'phone' | 'laptop' | 'tablet';

interface DataFunnelProps {
  device: DeviceType;
  isActive: boolean;
}

/* ─── Colors ─── */
const BLUE = '#597794';
const ORANGE = '#D4622B';

/* ─── Seeded PRNG for deterministic particle paths ─── */
function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

/* ─── Particle path definition ─── */
interface ParticlePath {
  /** Waypoints as {x,y} in canvas coordinates */
  points: { x: number; y: number }[];
  color: string;
  radius: number;
  speed: number;
}

/* ─── Cubic Bezier interpolation between waypoints ─── */
function interpolatePath(
  points: { x: number; y: number }[],
  t: number,
): { x: number; y: number } {
  const n = points.length - 1;
  const segFloat = t * n;
  const idx = Math.min(Math.floor(segFloat), n - 1);
  const segT = segFloat - idx;

  // Catmull-Rom style smoothing: use neighboring points for control
  const p0 = points[Math.max(idx - 1, 0)];
  const p1 = points[idx];
  const p2 = points[Math.min(idx + 1, n)];
  const p3 = points[Math.min(idx + 2, n)];

  const tt = segT;
  const tt2 = tt * tt;
  const tt3 = tt2 * tt;

  // Catmull-Rom spline
  const x =
    0.5 *
    (2 * p1.x +
      (-p0.x + p2.x) * tt +
      (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * tt2 +
      (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * tt3);
  const y =
    0.5 *
    (2 * p1.y +
      (-p0.y + p2.y) * tt +
      (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * tt2 +
      (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * tt3);

  return { x, y };
}

/* ─── Per-device path generation ─── */

const PARTICLE_COUNT = 16;

function generatePaths(
  device: DeviceType,
  canvasW: number,
  canvasH: number,
): ParticlePath[] {
  const seeds: Record<DeviceType, number> = { phone: 42, laptop: 99, tablet: 77 };
  const rand = seededRandom(seeds[device]);

  const bounds = screenBounds[device];

  // Canvas center offsets (padding so particles can spread beyond device)
  const padX = canvasW * 0.28;
  const padY = canvasH * 0.19;

  // Scale factors: device SVG coords → canvas coords
  const deviceW = device === 'phone' ? 220 : device === 'laptop' ? 520 : 480;
  const deviceH = device === 'phone' ? 420 : device === 'laptop' ? 340 : 340;
  const scaleX = (canvasW - padX * 2) / deviceW;
  const scaleY = (canvasH - padY * 2) / deviceH;

  const toCanvas = (svgX: number, svgY: number) => ({
    x: padX + svgX * scaleX,
    y: padY + svgY * scaleY,
  });

  const screenLeft = toCanvas(bounds.left, 0).x;
  const screenRight = toCanvas(bounds.right, 0).x;
  const screenTop = toCanvas(0, bounds.top).y;
  const screenBottom = toCanvas(0, bounds.bottom).y;
  const screenMidX = (screenLeft + screenRight) / 2;
  const screenMidY = (screenTop + screenBottom) / 2;

  return Array.from({ length: PARTICLE_COUNT }, (_, i) => {
    const isBlue = i % 2 === 0;
    const color = isBlue ? BLUE : ORANGE;
    const radius = 2 + rand() * 1.5;
    const speed = 0.002 + rand() * 0.002;

    let points: { x: number; y: number }[];

    if (device === 'phone') {
      // LEFT → RIGHT through screen
      const entryX = rand() * padX * 0.5;
      const entryY = rand() * canvasH;
      const screenY = screenMidY - (screenBottom - screenTop) * 0.3 + rand() * (screenBottom - screenTop) * 0.6;
      const exitX = canvasW - rand() * padX * 0.5;
      const exitY = isBlue
        ? screenY - 30 - rand() * 70
        : screenY + 30 + rand() * 70;

      points = [
        { x: entryX, y: entryY },
        { x: padX * 0.6, y: entryY * 0.6 + screenY * 0.4 },
        { x: screenLeft - 10, y: screenY + (rand() - 0.5) * 20 },
        { x: screenLeft, y: screenY },
        { x: screenMidX, y: screenY + (rand() - 0.5) * 10 },
        { x: screenRight, y: screenY },
        { x: screenRight + 15, y: screenY + (isBlue ? -15 : 15) },
        { x: exitX, y: exitY },
      ];
    } else if (device === 'laptop') {
      // TOP → BOTTOM through screen
      const entryX = screenMidX - (screenRight - screenLeft) * 0.4 + rand() * (screenRight - screenLeft) * 0.8;
      const entryY = rand() * padY * 0.4;
      const screenX = screenMidX - (screenRight - screenLeft) * 0.25 + rand() * (screenRight - screenLeft) * 0.5;
      const exitX = isBlue
        ? screenX - 30 - rand() * 60
        : screenX + 30 + rand() * 60;
      const exitY = canvasH - rand() * padY * 0.3;

      points = [
        { x: entryX, y: entryY },
        { x: entryX + (rand() - 0.5) * 30, y: padY * 0.7 },
        { x: screenX + (rand() - 0.5) * 15, y: screenTop - 8 },
        { x: screenX, y: screenTop },
        { x: screenX + (rand() - 0.5) * 8, y: (screenTop + screenBottom) / 2 },
        { x: screenX, y: screenBottom },
        { x: screenX + (isBlue ? -15 : 15), y: screenBottom + 15 },
        { x: exitX, y: exitY },
      ];
    } else {
      // RIGHT → LEFT through screen (mirrored)
      const entryX = canvasW - rand() * padX * 0.5;
      const entryY = rand() * canvasH;
      const screenY = screenMidY - (screenBottom - screenTop) * 0.3 + rand() * (screenBottom - screenTop) * 0.6;
      const exitX = rand() * padX * 0.5;
      const exitY = isBlue
        ? screenY - 30 - rand() * 70
        : screenY + 30 + rand() * 70;

      points = [
        { x: entryX, y: entryY },
        { x: canvasW - padX * 0.6, y: entryY * 0.6 + screenY * 0.4 },
        { x: screenRight + 10, y: screenY + (rand() - 0.5) * 20 },
        { x: screenRight, y: screenY },
        { x: screenMidX, y: screenY + (rand() - 0.5) * 10 },
        { x: screenLeft, y: screenY },
        { x: screenLeft - 15, y: screenY + (isBlue ? -15 : 15) },
        { x: exitX, y: exitY },
      ];
    }

    return { points, color, radius, speed };
  });
}

/* ─── Opacity / size envelope along 0→1 progress ─── */
function opacityEnvelope(t: number): number {
  // Ramp up → peak at 0.4 → ramp down
  if (t < 0.15) return (t / 0.15) * 0.15;
  if (t < 0.35) return 0.15 + ((t - 0.15) / 0.2) * 0.4;
  if (t < 0.55) return 0.55;
  if (t < 0.75) return 0.55 - ((t - 0.55) / 0.2) * 0.2;
  return Math.max(0, 0.35 - ((t - 0.75) / 0.25) * 0.35);
}

function sizeEnvelope(t: number, baseR: number): number {
  // Grows through screen, shrinks on exit
  if (t < 0.3) return baseR * (0.6 + t * 1.33);
  if (t < 0.55) return baseR * (1.0 + (t - 0.3) * 1.2);
  return baseR * (1.3 - (t - 0.55) * 1.33);
}

/* ─── Live particle state ─── */
interface LiveParticle {
  progress: number;
  pathIndex: number;
}

/* ─── Main Component ─── */
export default function DataFunnel({ device, isActive }: DataFunnelProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const particlesRef = useRef<LiveParticle[]>([]);
  const [reducedMotion, setReducedMotion] = useState(false);

  // Check reduced motion preference
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // Canvas dimensions — match parent container
  const [dims, setDims] = useState({ w: 500, h: 620 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      if (width > 0 && height > 0) {
        setDims({ w: width, h: height });
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Generate deterministic paths once dims are stable
  const paths = useMemo(
    () => generatePaths(device, dims.w, dims.h),
    [device, dims.w, dims.h],
  );

  // Animation loop
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const w = dims.w;
    const h = dims.h;

    // Ensure canvas buffer matches
    if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.scale(dpr, dpr);
    }

    ctx.clearRect(0, 0, w, h);

    const particles = particlesRef.current;

    // Spawn new particles when active
    if (isActive && particles.length < PARTICLE_COUNT) {
      // Stagger spawn: one per frame until full
      particles.push({
        progress: 0,
        pathIndex: particles.length % paths.length,
      });
    }

    // Update and draw
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      const path = paths[p.pathIndex];
      p.progress += path.speed;

      if (p.progress >= 1) {
        // Reset for infinite loop
        if (isActive) {
          p.progress = 0;
        } else {
          particles.splice(i, 1);
          continue;
        }
      }

      const pos = interpolatePath(path.points, p.progress);
      const alpha = opacityEnvelope(p.progress);
      const r = sizeEnvelope(p.progress, path.radius);

      if (alpha <= 0) continue;

      // Fade particles out when deactivating
      const activeMul = isActive ? 1 : Math.max(0, 1 - p.progress * 3);

      // Glow
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, r * 2.5, 0, Math.PI * 2);
      ctx.fillStyle = path.color;
      ctx.globalAlpha = alpha * 0.18 * activeMul;
      ctx.fill();

      // Core
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, r, 0, Math.PI * 2);
      ctx.fillStyle = path.color;
      ctx.globalAlpha = alpha * activeMul;
      ctx.fill();
    }

    ctx.globalAlpha = 1;
    rafRef.current = requestAnimationFrame(draw);
  }, [isActive, paths, dims]);

  useEffect(() => {
    if (reducedMotion) return;

    rafRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafRef.current);
  }, [draw, reducedMotion]);

  if (reducedMotion) return null;

  // Container extends beyond device bounds to allow particle spread
  return (
    <div
      ref={containerRef}
      className="absolute pointer-events-none"
      style={{ inset: '-100px -140px' }}
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
}
