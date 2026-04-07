/**
 * Tailored Analysis Screen — Workflow diagram with labeled steps.
 */

import { COLORS, LAYOUT, TAILORED_COLORS, TEXT, CONTENT_PADDING, CARD_PADDING, TOP_INSET } from '../constants';
import {
  phase, roundedRect, drawText,
  statusBar, bottomNav, FONTS,
} from './draw-helpers';
import type { TailoredScreenDrawParams } from './types';

const P = CONTENT_PADDING;
const CP = CARD_PADDING;

export function drawTailoredAnalysis({ ctx, width, height, progress }: TailoredScreenDrawParams) {
  const cw = width - P * 2;

  const structP = phase(progress, 0, 0.4);
  const contentP = phase(progress, 0.25, 0.7);
  const accentP = phase(progress, 0.55, 1.0);

  statusBar(ctx, width, structP);

  // Header
  drawText(ctx, 'ANALYZING', P, TOP_INSET, FONTS.caption, TAILORED_COLORS.accentText, structP);
  drawText(ctx, 'Mapping Your Workflow', P, TOP_INSET + 38, FONTS.title, TEXT.primary, structP);

  // Workflow steps
  const steps = [
    { label: 'Lead Capture', desc: 'Inbound inquiries' },
    { label: 'Site Visit', desc: 'On-site assessment' },
    { label: 'Design & Measure', desc: 'Custom tool opportunity', custom: true },
    { label: 'Quote & Proposal', desc: 'Estimate generation' },
    { label: 'Build & Install', desc: 'Project execution' },
    { label: 'Invoice & Close', desc: 'Payment collection' },
  ];

  const cx = width / 2;
  const boxW = cw - 24;
  const boxH = 86;
  let stepY = TOP_INSET + 80;

  steps.forEach((step, i) => {
    const stagger = i * 0.08;
    const sP = phase(contentP, stagger, stagger + 0.5);
    const isCustom = 'custom' in step && step.custom;
    const boxX = cx - boxW / 2;
    const blx = boxX + CP;

    // Connector
    if (i > 0 && structP > 0) {
      ctx.save();
      ctx.globalAlpha = structP * 0.5;
      ctx.strokeStyle = isCustom ? TAILORED_COLORS.accentBorder : COLORS.separator;
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(cx, stepY - 10);
      ctx.lineTo(cx, stepY);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = isCustom ? TAILORED_COLORS.accentBorder : COLORS.separator;
      ctx.beginPath();
      ctx.moveTo(cx - 5, stepY - 4);
      ctx.lineTo(cx + 5, stepY - 4);
      ctx.lineTo(cx, stepY + 3);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    if (isCustom) {
      const cP = phase(accentP, 0, 0.6);
      roundedRect(ctx, boxX, stepY, boxW, boxH, LAYOUT.cardRadius,
        TAILORED_COLORS.accentGlow, TAILORED_COLORS.accentBorder, cP);

      if (cP > 0) {
        const dx = blx + 2;
        const dy = stepY + boxH / 2;
        ctx.save();
        ctx.globalAlpha = cP;
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

      drawText(ctx, step.label, blx + 24, stepY + 30, FONTS.bodyMed, TAILORED_COLORS.accentText, cP);
      drawText(ctx, step.desc, blx + 24, stepY + 62, FONTS.labelSm, TEXT.secondary, cP);
    } else {
      roundedRect(ctx, boxX, stepY, boxW, boxH, LAYOUT.cardRadius, COLORS.cardFill, COLORS.border, structP);

      if (sP > 0) {
        ctx.save();
        ctx.globalAlpha = sP;
        ctx.fillStyle = 'rgba(255,255,255,0.06)';
        ctx.beginPath();
        ctx.arc(blx + 2, stepY + boxH / 2, 14, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        drawText(ctx, String(i + 1), blx + 2, stepY + boxH / 2 + 1, FONTS.labelSm,
          TEXT.tertiary, sP, 'center');
      }

      drawText(ctx, step.label, blx + 28, stepY + 30, FONTS.bodyMed, TEXT.primary, sP);
      drawText(ctx, step.desc, blx + 28, stepY + 62, FONTS.labelSm, TEXT.tertiary, sP);
    }

    stepY += boxH + 22;
  });

  // Progress bar
  const barY = stepY + 16;
  roundedRect(ctx, P, barY, cw, 14, 7, COLORS.cardFill, COLORS.border, contentP);
  if (accentP > 0) {
    ctx.save();
    ctx.globalAlpha = accentP;
    ctx.fillStyle = TAILORED_COLORS.accentOverlayStrong;
    ctx.beginPath();
    ctx.roundRect(P + 2, barY + 2, (cw - 4) * 0.72, 10, 5);
    ctx.fill();
    ctx.restore();
  }
  drawText(ctx, 'Workflow analysis: 72%', P, barY + 32, FONTS.labelSm, TEXT.tertiary, contentP);

  bottomNav(ctx, width, height, structP);
}
