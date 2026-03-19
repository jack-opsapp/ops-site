/**
 * Job Board wireframe — Kanban board view with expandable columns.
 * Reference: Screenshots IMG_6162-6164 (Job Board tab)
 */

import { COLORS, LAYOUT, TIMING } from '../constants';
import {
  drawRoundedRect,
  drawContentLine,
  drawCircle,
  drawColoredLeftBorder,
  drawProgressBar,
  clearCanvas,
  phase,
} from '../draw-utils';
import type { ScreenDrawParams } from './types';

export function drawJobBoardScreen({ ctx, width, height, progress }: ScreenDrawParams) {
  clearCanvas(ctx, width, height);

  const p = LAYOUT.padding;
  const contentWidth = width - p * 2;

  // --- Structure phase (0-50%) ---
  const structP = phase(progress, 0, 0.5);

  // Title line + 4 toolbar icon circles
  drawContentLine(ctx, p, 80, contentWidth * 0.35, 'title', structP);

  const iconStartX = width - p - (LAYOUT.iconCircleSize * 4 + 12 * 3);
  for (let i = 0; i < 4; i++) {
    drawCircle(
      ctx,
      iconStartX + i * (LAYOUT.iconCircleSize + 12) + LAYOUT.iconCircleSize / 2,
      75,
      LAYOUT.iconCircleSize / 2,
      COLORS.border,
      COLORS.cardFill,
      structP,
    );
  }

  // Segment control (PROJECTS | TASKS | BOARD)
  const segY = 130;
  const segH = 44;
  const segW = contentWidth / 3;
  drawRoundedRect(ctx, p, segY, contentWidth, segH, LAYOUT.smallRadius, COLORS.border, COLORS.cardFill, structP);

  // Third segment filled (BOARD selected)
  if (structP > 0) {
    ctx.save();
    ctx.globalAlpha = structP;
    ctx.beginPath();
    ctx.roundRect(p + segW * 2 + 2, segY + 2, segW - 4, segH - 4, LAYOUT.smallRadius);
    ctx.fillStyle = COLORS.segmentFill;
    ctx.fill();
    ctx.restore();
  }

  // Segment labels
  drawContentLine(ctx, p + segW * 0.3, segY + segH / 2, segW * 0.4, 'caption', structP);
  drawContentLine(ctx, p + segW + segW * 0.35, segY + segH / 2, segW * 0.3, 'caption', structP);

  // --- Kanban columns ---
  const contentP = phase(progress, 0.33, 0.83);
  const accentP = phase(progress, 0.67, 1.0);

  let colY = segY + segH + 24;
  const colH = 56; // Collapsed column height

  // Column data
  const columns = [
    { label: 'ESTIMATED', color: COLORS.stageEstimated, count: '0', expanded: false },
    { label: 'ACCEPTED', color: COLORS.stageAccepted, count: '4', expanded: false },
    { label: 'IN PROGRESS', color: COLORS.stageInProgress, count: '6', expanded: true },
    { label: 'COMPLETED', color: COLORS.stageCompleted, count: '6', expanded: false },
  ];

  for (const col of columns) {
    // Column header
    drawRoundedRect(ctx, p, colY, contentWidth, colH, LAYOUT.cardRadius, COLORS.border, COLORS.cardFill, structP);

    // Colored left border
    drawColoredLeftBorder(ctx, p, colY, colH, col.color, accentP);

    // Label line + count
    drawContentLine(ctx, p + 20, colY + colH / 2, contentWidth * 0.25, 'body', contentP);

    // Count dot/number (right side)
    if (contentP > 0) {
      ctx.save();
      ctx.globalAlpha = contentP;
      ctx.fillStyle = COLORS.titleLine;
      ctx.font = '24px sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(col.count, width - p - 20, colY + colH / 2 + 8);
      ctx.restore();
    }

    colY += colH + 8;

    // If expanded, draw project cards
    if (col.expanded) {
      colY -= 8; // Remove gap, cards are inside the column visually

      for (let cardIdx = 0; cardIdx < 3; cardIdx++) {
        const cardY = colY;
        const cardH = 95;

        // Card outline
        drawRoundedRect(ctx, p + 12, cardY, contentWidth - 24, cardH, LAYOUT.cardRadius, COLORS.border, COLORS.cardFill, contentP);

        // Card content lines
        drawContentLine(ctx, p + 28, cardY + 28, (contentWidth - 24) * 0.55, 'title', contentP);
        drawContentLine(ctx, p + 28, cardY + 50, (contentWidth - 24) * 0.65, 'caption', contentP);
        drawContentLine(ctx, p + 28, cardY + 70, (contentWidth - 24) * 0.35, 'caption', contentP);

        // Progress bar (right side, near bottom)
        const barWidth = 100;
        const completedFraction = [0.33, 0.66, 0.5][cardIdx];
        drawProgressBar(
          ctx,
          width - p - 28 - barWidth,
          cardY + 70,
          barWidth,
          [
            { color: col.color, fraction: completedFraction },
            { color: COLORS.border, fraction: 1 - completedFraction },
          ],
          accentP,
        );

        colY += cardH + 8;
      }

      colY += 8;
    }
  }
}
