/**
 * Home screen wireframe — Map view with project carousel.
 * Reference: Screenshot IMG_6161.PNG (Home tab)
 * Data: Pete Mitchell / MAVERICK PROJECTS LTD from Supabase
 */

import { COLORS, LAYOUT, TIMING } from '../constants';
import {
  drawRoundedRect,
  drawCircle,
  drawColoredLeftBorder,
  drawMapPin,
  phase,
} from '../draw-utils';
import type { ScreenDrawParams } from './types';

// --- Font constants (match next/font/google loaded on the page) ---
const MOHAVE = 'Mohave, sans-serif';
const KOSUGI = 'Kosugi, sans-serif';

// Road network as fractional coordinates — [xFrac of canvas width, yFrac of map height]
const ROAD_NETWORK: { points: [number, number][] }[] = [
  { points: [[0, 0.3], [0.3, 0.28], [0.6, 0.35], [1, 0.32]] },
  { points: [[0, 0.6], [0.4, 0.58], [0.7, 0.65], [1, 0.6]] },
  { points: [[0, 0.85], [0.3, 0.82], [1, 0.88]] },
  { points: [[0.25, 0], [0.27, 0.5], [0.24, 1]] },
  { points: [[0.55, 0], [0.53, 0.4], [0.56, 1]] },
  { points: [[0.8, 0], [0.78, 0.6], [0.82, 1]] },
  { points: [[0, 0.1], [0.5, 0.5], [1, 0.45]] },
  { points: [[0.1, 1], [0.4, 0.4], [0.9, 0.15]] },
];

// --- Helper: draw text with consistent style ---
function drawText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  font: string,
  color: string,
  progress: number,
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

export function drawHomeScreen({ ctx, width, height, progress }: ScreenDrawParams) {
  const p = LAYOUT.padding;
  const contentWidth = width - p * 2;

  // --- Structure phase ---
  const structP = phase(progress, TIMING.structurePhase[0], TIMING.structurePhase[1]);

  // Greeting — "GOOD AFTERNOON, PETE"
  drawText(ctx, 'GOOD AFTERNOON, PETE', p, 82, `bold 38px ${MOHAVE}`, COLORS.titleLine, structP);

  // Company line — "MAVERICK PROJECTS LTD" + green trial dot + "TRIAL ENDS Apr 10"
  drawText(ctx, 'MAVERICK PROJECTS LTD', p, 118, `14px ${KOSUGI}`, COLORS.captionLine, structP);
  if (structP > 0) {
    ctx.save();
    ctx.globalAlpha = structP;
    // Green dot
    ctx.beginPath();
    ctx.arc(p + 275, 118, 4, 0, Math.PI * 2);
    ctx.fillStyle = COLORS.stageAccepted;
    ctx.fill();
    // Trial text
    ctx.font = `14px ${KOSUGI}`;
    ctx.fillStyle = COLORS.stageAccepted;
    ctx.textBaseline = 'middle';
    ctx.fillText('TRIAL ENDS Apr 10', p + 288, 118);
    ctx.restore();
  }

  // Notification bell circle (left of avatar)
  drawCircle(ctx, width - p - 85, 85, 24, COLORS.border, undefined, structP);
  // Bell icon stroke inside
  if (structP > 0) {
    ctx.save();
    ctx.globalAlpha = structP * 0.5;
    ctx.strokeStyle = COLORS.bodyLine;
    ctx.lineWidth = 1.5;
    const bx = width - p - 85, by = 85;
    // Bell body
    ctx.beginPath();
    ctx.moveTo(bx - 8, by + 4);
    ctx.quadraticCurveTo(bx - 8, by - 10, bx, by - 12);
    ctx.quadraticCurveTo(bx + 8, by - 10, bx + 8, by + 4);
    ctx.lineTo(bx + 10, by + 6);
    ctx.lineTo(bx - 10, by + 6);
    ctx.closePath();
    ctx.stroke();
    // Clapper
    ctx.beginPath();
    ctx.arc(bx, by + 10, 3, 0, Math.PI);
    ctx.stroke();
    ctx.restore();
  }

  // Avatar circle (top right)
  drawCircle(ctx, width - p - 32, 85, 34, COLORS.border, COLORS.cardFill, structP);

  // --- Carousel card ---
  const cardY = 152;
  const cardH = 160;
  drawRoundedRect(ctx, p, cardY, contentWidth, cardH, LAYOUT.cardRadius, COLORS.border, COLORS.cardFill, structP);

  // Colored left border (accent — project stage indicator)
  drawColoredLeftBorder(ctx, p, cardY, cardH, COLORS.accent, phase(progress, TIMING.accentPhase[0], TIMING.accentPhase[1]));

  // --- Content phase ---
  const contentP = phase(progress, TIMING.contentPhase[0], TIMING.contentPhase[1]);

  // Project title
  drawText(ctx, 'RUNWAY CRACK REPAIR', p + 24, cardY + 40, `bold 26px ${MOHAVE}`, COLORS.titleLine, contentP);

  // Client name
  drawText(ctx, 'Miramar Flight Academy', p + 24, cardY + 70, `15px ${KOSUGI}`, COLORS.bodyLine, contentP);

  // Address
  drawText(ctx, '9800 Anderson St, San Diego', p + 24, cardY + 95, `14px ${KOSUGI}`, COLORS.captionLine, contentP);

  // Stage badge — "DIAGNOSTIC"
  const badgeText = 'DIAGNOSTIC';
  const badgeW = 140;
  const badgeH = 30;
  const badgeX = width - p - badgeW - 16;
  const badgeY = cardY + cardH - 48;
  drawRoundedRect(ctx, badgeX, badgeY, badgeW, badgeH, LAYOUT.smallRadius, COLORS.border, undefined, contentP);
  drawText(ctx, badgeText, badgeX + badgeW / 2, badgeY + badgeH / 2, `bold 13px ${KOSUGI}`, COLORS.captionLine, contentP, 'center');

  // Carousel dots — inside the card, top-right (5 dots, last one accent)
  const dotSpacing = 22;
  const dotStartX = width - p - 28 - (4 * dotSpacing);
  const dotY = cardY + 30;
  for (let i = 0; i < 5; i++) {
    const isActive = i === 4;
    const dotColor = isActive ? COLORS.accent : 'rgba(255, 255, 255, 0.20)';
    drawCircle(ctx, dotStartX + i * dotSpacing, dotY, 7, dotColor, dotColor, contentP);
  }

  // --- Filter chips ---
  const chipY = cardY + cardH + 20;
  const chips = ['TODAY [TASKS]', 'ACTIVE', 'ALL'];
  const chipWidths = [170, 100, 65];
  let chipX = p;
  for (let i = 0; i < 3; i++) {
    const isSelected = i === 0;
    const fill = isSelected ? 'rgba(255,255,255,0.06)' : undefined;
    const stroke = isSelected ? COLORS.accent : COLORS.border;
    drawRoundedRect(ctx, chipX, chipY, chipWidths[i], 40, LAYOUT.smallRadius, stroke, fill, contentP);
    drawText(ctx, chips[i], chipX + chipWidths[i] / 2, chipY + 21, `bold 13px ${KOSUGI}`, isSelected ? COLORS.bodyLine : COLORS.captionLine, contentP, 'center');
    chipX += chipWidths[i] + 12;
  }

  // --- Map area ---
  const mapY = chipY + 56;
  const mapH = LAYOUT.tabBarY - mapY - 10;

  // Road network lines
  const roadAlpha = phase(progress, 0.2, 0.7);
  if (roadAlpha > 0) {
    ctx.save();
    ctx.globalAlpha = 0.12 * roadAlpha;
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 1;
    for (const road of ROAD_NETWORK) {
      ctx.beginPath();
      const x0 = road.points[0][0] * width;
      const y0 = mapY + road.points[0][1] * mapH;
      ctx.moveTo(x0, y0);
      for (let i = 1; i < road.points.length; i++) {
        const px = road.points[i][0] * width;
        const py = mapY + road.points[i][1] * mapH;
        if (i < road.points.length - 1) {
          const nx = road.points[i + 1][0] * width;
          const ny = mapY + road.points[i + 1][1] * mapH;
          ctx.quadraticCurveTo(px, py, (px + nx) / 2, (py + ny) / 2);
        } else {
          ctx.lineTo(px, py);
        }
      }
      ctx.stroke();
    }
    ctx.restore();
  }

  // --- Accent phase — pins, labels, map buttons ---
  const accentP = phase(progress, TIMING.accentPhase[0], TIMING.accentPhase[1]);

  // Map pins
  drawMapPin(ctx, width * 0.45, mapY + mapH * 0.52, accentP);
  drawMapPin(ctx, width * 0.7, mapY + mapH * 0.28, accentP);
  drawMapPin(ctx, width * 0.22, mapY + mapH * 0.7, accentP);

  // Pin label — "Diagnostic" + "Runway Crack Repair" above center pin
  const pinLabelX = width * 0.45;
  const pinLabelY = mapY + mapH * 0.52;
  drawText(ctx, 'Diagnostic', pinLabelX, pinLabelY - 38, `bold 14px ${KOSUGI}`, COLORS.captionLine, accentP, 'center');
  drawText(ctx, 'Runway Crack Repair', pinLabelX, pinLabelY - 22, `12px ${KOSUGI}`, 'rgba(255,255,255,0.20)', accentP, 'center');

  // Location arrow button (right side of map)
  const btnX = width - p - 32;
  const btnBaseY = mapY + mapH * 0.40;
  drawCircle(ctx, btnX, btnBaseY, 28, COLORS.border, COLORS.cardFill, accentP);
  // Arrow stroke inside
  if (accentP > 0) {
    ctx.save();
    ctx.globalAlpha = accentP * 0.6;
    ctx.strokeStyle = COLORS.bodyLine;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(btnX, btnBaseY - 10);
    ctx.lineTo(btnX + 7, btnBaseY + 4);
    ctx.lineTo(btnX + 2, btnBaseY + 4);
    ctx.lineTo(btnX + 2, btnBaseY + 10);
    ctx.lineTo(btnX - 2, btnBaseY + 10);
    ctx.lineTo(btnX - 2, btnBaseY + 4);
    ctx.lineTo(btnX - 7, btnBaseY + 4);
    ctx.closePath();
    ctx.stroke();
    ctx.restore();
  }

  // Person button (below location button)
  drawCircle(ctx, btnX, btnBaseY + 68, 28, COLORS.border, COLORS.cardFill, accentP);
  // Person stroke inside
  if (accentP > 0) {
    ctx.save();
    ctx.globalAlpha = accentP * 0.6;
    ctx.strokeStyle = COLORS.bodyLine;
    ctx.lineWidth = 2;
    const px = btnX, py = btnBaseY + 68;
    // Head
    ctx.beginPath();
    ctx.arc(px, py - 6, 5, 0, Math.PI * 2);
    ctx.stroke();
    // Body
    ctx.beginPath();
    ctx.moveTo(px - 8, py + 10);
    ctx.quadraticCurveTo(px - 8, py + 2, px, py + 1);
    ctx.quadraticCurveTo(px + 8, py + 2, px + 8, py + 10);
    ctx.stroke();
    ctx.restore();
  }
}
