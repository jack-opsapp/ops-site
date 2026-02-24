/**
 * LeadershipSphere — Interactive 3D Canvas visualization for leadership dimension scores
 *
 * 6 dimension vectors radiate from center in 3D space (roughly octahedral).
 * Each vector length corresponds to its score. Thin mesh lines connect adjacent
 * endpoint pairs, ~80 ambient fill lines add atmosphere.
 *
 * Enhanced with sub-nodes that fan around parent dimensions, and focus mode
 * that orients the camera to a clicked dimension and reveals sub-node detail.
 *
 * Follows the StarburstCanvas.tsx pattern exactly:
 * - rotate(), project(), lerpColor() 3D math
 * - Fibonacci-based ambient line distribution
 * - Drag with spring decay (yaw offset + tilt spring-back)
 * - Hover detection on front-hemisphere nodes
 * - Click detection triggers onDimensionClick callback + focus mode
 * - DPI-aware canvas, prefers-reduced-motion, RAF cleanup
 * - SQUARE particles (fillRect), not circles
 *
 * Pure Canvas 2D API — no animation libraries.
 */

'use client';

import { useRef, useEffect, useCallback } from 'react';
import type { Dimension, SimpleScores, DimensionSubScores } from '@/lib/assessment/types';
import { DIMENSIONS } from '@/lib/assessment/types';

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const ACCENT = { r: 89, g: 119, b: 148 };   // #597794
const GREY = { r: 100, g: 100, b: 100 };     // #646464
const FOCAL_LENGTH = 2000;
const ROTATION_PERIOD_S = 120;
const TILT_ANGLE = 0.25;
const DRAG_SENSITIVITY = 0.005;
const SPRING_DECAY = 0.96;
const DRAG_THRESHOLD = 3;
const HOVER_RADIUS = 28;
const AMBIENT_LINE_COUNT = 80;
const MIN_VECTOR_LENGTH = 0.3;
const MAX_VECTOR_LENGTH = 0.9;

/* ------------------------------------------------------------------ */
/*  Dimension geometry                                                 */
/* ------------------------------------------------------------------ */

const DIMENSION_DIRS: Record<Dimension, { dx: number; dy: number; dz: number }> = {
  drive:        { dx: 0.0,   dy: -0.85, dz: 0.53  },
  resilience:   { dx: 0.75,  dy: -0.25, dz: 0.61  },
  vision:       { dx: 0.75,  dy: 0.45,  dz: -0.49 },
  connection:   { dx: -0.75, dy: 0.45,  dz: -0.49 },
  adaptability: { dx: -0.75, dy: -0.25, dz: 0.61  },
  integrity:    { dx: 0.0,   dy: 0.85,  dz: -0.53 },
};

const MESH_PAIRS: [Dimension, Dimension][] = [
  ['drive', 'resilience'],
  ['resilience', 'vision'],
  ['vision', 'integrity'],
  ['integrity', 'connection'],
  ['connection', 'adaptability'],
  ['adaptability', 'drive'],
];

const DIMENSION_LABELS: Record<Dimension, string> = {
  drive: 'DRIVE',
  resilience: 'RESILIENCE',
  vision: 'VISION',
  connection: 'CONNECTION',
  adaptability: 'ADAPTABILITY',
  integrity: 'INTEGRITY',
};

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface LeadershipSphereProps {
  scores: SimpleScores;
  subScores?: DimensionSubScores;
  onDimensionClick?: (dimension: Dimension) => void;
  className?: string;
}

interface AmbientLine {
  dx: number;
  dy: number;
  dz: number;
  baseOpacity: number;
  length: number;
}

interface Particle {
  dim: Dimension;
  t: number;
  speed: number;
}

/* ------------------------------------------------------------------ */
/*  3D helpers (same as StarburstCanvas)                               */
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
): { sx: number; sy: number; scale: number } {
  const scale = FOCAL_LENGTH / (FOCAL_LENGTH - z);
  return { sx: cx + x * scale, sy: cy + y * scale, scale };
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
/*  Sub-node geometry helpers                                          */
/* ------------------------------------------------------------------ */

function normalize(v: { dx: number; dy: number; dz: number }) {
  const len = Math.sqrt(v.dx * v.dx + v.dy * v.dy + v.dz * v.dz);
  if (len === 0) return { dx: 0, dy: 1, dz: 0 };
  return { dx: v.dx / len, dy: v.dy / len, dz: v.dz / len };
}

function cross(
  a: { dx: number; dy: number; dz: number },
  b: { dx: number; dy: number; dz: number },
) {
  return {
    dx: a.dy * b.dz - a.dz * b.dy,
    dy: a.dz * b.dx - a.dx * b.dz,
    dz: a.dx * b.dy - a.dy * b.dx,
  };
}

function computeSubNodeDirection(
  parentDir: { dx: number; dy: number; dz: number },
  index: number,
  total: number,
  spread: number,
): { dx: number; dy: number; dz: number } {
  const n = normalize(parentDir);

  // Pick an arbitrary vector not parallel to parent for cross product
  const up = Math.abs(n.dy) < 0.9 ? { dx: 0, dy: 1, dz: 0 } : { dx: 1, dy: 0, dz: 0 };
  const tangent1 = normalize(cross(n, up));
  const tangent2 = normalize(cross(n, tangent1));

  // Fan sub-nodes around parent direction
  const angleStep = total > 1 ? (2 * Math.PI) / total : 0;
  const theta = angleStep * index;

  const cosS = Math.cos(spread);
  const sinS = Math.sin(spread);
  const cosT = Math.cos(theta);
  const sinT = Math.sin(theta);

  return {
    dx: n.dx * cosS + (tangent1.dx * cosT + tangent2.dx * sinT) * sinS,
    dy: n.dy * cosS + (tangent1.dy * cosT + tangent2.dy * sinT) * sinS,
    dz: n.dz * cosS + (tangent1.dz * cosT + tangent2.dz * sinT) * sinS,
  };
}

/* ------------------------------------------------------------------ */
/*  Scene generation (stable across frames)                            */
/* ------------------------------------------------------------------ */

function generateAmbientLines(): AmbientLine[] {
  const lines: AmbientLine[] = [];
  const GOLDEN_ANGLE = Math.PI * (1 + Math.sqrt(5));

  for (let i = 0; i < AMBIENT_LINE_COUNT; i++) {
    const phi = Math.acos(1 - 2 * (i + 0.5) / AMBIENT_LINE_COUNT);
    const theta = GOLDEN_ANGLE * i;

    const dx = Math.sin(phi) * Math.cos(theta);
    const dy = Math.sin(phi) * Math.sin(theta);
    const dz = Math.cos(phi);

    const baseOpacity = 0.04 + Math.random() * 0.06;
    const length = 0.15 + Math.random() * 0.35;

    lines.push({ dx, dy, dz, baseOpacity, length });
  }

  return lines;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function LeadershipSphere({
  scores,
  subScores,
  onDimensionClick,
  className,
}: LeadershipSphereProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const ambientRef = useRef<AmbientLine[] | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animRef = useRef<number>(0);
  const mouseRef = useRef({ x: -9999, y: -9999 });
  const hoveredRef = useRef<Dimension | null>(null);
  const dragRef = useRef({
    active: false,
    didDrag: false,
    startX: 0,
    startY: 0,
    yawAtStart: 0,
    tiltAtStart: 0,
  });
  const dragYawOffsetRef = useRef(0);
  const dragTiltOffsetRef = useRef(0);
  const scoresRef = useRef(scores);
  const subScoresRef = useRef(subScores);
  const onClickRef = useRef(onDimensionClick);

  // Focus mode refs
  const focusedDimRef = useRef<Dimension | null>(null);
  const focusTransitionRef = useRef(0);
  const focusTargetYawRef = useRef(0);

  // Keep refs in sync with props
  scoresRef.current = scores;
  subScoresRef.current = subScores;
  onClickRef.current = onDimensionClick;

  // Generate ambient lines once
  if (!ambientRef.current) {
    ambientRef.current = generateAmbientLines();
  }

  // Initialize particles for high-score dimensions
  if (particlesRef.current.length === 0) {
    for (const dim of DIMENSIONS) {
      if (scores[dim] > 70) {
        for (let i = 0; i < 3; i++) {
          particlesRef.current.push({
            dim,
            t: Math.random(),
            speed: 0.15 + Math.random() * 0.15,
          });
        }
      }
    }
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

  /* ---- Mouse handlers (on container div, same as StarburstCanvas) ---- */

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const drag = dragRef.current;

    // If in focus mode and user starts drag, exit focus mode
    if (focusedDimRef.current !== null) {
      focusedDimRef.current = null;
    }

    drag.active = true;
    drag.didDrag = false;
    drag.startX = e.clientX;
    drag.startY = e.clientY;
    drag.yawAtStart = dragYawOffsetRef.current;
    drag.tiltAtStart = dragTiltOffsetRef.current;
    if (containerRef.current) containerRef.current.style.cursor = 'grabbing';
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };

    const drag = dragRef.current;
    if (drag.active) {
      const deltaX = e.clientX - drag.startX;
      const deltaY = e.clientY - drag.startY;
      if (!drag.didDrag && Math.sqrt(deltaX * deltaX + deltaY * deltaY) > DRAG_THRESHOLD) {
        drag.didDrag = true;
      }
      if (drag.didDrag) {
        dragYawOffsetRef.current = drag.yawAtStart + deltaX * DRAG_SENSITIVITY;
        dragTiltOffsetRef.current = drag.tiltAtStart - deltaY * DRAG_SENSITIVITY;
      }
    }
  }, []);

  const handleMouseLeave = useCallback(() => {
    mouseRef.current = { x: -9999, y: -9999 };
    dragRef.current.active = false;
    dragRef.current.didDrag = false;
    if (containerRef.current) containerRef.current.style.cursor = 'grab';
  }, []);

  const handleMouseUp = useCallback(() => {
    const drag = dragRef.current;
    if (!drag.didDrag && hoveredRef.current) {
      const clickedDim = hoveredRef.current;

      // Focus mode logic
      if (focusedDimRef.current === null) {
        // Overview mode: enter focus
        focusedDimRef.current = clickedDim;
        const dir = DIMENSION_DIRS[clickedDim];
        focusTargetYawRef.current = -Math.atan2(dir.dx, dir.dz);
      } else if (focusedDimRef.current !== clickedDim) {
        // Focus on different dim: switch focus
        focusedDimRef.current = clickedDim;
        const dir = DIMENSION_DIRS[clickedDim];
        focusTargetYawRef.current = -Math.atan2(dir.dx, dir.dz);
      }
      // Focus + click same node: no-op

      if (onClickRef.current) {
        onClickRef.current(clickedDim);
      }
    }
    drag.active = false;
    drag.didDrag = false;
    if (containerRef.current) containerRef.current.style.cursor = 'grab';
  }, []);

  useEffect(() => {
    resize();

    const container = containerRef.current!;
    let observer: ResizeObserver | null = null;
    if (container) {
      observer = new ResizeObserver(() => resize());
      observer.observe(container);
    }

    const handleWindowMouseUp = () => {
      const drag = dragRef.current;
      if (!drag.didDrag && hoveredRef.current) {
        const clickedDim = hoveredRef.current;

        if (focusedDimRef.current === null) {
          focusedDimRef.current = clickedDim;
          const dir = DIMENSION_DIRS[clickedDim];
          focusTargetYawRef.current = -Math.atan2(dir.dx, dir.dz);
        } else if (focusedDimRef.current !== clickedDim) {
          focusedDimRef.current = clickedDim;
          const dir = DIMENSION_DIRS[clickedDim];
          focusTargetYawRef.current = -Math.atan2(dir.dx, dir.dz);
        }

        if (onClickRef.current) {
          onClickRef.current(clickedDim);
        }
      }
      drag.active = false;
      drag.didDrag = false;
      if (containerRef.current) containerRef.current.style.cursor = 'grab';
    };
    window.addEventListener('mouseup', handleWindowMouseUp);

    /* ---- Touch support for mobile drag ---- */

    const handleTouchStart = (e: TouchEvent) => {
      const t = e.touches[0];
      const drag = dragRef.current;

      // If in focus mode and user starts drag, exit focus mode
      if (focusedDimRef.current !== null) {
        focusedDimRef.current = null;
      }

      drag.active = true;
      drag.didDrag = false;
      drag.startX = t.clientX;
      drag.startY = t.clientY;
      drag.yawAtStart = dragYawOffsetRef.current;
      drag.tiltAtStart = dragTiltOffsetRef.current;
    };

    const handleTouchMove = (e: TouchEvent) => {
      const drag = dragRef.current;
      if (!drag.active) return;
      const t = e.touches[0];
      const deltaX = t.clientX - drag.startX;
      const deltaY = t.clientY - drag.startY;
      if (!drag.didDrag && Math.sqrt(deltaX * deltaX + deltaY * deltaY) > DRAG_THRESHOLD) {
        drag.didDrag = true;
      }
      if (drag.didDrag) {
        e.preventDefault();
        dragYawOffsetRef.current = drag.yawAtStart + deltaX * DRAG_SENSITIVITY;
        dragTiltOffsetRef.current = drag.tiltAtStart - deltaY * DRAG_SENSITIVITY;
      }
    };

    const handleTouchEnd = () => {
      const drag = dragRef.current;
      if (!drag.didDrag && hoveredRef.current) {
        const clickedDim = hoveredRef.current;

        if (focusedDimRef.current === null) {
          focusedDimRef.current = clickedDim;
          const dir = DIMENSION_DIRS[clickedDim];
          focusTargetYawRef.current = -Math.atan2(dir.dx, dir.dz);
        } else if (focusedDimRef.current !== clickedDim) {
          focusedDimRef.current = clickedDim;
          const dir = DIMENSION_DIRS[clickedDim];
          focusTargetYawRef.current = -Math.atan2(dir.dx, dir.dz);
        }

        if (onClickRef.current) {
          onClickRef.current(clickedDim);
        }
      }
      drag.active = false;
      drag.didDrag = false;
    };

    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd);

    /* ---- prefers-reduced-motion ---- */

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const ambientLines = ambientRef.current!;
    const particles = particlesRef.current;
    let prevTimestamp: number | null = null;
    let yaw = 0;
    const BASE_ANGULAR_SPEED = (Math.PI * 2) / ROTATION_PERIOD_S;

    /* ---- Render function ---- */

    function renderFrame(finalYaw: number, finalTilt: number, dt: number) {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const currentScores = scoresRef.current;
      const currentSubScores = subScoresRef.current;
      const w = parseFloat(canvas.style.width) || canvas.width;
      const h = parseFloat(canvas.style.height) || canvas.height;
      const cx = w / 2;
      const cy = h / 2;
      const radius = Math.min(w, h) * 0.40;
      const mouse = mouseRef.current;
      const drag = dragRef.current;
      const focusTransition = focusTransitionRef.current;
      const focusedDim = focusedDimRef.current;

      ctx.clearRect(0, 0, w, h);

      /* ---- Phase 1: Compute ambient line positions ---- */

      interface AmbientComputed {
        endSX: number;
        endSY: number;
        endDepth: number;
        depthNorm: number;
        color: { r: number; g: number; b: number };
        opacity: number;
        lineWidth: number;
        sortKey: number;
      }

      const ambientComputed: AmbientComputed[] = [];
      let maxZ = 1;

      const ambientRotated: { x: number; y: number; z: number }[] = [];
      for (const line of ambientLines) {
        const ex = line.dx * radius * line.length;
        const ey = line.dy * radius * line.length;
        const ez = line.dz * radius * line.length;
        const r3 = rotate(ex, ey, ez, finalYaw, finalTilt);
        ambientRotated.push(r3);
        if (Math.abs(r3.z) > maxZ) maxZ = Math.abs(r3.z);
      }

      /* ---- Phase 2: Compute dimension vector endpoints ---- */

      interface DimComputed {
        dim: Dimension;
        sx: number;
        sy: number;
        depth: number;
        depthNorm: number;
        isFront: boolean;
        scale: number;
        score: number;
        color: { r: number; g: number; b: number };
        vectorLength: number;
        raw: { x: number; y: number; z: number };
      }

      const dimComputed: Map<Dimension, DimComputed> = new Map();

      for (const dim of DIMENSIONS) {
        const dir = DIMENSION_DIRS[dim];
        const score = currentScores[dim];
        const vectorLength = MIN_VECTOR_LENGTH + (score / 100) * (MAX_VECTOR_LENGTH - MIN_VECTOR_LENGTH);
        const ex = dir.dx * radius * vectorLength;
        const ey = dir.dy * radius * vectorLength;
        const ez = dir.dz * radius * vectorLength;
        const r3 = rotate(ex, ey, ez, finalYaw, finalTilt);
        if (Math.abs(r3.z) > maxZ) maxZ = Math.abs(r3.z);

        dimComputed.set(dim, {
          dim,
          sx: 0,
          sy: 0,
          depth: r3.z,
          depthNorm: 0,
          isFront: r3.z > 0,
          scale: 1,
          score,
          color: GREY,
          vectorLength,
          raw: r3,
        });
      }

      /* ---- Phase 1b: Normalize depths and project ---- */

      for (let i = 0; i < ambientLines.length; i++) {
        const line = ambientLines[i];
        const r3 = ambientRotated[i];
        const p = project(r3.x, r3.y, r3.z, cx, cy);
        const depthNorm = (r3.z / maxZ + 1) / 2;
        const color = lerpColor(GREY, ACCENT, depthNorm * 0.5);
        const opacity = line.baseOpacity * (0.3 + depthNorm * 0.7);
        const lineWidth = 0.3 + depthNorm * 0.3;

        ambientComputed.push({
          endSX: p.sx,
          endSY: p.sy,
          endDepth: r3.z,
          depthNorm,
          color,
          opacity,
          lineWidth,
          sortKey: r3.z,
        });
      }

      for (const dc of dimComputed.values()) {
        const p = project(dc.raw.x, dc.raw.y, dc.raw.z, cx, cy);
        dc.sx = p.sx;
        dc.sy = p.sy;
        dc.scale = p.scale;
        dc.depthNorm = (dc.raw.z / maxZ + 1) / 2;
        dc.isFront = dc.raw.z > 0;
        dc.color = lerpColor(GREY, ACCENT, dc.score / 100);
      }

      /* ---- Phase 3: Hover detection ---- */

      let hoveredDim: Dimension | null = null;
      let hoveredDist = HOVER_RADIUS;

      if (!drag.didDrag) {
        for (const dc of dimComputed.values()) {
          if (!dc.isFront) continue;
          const ddx = mouse.x - dc.sx;
          const ddy = mouse.y - dc.sy;
          const dist = Math.sqrt(ddx * ddx + ddy * ddy);
          if (dist < hoveredDist) {
            hoveredDist = dist;
            hoveredDim = dc.dim;
          }
        }
      }

      hoveredRef.current = hoveredDim;

      /* ---- Phase 4: Draw ambient lines (sorted back-to-front) ---- */

      const ambientIndices = ambientComputed.map((_, i) => i);
      ambientIndices.sort((a, b) => ambientComputed[a].endDepth - ambientComputed[b].endDepth);

      for (const idx of ambientIndices) {
        const c = ambientComputed[idx];
        const { r, g, b } = c.color;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(c.endSX, c.endSY);
        ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${c.opacity})`;
        ctx.lineWidth = c.lineWidth;
        ctx.stroke();
      }

      /* ---- Phase 5: Draw mesh connections ---- */

      ctx.setLineDash([4, 6]);
      for (const [dimA, dimB] of MESH_PAIRS) {
        const a = dimComputed.get(dimA)!;
        const b = dimComputed.get(dimB)!;
        const avgDepthNorm = (a.depthNorm + b.depthNorm) / 2;
        const meshColor = lerpColor(GREY, ACCENT, avgDepthNorm * 0.5);
        const meshOpacity = 0.06 + avgDepthNorm * 0.06;

        ctx.beginPath();
        ctx.moveTo(a.sx, a.sy);
        ctx.lineTo(b.sx, b.sy);
        ctx.strokeStyle = `rgba(${meshColor.r}, ${meshColor.g}, ${meshColor.b}, ${meshOpacity})`;
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }
      ctx.setLineDash([]);

      /* ---- Phase 6: Sort dimension vectors back-to-front ---- */

      const dimsSorted = Array.from(dimComputed.values()).sort((a, b) => a.depth - b.depth);

      /* ---- Phase 7: Draw dimension rays, nodes, sub-nodes, particles, labels ---- */

      for (const dc of dimsSorted) {
        const { r, g, b } = dc.color;
        const isHovered = dc.dim === hoveredDim;
        const isFocused = dc.dim === focusedDim;

        // Compute opacity multiplier for focus mode
        const focusDimAlpha = isFocused || focusedDim === null
          ? 1.0
          : 1.0 - focusTransition * 0.7;

        const rayOpacity = (dc.isFront
          ? lerp(0.15, 0.40, dc.depthNorm)
          : lerp(0.05, 0.15, dc.depthNorm)) * focusDimAlpha;

        // Draw ray from center to node
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(dc.sx, dc.sy);
        ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${rayOpacity})`;
        ctx.lineWidth = isHovered ? 1.5 : (0.5 + dc.depthNorm * 0.8);
        ctx.stroke();

        // Draw node (square)
        const nodeSize = (isHovered ? 8 : 5) * dc.scale;
        const nodeAlpha = (isHovered
          ? 0.90
          : dc.isFront
            ? lerp(0.30, 0.70, dc.depthNorm)
            : lerp(0.10, 0.25, dc.depthNorm)) * focusDimAlpha;

        if (isHovered) {
          ctx.shadowColor = `rgba(${ACCENT.r}, ${ACCENT.g}, ${ACCENT.b}, 0.5)`;
          ctx.shadowBlur = 14;
        }

        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${nodeAlpha})`;
        ctx.fillRect(
          dc.sx - nodeSize / 2,
          dc.sy - nodeSize / 2,
          nodeSize,
          nodeSize,
        );

        if (isHovered) {
          ctx.fillRect(
            dc.sx - nodeSize / 2,
            dc.sy - nodeSize / 2,
            nodeSize,
            nodeSize,
          );
          ctx.shadowColor = 'transparent';
          ctx.shadowBlur = 0;
        }

        /* ---- Sub-nodes ---- */

        if (currentSubScores && currentSubScores[dc.dim]) {
          const dimSubScores = currentSubScores[dc.dim];
          const dir = DIMENSION_DIRS[dc.dim];

          // Spread increases in focus mode
          const spread = isFocused
            ? lerp(0.15, 0.6, focusTransition)
            : lerp(0.15, 0.15, focusTransition);

          for (let si = 0; si < dimSubScores.length; si++) {
            const sub = dimSubScores[si];
            const subDir = computeSubNodeDirection(dir, si, dimSubScores.length, spread);
            const subLen = (sub.score / 100) * MAX_VECTOR_LENGTH * 0.6 * radius;

            const sx3 = subDir.dx * subLen;
            const sy3 = subDir.dy * subLen;
            const sz3 = subDir.dz * subLen;
            const r3 = rotate(sx3, sy3, sz3, finalYaw, finalTilt);
            const p = project(r3.x, r3.y, r3.z, cx, cy);

            // Sub-node size: 3px (overview), 5px (focus)
            const subSize = isFocused
              ? lerp(3, 5, focusTransition) * dc.scale
              : 3 * dc.scale;

            // Sub-node opacity: parentOpacity * 0.4 (overview), * 0.8 (focus)
            const subAlphaFactor = isFocused
              ? lerp(0.4, 0.8, focusTransition)
              : 0.4;
            const subAlpha = nodeAlpha * subAlphaFactor;

            // Draw sub-node connector line
            ctx.beginPath();
            ctx.moveTo(dc.sx, dc.sy);
            ctx.lineTo(p.sx, p.sy);
            ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${subAlpha * 0.4})`;
            ctx.lineWidth = 0.3;
            ctx.stroke();

            // Draw sub-node square
            ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${subAlpha})`;
            ctx.fillRect(
              p.sx - subSize / 2,
              p.sy - subSize / 2,
              subSize,
              subSize,
            );

            // Draw sub-node label in focus mode
            if (isFocused && focusTransition > 0.3) {
              const labelAlpha = (focusTransition - 0.3) / 0.7 * subAlpha;
              ctx.font = '400 8px "Kosugi", sans-serif';
              ctx.textAlign = 'center';
              ctx.textBaseline = 'top';
              ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${labelAlpha})`;
              ctx.fillText(sub.label.toUpperCase(), p.sx, p.sy + subSize / 2 + 4);
            }
          }
        }

        // Draw particles along high-score vectors (score > 70)
        // Particles stop for unfocused dims in focus mode
        const showParticles = !prefersReduced && dc.score > 70
          && (focusedDim === null || isFocused);

        if (showParticles) {
          for (const particle of particles) {
            if (particle.dim !== dc.dim) continue;
            const pt = particle.t;
            const px = cx + (dc.sx - cx) * pt;
            const py = cy + (dc.sy - cy) * pt;
            const particleSize = 2 * dc.scale;
            const particleAlpha = nodeAlpha * 0.6 * (1 - Math.abs(pt - 0.5) * 2);

            ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${Math.max(0, particleAlpha)})`;
            ctx.fillRect(
              px - particleSize / 2,
              py - particleSize / 2,
              particleSize,
              particleSize,
            );
          }
        }

        // Draw dimension label
        const dir = DIMENSION_DIRS[dc.dim];
        const labelOffsetY = dir.dy < 0 ? -14 : 18;
        const labelX = dc.sx;
        const labelY = dc.sy + labelOffsetY;
        const labelAlpha = (isHovered
          ? 0.90
          : dc.isFront
            ? lerp(0.20, 0.50, dc.depthNorm)
            : lerp(0.05, 0.15, dc.depthNorm)) * focusDimAlpha;

        ctx.font = '400 10px "Kosugi", sans-serif';
        ctx.textBaseline = dir.dy < 0 ? 'bottom' : 'top';
        if (dir.dx < -0.1) {
          ctx.textAlign = 'right';
        } else if (dir.dx > 0.1) {
          ctx.textAlign = 'left';
        } else {
          ctx.textAlign = 'center';
        }

        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${labelAlpha})`;
        ctx.fillText(DIMENSION_LABELS[dc.dim], labelX, labelY);

        // Show score value when hovered
        if (isHovered) {
          const scoreLabel = `${dc.score}`;
          const scoreLabelY = dir.dy < 0 ? labelY - 13 : labelY + 13;
          ctx.font = '600 12px "Mohave", sans-serif';
          ctx.fillStyle = `rgba(${ACCENT.r}, ${ACCENT.g}, ${ACCENT.b}, 0.90)`;
          ctx.fillText(scoreLabel, labelX, scoreLabelY);
        }
      }

      /* ---- Update particles ---- */
      if (!prefersReduced) {
        for (const particle of particles) {
          particle.t += particle.speed * dt;
          if (particle.t > 1) {
            particle.t = 0;
            particle.speed = 0.15 + Math.random() * 0.15;
          }
        }
      }
    }

    /* ---- Static frame for reduced motion ---- */

    if (prefersReduced) {
      renderFrame(0, TILT_ANGLE, 0);
      return () => {
        if (observer) observer.disconnect();
        window.removeEventListener('mouseup', handleWindowMouseUp);
        container.removeEventListener('touchstart', handleTouchStart);
        container.removeEventListener('touchmove', handleTouchMove);
        container.removeEventListener('touchend', handleTouchEnd);
      };
    }

    /* ---- Animation loop ---- */

    function draw(timestamp: number) {
      if (prevTimestamp === null) prevTimestamp = timestamp;
      const dt = (timestamp - prevTimestamp) / 1000;
      prevTimestamp = timestamp;

      const drag = dragRef.current;
      const focusedDim = focusedDimRef.current;

      // Focus transition lerp
      if (focusedDim !== null) {
        focusTransitionRef.current += (1.0 - focusTransitionRef.current) * 0.04;
      } else {
        focusTransitionRef.current += (0.0 - focusTransitionRef.current) * 0.04;
        if (focusTransitionRef.current < 0.001) focusTransitionRef.current = 0;
      }

      if (!drag.active) {
        yaw = (yaw + dragYawOffsetRef.current) % (Math.PI * 2);
        dragYawOffsetRef.current = 0;

        if (focusedDim !== null) {
          // Yaw lerps toward target (shortest-path angle interpolation)
          let delta = focusTargetYawRef.current - yaw;
          delta -= Math.round(delta / (Math.PI * 2)) * (Math.PI * 2);
          yaw += delta * 0.04;
        } else {
          // Auto-rotation
          yaw = (yaw + BASE_ANGULAR_SPEED * dt) % (Math.PI * 2);
        }

        // Spring-back tilt
        dragTiltOffsetRef.current *= SPRING_DECAY;
        if (Math.abs(dragTiltOffsetRef.current) < 0.001) dragTiltOffsetRef.current = 0;
      }

      const finalYaw = yaw + dragYawOffsetRef.current;
      const finalTilt = TILT_ANGLE + dragTiltOffsetRef.current;

      renderFrame(finalYaw, finalTilt, dt);

      animRef.current = requestAnimationFrame(draw);
    }

    animRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animRef.current);
      if (observer) observer.disconnect();
      window.removeEventListener('mouseup', handleWindowMouseUp);
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [resize]);

  return (
    <div
      ref={containerRef}
      className={className}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseUp={handleMouseUp}
      style={{ position: 'relative', cursor: 'grab' }}
    >
      <canvas
        ref={canvasRef}
        style={{ display: 'block', width: '100%', height: '100%' }}
      />
    </div>
  );
}
