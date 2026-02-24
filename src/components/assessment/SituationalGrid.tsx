/**
 * SituationalGrid — Canvas-only radial selector
 *
 * 4 rays from center to nodes at organic cardinal positions.
 * Response text drawn directly at each node on canvas.
 * Hover pushes other nodes ~PI/4 away.
 * Selection triggers angular redistribution with glow.
 *
 * Pure Canvas 2D API — no animation libraries.
 */

'use client';

import { useRef, useEffect, useCallback } from 'react';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface SituationalGridProps {
  options: { key: string; text: string }[];
  onSelect: (key: string) => void;
}

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const ACCENT = { r: 89, g: 119, b: 148 };
const GREY = { r: 100, g: 100, b: 100 };

const HIT_RADIUS = 60;
const PI2 = Math.PI * 2;
const CANVAS_HEIGHT = 500;

// Offset by ~PI/6, slightly organic spacing
const ROT = Math.PI / 6;
const BASE_ANGLES = [
  -Math.PI / 2 + 0.12 + ROT,   // top-ish
  0 + 0.08 + ROT,               // right-ish
  Math.PI / 2 - 0.12 + ROT,     // bottom-ish
  Math.PI + 0.05 + ROT,          // left-ish
];

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function wrapAngleDelta(target: number, current: number): number {
  let delta = target - current;
  delta -= Math.round(delta / PI2) * PI2;
  return delta;
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let current = '';
  for (const word of words) {
    const test = current ? `${current} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth) {
      if (current) lines.push(current);
      current = word;
    } else {
      current = test;
    }
  }
  if (current) lines.push(current);
  return lines;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function SituationalGrid({
  options,
  onSelect,
}: SituationalGridProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animRef = useRef<number>(0);
  const selectedRef = useRef<number>(-1);
  const hoveredRef = useRef<number>(-1);
  const onSelectRef = useRef(onSelect);
  const selectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const currentAnglesRef = useRef<number[]>([...BASE_ANGLES]);
  const targetAnglesRef = useRef<number[]>([...BASE_ANGLES]);
  const nodeRadiiRef = useRef<number[]>([1, 1, 1, 1]);

  onSelectRef.current = onSelect;

  /* ---- DPI-aware resize ---- */

  const resize = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const dpr = window.devicePixelRatio || 1;
    const rect = container.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = CANVAS_HEIGHT * dpr;
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${CANVAS_HEIGHT}px`;
    const ctx = canvas.getContext('2d');
    if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }, []);

  /* ---- Hit detection ---- */

  const getHoveredIndex = useCallback((
    mx: number, my: number,
    nodePositions: { x: number; y: number }[],
  ): number => {
    let closest = -1;
    let closestDist = HIT_RADIUS;
    for (let i = 0; i < nodePositions.length; i++) {
      const dx = mx - nodePositions[i].x;
      const dy = my - nodePositions[i].y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < closestDist) {
        closestDist = dist;
        closest = i;
      }
    }
    return closest;
  }, []);

  /* ---- Main effect ---- */

  useEffect(() => {
    resize();

    const container = containerRef.current!;
    const canvas = canvasRef.current!;
    let observer: ResizeObserver | null = null;
    if (container) {
      observer = new ResizeObserver(() => resize());
      observer.observe(container);
    }

    const mousePos = { x: -9999, y: -9999 };

    /* ---- Mouse handlers ---- */

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mousePos.x = e.clientX - rect.left;
      mousePos.y = e.clientY - rect.top;
    };

    const handleClick = (e: MouseEvent) => {
      if (selectedRef.current >= 0) return;
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;

      const w = parseFloat(canvas.style.width) || canvas.width;
      const h = parseFloat(canvas.style.height) || canvas.height;
      const cx = w / 2;
      const cy = h / 2;
      const radius = Math.min(w, h) * 0.32;

      const currentAngles = currentAnglesRef.current;
      const radii = nodeRadiiRef.current;
      const nodePositions = currentAngles.map((angle, i) => ({
        x: cx + Math.cos(angle) * radius * radii[i],
        y: cy + Math.sin(angle) * radius * radii[i],
      }));

      const idx = getHoveredIndex(mx, my, nodePositions);

      if (idx >= 0 && idx < options.length) {
        selectedRef.current = idx;

        const selAngle = BASE_ANGLES[idx];
        const targets = [...BASE_ANGLES];
        targets[idx] = selAngle;

        for (let i = 0; i < 4; i++) {
          if (i === idx) continue;
          const diff = Math.abs(i - idx);
          const isOpposite = diff === 2;
          const isAdjacent = diff === 1 || diff === 3;

          if (isAdjacent) {
            const sign = wrapAngleDelta(BASE_ANGLES[i], selAngle) > 0 ? 1 : -1;
            targets[i] = selAngle + sign * (Math.PI * 2 / 3);
          } else if (isOpposite) {
            targets[i] = selAngle + Math.PI;
          }
        }
        targetAnglesRef.current = targets;

        if (selectTimerRef.current) clearTimeout(selectTimerRef.current);
        selectTimerRef.current = setTimeout(() => {
          onSelectRef.current(options[idx].key);
        }, 500);
      }
    };

    const handleMouseLeave = () => {
      mousePos.x = -9999;
      mousePos.y = -9999;
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('click', handleClick);
    canvas.addEventListener('mouseleave', handleMouseLeave);

    /* ---- Touch handler ---- */

    const handleTouchEnd = (e: TouchEvent) => {
      if (selectedRef.current >= 0) return;
      if (e.changedTouches.length === 0) return;
      const t = e.changedTouches[0];
      const rect = canvas.getBoundingClientRect();
      const mx = t.clientX - rect.left;
      const my = t.clientY - rect.top;

      const w = parseFloat(canvas.style.width) || canvas.width;
      const h = parseFloat(canvas.style.height) || canvas.height;
      const cx = w / 2;
      const cy = h / 2;
      const radius = Math.min(w, h) * 0.32;

      const currentAngles = currentAnglesRef.current;
      const radii = nodeRadiiRef.current;
      const nodePositions = currentAngles.map((angle, i) => ({
        x: cx + Math.cos(angle) * radius * radii[i],
        y: cy + Math.sin(angle) * radius * radii[i],
      }));

      const idx = getHoveredIndex(mx, my, nodePositions);

      if (idx >= 0 && idx < options.length) {
        selectedRef.current = idx;

        const selAngle = BASE_ANGLES[idx];
        const targets = [...BASE_ANGLES];
        targets[idx] = selAngle;

        for (let i = 0; i < 4; i++) {
          if (i === idx) continue;
          const diff = Math.abs(i - idx);
          const isOpposite = diff === 2;
          const isAdjacent = diff === 1 || diff === 3;

          if (isAdjacent) {
            const sign = wrapAngleDelta(BASE_ANGLES[i], selAngle) > 0 ? 1 : -1;
            targets[i] = selAngle + sign * (Math.PI * 2 / 3);
          } else if (isOpposite) {
            targets[i] = selAngle + Math.PI;
          }
        }
        targetAnglesRef.current = targets;

        if (selectTimerRef.current) clearTimeout(selectTimerRef.current);
        selectTimerRef.current = setTimeout(() => {
          onSelectRef.current(options[idx].key);
        }, 500);
      }
    };

    canvas.addEventListener('touchend', handleTouchEnd);

    /* ---- Animation loop ---- */

    let prevTimestamp: number | null = null;

    function draw(timestamp: number) {
      if (prevTimestamp === null) prevTimestamp = timestamp;
      prevTimestamp = timestamp;

      const canvasEl = canvasRef.current;
      if (!canvasEl) { animRef.current = requestAnimationFrame(draw); return; }
      const ctx = canvasEl.getContext('2d');
      if (!ctx) { animRef.current = requestAnimationFrame(draw); return; }

      const w = parseFloat(canvasEl.style.width) || canvasEl.width;
      const h = parseFloat(canvasEl.style.height) || canvasEl.height;
      const cx = w / 2;
      const cy = h / 2;
      const radius = Math.min(w, h) * 0.32;
      const selected = selectedRef.current;

      ctx.clearRect(0, 0, w, h);

      // Hover detection (need positions first for hover targets)
      const currentAngles = currentAnglesRef.current;
      const targetAngles = targetAnglesRef.current;
      const radii = nodeRadiiRef.current;

      // Compute current node positions for hover detection
      const nodePositions = currentAngles.map((angle, i) => ({
        x: cx + Math.cos(angle) * radius * radii[i],
        y: cy + Math.sin(angle) * radius * radii[i],
      }));

      const hoverIdx = getHoveredIndex(mousePos.x, mousePos.y, nodePositions);
      hoveredRef.current = hoverIdx;
      canvas.style.cursor = (hoverIdx >= 0 && selected < 0) ? 'pointer' : 'default';

      /* ---- Update target angles based on hover (only if no selection) ---- */

      if (selected < 0) {
        if (hoverIdx >= 0) {
          // Hover: push others only slightly (~PI/8)
          const hovAngle = BASE_ANGLES[hoverIdx];
          for (let i = 0; i < 4; i++) {
            if (i === hoverIdx) {
              targetAngles[i] = BASE_ANGLES[i];
            } else {
              const diff = Math.abs(i - hoverIdx);
              const isOpposite = diff === 2;
              if (isOpposite) {
                targetAngles[i] = hovAngle + Math.PI;
              } else {
                const sign = wrapAngleDelta(BASE_ANGLES[i], hovAngle) > 0 ? 1 : -1;
                targetAngles[i] = hovAngle + sign * (Math.PI / 2 + Math.PI / 8);
              }
            }
          }
        } else {
          for (let i = 0; i < 4; i++) {
            targetAngles[i] = BASE_ANGLES[i];
          }
        }
      }

      /* ---- Lerp angles and radii ---- */

      for (let i = 0; i < 4; i++) {
        const delta = wrapAngleDelta(targetAngles[i], currentAngles[i]);
        currentAngles[i] += delta * 0.06;
      }

      for (let i = 0; i < 4; i++) {
        const target = selected >= 0
          ? (selected === i ? 1.15 : 0.92)
          : (hoverIdx === i ? 1.06 : 1.0);
        radii[i] += (target - radii[i]) * 0.06;
      }

      // Recompute positions after lerp
      for (let i = 0; i < 4; i++) {
        nodePositions[i] = {
          x: cx + Math.cos(currentAngles[i]) * radius * radii[i],
          y: cy + Math.sin(currentAngles[i]) * radius * radii[i],
        };
      }

      /* ---- Draw rays and nodes ---- */

      for (let i = 0; i < Math.min(4, options.length); i++) {
        const pos = nodePositions[i];
        const isSelected = selected === i;
        const isHovered = hoverIdx === i && selected < 0;
        const hasSelection = selected >= 0;

        let nodeSize: number;
        let nodeAlpha: number;
        let nodeColor: typeof ACCENT;

        if (isSelected) {
          nodeColor = ACCENT;
          nodeSize = 12;
          nodeAlpha = 0.9;
        } else if (isHovered) {
          nodeColor = ACCENT;
          nodeSize = 9;
          nodeAlpha = 0.65;
        } else if (hasSelection) {
          nodeColor = GREY;
          nodeSize = 5;
          nodeAlpha = 0.15;
        } else {
          nodeColor = { r: 160, g: 160, b: 160 };
          nodeSize = 7;
          nodeAlpha = 0.50;
        }

        // Ray from center to node
        const rayAlpha = isSelected ? 0.6 : isHovered ? 0.35 : hasSelection ? 0.06 : 0.25;

        if (isSelected) {
          ctx.shadowColor = `rgba(${ACCENT.r}, ${ACCENT.g}, ${ACCENT.b}, 0.6)`;
          ctx.shadowBlur = 18;
        }

        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(pos.x, pos.y);
        const rayColor = (!isSelected && !isHovered && !hasSelection) ? { r: 160, g: 160, b: 160 } : nodeColor;
        ctx.strokeStyle = `rgba(${rayColor.r}, ${rayColor.g}, ${rayColor.b}, ${rayAlpha})`;
        ctx.lineWidth = isSelected ? 1.5 : 0.6;
        ctx.stroke();

        if (isSelected) {
          ctx.stroke(); // double-stroke for glow
        }

        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;

        // Node glow
        if (isSelected) {
          ctx.shadowColor = `rgba(${ACCENT.r}, ${ACCENT.g}, ${ACCENT.b}, 0.5)`;
          ctx.shadowBlur = 14;
        }

        // Draw node square
        ctx.fillStyle = `rgba(${nodeColor.r}, ${nodeColor.g}, ${nodeColor.b}, ${nodeAlpha})`;
        ctx.fillRect(
          pos.x - nodeSize / 2,
          pos.y - nodeSize / 2,
          nodeSize,
          nodeSize,
        );

        if (isSelected) {
          ctx.shadowColor = 'transparent';
          ctx.shadowBlur = 0;
        }

        /* ---- Response text near node ---- */

        const cos = Math.cos(currentAngles[i]);
        const sin = Math.sin(currentAngles[i]);
        const labelIsBlue = isSelected || isHovered;

        const textAlpha = isSelected ? 0.85 : isHovered ? 0.60 : hasSelection ? 0.18 : 0.50;
        ctx.font = '400 11px "Kosugi", sans-serif';
        ctx.fillStyle = `rgba(${labelIsBlue ? ACCENT.r : 200}, ${labelIsBlue ? ACCENT.g : 200}, ${labelIsBlue ? ACCENT.b : 200}, ${textAlpha})`;

        // Determine text position and alignment
        // Right-align for top and left nodes, left-align for bottom and right
        const lineHeight = 15;
        let maxWidth: number;
        let textX: number;
        let textY: number;
        let vertDir = 1; // 1 = lines go down, -1 = lines go up

        // Top or left → right-align; Bottom or right → left-align
        const isTopOrLeft = (sin < -0.3) || (cos < -0.3 && Math.abs(sin) < 0.7);

        if (isTopOrLeft) {
          ctx.textAlign = 'right';
          maxWidth = 200;
          textX = pos.x - 20;
          textY = sin < -0.3 ? pos.y - 26 : pos.y - 10;
          vertDir = sin < -0.3 ? -1 : 1;
        } else {
          ctx.textAlign = 'left';
          maxWidth = 200;
          textX = pos.x + 20;
          textY = sin > 0.3 ? pos.y + 26 : pos.y - 10;
          vertDir = 1;
        }

        const lines = wrapText(ctx, options[i].text, maxWidth);

        if (vertDir === -1) {
          // Draw upward: first line closest to node, last line furthest
          // But read top-to-bottom, so offset the block upward
          const blockStartY = textY - (lines.length - 1) * lineHeight;
          for (let li = 0; li < lines.length; li++) {
            ctx.fillText(lines[li], textX, blockStartY + li * lineHeight);
          }
        } else {
          for (let li = 0; li < lines.length; li++) {
            ctx.fillText(lines[li], textX, textY + li * lineHeight);
          }
        }
      }

      /* ---- Center point ---- */

      ctx.fillStyle = `rgba(${GREY.r}, ${GREY.g}, ${GREY.b}, 0.12)`;
      ctx.fillRect(cx - 1.5, cy - 1.5, 3, 3);

      animRef.current = requestAnimationFrame(draw);
    }

    animRef.current = requestAnimationFrame(draw);

    /* ---- Cleanup ---- */

    return () => {
      cancelAnimationFrame(animRef.current);
      if (observer) observer.disconnect();
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('click', handleClick);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
      canvas.removeEventListener('touchend', handleTouchEnd);
      if (selectTimerRef.current) clearTimeout(selectTimerRef.current);
    };
  }, [resize, getHoveredIndex, options]);

  return (
    <div ref={containerRef} className="relative w-full">
      <canvas
        ref={canvasRef}
        className="w-full"
        style={{ display: 'block', height: `${CANVAS_HEIGHT}px` }}
      />
    </div>
  );
}
