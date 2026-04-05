/**
 * Tailored Analysis Screen — Workflow diagram wireframe.
 * Represents the "we're analyzing your process" phase.
 */

import { COLORS, LAYOUT, TAILORED_COLORS } from '../constants';
import { phase, roundedRect, contentLine, statusBar, bottomNav } from './draw-helpers';
import type { TailoredScreenDrawParams } from './types';

export function drawTailoredAnalysis({ ctx, width, height, progress }: TailoredScreenDrawParams) {
  const p = LAYOUT.padding;
  const cw = width - p * 2;

  const structP = phase(progress, 0, 0.5);
  const contentP = phase(progress, 0.33, 0.83);
  const accentP = phase(progress, 0.67, 1.0);

  statusBar(ctx, width, structP);

  // Header
  contentLine(ctx, p, 60, 160, 6, TAILORED_COLORS.accentText, structP);
  contentLine(ctx, p, 78, 220, 9, COLORS.titleLine, structP);

  // Workflow diagram — boxes connected by lines
  const boxW = 140;
  const boxH = 56;
  const cx = width / 2;

  // Row 1: Lead
  const r1y = 130;
  roundedRect(ctx, cx - boxW / 2, r1y, boxW, boxH, LAYOUT.cardRadius, COLORS.cardFill, COLORS.border, structP);
  contentLine(ctx, cx - 40, r1y + 16, 80, 6, COLORS.titleLine, contentP);
  contentLine(ctx, cx - 30, r1y + 32, 60, 4, COLORS.captionLine, contentP);

  // Connector line
  if (structP > 0) {
    ctx.save();
    ctx.globalAlpha = structP;
    ctx.strokeStyle = COLORS.separator;
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(cx, r1y + boxH);
    ctx.lineTo(cx, r1y + boxH + 30);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();
  }

  // Row 2: Two boxes (split path)
  const r2y = r1y + boxH + 30;
  const halfBox = (cw - 20) / 2;

  roundedRect(ctx, p, r2y, halfBox, boxH, LAYOUT.cardRadius, COLORS.cardFill, COLORS.border, structP);
  contentLine(ctx, p + 14, r2y + 16, halfBox * 0.6, 6, COLORS.titleLine, contentP);
  contentLine(ctx, p + 14, r2y + 32, halfBox * 0.4, 4, COLORS.captionLine, contentP);

  roundedRect(ctx, p + halfBox + 20, r2y, halfBox, boxH, LAYOUT.cardRadius, COLORS.cardFill, COLORS.border, structP);
  contentLine(ctx, p + halfBox + 34, r2y + 16, halfBox * 0.6, 6, COLORS.titleLine, contentP);
  contentLine(ctx, p + halfBox + 34, r2y + 32, halfBox * 0.4, 4, COLORS.captionLine, contentP);

  // Connector lines from top to both boxes
  if (structP > 0) {
    ctx.save();
    ctx.globalAlpha = structP;
    ctx.strokeStyle = COLORS.separator;
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 4]);

    // Left branch
    ctx.beginPath();
    ctx.moveTo(cx, r2y);
    ctx.lineTo(p + halfBox / 2, r2y);
    ctx.stroke();

    // Right branch
    ctx.beginPath();
    ctx.moveTo(cx, r2y);
    ctx.lineTo(p + halfBox + 20 + halfBox / 2, r2y);
    ctx.stroke();

    // Down connectors
    ctx.beginPath();
    ctx.moveTo(p + halfBox / 2, r2y + boxH);
    ctx.lineTo(p + halfBox / 2, r2y + boxH + 30);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(p + halfBox + 20 + halfBox / 2, r2y + boxH);
    ctx.lineTo(p + halfBox + 20 + halfBox / 2, r2y + boxH + 30);
    ctx.stroke();

    ctx.setLineDash([]);
    ctx.restore();
  }

  // Row 3: Merge back to one
  const r3y = r2y + boxH + 30;
  roundedRect(ctx, cx - boxW / 2, r3y, boxW, boxH, LAYOUT.cardRadius, COLORS.cardFill, COLORS.border, structP);
  contentLine(ctx, cx - 40, r3y + 16, 80, 6, COLORS.titleLine, contentP);
  contentLine(ctx, cx - 30, r3y + 32, 60, 4, COLORS.captionLine, contentP);

  // Row 4: Final
  if (structP > 0) {
    ctx.save();
    ctx.globalAlpha = structP;
    ctx.strokeStyle = COLORS.separator;
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(cx, r3y + boxH);
    ctx.lineTo(cx, r3y + boxH + 30);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();
  }

  const r4y = r3y + boxH + 30;
  // This one uses accent to show "custom module opportunity"
  roundedRect(ctx, cx - boxW / 2, r4y, boxW, boxH, LAYOUT.cardRadius, TAILORED_COLORS.accentGlow, TAILORED_COLORS.accentBorder, accentP);
  contentLine(ctx, cx - 40, r4y + 16, 80, 6, TAILORED_COLORS.accentText, accentP);
  contentLine(ctx, cx - 30, r4y + 32, 60, 4, COLORS.bodyLine, accentP);

  // Bottom: analysis progress indicator
  const barY = r4y + boxH + 50;
  roundedRect(ctx, p, barY, cw, 12, 6, COLORS.cardFill, COLORS.border, contentP);
  if (accentP > 0) {
    ctx.save();
    ctx.globalAlpha = accentP;
    ctx.fillStyle = TAILORED_COLORS.accentOverlayStrong;
    ctx.beginPath();
    ctx.roundRect(p + 1, barY + 1, (cw - 2) * 0.72, 10, 5);
    ctx.fill();
    ctx.restore();
  }
  contentLine(ctx, p, barY + 22, 120, 5, COLORS.captionLine, contentP);

  bottomNav(ctx, width, height, structP);
}
