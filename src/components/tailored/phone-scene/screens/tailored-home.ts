/**
 * Tailored Home Screen — Standard OPS wireframe.
 * Shows the base platform the client's custom build lives on.
 */

import { COLORS, LAYOUT } from '../constants';
import { phase, roundedRect, contentLine, statusBar, bottomNav } from './draw-helpers';
import type { TailoredScreenDrawParams } from './types';

export function drawTailoredHome({ ctx, width, height, progress }: TailoredScreenDrawParams) {
  const p = LAYOUT.padding;
  const cw = width - p * 2;

  const structP = phase(progress, 0, 0.5);
  const contentP = phase(progress, 0.33, 0.83);
  const accentP = phase(progress, 0.67, 1.0);

  // Status bar
  statusBar(ctx, width, structP);

  // Header area
  contentLine(ctx, p, 60, 120, 8, COLORS.titleLine, structP);
  contentLine(ctx, p, 78, 80, 5, COLORS.captionLine, contentP);

  // Map area (large rounded rect)
  roundedRect(ctx, p, 110, cw, 280, LAYOUT.cardRadius, COLORS.cardFill, COLORS.border, structP);

  // Map pins
  if (accentP > 0) {
    const pins = [
      { x: p + cw * 0.3, y: 220 },
      { x: p + cw * 0.6, y: 260 },
      { x: p + cw * 0.45, y: 310 },
    ];
    for (const pin of pins) {
      ctx.save();
      ctx.globalAlpha = accentP;
      ctx.fillStyle = COLORS.accent;
      ctx.beginPath();
      ctx.arc(pin.x, pin.y, LAYOUT.pinSize / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  // Filter chips below map
  const chipY = 410;
  const chips = [65, 80, 55, 70];
  let chipX = p;
  for (const w of chips) {
    roundedRect(ctx, chipX, chipY, w, 28, 14, COLORS.cardFill, COLORS.border, contentP);
    contentLine(ctx, chipX + 10, chipY + 11, w - 20, 5, COLORS.bodyLine, contentP);
    chipX += w + 8;
  }

  // Project cards
  const cardY = 460;
  for (let i = 0; i < 3; i++) {
    const y = cardY + i * 90;
    roundedRect(ctx, p, y, cw, 78, LAYOUT.cardRadius, COLORS.cardFill, COLORS.border, contentP);

    // Colored left border
    if (accentP > 0) {
      const colors = [COLORS.stageEstimated, COLORS.stageAccepted, COLORS.stageInProgress];
      ctx.save();
      ctx.globalAlpha = accentP;
      ctx.fillStyle = colors[i];
      ctx.beginPath();
      ctx.roundRect(p, y, 6, 78, [LAYOUT.cardRadius, 0, 0, LAYOUT.cardRadius]);
      ctx.fill();
      ctx.restore();
    }

    // Card content lines
    contentLine(ctx, p + 20, y + 18, cw * 0.45, 7, COLORS.titleLine, contentP);
    contentLine(ctx, p + 20, y + 35, cw * 0.3, 5, COLORS.bodyLine, contentP);
    contentLine(ctx, p + 20, y + 52, cw * 0.5, 5, COLORS.captionLine, contentP);

    // Status badge right
    roundedRect(ctx, p + cw - 70, y + 14, 56, 22, 4, COLORS.cardFill, undefined, accentP);
    contentLine(ctx, p + cw - 62, y + 22, 40, 5, COLORS.captionLine, accentP);
  }

  // Bottom nav
  bottomNav(ctx, width, height, structP);
}
