/**
 * Tailored Packages Screen — Shows 3 package cards on phone.
 * Mirrors the pricing section layout.
 */

import { COLORS, LAYOUT, TAILORED_COLORS } from '../constants';
import { phase, roundedRect, contentLine, statusBar, bottomNav } from './draw-helpers';
import type { TailoredScreenDrawParams } from './types';

export function drawTailoredPackages({ ctx, width, height, progress, tier }: TailoredScreenDrawParams) {
  const p = LAYOUT.padding;
  const cw = width - p * 2;

  const structP = phase(progress, 0, 0.5);
  const contentP = phase(progress, 0.33, 0.83);
  const accentP = phase(progress, 0.67, 1.0);

  statusBar(ctx, width, structP);

  // Header
  contentLine(ctx, p, 60, 140, 6, TAILORED_COLORS.accentText, structP);
  contentLine(ctx, p, 78, 200, 9, COLORS.titleLine, structP);

  // 3 package cards stacked
  const packages = [
    { label: 'SETUP', price: '$3,000', isTier: tier === 'setup' },
    { label: 'BUILD', price: '$8,500', isTier: tier === 'build' },
    { label: 'ENTERPRISE', price: '$18,000', isTier: tier === 'enterprise' },
  ];

  let cardY = 120;
  for (const pkg of packages) {
    const isSelected = pkg.isTier;
    const cardH = isSelected ? 200 : 80;
    const borderColor = isSelected ? TAILORED_COLORS.accentBorder : COLORS.border;
    const fillColor = isSelected ? TAILORED_COLORS.accentGlow : COLORS.cardFill;

    roundedRect(ctx, p, cardY, cw, cardH, LAYOUT.cardRadius, fillColor, borderColor, structP);

    // Label
    contentLine(ctx, p + 16, cardY + 20, 70, 5, isSelected ? TAILORED_COLORS.accentText : COLORS.captionLine, contentP);

    // Price
    contentLine(ctx, p + cw - 100, cardY + 16, 84, 8, isSelected ? COLORS.titleLine : COLORS.bodyLine, contentP);

    // Tagline
    contentLine(ctx, p + 16, cardY + 40, cw * 0.5, 5, COLORS.bodyLine, contentP);

    // Expanded content for selected
    if (isSelected && accentP > 0) {
      // Divider
      ctx.save();
      ctx.globalAlpha = accentP;
      ctx.strokeStyle = COLORS.separator;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(p + 16, cardY + 60);
      ctx.lineTo(p + cw - 16, cardY + 60);
      ctx.stroke();
      ctx.restore();

      // Feature lines
      for (let i = 0; i < 4; i++) {
        const fy = cardY + 76 + i * 20;
        // Checkmark
        ctx.save();
        ctx.globalAlpha = accentP;
        ctx.strokeStyle = TAILORED_COLORS.accentText;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(p + 18, fy + 3);
        ctx.lineTo(p + 22, fy + 7);
        ctx.lineTo(p + 30, fy - 1);
        ctx.stroke();
        ctx.restore();

        contentLine(ctx, p + 38, fy, cw * 0.5, 5, COLORS.bodyLine, accentP);
      }

      // CTA button
      roundedRect(ctx, p + 16, cardY + 165, cw - 32, 28, 3, TAILORED_COLORS.accentOverlayStrong, undefined, accentP);
      contentLine(ctx, p + cw / 2 - 40, cardY + 175, 80, 5, COLORS.titleLine, accentP);
    }

    cardY += cardH + 10;
  }

  bottomNav(ctx, width, height, structP);
}
