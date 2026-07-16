/**
 * BUILD CONSOLE — SPEC-03 in flight, shown for the white-label / ongoing
 * zone while the hardware itself resolves into its engineering drawing.
 *
 * "A standalone app, built only for you." The customer's own product —
 * Deckset, the flagship SPEC-03 example (bible SPEC/10 § 2) — mid-build:
 * module board, build log, schedule state. The screen is the only lit
 * surface over the drawing; it reads as the drafting table for the machine
 * being drawn around it. No OPS tab bar — this is a build report, not a
 * navigation surface.
 */

import { COLORS, LAYOUT } from '../constants';
import { drawStatusBar, phase } from './chrome';
import { CAKE, MOHAVE, MONO, drawText, sectionLabel, panel, tag, divider, win } from './kit';
import type { SpecScreenDrawParams } from './types';

const MODULES: readonly { name: string; status: string; tone: string }[] = [
  { name: 'Plan engine', status: 'SHIPPED', tone: COLORS.olive },
  { name: 'Material takeoff', status: 'SHIPPED', tone: COLORS.olive },
  { name: 'Client render', status: 'IN BUILD', tone: COLORS.tan },
  { name: 'Share + sign-off', status: 'QUEUED', tone: '#8A8A8A' },
];

const LOG: readonly { time: string; text: string }[] = [
  { time: '9:41', text: 'render pipeline — pass 14' },
  { time: '9:26', text: 'takeoff rates locked' },
  { time: '8:50', text: 'plan engine shipped' },
];

export function drawBuilding({ ctx, width, progress }: SpecScreenDrawParams) {
  const p = LAYOUT.padding;
  const cw = width - p * 2;

  const structP = phase(progress, 0, 0.4);

  // ── Nameplate ──
  drawText(ctx, '// SPEC-03 :: PROPRIETARY', p, 145, `22px ${MONO}`, COLORS.captionLine, structP);
  drawText(ctx, 'DECKSET', p - 2, 258, `300 124px ${CAKE}`, 'rgba(255, 255, 255, 0.92)', structP);
  drawText(ctx, 'BUILT FOR CASCADE DECK & RAIL', p, 348, `24px ${MONO}`, COLORS.bodyLine, win(progress, 0.15, 0.4));

  divider(ctx, p, 408, p + cw, structP * 0.8);

  // ── Module board ──
  let y = 470;
  sectionLabel(ctx, 'BUILD STATUS', p, y, win(progress, 0.2, 0.45));
  y += 52;

  const rowH = 104;
  MODULES.forEach((mod, i) => {
    const rowP = win(progress, 0.25 + i * 0.09, 0.52 + i * 0.09);
    panel(ctx, p, y, cw, rowH - 14, rowP);
    drawText(ctx, mod.name, p + 30, y + (rowH - 14) / 2, `500 30px ${MOHAVE}`, COLORS.titleLine, rowP);
    tag(ctx, mod.status, p + cw - 30, y + (rowH - 14) / 2, mod.tone, rowP, 'right');
    y += rowH;
  });

  // ── Build log ──
  y += 30;
  const logP = win(progress, 0.55, 0.75);
  sectionLabel(ctx, 'LOG', p, y, logP);
  y += 48;

  LOG.forEach((row, i) => {
    const rowP = win(progress, 0.6 + i * 0.07, 0.8 + i * 0.07);
    drawText(ctx, row.time, p, y, `24px ${MONO}`, COLORS.captionLine, rowP);
    drawText(ctx, row.text, p + 96, y, `26px ${MOHAVE}`, COLORS.bodyLine, rowP);
    y += 56;
  });

  // ── Schedule state ──
  y += 26;
  const barP = win(progress, 0.72, 0.95);
  if (barP > 0) {
    ctx.save();
    ctx.globalAlpha = barP;
    // Track
    ctx.fillStyle = 'rgba(255, 255, 255, 0.06)';
    ctx.beginPath();
    ctx.roundRect(p, y, cw, 14, 2);
    ctx.fill();
    // Fill — neutral: progress is a fact, not a semaphore
    ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
    ctx.beginPath();
    ctx.roundRect(p, y, cw * 0.68 * barP, 14, 2);
    ctx.fill();
    ctx.restore();
  }
  drawText(ctx, '68% · ON SCHEDULE', p, y + 46, `24px ${MONO}`, COLORS.bodyLine, barP);
  drawText(ctx, 'DELIVERY · SEP 12', p + cw, y + 46, `24px ${MONO}`, COLORS.captionLine, barP, 'right');

  // ── Owner line ──
  const ownerP = win(progress, 0.85, 1.0);
  drawText(ctx, '// OWNER :: CASCADE DECK & RAIL', p, LAYOUT.tabBarY - 36, `22px ${MONO}`, COLORS.captionLine, ownerP);

  // ===== CHROME ===== — status bar only; a build report has no nav
  drawStatusBar(ctx, width, progress);
}
