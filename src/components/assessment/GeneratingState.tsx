/**
 * GeneratingState — Starfield-to-Sphere loading animation
 *
 * A starfield fills the canvas. From center, dimension vectors extrude
 * outward to connect with stars that glow as major nodes. Then sub-node
 * vectors extrude from each major node to fainter sub-node stars.
 * Mesh connections fade in. End state is a visible leadership sphere.
 *
 * Pure Canvas 2D API — no animation libraries.
 */

'use client';

import { useRef, useEffect, useCallback, useState } from 'react';
import { motion } from 'framer-motion';

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const STAR_COUNT = 180;
const FOCAL_LENGTH = 2000;
const TILT_ANGLE = 0.25;
const ROTATION_PERIOD_S = 100;

const ACCENT = { r: 89, g: 119, b: 148 };
const GREY = { r: 80, g: 80, b: 80 };
const GREY_STAR = { r: 180, g: 180, b: 180 };
const ORANGE = { r: 210, g: 140, b: 60 };
const ORANGE_RADIUS = 90;

// Phase timing (seconds)
const STARFIELD_DURATION = 2.0;
const VECTOR_EXTRUDE_START = 2.0;
const VECTOR_EXTRUDE_DURATION = 3.0;
const SUB_EXTRUDE_START = 5.5;
const SUB_EXTRUDE_DURATION = 2.5;
const MESH_FADE_START = 7.5;
const MESH_FADE_DURATION = 2.0;

// Representative scores for the animation
const DIM_SCORES = [78, 65, 82, 71, 58, 88]; // drive, resilience, vision, connection, adaptability, integrity
const SUB_COUNTS = [3, 2, 3, 2, 2, 3]; // sub-nodes per dimension
const SUB_SCORES = [
  [82, 71, 80],       // drive
  [60, 70],           // resilience
  [85, 78, 83],       // vision
  [75, 67],           // connection
  [55, 61],           // adaptability
  [90, 85, 89],       // integrity
];

const MIN_VEC_LEN = 0.3;
const MAX_VEC_LEN = 0.9;
const SUB_SPREAD = 1.36; // ~78° umbrella angle
const TOTAL_ANIM_DURATION = MESH_FADE_START + MESH_FADE_DURATION; // 9.5s

const DIM_LABELS = ['DRIVE', 'RESILIENCE', 'VISION', 'CONNECTION', 'ADAPTABILITY', 'INTEGRITY'];
const NODE_HOVER_RADIUS = 30;

/* ------------------------------------------------------------------ */
/*  Vector helpers                                                     */
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

const DIM_DIRS = [
  normalize({ dx:  0.208, dy: -1.0,  dz:  0.0   }),
  normalize({ dx:  0.978, dy:  0.0,  dz: -0.208 }),
  normalize({ dx:  0.208, dy:  0.0,  dz: -0.978 }),
  normalize({ dx: -0.978, dy:  0.0,  dz:  0.208 }),
  normalize({ dx: -0.208, dy:  0.0,  dz:  0.978 }),
  normalize({ dx: -0.208, dy:  1.0,  dz:  0.0   }),
];

const MESH_PAIRS: [number, number][] = [
  [1, 2], [2, 4], [4, 3], [3, 1],
  [0, 1], [0, 2], [0, 4], [0, 3],
  [5, 1], [5, 2], [5, 4], [5, 3],
];

function computeSubDir(
  parentDir: { dx: number; dy: number; dz: number },
  index: number, total: number, spread: number,
) {
  const n = normalize(parentDir);
  const up = Math.abs(n.dy) < 0.9 ? { dx: 0, dy: 1, dz: 0 } : { dx: 1, dy: 0, dz: 0 };
  const t1 = normalize(cross(n, up));
  const t2 = normalize(cross(n, t1));
  const step = total > 1 ? (2 * Math.PI) / total : 0;
  const theta = step * index;
  const cosS = Math.cos(spread), sinS = Math.sin(spread);
  const cosT = Math.cos(theta), sinT = Math.sin(theta);
  return {
    dx: n.dx * cosS + (t1.dx * cosT + t2.dx * sinT) * sinS,
    dy: n.dy * cosS + (t1.dy * cosT + t2.dy * sinT) * sinS,
    dz: n.dz * cosS + (t1.dz * cosT + t2.dz * sinT) * sinS,
  };
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

function easeInOut(t: number): number {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

/* ------------------------------------------------------------------ */
/*  Star types                                                         */
/* ------------------------------------------------------------------ */

interface Star {
  // 3D position (unit-sphere based, scaled by radius at render time)
  x3: number;
  y3: number;
  z3: number;
  size: number;
  baseAlpha: number;
  twinklePhase: number;
  twinkleSpeed: number;
  baseColor: { r: number; g: number; b: number };
}

/* ------------------------------------------------------------------ */
/*  Scene generation                                                   */
/* ------------------------------------------------------------------ */

function generateStarfield(): Star[] {
  const stars: Star[] = [];

  for (let i = 0; i < STAR_COUNT; i++) {
    // Scatter across a wide sphere
    const phi = Math.acos(1 - 2 * Math.random());
    const theta = Math.random() * Math.PI * 2;
    const r = 0.15 + Math.random() * 0.85;

    const roll = Math.random();
    const baseColor = roll < 0.7 ? GREY_STAR : ACCENT;

    stars.push({
      x3: Math.sin(phi) * Math.cos(theta) * r,
      y3: Math.sin(phi) * Math.sin(theta) * r,
      z3: Math.cos(phi) * r,
      size: 0.8 + Math.random() * 2.0,
      baseAlpha: 0.08 + Math.random() * 0.18,
      twinklePhase: Math.random() * Math.PI * 2,
      twinkleSpeed: 0.8 + Math.random() * 1.5,
      baseColor,
    });
  }

  return stars;
}

/* ------------------------------------------------------------------ */
/*  Precompute sphere geometry (3D positions before rotation)          */
/* ------------------------------------------------------------------ */

interface NodeGeom {
  // Pre-rotation 3D position (multiply by radius at render)
  nx: number;
  ny: number;
  nz: number;
}

interface SubNodeGeom extends NodeGeom {
  dimIndex: number;
  subIndex: number;
}

function computeGeometry() {
  const majorNodes: NodeGeom[] = [];
  const subNodes: SubNodeGeom[] = [];

  for (let d = 0; d < 6; d++) {
    const dir = DIM_DIRS[d];
    const score = DIM_SCORES[d];
    const vecLen = MIN_VEC_LEN + (score / 100) * (MAX_VEC_LEN - MIN_VEC_LEN);

    majorNodes.push({
      nx: dir.dx * vecLen,
      ny: dir.dy * vecLen,
      nz: dir.dz * vecLen,
    });

    // Sub-nodes (umbrella from tip)
    const subCount = SUB_COUNTS[d];
    for (let s = 0; s < subCount; s++) {
      const subDir = computeSubDir(dir, s, subCount, SUB_SPREAD);
      const subScore = SUB_SCORES[d][s];
      const parentVecLen = MIN_VEC_LEN + (score / 100) * (MAX_VEC_LEN - MIN_VEC_LEN);
      const ribLen = (subScore / 100) * parentVecLen * 0.5;

      subNodes.push({
        nx: dir.dx * vecLen + subDir.dx * ribLen,
        ny: dir.dy * vecLen + subDir.dy * ribLen,
        nz: dir.dz * vecLen + subDir.dz * ribLen,
        dimIndex: d,
        subIndex: s,
      });
    }
  }

  return { majorNodes, subNodes };
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function GeneratingState() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const starsRef = useRef<Star[] | null>(null);
  const geomRef = useRef<ReturnType<typeof computeGeometry> | null>(null);
  const animRef = useRef<number>(0);
  const mouseRef = useRef({ x: -9999, y: -9999 });
  const [hoveredNode, setHoveredNode] = useState<{ index: number; x: number; y: number } | null>(null);
  const hoveredNodeRef = useRef<{ index: number; x: number; y: number } | null>(null);

  if (!starsRef.current) starsRef.current = generateStarfield();
  if (!geomRef.current) geomRef.current = computeGeometry();

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

    // Mouse tracking for star repulsion
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

    const stars = starsRef.current!;
    const { majorNodes, subNodes } = geomRef.current!;
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const angularSpeed = (Math.PI * 2) / ROTATION_PERIOD_S;

    let prevTimestamp: number | null = null;
    let elapsed = 0;
    let yaw = 0;

    function draw(timestamp: number) {
      if (prevTimestamp === null) prevTimestamp = timestamp;
      const dt = Math.min((timestamp - prevTimestamp) / 1000, 0.1);
      prevTimestamp = timestamp;
      elapsed += dt;

      if (!prefersReduced) {
        yaw = (yaw + angularSpeed * dt) % (Math.PI * 2);
      }

      const canvas = canvasRef.current;
      if (!canvas) { animRef.current = requestAnimationFrame(draw); return; }
      const ctx = canvas.getContext('2d');
      if (!ctx) { animRef.current = requestAnimationFrame(draw); return; }

      const w = parseFloat(canvas.style.width) || canvas.width;
      const h = parseFloat(canvas.style.height) || canvas.height;
      const cx = w / 2;
      const cy = h / 2;
      const radius = Math.min(w, h) * 0.42;

      ctx.clearRect(0, 0, w, h);

      // Phase progress
      const vectorT = easeInOut(Math.max(0, Math.min(1,
        (elapsed - VECTOR_EXTRUDE_START) / VECTOR_EXTRUDE_DURATION)));
      const subT = easeInOut(Math.max(0, Math.min(1,
        (elapsed - SUB_EXTRUDE_START) / SUB_EXTRUDE_DURATION)));
      const meshT = easeInOut(Math.max(0, Math.min(1,
        (elapsed - MESH_FADE_START) / MESH_FADE_DURATION)));

      /* ---- 1. Background starfield ---- */

      const mouse = mouseRef.current;
      const REPULSE_RADIUS = 80;
      const REPULSE_STRENGTH = 10;

      for (const star of stars) {
        const r3 = rotate(
          star.x3 * radius,
          star.y3 * radius,
          star.z3 * radius,
          yaw, TILT_ANGLE,
        );
        const p = project(r3.x, r3.y, r3.z, cx, cy);

        // Mouse repulsion in screen space
        let drawX = p.sx;
        let drawY = p.sy;
        const mdx = p.sx - mouse.x;
        const mdy = p.sy - mouse.y;
        const mDist = Math.sqrt(mdx * mdx + mdy * mdy);
        if (mDist < REPULSE_RADIUS && mDist > 0.1) {
          const force = (1 - mDist / REPULSE_RADIUS) * REPULSE_STRENGTH;
          drawX += (mdx / mDist) * force;
          drawY += (mdy / mDist) * force;
        }

        const twinkle = 0.6 + 0.4 * Math.sin(elapsed * star.twinkleSpeed + star.twinklePhase);
        const alpha = star.baseAlpha * twinkle;

        // Color: base grey/blue, blend toward orange near cursor
        let cr = star.baseColor.r, cg = star.baseColor.g, cb = star.baseColor.b;
        if (mDist < ORANGE_RADIUS && mDist > 0.1) {
          const orangeT = (1 - mDist / ORANGE_RADIUS);
          cr = Math.round(cr + (ORANGE.r - cr) * orangeT);
          cg = Math.round(cg + (ORANGE.g - cg) * orangeT);
          cb = Math.round(cb + (ORANGE.b - cb) * orangeT);
        }

        ctx.fillStyle = `rgba(${cr}, ${cg}, ${cb}, ${alpha})`;
        const sz = star.size * p.scale * 0.6;
        ctx.fillRect(drawX - sz / 2, drawY - sz / 2, sz, sz);
      }

      /* ---- 2. Major vectors extruding from center ---- */

      // Compute projected major node positions (at full extent, for mesh + glow)
      interface Projected {
        sx: number;
        sy: number;
        z: number;
        depthNorm: number;
      }

      const majorProjected: Projected[] = [];
      let maxZ = 1;

      for (const mn of majorNodes) {
        const r3 = rotate(mn.nx * radius, mn.ny * radius, mn.nz * radius, yaw, TILT_ANGLE);
        if (Math.abs(r3.z) > maxZ) maxZ = Math.abs(r3.z);
        const p = project(r3.x, r3.y, r3.z, cx, cy);
        majorProjected.push({ sx: p.sx, sy: p.sy, z: r3.z, depthNorm: 0 });
      }
      for (const mp of majorProjected) {
        mp.depthNorm = (mp.z / maxZ + 1) / 2;
      }

      if (vectorT > 0) {
        // Sort by depth for draw order
        const sorted = majorProjected.map((m, i) => ({ ...m, i })).sort((a, b) => a.z - b.z);

        for (const mp of sorted) {
          const depthColor = lerpColor(GREY, ACCENT, mp.depthNorm);

          // Extruding vector: line from center to current extent
          const extentSX = lerp(cx, mp.sx, vectorT);
          const extentSY = lerp(cy, mp.sy, vectorT);
          const rayAlpha = vectorT * (0.2 + mp.depthNorm * 0.4);

          ctx.beginPath();
          ctx.moveTo(cx, cy);
          ctx.lineTo(extentSX, extentSY);
          ctx.strokeStyle = `rgba(${depthColor.r}, ${depthColor.g}, ${depthColor.b}, ${rayAlpha})`;
          ctx.lineWidth = 0.6 + mp.depthNorm * 0.4;
          ctx.stroke();

          // Node star glows as vector reaches it
          const glowT = Math.max(0, (vectorT - 0.7) / 0.3); // glow in last 30% of extrusion
          if (glowT > 0) {
            const nodeSize = lerp(2, 7, glowT) + mp.depthNorm * 2;
            const nodeAlpha = lerp(0.1, 0.7, glowT) * (0.4 + mp.depthNorm * 0.6);
            ctx.fillStyle = `rgba(${depthColor.r}, ${depthColor.g}, ${depthColor.b}, ${nodeAlpha})`;
            ctx.fillRect(mp.sx - nodeSize / 2, mp.sy - nodeSize / 2, nodeSize, nodeSize);
          }
        }
      }

      /* ---- 2b. Hover detection on major nodes ---- */
      if (vectorT > 0.7) {
        let closestNode: { index: number; x: number; y: number; dist: number } | null = null;
        for (let i = 0; i < majorProjected.length; i++) {
          const mp = majorProjected[i];
          const ndx = mp.sx - mouse.x;
          const ndy = mp.sy - mouse.y;
          const dist = Math.sqrt(ndx * ndx + ndy * ndy);
          if (dist < NODE_HOVER_RADIUS && (!closestNode || dist < closestNode.dist)) {
            closestNode = { index: i, x: mp.sx, y: mp.sy, dist };
          }
        }

        const prev = hoveredNodeRef.current;
        if (closestNode && (!prev || prev.index !== closestNode.index)) {
          hoveredNodeRef.current = { index: closestNode.index, x: closestNode.x, y: closestNode.y };
          setHoveredNode({ index: closestNode.index, x: closestNode.x, y: closestNode.y });
        } else if (closestNode && prev) {
          // Update position without triggering re-render unless node changed
          hoveredNodeRef.current = { index: prev.index, x: closestNode.x, y: closestNode.y };
        } else if (!closestNode && prev) {
          hoveredNodeRef.current = null;
          setHoveredNode(null);
        }
      }

      /* ---- 3. Sub-node vectors extruding from major nodes ---- */

      if (subT > 0) {
        // Compute and draw sub-node vectors
        for (const sn of subNodes) {
          const parent = majorProjected[sn.dimIndex];

          // Sub-node full projected position
          const r3 = rotate(sn.nx * radius, sn.ny * radius, sn.nz * radius, yaw, TILT_ANGLE);
          const p = project(r3.x, r3.y, r3.z, cx, cy);
          const snDepth = (r3.z / maxZ + 1) / 2;

          // Extrude from parent tip to sub-node position
          const extSX = lerp(parent.sx, p.sx, subT);
          const extSY = lerp(parent.sy, p.sy, subT);

          const snColor = lerpColor(GREY, ACCENT, snDepth);
          const connAlpha = subT * 0.3 * (0.3 + snDepth * 0.5);

          ctx.beginPath();
          ctx.moveTo(parent.sx, parent.sy);
          ctx.lineTo(extSX, extSY);
          ctx.strokeStyle = `rgba(${snColor.r}, ${snColor.g}, ${snColor.b}, ${connAlpha})`;
          ctx.lineWidth = 0.4 + snDepth * 0.3;
          ctx.stroke();

          // Sub-node star glows (fainter) as vector reaches it
          const subGlowT = Math.max(0, (subT - 0.6) / 0.4);
          if (subGlowT > 0) {
            const snSize = lerp(1, 4, subGlowT) + snDepth;
            const snAlpha = lerp(0.05, 0.35, subGlowT) * (0.3 + snDepth * 0.5);
            ctx.fillStyle = `rgba(${snColor.r}, ${snColor.g}, ${snColor.b}, ${snAlpha})`;
            ctx.fillRect(p.sx - snSize / 2, p.sy - snSize / 2, snSize, snSize);
          }
        }
      }

      /* ---- 4. Mesh connections fade in ---- */

      if (meshT > 0) {
        ctx.setLineDash([4, 6]);
        for (const [a, b] of MESH_PAIRS) {
          const va = majorProjected[a];
          const vb = majorProjected[b];
          const avgDepth = (va.depthNorm + vb.depthNorm) / 2;
          const mc = lerpColor(GREY, ACCENT, avgDepth * 0.5);
          const mo = meshT * (0.04 + avgDepth * 0.05);

          ctx.beginPath();
          ctx.moveTo(va.sx, va.sy);
          ctx.lineTo(vb.sx, vb.sy);
          ctx.strokeStyle = `rgba(${mc.r}, ${mc.g}, ${mc.b}, ${mo})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
        ctx.setLineDash([]);
      }

      /* ---- 5. Small center dot (no glow) ---- */

      if (vectorT > 0) {
        const centerAlpha = vectorT * 0.15;
        ctx.fillStyle = `rgba(${GREY.r}, ${GREY.g}, ${GREY.b}, ${centerAlpha})`;
        ctx.fillRect(cx - 1.5, cy - 1.5, 3, 3);
      }

      animRef.current = requestAnimationFrame(draw);
    }

    if (prefersReduced) {
      elapsed = MESH_FADE_START + MESH_FADE_DURATION + 1;
      draw(performance.now());
      return () => {
        cancelAnimationFrame(animRef.current);
        if (observer) observer.disconnect();
        container?.removeEventListener('mousemove', handleMouseMove);
        container?.removeEventListener('mouseleave', handleMouseLeave);
      };
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

      {/* Node hover label */}
      {hoveredNode && (
        <div
          className="absolute z-20 pointer-events-none"
          style={{
            left: hoveredNode.x,
            top: hoveredNode.y - 22,
            transform: 'translateX(-50%)',
          }}
        >
          <span className="font-caption text-[9px] uppercase tracking-[0.25em] text-ops-accent/80 whitespace-nowrap">
            {DIM_LABELS[hoveredNode.index]}
          </span>
        </div>
      )}

      <div className="relative z-10 pointer-events-none text-center">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="font-caption text-xs uppercase tracking-[0.2em] text-ops-text-secondary"
        >
          Generating your leadership profile...
        </motion.p>
        {/* Progress bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="mt-4 mx-auto w-48"
        >
          <div className="h-px bg-white/[0.06] rounded-full overflow-hidden">
            <motion.div
              initial={{ width: '0%' }}
              animate={{ width: '100%' }}
              transition={{
                duration: TOTAL_ANIM_DURATION,
                ease: 'linear',
              }}
              className="h-full bg-ops-accent/40"
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
