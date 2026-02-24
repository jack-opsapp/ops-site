/**
 * SituationalGrid — Hybrid Canvas starburst + DOM text panel
 *
 * A radial Canvas starburst with ~60 background lines and 4 major nodes
 * at organic cardinal positions. Selecting a node triggers angular
 * redistribution: the selected node stays put, adjacent nodes compress
 * toward it, and the opposite node swings away. DOM text panel with
 * frosted glass styling shows option text below.
 *
 * Pure Canvas 2D API + DOM overlay — no animation libraries.
 */

'use client';

import { useRef, useEffect, useCallback, useState } from 'react';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface SituationalGridProps {
  options: { key: string; text: string }[];
  onSelect: (key: string) => void;
}

interface BackgroundLine {
  angle: number;
  baseLength: number;    // 0.15-0.55
  phaseOffset: number;
  baseOpacity: number;   // 0.04-0.08
}

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const ACCENT = { r: 89, g: 119, b: 148 };
const GREY = { r: 100, g: 100, b: 100 };

const BG_LINE_COUNT = 60;
const HIT_RADIUS = 28;
const PROXIMITY_THRESHOLD = 0.2; // radians
const PI2 = Math.PI * 2;
const CANVAS_HEIGHT = 320;

// Slightly organic cardinal positions
const BASE_ANGLES = [
  -Math.PI / 2 + 0.12,   // A: top (slightly clockwise)
  0 + 0.08,               // B: right (slightly clockwise)
  Math.PI / 2 - 0.12,     // C: bottom (slightly counterclockwise)
  Math.PI + 0.05,          // D: left (slightly clockwise)
];

/* ------------------------------------------------------------------ */
/*  Background line generation                                         */
/* ------------------------------------------------------------------ */

function generateBackgroundLines(): BackgroundLine[] {
  const lines: BackgroundLine[] = [];
  for (let i = 0; i < BG_LINE_COUNT; i++) {
    const angle = (PI2 / BG_LINE_COUNT) * i + (Math.random() - 0.5) * 0.06;
    lines.push({
      angle,
      baseLength: 0.15 + Math.random() * 0.40,
      phaseOffset: Math.random() * PI2,
      baseOpacity: 0.04 + Math.random() * 0.04,
    });
  }
  return lines;
}

/* ------------------------------------------------------------------ */
/*  Angle wrapping helper                                              */
/* ------------------------------------------------------------------ */

function wrapAngleDelta(target: number, current: number): number {
  let delta = target - current;
  delta -= Math.round(delta / PI2) * PI2;
  return delta;
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
  const bgLinesRef = useRef<BackgroundLine[] | null>(null);
  const selectedRef = useRef<number>(-1);
  const hoveredRef = useRef<number>(-1);
  const onSelectRef = useRef(onSelect);
  const selectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const timeRef = useRef(0);

  // Current animated angles for each node
  const currentAnglesRef = useRef<number[]>([...BASE_ANGLES]);
  // Target angles for each node
  const targetAnglesRef = useRef<number[]>([...BASE_ANGLES]);

  const [selectedKey, setSelectedKey] = useState<string | null>(null);

  onSelectRef.current = onSelect;

  if (!bgLinesRef.current) {
    bgLinesRef.current = generateBackgroundLines();
  }

  /* ---- DPI-aware resize ---- */

  const resize = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const dpr = window.devicePixelRatio || 1;
    const rect = container.getBoundingClientRect();
    // Only read width from container; height is fixed to prevent resize loop
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

    const bgLines = bgLinesRef.current!;
    const mousePos = { x: -9999, y: -9999 };

    /* ---- Mouse handlers ---- */

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mousePos.x = e.clientX - rect.left;
      mousePos.y = e.clientY - rect.top;
    };

    const handleClick = (e: MouseEvent) => {
      if (selectedRef.current >= 0) return; // already selected
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;

      const w = parseFloat(canvas.style.width) || canvas.width;
      const h = parseFloat(canvas.style.height) || canvas.height;
      const cx = w / 2;
      const cy = h / 2;
      const radius = Math.min(w, h) * 0.35;

      const currentAngles = currentAnglesRef.current;
      const nodePositions = currentAngles.map((angle) => ({
        x: cx + Math.cos(angle) * radius,
        y: cy + Math.sin(angle) * radius,
      }));

      const idx = getHoveredIndex(mx, my, nodePositions);

      if (idx >= 0 && idx < options.length) {
        selectedRef.current = idx;
        setSelectedKey(options[idx].key);

        // Compute target angles for redistribution
        const selAngle = BASE_ANGLES[idx];
        const targets = [...BASE_ANGLES];
        targets[idx] = selAngle;

        for (let i = 0; i < 4; i++) {
          if (i === idx) continue;
          const diff = Math.abs(i - idx);
          const isOpposite = diff === 2;
          const isAdjacent = diff === 1 || diff === 3;

          if (isAdjacent) {
            // Adjacent nodes compress toward selected at +/- PI/3
            const sign = wrapAngleDelta(BASE_ANGLES[i], selAngle) > 0 ? 1 : -1;
            targets[i] = selAngle + sign * (Math.PI / 3);
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
      const radius = Math.min(w, h) * 0.35;

      const currentAngles = currentAnglesRef.current;
      const nodePositions = currentAngles.map((angle) => ({
        x: cx + Math.cos(angle) * radius,
        y: cy + Math.sin(angle) * radius,
      }));

      const idx = getHoveredIndex(mx, my, nodePositions);

      if (idx >= 0 && idx < options.length) {
        selectedRef.current = idx;
        setSelectedKey(options[idx].key);

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
            targets[i] = selAngle + sign * (Math.PI / 3);
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
      const dt = (timestamp - prevTimestamp) / 1000;
      prevTimestamp = timestamp;
      timeRef.current += dt;

      const canvasEl = canvasRef.current;
      if (!canvasEl) { animRef.current = requestAnimationFrame(draw); return; }
      const ctx = canvasEl.getContext('2d');
      if (!ctx) { animRef.current = requestAnimationFrame(draw); return; }

      const w = parseFloat(canvasEl.style.width) || canvasEl.width;
      const h = parseFloat(canvasEl.style.height) || canvasEl.height;
      const cx = w / 2;
      const cy = h / 2;
      const radius = Math.min(w, h) * 0.35;
      const time = timeRef.current;
      const selected = selectedRef.current;

      ctx.clearRect(0, 0, w, h);

      // Lerp current angles toward target angles with wrapping
      const currentAngles = currentAnglesRef.current;
      const targetAngles = targetAnglesRef.current;
      for (let i = 0; i < 4; i++) {
        const delta = wrapAngleDelta(targetAngles[i], currentAngles[i]);
        currentAngles[i] += delta * 0.06;
      }

      // Compute node screen positions from current angles
      const nodePositions = currentAngles.map((angle) => ({
        x: cx + Math.cos(angle) * radius,
        y: cy + Math.sin(angle) * radius,
      }));

      // Mouse angle from center
      let mouseAngle = -999;
      if (mousePos.x > -9000) {
        mouseAngle = Math.atan2(mousePos.y - cy, mousePos.x - cx);
      }

      // Hover detection
      const hoverIdx = getHoveredIndex(mousePos.x, mousePos.y, nodePositions);
      hoveredRef.current = hoverIdx;
      canvas.style.cursor = (hoverIdx >= 0 && selected < 0) ? 'pointer' : 'default';

      /* ---- Draw background lines ---- */

      for (const line of bgLines) {
        const breathe = Math.sin(time * 0.5 + line.phaseOffset) * 0.03 * line.baseLength;
        let rayLength = line.baseLength + breathe;
        let opacity = line.baseOpacity;

        // Check proximity to any node
        let nearSelectedNode = false;
        let nearUnselectedNode = false;
        if (selected >= 0) {
          for (let i = 0; i < 4; i++) {
            let angDist = Math.abs(wrapAngleDelta(currentAngles[i], line.angle));
            if (angDist > Math.PI) angDist = PI2 - angDist;
            if (angDist < 0.3) {
              if (i === selected) nearSelectedNode = true;
              else nearUnselectedNode = true;
            }
          }
        }

        // Mouse proximity boost
        if (mouseAngle > -900 && selected < 0) {
          let angularDist = Math.abs(line.angle - mouseAngle);
          if (angularDist > Math.PI) angularDist = PI2 - angularDist;
          const proximityFactor = Math.max(0, 1 - angularDist / PROXIMITY_THRESHOLD);
          if (proximityFactor > 0) {
            opacity += proximityFactor * 0.06;
            rayLength += proximityFactor * 0.08;
          }
        }

        // Selection effects
        if (selected >= 0) {
          if (nearSelectedNode) {
            // Lines near selected node glow ACCENT and extend
            rayLength = Math.min(rayLength + 0.15, 0.7);
            const endX = cx + Math.cos(line.angle) * radius * rayLength;
            const endY = cy + Math.sin(line.angle) * radius * rayLength;
            ctx.beginPath();
            ctx.moveTo(cx, cy);
            ctx.lineTo(endX, endY);
            ctx.strokeStyle = `rgba(${ACCENT.r}, ${ACCENT.g}, ${ACCENT.b}, ${opacity * 2.5})`;
            ctx.lineWidth = 0.6;
            ctx.stroke();
            continue;
          } else if (nearUnselectedNode) {
            opacity = 0.02;
          } else {
            opacity *= 0.5;
          }
        }

        const endX = cx + Math.cos(line.angle) * radius * rayLength;
        const endY = cy + Math.sin(line.angle) * radius * rayLength;

        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(endX, endY);
        ctx.strokeStyle = `rgba(${GREY.r}, ${GREY.g}, ${GREY.b}, ${opacity})`;
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }

      /* ---- Draw nodes ---- */

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
          nodeColor = GREY;
          nodeSize = 7;
          nodeAlpha = 0.35;
        }

        // Ray from center to node
        const rayAlpha = isSelected ? 0.5 : isHovered ? 0.3 : hasSelection ? 0.06 : 0.12;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(pos.x, pos.y);
        ctx.strokeStyle = `rgba(${nodeColor.r}, ${nodeColor.g}, ${nodeColor.b}, ${rayAlpha})`;
        ctx.lineWidth = isSelected ? 1.2 : 0.6;
        ctx.stroke();

        // Selected node glow
        if (isSelected) {
          ctx.shadowColor = `rgba(${ACCENT.r}, ${ACCENT.g}, ${ACCENT.b}, 0.5)`;
          ctx.shadowBlur = 14;
        }

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

        // Key label near node
        const labelAlpha = isSelected ? 0.9 : isHovered ? 0.7 : hasSelection ? 0.15 : 0.5;
        ctx.font = '600 11px "Mohave", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = `rgba(${isSelected || isHovered ? ACCENT.r : 255}, ${isSelected || isHovered ? ACCENT.g : 255}, ${isSelected || isHovered ? ACCENT.b : 255}, ${labelAlpha})`;

        // Position label slightly beyond node
        const labelDist = radius + 20;
        const labelX = cx + Math.cos(currentAngles[i]) * labelDist;
        const labelY = cy + Math.sin(currentAngles[i]) * labelDist;
        ctx.fillText(options[i].key.toUpperCase(), labelX, labelY);
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
      {/* Canvas starburst */}
      <canvas
        ref={canvasRef}
        className="w-full"
        style={{ display: 'block', height: '320px' }}
      />

      {/* DOM text panel */}
      <div className="relative -mt-4 z-10 bg-[rgba(10,10,10,0.70)] backdrop-blur-[20px] saturate-[1.2] rounded-[3px] border border-ops-border p-4 space-y-2">
        {options.slice(0, 4).map((option) => {
          const isSelected = selectedKey === option.key;
          const isDimmed = selectedKey !== null && !isSelected;

          return (
            <div
              key={option.key}
              className={`
                flex items-start gap-3 p-3 rounded-[3px] border transition-all duration-300
                ${isSelected ? 'border-ops-accent bg-[rgba(89,119,148,0.08)]' : 'border-transparent'}
                ${isDimmed ? 'opacity-40' : 'opacity-100'}
              `}
            >
              <span className="font-caption uppercase text-xs tracking-[0.15em] text-ops-accent shrink-0 mt-0.5">
                {option.key.toUpperCase()}
              </span>
              <span className="font-body text-sm text-ops-text-primary leading-relaxed">
                {option.text}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
