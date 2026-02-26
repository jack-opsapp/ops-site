/**
 * ChunkTransition — Stars fade in, then funnel-whoosh away to the LEFT
 *
 * Stars appear one at a time at varying sizes/brightnesses across the canvas.
 * Star density is concentrated toward the vertical center, thinning at edges.
 * Cursor repulsion pushes nearby normal stars away and blends them toward orange.
 *
 * Special "quote stars" are scattered among the field — they DON'T repulse.
 * Instead, hovering them shifts their color to blue and reveals a quote tooltip.
 *
 * After a brief hold, all stars funnel into a stream and whoosh out to the left.
 *
 * Accepts `elapsedOffset` so stars can begin fading in during the loading phase
 * before this component fully takes over (seamless transition from submitting_chunk).
 *
 * Pure Canvas 2D API — no animation libraries.
 */

'use client';

import { useRef, useEffect, useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const ACCENT = { r: 89, g: 119, b: 148 };
const GREY_STAR = { r: 180, g: 180, b: 180 };
const ORANGE = { r: 210, g: 140, b: 60 };
const QUOTE_BLUE = { r: 100, g: 160, b: 220 };
const PARTICLE_COUNT = 90;
const QUOTE_STAR_COUNT = 6;
const ORANGE_RADIUS = 90;
const QUOTE_HOVER_RADIUS = 40;

// Phase timing (seconds)
const FADE_IN_DURATION = 2.0;    // stars fade in one at a time
const HOLD_DURATION = 0.5;       // brief hold
const FUNNEL_DURATION = 1.2;     // funnel whoosh out

// Cursor repulsion
const REPULSE_RADIUS = 100;
const REPULSE_STRENGTH = 20;

/* ------------------------------------------------------------------ */
/*  Quotes                                                             */
/* ------------------------------------------------------------------ */

const QUOTES = [
  'BUILD SOMETHING THAT LASTS',
  'DISCIPLINE IS FREEDOM',
  'EARN THE NEXT HOUR',
  'THE WORK SPEAKS',
  'WHAT YOU TOLERATE YOU TEACH',
  'BE WHAT YOU NEEDED',
  'CONVICTION BEFORE CONSENSUS',
  'THE STANDARD OUTLIVES THE SETTER',
  'BE THE PROOF',
  'KNOWING IS NOT DOING',
  'SLOW IS SMOOTH, SMOOTH IS FAST',
  'HARD CHOICES, EASY LIFE',
  'FIRST IN, LAST OUT',
  'SHOW UP, SHUT UP, STEP UP',
  'RAISE THE FLOOR, THE CEILING FOLLOWS',
  'ROUGH HANDS, CLEAN WORK',
  'DEFAULT TO ACTION',
  'OWN THE OUTCOME',
  'IRON SHARPENS IRON',
  'DO HARD THINGS',
  'START UGLY, FINISH CLEAN',
  'LEAVE IT BETTER',
  'MAKE IT COUNT',
  'PER ASPERA AD ASTRA',
  'SOMETHING FROM NOTHING',
];

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface TransitStar {
  baseX: number;
  baseY: number;
  size: number;
  baseAlpha: number;
  baseColor: { r: number; g: number; b: number };
  fadeInTime: number;
  funnelSpeed: number;
  funnelDrift: number;
  isQuoteStar: boolean;
  quote: string;
}

interface ChunkTransitionProps {
  chunkNumber: number;
  totalChunks: number;
  onComplete: () => void;
  /** Time already elapsed (e.g. from submitting_chunk phase) so stars start partially faded in */
  elapsedOffset?: number;
  /** When true, only run the fade-in galaxy — don't show text or trigger onComplete */
  galaxyOnly?: boolean;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function easeIn(t: number): number {
  return t * t * t;
}

function easeOut(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Vertical density distribution — bell-curve-ish.
 * Returns a Y in 0..1 concentrated toward the center.
 */
function sampleVerticalPosition(): number {
  // Average of 2 uniform randoms → triangular distribution centered at 0.5
  // Then spread it a bit so it's not too tight
  const base = (Math.random() + Math.random()) / 2;
  // Remap from ~0.15–0.85 to 0.05–0.95 with falloff at edges
  return 0.05 + base * 0.9;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function ChunkTransition({
  chunkNumber,
  totalChunks,
  onComplete,
  elapsedOffset = 0,
  galaxyOnly = false,
}: ChunkTransitionProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animRef = useRef(0);
  const onCompleteRef = useRef(onComplete);
  const mouseRef = useRef({ x: -9999, y: -9999 });
  const [showAnalyzing, setShowAnalyzing] = useState(false);
  const [activeQuote, setActiveQuote] = useState<{ text: string; x: number; y: number } | null>(null);
  const activeQuoteRef = useRef<{ text: string; x: number; y: number } | null>(null);
  onCompleteRef.current = onComplete;

  // Show "Analyzing responses..." after 0.5s delay (only in full mode)
  useEffect(() => {
    if (galaxyOnly) return;
    const t = setTimeout(() => setShowAnalyzing(true), 500);
    return () => clearTimeout(t);
  }, [galaxyOnly]);

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

    // Mouse tracking
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

    if (prefersReduced && !galaxyOnly) {
      const t = setTimeout(() => onCompleteRef.current(), 800);
      return () => {
        clearTimeout(t);
        if (observer) observer.disconnect();
        container?.removeEventListener('mousemove', handleMouseMove);
        container?.removeEventListener('mouseleave', handleMouseLeave);
      };
    }

    // Pick random quotes for this transition
    const shuffledQuotes = shuffleArray(QUOTES);

    // Pick which star indices will be quote stars (spread evenly through the field)
    const quoteIndices = new Set<number>();
    const step = Math.floor(PARTICLE_COUNT / QUOTE_STAR_COUNT);
    for (let i = 0; i < QUOTE_STAR_COUNT; i++) {
      quoteIndices.add(Math.min(
        PARTICLE_COUNT - 1,
        Math.floor(step * i + step * 0.3 + Math.random() * step * 0.4)
      ));
    }

    // Generate stars — Y positions concentrated toward vertical center
    const stars: TransitStar[] = [];
    let quoteIdx = 0;
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const isQuote = quoteIndices.has(i);
      const roll = Math.random();
      const baseColor = isQuote ? GREY_STAR : (roll < 0.7 ? GREY_STAR : ACCENT);
      stars.push({
        baseX: 0.08 + Math.random() * 0.84,
        baseY: sampleVerticalPosition(),
        size: isQuote ? 2.5 + Math.random() * 2 : 1 + Math.random() * 3.5,
        baseAlpha: isQuote ? 0.25 + Math.random() * 0.3 : 0.12 + Math.random() * 0.4,
        baseColor,
        fadeInTime: (i / PARTICLE_COUNT) * FADE_IN_DURATION * 0.85 + Math.random() * FADE_IN_DURATION * 0.15,
        funnelSpeed: 0.6 + Math.random() * 0.8,
        funnelDrift: 0.3 + Math.random() * 0.7,
        isQuoteStar: isQuote,
        quote: isQuote ? shuffledQuotes[quoteIdx++ % shuffledQuotes.length] : '',
      });
    }
    // Sort by fadeInTime so they appear sequentially
    stars.sort((a, b) => a.fadeInTime - b.fadeInTime);

    let prevTimestamp: number | null = null;
    let elapsed = elapsedOffset;
    let completed = false;

    function draw(timestamp: number) {
      if (prevTimestamp === null) prevTimestamp = timestamp;
      const dt = Math.min((timestamp - prevTimestamp) / 1000, 0.1);
      prevTimestamp = timestamp;
      elapsed += dt;

      const canvas = canvasRef.current;
      if (!canvas) { animRef.current = requestAnimationFrame(draw); return; }
      const ctx = canvas.getContext('2d');
      if (!ctx) { animRef.current = requestAnimationFrame(draw); return; }

      const w = parseFloat(canvas.style.width) || canvas.width;
      const h = parseFloat(canvas.style.height) || canvas.height;
      const mouse = mouseRef.current;

      ctx.clearRect(0, 0, w, h);

      const totalDuration = FADE_IN_DURATION + HOLD_DURATION + FUNNEL_DURATION;
      const funnelStart = FADE_IN_DURATION + HOLD_DURATION;

      // In galaxyOnly mode, cap elapsed at fade-in end (no funnel, no completion)
      const effectiveElapsed = galaxyOnly ? Math.min(elapsed, FADE_IN_DURATION) : elapsed;

      let newHoveredQuote: { text: string; x: number; y: number } | null = null;

      for (const star of stars) {
        // Fade-in: star appears when elapsed >= fadeInTime
        const fadeInT = Math.max(0, Math.min(1, (effectiveElapsed - star.fadeInTime) / 0.3));
        if (fadeInT <= 0) continue;

        let px = star.baseX * w;
        let py = star.baseY * h;
        let alpha = star.baseAlpha * easeOut(fadeInT);

        // Vertical edge falloff — reduce alpha near top/bottom
        const edgeDist = Math.min(star.baseY, 1 - star.baseY); // 0 at edge, 0.5 at center
        const edgeFade = Math.min(1, edgeDist / 0.15); // fade in the outer 15%
        alpha *= edgeFade;

        // Funnel whoosh phase — whoosh LEFT (only in full mode)
        if (!galaxyOnly && effectiveElapsed > funnelStart) {
          const fT = Math.min(1, (effectiveElapsed - funnelStart) / FUNNEL_DURATION);
          const accel = easeIn(fT);

          // Move LEFT (funnel out to the left)
          px -= accel * w * 1.5 * star.funnelSpeed;

          // Converge Y toward center (funnel narrowing)
          const centerY = h * 0.5;
          py += (centerY - py) * accel * star.funnelDrift;

          // Fade out
          alpha *= (1 - easeIn(fT * 0.9));
        }

        // Distance to cursor
        const mdx = px - mouse.x;
        const mdy = py - mouse.y;
        const mDist = Math.sqrt(mdx * mdx + mdy * mdy);

        if (star.isQuoteStar) {
          // Quote stars: NO repulsion — instead shift to blue on hover
          let cr = star.baseColor.r, cg = star.baseColor.g, cb = star.baseColor.b;
          let sz = star.size;

          const inHoverPhase = galaxyOnly || effectiveElapsed < funnelStart;
          if (mDist < QUOTE_HOVER_RADIUS && mDist > 0.1 && inHoverPhase) {
            const hoverT = 1 - mDist / QUOTE_HOVER_RADIUS;
            cr = Math.round(cr + (QUOTE_BLUE.r - cr) * hoverT);
            cg = Math.round(cg + (QUOTE_BLUE.g - cg) * hoverT);
            cb = Math.round(cb + (QUOTE_BLUE.b - cb) * hoverT);
            alpha = Math.min(1, alpha + hoverT * 0.4);
            sz += hoverT * 2;

            if (!newHoveredQuote || mDist < Math.sqrt(
              (newHoveredQuote.x - mouse.x) ** 2 + (newHoveredQuote.y - mouse.y) ** 2
            )) {
              newHoveredQuote = { text: star.quote, x: px, y: py };
            }
          }

          if (alpha < 0.01) continue;

          ctx.save();
          if (mDist < QUOTE_HOVER_RADIUS * 1.5 && inHoverPhase) {
            const glowT = Math.max(0, 1 - mDist / (QUOTE_HOVER_RADIUS * 1.5));
            ctx.shadowColor = `rgba(${QUOTE_BLUE.r}, ${QUOTE_BLUE.g}, ${QUOTE_BLUE.b}, ${glowT * 0.4})`;
            ctx.shadowBlur = 8 + glowT * 6;
          }
          ctx.fillStyle = `rgba(${cr}, ${cg}, ${cb}, ${alpha})`;
          ctx.fillRect(px - sz / 2, py - sz / 2, sz, sz);
          ctx.restore();
        } else {
          // Normal stars: repulse + orange shift
          if (mDist < REPULSE_RADIUS && mDist > 0.1) {
            const force = (1 - mDist / REPULSE_RADIUS) * REPULSE_STRENGTH;
            px += (mdx / mDist) * force;
            py += (mdy / mDist) * force;
          }

          if (alpha < 0.01) continue;

          let cr = star.baseColor.r, cg = star.baseColor.g, cb = star.baseColor.b;
          if (mDist < ORANGE_RADIUS && mDist > 0.1) {
            const orangeT = (1 - mDist / ORANGE_RADIUS);
            cr = Math.round(cr + (ORANGE.r - cr) * orangeT);
            cg = Math.round(cg + (ORANGE.g - cg) * orangeT);
            cb = Math.round(cb + (ORANGE.b - cb) * orangeT);
          }

          ctx.fillStyle = `rgba(${cr}, ${cg}, ${cb}, ${alpha})`;
          const sz = star.size;
          ctx.fillRect(px - sz / 2, py - sz / 2, sz, sz);
        }
      }

      // Update quote tooltip state
      const prev = activeQuoteRef.current;
      if (newHoveredQuote && (!prev || prev.text !== newHoveredQuote.text)) {
        activeQuoteRef.current = newHoveredQuote;
        setActiveQuote(newHoveredQuote);
      } else if (!newHoveredQuote && prev) {
        activeQuoteRef.current = null;
        setActiveQuote(null);
      }

      // Fire completion (only in full mode)
      if (!galaxyOnly && elapsed >= totalDuration && !completed) {
        completed = true;
        onCompleteRef.current();
        return;
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
  }, [resize, elapsedOffset, galaxyOnly]);

  return (
    <div className="h-full flex flex-col items-center justify-center relative">
      <div ref={containerRef} className="absolute inset-0">
        <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%' }} />
      </div>

      {/* Quote tooltip */}
      <AnimatePresence>
        {activeQuote && (
          <motion.div
            key={activeQuote.text}
            initial={{ opacity: 0, y: 4, filter: 'blur(3px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, filter: 'blur(3px)' }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="absolute z-20 pointer-events-none"
            style={{
              left: activeQuote.x,
              top: activeQuote.y - 28,
              transform: 'translateX(-50%)',
            }}
          >
            <span className="font-caption text-[9px] uppercase tracking-[0.25em] text-[#64A0DC] whitespace-nowrap">
              {activeQuote.text}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Text content — hidden in galaxyOnly mode */}
      {!galaxyOnly && (
        <div className="relative z-10 text-center">
          <motion.p
            initial={{ opacity: 0, y: 20, filter: 'blur(4px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="font-heading text-2xl font-semibold uppercase text-ops-text-primary tracking-wide"
          >
            Section Complete
          </motion.p>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
            className="font-caption text-[10px] uppercase tracking-[0.2em] text-ops-text-secondary/60 mt-2"
          >
            Section {chunkNumber} of {totalChunks}
          </motion.p>
          {showAnalyzing && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="font-caption text-[10px] uppercase tracking-[0.2em] text-ops-text-secondary/40 mt-3"
            >
              Analyzing responses...
            </motion.p>
          )}
        </div>
      )}
    </div>
  );
}
