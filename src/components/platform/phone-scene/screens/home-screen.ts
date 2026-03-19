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
  clearCanvas,
  phase,
} from '../draw-utils';
import type { ScreenDrawParams } from './types';

export function drawHomeScreen({ ctx, width, height, progress }: ScreenDrawParams) {
  clearCanvas(ctx, width, height);

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
    const roads = [
      // Horizontal-ish roads
      { points: [[0, mapY + mapH * 0.3], [width * 0.3, mapY + mapH * 0.28], [width * 0.6, mapY + mapH * 0.35], [width, mapY + mapH * 0.32]] },
      { points: [[0, mapY + mapH * 0.6], [width * 0.4, mapY + mapH * 0.58], [width * 0.7, mapY + mapH * 0.65], [width, mapY + mapH * 0.6]] },
      { points: [[0, mapY + mapH * 0.85], [width * 0.3, mapY + mapH * 0.82], [width, mapY + mapH * 0.88]] },
      // Vertical-ish roads
      { points: [[width * 0.25, mapY], [width * 0.27, mapY + mapH * 0.5], [width * 0.24, mapY + mapH]] },
      { points: [[width * 0.55, mapY], [width * 0.53, mapY + mapH * 0.4], [width * 0.56, mapY + mapH]] },
      { points: [[width * 0.8, mapY], [width * 0.78, mapY + mapH * 0.6], [width * 0.82, mapY + mapH]] },
      // Diagonal / curved roads
      { points: [[0, mapY + mapH * 0.1], [width * 0.5, mapY + mapH * 0.5], [width, mapY + mapH * 0.45]] },
      { points: [[width * 0.1, mapY + mapH], [width * 0.4, mapY + mapH * 0.4], [width * 0.9, mapY + mapH * 0.15]] },
    ];

    for (const road of roads) {
      ctx.beginPath();
      ctx.moveTo(road.points[0][0], road.points[0][1]);
      for (let i = 1; i < road.points.length; i++) {
        // Use quadratic curves for organic feel
        if (i < road.points.length - 1) {
          const cpx = (road.points[i][0] + road.points[i + 1][0]) / 2;
          const cpy = (road.points[i][1] + road.points[i + 1][1]) / 2;
          ctx.quadraticCurveTo(road.points[i][0], road.points[i][1], cpx, cpy);
        } else {
          ctx.lineTo(road.points[i][0], road.points[i][1]);
        }
      }
      ctx.stroke();
    }
    ctx.restore();
  }

  // --- Accent phase (67-100%) — pins and glow ---
  const accentP = phase(progress, 0.67, 1.0);

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
