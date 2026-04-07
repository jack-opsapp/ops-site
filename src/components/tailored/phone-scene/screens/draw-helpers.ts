/**
 * Shared drawing helpers for tailored phone screens.
 * Simpler than the platform helpers — focused on wireframe rectangles,
 * lines, and accent overlays.
 */

import { COLORS, LAYOUT, TIMING, TAILORED_COLORS } from '../constants';

// --- Font constants for canvas text ---
const MOHAVE = 'Mohave, sans-serif';
const KOSUGI = 'Kosugi, sans-serif';

export const FONTS = {
  labelXs: `400 18px ${MOHAVE}`,
  labelSm: `500 22px ${MOHAVE}`,
  caption: `500 26px ${MOHAVE}`,
  body: `300 30px ${MOHAVE}`,
  bodyMed: `500 30px ${MOHAVE}`,
  title: `600 36px ${MOHAVE}`,
  titleLg: `600 44px ${MOHAVE}`,
  heading: `700 52px ${KOSUGI}`,
  price: `700 42px ${MOHAVE}`,
} as const;

/** Draw canvas text */
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

/** Draw text that wraps within maxWidth. Returns the y position after the last line. */
export function drawWrappedText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  font: string,
  color: string,
  progress = 1,
): number {
  if (progress <= 0) return y;
  ctx.save();
  ctx.globalAlpha = progress;
  ctx.font = font;
  ctx.fillStyle = color;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';

  const words = text.split(' ');
  let line = '';
  let cy = y;

  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      ctx.fillText(line, x, cy);
      line = word;
      cy += lineHeight;
    } else {
      line = test;
    }
  }
  if (line) {
    ctx.fillText(line, x, cy);
    cy += lineHeight;
  }

  ctx.restore();
  return cy;
}

/** Draw a small checkmark icon */
export function drawCheck(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  color: string,
  progress = 1,
) {
  if (progress <= 0) return;
  ctx.save();
  ctx.globalAlpha = progress;
  ctx.strokeStyle = color;
  ctx.lineWidth = 2.5;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + size * 0.35, y + size * 0.35);
  ctx.lineTo(x + size, y - size * 0.25);
  ctx.stroke();
  ctx.restore();
}

/** Phase-based progress: returns 0-1 within a sub-range of total progress */
export function phase(progress: number, start: number, end: number): number {
  if (progress <= start) return 0;
  if (progress >= end) return 1;
  return TIMING.easeOut((progress - start) / (end - start));
}

/** Draw a rounded rectangle */
export function roundedRect(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number,
  r: number, fill?: string, stroke?: string, progress = 1
) {
  if (progress <= 0) return;
  ctx.save();
  ctx.globalAlpha = progress;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
  if (fill) { ctx.fillStyle = fill; ctx.fill(); }
  if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = 1.5; ctx.stroke(); }
  ctx.restore();
}

/** Draw a content line (simulates text) */
export function contentLine(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number,
  color: string, progress = 1
) {
  if (progress <= 0) return;
  ctx.save();
  ctx.globalAlpha = progress;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, h / 2);
  ctx.fill();
  ctx.restore();
}

/** Draw an accent-highlighted module block */
export function accentBlock(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number,
  progress = 1
) {
  if (progress <= 0) return;
  ctx.save();
  ctx.globalAlpha = progress;

  // Background
  ctx.fillStyle = TAILORED_COLORS.accentGlow;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, LAYOUT.smallRadius);
  ctx.fill();

  // Border
  ctx.strokeStyle = TAILORED_COLORS.accentBorder;
  ctx.lineWidth = 2;
  ctx.stroke();

  // Content line inside
  ctx.fillStyle = TAILORED_COLORS.accentText;
  ctx.beginPath();
  ctx.roundRect(x + 12, y + h / 2 - 3, w * 0.5, 6, 3);
  ctx.fill();

  // Small diamond icon
  const dx = x + w - 20, dy = y + h / 2;
  ctx.fillStyle = TAILORED_COLORS.accentOverlayStrong;
  ctx.beginPath();
  ctx.moveTo(dx, dy - 5);
  ctx.lineTo(dx + 5, dy);
  ctx.lineTo(dx, dy + 5);
  ctx.lineTo(dx - 5, dy);
  ctx.closePath();
  ctx.fill();

  ctx.restore();
}

/** Draw the OPS status bar (time, signal, battery) */
export function statusBar(ctx: CanvasRenderingContext2D, width: number, progress = 1) {
  if (progress <= 0) return;
  ctx.save();
  ctx.globalAlpha = progress * 0.4;
  contentLine(ctx, LAYOUT.padding, 16, 60, 5, COLORS.bodyLine, 1);
  contentLine(ctx, width - LAYOUT.padding - 80, 16, 80, 5, COLORS.bodyLine, 1);
  ctx.restore();
}

/** Draw a simple bottom nav bar */
export function bottomNav(ctx: CanvasRenderingContext2D, width: number, height: number, progress = 1) {
  if (progress <= 0) return;
  const y = height - LAYOUT.tabBarHeight;
  ctx.save();
  ctx.globalAlpha = progress;
  ctx.fillStyle = COLORS.background;
  ctx.fillRect(0, y, width, LAYOUT.tabBarHeight);
  ctx.strokeStyle = COLORS.separator;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, y);
  ctx.lineTo(width, y);
  ctx.stroke();

  // 4 tab dots
  const tabWidth = width / 4;
  for (let i = 0; i < 4; i++) {
    const cx = tabWidth * i + tabWidth / 2;
    ctx.fillStyle = i === 0 ? COLORS.accent : COLORS.captionLine;
    ctx.beginPath();
    ctx.arc(cx, y + 40, 8, 0, Math.PI * 2);
    ctx.fill();
    contentLine(ctx, cx - 20, y + 60, 40, 4, i === 0 ? COLORS.accent : COLORS.captionLine, 1);
  }
  ctx.restore();
}
