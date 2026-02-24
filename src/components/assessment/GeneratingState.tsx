'use client';

import { useRef, useEffect, useCallback } from 'react';

const ACCENT = { r: 89, g: 119, b: 148 };
const DIMENSIONS = 6;

export default function GeneratingState() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animRef = useRef(0);

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
    window.addEventListener('resize', resize);
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let startTs: number | null = null;

    function draw(ts: number) {
      if (!startTs) startTs = ts;
      const elapsed = (ts - startTs) / 1000;

      const canvas = canvasRef.current;
      if (!canvas) { animRef.current = requestAnimationFrame(draw); return; }
      const ctx = canvas.getContext('2d');
      if (!ctx) { animRef.current = requestAnimationFrame(draw); return; }

      const w = parseFloat(canvas.style.width) || canvas.width;
      const h = parseFloat(canvas.style.height) || canvas.height;
      const cx = w / 2;
      const cy = h / 2;
      const maxRadius = Math.min(w, h) * 0.3;

      ctx.clearRect(0, 0, w, h);

      // Draw building hexagonal radar
      for (let ring = 0; ring < 3; ring++) {
        const ringRadius = maxRadius * ((ring + 1) / 3);
        const alpha = 0.06 + ring * 0.02;
        ctx.beginPath();
        for (let i = 0; i <= DIMENSIONS; i++) {
          const angle = (Math.PI * 2 / DIMENSIONS) * i - Math.PI / 2;
          const x = cx + Math.cos(angle) * ringRadius;
          const y = cy + Math.sin(angle) * ringRadius;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.strokeStyle = `rgba(${ACCENT.r}, ${ACCENT.g}, ${ACCENT.b}, ${alpha})`;
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }

      // Animated fill shape — grows and morphs
      ctx.beginPath();
      for (let i = 0; i <= DIMENSIONS; i++) {
        const angle = (Math.PI * 2 / DIMENSIONS) * (i % DIMENSIONS) - Math.PI / 2;
        const phase = elapsed * 0.8 + i * 1.2;
        const extent = 0.3 + 0.5 * (0.5 + 0.5 * Math.sin(phase));
        const r = maxRadius * extent;
        const x = cx + Math.cos(angle) * r;
        const y = cy + Math.sin(angle) * r;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.fillStyle = `rgba(${ACCENT.r}, ${ACCENT.g}, ${ACCENT.b}, 0.06)`;
      ctx.fill();
      ctx.strokeStyle = `rgba(${ACCENT.r}, ${ACCENT.g}, ${ACCENT.b}, 0.25)`;
      ctx.lineWidth = 1;
      ctx.stroke();

      // Dimension axis lines
      for (let i = 0; i < DIMENSIONS; i++) {
        const angle = (Math.PI * 2 / DIMENSIONS) * i - Math.PI / 2;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + Math.cos(angle) * maxRadius, cy + Math.sin(angle) * maxRadius);
        ctx.strokeStyle = `rgba(255, 255, 255, 0.06)`;
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }

      if (!prefersReduced) animRef.current = requestAnimationFrame(draw);
    }

    if (prefersReduced) {
      draw(0);
    } else {
      animRef.current = requestAnimationFrame(draw);
    }

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', resize);
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
