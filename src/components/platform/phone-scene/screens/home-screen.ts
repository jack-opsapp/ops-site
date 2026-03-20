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

// --- Fonts (loaded by next/font/google on the page) ---
const MOHAVE = 'Mohave, sans-serif';
const KOSUGI = 'Kosugi, sans-serif';

// --- Pete's avatar — loaded once at module level ---
let avatarImg: HTMLImageElement | null = null;
let avatarLoaded = false;
if (typeof window !== 'undefined') {
  avatarImg = new Image();
  avatarImg.crossOrigin = 'anonymous';
  avatarImg.src = '/dev/pete-avatar.jpg';
  avatarImg.onload = () => { avatarLoaded = true; };
}

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

// --- Helper: draw text ---
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

// --- Helper: draw avatar with circular clip ---
function drawAvatar(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number,
  progress: number,
) {
  if (progress <= 0) return;
  if (avatarLoaded && avatarImg) {
    ctx.save();
    ctx.globalAlpha = progress;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(avatarImg, cx - radius, cy - radius, radius * 2, radius * 2);
    ctx.restore();
    // Subtle border ring
    ctx.save();
    ctx.globalAlpha = progress * 0.3;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.strokeStyle = COLORS.border;
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.restore();
  } else {
    // Fallback circle
    drawCircle(ctx, cx, cy, radius, COLORS.border, COLORS.cardFill, progress);
  }
}

// --- Helper: draw notification bell badge overlaid on avatar ---
function drawNotificationBell(
  ctx: CanvasRenderingContext2D,
  avatarCx: number,
  avatarCy: number,
  avatarRadius: number,
  progress: number,
) {
  if (progress <= 0) return;
  // Position: bottom-left of avatar circle
  const bx = avatarCx - avatarRadius * 0.65;
  const by = avatarCy + avatarRadius * 0.45;
  const bellR = 16;

  ctx.save();
  ctx.globalAlpha = progress;

  // Black circle background (no outline)
  ctx.beginPath();
  ctx.arc(bx, by, bellR, 0, Math.PI * 2);
  ctx.fillStyle = '#0A0A0A';
  ctx.fill();

  // White bell stroke
  ctx.strokeStyle = 'rgba(255,255,255,0.7)';
  ctx.lineWidth = 1.5;
  ctx.lineCap = 'round';
  // Bell body
  ctx.beginPath();
  ctx.moveTo(bx - 6, by + 2);
  ctx.quadraticCurveTo(bx - 6, by - 7, bx, by - 9);
  ctx.quadraticCurveTo(bx + 6, by - 7, bx + 6, by + 2);
  ctx.lineTo(bx + 7, by + 3);
  ctx.lineTo(bx - 7, by + 3);
  ctx.closePath();
  ctx.stroke();
  // Clapper
  ctx.beginPath();
  ctx.arc(bx, by + 6, 2.5, 0, Math.PI);
  ctx.stroke();

  ctx.restore();
}

export function drawHomeScreen({ ctx, width, height, progress }: ScreenDrawParams) {
  const p = LAYOUT.padding;
  const contentWidth = width - p * 2;

  // --- Content starts below status bar + Dynamic Island ---
  // Dynamic Island bottom edge = y 56. Match the real app's breathing room.
  const headerY = 105;

  // --- Structure phase ---
  const structP = phase(progress, TIMING.structurePhase[0], TIMING.structurePhase[1]);

  // Avatar with photo (top right) — positioned first for reference by bell
  const avatarR = 36;
  const avatarCx = width - p - avatarR - 2;
  const avatarCy = headerY + 20;
  drawAvatar(ctx, avatarCx, avatarCy, avatarR, structP);

  // Notification bell badge — overlaid on avatar
  drawNotificationBell(ctx, avatarCx, avatarCy, avatarR, structP);

  // Greeting — Kosugi, all caps (per user feedback)
  drawText(ctx, 'GOOD AFTERNOON, PETE', p, headerY + 10, `bold 34px ${MOHAVE}`, COLORS.titleLine, structP);

  // Company line — Kosugi, all caps + green trial dot + trial text
  const companyY = headerY + 50;
  drawText(ctx, 'MAVERICK PROJECTS LTD', p, companyY, `13px ${KOSUGI}`, COLORS.captionLine, structP);
  if (structP > 0) {
    ctx.save();
    ctx.globalAlpha = structP;
    const dotX = p + 262;
    // Green dot
    ctx.beginPath();
    ctx.arc(dotX, companyY, 4, 0, Math.PI * 2);
    ctx.fillStyle = COLORS.stageAccepted;
    ctx.fill();
    // Trial text
    ctx.font = `13px ${KOSUGI}`;
    ctx.fillStyle = COLORS.stageAccepted;
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'left';
    ctx.fillText('TRIAL ENDS Apr 10', dotX + 12, companyY);
    ctx.restore();
  }

  // --- Carousel card ---
  const cardY = companyY + 30;
  const cardH = 170;
  drawRoundedRect(ctx, p, cardY, contentWidth, cardH, LAYOUT.cardRadius, COLORS.border, COLORS.cardFill, structP);

  // Colored left border (accent — stage indicator)
  const accentP = phase(progress, TIMING.accentPhase[0], TIMING.accentPhase[1]);
  drawColoredLeftBorder(ctx, p, cardY, cardH, COLORS.accent, accentP);

  // --- Content phase ---
  const contentP = phase(progress, TIMING.contentPhase[0], TIMING.contentPhase[1]);

  // Project title — Mohave bold, all caps
  drawText(ctx, 'RUNWAY CRACK REPAIR', p + 24, cardY + 42, `bold 28px ${MOHAVE}`, COLORS.titleLine, contentP);

  // Client name
  drawText(ctx, 'Miramar Flight Academy', p + 24, cardY + 76, `15px ${KOSUGI}`, COLORS.bodyLine, contentP);

  // Address
  drawText(ctx, '9800 Anderson St, San Diego', p + 24, cardY + 104, `14px ${KOSUGI}`, COLORS.captionLine, contentP);

  // Stage badge — "DIAGNOSTIC" with colored fill, border, and text
  const badgeW = 150;
  const badgeH = 32;
  const badgeX = width - p - badgeW - 18;
  const badgeY = cardY + cardH - 50;
  // Colored fill (low opacity)
  drawRoundedRect(ctx, badgeX, badgeY, badgeW, badgeH, LAYOUT.smallRadius,
    COLORS.accent, 'rgba(89, 119, 148, 0.15)', contentP);
  // Colored text
  drawText(ctx, 'DIAGNOSTIC', badgeX + badgeW / 2, badgeY + badgeH / 2,
    `bold 14px ${KOSUGI}`, COLORS.accent, contentP, 'center');

  // Carousel dots — inside the card, top-right (5 dots, last one accent)
  const dotSpacing = 22;
  const dotStartX = width - p - 28 - (4 * dotSpacing);
  const dotY = cardY + 32;
  for (let i = 0; i < 5; i++) {
    const isActive = i === 4;
    const dotColor = isActive ? COLORS.accent : 'rgba(255, 255, 255, 0.18)';
    drawCircle(ctx, dotStartX + i * dotSpacing, dotY, 7, dotColor, dotColor, contentP);
  }

  // --- Filter chips ---
  const chipY = cardY + cardH + 20;
  const chips = ['TODAY [TASKS]', 'ACTIVE', 'ALL'];
  const chipWidths = [180, 108, 72];
  let chipX = p;
  for (let i = 0; i < 3; i++) {
    const isSelected = i === 0;
    const fill = isSelected ? 'rgba(255,255,255,0.06)' : undefined;
    const stroke = isSelected ? COLORS.accent : COLORS.border;
    drawRoundedRect(ctx, chipX, chipY, chipWidths[i], 42, LAYOUT.smallRadius, stroke, fill, contentP);
    drawText(ctx, chips[i], chipX + chipWidths[i] / 2, chipY + 22,
      `bold 16px ${KOSUGI}`, isSelected ? COLORS.bodyLine : COLORS.captionLine, contentP, 'center');
    chipX += chipWidths[i] + 14;
  }

  // --- Map area ---
  const mapY = chipY + 58;
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
  const btnBaseY = mapY + mapH * 0.35;
  drawCircle(ctx, btnX, btnBaseY, 28, COLORS.border, COLORS.cardFill, accentP);
  // Arrow stroke
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
  // Person stroke
  if (accentP > 0) {
    ctx.save();
    ctx.globalAlpha = accentP * 0.6;
    ctx.strokeStyle = COLORS.bodyLine;
    ctx.lineWidth = 2;
    const px2 = btnX, py2 = btnBaseY + 68;
    ctx.beginPath();
    ctx.arc(px2, py2 - 6, 5, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(px2 - 8, py2 + 10);
    ctx.quadraticCurveTo(px2 - 8, py2 + 2, px2, py2 + 1);
    ctx.quadraticCurveTo(px2 + 8, py2 + 2, px2 + 8, py2 + 10);
    ctx.stroke();
    ctx.restore();
  }
}
