/**
 * DataFunnel — Organized particle streams that converge through a device
 * screen and exit as two color-separated streams (blue + orange).
 *
 * Design: Lane-based flow at constant velocity. Particles travel in organized
 * channels that funnel tight through the screen, then diverge cleanly.
 * Blue and orange are mixed on entry, sorted on exit — metaphor for OPS
 * taking chaotic data and organizing it.
 *
 * Canvas-based for 60fps. Retina-aware. Reduced motion support.
 */

'use client';

import { useRef, useEffect, useMemo, useState } from 'react';

type DeviceType = 'phone' | 'laptop' | 'tablet';

interface DataFunnelProps {
  device: DeviceType;
  isActive: boolean;
}

/* ─── Colors ─── */
const BLUE = '#597794';
const ORANGE = '#D4622B';

/* ─── Constants ─── */
const LANE_COUNT = 14;
const PARTICLES_PER_LANE = 3;
const SPEED = 0.004; // progress per frame — full cycle ≈ 4.2s at 60fps
const FADE_EDGE = 0.08; // fraction of path for edge fade

/* ─── Seeded PRNG ─── */
function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
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
  color: string;
  radius: number;
}

/**
 * Generate organized lane paths in normalized [0,1] coordinates.
 * All lanes converge through the screen center, then diverge into
 * two color-separated streams.
 */
function generateLanes(device: DeviceType, cw: number, ch: number): Lane[] {
  const seed = device === 'phone' ? 42 : device === 'laptop' ? 99 : 77;
  const rand = seededRandom(seed);
  const lanes: Lane[] = [];

  if (device === 'phone' || device === 'tablet') {
    // ── Horizontal flow ──
    const reversed = device === 'tablet'; // tablet: right→left
    const screenCY = 0.5;
    const tightBand = 0.04; // how tight the stream is through the screen

    for (let i = 0; i < LANE_COUNT; i++) {
      const isBlue = i % 2 === 0;
      const color = isBlue ? BLUE : ORANGE;
      const radius = 1.5 + rand() * 0.8;

      // Entry: evenly spread, both colors interleaved
      const entryY = 0.08 + (i / (LANE_COUNT - 1)) * 0.84;

      // Through screen: tight center band
      const screenY = screenCY - tightBand + rand() * tightBand * 2;

      // Exit: symmetric about 0.5 center axis
      const separation = 0.12 + rand() * 0.18;
      const exitY = isBlue ? 0.5 - separation : 0.5 + separation;
      const farSeparation = 0.25 + rand() * 0.2;
      const farY = isBlue ? 0.5 - farSeparation : 0.5 + farSeparation;

      // Build waypoints (left→right for phone, right→left for tablet)
      const xStops = [0.0, 0.12, 0.26, 0.38, 0.50, 0.62, 0.74, 0.88, 1.0];
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
        x: (reversed ? 1 - x : x) * cw,
        y: yStops[j] * ch,
      }));

      lanes.push({ waypoints, color, radius });
    }
  } else {
    // ── Laptop: vertical flow (top→bottom) ──
    const screenCX = 0.5;
    const tightBand = 0.04;

    for (let i = 0; i < LANE_COUNT; i++) {
      const isBlue = i % 2 === 0;
      const color = isBlue ? BLUE : ORANGE;
      const radius = 1.5 + rand() * 0.8;

      const entryX = 0.08 + (i / (LANE_COUNT - 1)) * 0.84;
      const screenX = screenCX - tightBand + rand() * tightBand * 2;
      const separation = 0.12 + rand() * 0.18;
      const exitX = isBlue ? 0.5 - separation : 0.5 + separation;
      const farSeparation = 0.25 + rand() * 0.2;
      const farX = isBlue ? 0.5 - farSeparation : 0.5 + farSeparation;

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

      lanes.push({ waypoints, color, radius });
    }
  }

  return lanes;
}

/* ─── Edge fade: smooth fade in/out at path ends ─── */
function edgeFade(t: number): number {
  if (t < FADE_EDGE) return t / FADE_EDGE;
  if (t > 1 - FADE_EDGE) return (1 - t) / FADE_EDGE;
  return 1.0;
}

/* ─── Pre-populated particle set ─── */
interface Particle {
  laneIndex: number;
  progress: number;
  alive: boolean;
}

function createParticles(laneCount: number): Particle[] {
  const particles: Particle[] = [];
  for (let l = 0; l < laneCount; l++) {
    for (let p = 0; p < PARTICLES_PER_LANE; p++) {
      particles.push({
        laneIndex: l,
        progress: p / PARTICLES_PER_LANE,
        alive: false,
      });
    }
  }
  return particles;
}

/* ─── Inset config: how far canvas extends beyond device ─── */
const insetConfig: Record<DeviceType, string> = {
  phone: '-250px -500px',
  laptop: '-250px -400px',
  tablet: '-250px -450px',
};

/* ─── Main Component ─── */
export default function DataFunnel({ device, isActive }: DataFunnelProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);
  const particlesRef = useRef<Particle[]>([]);
  const wasActiveRef = useRef(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [dims, setDims] = useState({ w: 1200, h: 800 });
  const isActiveRef = useRef(isActive);
  isActiveRef.current = isActive;

  // Reduced motion check
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // ResizeObserver for container dimensions
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

  // Generate lanes
  const lanes = useMemo(
    () => generateLanes(device, dims.w, dims.h),
    [device, dims.w, dims.h],
  );

  // Initialize particles
  useEffect(() => {
    particlesRef.current = createParticles(lanes.length);
  }, [lanes]);

  // Animation loop
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

      // Ensure canvas buffer matches container
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

      // Activation edge: reset particles with natural stagger so stream fills in
      if (active && !wasActive) {
        for (let j = 0; j < particles.length; j++) {
          const pt = particles[j];
          const laneStagger = (pt.laneIndex / lanes.length) * 0.3;
          const slotStagger = (j % PARTICLES_PER_LANE) / PARTICLES_PER_LANE;
          pt.progress = -(laneStagger + slotStagger * 0.15);
          pt.alive = true;
        }
      }
      wasActiveRef.current = active;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        if (!p.alive) continue;

        p.progress += SPEED;

        if (p.progress >= 1) {
          if (active) {
            p.progress -= 1; // continuous loop
          } else {
            p.alive = false; // drain out naturally
            continue;
          }
        }

        // Hasn't entered the path yet (staggered start)
        if (p.progress < 0) continue;

        const lane = lanes[p.laneIndex];
        if (!lane) continue;

        const pos = catmullRom(lane.waypoints, p.progress);
        const fade = edgeFade(p.progress);
        const alpha = fade * 0.55;

        if (alpha < 0.005) continue;

        // Glow
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, lane.radius * 3, 0, Math.PI * 2);
        ctx.fillStyle = lane.color;
        ctx.globalAlpha = alpha * 0.15;
        ctx.fill();

        // Core
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, lane.radius, 0, Math.PI * 2);
        ctx.fillStyle = lane.color;
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
      className="absolute pointer-events-none"
      style={{ inset: insetConfig[device] }}
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
}
