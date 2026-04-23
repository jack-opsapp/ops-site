'use client';

/**
 * SolutionParticleFlow — Dual-canvas particle system for solution device mockups.
 *
 * Renders TWO canvas layers (front and back) so the parent can sandwich a
 * device frame between them, creating the illusion of particles flowing
 * through the device.
 *
 * Front canvas (z-20): particles in the entry half (progress < 0.5)
 * Back canvas (z-0):   particles in the exit half (progress >= 0.5)
 *
 * Exit-half particles refract based on device tilt — their angle and spread
 * shift in response to tilt.rotateX/Y, simulating light through a prism.
 */

import { useRef, useEffect, useMemo, useState } from 'react';
import type { FlowDirection } from '@/lib/industries';

interface SolutionParticleFlowProps {
  flowDirection: FlowDirection;
  isActive: boolean;
  tilt: { rotateX: number; rotateY: number };
  maxTilt: number;
}

/* ─── Colors ─── */
const BLUE = '#6F94B0';
const ORANGE = '#B8764A';
const WHITE = '#F5F5F5';

/* ─── Constants ─── */
const LANE_COUNT = 10;
const PARTICLES_PER_LANE = 5;
const BASE_SPEED = 0.004;
const FADE_EDGE = 0.06;
const SCREEN_START = 0.375;
const SCREEN_END = 0.625;
const REFRACT_STRENGTH = 90;
const SPREAD_FACTOR = 1.5;

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

/* ─── Catmull-Rom spline ─── */
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

/* ─── Lane ─── */
interface Lane {
  waypoints: { x: number; y: number }[];
  entryRgb: [number, number, number];
  exitRgb: [number, number, number];
  sameColor: boolean;
  radius: number;
  speedMul: number;
}

function getColor(lane: Lane, progress: number): string {
  const [er, eg, eb] = lane.entryRgb;
  if (lane.sameColor) return `rgb(${er},${eg},${eb})`;
  if (progress <= SCREEN_START) return `rgb(${er},${eg},${eb})`;
  const [xr, xg, xb] = lane.exitRgb;
  if (progress >= SCREEN_END) return `rgb(${xr},${xg},${xb})`;
  const t = (progress - SCREEN_START) / (SCREEN_END - SCREEN_START);
  return `rgb(${Math.round(er + (xr - er) * t)},${Math.round(eg + (xg - eg) * t)},${Math.round(eb + (xb - eb) * t)})`;
}

function edgeFade(t: number): number {
  if (t < FADE_EDGE) return t / FADE_EDGE;
  if (t > 1 - FADE_EDGE) return (1 - t) / FADE_EDGE;
  return 1.0;
}

function generateLanes(direction: FlowDirection, cw: number, ch: number): Lane[] {
  const seed = direction === 'right-to-left' ? 42 : direction === 'top-to-bottom' ? 99 : 77;
  const rand = seededRandom(seed);
  const lanes: Lane[] = [];
  const isBlue = (i: number) => i % 3 !== 1;

  if (direction === 'left-to-right' || direction === 'right-to-left') {
    const screenCY = 0.5;
    const tightBand = 0.015;
    const leftToRight = direction === 'left-to-right';

    for (let i = 0; i < LANE_COUNT; i++) {
      const blue = isBlue(i);
      const radius = 1.4 + rand() * 0.8;

      let entryHex: string;
      let exitHex: string;
      if (direction === 'right-to-left') {
        entryHex = blue ? BLUE : ORANGE;
        exitHex = blue ? BLUE : WHITE;
      } else {
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
        entryY, entryY * 0.75 + screenY * 0.25, entryY * 0.3 + screenY * 0.7,
        screenY, screenY + (rand() - 0.5) * 0.01, screenY,
        screenY * 0.5 + exitY * 0.5, exitY, farY,
      ];

      const waypoints = xStops.map((x, j) => ({ x: x * cw, y: yStops[j] * ch }));
      const speedMul = 0.9 + rand() * 0.2;
      lanes.push({ waypoints, entryRgb, exitRgb, sameColor, radius, speedMul });
    }
  } else {
    const screenCX = 0.5;
    const tightBand = 0.015;

    for (let i = 0; i < LANE_COUNT; i++) {
      const blue = isBlue(i);
      const radius = 1.4 + rand() * 0.8;

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
        entryX, entryX * 0.75 + screenX * 0.25, entryX * 0.3 + screenX * 0.7,
        screenX, screenX + (rand() - 0.5) * 0.01, screenX,
        screenX * 0.5 + exitX * 0.5, exitX, farX,
      ];

      const waypoints = yStops.map((y, j) => ({ x: xStops[j] * cw, y: y * ch }));
      const speedMul = 0.9 + rand() * 0.2;
      lanes.push({ waypoints, entryRgb, exitRgb, sameColor: false, radius, speedMul });
    }
  }

  return lanes;
}

/* ─── Particle ─── */
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
      const speedFactor = 0.7 - (radiusMul - 0.6) * 0.125;
      particles.push({
        laneIndex: l,
        progress: p / PARTICLES_PER_LANE,
        alive: false,
        radiusMul,
        speedFactor,
        offset: (rand() - 0.5) * 12,
      });
    }
  }
  return particles;
}

/* ─── Component ─── */
export default function SolutionParticleFlow({ flowDirection, isActive, tilt, maxTilt }: SolutionParticleFlowProps) {
  const backContainerRef = useRef<HTMLDivElement>(null);
  const backCanvasRef = useRef<HTMLCanvasElement>(null);
  const frontCanvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const particlesRef = useRef<Particle[]>([]);
  const wasActiveRef = useRef(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [dims, setDims] = useState({ w: 600, h: 500 });
  const isActiveRef = useRef(isActive);
  isActiveRef.current = isActive;
  const tiltRef = useRef(tilt);
  tiltRef.current = tilt;

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  useEffect(() => {
    const el = backContainerRef.current;
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
    const seed = flowDirection === 'right-to-left' ? 42 : flowDirection === 'top-to-bottom' ? 99 : 77;
    particlesRef.current = createParticles(lanes.length, seed);
  }, [lanes, flowDirection]);

  useEffect(() => {
    if (reducedMotion) return;

    const backCanvas = backCanvasRef.current;
    const frontCanvas = frontCanvasRef.current;
    if (!backCanvas || !frontCanvas) return;
    const backCtx = backCanvas.getContext('2d');
    const frontCtx = frontCanvas.getContext('2d');
    if (!backCtx || !frontCtx) return;

    let running = true;

    function draw() {
      if (!running || !backCtx || !frontCtx || !backCanvas || !frontCanvas) return;

      const dpr = window.devicePixelRatio || 1;
      const w = dims.w;
      const h = dims.h;
      const bw = Math.round(w * dpr);
      const bh = Math.round(h * dpr);

      // Sync both canvases
      for (const canvas of [backCanvas, frontCanvas]) {
        if (canvas.width !== bw || canvas.height !== bh) {
          canvas.width = bw;
          canvas.height = bh;
          const ctx = canvas.getContext('2d');
          if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        }
      }

      backCtx.clearRect(0, 0, w, h);
      frontCtx.clearRect(0, 0, w, h);

      const active = isActiveRef.current;
      const wasActive = wasActiveRef.current;
      const particles = particlesRef.current;
      const currentTilt = tiltRef.current;

      // On activation: only restart dead particles — leave in-flight ones alone
      // so re-hovering doesn't cause an abrupt reset
      if (active && !wasActive) {
        for (let j = 0; j < particles.length; j++) {
          const pt = particles[j];
          if (!pt.alive) {
            const slot = j % PARTICLES_PER_LANE;
            const laneDelay = pt.laneIndex * 0.015;
            pt.progress = -(slot / PARTICLES_PER_LANE) - laneDelay;
            pt.alive = true;
          }
        }
      }

      // While active, recycle particles that reach the end
      // While inactive, let them drain naturally (alive ones keep moving)
      wasActiveRef.current = active;

      const tiltNormY = currentTilt.rotateY / maxTilt;
      const tiltNormX = currentTilt.rotateX / maxTilt;
      const tiltMag = Math.sqrt(tiltNormX * tiltNormX + tiltNormY * tiltNormY);

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

        // Position on spline
        const pos = catmullRom(lane.waypoints, p.progress);
        const nextPos = catmullRom(lane.waypoints, Math.min(0.999, p.progress + 0.02));
        const dx = nextPos.x - pos.x;
        const dy = nextPos.y - pos.y;
        const len = Math.sqrt(dx * dx + dy * dy) || 1;

        // Perpendicular offset
        let effectiveOffset = p.offset;
        let drawX = pos.x + effectiveOffset * (-dy / len);
        let drawY = pos.y + effectiveOffset * (dx / len);

        // Select canvas: entry half = front, exit half = back
        const isFront = p.progress < 0.5;
        const ctx = isFront ? frontCtx : backCtx;

        // Refraction for exit-half particles
        if (!isFront) {
          const pastCenter = (p.progress - 0.5) * 2;
          const refractCurve = pastCenter * pastCenter;

          // Directional refraction — particles bend in the direction of tilt
          drawX += tiltNormY * refractCurve * REFRACT_STRENGTH;
          drawY -= tiltNormX * refractCurve * REFRACT_STRENGTH;

          // Spread increase — particles fan out more with tilt
          const spreadMul = 1 + tiltMag * refractCurve * SPREAD_FACTOR;
          const extraSpread = effectiveOffset * (spreadMul - 1);
          drawX += extraSpread * (-dy / len);
          drawY += extraSpread * (dx / len);
        }

        const fade = edgeFade(p.progress);
        const alpha = fade * 0.6;
        if (alpha < 0.005) continue;

        const color = getColor(lane, p.progress);
        const r = lane.radius * p.radiusMul;

        ctx.beginPath();
        ctx.arc(drawX, drawY, r, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.globalAlpha = alpha;
        ctx.fill();
      }

      backCtx.globalAlpha = 1;
      frontCtx.globalAlpha = 1;
      rafRef.current = requestAnimationFrame(draw);
    }

    rafRef.current = requestAnimationFrame(draw);
    return () => {
      running = false;
      cancelAnimationFrame(rafRef.current);
    };
  }, [reducedMotion, dims, lanes, maxTilt]);

  if (reducedMotion) return null;

  return (
    <>
      {/* Back layer — exit-half particles render BEHIND device */}
      <div
        ref={backContainerRef}
        className="absolute pointer-events-none"
        style={{ inset: '-120px', zIndex: 0 }}
      >
        <canvas
          ref={backCanvasRef}
          className="w-full h-full"
          style={{ width: '100%', height: '100%' }}
        />
      </div>

      {/* Front layer — entry-half particles render OVER device */}
      <div
        className="absolute pointer-events-none"
        style={{ inset: '-120px', zIndex: 20 }}
      >
        <canvas
          ref={frontCanvasRef}
          className="w-full h-full"
          style={{ width: '100%', height: '100%' }}
        />
      </div>
    </>
  );
}
