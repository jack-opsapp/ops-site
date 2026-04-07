/**
 * Tailored Packages Screen — Three package tiers with real text.
 */

import { COLORS, LAYOUT, TAILORED_COLORS, TEXT, CONTENT_PADDING, CARD_PADDING, TOP_INSET } from '../constants';
import {
  phase, roundedRect, drawText, drawWrappedText, drawCheck,
  statusBar, bottomNav, FONTS,
} from './draw-helpers';
import type { TailoredScreenDrawParams } from './types';

const P = CONTENT_PADDING;
const CP = CARD_PADDING;

export function drawTailoredPackages({ ctx, width, height, progress, tier }: TailoredScreenDrawParams) {
  const cw = width - P * 2;
  const lx = P + CP;
  const rx = P + cw - CP;

  const structP = phase(progress, 0, 0.4);
  const contentP = phase(progress, 0.25, 0.7);
  const accentP = phase(progress, 0.55, 1.0);

  statusBar(ctx, width, structP);

  // Header — generous top margin
  drawText(ctx, 'CHOOSE YOUR PACKAGE', P, TOP_INSET, FONTS.caption, TAILORED_COLORS.accentText, structP);
  drawText(ctx, 'Tailored Packages', P, TOP_INSET + 38, FONTS.title, TEXT.primary, structP);

  const packages = [
    {
      label: 'SETUP', price: '$3,000',
      tagline: 'We configure OPS for your workflow',
      isTier: tier === 'setup',
      highlights: ['Custom pipeline stages', 'Custom fields & tags'],
      features: [
        '2 discovery sessions',
        'Workflow analysis & mapping',
        'Custom pipeline stages',
        'Custom fields on projects & clients',
        'Up to 3 custom configurations',
        '30-day support window',
      ],
      example: { trade: 'DECK CO.', desc: 'Custom stages: Lead \u2192 Measure \u2192 Design \u2192 Quote \u2192 Build \u2192 Inspect' },
      ongoing: '$250/mo retainer after support window',
    },
    {
      label: 'BUILD', price: '$8,500',
      tagline: 'A custom module built for your trade',
      isTier: tier === 'build', recommended: true,
      highlights: ['Custom-built tool', 'AI-powered features'],
      features: [
        'Everything in Setup',
        '1 custom module \u2014 new features, views, logic',
        'iOS and web support',
        'Material calculator integration',
        'AI-powered features included',
        '60-day support window',
      ],
      example: { trade: 'DECK CO.', desc: 'Deck Designer \u2014 draw layouts, calculate materials, generate quotes from the field' },
      ongoing: '$250/mo retainer after support window',
    },
    {
      label: 'ENTERPRISE', price: '$18,000',
      tagline: 'Complete operations transformation',
      isTier: tier === 'enterprise',
      highlights: ['Full custom suite', 'Inventory & dispatch'],
      features: [
        'Everything in Build',
        'Multiple custom modules',
        'Inventory & material ordering',
        'Product catalogue system',
        'Crew dispatch & scheduling',
        'Custom reporting dashboards',
        'Dedicated build team',
      ],
      example: { trade: 'DECK CO.', desc: 'Membrane ordering, railing catalogue, carpentry tracker, crew dispatch \u2014 entire operation' },
      ongoing: '$500/mo retainer after support window',
    },
  ];

  const hasSelection = tier !== null && tier !== undefined;

  let cardY = TOP_INSET + 72;
  for (const pkg of packages) {
    const isSelected = pkg.isTier;
    const isCompressed = !isSelected && hasSelection;

    // --- Card heights ---
    let cardH: number;
    if (isSelected) {
      cardH = 110 + pkg.features.length * 42 + 140 + 44 + 64 + 30;
    } else if (isCompressed) {
      cardH = 80;
    } else {
      cardH = pkg.recommended ? 180 : 160;
    }

    const borderColor = isSelected ? TAILORED_COLORS.accentBorder : COLORS.border;
    const fillColor = isSelected ? TAILORED_COLORS.accentGlow : COLORS.cardFill;
    roundedRect(ctx, P, cardY, cw, cardH, LAYOUT.cardRadius, fillColor, borderColor, structP);

    if (isCompressed) {
      // ── Compressed ──
      drawText(ctx, pkg.label, lx, cardY + 40, FONTS.labelSm, TEXT.muted, contentP);
      drawText(ctx, pkg.price, rx, cardY + 40, FONTS.caption, TEXT.muted, contentP, 'right');

    } else if (!isSelected) {
      // ── Normal ──
      drawText(ctx, pkg.label, lx, cardY + 32, FONTS.labelSm, TEXT.tertiary, contentP);
      drawText(ctx, pkg.price, rx, cardY + 32, FONTS.price, TEXT.secondary, contentP, 'right');
      drawText(ctx, pkg.tagline, lx, cardY + 68, FONTS.body, TEXT.secondary, contentP);

      // Feature highlights
      pkg.highlights.forEach((h, hi) => {
        const hy = cardY + 102 + hi * 30;
        drawCheck(ctx, lx + 2, hy + 2, 10, TAILORED_COLORS.accentTextDim, contentP);
        drawText(ctx, h, lx + 24, hy + 4, FONTS.labelSm, TEXT.tertiary, contentP);
      });

      if (pkg.recommended) {
        const badgeW = 124;
        roundedRect(ctx, rx - badgeW, cardY + 100, badgeW, 30, 3,
          TAILORED_COLORS.accentGlow, TAILORED_COLORS.accentBorder, contentP);
        drawText(ctx, 'RECOMMENDED', rx - badgeW / 2, cardY + 115, FONTS.labelXs,
          TAILORED_COLORS.accentText, contentP, 'center');
      }

    } else {
      // ── Expanded ──
      drawText(ctx, pkg.label, lx, cardY + 38, FONTS.caption, TAILORED_COLORS.accentText, contentP);
      drawText(ctx, pkg.price, rx, cardY + 38, FONTS.price, TEXT.primary, contentP, 'right');
      drawText(ctx, pkg.tagline, lx, cardY + 78, FONTS.body, TEXT.secondary, contentP);

      // Divider
      if (accentP > 0) {
        ctx.save();
        ctx.globalAlpha = accentP * 0.18;
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(lx, cardY + 104);
        ctx.lineTo(rx, cardY + 104);
        ctx.stroke();
        ctx.restore();
      }

      // Features — generous line height
      let fy = cardY + 132;
      pkg.features.forEach((feat) => {
        drawCheck(ctx, lx + 2, fy + 2, 12, TAILORED_COLORS.accentText, accentP);
        drawText(ctx, feat, lx + 34, fy + 4, FONTS.body, TEXT.secondary, accentP);
        fy += 42;
      });

      // Example callout
      fy += 16;
      const calloutInset = 20;
      const calloutW = cw - CP * 2;
      const calloutTextW = calloutW - calloutInset * 2;
      roundedRect(ctx, lx, fy, calloutW, 118, 4,
        'rgba(89, 119, 148, 0.06)', 'rgba(89, 119, 148, 0.15)', accentP);
      drawText(ctx, pkg.example.trade, lx + calloutInset, fy + 30, FONTS.labelXs, TAILORED_COLORS.accentText, accentP);
      drawWrappedText(ctx, pkg.example.desc, lx + calloutInset, fy + 60, calloutTextW, 26,
        FONTS.labelSm, TEXT.secondary, accentP);

      fy += 134;

      // Ongoing cost
      drawText(ctx, pkg.ongoing, lx, fy, FONTS.labelXs, TEXT.muted, accentP);
      fy += 40;

      // CTA button
      roundedRect(ctx, lx, fy, cw - CP * 2, 52, 3, TAILORED_COLORS.accentOverlayStrong, undefined, accentP);
      drawText(ctx, 'Select Package', P + cw / 2, fy + 26, FONTS.bodyMed, TEXT.primary, accentP, 'center');
    }

    cardY += cardH + 16;
  }

  bottomNav(ctx, width, height, structP);
}
