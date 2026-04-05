/**
 * Tailored Custom Screen — The finished product.
 * Shows base OPS UI with accent-colored custom modules overlaid.
 * Number of accent blocks varies by selected package tier.
 */

import { COLORS, LAYOUT, TAILORED_COLORS } from '../constants';
import { phase, roundedRect, contentLine, accentBlock, statusBar, bottomNav } from './draw-helpers';
import type { TailoredScreenDrawParams } from './types';

const TIER_CONFIG = {
  setup: { accentBlocks: 1, label: 'SETUP' },
  build: { accentBlocks: 3, label: 'BUILD' },
  enterprise: { accentBlocks: 5, label: 'ENTERPRISE' },
} as const;

export function drawTailoredCustom({ ctx, width, height, progress, tier }: TailoredScreenDrawParams) {
  const p = LAYOUT.padding;
  const cw = width - p * 2;

  const config = TIER_CONFIG[tier ?? 'build'];
  const structP = phase(progress, 0, 0.4);
  const contentP = phase(progress, 0.2, 0.7);
  const accentP = phase(progress, 0.5, 1.0);

  statusBar(ctx, width, structP);

  // Header with tier label
  contentLine(ctx, p, 60, 100, 6, TAILORED_COLORS.accentText, structP);
  contentLine(ctx, p, 78, 160, 9, COLORS.titleLine, structP);

  // "Your OPS" badge
  if (contentP > 0) {
    roundedRect(ctx, p + cw - 80, 58, 80, 22, 3, TAILORED_COLORS.accentGlow, TAILORED_COLORS.accentBorder, contentP);
    contentLine(ctx, p + cw - 70, 66, 60, 5, TAILORED_COLORS.accentText, contentP);
  }

  // Base OPS blocks (standard features — always present)
  const baseY = 110;
  const baseBlocks = [
    { y: baseY, h: 60, labelW: 0.4 },
    { y: baseY + 70, h: 50, labelW: 0.35 },
  ];

  for (const block of baseBlocks) {
    roundedRect(ctx, p, block.y, cw, block.h, LAYOUT.cardRadius, COLORS.cardFill, COLORS.border, structP);
    contentLine(ctx, p + 16, block.y + 16, cw * block.labelW, 6, COLORS.bodyLine, contentP);
    contentLine(ctx, p + 16, block.y + 32, cw * (block.labelW - 0.08), 4, COLORS.captionLine, contentP);
  }

  // Accent custom module blocks — count depends on tier
  const accentStartY = baseY + 150;
  const blockH = 48;
  const gap = 10;

  for (let i = 0; i < config.accentBlocks; i++) {
    const y = accentStartY + i * (blockH + gap);
    const stagger = i * 0.12;
    const blockP = phase(accentP, stagger, stagger + 0.5);

    // Don't draw if we'd overlap bottom nav
    if (y + blockH > height - LAYOUT.tabBarHeight - 20) break;

    accentBlock(ctx, p, y, cw, blockH, blockP);
  }

  // Below modules: a subtle "more" indicator for enterprise
  if (config.accentBlocks >= 5 && accentP > 0) {
    const moreY = accentStartY + 5 * (blockH + gap) - 10;
    if (moreY < height - LAYOUT.tabBarHeight - 20) {
      ctx.save();
      ctx.globalAlpha = accentP * 0.4;
      for (let i = 0; i < 3; i++) {
        ctx.fillStyle = TAILORED_COLORS.accentText;
        ctx.beginPath();
        ctx.arc(width / 2 - 12 + i * 12, moreY, 3, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
  }

  bottomNav(ctx, width, height, structP);
}
