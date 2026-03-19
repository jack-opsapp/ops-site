/**
 * Home screen wireframe — Map view with project carousel.
 * Reference: Screenshot IMG_6161.PNG (Home tab)
 */

import { COLORS, LAYOUT, TIMING } from '../constants';
import {
  drawRoundedRect,
  drawContentLine,
  drawCircle,
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

  // Company name line (thin, ~45% width)
  drawContentLine(ctx, p, 110, contentWidth * 0.40, 'caption', structP);

  // Avatar circle (top right)
  drawCircle(ctx, width - p - 28, 85, 28, COLORS.border, COLORS.cardFill, structP);

  // Carousel card
  const cardY = 155;
  const cardH = 140;
  drawRoundedRect(ctx, p, cardY, contentWidth, cardH, LAYOUT.cardRadius, COLORS.border, COLORS.cardFill, structP);

  // --- Content phase ---
  const contentP = phase(progress, TIMING.contentPhase[0], TIMING.contentPhase[1]);

  // Card content lines
  drawContentLine(ctx, p + 20, cardY + 35, contentWidth * 0.55, 'title', contentP);
  drawContentLine(ctx, p + 20, cardY + 60, contentWidth * 0.45, 'body', contentP);
  drawContentLine(ctx, p + 20, cardY + 80, contentWidth * 0.50, 'caption', contentP);

  // Stage badge (bottom right of card)
  drawRoundedRect(
    ctx, width - p - 140, cardY + cardH - 45, 120, 30,
    LAYOUT.smallRadius, COLORS.border, undefined, contentP,
  );
  drawContentLine(ctx, width - p - 130, cardY + cardH - 28, 80, 'caption', contentP);

  // Carousel dots
  const dotY = cardY + cardH + 20;
  const dotSpacing = 18;
  const dotsStartX = width / 2 - (dotSpacing * 1.5);
  for (let i = 0; i < 4; i++) {
    const dotColor = i === 0 ? COLORS.dotActive : COLORS.dotInactive;
    drawCircle(ctx, dotsStartX + i * dotSpacing, dotY, LAYOUT.dotSize / 2, dotColor, dotColor, contentP);
  }

  // Filter chips (3 small rects)
  const chipY = dotY + 30;
  const chipWidths = [130, 90, 60];
  let chipX = p;
  for (let i = 0; i < 3; i++) {
    const fill = i === 0 ? 'rgba(255,255,255,0.06)' : undefined;
    drawRoundedRect(ctx, chipX, chipY, chipWidths[i], 36, LAYOUT.smallRadius, COLORS.border, fill, contentP);
    drawContentLine(ctx, chipX + 12, chipY + 20, chipWidths[i] - 24, 'caption', contentP);
    chipX += chipWidths[i] + 12;
  }

  // --- Map area (fills remaining space above tab bar) ---
  const mapY = chipY + 55;
  const mapH = LAYOUT.tabBarY - mapY - 10;

  // Organic road network lines (very faint)
  const roadAlpha = phase(progress, 0.2, 0.7);
  if (roadAlpha > 0) {
    ctx.save();
    ctx.globalAlpha = 0.06 * roadAlpha;
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

  // --- Accent phase (67-100%) — pins and glow ---
  const accentP = phase(progress, TIMING.accentPhase[0], TIMING.accentPhase[1]);

  // Map pins
  drawMapPin(ctx, width * 0.45, mapY + mapH * 0.55, accentP);
  drawMapPin(ctx, width * 0.7, mapY + mapH * 0.3, accentP);
  drawMapPin(ctx, width * 0.25, mapY + mapH * 0.72, accentP);

  // Pin label line (above the first pin)
  drawContentLine(ctx, width * 0.45 - 40, mapY + mapH * 0.55 - 25, 80, 'caption', accentP);
  drawContentLine(ctx, width * 0.45 - 50, mapY + mapH * 0.55 - 40, 100, 'caption', accentP);

  // Location button (bottom right of map)
  drawCircle(ctx, width - p - 30, LAYOUT.tabBarY - 50, 24, COLORS.border, COLORS.cardFill, accentP);
}
