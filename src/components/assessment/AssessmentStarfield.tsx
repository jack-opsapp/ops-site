/**
 * AssessmentStarfield — Subtle ambient background canvas
 *
 * ~50 tiny square particles with slow random drift.
 * Cursor proximity causes nearby stars to brighten slightly.
 * Grey + accent blue only (no orange shift).
 * Respects prefers-reduced-motion: renders single static frame.
 */

'use client';

import { useRef, useEffect, useCallback } from 'react';

const ACCENT = { r: 89, g: 119, b: 148 };
const GREY = { r: 160, g: 160, b: 160 };
const PARTICLE_COUNT = 50;
const BRIGHTEN_RADIUS = 80;
const BRIGHTEN_MULTIPLIER = 1.5;

interface AmbientStar {
  x: number;
  y: number;
  size: number;
  baseAlpha: number;
  color: { r: number; g: number; b: number };
  // Drift velocity (px per second)
  vx: number;
  vy: number;
}

export default function AssessmentStarfield() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animRef = useRef(0);
  const mouseRef = useRef({ x: -9999, y: -9999 });

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

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Generate stars
    const stars: AmbientStar[] = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const isAccent = Math.random() < 0.3;
      stars.push({
        x: Math.random(),
        y: Math.random(),
        size: 1 + Math.random() * 2,
        baseAlpha: 0.03 + Math.random() * 0.05,
        color: isAccent ? ACCENT : GREY,
        vx: (Math.random() - 0.5) * 6,
        vy: (Math.random() - 0.5) * 6,
      });
    }

    // Reduced motion: render one static frame
    if (prefersReduced) {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (canvas && ctx) {
        const w = parseFloat(canvas.style.width) || canvas.width;
        const h = parseFloat(canvas.style.height) || canvas.height;
        ctx.clearRect(0, 0, w, h);
        for (const star of stars) {
          ctx.fillStyle = `rgba(${star.color.r}, ${star.color.g}, ${star.color.b}, ${star.baseAlpha})`;
          const px = star.x * w;
          const py = star.y * h;
          ctx.fillRect(px - star.size / 2, py - star.size / 2, star.size, star.size);
        }
      }
      return () => {
        if (observer) observer.disconnect();
        container?.removeEventListener('mousemove', handleMouseMove);
        container?.removeEventListener('mouseleave', handleMouseLeave);
      };
    }

    let prevTimestamp: number | null = null;

    function draw(timestamp: number) {
      if (prevTimestamp === null) prevTimestamp = timestamp;
      const dt = Math.min((timestamp - prevTimestamp) / 1000, 0.1);
      prevTimestamp = timestamp;

      const canvas = canvasRef.current;
      if (!canvas) { animRef.current = requestAnimationFrame(draw); return; }
      const ctx = canvas.getContext('2d');
      if (!ctx) { animRef.current = requestAnimationFrame(draw); return; }

      const w = parseFloat(canvas.style.width) || canvas.width;
      const h = parseFloat(canvas.style.height) || canvas.height;
      const mouse = mouseRef.current;

      ctx.clearRect(0, 0, w, h);

      for (const star of stars) {
        // Drift
        star.x += (star.vx * dt) / w;
        star.y += (star.vy * dt) / h;

        // Wrap around edges
        if (star.x < -0.05) star.x = 1.05;
        if (star.x > 1.05) star.x = -0.05;
        if (star.y < -0.05) star.y = 1.05;
        if (star.y > 1.05) star.y = -0.05;

        const px = star.x * w;
        const py = star.y * h;

        // Cursor proximity brightening
        let alpha = star.baseAlpha;
        const mdx = px - mouse.x;
        const mdy = py - mouse.y;
        const mDist = Math.sqrt(mdx * mdx + mdy * mdy);
        if (mDist < BRIGHTEN_RADIUS) {
          const proximity = 1 - mDist / BRIGHTEN_RADIUS;
          alpha = Math.min(alpha * (1 + proximity * (BRIGHTEN_MULTIPLIER - 1)), 0.2);
        }

        ctx.fillStyle = `rgba(${star.color.r}, ${star.color.g}, ${star.color.b}, ${alpha})`;
        ctx.fillRect(px - star.size / 2, py - star.size / 2, star.size, star.size);
      }

      animRef.current = requestAnimationFrame(draw);
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
    <div ref={containerRef} className="absolute inset-0 pointer-events-none" aria-hidden="true">
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%' }} />
    </div>
  );
}
