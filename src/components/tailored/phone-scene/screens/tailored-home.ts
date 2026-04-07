/**
 * Tailored Home Screen — Base OPS platform with real text.
 */

import { COLORS, LAYOUT, TEXT, CONTENT_PADDING, CARD_PADDING, TOP_INSET } from '../constants';
import {
  phase, roundedRect, drawText,
  statusBar, bottomNav, FONTS,
} from './draw-helpers';
import type { TailoredScreenDrawParams } from './types';

const P = CONTENT_PADDING;
const CP = CARD_PADDING;

export function drawTailoredHome({ ctx, width, height, progress }: TailoredScreenDrawParams) {
  const cw = width - P * 2;
  const lx = P + CP;
  const rx = P + cw - CP;

  const structP = phase(progress, 0, 0.45);
  const contentP = phase(progress, 0.25, 0.75);
  const accentP = phase(progress, 0.55, 1.0);

  statusBar(ctx, width, structP);

  // Header
  drawText(ctx, 'Good morning,', P, TOP_INSET, FONTS.body, TEXT.secondary, structP);
  drawText(ctx, 'Pete', P, TOP_INSET + 38, FONTS.titleLg, TEXT.primary, structP);

  // Avatar
  if (structP > 0) {
    ctx.save();
    ctx.globalAlpha = structP;
    ctx.fillStyle = 'rgba(255,255,255,0.06)';
    ctx.strokeStyle = 'rgba(255,255,255,0.12)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(P + cw - 28, TOP_INSET + 16, 26, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    drawText(ctx, 'PM', P + cw - 28, TOP_INSET + 18, FONTS.labelSm, TEXT.tertiary, 1, 'center');
    ctx.restore();
  }

  // Map area
  const mapY = TOP_INSET + 70;
  roundedRect(ctx, P, mapY, cw, 280, LAYOUT.cardRadius, COLORS.cardFill, COLORS.border, structP);
  drawText(ctx, 'MAP VIEW', lx, mapY + 28, FONTS.labelXs, TEXT.muted, contentP);

  // Map pins
  if (accentP > 0) {
    const pins = [
      { x: P + cw * 0.3, y: mapY + 120, label: 'Smith' },
      { x: P + cw * 0.6, y: mapY + 160, label: 'Johnson' },
      { x: P + cw * 0.42, y: mapY + 210, label: 'Miller' },
    ];
    for (const pin of pins) {
      ctx.save();
      ctx.globalAlpha = accentP;
      ctx.fillStyle = COLORS.accentGlow;
      ctx.beginPath();
      ctx.arc(pin.x, pin.y, LAYOUT.pinSize, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = COLORS.accent;
      ctx.beginPath();
      ctx.arc(pin.x, pin.y, LAYOUT.pinSize / 2, 0, Math.PI * 2);
      ctx.fill();
      drawText(ctx, pin.label, pin.x, pin.y - 18, FONTS.labelXs, TEXT.primary, 1, 'center');
      ctx.restore();
    }
  }

  // Filter chips
  const chipY = mapY + 300;
  const chips = ['All', 'Active', 'Quoted', 'Done'];
  let chipX = P;
  chips.forEach((label, i) => {
    const isActive = i === 0;
    const w = 92;
    roundedRect(ctx, chipX, chipY, w, 36, 18,
      isActive ? 'rgba(89, 119, 148, 0.15)' : COLORS.cardFill,
      isActive ? 'rgba(89, 119, 148, 0.3)' : COLORS.border,
      contentP,
    );
    drawText(ctx, label, chipX + w / 2, chipY + 18, FONTS.labelSm,
      isActive ? COLORS.accent : TEXT.secondary, contentP, 'center');
    chipX += w + 12;
  });

  // Project cards
  const projects = [
    { name: 'Smith Residence', status: 'In Progress', color: COLORS.stageInProgress, addr: '1847 Oak Ridge Dr' },
    { name: 'Johnson Deck', status: 'Quoted', color: COLORS.stageEstimated, addr: '2301 Maple Ave' },
    { name: 'Miller Patio', status: 'Accepted', color: COLORS.stageAccepted, addr: '456 Pine St' },
  ];

  let cardY = chipY + 56;
  const cardH = 124;
  projects.forEach((proj, i) => {
    const cP = phase(contentP, i * 0.1, i * 0.1 + 0.6);
    roundedRect(ctx, P, cardY, cw, cardH, LAYOUT.cardRadius, COLORS.cardFill, COLORS.border, cP);

    // Colored left border
    if (accentP > 0) {
      ctx.save();
      ctx.globalAlpha = accentP;
      ctx.fillStyle = proj.color;
      ctx.beginPath();
      ctx.roundRect(P, cardY, 6, cardH, [LAYOUT.cardRadius, 0, 0, LAYOUT.cardRadius]);
      ctx.fill();
      ctx.restore();
    }

    const clx = lx + 6;
    drawText(ctx, proj.name, clx, cardY + 40, FONTS.bodyMed, TEXT.primary, cP);
    drawText(ctx, proj.addr, clx, cardY + 80, FONTS.labelSm, TEXT.tertiary, cP);

    const badgeW = 122;
    const badgeX = rx - badgeW;
    roundedRect(ctx, badgeX, cardY + 30, badgeW, 32, 4, 'rgba(255,255,255,0.03)', undefined, accentP);
    drawText(ctx, proj.status, badgeX + badgeW / 2, cardY + 46, FONTS.labelXs, proj.color, accentP, 'center');

    cardY += cardH + 14;
  });

  bottomNav(ctx, width, height, structP);
}
