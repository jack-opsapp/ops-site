/**
 * Settings wireframe — List view with profile and grouped items.
 * Reference: Screenshot IMG_6166 (Settings tab)
 */

import { COLORS, LAYOUT } from '../constants';
import {
  drawRoundedRect,
  drawContentLine,
  drawCircle,
  drawChevron,
  clearCanvas,
  phase,
} from '../draw-utils';
import type { ScreenDrawParams } from './types';

export function drawSettingsScreen({ ctx, width, height, progress }: ScreenDrawParams) {
  clearCanvas(ctx, width, height);

  const p = LAYOUT.padding;
  const contentWidth = width - p * 2;

  // --- Structure phase (0-50%) ---
  const structP = phase(progress, 0, 0.5);

  // Title line ("SETTINGS")
  drawContentLine(ctx, p, 80, contentWidth * 0.28, 'title', structP);

  // Search icon circle (top right)
  drawCircle(ctx, width - p - 28, 75, LAYOUT.iconCircleSize / 2, COLORS.border, COLORS.cardFill, structP);

  // Search bar
  const searchY = 130;
  drawRoundedRect(ctx, p, searchY, contentWidth, 50, LAYOUT.smallRadius, COLORS.border, COLORS.cardFill, structP);

  // --- Content phase (33-83%) ---
  const contentP = phase(progress, 0.33, 0.83);

  // Magnifying glass circle in search bar
  drawCircle(ctx, p + 30, searchY + 25, 10, COLORS.captionLine, undefined, contentP);
  // Search placeholder line
  drawContentLine(ctx, p + 50, searchY + 27, contentWidth * 0.25, 'caption', contentP);

  // Profile card
  const profileY = 200;
  const profileH = 80;
  drawRoundedRect(ctx, p, profileY, contentWidth, profileH, LAYOUT.cardRadius, COLORS.border, COLORS.cardFill, structP);

  // Avatar circle
  drawCircle(ctx, p + 45, profileY + profileH / 2, 28, COLORS.border, COLORS.cardFill, contentP);

  // Name + role lines
  drawContentLine(ctx, p + 85, profileY + 30, contentWidth * 0.35, 'title', contentP);
  drawContentLine(ctx, p + 85, profileY + 55, contentWidth * 0.40, 'caption', contentP);

  // Chevron
  drawChevron(ctx, width - p - 20, profileY + profileH / 2, 16, contentP);

  // --- Section: ACCOUNT ---
  const section1LabelY = profileY + profileH + 30;
  drawContentLine(ctx, p, section1LabelY, contentWidth * 0.15, 'caption', contentP);

  // Account group (2 items)
  const group1Y = section1LabelY + 25;
  const itemH = 60;
  const group1H = itemH * 2;
  drawRoundedRect(ctx, p, group1Y, contentWidth, group1H, LAYOUT.cardRadius, COLORS.border, COLORS.cardFill, structP);

  for (let i = 0; i < 2; i++) {
    const itemY = group1Y + i * itemH;

    // Icon circle
    drawCircle(ctx, p + 35, itemY + itemH / 2, 14, COLORS.border, undefined, contentP);

    // Content line
    drawContentLine(ctx, p + 60, itemY + itemH / 2 + 2, contentWidth * 0.25, 'body', contentP);

    // Chevron
    drawChevron(ctx, width - p - 20, itemY + itemH / 2, 14, contentP);

    // Divider between items (not after last)
    if (i < 1) {
      ctx.save();
      ctx.globalAlpha = structP;
      ctx.strokeStyle = COLORS.separator;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(p + 60, itemY + itemH);
      ctx.lineTo(width - p - 10, itemY + itemH);
      ctx.stroke();
      ctx.restore();
    }
  }

  // --- Section: APP ---
  const section2LabelY = group1Y + group1H + 25;
  drawContentLine(ctx, p, section2LabelY, contentWidth * 0.08, 'caption', contentP);

  // App group (4 items)
  const group2Y = section2LabelY + 25;
  const group2H = itemH * 4;
  drawRoundedRect(ctx, p, group2Y, contentWidth, group2H, LAYOUT.cardRadius, COLORS.border, COLORS.cardFill, structP);

  for (let i = 0; i < 4; i++) {
    const itemY = group2Y + i * itemH;

    // Icon circle
    drawCircle(ctx, p + 35, itemY + itemH / 2, 14, COLORS.border, undefined, contentP);

    // Content line (varying widths for visual interest)
    const widthFractions = [0.22, 0.20, 0.26, 0.28];
    drawContentLine(ctx, p + 60, itemY + itemH / 2 + 2, contentWidth * widthFractions[i], 'body', contentP);

    // Chevron
    drawChevron(ctx, width - p - 20, itemY + itemH / 2, 14, contentP);

    // Divider between items
    if (i < 3) {
      ctx.save();
      ctx.globalAlpha = structP;
      ctx.strokeStyle = COLORS.separator;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(p + 60, itemY + itemH);
      ctx.lineTo(width - p - 10, itemY + itemH);
      ctx.stroke();
      ctx.restore();
    }
  }

  // --- Section: DATA ---
  const accentP = phase(progress, 0.67, 1.0);
  const section3LabelY = group2Y + group2H + 25;
  if (section3LabelY < LAYOUT.tabBarY - 80) {
    drawContentLine(ctx, p, section3LabelY, contentWidth * 0.08, 'caption', accentP);

    // Partial card (gets cut off above tab bar — suggests more content)
    const group3Y = section3LabelY + 25;
    const visibleH = Math.min(itemH, LAYOUT.tabBarY - group3Y - 20);
    if (visibleH > 20) {
      drawRoundedRect(ctx, p, group3Y, contentWidth, visibleH, LAYOUT.cardRadius, COLORS.border, COLORS.cardFill, accentP);
    }
  }
}
