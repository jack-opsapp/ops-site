/**
 * LikertRadialGauge — Spectrum Line with Emanating Field
 *
 * Horizontal baseline with 5 interactive nodes (Strongly Disagree → Strongly Agree).
 * ~72 thin vertical field lines emanate from the baseline, following the user's
 * mouse with Gaussian falloff. Colors shift red → grey → green across the spectrum.
 * Click locks the field to the selected node with concentrated opacity.
 *
 * Pure Canvas 2D API — no animation libraries.
 */

'use client';

import { useRef, useEffect, useCallback } from 'react';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface LikertRadialGaugeProps {
  onSelect: (value: number) => void; // 1-5
  autoAdvance?: boolean;
  onSelectionChange?: (value: number) => void;
  onAnimationComplete?: () => void;
  savedAnswer?: number;
}

interface FieldLine {
  normX: number;       // 0-1 position along baseline
  jitterX: number;     // slight random offset for organic feel
  phaseOffset: number;  // for idle breathing
}

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const SPECTRUM = [
  { r: 170, g: 65,  b: 65  },  // Strongly Disagree — muted red
  { r: 160, g: 90,  b: 80  },  // Disagree — softer red
  { r: 160, g: 160, b: 160 },  // Neutral — warm grey
  { r: 80,  g: 150, b: 100 },  // Agree — soft green
  { r: 60,  g: 160, b: 90  },  // Strongly Agree — muted green
];

const FIELD_LINE_COUNT = 72;
const HIT_RADIUS = 32;
const SELECT_DELAY_MS = 500;
const LERP_FACTOR = 0.06;
const FIELD_MAX_HEIGHT = 100;
const FIELD_MIN_HEIGHT = 3;
const GAUSSIAN_SIGMA = 0.08;

const LABELS = [
  'STRONGLY\nDISAGREE',
  'DISAGREE',
  'NEUTRAL',
  'AGREE',
  'STRONGLY\nAGREE',
];

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

/** Interpolate across the 5-color spectrum based on normalized X (0-1) */
function getSpectrumColor(normX: number): { r: number; g: number; b: number } {
  const t = Math.max(0, Math.min(1, normX)) * (SPECTRUM.length - 1);
  const i = Math.floor(t);
  const f = t - i;
  const a = SPECTRUM[Math.min(i, SPECTRUM.length - 1)];
  const b = SPECTRUM[Math.min(i + 1, SPECTRUM.length - 1)];
  return {
    r: a.r + (b.r - a.r) * f,
    g: a.g + (b.g - a.g) * f,
    b: a.b + (b.b - a.b) * f,
  };
}

/** Compute layout positions from canvas dimensions */
function getLayout(w: number, h: number) {
  const baselineY = h * 0.45;
  const lineStartX = w * 0.10;
  const lineEndX = w * 0.90;
  const lineWidth = lineEndX - lineStartX;

  const nodes: { x: number; y: number; normX: number }[] = [];
  for (let i = 0; i < 5; i++) {
    const normX = i / 4;
    nodes.push({
      x: lineStartX + normX * lineWidth,
      y: baselineY,
      normX,
    });
  }

  return { baselineY, lineStartX, lineEndX, lineWidth, nodes };
}

/** Euclidean distance hit test */
function getHoveredIndex(
  mx: number,
  my: number,
  nodes: { x: number; y: number }[],
): number {
  let closest = -1;
  let closestDist = HIT_RADIUS;
  for (let i = 0; i < nodes.length; i++) {
    const dx = mx - nodes[i].x;
    const dy = my - nodes[i].y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < closestDist) {
      closestDist = dist;
      closest = i;
    }
  }
  return closest;
}

/** Gaussian function */
function gaussian(x: number, mu: number, sigma: number): number {
  const d = x - mu;
  return Math.exp(-(d * d) / (2 * sigma * sigma));
}

/** Generate field line data */
function generateFieldLines(): FieldLine[] {
  const lines: FieldLine[] = [];
  for (let i = 0; i < FIELD_LINE_COUNT; i++) {
    lines.push({
      normX: i / (FIELD_LINE_COUNT - 1),
      jitterX: (Math.random() - 0.5) * 0.004,
      phaseOffset: Math.random() * Math.PI * 2,
    });
  }
  return lines;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function LikertRadialGauge({
  onSelect,
  autoAdvance = true,
  onSelectionChange,
  onAnimationComplete,
  savedAnswer,
}: LikertRadialGaugeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animRef = useRef<number>(0);
  const hoveredRef = useRef<number>(-1);
  const selectedRef = useRef<number>(-1);
  const onSelectRef = useRef(onSelect);
  const onSelectionChangeRef = useRef(onSelectionChange);
  const onAnimationCompleteRef = useRef(onAnimationComplete);
  const autoAdvanceRef = useRef(autoAdvance);
  const selectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const timeRef = useRef(0);

  // Smooth mouse X (normalized 0-1), -1 when off canvas
  const smoothMouseXRef = useRef<number>(-1);
  // Hover intensity (0→1 fade in/out when mouse enters/leaves)
  const hoverIntensityRef = useRef<number>(0);
  // Selection animation: lerped center position (starts from mouse, moves to node)
  const selectionCenterRef = useRef<number>(-1);
  // Selection animation progress: 0→1 for expand, used as abs value for rendering
  const selectionProgressRef = useRef<number>(0);
  // Selection phase: 'idle' | 'shrinking' | 'expanding'
  const selPhaseRef = useRef<'idle' | 'shrinking' | 'expanding'>('idle');
  // Pending selection index (set during shrink, applied when shrink completes)
  const selPendingRef = useRef<number>(-1);
  // Field line data (generated once)
  const fieldLinesRef = useRef<FieldLine[] | null>(null);

  onSelectRef.current = onSelect;
  onSelectionChangeRef.current = onSelectionChange;
  onAnimationCompleteRef.current = onAnimationComplete;
  autoAdvanceRef.current = autoAdvance;

  // Apply savedAnswer on mount
  if (savedAnswer !== undefined && savedAnswer >= 1 && savedAnswer <= 5 && selectedRef.current < 0) {
    selectedRef.current = savedAnswer - 1;
    selPhaseRef.current = 'expanding';
    selectionProgressRef.current = 1;
  }

  if (!fieldLinesRef.current) {
    fieldLinesRef.current = generateFieldLines();
  }

  /* ---- DPI-aware resize ---- */

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

  /* ---- Main effect: animation loop + events ---- */

  useEffect(() => {
    resize();

    const container = containerRef.current!;
    let observer: ResizeObserver | null = null;
    if (container) {
      observer = new ResizeObserver(() => resize());
      observer.observe(container);
    }

    const mousePos = { x: -9999, y: -9999 };

    /* ---- Shared selection logic ---- */

    const selectNode = (
      idx: number,
      nodes: { x: number; y: number; normX: number }[],
      centerX: number,
    ) => {
      if (selectTimerRef.current) clearTimeout(selectTimerRef.current);

      if (selectedRef.current >= 0 && selectedRef.current !== idx) {
        // Re-selection: shrink first, then expand at new position
        selPendingRef.current = idx;
        selPhaseRef.current = 'shrinking';
        // Fire selection change immediately
        onSelectionChangeRef.current?.(idx + 1);
      } else if (selectedRef.current === idx) {
        // Same node re-clicked — re-fire callbacks without re-animating
        onSelectionChangeRef.current?.(idx + 1);
        if (selectTimerRef.current) clearTimeout(selectTimerRef.current);
        selectTimerRef.current = setTimeout(() => {
          if (autoAdvanceRef.current) {
            onSelectRef.current(idx + 1);
          }
          onAnimationCompleteRef.current?.();
        }, SELECT_DELAY_MS);
        return;
      } else {
        // First selection
        selectedRef.current = idx;
        selectionCenterRef.current = centerX >= 0 ? centerX : nodes[idx].normX;
        selectionProgressRef.current = 0;
        selPhaseRef.current = 'expanding';

        // Fire selection change immediately
        onSelectionChangeRef.current?.(idx + 1);

        selectTimerRef.current = setTimeout(() => {
          if (autoAdvanceRef.current) {
            onSelectRef.current(idx + 1);
          }
          onAnimationCompleteRef.current?.();
        }, SELECT_DELAY_MS);
      }
    };

    /* ---- Mouse handlers ---- */

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mousePos.x = e.clientX - rect.left;
      mousePos.y = e.clientY - rect.top;
    };

    const handleClick = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;

      const canvas = canvasRef.current;
      if (!canvas) return;
      const w = parseFloat(canvas.style.width) || canvas.width;
      const h = parseFloat(canvas.style.height) || canvas.height;
      const { nodes } = getLayout(w, h);
      const idx = getHoveredIndex(mx, my, nodes);

      if (idx >= 0) {
        selectNode(idx, nodes, smoothMouseXRef.current);
      }
    };

    const handleMouseLeave = () => {
      mousePos.x = -9999;
      mousePos.y = -9999;
    };

    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('click', handleClick);
    container.addEventListener('mouseleave', handleMouseLeave);

    /* ---- Touch handler ---- */

    const handleTouchEnd = (e: TouchEvent) => {
      if (e.changedTouches.length === 0) return;
      const t = e.changedTouches[0];
      const rect = container.getBoundingClientRect();
      const mx = t.clientX - rect.left;
      const my = t.clientY - rect.top;

      const canvas = canvasRef.current;
      if (!canvas) return;
      const w = parseFloat(canvas.style.width) || canvas.width;
      const h = parseFloat(canvas.style.height) || canvas.height;
      const { nodes } = getLayout(w, h);
      const idx = getHoveredIndex(mx, my, nodes);

      if (idx >= 0) {
        selectNode(idx, nodes, nodes[idx].normX);
      }
    };

    container.addEventListener('touchend', handleTouchEnd);

    /* ---- Animation loop ---- */

    const fieldLines = fieldLinesRef.current!;
    let prevTimestamp: number | null = null;

    function draw(timestamp: number) {
      if (prevTimestamp === null) prevTimestamp = timestamp;
      const dt = (timestamp - prevTimestamp) / 1000;
      prevTimestamp = timestamp;
      timeRef.current += dt;

      const canvas = canvasRef.current;
      if (!canvas) { animRef.current = requestAnimationFrame(draw); return; }
      const ctx = canvas.getContext('2d');
      if (!ctx) { animRef.current = requestAnimationFrame(draw); return; }

      const w = parseFloat(canvas.style.width) || canvas.width;
      const h = parseFloat(canvas.style.height) || canvas.height;

      ctx.clearRect(0, 0, w, h);

      const { baselineY, lineStartX, lineEndX, lineWidth, nodes } = getLayout(w, h);
      const selected = selectedRef.current;
      const time = timeRef.current;

      /* ---- 3. Hit detection + cursor ---- */

      const hoverIdx = getHoveredIndex(mousePos.x, mousePos.y, nodes);
      hoveredRef.current = hoverIdx;
      container.style.cursor = hoverIdx >= 0 ? 'pointer' : 'default';

      /* ---- 4. Update smoothMouseX (lerp) + hover intensity ---- */

      const mouseOnCanvas = mousePos.x > -9000;

      if (mouseOnCanvas) {
        const rawNormX = Math.max(0, Math.min(1, (mousePos.x - lineStartX) / lineWidth));
        if (smoothMouseXRef.current < 0) {
          // First frame on canvas — snap position, but intensity still fades in
          smoothMouseXRef.current = rawNormX;
        } else {
          smoothMouseXRef.current += (rawNormX - smoothMouseXRef.current) * LERP_FACTOR;
        }
        // Fade in hover intensity
        hoverIntensityRef.current = Math.min(1, hoverIntensityRef.current + dt * 3.0);
      } else {
        // Fade out hover intensity
        hoverIntensityRef.current = Math.max(0, hoverIntensityRef.current - dt * 3.0);
        // Once fully faded, reset smoothMouseX so next entry re-snaps
        if (hoverIntensityRef.current <= 0) {
          smoothMouseXRef.current = -1;
        }
      }

      const hoverIntensity = hoverIntensityRef.current;
      const smoothMouseX = smoothMouseXRef.current;

      /* ---- 5. Advance selectionProgress + lerp selection center ---- */

      const phase = selPhaseRef.current;

      if (phase === 'shrinking') {
        // Collapse current selection toward 0
        selectionProgressRef.current = Math.max(0, selectionProgressRef.current - dt * 4.0);
        if (selectionProgressRef.current <= 0) {
          // Shrink complete — apply pending selection and start expanding
          const pending = selPendingRef.current;
          if (pending >= 0) {
            // Seed center from old selection position (will lerp to new)
            // selectionCenterRef already holds old position
            selectedRef.current = pending;
            selPendingRef.current = -1;
            selectionProgressRef.current = 0;
            selPhaseRef.current = 'expanding';

            if (selectTimerRef.current) clearTimeout(selectTimerRef.current);
            selectTimerRef.current = setTimeout(() => {
              if (autoAdvanceRef.current) {
                onSelectRef.current(pending + 1);
              }
              onAnimationCompleteRef.current?.();
            }, SELECT_DELAY_MS);
          }
        }
      } else if (phase === 'expanding' && selected >= 0) {
        selectionProgressRef.current = Math.min(1, selectionProgressRef.current + dt * 2.5);
      }

      // Always lerp center toward current selection target
      if (selected >= 0) {
        const targetX = nodes[selected].normX;
        selectionCenterRef.current += (targetX - selectionCenterRef.current) * 0.08;
      }

      const selProgress = selectionProgressRef.current;
      const selCenter = selectionCenterRef.current;

      /* ---- 6. Draw baseline ---- */

      ctx.beginPath();
      ctx.moveTo(lineStartX, baselineY);
      ctx.lineTo(lineEndX, baselineY);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
      ctx.lineWidth = 1;
      ctx.stroke();

      /* ---- 7. Draw field lines ---- */

      // Hover field: subdued (half height, low alpha, desaturated)
      const HOVER_MAX_HEIGHT = 55;
      const HOVER_MAX_ALPHA = 0.15;
      // Post-selection hover: even smaller
      const POST_SEL_HOVER_MAX_HEIGHT = 30;
      const POST_SEL_HOVER_SIGMA = 0.06;
      const POST_SEL_HOVER_MAX_ALPHA = 0.08;

      for (const fl of fieldLines) {
        const x = lineStartX + (fl.normX + fl.jitterX) * lineWidth;
        const fullColor = getSpectrumColor(fl.normX);
        // Desaturated version for hover (blend toward grey)
        const grey = 140;
        const hoverColor = {
          r: grey + (fullColor.r - grey) * 0.35,
          g: grey + (fullColor.g - grey) * 0.35,
          b: grey + (fullColor.b - grey) * 0.35,
        };

        let height: number;
        let alpha: number;
        let cr: number, cg: number, cb: number;

        if (selected >= 0) {
          // Selection field: expands outward from clicked node
          const sigma = 0.03 + selProgress * 0.14; // 0.03 → 0.17 (tight → wide)
          const g = gaussian(fl.normX, selCenter, sigma);

          // Height and alpha scale up with progress so bars grow outward
          const heightMult = 0.15 + selProgress * 0.85; // ramp from 15% → 100%
          height = FIELD_MIN_HEIGHT + g * (FIELD_MAX_HEIGHT * 1.2 - FIELD_MIN_HEIGHT) * heightMult;
          alpha = (0.02 + g * (0.65 - 0.02)) * (0.2 + selProgress * 0.8);
          cr = fullColor.r; cg = fullColor.g; cb = fullColor.b;

          // Layer post-selection hover on top (smaller, subtler)
          if (smoothMouseX >= 0 && hoverIntensity > 0) {
            const gh = gaussian(fl.normX, smoothMouseX, POST_SEL_HOVER_SIGMA);
            const hoverH = FIELD_MIN_HEIGHT + gh * (POST_SEL_HOVER_MAX_HEIGHT - FIELD_MIN_HEIGHT);
            const hoverA = gh * POST_SEL_HOVER_MAX_ALPHA * hoverIntensity;
            // Take the max of selection vs hover for height, add alphas
            if (hoverH > height) height = hoverH;
            alpha = Math.min(0.7, alpha + hoverA);
          }
        } else if (smoothMouseX >= 0 && hoverIntensity > 0) {
          // Hover state: subdued wave follows mouse, fades in/out
          const g = gaussian(fl.normX, smoothMouseX, GAUSSIAN_SIGMA);
          const rawHeight = FIELD_MIN_HEIGHT + g * (HOVER_MAX_HEIGHT - FIELD_MIN_HEIGHT);
          const rawAlpha = 0.03 + g * (HOVER_MAX_ALPHA - 0.03);

          // Idle breathing as baseline
          const breathe = Math.sin(time * 0.8 + fl.phaseOffset) * 0.5 + 0.5;
          const idleHeight = FIELD_MIN_HEIGHT + breathe * 4;
          const idleAlpha = 0.03 + breathe * 0.02;

          // Crossfade between idle and hover based on hoverIntensity
          height = idleHeight + (rawHeight - idleHeight) * hoverIntensity;
          alpha = idleAlpha + (rawAlpha - idleAlpha) * hoverIntensity;
          cr = hoverColor.r; cg = hoverColor.g; cb = hoverColor.b;
        } else {
          // Idle state: subtle breathing
          const breathe = Math.sin(time * 0.8 + fl.phaseOffset) * 0.5 + 0.5;
          height = FIELD_MIN_HEIGHT + breathe * 4;
          alpha = 0.03 + breathe * 0.02;
          cr = hoverColor.r; cg = hoverColor.g; cb = hoverColor.b;
        }

        ctx.beginPath();
        ctx.moveTo(x, baselineY - height);
        ctx.lineTo(x, baselineY + height);
        ctx.strokeStyle = `rgba(${cr! | 0}, ${cg! | 0}, ${cb! | 0}, ${alpha})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      /* ---- 8. Draw nodes ---- */

      for (let i = 0; i < 5; i++) {
        const node = nodes[i];
        const isHovered = hoverIdx === i;
        const isSelected = selected === i;
        const hasSelection = selected >= 0;
        const color = SPECTRUM[i];

        let nodeSize: number;
        let nodeAlpha: number;

        if (isSelected) {
          nodeSize = 12;
          nodeAlpha = 0.95;
        } else if (isHovered && hasSelection) {
          // Hover after selection: subtle bump
          nodeSize = 8;
          nodeAlpha = 0.35;
        } else if (isHovered) {
          // Hover before selection: subdued
          nodeSize = 9;
          nodeAlpha = 0.6;
        } else if (hasSelection) {
          nodeSize = 6;
          nodeAlpha = 0.2;
        } else {
          nodeSize = 7;
          nodeAlpha = 0.5;
        }

        // Glow for selected node
        if (isSelected) {
          ctx.shadowColor = `rgba(${color.r}, ${color.g}, ${color.b}, 0.6)`;
          ctx.shadowBlur = 16;
        }

        ctx.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${nodeAlpha})`;
        ctx.fillRect(
          node.x - nodeSize / 2,
          node.y - nodeSize / 2,
          nodeSize,
          nodeSize,
        );

        if (isSelected) {
          ctx.shadowColor = 'transparent';
          ctx.shadowBlur = 0;
        }
      }

      /* ---- 9. Draw labels ---- */

      ctx.font = '400 12px "Kosugi", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';

      for (let i = 0; i < 5; i++) {
        const node = nodes[i];
        const isHovered = hoverIdx === i;
        const isSelected = selected === i;
        const hasSelection = selected >= 0;
        const color = SPECTRUM[i];

        let labelAlpha: number;
        if (isSelected) {
          labelAlpha = 0.95;
        } else if (isHovered && hasSelection) {
          labelAlpha = 0.55;
        } else if (isHovered) {
          labelAlpha = 0.75;
        } else if (hasSelection) {
          labelAlpha = 0.3;
        } else {
          labelAlpha = 0.65;
        }

        // Tint with spectrum color on hover/selection, white otherwise
        // Hover tint is subdued (blend toward white), selection is full color
        const tinted = isSelected || isHovered;
        let lr: number, lg: number, lb: number;
        if (isSelected) {
          lr = color.r; lg = color.g; lb = color.b;
        } else if (isHovered) {
          // Subdued tint: halfway between white and spectrum
          lr = 255 + (color.r - 255) * 0.4;
          lg = 255 + (color.g - 255) * 0.4;
          lb = 255 + (color.b - 255) * 0.4;
        } else {
          lr = 255; lg = 255; lb = 255;
        }

        ctx.fillStyle = `rgba(${lr | 0}, ${lg | 0}, ${lb | 0}, ${labelAlpha})`;

        const labelText = LABELS[i];
        const labelLines = labelText.split('\n');
        const labelLineHeight = 15;
        const labelStartY = node.y + 16;

        for (let l = 0; l < labelLines.length; l++) {
          ctx.fillText(labelLines[l], node.x, labelStartY + l * labelLineHeight);
        }
      }

      animRef.current = requestAnimationFrame(draw);
    }

    animRef.current = requestAnimationFrame(draw);

    /* ---- Cleanup ---- */

    return () => {
      cancelAnimationFrame(animRef.current);
      if (observer) observer.disconnect();
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('click', handleClick);
      container.removeEventListener('mouseleave', handleMouseLeave);
      container.removeEventListener('touchend', handleTouchEnd);
      if (selectTimerRef.current) clearTimeout(selectTimerRef.current);
    };
  }, [resize]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full"
      style={{ position: 'relative' }}
    >
      <canvas
        ref={canvasRef}
        style={{ display: 'block', width: '100%', height: '100%' }}
      />
    </div>
  );
}
