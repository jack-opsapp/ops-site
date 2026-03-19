/**
 * Schedule wireframe — Daily view with week strip and task list.
 * Reference: Screenshot IMG_6165 (Schedule tab)
 */

import { COLORS, LAYOUT, TIMING } from '../constants';
import {
  drawRoundedRect,
  drawContentLine,
  drawCircle,
  drawColoredLeftBorder,
  clearCanvas,
  phase,
} from '../draw-utils';
import type { ScreenDrawParams } from './types';

export function drawScheduleScreen({ ctx, width, height, progress }: ScreenDrawParams) {
  clearCanvas(ctx, width, height);

  const p = LAYOUT.padding;
  const contentWidth = width - p * 2;

  // --- Structure phase (0-50%) ---
  const structP = phase(progress, 0, 0.5);

  // Title line ("SCHEDULE")
  drawContentLine(ctx, p, 80, contentWidth * 0.32, 'title', structP);

  // "TODAY | March 19" caption
  drawContentLine(ctx, p, 110, contentWidth * 0.28, 'caption', structP);

  // 3 toolbar icon circles (right side)
  for (let i = 0; i < 3; i++) {
    drawCircle(
      ctx,
      width - p - (LAYOUT.iconCircleSize + 12) * (2 - i) - LAYOUT.iconCircleSize / 2 + 12,
      75,
      LAYOUT.iconCircleSize / 2,
      COLORS.border,
      COLORS.cardFill,
      structP,
    );
  }

  // --- Week strip ---
  const weekY = 150;
  const daySize = 65;
  const dayGap = (contentWidth - daySize * 7) / 6;
  const selectedDay = 3; // Thursday (0-indexed)

  for (let i = 0; i < 7; i++) {
    const dayX = p + i * (daySize + dayGap);

    // Day abbreviation line (above square)
    drawContentLine(ctx, dayX + daySize * 0.2, weekY, daySize * 0.6, 'caption', structP);

    // Day square
    const isSelected = i === selectedDay;
    const fill = isSelected ? COLORS.accent : undefined;
    const stroke = isSelected ? COLORS.accent : COLORS.border;
    drawRoundedRect(ctx, dayX, weekY + 15, daySize, daySize, LAYOUT.smallRadius, stroke, fill, structP);

    // Day number line (inside square)
    const numColor = isSelected ? 'rgba(255,255,255,0.90)' : COLORS.bodyLine;
    if (structP > 0) {
      ctx.save();
      ctx.globalAlpha = structP;
      ctx.strokeStyle = numColor;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(dayX + daySize * 0.3, weekY + 15 + daySize * 0.55);
      ctx.lineTo(dayX + daySize * 0.7, weekY + 15 + daySize * 0.55);
      ctx.stroke();
      ctx.restore();
    }
  }

  // Task density bars below week strip
  const contentP = phase(progress, 0.33, 0.83);
  const accentP = phase(progress, 0.67, 1.0);
  const barsY = weekY + 15 + daySize + 8;

  const barColors = [
    [COLORS.stageAccepted, COLORS.stageInProgress],
    [COLORS.stageInProgress, COLORS.stageCompleted, COLORS.accent],
    [COLORS.stageAccepted, COLORS.stageInProgress, COLORS.stageCompleted],
    [COLORS.accent, COLORS.stageInProgress, COLORS.stageAccepted, COLORS.stageCompleted],
    [COLORS.stageInProgress, COLORS.stageAccepted],
    [COLORS.stageCompleted, COLORS.accent, COLORS.stageInProgress],
    [COLORS.stageAccepted],
  ];

  for (let i = 0; i < 7; i++) {
    const dayX = p + i * (daySize + dayGap);
    const colors = barColors[i];
    const segWidth = (daySize - (colors.length - 1) * 2) / colors.length;

    for (let j = 0; j < colors.length; j++) {
      if (accentP > 0) {
        ctx.save();
        ctx.globalAlpha = accentP;
        ctx.fillStyle = colors[j];
        ctx.fillRect(dayX + j * (segWidth + 2), barsY, segWidth, 4);
        ctx.restore();
      }
    }
  }

  // --- Day label + event count badge ---
  const dayLabelY = barsY + 35;
  drawContentLine(ctx, p, dayLabelY, contentWidth * 0.22, 'title', contentP);

  // Event count badge (right side)
  drawRoundedRect(ctx, width - p - 150, dayLabelY - 15, 150, 34, LAYOUT.smallRadius, COLORS.border, undefined, contentP);
  drawContentLine(ctx, width - p - 140, dayLabelY + 2, 100, 'caption', contentP);

  // Date line
  drawContentLine(ctx, p, dayLabelY + 30, contentWidth * 0.25, 'caption', contentP);

  // --- Task list ---
  const taskStartY = dayLabelY + 65;
  const taskH = 105;
  const taskGap = 4;

  const taskColors = [
    COLORS.accent,          // #597794
    COLORS.stageAccepted,   // olive
    COLORS.stageInProgress, // gold
    COLORS.stageCompleted,  // rose (completed task)
    COLORS.accent,          // blue
  ];

  for (let i = 0; i < 5; i++) {
    const taskY = taskStartY + i * (taskH + taskGap);

    if (taskY + taskH > LAYOUT.tabBarY - 10) break; // Don't draw over tab bar

    // Task row background
    const isCompleted = i === 3;
    const rowAlpha = isCompleted ? 0.6 : 1;

    ctx.save();
    ctx.globalAlpha = contentP * rowAlpha;

    // Full-width separator line
    ctx.strokeStyle = COLORS.separator;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, taskY);
    ctx.lineTo(width, taskY);
    ctx.stroke();
    ctx.restore();

    // Colored left border
    drawColoredLeftBorder(ctx, 0, taskY, taskH, taskColors[i], accentP * rowAlpha);

    // Content lines (project title + client/address)
    drawContentLine(ctx, p, taskY + 30, contentWidth * 0.55, 'title', contentP * rowAlpha);
    drawContentLine(ctx, p, taskY + 55, contentWidth * 0.45, 'body', contentP * rowAlpha);
    drawContentLine(ctx, p, taskY + 75, contentWidth * 0.55, 'caption', contentP * rowAlpha);

    // Trade type badge (right side)
    const badgeW = 95;
    drawRoundedRect(
      ctx, width - p - badgeW, taskY + 25, badgeW, 28,
      LAYOUT.smallRadius, COLORS.border, undefined, contentP * rowAlpha,
    );
    drawContentLine(ctx, width - p - badgeW + 10, taskY + 42, badgeW - 20, 'caption', contentP * rowAlpha);

    // Second badge for completed task
    if (isCompleted) {
      drawRoundedRect(
        ctx, width - p - badgeW, taskY + 58, badgeW, 28,
        LAYOUT.smallRadius, COLORS.stageCompleted, undefined, accentP * 0.5,
      );
    }
  }
}
