/**
 * Home screen wireframe — Map view with project carousel.
 * Reference: Screenshot IMG_6161.PNG (Home tab)
 */

import { COLORS, LAYOUT, TIMING } from '../constants';
import {
  drawRoundedRect,
  drawContentLine,
  drawCircle,
  drawColoredLeftBorder,
  drawMapPin,
  phase,
} from '../draw-utils';
import type { ScreenDrawParams } from './types';

// Road network as fractional coordinates — [xFrac of canvas width, yFrac of map height]
// Hoisted to module level to avoid per-frame allocation.
const ROAD_NETWORK: { points: [number, number][] }[] = [
  // Horizontal-ish roads
  { points: [[0, 0.3], [0.3, 0.28], [0.6, 0.35], [1, 0.32]] },
  { points: [[0, 0.6], [0.4, 0.58], [0.7, 0.65], [1, 0.6]] },
  { points: [[0, 0.85], [0.3, 0.82], [1, 0.88]] },
  // Vertical-ish roads
  { points: [[0.25, 0], [0.27, 0.5], [0.24, 1]] },
  { points: [[0.55, 0], [0.53, 0.4], [0.56, 1]] },
  { points: [[0.8, 0], [0.78, 0.6], [0.82, 1]] },
  // Diagonal / curved roads
  { points: [[0, 0.1], [0.5, 0.5], [1, 0.45]] },
  { points: [[0.1, 1], [0.4, 0.4], [0.9, 0.15]] },
];

export function drawHomeScreen({ ctx, width, height, progress }: ScreenDrawParams) {
  const p = LAYOUT.padding;
  const contentWidth = width - p * 2;

  // --- Structure phase ---
  const structP = phase(progress, TIMING.structurePhase[0], TIMING.structurePhase[1]);

  // Greeting line (thick, ~60% width)
  drawContentLine(ctx, p, 80, contentWidth * 0.55, 'title', structP);

  // Company name line (thin, ~50% width) + small green dot (trial indicator)
  drawContentLine(ctx, p, 110, contentWidth * 0.45, 'caption', structP);
  if (structP > 0) {
    ctx.save();
    ctx.globalAlpha = structP;
    ctx.beginPath();
    ctx.arc(p + contentWidth * 0.47, 110, 4, 0, Math.PI * 2);
    ctx.fillStyle = COLORS.stageAccepted; // Green dot
    ctx.fill();
    ctx.restore();
  }

  // Notification bell circle (to the left of avatar)
  drawCircle(ctx, width - p - 80, 85, 22, COLORS.border, undefined, structP);

  // Avatar circle (top right) — larger to match ref proportions
  drawCircle(ctx, width - p - 30, 85, 32, COLORS.border, COLORS.cardFill, structP);

  // --- Carousel card with colored left border ---
  const cardY = 150;
  const cardH = 150;
  drawRoundedRect(ctx, p, cardY, contentWidth, cardH, LAYOUT.cardRadius, COLORS.border, COLORS.cardFill, structP);

  // Accent-colored left border on card (stage indicator)
  drawColoredLeftBorder(ctx, p, cardY, cardH, COLORS.accent, phase(progress, TIMING.accentPhase[0], TIMING.accentPhase[1]));

  // --- Content phase ---
  const contentP = phase(progress, TIMING.contentPhase[0], TIMING.contentPhase[1]);

  // Card content lines (project name, client, address)
  drawContentLine(ctx, p + 24, cardY + 35, contentWidth * 0.50, 'title', contentP);
  drawContentLine(ctx, p + 24, cardY + 62, contentWidth * 0.40, 'body', contentP);
  drawContentLine(ctx, p + 24, cardY + 85, contentWidth * 0.50, 'caption', contentP);

  // Stage badge (bottom right of card)
  drawRoundedRect(
    ctx, width - p - 150, cardY + cardH - 48, 130, 30,
    LAYOUT.smallRadius, COLORS.border, undefined, contentP,
  );
  drawContentLine(ctx, width - p - 140, cardY + cardH - 30, 90, 'caption', contentP);

  // Carousel dots — inside the card, top-right (matches ref)
  const dotSpacing = 20;
  const dotStartX = width - p - 30 - (4 * dotSpacing);
  const dotY = cardY + 28;
  for (let i = 0; i < 5; i++) {
    // Last dot is active (accent colored), rest are inactive
    const isActive = i === 4;
    const dotColor = isActive ? COLORS.accent : 'rgba(255, 255, 255, 0.25)';
    drawCircle(ctx, dotStartX + i * dotSpacing, dotY, LAYOUT.dotSize / 2, dotColor, dotColor, contentP);
  }

  // Filter chips (3 rects — "TODAY [TASKS]", "ACTIVE", "ALL")
  const chipY = cardY + cardH + 18;
  const chipWidths = [150, 90, 60];
  let chipX = p;
  for (let i = 0; i < 3; i++) {
    const fill = i === 0 ? 'rgba(255,255,255,0.06)' : undefined;
    const stroke = i === 0 ? COLORS.accent : COLORS.border;
    drawRoundedRect(ctx, chipX, chipY, chipWidths[i], 38, LAYOUT.smallRadius, stroke, fill, contentP);
    drawContentLine(ctx, chipX + 14, chipY + 21, chipWidths[i] - 28, 'caption', contentP);
    chipX += chipWidths[i] + 12;
  }

  // --- Map area (fills remaining space above tab bar) ---
  const mapY = chipY + 52;
  const mapH = LAYOUT.tabBarY - mapY - 10;

  // Organic road network lines (very faint)
  const roadAlpha = phase(progress, 0.2, 0.7);
  if (roadAlpha > 0) {
    ctx.save();
    ctx.globalAlpha = 0.12 * roadAlpha; // Boosted for 3D texture visibility
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 1;

    // Main roads — organic curves suggesting a real street network
    for (const road of ROAD_NETWORK) {
      ctx.beginPath();
      const x0 = road.points[0][0] * width;
      const y0 = mapY + road.points[0][1] * mapH;
      ctx.moveTo(x0, y0);
      for (let i = 1; i < road.points.length; i++) {
        const px = road.points[i][0] * width;
        const py = mapY + road.points[i][1] * mapH;
        // Use quadratic curves for organic feel
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

  // --- Accent phase — pins, glow, map buttons ---
  const accentP = phase(progress, TIMING.accentPhase[0], TIMING.accentPhase[1]);

  // Map pins
  drawMapPin(ctx, width * 0.45, mapY + mapH * 0.55, accentP);
  drawMapPin(ctx, width * 0.7, mapY + mapH * 0.3, accentP);
  drawMapPin(ctx, width * 0.25, mapY + mapH * 0.72, accentP);

  // Pin label lines (above the center pin — "Diagnostic" + "Runway Crack Repair")
  drawContentLine(ctx, width * 0.45 - 40, mapY + mapH * 0.55 - 25, 80, 'caption', accentP);
  drawContentLine(ctx, width * 0.45 - 50, mapY + mapH * 0.55 - 40, 100, 'caption', accentP);

  // Location arrow button (top of 2-button stack, right side of map)
  const btnX = width - p - 30;
  const btnBaseY = mapY + mapH * 0.45;
  drawCircle(ctx, btnX, btnBaseY, 26, COLORS.border, COLORS.cardFill, accentP);

  // Person/pin button (below location button)
  drawCircle(ctx, btnX, btnBaseY + 65, 26, COLORS.border, COLORS.cardFill, accentP);
}
