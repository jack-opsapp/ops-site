/**
 * StarburstCanvas — 3D rotating radial burst with depth-based styling
 *
 * Lines radiate from center with small square nodes. The entire structure
 * rotates in 3D around a tilted Y-axis, creating an orbital effect.
 * Front-hemisphere nodes render in accent color and are hoverable.
 * Back-hemisphere nodes render in grey and are not interactive.
 *
 * Pure Canvas 2D API — no animation libraries.
 */

'use client';

import { useRef, useEffect, useState, useCallback } from 'react';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface StarburstCanvasProps {
  className?: string;
}

interface SNode {
  angle: number;
  /** Distance from center as fraction of radius (0–1) */
  distance: number;
  size: number;
  text: string;
  /* Computed each frame */
  screenX: number;
  screenY: number;
  depth: number;
}

interface SLine {
  angle: number;
  baseOpacity: number;
  hasNodes: boolean;
  /** Furthest node distance, or decorative length for bare lines */
  endDistance: number;
  nodes: SNode[];
}

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const QUOTES = [
  'DISCIPLINE EQUALS FREEDOM',
  'BUILT ON THE JOB SITE',
  'SIMPLICITY IS THE ULTIMATE SOPHISTICATION',
  'NO TRAINING REQUIRED',
  'YOUR CREW. YOUR RULES.',
  'REAL TOOLS FOR REAL WORK',
  'STOP PAYING FOR SOFTWARE NOBODY OPENS',
  'RUN YOUR OPERATION',
];

const LINE_COUNT = 42;
const ROTATION_PERIOD_S = 90;
const HOVER_RADIUS = 22;
const TILT_ANGLE = 0.30; // ~17 degrees fixed X-axis tilt
const FOCAL_LENGTH = 2000;

const ACCENT = { r: 89, g: 119, b: 148 }; // #597794
const GREY = { r: 68, g: 68, b: 68 };     // #444

/* ------------------------------------------------------------------ */
/*  Scene generation (stable across frames)                            */
/* ------------------------------------------------------------------ */

function generateScene(): SLine[] {
  const lines: SLine[] = [];

  for (let i = 0; i < LINE_COUNT; i++) {
    const angle = (i / LINE_COUNT) * Math.PI * 2;
    const baseOpacity = 0.06 + Math.random() * 0.08;
    const hasNodes = Math.random() < 0.6;
    const nodes: SNode[] = [];
    let endDistance = 0;

    if (hasNodes) {
      const count = 1 + Math.floor(Math.random() * 3); // 1–3
      for (let j = 0; j < count; j++) {
        const d = 0.25 + Math.random() * 0.65;
        if (d > endDistance) endDistance = d;
        nodes.push({
          angle,
          distance: d,
          size: 4 + Math.random() * 3,
          text: QUOTES[Math.floor(Math.random() * QUOTES.length)],
          screenX: 0,
          screenY: 0,
          depth: 0,
        });
      }
    } else {
      endDistance = 0.3 + Math.random() * 0.2;
    }

    lines.push({ angle, baseOpacity, hasNodes, endDistance, nodes });
  }

  return lines;
}

/* ------------------------------------------------------------------ */
/*  3D helpers                                                         */
/* ------------------------------------------------------------------ */

/** Rotate point by yaw (Y-axis, time-varying) then tilt (X-axis, fixed). */
function rotate(
  px: number, py: number,
  yaw: number, tilt: number,
): { x: number; y: number; z: number } {
  // Y-axis rotation (spins the disc in XZ plane)
  const x1 = px * Math.cos(yaw);
  const z1 = -px * Math.sin(yaw);
  const y1 = py;
  // X-axis tilt (adds orbital wobble)
  return {
    x: x1,
    y: y1 * Math.cos(tilt) - z1 * Math.sin(tilt),
    z: y1 * Math.sin(tilt) + z1 * Math.cos(tilt),
  };
}

/** Perspective project. z > 0 = front (closer to viewer). */
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
  t: number, // 0 = back, 1 = front
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

export default function StarburstCanvas({ className }: StarburstCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<SLine[] | null>(null);
  const animRef = useRef<number>(0);
  const mouseRef = useRef({ x: -9999, y: -9999 });

  const [tooltip, setTooltip] = useState<{
    text: string;
    x: number;
    y: number;
    visible: boolean;
  }>({ text: '', x: 0, y: 0, visible: false });

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

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }, []);

  const handleMouseLeave = useCallback(() => {
    mouseRef.current = { x: -9999, y: -9999 };
    setTooltip((prev) => (prev.visible ? { ...prev, visible: false } : prev));
  }, []);

  useEffect(() => {
    resize();
    window.addEventListener('resize', resize);
    const lines = sceneRef.current!;
    let startTime: number | null = null;

    function draw(timestamp: number) {
      if (startTime === null) startTime = timestamp;
      const elapsed = (timestamp - startTime) / 1000;
      const yaw = ((elapsed / ROTATION_PERIOD_S) * Math.PI * 2) % (Math.PI * 2);

      const canvas = canvasRef.current;
      if (!canvas) { animRef.current = requestAnimationFrame(draw); return; }
      const ctx = canvas.getContext('2d');
      if (!ctx) { animRef.current = requestAnimationFrame(draw); return; }

      const w = parseFloat(canvas.style.width) || canvas.width;
      const h = parseFloat(canvas.style.height) || canvas.height;
      const cx = w / 2;
      const cy = h / 2;
      const radius = Math.min(w, h) * 0.42;
      const mouse = mouseRef.current;

      ctx.clearRect(0, 0, w, h);

      /* ---- Phase 1: Compute all 3D positions ---- */

      interface ComputedNode {
        node: SNode;
        sx: number;
        sy: number;
        depth: number;
        depthNorm: number;
        isFront: boolean;
        scale: number;
        color: { r: number; g: number; b: number };
        opacity: number;
        raw: { x: number; y: number; z: number };
      }

      interface Computed {
        line: SLine;
        endSX: number;
        endSY: number;
        endDepth: number;
        depthNorm: number;
        lineColor: { r: number; g: number; b: number };
        lineOpacity: number;
        lineWidth: number;
        nodeData: ComputedNode[];
        raw: { x: number; y: number; z: number };
      }

      const computed: Computed[] = [];
      // Track max |z| for normalization
      let maxZ = 1;

      for (const line of lines) {
        const ex = Math.cos(line.angle) * radius * line.endDistance;
        const ey = Math.sin(line.angle) * radius * line.endDistance;
        const r3 = rotate(ex, ey, yaw, TILT_ANGLE);
        if (Math.abs(r3.z) > maxZ) maxZ = Math.abs(r3.z);

        const nodeData: Computed['nodeData'] = [];
        for (const node of line.nodes) {
          const nx = Math.cos(node.angle) * radius * node.distance;
          const ny = Math.sin(node.angle) * radius * node.distance;
          const nr = rotate(nx, ny, yaw, TILT_ANGLE);
          if (Math.abs(nr.z) > maxZ) maxZ = Math.abs(nr.z);
          nodeData.push({
            node,
            sx: 0, sy: 0,
            depth: nr.z,
            depthNorm: 0,
            isFront: nr.z > 0,
            scale: 1,
            color: GREY,
            opacity: 0,
            raw: nr,
          });
        }

        computed.push({
          line,
          endSX: 0, endSY: 0,
          endDepth: r3.z,
          depthNorm: 0,
          lineColor: GREY,
          lineOpacity: 0,
          lineWidth: 0.5,
          nodeData,
          raw: r3,
        });
      }

      /* ---- Phase 1b: Normalize depths and project ---- */

      for (const c of computed) {
        const p = project(c.raw.x, c.raw.y, c.raw.z, cx, cy);
        c.endSX = p.sx;
        c.endSY = p.sy;
        c.depthNorm = (c.raw.z / maxZ + 1) / 2; // 0 = fully back, 1 = fully front
        c.lineColor = lerpColor(GREY, ACCENT, c.depthNorm);
        c.lineOpacity = c.line.baseOpacity * (0.4 + c.depthNorm * 0.6);
        c.lineWidth = c.line.hasNodes
          ? (0.5 + c.depthNorm * 0.8)
          : (0.3 + c.depthNorm * 0.4);

        for (const nd of c.nodeData) {
          const np = project(nd.raw.x, nd.raw.y, nd.raw.z, cx, cy);
          nd.sx = np.sx;
          nd.sy = np.sy;
          nd.scale = np.scale;
          nd.depthNorm = (nd.raw.z / maxZ + 1) / 2;
          nd.isFront = nd.raw.z > 0;
          nd.color = lerpColor(GREY, ACCENT, nd.depthNorm);
          nd.opacity = nd.isFront
            ? lerp(0.15, 0.55, nd.depthNorm)
            : lerp(0.04, 0.15, nd.depthNorm);

          // Update the SNode for tooltip positioning
          nd.node.screenX = nd.sx;
          nd.node.screenY = nd.sy;
          nd.node.depth = nd.raw.z;
        }
      }

      /* ---- Phase 2: Find closest hoverable (front-only) node ---- */

      let hoveredNode: SNode | null = null;
      let hoveredDist = HOVER_RADIUS;

      for (const c of computed) {
        for (const nd of c.nodeData) {
          if (!nd.isFront) continue;
          const dx = mouse.x - nd.sx;
          const dy = mouse.y - nd.sy;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < hoveredDist) {
            hoveredDist = dist;
            hoveredNode = nd.node;
          }
        }
      }

      /* ---- Phase 3: Sort back-to-front and draw ---- */

      computed.sort((a, b) => a.endDepth - b.endDepth);

      for (const c of computed) {
        const { r, g, b } = c.lineColor;

        // Draw line from center to endpoint
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(c.endSX, c.endSY);
        ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${c.lineOpacity})`;
        ctx.lineWidth = c.lineWidth;
        ctx.stroke();

        // Sort nodes on this line back-to-front too
        c.nodeData.sort((a, b) => a.depth - b.depth);

        for (const nd of c.nodeData) {
          const isHovered = nd.node === hoveredNode;
          const drawSize = (isHovered ? nd.node.size * 1.8 : nd.node.size) * nd.scale;
          const { r: nr, g: ng, b: nb } = isHovered ? ACCENT : nd.color;
          const alpha = isHovered ? 0.85 : nd.opacity;

          ctx.fillStyle = `rgba(${nr}, ${ng}, ${nb}, ${alpha})`;
          ctx.fillRect(
            nd.sx - drawSize / 2,
            nd.sy - drawSize / 2,
            drawSize,
            drawSize,
          );

          // Subtle glow on hovered node
          if (isHovered) {
            ctx.shadowColor = `rgba(${ACCENT.r}, ${ACCENT.g}, ${ACCENT.b}, 0.4)`;
            ctx.shadowBlur = 12;
            ctx.fillRect(
              nd.sx - drawSize / 2,
              nd.sy - drawSize / 2,
              drawSize,
              drawSize,
            );
            ctx.shadowColor = 'transparent';
            ctx.shadowBlur = 0;
          }
        }
      }

      /* ---- Tooltip state ---- */
      if (hoveredNode) {
        setTooltip({
          text: hoveredNode.text,
          x: hoveredNode.screenX,
          y: hoveredNode.screenY,
          visible: true,
        });
      } else {
        setTooltip((prev) => (prev.visible ? { ...prev, visible: false } : prev));
      }

      animRef.current = requestAnimationFrame(draw);
    }

    animRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', resize);
    };
  }, [resize]);

  return (
    <div
      ref={containerRef}
      className={className}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ position: 'relative' }}
    >
      <canvas
        ref={canvasRef}
        style={{ display: 'block', width: '100%', height: '100%' }}
      />

      {/* Tooltip overlay */}
      <div
        className="pointer-events-none absolute font-caption"
        style={{
          left: tooltip.x,
          top: tooltip.y - 36,
          transform: 'translate(-50%, -100%)',
          opacity: tooltip.visible ? 1 : 0,
          transition: 'opacity 150ms ease',
          background: '#141414',
          border: '1px solid rgba(89, 119, 148, 0.3)',
          padding: '6px 12px',
          fontSize: '10px',
          letterSpacing: '0.08em',
          textTransform: 'uppercase' as const,
          color: 'rgba(89, 119, 148, 0.9)',
          whiteSpace: 'nowrap',
          borderRadius: '2px',
        }}
      >
        {tooltip.text}
      </div>
    </div>
  );
}
