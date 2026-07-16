/**
 * BACKBONE — SPEC-02, shown while the visitor reads the OPS BOARD.
 *
 * "Your operation's backbone, run for you." Jobs, clients, and money in one
 * system with the owner's dashboard on top (bible SPEC/10 § 2): revenue
 * hero, pipeline strip, the A/R aging ramp, and the imported-records line —
 * the same live-operational-truth register as the OPS BOARD beside it.
 * The board proves OPS runs on live data; this screen shows the customer's
 * own business getting the same treatment.
 */

import { COLORS, LAYOUT, STATUS } from '../constants';
import { drawTabBar, drawStatusBar, drawFAB, phase } from './chrome';
import { MOHAVE, MONO, drawText, screenHeader, sectionLabel, panel, divider, win, countUp, fmtUSD } from './kit';
import type { SpecScreenDrawParams } from './types';

/** 12-week revenue shape behind the hero number (relative heights). */
const SPARK = [0.32, 0.41, 0.36, 0.48, 0.44, 0.58, 0.52, 0.66, 0.61, 0.72, 0.83, 1.0];

const PIPELINE: readonly { label: string; count: number; tone: string }[] = [
  { label: 'QUOTING', count: 4, tone: STATUS.estimated },
  { label: 'ACCEPTED', count: 3, tone: STATUS.accepted },
  { label: 'IN PROG', count: 5, tone: STATUS.inProgress },
  { label: 'DONE', count: 12, tone: STATUS.completed },
];

const AGING: readonly { label: string; amount: number; frac: number; tone: string }[] = [
  { label: 'CURRENT', amount: 8400, frac: 1.0, tone: COLORS.finProfit },
  { label: '1–30', amount: 3100, frac: 0.37, tone: COLORS.tan },
  { label: '31–60', amount: 1200, frac: 0.14, tone: COLORS.finReceivables },
  { label: '60+', amount: 0, frac: 0, tone: COLORS.rose },
];

export function drawSystems({ ctx, width, progress }: SpecScreenDrawParams) {
  const p = LAYOUT.padding;
  const cw = width - p * 2;

  const structP = phase(progress, 0, 0.4);

  screenHeader(ctx, 'BACKBONE', [
    { text: '// SPEC-02 :: JOBS · CLIENTS · MONEY', color: COLORS.captionLine },
    { text: 'SYNCED · 9:41', color: COLORS.olive },
  ], structP);

  // ── Revenue hero ──
  let y = 296;
  const heroP = win(progress, 0.12, 0.5);
  sectionLabel(ctx, 'REVENUE [90D]', p, y, heroP);
  y += 92;

  // Hero number — Mohave 300, always formatted, counts up with the draw
  const revenue = countUp(148200, phase(progress, 0.15, 0.75));
  drawText(ctx, fmtUSD(revenue), p - 2, y, `300 104px ${MOHAVE}`, 'rgba(255, 255, 255, 0.92)', heroP);

  // Delta — semantic olive
  const deltaP = win(progress, 0.45, 0.68);
  drawText(ctx, '+12% VS PRIOR', p + 4, y + 74, `24px ${MONO}`, COLORS.olive, deltaP);

  // Sparkline — neutral fills, the trailing bar carries the hero's weight
  const sparkP = win(progress, 0.25, 0.72);
  const sparkH = 120;
  const sparkY = y + 130 + sparkH;
  const gap = 10;
  const barW = (cw - gap * (SPARK.length - 1)) / SPARK.length;
  if (sparkP > 0) {
    ctx.save();
    SPARK.forEach((v, i) => {
      const bp = win(sparkP, i * 0.05, i * 0.05 + 0.45);
      if (bp <= 0) return;
      const h = Math.max(6, v * sparkH * bp);
      ctx.globalAlpha = 1;
      ctx.fillStyle = i === SPARK.length - 1
        ? 'rgba(255, 255, 255, 0.55)'
        : 'rgba(255, 255, 255, 0.14)';
      ctx.beginPath();
      ctx.roundRect(p + i * (barW + gap), sparkY - h, barW, h, 3);
      ctx.fill();
    });
    ctx.restore();
  }

  // ── Pipeline strip ──
  y = sparkY + 56;
  const pipeP = win(progress, 0.4, 0.7);
  sectionLabel(ctx, 'PIPELINE', p, y, pipeP);
  y += 40;

  const cellGap = 16;
  const cellW = (cw - cellGap * (PIPELINE.length - 1)) / PIPELINE.length;
  const cellH = 128;
  PIPELINE.forEach((stage, i) => {
    const cellP = win(progress, 0.45 + i * 0.06, 0.68 + i * 0.06);
    const cx = p + i * (cellW + cellGap);
    panel(ctx, cx, y, cellW, cellH, cellP);
    if (cellP > 0) {
      // Status rail — the stage's live color along the cell top
      ctx.save();
      ctx.globalAlpha = cellP;
      ctx.fillStyle = stage.tone;
      ctx.beginPath();
      ctx.roundRect(cx, y, cellW, 6, [LAYOUT.cardRadius, LAYOUT.cardRadius, 0, 0]);
      ctx.fill();
      ctx.restore();
    }
    drawText(ctx, String(stage.count), cx + cellW / 2, y + 58, `500 44px ${MONO}`, COLORS.titleLine, cellP, 'center');
    drawText(ctx, stage.label, cx + cellW / 2, y + 100, `20px ${MONO}`, COLORS.captionLine, cellP, 'center');
  });

  // ── A/R aging ramp (healthy → destructive, the one canonical ramp) ──
  y += cellH + 52;
  const agingP = win(progress, 0.55, 0.8);
  sectionLabel(ctx, 'RECEIVABLES', p, y, agingP);
  y += 44;

  const rowH = 58;
  const labelW = 128;
  const amountW = 130;
  const trackW = cw - labelW - amountW;
  AGING.forEach((band, i) => {
    const bandP = win(progress, 0.6 + i * 0.05, 0.82 + i * 0.05);
    const by = y + i * rowH;
    drawText(ctx, band.label, p, by, `22px ${MONO}`, COLORS.captionLine, bandP);
    if (bandP > 0) {
      ctx.save();
      ctx.globalAlpha = bandP;
      // Track
      ctx.fillStyle = 'rgba(255, 255, 255, 0.06)';
      ctx.beginPath();
      ctx.roundRect(p + labelW, by - 7, trackW, 14, 2);
      ctx.fill();
      // Fill — band tone, width by fraction
      if (band.frac > 0) {
        ctx.fillStyle = band.tone;
        ctx.beginPath();
        ctx.roundRect(p + labelW, by - 7, Math.max(14, trackW * band.frac * bandP), 14, 2);
        ctx.fill();
      }
      ctx.restore();
    }
    drawText(ctx, band.amount === 0 ? '—' : fmtUSD(band.amount), p + cw, by, `22px ${MONO}`,
      band.amount === 0 ? COLORS.captionLine : COLORS.bodyLine, bandP, 'right');
  });

  // ── Import line — the cleanup deliverable, stated as fact ──
  y += AGING.length * rowH + 20;
  const footP = win(progress, 0.78, 1.0);
  divider(ctx, p, y - 24, p + cw, footP * 0.7);
  drawText(ctx, '1,240 RECORDS IMPORTED · CLEAN', p, y + 8, `22px ${MONO}`, COLORS.bodyLine, footP);
  drawText(ctx, '// RUN BY OPS', p + cw, y + 8, `22px ${MONO}`, COLORS.captionLine, footP, 'right');

  // ===== CHROME ===== — the money surface: books position
  drawTabBar(ctx, 'books', width, LAYOUT.tabBarY, progress);
  drawStatusBar(ctx, width, progress);
  drawFAB(ctx, width, LAYOUT.tabBarY, progress);
}
