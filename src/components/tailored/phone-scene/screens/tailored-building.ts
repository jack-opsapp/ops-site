/**
 * Tailored Building Screen — Modules being assembled with real names.
 */

import { COLORS, LAYOUT, TAILORED_COLORS, TEXT, CONTENT_PADDING, CARD_PADDING, TOP_INSET } from '../constants';
import {
  phase, roundedRect, drawText, drawCheck,
  statusBar, bottomNav, FONTS,
} from './draw-helpers';
import type { TailoredScreenDrawParams } from './types';

const P = CONTENT_PADDING;
const CP = CARD_PADDING;

export function drawTailoredBuilding({ ctx, width, height, progress }: TailoredScreenDrawParams) {
  const cw = width - P * 2;
  const lx = P + CP;

  const structP = phase(progress, 0, 0.4);
  const contentP = phase(progress, 0.2, 0.65);
  const accentP = phase(progress, 0.5, 1.0);

  statusBar(ctx, width, structP);

  // Header
  drawText(ctx, 'BUILDING', P, TOP_INSET, FONTS.caption, TAILORED_COLORS.accentText, structP);
  drawText(ctx, 'Assembling Your OPS', P, TOP_INSET + 38, FONTS.title, TEXT.primary, structP);

  // Base modules
  const baseModules = [
    { name: 'Project Management', desc: 'Pipeline, scheduling, tasks' },
    { name: 'Invoicing & Payments', desc: 'Estimates, invoices, deposits' },
    { name: 'Team Management', desc: 'Crew assignment, availability' },
  ];

  const cardH = 96;
  let blockY = TOP_INSET + 80;
  baseModules.forEach((mod, i) => {
    const bP = phase(contentP, i * 0.1, i * 0.1 + 0.6);
    roundedRect(ctx, P, blockY, cw, cardH, LAYOUT.cardRadius, COLORS.cardFill, COLORS.border, structP);
    drawCheck(ctx, lx, blockY + 34, 14, COLORS.stageAccepted, bP);
    drawText(ctx, mod.name, lx + 28, blockY + 34, FONTS.bodyMed, TEXT.primary, bP);
    drawText(ctx, mod.desc, lx + 28, blockY + 68, FONTS.labelSm, TEXT.tertiary, bP);
    blockY += cardH + 14;
  });

  // Divider
  const divY = blockY + 8;
  if (contentP > 0) {
    ctx.save();
    ctx.globalAlpha = contentP * 0.2;
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1;
    ctx.setLineDash([8, 8]);
    ctx.beginPath();
    ctx.moveTo(P, divY);
    ctx.lineTo(P + cw, divY);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();
  }
  drawText(ctx, 'Building your modules...', P + cw / 2, divY + 28, FONTS.labelSm, TEXT.tertiary, contentP, 'center');

  // Custom modules
  const customModules = ['Deck Designer', 'Material Calculator', 'Client Portal'];
  const modH = 86;
  let modY = divY + 60;

  customModules.forEach((name, i) => {
    const modP = phase(accentP, i * 0.15, i * 0.15 + 0.5);

    if (modP > 0) {
      ctx.save();
      ctx.globalAlpha = modP;
      ctx.fillStyle = TAILORED_COLORS.accentGlow;
      ctx.beginPath();
      ctx.roundRect(P, modY, cw, modH, LAYOUT.smallRadius);
      ctx.fill();
      ctx.strokeStyle = TAILORED_COLORS.accentBorder;
      ctx.lineWidth = 2;
      ctx.stroke();

      const dx = lx + 2;
      const dy = modY + modH / 2;
      ctx.fillStyle = TAILORED_COLORS.accentOverlayStrong;
      ctx.beginPath();
      ctx.moveTo(dx, dy - 7);
      ctx.lineTo(dx + 7, dy);
      ctx.lineTo(dx, dy + 7);
      ctx.lineTo(dx - 7, dy);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    drawText(ctx, name, lx + 28, modY + modH / 2, FONTS.bodyMed, TAILORED_COLORS.accentText, modP);
    modY += modH + 12;
  });

  // Progress bar
  const barY = modY + 24;
  roundedRect(ctx, P, barY, cw, 14, 7, COLORS.cardFill, COLORS.border, contentP);
  if (accentP > 0) {
    ctx.save();
    ctx.globalAlpha = accentP;
    ctx.fillStyle = TAILORED_COLORS.accentOverlayStrong;
    ctx.beginPath();
    ctx.roundRect(P + 2, barY + 2, (cw - 4) * 0.68, 10, 5);
    ctx.fill();
    ctx.restore();
  }
  drawText(ctx, '68% complete', P, barY + 32, FONTS.labelSm, TEXT.tertiary, accentP);

  if (accentP > 0) {
    const dotPhase = (Date.now() % 1500) / 1500;
    for (let i = 0; i < 3; i++) {
      const dotAlpha = Math.max(0, Math.sin((dotPhase + i * 0.3) * Math.PI)) * accentP;
      ctx.save();
      ctx.globalAlpha = dotAlpha;
      ctx.fillStyle = TAILORED_COLORS.accentText;
      ctx.beginPath();
      ctx.arc(P + 156 + i * 14, barY + 34, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  bottomNav(ctx, width, height, structP);
}
