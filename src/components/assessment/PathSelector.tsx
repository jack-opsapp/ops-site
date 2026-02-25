/**
 * PathSelector — Fork-style version picker for the leadership landing page
 *
 * Two nodes: LEFT = "Quick" (blue), RIGHT = "Deep" (orange).
 * 80 ambient square particles drifting between them.
 * Hover: particles gravitate toward hovered node, orbit, color shifts.
 * Click: particle stream flows through selected node, then navigates.
 *
 * Adapted from ForcedChoiceFork. Pure Canvas 2D API.
 */

'use client';

import { useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface Particle {
  x: number;       // normalized 0-1
  y: number;       // normalized 0-1
  vx: number;
  vy: number;
  size: number;
  baseAlpha: number;
  phase: number;
}

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const PARTICLE_COUNT = 80;
const HIT_RADIUS = 70;
const SELECT_DELAY_MS = 800;
const CANVAS_HEIGHT_CLASS = 'h-[400px] md:h-[500px]';

// Node positions — wider spread for dramatic fork
const LEFT_NODE = { nx: 0.22, ny: 0.40 };
const RIGHT_NODE = { nx: 0.78, ny: 0.40 };

// Colors
const NEUTRAL = { r: 160, g: 160, b: 160 };
const BLUE    = { r: 89,  g: 140, b: 200 };
const ORANGE  = { r: 210, g: 140, b: 60  };

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function generateParticles(): Particle[] {
  const particles: Particle[] = [];
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    particles.push({
      x: Math.random(),
      y: Math.random(),
      vx: (Math.random() - 0.5) * 0.0003,
      vy: (Math.random() - 0.5) * 0.0003,
      size: 2 + Math.random() * 3.5,
      baseAlpha: 0.15 + Math.random() * 0.15,
      phase: Math.random() * Math.PI * 2,
    });
  }
  return particles;
}

function lerpColor(
  a: { r: number; g: number; b: number },
  b: { r: number; g: number; b: number },
  t: number,
) {
  return {
    r: a.r + (b.r - a.r) * t,
    g: a.g + (b.g - a.g) * t,
    b: a.b + (b.b - a.b) * t,
  };
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function PathSelector() {
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animRef = useRef<number>(0);
  const hoveredRef = useRef<number>(-1);
  const selectedRef = useRef<number>(-1);
  const selectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const timeRef = useRef(0);
  const particlesRef = useRef<Particle[] | null>(null);
  const selProgressRef = useRef(0);

  if (!particlesRef.current) {
    particlesRef.current = generateParticles();
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

  /* ---- Main effect ---- */

  useEffect(() => {
    resize();

    const container = containerRef.current!;
    let observer: ResizeObserver | null = null;
    if (container) {
      observer = new ResizeObserver(() => resize());
      observer.observe(container);
    }

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const mousePos = { x: -9999, y: -9999 };

    /* ---- Event handlers ---- */

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mousePos.x = e.clientX - rect.left;
      mousePos.y = e.clientY - rect.top;
    };

    const handleSelect = (idx: number) => {
      if (selectedRef.current >= 0) return; // already selected
      selectedRef.current = idx;
      selProgressRef.current = 0;

      if (selectTimerRef.current) clearTimeout(selectTimerRef.current);

      const version = idx === 0 ? 'quick' : 'deep';

      if (prefersReduced) {
        // Immediate navigation for reduced motion
        router.push(`/tools/leadership/assess?version=${version}`);
        return;
      }

      selectTimerRef.current = setTimeout(() => {
        router.push(`/tools/leadership/assess?version=${version}`);
      }, SELECT_DELAY_MS);
    };

    const handleClick = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;

      const canvas = canvasRef.current;
      if (!canvas) return;
      const w = parseFloat(canvas.style.width) || canvas.width;
      const h = parseFloat(canvas.style.height) || canvas.height;

      const nodes = [
        { x: LEFT_NODE.nx * w, y: LEFT_NODE.ny * h },
        { x: RIGHT_NODE.nx * w, y: RIGHT_NODE.ny * h },
      ];

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

      if (closest >= 0) handleSelect(closest);
    };

    const handleMouseLeave = () => {
      mousePos.x = -9999;
      mousePos.y = -9999;
    };

    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('click', handleClick);
    container.addEventListener('mouseleave', handleMouseLeave);

    /* ---- Touch ---- */

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

      const nodes = [
        { x: LEFT_NODE.nx * w, y: LEFT_NODE.ny * h },
        { x: RIGHT_NODE.nx * w, y: RIGHT_NODE.ny * h },
      ];

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

      if (closest >= 0) handleSelect(closest);
    };

    container.addEventListener('touchend', handleTouchEnd);

    /* ---- Reduced motion: static render ---- */

    if (prefersReduced) {
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const w = parseFloat(canvas.style.width) || canvas.width;
          const h = parseFloat(canvas.style.height) || canvas.height;
          const leftX = LEFT_NODE.nx * w;
          const leftY = LEFT_NODE.ny * h;
          const rightX = RIGHT_NODE.nx * w;
          const rightY = RIGHT_NODE.ny * h;

          ctx.clearRect(0, 0, w, h);

          // Connecting line
          ctx.beginPath();
          ctx.moveTo(leftX, leftY);
          ctx.lineTo(rightX, rightY);
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
          ctx.lineWidth = 1;
          ctx.stroke();

          // Nodes
          for (let i = 0; i < 2; i++) {
            const nx = i === 0 ? leftX : rightX;
            const ny = i === 0 ? leftY : rightY;
            const color = i === 0 ? BLUE : ORANGE;
            ctx.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, 0.5)`;
            ctx.fillRect(nx - 4, ny - 4, 8, 8);
          }

          // Labels
          drawLabels(ctx, w, h, -1, -1);
        }
      }

      return () => {
        container.removeEventListener('mousemove', handleMouseMove);
        container.removeEventListener('click', handleClick);
        container.removeEventListener('mouseleave', handleMouseLeave);
        container.removeEventListener('touchend', handleTouchEnd);
        if (observer) observer.disconnect();
        if (selectTimerRef.current) clearTimeout(selectTimerRef.current);
      };
    }

    /* ---- Animation loop ---- */

    const particles = particlesRef.current!;
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
      const time = timeRef.current;
      const selected = selectedRef.current;

      ctx.clearRect(0, 0, w, h);

      const leftX = LEFT_NODE.nx * w;
      const leftY = LEFT_NODE.ny * h;
      const rightX = RIGHT_NODE.nx * w;
      const rightY = RIGHT_NODE.ny * h;

      /* ---- Connecting line between nodes ---- */
      ctx.beginPath();
      ctx.moveTo(leftX, leftY);
      ctx.lineTo(rightX, rightY);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
      ctx.lineWidth = 1;
      ctx.stroke();

      /* ---- Hover detection ---- */

      let hoverIdx = -1;
      if (mousePos.x > -9000) {
        const nodes = [
          { x: leftX, y: leftY },
          { x: rightX, y: rightY },
        ];
        let closestDist = HIT_RADIUS;
        for (let i = 0; i < nodes.length; i++) {
          const dx = mousePos.x - nodes[i].x;
          const dy = mousePos.y - nodes[i].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < closestDist) {
            closestDist = dist;
            hoverIdx = i;
          }
        }
      }
      hoveredRef.current = hoverIdx;
      container.style.cursor = hoverIdx >= 0 ? 'pointer' : 'default';

      /* ---- Selection progress ---- */

      if (selected >= 0 && selProgressRef.current < 1) {
        selProgressRef.current = Math.min(1, selProgressRef.current + dt * 1.8);
      }
      const selProgress = selProgressRef.current;

      const flowDir = selected === 0 ? -1 : 1;
      const selNode = selected === 0 ? LEFT_NODE : RIGHT_NODE;
      const selColor = selected === 0 ? BLUE : ORANGE;

      const hoveringUnselected = selected >= 0 && hoverIdx >= 0 && hoverIdx !== selected;
      const flowSpeedMult = hoveringUnselected ? 0.2 : 1.0;

      /* ---- Update + draw particles ---- */

      for (const p of particles) {
        if (selected >= 0) {
          // STREAM MODE with FUNNEL
          const baseFlowSpeed = 0.003 * (0.3 + selProgress * 0.7) * flowSpeedMult;
          const flowVx = flowDir * baseFlowSpeed;

          const distToNode = flowDir < 0
            ? (selNode.nx - p.x)
            : (p.x - selNode.nx);

          const approachT = Math.max(0, Math.min(1, (distToNode + 0.5) / 0.5));
          const funnelStrength = (0.0003 + approachT * 0.004) * selProgress;

          const yDiff = selNode.ny - p.y;
          p.vy += yDiff * funnelStrength;
          p.vy *= 0.92;

          const speedMult = 0.4 + approachT * 0.6;
          p.vx += (flowVx * speedMult - p.vx) * (0.03 + selProgress * 0.06);

          if (distToNode < -0.1) {
            p.vy += Math.sin(time * 1.5 + p.phase) * 0.0003 * (1 - approachT);
            p.vx += Math.cos(time * 0.8 + p.phase * 2) * 0.00008 * (1 - approachT);
          } else {
            p.vy += Math.sin(time * 2 + p.phase) * 0.00005;
          }

          p.x += p.vx;
          p.y += p.vy;

          // Respawn on entry side
          if (flowDir < 0 && p.x < -0.02) {
            p.x = 1.0 + Math.random() * 0.15;
            p.y = selNode.ny + (Math.random() - 0.5) * 0.8;
            p.vx = flowDir * baseFlowSpeed * 0.3;
            p.vy = (Math.random() - 0.5) * 0.0005;
          } else if (flowDir > 0 && p.x > 1.02) {
            p.x = -0.15 + Math.random() * 0.15;
            p.y = selNode.ny + (Math.random() - 0.5) * 0.8;
            p.vx = flowDir * baseFlowSpeed * 0.3;
            p.vy = (Math.random() - 0.5) * 0.0005;
          }

          if (p.y < -0.05) p.y = 1.05;
          if (p.y > 1.05) p.y = -0.05;

        } else if (hoverIdx >= 0) {
          // HOVER ORBIT MODE
          const hovNode = hoverIdx === 0 ? LEFT_NODE : RIGHT_NODE;
          const dx = hovNode.nx - p.x;
          const dy = hovNode.ny - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist > 0.01) {
            const pullStrength = 0.00025;
            p.vx += (dx / dist) * pullStrength;
            p.vy += (dy / dist) * pullStrength;

            const tangentX = -dy / dist;
            const tangentY = dx / dist;
            const orbitStrength = 0.00012;
            p.vx += tangentX * orbitStrength;
            p.vy += tangentY * orbitStrength;
          }

          p.vx += Math.sin(time * 0.2 + p.phase) * 0.00003;
          p.vy += Math.cos(time * 0.15 + p.phase * 1.3) * 0.00003;

          p.vx *= 0.985;
          p.vy *= 0.985;

          p.x += p.vx;
          p.y += p.vy;

          if (p.x < -0.05) p.x = 1.05;
          if (p.x > 1.05) p.x = -0.05;
          if (p.y < -0.05) p.y = 1.05;
          if (p.y > 1.05) p.y = -0.05;

        } else {
          // AMBIENT MODE
          const breatheX = Math.sin(time * 0.2 + p.phase) * 0.00008;
          const breatheY = Math.cos(time * 0.15 + p.phase * 1.3) * 0.00008;

          p.vx += breatheX;
          p.vy += breatheY;
          p.vx *= 0.99;
          p.vy *= 0.99;

          p.x += p.vx;
          p.y += p.vy;

          if (p.x < -0.05) p.x = 1.05;
          if (p.x > 1.05) p.x = -0.05;
          if (p.y < -0.05) p.y = 1.05;
          if (p.y > 1.05) p.y = -0.05;
        }

        // COLOR + ALPHA
        const px = p.x * w;
        const py = p.y * h;

        let cr: number, cg: number, cb: number;
        let alpha = p.baseAlpha;

        if (selected >= 0) {
          const passedNode = flowDir < 0
            ? (selNode.nx - p.x)
            : (p.x - selNode.nx);

          const dNode = Math.sqrt((p.x - selNode.nx) ** 2 + (p.y - selNode.ny) ** 2);
          const proximity = Math.max(0, 1 - dNode / 0.25);

          let colorT: number;
          if (passedNode > 0) {
            colorT = Math.min(1, 0.6 + passedNode * 2);
          } else {
            colorT = Math.max(0, 1 + passedNode * 3) * 0.5;
          }
          colorT *= selProgress;

          const c = lerpColor(NEUTRAL, selColor, colorT);
          cr = c.r; cg = c.g; cb = c.b;

          alpha = p.baseAlpha * 0.7 + proximity * selProgress * 0.5;
          alpha = Math.max(alpha, p.baseAlpha * 0.5);

        } else if (hoverIdx >= 0) {
          const hovNode = hoverIdx === 0 ? LEFT_NODE : RIGHT_NODE;
          const dHov = Math.sqrt((p.x - hovNode.nx) ** 2 + (p.y - hovNode.ny) ** 2);
          const proximity = Math.max(0, 1 - dHov / 0.45);
          const hoverTint = hoverIdx === 0 ? BLUE : ORANGE;
          const c = lerpColor(NEUTRAL, hoverTint, proximity * 0.8);
          cr = c.r; cg = c.g; cb = c.b;
          alpha = p.baseAlpha + proximity * 0.2;
        } else {
          cr = NEUTRAL.r;
          cg = NEUTRAL.g;
          cb = NEUTRAL.b;
          alpha = p.baseAlpha + Math.sin(time * 0.5 + p.phase) * 0.03;
        }

        ctx.fillStyle = `rgba(${cr | 0}, ${cg | 0}, ${cb | 0}, ${Math.max(0, Math.min(1, alpha))})`;
        ctx.fillRect(px - p.size / 2, py - p.size / 2, p.size, p.size);
      }

      /* ---- Draw nodes ---- */

      for (let i = 0; i < 2; i++) {
        const nodeX = i === 0 ? leftX : rightX;
        const nodeY = i === 0 ? leftY : rightY;
        const isHovered = hoverIdx === i;
        const isSelected = selected === i;
        const hasSelection = selected >= 0;
        const nodeColor = i === 0 ? BLUE : ORANGE;

        let nodeSize: number;
        let nodeAlpha: number;

        if (isSelected) {
          nodeSize = 12;
          nodeAlpha = 0.95;
        } else if (isHovered && hasSelection) {
          nodeSize = 9;
          nodeAlpha = 0.45;
        } else if (isHovered) {
          nodeSize = 10;
          nodeAlpha = 0.65;
        } else if (hasSelection) {
          nodeSize = 6;
          nodeAlpha = 0.15;
        } else {
          nodeSize = 7;
          nodeAlpha = 0.4;
        }

        if (isSelected) {
          ctx.shadowColor = `rgba(${nodeColor.r}, ${nodeColor.g}, ${nodeColor.b}, 0.6)`;
          ctx.shadowBlur = 18;
        }

        const drawColor = (isSelected || isHovered) ? nodeColor : NEUTRAL;
        ctx.fillStyle = `rgba(${drawColor.r}, ${drawColor.g}, ${drawColor.b}, ${nodeAlpha})`;
        ctx.fillRect(
          nodeX - nodeSize / 2,
          nodeY - nodeSize / 2,
          nodeSize,
          nodeSize,
        );

        if (isSelected) {
          ctx.shadowColor = 'transparent';
          ctx.shadowBlur = 0;
        }
      }

      /* ---- Draw labels ---- */
      drawLabels(ctx, w, h, hoverIdx, selected);

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
  }, [resize, router]);

  return (
    <div
      ref={containerRef}
      className={`w-full ${CANVAS_HEIGHT_CLASS}`}
      style={{ position: 'relative' }}
    >
      <canvas
        ref={canvasRef}
        style={{ display: 'block', width: '100%', height: '100%' }}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Label drawing helper                                               */
/* ------------------------------------------------------------------ */

const LABELS = [
  { title: 'QUICK', time: '3 MINUTES', desc: '15 questions \u2014 snapshot profile' },
  { title: 'DEEP', time: '12 MINUTES', desc: '50 questions \u2014 comprehensive analysis' },
];

function drawLabels(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  hoverIdx: number,
  selected: number,
) {
  const leftX = LEFT_NODE.nx * w;
  const leftY = LEFT_NODE.ny * h;
  const rightX = RIGHT_NODE.nx * w;
  const rightY = RIGHT_NODE.ny * h;

  ctx.textBaseline = 'top';

  for (let i = 0; i < 2; i++) {
    const nodeX = i === 0 ? leftX : rightX;
    const nodeY = i === 0 ? leftY : rightY;
    const isHovered = hoverIdx === i;
    const isSelected = selected === i;
    const hasSelection = selected >= 0;
    const label = LABELS[i];

    let labelAlpha: number;
    if (isSelected) {
      labelAlpha = 0.95;
    } else if (isHovered && hasSelection) {
      labelAlpha = 0.7;
    } else if (isHovered) {
      labelAlpha = 0.85;
    } else if (hasSelection) {
      labelAlpha = 0.2;
    } else {
      labelAlpha = 0.5;
    }

    ctx.textAlign = 'center';

    // Title (Kosugi)
    ctx.font = '400 12px "Kosugi", sans-serif';
    ctx.fillStyle = `rgba(255, 255, 255, ${labelAlpha})`;
    const titleY = nodeY + 20;
    ctx.fillText(label.title, nodeX, titleY);

    // Time (Kosugi, tracked)
    ctx.font = '400 11px "Kosugi", sans-serif';
    const nodeColor = i === 0 ? BLUE : ORANGE;
    const timeAlpha = isSelected ? 0.9 : isHovered ? 0.7 : hasSelection ? 0.15 : 0.4;
    ctx.fillStyle = `rgba(${nodeColor.r}, ${nodeColor.g}, ${nodeColor.b}, ${timeAlpha})`;
    ctx.fillText(label.time, nodeX, titleY + 20);

    // Description (Mohave)
    ctx.font = '300 12px "Mohave", sans-serif';
    const descAlpha = labelAlpha * 0.7;
    ctx.fillStyle = `rgba(153, 153, 153, ${descAlpha})`;
    ctx.fillText(label.desc, nodeX, titleY + 40);
  }
}
