/**
 * StarburstCanvas — HTML5 Canvas radial burst with hoverable nodes
 *
 * Draws 36-48 thin white lines radiating from center with small square
 * nodes along each line. The entire burst rotates slowly (~1 rev / 90s).
 * Mouse proximity triggers node highlight + tooltip overlay.
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

interface Node {
  /** Angle in radians (static, pre-rotation) */
  angle: number;
  /** Distance from center as fraction of radius (0–1) */
  distance: number;
  /** Node size in px */
  size: number;
  /** Base opacity */
  opacity: number;
  /** Assigned quote text */
  text: string;
  /** Current computed x (updated each frame) */
  x: number;
  /** Current computed y (updated each frame) */
  y: number;
}

interface Line {
  angle: number;
  opacity: number;
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
const NODES_PER_LINE_MIN = 2;
const NODES_PER_LINE_MAX = 4;
const NODE_SIZE_MIN = 4;
const NODE_SIZE_MAX = 6;
const NODE_OPACITY_MIN = 0.15;
const NODE_OPACITY_MAX = 0.25;
const LINE_OPACITY_MIN = 0.06;
const LINE_OPACITY_MAX = 0.12;
const HOVER_RADIUS = 20;
const ROTATION_PERIOD_S = 90;

/* ------------------------------------------------------------------ */
/*  Seeded generation (stable across frames)                           */
/* ------------------------------------------------------------------ */

function generateScene() {
  const lines: Line[] = [];
  const nodes: Node[] = [];

  for (let i = 0; i < LINE_COUNT; i++) {
    const angle = (i / LINE_COUNT) * Math.PI * 2;
    const lineOpacity =
      LINE_OPACITY_MIN + Math.random() * (LINE_OPACITY_MAX - LINE_OPACITY_MIN);
    lines.push({ angle, opacity: lineOpacity });

    const nodeCount =
      NODES_PER_LINE_MIN +
      Math.floor(Math.random() * (NODES_PER_LINE_MAX - NODES_PER_LINE_MIN + 1));

    for (let j = 0; j < nodeCount; j++) {
      // Spread nodes between 20% and 90% of radius
      const distance = 0.2 + Math.random() * 0.7;
      const size =
        NODE_SIZE_MIN + Math.random() * (NODE_SIZE_MAX - NODE_SIZE_MIN);
      const opacity =
        NODE_OPACITY_MIN +
        Math.random() * (NODE_OPACITY_MAX - NODE_OPACITY_MIN);
      const text = QUOTES[Math.floor(Math.random() * QUOTES.length)];

      nodes.push({
        angle,
        distance,
        size,
        opacity,
        text,
        x: 0,
        y: 0,
      });
    }
  }

  return { lines, nodes };
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function StarburstCanvas({ className }: StarburstCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<ReturnType<typeof generateScene> | null>(null);
  const animRef = useRef<number>(0);
  const mouseRef = useRef<{ x: number; y: number }>({ x: -9999, y: -9999 });

  const [tooltip, setTooltip] = useState<{
    text: string;
    x: number;
    y: number;
    visible: boolean;
  }>({ text: '', x: 0, y: 0, visible: false });

  // Generate the scene once
  if (!sceneRef.current) {
    sceneRef.current = generateScene();
  }

  /* ---- Resize handler ---- */
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

  /* ---- Mouse tracking ---- */
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }, []);

  const handleMouseLeave = useCallback(() => {
    mouseRef.current = { x: -9999, y: -9999 };
    setTooltip((prev) => (prev.visible ? { ...prev, visible: false } : prev));
  }, []);

  /* ---- Animation loop ---- */
  useEffect(() => {
    resize();
    window.addEventListener('resize', resize);

    const scene = sceneRef.current!;
    let startTime: number | null = null;

    function draw(timestamp: number) {
      if (startTime === null) startTime = timestamp;
      const elapsed = (timestamp - startTime) / 1000;
      const rotation =
        ((elapsed / ROTATION_PERIOD_S) * Math.PI * 2) % (Math.PI * 2);

      const canvas = canvasRef.current;
      if (!canvas) {
        animRef.current = requestAnimationFrame(draw);
        return;
      }

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        animRef.current = requestAnimationFrame(draw);
        return;
      }

      const w = canvas.style.width
        ? parseFloat(canvas.style.width)
        : canvas.width;
      const h = canvas.style.height
        ? parseFloat(canvas.style.height)
        : canvas.height;

      const cx = w / 2;
      const cy = h / 2;
      const radius = Math.min(w, h) * 0.42;

      ctx.clearRect(0, 0, w, h);

      /* -- Draw lines -- */
      for (const line of scene.lines) {
        const a = line.angle + rotation;
        const x2 = cx + Math.cos(a) * radius;
        const y2 = cy + Math.sin(a) * radius;

        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(x2, y2);
        ctx.strokeStyle = `rgba(255, 255, 255, ${line.opacity})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      /* -- Update node positions & draw -- */
      const mouse = mouseRef.current;
      let closestNode: Node | null = null;
      let closestDist = HOVER_RADIUS;

      for (const node of scene.nodes) {
        const a = node.angle + rotation;
        const r = node.distance * radius;
        const nx = cx + Math.cos(a) * r;
        const ny = cy + Math.sin(a) * r;

        // Store for tooltip hit-testing
        node.x = nx;
        node.y = ny;

        // Distance from mouse
        const dx = mouse.x - nx;
        const dy = mouse.y - ny;
        const dist = Math.sqrt(dx * dx + dy * dy);

        const isHovered = dist < closestDist;
        if (isHovered) {
          closestDist = dist;
          closestNode = node;
        }

        // Draw node as square
        const drawSize = isHovered ? node.size * 1.6 : node.size;
        const drawOpacity = isHovered ? 0.7 : node.opacity;

        ctx.fillStyle = `rgba(255, 255, 255, ${drawOpacity})`;
        ctx.fillRect(
          nx - drawSize / 2,
          ny - drawSize / 2,
          drawSize,
          drawSize
        );
      }

      /* -- Tooltip state -- */
      if (closestNode) {
        setTooltip({
          text: closestNode.text,
          x: closestNode.x,
          y: closestNode.y,
          visible: true,
        });
      } else {
        setTooltip((prev) =>
          prev.visible ? { ...prev, visible: false } : prev
        );
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
          border: '1px solid rgba(255, 255, 255, 0.1)',
          padding: '6px 12px',
          fontSize: '10px',
          letterSpacing: '0.08em',
          textTransform: 'uppercase' as const,
          color: 'rgba(255, 255, 255, 0.7)',
          whiteSpace: 'nowrap',
          borderRadius: '2px',
        }}
      >
        {tooltip.text}
      </div>
    </div>
  );
}
