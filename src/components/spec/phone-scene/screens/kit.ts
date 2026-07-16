/**
 * Shared drawing kit for the SPEC phone screens.
 *
 * Every screen is a pure draw of (ctx, progress) — helpers here never hold
 * state, never read clocks. All keyframe motion runs through win() = the
 * single OPS curve over a clamped window. Conventions (fonts, sizes, status
 * colors, card anatomy) mirror the platform scene's iOS-audited exemplars.
 *
 * All three brand families are real in canvas — registered by
 * hardware/canvas-fonts.ts before the first draw; the stacks below only
 * fall back if that registration failed.
 */

import { COLORS, LAYOUT, TIMING } from '../constants';
import { phase } from './chrome';

export const MOHAVE = "'Mohave', sans-serif";
export const MONO = "'JetBrains Mono', monospace";
/** Real screenTitle face — Cake Mono Light (OPSStyle.swift screenTitle). */
export const CAKE = "'Cake Mono', 'Mohave', sans-serif";

/** Eased keyframe window: 0 before start, OPS-curve 0→1 inside, 1 after. */
export const win = (t: number, start: number, end: number): number =>
  TIMING.easeOut(phase(t, start, end));

/** Amounts render whole-dollar — the real financial screens truncate cents.
 *  Always formatted, never raw numbers. */
export const fmtUSD = (n: number): string =>
  `$${Math.round(n).toLocaleString('en-US')}`;

/** Unit rates keep two decimals — the real per-unit price format. */
export const fmtRate = (n: number): string =>
  `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

/** Draw a single line of text. */
export function drawText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  font: string,
  color: string,
  progress = 1,
  align: CanvasTextAlign = 'left',
) {
  if (progress <= 0) return;
  ctx.save();
  ctx.globalAlpha = progress;
  ctx.font = font;
  ctx.fillStyle = color;
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  ctx.fillText(text, x, y);
  ctx.restore();
}

/** Screen title block: Cake Mono Light 28pt→53px (the real screenTitle)
 *  + optional mono sub-rows. Returns the y below the block. */
export function screenHeader(
  ctx: CanvasRenderingContext2D,
  title: string,
  subs: Array<{ text: string; color: string }> = [],
  alpha = 1,
): number {
  const p = LAYOUT.padding;
  if (alpha > 0) {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = COLORS.titleLine;
    ctx.font = `300 53px ${CAKE}`;
    ctx.fillText(title, p, 145); // breathing room below the status bar
    subs.forEach((sub, i) => {
      ctx.font = `22px ${MONO}`;
      ctx.fillStyle = sub.color;
      ctx.fillText(sub.text, p, 197 + i * 34);
    });
    ctx.restore();
  }
  return 197 + subs.length * 34;
}

/** `// SECTION` label — 22px mono, caption tier, uppercase by convention. */
export function sectionLabel(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  alpha = 1,
) {
  if (alpha <= 0) return;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.font = `22px ${MONO}`;
  ctx.fillStyle = 'rgba(255, 255, 255, 0.38)';
  ctx.fillText('//', x, y);
  ctx.fillStyle = COLORS.captionLine;
  ctx.fillText(text, x + 34, y);
  ctx.restore();
}

/** L1 card surface — fill + hairline border (the canvas approximation of
 *  the glass panel; blur is meaningless against a flat dark canvas). */
export function panel(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  alpha = 1,
  radius = LAYOUT.cardRadius,
) {
  if (alpha <= 0) return;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, radius);
  ctx.fillStyle = COLORS.cardFill;
  ctx.fill();
  ctx.strokeStyle = COLORS.border;
  ctx.lineWidth = LAYOUT.borderWidth;
  ctx.stroke();
  ctx.restore();
}

/** Status tag — the real OPSTag anatomy: tone text on tone-soft fill inside
 *  a tone-line border. 24px mono at canvas scale (tagLabel 12pt). Draws
 *  centered on (cx, cy) when align='center', else from left x. Returns width. */
export function tag(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  tone: string,
  alpha = 1,
  align: 'left' | 'center' | 'right' = 'left',
): number {
  ctx.save();
  ctx.font = `500 24px ${MONO}`;
  const textW = ctx.measureText(text).width;
  const padX = 18;
  const w = textW + padX * 2;
  const h = 40;
  if (alpha > 0) {
    const bx = align === 'center' ? x - w / 2 : align === 'right' ? x - w : x;
    ctx.globalAlpha = alpha;
    ctx.beginPath();
    ctx.roundRect(bx, y - h / 2, w, h, 8);
    ctx.fillStyle = toneAlpha(tone, 0.10);
    ctx.fill();
    ctx.strokeStyle = toneAlpha(tone, 0.30);
    ctx.lineWidth = LAYOUT.borderWidth;
    ctx.stroke();
    ctx.fillStyle = tone;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, bx + w / 2, y + 1);
  }
  ctx.restore();
  return w;
}

/** Hex tone → rgba at alpha. Accepts #RRGGBB only (all kit tones are). */
export function toneAlpha(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/** Hairline divider. */
export function divider(
  ctx: CanvasRenderingContext2D,
  x1: number,
  y: number,
  x2: number,
  alpha = 1,
) {
  if (alpha <= 0) return;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = COLORS.separator;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x1, y);
  ctx.lineTo(x2, y);
  ctx.stroke();
  ctx.restore();
}

/** Count-up number: eases toward `target` with the draw, always formatted. */
export function countUp(target: number, progress: number): number {
  return Math.round(target * TIMING.easeOut(progress));
}
