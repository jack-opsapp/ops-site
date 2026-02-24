/**
 * LikertRadialGauge — Canvas 2D interactive Likert scale (1-5)
 *
 * A semicircular arc with 5 interactive nodes, ~40 atmospheric background
 * rays with breathing animation and mouse proximity effects. Selection
 * triggers a meter fill effect with animated fill angle lerp and particle
 * stream along the selected ray.
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
}

interface Particle {
  progress: number;
  speed: number;
  opacity: number;
  size: number;
}

interface BackgroundRay {
  angle: number;
  baseLength: number;    // 0.3-0.8
  phaseOffset: number;
  baseOpacity: number;   // 0.04-0.10
}

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const ACCENT = { r: 89, g: 119, b: 148 };
const GREY = { r: 100, g: 100, b: 100 };

const NODE_COUNT = 5;
const ARC_SPAN = Math.PI * 0.85;
const RAY_LENGTH_FRACTION = 0.7;
const HIT_RADIUS = 24;
const PARTICLE_COUNT = 8;
const SELECT_DELAY_MS = 600;
const BG_RAY_COUNT = 40;
const PROXIMITY_THRESHOLD = 0.15; // radians

const LABELS = [
  'STRONGLY\nDISAGREE',
  'DISAGREE',
  'NEUTRAL',
  'AGREE',
  'STRONGLY\nAGREE',
];

/* ------------------------------------------------------------------ */
/*  Background ray generation                                          */
/* ------------------------------------------------------------------ */

function generateBackgroundRays(): BackgroundRay[] {
  const rays: BackgroundRay[] = [];
  const startAngle = -Math.PI / 2 - ARC_SPAN / 2;
  const endAngle = -Math.PI / 2 + ARC_SPAN / 2;

  for (let i = 0; i < BG_RAY_COUNT; i++) {
    const t = i / (BG_RAY_COUNT - 1);
    const baseAngle = startAngle + t * (endAngle - startAngle);
    // Slight random jitter for organicness
    const angle = baseAngle + (Math.random() - 0.5) * 0.04;

    rays.push({
      angle,
      baseLength: 0.3 + Math.random() * 0.5,
      phaseOffset: Math.random() * Math.PI * 2,
      baseOpacity: 0.04 + Math.random() * 0.06,
    });
  }

  return rays;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function LikertRadialGauge({ onSelect }: LikertRadialGaugeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animRef = useRef<number>(0);
  const hoveredRef = useRef<number>(-1);
  const selectedRef = useRef<number>(-1);
  const particlesRef = useRef<Particle[]>([]);
  const bgRaysRef = useRef<BackgroundRay[] | null>(null);
  const selectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reducedMotionRef = useRef(false);
  const onSelectRef = useRef(onSelect);
  const animatedFillAngleRef = useRef<number>(-999);
  const timeRef = useRef(0);

  onSelectRef.current = onSelect;

  if (!bgRaysRef.current) {
    bgRaysRef.current = generateBackgroundRays();
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

  /* ---- Geometry helper ---- */

  const getNodePositions = useCallback((w: number, h: number) => {
    const cx = w / 2;
    const cy = h * 0.85;
    const radius = Math.min(w * 0.42, h * 0.7);
    const rayLen = radius * RAY_LENGTH_FRACTION;
    const startAngle = -Math.PI / 2 - ARC_SPAN / 2;

    const nodes: { x: number; y: number; angle: number }[] = [];
    for (let i = 0; i < NODE_COUNT; i++) {
      const angle = startAngle + (ARC_SPAN / (NODE_COUNT - 1)) * i;
      nodes.push({
        x: cx + Math.cos(angle) * rayLen,
        y: cy + Math.sin(angle) * rayLen,
        angle,
      });
    }
    return { cx, cy, radius, rayLen, startAngle, nodes };
  }, []);

  /* ---- Spawn particles for selected ray ---- */

  const spawnParticles = useCallback(() => {
    const particles: Particle[] = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push({
        progress: Math.random(),
        speed: 0.008 + Math.random() * 0.006,
        opacity: 0.4 + Math.random() * 0.4,
        size: 2 + Math.random() * 2,
      });
    }
    particlesRef.current = particles;
  }, []);

  /* ---- Hit detection helper ---- */

  const getHoveredIndex = useCallback((
    mx: number, my: number,
    nodes: { x: number; y: number }[],
  ): number => {
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

    const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
    reducedMotionRef.current = mql.matches;
    const handleMotionChange = (e: MediaQueryListEvent) => {
      reducedMotionRef.current = e.matches;
    };
    mql.addEventListener('change', handleMotionChange);

    const mousePos = { x: -9999, y: -9999 };

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
      const { nodes } = getNodePositions(w, h);
      const idx = getHoveredIndex(mx, my, nodes);

      if (idx >= 0) {
        selectedRef.current = idx;
        spawnParticles();

        if (selectTimerRef.current) clearTimeout(selectTimerRef.current);

        if (reducedMotionRef.current) {
          onSelectRef.current(idx + 1);
        } else {
          selectTimerRef.current = setTimeout(() => {
            onSelectRef.current(idx + 1);
          }, SELECT_DELAY_MS);
        }
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
      const { nodes } = getNodePositions(w, h);
      const idx = getHoveredIndex(mx, my, nodes);

      if (idx >= 0) {
        selectedRef.current = idx;
        spawnParticles();

        if (selectTimerRef.current) clearTimeout(selectTimerRef.current);

        if (reducedMotionRef.current) {
          onSelectRef.current(idx + 1);
        } else {
          selectTimerRef.current = setTimeout(() => {
            onSelectRef.current(idx + 1);
          }, SELECT_DELAY_MS);
        }
      }
    };

    container.addEventListener('touchend', handleTouchEnd);

    /* ---- Animation loop ---- */

    const bgRays = bgRaysRef.current!;
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

      const { cx, cy, rayLen, startAngle, nodes } = getNodePositions(w, h);
      const selected = selectedRef.current;
      const time = timeRef.current;

      // Compute mouse angle from center
      let mouseAngle = -999;
      if (mousePos.x > -9000) {
        mouseAngle = Math.atan2(mousePos.y - cy, mousePos.x - cx);
      }

      // Hover detection
      const hoverIdx = getHoveredIndex(mousePos.x, mousePos.y, nodes);
      hoveredRef.current = hoverIdx;
      container.style.cursor = hoverIdx >= 0 ? 'pointer' : 'default';

      // Compute animated fill angle
      if (selected >= 0) {
        const targetFillAngle = nodes[selected].angle;
        if (animatedFillAngleRef.current < -900) {
          animatedFillAngleRef.current = startAngle;
        }
        animatedFillAngleRef.current += (targetFillAngle - animatedFillAngleRef.current) * 0.08;
      }

      const fillAngle = animatedFillAngleRef.current;
      const hasFill = selected >= 0 && fillAngle > -900;

      /* ---- Draw background rays ---- */

      for (const ray of bgRays) {
        const breathe = Math.sin(time * 0.5 + ray.phaseOffset) * 0.04 * ray.baseLength;
        let rayLength = ray.baseLength + breathe;
        let opacity = ray.baseOpacity;

        // Mouse proximity boost (mouse-only)
        if (mouseAngle > -900) {
          let angularDist = Math.abs(ray.angle - mouseAngle);
          if (angularDist > Math.PI) angularDist = Math.PI * 2 - angularDist;
          const proximityFactor = Math.max(0, 1 - angularDist / PROXIMITY_THRESHOLD);
          if (proximityFactor > 0) {
            opacity += proximityFactor * 0.08;
            rayLength += proximityFactor * 0.05;
          }
        }

        // Selection: meter fill effect
        if (hasFill) {
          const inFill = ray.angle >= startAngle && ray.angle <= fillAngle;
          if (inFill) {
            // Within filled range: tint ACCENT with higher opacity
            const endX = cx + Math.cos(ray.angle) * rayLen * rayLength;
            const endY = cy + Math.sin(ray.angle) * rayLen * rayLength;

            ctx.beginPath();
            ctx.moveTo(cx, cy);
            ctx.lineTo(endX, endY);
            ctx.strokeStyle = `rgba(${ACCENT.r}, ${ACCENT.g}, ${ACCENT.b}, ${Math.min(opacity * 2.5, 0.25)})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
            continue;
          } else {
            // Beyond selection: dim to 0.02
            opacity = 0.02;
          }
        }

        const endX = cx + Math.cos(ray.angle) * rayLen * rayLength;
        const endY = cy + Math.sin(ray.angle) * rayLen * rayLength;

        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(endX, endY);
        ctx.strokeStyle = `rgba(${GREY.r}, ${GREY.g}, ${GREY.b}, ${opacity})`;
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }

      /* ---- Draw arc fill glow segment ---- */

      if (hasFill) {
        ctx.beginPath();
        ctx.arc(cx, cy, rayLen * 0.5, startAngle, fillAngle);
        ctx.strokeStyle = `rgba(${ACCENT.r}, ${ACCENT.g}, ${ACCENT.b}, 0.35)`;
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      /* ---- Draw rays and nodes ---- */

      for (let i = 0; i < NODE_COUNT; i++) {
        const node = nodes[i];
        const isHovered = hoverIdx === i && selected < 0;
        const isSelected = selected === i;
        const hasSelection = selected >= 0;

        // Ray line
        let lineAlpha: number;
        let lineColor: typeof ACCENT;
        let lineWidth: number;

        if (isSelected) {
          lineColor = ACCENT;
          lineAlpha = 0.6;
          lineWidth = 1.5;
        } else if (isHovered) {
          lineColor = ACCENT;
          lineAlpha = 0.4;
          lineWidth = 0.8;
        } else if (hasSelection) {
          lineColor = GREY;
          lineAlpha = 0.08;
          lineWidth = 0.8;
        } else {
          lineColor = GREY;
          lineAlpha = 0.15;
          lineWidth = 0.8;
        }

        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(node.x, node.y);
        ctx.strokeStyle = `rgba(${lineColor.r}, ${lineColor.g}, ${lineColor.b}, ${lineAlpha})`;
        ctx.lineWidth = lineWidth;
        ctx.stroke();

        // Node (square)
        let nodeSize: number;
        let nodeAlpha: number;
        let nodeColor: typeof ACCENT;

        if (isSelected) {
          nodeColor = ACCENT;
          nodeSize = 12;
          nodeAlpha = 0.9;
        } else if (isHovered) {
          nodeColor = ACCENT;
          nodeSize = 10;
          nodeAlpha = 0.7;
        } else if (hasSelection) {
          nodeColor = GREY;
          nodeSize = 6;
          nodeAlpha = 0.15;
        } else {
          nodeColor = GREY;
          nodeSize = 6;
          nodeAlpha = 0.35;
        }

        if (isSelected) {
          ctx.shadowColor = `rgba(${ACCENT.r}, ${ACCENT.g}, ${ACCENT.b}, 0.5)`;
          ctx.shadowBlur = 16;
        }

        ctx.fillStyle = `rgba(${nodeColor.r}, ${nodeColor.g}, ${nodeColor.b}, ${nodeAlpha})`;
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

        // Label
        let labelAlpha: number;
        if (isSelected) {
          labelAlpha = 0.9;
        } else if (isHovered) {
          labelAlpha = 0.7;
        } else if (hasSelection) {
          labelAlpha = 0.2;
        } else {
          labelAlpha = 0.5;
        }

        ctx.font = '400 10px "Kosugi", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillStyle = `rgba(255, 255, 255, ${labelAlpha})`;

        const labelText = LABELS[i];
        const labelLines = labelText.split('\n');
        const labelLineHeight = 13;
        const labelStartY = node.y + nodeSize / 2 + 10;

        for (let l = 0; l < labelLines.length; l++) {
          ctx.fillText(labelLines[l], node.x, labelStartY + l * labelLineHeight);
        }
      }

      /* ---- Particles (selected state, animated) ---- */

      if (selected >= 0 && !reducedMotionRef.current) {
        const selNode = nodes[selected];
        const particles = particlesRef.current;

        for (const p of particles) {
          p.progress += p.speed;
          if (p.progress > 1) p.progress = 0;

          const px = cx + (selNode.x - cx) * p.progress;
          const py = cy + (selNode.y - cy) * p.progress;
          const alpha = p.opacity * (1 - p.progress * 0.5);

          ctx.fillStyle = `rgba(${ACCENT.r}, ${ACCENT.g}, ${ACCENT.b}, ${alpha})`;
          ctx.fillRect(
            px - p.size / 2,
            py - p.size / 2,
            p.size,
            p.size,
          );
        }
      }

      /* ---- Center point indicator ---- */

      ctx.fillStyle = `rgba(${GREY.r}, ${GREY.g}, ${GREY.b}, 0.15)`;
      ctx.fillRect(cx - 1.5, cy - 1.5, 3, 3);

      animRef.current = requestAnimationFrame(draw);
    }

    animRef.current = requestAnimationFrame(draw);

    /* ---- Cleanup ---- */

    return () => {
      cancelAnimationFrame(animRef.current);
      if (observer) observer.disconnect();
      mql.removeEventListener('change', handleMotionChange);
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('click', handleClick);
      container.removeEventListener('mouseleave', handleMouseLeave);
      container.removeEventListener('touchend', handleTouchEnd);
      if (selectTimerRef.current) clearTimeout(selectTimerRef.current);
    };
  }, [resize, getNodePositions, getHoveredIndex, spawnParticles]);

  return (
    <div
      ref={containerRef}
      className="w-full h-[300px] md:h-[360px]"
      style={{ position: 'relative' }}
    >
      <canvas
        ref={canvasRef}
        style={{ display: 'block', width: '100%', height: '100%' }}
      />
    </div>
  );
}
