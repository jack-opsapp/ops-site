/**
 * Tailored Building Screen — Modules being assembled.
 * Stacked blocks appearing with progress animation.
 */

import { COLORS, LAYOUT, TAILORED_COLORS } from '../constants';
import { phase, roundedRect, contentLine, accentBlock, statusBar, bottomNav } from './draw-helpers';
import type { TailoredScreenDrawParams } from './types';

export function drawTailoredBuilding({ ctx, width, height, progress }: TailoredScreenDrawParams) {
  const p = LAYOUT.padding;
  const cw = width - p * 2;

  const structP = phase(progress, 0, 0.5);
  const contentP = phase(progress, 0.25, 0.75);
  const accentP = phase(progress, 0.5, 1.0);

  statusBar(ctx, width, structP);

  // Header
  contentLine(ctx, p, 60, 120, 6, TAILORED_COLORS.accentText, structP);
  contentLine(ctx, p, 78, 180, 9, COLORS.titleLine, structP);

  // Base platform blocks (existing OPS features — draw first, static)
  const baseBlocks = [
    { label: 0.4, y: 120, h: 52 },
    { label: 0.35, y: 182, h: 52 },
    { label: 0.45, y: 244, h: 52 },
  ];

  for (const block of baseBlocks) {
    roundedRect(ctx, p, block.y, cw, block.h, LAYOUT.cardRadius, COLORS.cardFill, COLORS.border, structP);
    contentLine(ctx, p + 16, block.y + 16, cw * block.label, 6, COLORS.bodyLine, contentP);
    contentLine(ctx, p + 16, block.y + 32, cw * (block.label - 0.1), 4, COLORS.captionLine, contentP);
  }

  // Divider: "Building your modules..."
  const divY = 316;
  if (contentP > 0) {
    ctx.save();
    ctx.globalAlpha = contentP;
    ctx.strokeStyle = COLORS.separator;
    ctx.lineWidth = 1;
    ctx.setLineDash([6, 6]);
    ctx.beginPath();
    ctx.moveTo(p, divY);
    ctx.lineTo(p + cw, divY);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();
  }

  // Custom module blocks — appear with accent animation staggered
  const modules = [
    { y: 340, delay: 0.0, w: 0.55 },
    { y: 400, delay: 0.15, w: 0.5 },
    { y: 460, delay: 0.3, w: 0.6 },
  ];

  for (const mod of modules) {
    const modP = phase(accentP, mod.delay, mod.delay + 0.5);
    accentBlock(ctx, p, mod.y, cw, 48, modP);
  }

  // Progress text at bottom
  contentLine(ctx, p, 530, 140, 5, COLORS.captionLine, accentP);

  // Animated dots
  if (accentP > 0) {
    const dotPhase = (Date.now() % 1500) / 1500;
    for (let i = 0; i < 3; i++) {
      const dotAlpha = Math.max(0, Math.sin((dotPhase + i * 0.3) * Math.PI)) * accentP;
      ctx.save();
      ctx.globalAlpha = dotAlpha;
      ctx.fillStyle = TAILORED_COLORS.accentText;
      ctx.beginPath();
      ctx.arc(p + 152 + i * 12, 533, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  bottomNav(ctx, width, height, structP);
}
