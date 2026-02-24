/**
 * GeneratingState — 3D rotating radial burst loading animation
 *
 * Replaces the hexagonal radar with AmbientBurst's 3D rotating radial burst.
 * ~60 Fibonacci-sphere lines, slow rotation, depth-based color, overlaid text.
 *
 * Pure Canvas 2D API — no animation libraries.
 */

'use client';

import { useRef, useEffect, useCallback } from 'react';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface ALine {
  dx: number;
  dy: number;
  dz: number;
  baseOpacity: number;
  length: number;
}

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const LINE_COUNT = 60;
const ROTATION_PERIOD_S = 120;
const TILT_ANGLE = 0.25;
const FOCAL_LENGTH = 2000;

const ACCENT = { r: 89, g: 119, b: 148 };
const GREY = { r: 80, g: 80, b: 80 };

/* ------------------------------------------------------------------ */
/*  Scene generation                                                   */
/* ------------------------------------------------------------------ */

function generateScene(): ALine[] {
  const lines: ALine[] = [];
  const GOLDEN_ANGLE = Math.PI * (1 + Math.sqrt(5));

  for (let i = 0; i < LINE_COUNT; i++) {
    const phi = Math.acos(1 - 2 * (i + 0.5) / LINE_COUNT);
    const theta = GOLDEN_ANGLE * i;

    const dx = Math.sin(phi) * Math.cos(theta);
    const dy = Math.sin(phi) * Math.sin(theta);
    const dz = Math.cos(phi);

    const baseOpacity = 0.06 + Math.random() * 0.08;
    const length = 0.2 + Math.random() * 0.4;

    lines.push({ dx, dy, dz, baseOpacity, length });
  }

  return lines;
}

/* ------------------------------------------------------------------ */
/*  3D helpers                                                         */
/* ------------------------------------------------------------------ */

function rotate(
  px: number, py: number, pz: number,
  yaw: number, tilt: number,
): { x: number; y: number; z: number } {
  const x1 = px * Math.cos(yaw) + pz * Math.sin(yaw);
  const z1 = -px * Math.sin(yaw) + pz * Math.cos(yaw);
  const y1 = py;
  return {
    x: x1,
    y: y1 * Math.cos(tilt) - z1 * Math.sin(tilt),
    z: y1 * Math.sin(tilt) + z1 * Math.cos(tilt),
  };
}

function project(
  x: number, y: number, z: number,
  cx: number, cy: number,
): { sx: number; sy: number } {
  const scale = FOCAL_LENGTH / (FOCAL_LENGTH - z);
  return { sx: cx + x * scale, sy: cy + y * scale };
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function lerpColor(
  back: { r: number; g: number; b: number },
  front: { r: number; g: number; b: number },
  t: number,
) {
  return {
    r: Math.round(lerp(back.r, front.r, t)),
    g: Math.round(lerp(back.g, front.g, t)),
    b: Math.round(lerp(back.b, front.b, t)),
  };
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function GeneratingState() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<ALine[] | null>(null);
  const animRef = useRef<number>(0);

  if (!sceneRef.current) {
    sceneRef.current = generateScene();
  }

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

    const lines = sceneRef.current!;
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function renderFrame(yaw: number) {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const w = parseFloat(canvas.style.width) || canvas.width;
      const h = parseFloat(canvas.style.height) || canvas.height;
      const cx = w / 2;
      const cy = h / 2;
      const radius = Math.min(w, h) * 0.45;

      ctx.clearRect(0, 0, w, h);

      interface Computed {
        endSX: number;
        endSY: number;
        endDepth: number;
        depthNorm: number;
        color: { r: number; g: number; b: number };
        opacity: number;
        lineWidth: number;
      }

      const computed: Computed[] = [];
      let maxZ = 1;

      const rotated: { x: number; y: number; z: number }[] = [];
      for (const line of lines) {
        const ex = line.dx * radius * line.length;
        const ey = line.dy * radius * line.length;
        const ez = line.dz * radius * line.length;
        const r3 = rotate(ex, ey, ez, yaw, TILT_ANGLE);
        rotated.push(r3);
        if (Math.abs(r3.z) > maxZ) maxZ = Math.abs(r3.z);
      }

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const r3 = rotated[i];
        const p = project(r3.x, r3.y, r3.z, cx, cy);
        const depthNorm = (r3.z / maxZ + 1) / 2;

        const color = lerpColor(GREY, ACCENT, depthNorm);
        const opacity = line.baseOpacity * (0.4 + depthNorm * 0.6);
        const lineWidth = 0.3 + depthNorm * 0.3;

        computed.push({
          endSX: p.sx,
          endSY: p.sy,
          endDepth: r3.z,
          depthNorm,
          color,
          opacity,
          lineWidth,
        });
      }

      const indices = computed.map((_, i) => i);
      indices.sort((a, b) => computed[a].endDepth - computed[b].endDepth);

      for (const idx of indices) {
        const c = computed[idx];
        const { r, g, b } = c.color;

        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(c.endSX, c.endSY);
        ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${c.opacity})`;
        ctx.lineWidth = c.lineWidth;
        ctx.stroke();
      }
    }

    if (prefersReduced) {
      renderFrame(0);
      return () => {
        if (observer) observer.disconnect();
      };
    }

    let prevTimestamp: number | null = null;
    let yaw = 0;
    const angularSpeed = (Math.PI * 2) / ROTATION_PERIOD_S;

    function draw(timestamp: number) {
      if (prevTimestamp === null) prevTimestamp = timestamp;
      const dt = (timestamp - prevTimestamp) / 1000;
      prevTimestamp = timestamp;

      yaw = (yaw + angularSpeed * dt) % (Math.PI * 2);

      renderFrame(yaw);

      animRef.current = requestAnimationFrame(draw);
    }

    animRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animRef.current);
      if (observer) observer.disconnect();
    };
  }, [resize]);

  return (
    <div className="min-h-[400px] flex flex-col items-center justify-center bg-ops-background relative">
      <div ref={containerRef} className="absolute inset-0">
        <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%' }} />
      </div>
      <div className="relative z-10">
        <p className="font-caption text-xs uppercase tracking-[0.2em] text-ops-text-secondary">
          Generating your leadership profile...
        </p>
      </div>
    </div>
  );
}
