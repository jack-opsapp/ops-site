/**
 * CardParticleFlow — Lightweight, card-scoped canvas particle animation
 * inspired by DataFunnel. Designed for use inside pain-point cards in a
 * 3-column grid.
 *
 * Key differences from DataFunnel:
 *   - 8 lanes (not 14), 4 particles per lane (not 6)
 *   - BASE_SPEED = 0.005 (slightly slower for subtlety)
 *   - Smaller particle radius for card scale
 *   - No negative insets — absolute inset-0 within card
 *   - Driven by FlowDirection instead of DeviceType
 *
 * Canvas-based for 60fps. Retina-aware. Reduced motion support.
 */

'use client';

import { useRef, useEffect, useMemo, useState } from 'react';
import type { FlowDirection } from '@/lib/industries';

interface CardParticleFlowProps {
  flowDirection: FlowDirection;
  isActive: boolean;
}

/* ─── Colors ─── */
const BLUE = '#6F94B0';
const ORANGE = '#B8764A';
const WHITE = '#F5F5F5';

/* ─── Constants ─── */
const LANE_COUNT = 8;
const PARTICLES_PER_LANE = 4;
const BASE_SPEED = 0.005;
const FADE_EDGE = 0.04;
const SCREEN_START = 0.375;
const SCREEN_END = 0.625;

/* ─── Seeded PRNG ─── */
function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

/* ─── Color utilities ─── */
function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

/* ─── Catmull-Rom spline interpolation ─── */
function catmullRom(
  points: { x: number; y: number }[],
  t: number,
): { x: number; y: number } {
  const n = points.length - 1;
  const clamped = Math.max(0, Math.min(0.9999, t));
  const segFloat = clamped * n;
  const idx = Math.min(Math.floor(segFloat), n - 1);
  const u = segFloat - idx;
  const u2 = u * u;
  const u3 = u2 * u;

  const p0 = points[Math.max(idx - 1, 0)];
  const p1 = points[idx];
  const p2 = points[Math.min(idx + 1, n)];
  const p3 = points[Math.min(idx + 2, n)];

  return {
    x: 0.5 * (2 * p1.x + (-p0.x + p2.x) * u + (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * u2 + (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * u3),
    y: 0.5 * (2 * p1.y + (-p0.y + p2.y) * u + (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * u2 + (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * u3),
  };
}

/* ─── Lane definition ─── */
interface Lane {
  waypoints: { x: number; y: number }[];
  entryRgb: [number, number, number];
  exitRgb: [number, number, number];
  sameColor: boolean;
  radius: number;
  speedMul: number;
}

/* ─── Get interpolated color at progress ─── */
function getColor(lane: Lane, progress: number): string {
  const [er, eg, eb] = lane.entryRgb;
  if (lane.sameColor) return `rgb(${er},${eg},${eb})`;
  if (progress <= SCREEN_START) return `rgb(${er},${eg},${eb})`;
  const [xr, xg, xb] = lane.exitRgb;
  if (progress >= SCREEN_END) return `rgb(${xr},${xg},${xb})`;
  const t = (progress - SCREEN_START) / (SCREEN_END - SCREEN_START);
  return `rgb(${Math.round(er + (xr - er) * t)},${Math.round(eg + (xg - eg) * t)},${Math.round(eb + (xb - eb) * t)})`;
}

/* ─── Edge fade ─── */
function edgeFade(t: number): number {
  if (t < FADE_EDGE) return t / FADE_EDGE;
  if (t > 1 - FADE_EDGE) return (1 - t) / FADE_EDGE;
  return 1.0;
}

/**
 * Generate lane paths for card-scoped flow.
 *
 * FlowDirection mapping:
 *   'left-to-right' → horizontal like DataFunnel tablet mode
 *   'right-to-left' → horizontal like DataFunnel phone mode
 *   'top-to-bottom'  → vertical like DataFunnel laptop mode
 *
 * Color transforms match DataFunnel:
 *   left-to-right (tablet): orange+white in → all blue out
 *   right-to-left (phone):  blue+orange in → blue stays, orange→white
 *   top-to-bottom (laptop): all white in → blue+orange out
 */
function generateLanes(direction: FlowDirection, cw: number, ch: number): Lane[] {
  const seed =
    direction === 'right-to-left' ? 42 :
    direction === 'top-to-bottom' ? 99 : 77;
  const rand = seededRandom(seed);
  const lanes: Lane[] = [];

  const isBlue = (i: number) => i % 3 !== 1;

  if (direction === 'left-to-right' || direction === 'right-to-left') {
    // Horizontal flow
    const screenCY = 0.5;
    const tightBand = 0.015;
    const leftToRight = direction === 'left-to-right';

    for (let i = 0; i < LANE_COUNT; i++) {
      const blue = isBlue(i);
      const radius = 1.2 + rand() * 0.6;

      let entryHex: string;
      let exitHex: string;
      if (direction === 'right-to-left') {
        // Blue+orange in, orange→white out
        entryHex = blue ? BLUE : ORANGE;
        exitHex = blue ? BLUE : WHITE;
      } else {
        // left-to-right: orange+white in, all blue out
        entryHex = blue ? WHITE : ORANGE;
        exitHex = BLUE;
      }

      const entryRgb = hexToRgb(entryHex);
      const exitRgb = hexToRgb(exitHex);
      const sameColor = entryHex === exitHex;

      const entryY = 0.08 + (i / (LANE_COUNT - 1)) * 0.84;
      const screenY = screenCY - tightBand + rand() * tightBand * 2;
      const separation = 0.12 + rand() * 0.18;
      const exitY = blue ? 0.5 - separation : 0.5 + separation;
      const farSeparation = 0.25 + rand() * 0.2;
      const farY = blue ? 0.5 - farSeparation : 0.5 + farSeparation;

      const xStopsLR = [0.0, 0.12, 0.26, 0.38, 0.50, 0.62, 0.74, 0.88, 1.0];
      const xStopsRL = [1.0, 0.88, 0.74, 0.62, 0.50, 0.38, 0.26, 0.12, 0.0];
      const xStops = leftToRight ? xStopsLR : xStopsRL;
      const yStops = [
        entryY,
        entryY * 0.75 + screenY * 0.25,
        entryY * 0.3 + screenY * 0.7,
        screenY,
        screenY + (rand() - 0.5) * 0.01,
        screenY,
        screenY * 0.5 + exitY * 0.5,
        exitY,
        farY,
      ];

      const waypoints = xStops.map((x, j) => ({
        x: x * cw,
        y: yStops[j] * ch,
      }));

      const speedMul = 0.95 + rand() * 0.1;
      lanes.push({ waypoints, entryRgb, exitRgb, sameColor, radius, speedMul });
    }
  } else {
    // top-to-bottom: vertical flow
    // All white entry → blue/orange exit
    const screenCX = 0.5;
    const tightBand = 0.015;

    for (let i = 0; i < LANE_COUNT; i++) {
      const blue = isBlue(i);
      const radius = 1.2 + rand() * 0.6;

      const entryRgb = hexToRgb(WHITE);
      const exitRgb = hexToRgb(blue ? BLUE : ORANGE);

      const entryX = 0.08 + (i / (LANE_COUNT - 1)) * 0.84;
      const screenX = screenCX - tightBand + rand() * tightBand * 2;
      const separation = 0.12 + rand() * 0.18;
      const exitX = blue ? 0.5 - separation : 0.5 + separation;
      const farSeparation = 0.25 + rand() * 0.2;
      const farX = blue ? 0.5 - farSeparation : 0.5 + farSeparation;

      const yStops = [0.0, 0.12, 0.26, 0.38, 0.50, 0.62, 0.74, 0.88, 1.0];
      const xStops = [
        entryX,
        entryX * 0.75 + screenX * 0.25,
        entryX * 0.3 + screenX * 0.7,
        screenX,
        screenX + (rand() - 0.5) * 0.01,
        screenX,
        screenX * 0.5 + exitX * 0.5,
        exitX,
        farX,
      ];

      const waypoints = yStops.map((y, j) => ({
        x: xStops[j] * cw,
        y: y * ch,
      }));

      const speedMul = 0.95 + rand() * 0.1;
      lanes.push({ waypoints, entryRgb, exitRgb, sameColor: false, radius, speedMul });
    }
  }

  return lanes;
}

/* ─── Particle with variability ─── */
interface Particle {
  laneIndex: number;
  progress: number;
  alive: boolean;
  radiusMul: number;
  speedFactor: number;
  offset: number;
}

function createParticles(laneCount: number, seed: number): Particle[] {
  const rand = seededRandom(seed + 1000);
  const particles: Particle[] = [];
  for (let l = 0; l < laneCount; l++) {
    for (let p = 0; p < PARTICLES_PER_LANE; p++) {
      const radiusMul = 0.6 + rand() * 0.8;
      // Larger particles = 60% speed, smaller = 70% speed
      const speedFactor = 0.7 - (radiusMul - 0.6) * 0.125;
      particles.push({
        laneIndex: l,
        progress: p / PARTICLES_PER_LANE,
        alive: false,
        radiusMul,
        speedFactor,
        offset: (rand() - 0.5) * 10,
      });
    }
  }
  return particles;
}

/* ─── Main Component ─── */
export default function CardParticleFlow({ flowDirection, isActive }: CardParticleFlowProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);
  const particlesRef = useRef<Particle[]>([]);
  const wasActiveRef = useRef(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [dims, setDims] = useState({ w: 400, h: 300 });
  const isActiveRef = useRef(isActive);
  isActiveRef.current = isActive;

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      if (width > 0 && height > 0) setDims({ w: width, h: height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const lanes = useMemo(
    () => generateLanes(flowDirection, dims.w, dims.h),
    [flowDirection, dims.w, dims.h],
  );

  useEffect(() => {
    const seed =
      flowDirection === 'right-to-left' ? 42 :
      flowDirection === 'top-to-bottom' ? 99 : 77;
    particlesRef.current = createParticles(lanes.length, seed);
  }, [lanes, flowDirection]);

  useEffect(() => {
    if (reducedMotion) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let running = true;

    function draw() {
      if (!running || !ctx || !canvas) return;

      const dpr = window.devicePixelRatio || 1;
      const w = dims.w;
      const h = dims.h;

      const bw = Math.round(w * dpr);
      const bh = Math.round(h * dpr);
      if (canvas.width !== bw || canvas.height !== bh) {
        canvas.width = bw;
        canvas.height = bh;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      }

      ctx.clearRect(0, 0, w, h);

      const active = isActiveRef.current;
      const wasActive = wasActiveRef.current;
      const particles = particlesRef.current;

      // Activation: ALL particles start hidden (negative progress).
      // Spacing = 1/PARTICLES_PER_LANE so they're perfectly even once entered.
      // Lane delay staggers which lanes fill first for trickle effect.
      if (active && !wasActive) {
        for (let j = 0; j < particles.length; j++) {
          const pt = particles[j];
          const slot = j % PARTICLES_PER_LANE;
          const laneDelay = pt.laneIndex * 0.02;
          pt.progress = -(slot / PARTICLES_PER_LANE) - laneDelay;
          pt.alive = true;
        }
      }
      wasActiveRef.current = active;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        if (!p.alive) continue;

        const lane = lanes[p.laneIndex];
        if (!lane) continue;

        p.progress += BASE_SPEED * lane.speedMul * p.speedFactor;

        if (p.progress >= 1) {
          if (active) {
            p.progress -= 1;
          } else {
            p.alive = false;
            continue;
          }
        }

        if (p.progress < 0) continue;

        // Position on spline + perpendicular offset
        const pos = catmullRom(lane.waypoints, p.progress);
        const nextPos = catmullRom(lane.waypoints, Math.min(0.999, p.progress + 0.02));
        const dx = nextPos.x - pos.x;
        const dy = nextPos.y - pos.y;
        const len = Math.sqrt(dx * dx + dy * dy) || 1;
        const drawX = pos.x + p.offset * (-dy / len);
        const drawY = pos.y + p.offset * (dx / len);

        const fade = edgeFade(p.progress);
        const alpha = fade * 0.55;
        if (alpha < 0.005) continue;

        const color = getColor(lane, p.progress);
        const r = lane.radius * p.radiusMul;

        // Core (no glow)
        ctx.beginPath();
        ctx.arc(drawX, drawY, r, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.globalAlpha = alpha;
        ctx.fill();
      }

      ctx.globalAlpha = 1;
      rafRef.current = requestAnimationFrame(draw);
    }

    rafRef.current = requestAnimationFrame(draw);
    return () => {
      running = false;
      cancelAnimationFrame(rafRef.current);
    };
  }, [reducedMotion, dims, lanes]);

  if (reducedMotion) return null;

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 pointer-events-none"
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
}
