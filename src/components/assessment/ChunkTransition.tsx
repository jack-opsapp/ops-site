'use client';

import { useRef, useEffect, useCallback } from 'react';

const ACCENT = { r: 89, g: 119, b: 148 };
const PARTICLE_COUNT = 40;

interface TransitParticle {
  startX: number; startY: number;
  x: number; y: number;
  speed: number;
  progress: number;
  size: number;
  opacity: number;
}

interface ChunkTransitionProps {
  chunkNumber: number;
  totalChunks: number;
  onComplete: () => void;
}

export default function ChunkTransition({ chunkNumber, totalChunks, onComplete }: ChunkTransitionProps) {
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

    if (prefersReduced) {
      const t = setTimeout(onComplete, 800);
      return () => { clearTimeout(t); window.removeEventListener('resize', resize); };
    }

    const canvas = canvasRef.current!;
    const w = parseFloat(canvas.style.width) || 400;
    const h = parseFloat(canvas.style.height) || 400;
    const cx = w / 2;
    const cy = h / 2;

    const particles: TransitParticle[] = Array.from({ length: PARTICLE_COUNT }, () => {
      const angle = Math.random() * Math.PI * 2;
      const edgeDist = Math.max(w, h) * 0.6;
      return {
        startX: cx + Math.cos(angle) * edgeDist,
        startY: cy + Math.sin(angle) * edgeDist,
        x: 0, y: 0,
        speed: 0.006 + Math.random() * 0.004,
        progress: 0,
        size: 2 + Math.random() * 3,
        opacity: 0.3 + Math.random() * 0.5,
      };
    });

    let phase: 'converge' | 'hold' | 'done' = 'converge';
    let holdStart = 0;

    function draw(ts: number) {
      const ctx = canvas.getContext('2d');
      if (!ctx) { animRef.current = requestAnimationFrame(draw); return; }

      ctx.clearRect(0, 0, w, h);

      let allConverged = true;

      for (const p of particles) {
        if (phase === 'converge') {
          p.progress = Math.min(1, p.progress + p.speed);
          if (p.progress < 1) allConverged = false;
          const t = p.progress < 0.5
            ? 2 * p.progress * p.progress
            : 1 - Math.pow(-2 * p.progress + 2, 2) / 2;
          p.x = p.startX + (cx - p.startX) * t;
          p.y = p.startY + (cy - p.startY) * t;
        }

        const alpha = p.opacity * (phase === 'converge' ? p.progress : 1);
        ctx.fillStyle = `rgba(${ACCENT.r}, ${ACCENT.g}, ${ACCENT.b}, ${alpha})`;
        ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
      }

      if (phase === 'converge' && allConverged) {
        phase = 'hold';
        holdStart = ts;
      }

      if (phase === 'hold' && ts - holdStart > 400) {
        phase = 'done';
        onComplete();
        return;
      }

      animRef.current = requestAnimationFrame(draw);
    }

    animRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', resize);
    };
  }, [resize, onComplete]);

  return (
    <div className="min-h-[400px] flex flex-col items-center justify-center bg-ops-background relative">
      <div ref={containerRef} className="absolute inset-0">
        <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%' }} />
      </div>
      <div className="relative z-10 text-left">
        <p className="font-caption text-xs uppercase tracking-[0.2em] text-ops-text-secondary">
          Analyzing responses...
        </p>
        <p className="font-caption text-[10px] uppercase tracking-[0.15em] text-ops-text-secondary/50 mt-2">
          Chunk {chunkNumber} of {totalChunks}
        </p>
      </div>
    </div>
  );
}
