/**
 * SPEC-01 · WORKFLOWS — delivered state, shown when the visitor opens the
 * SPEC-01 card's details.
 *
 * The same wiring console as the ladder phase, twelve days into the support
 * window: counters up, every wire live, the runbook handed over. What $2,000
 * buys, running in the owner's own accounts.
 */

import { COLORS, LAYOUT } from '../constants';
import { drawTabBar, drawStatusBar, phase } from './chrome';
import { MOHAVE, MONO, drawText, screenHeader, sectionLabel, panel, tag, divider, win, countUp } from './kit';
import type { SpecScreenDrawParams } from './types';

const COUNTERS: readonly { value: number; label: string }[] = [
  { value: 62, label: 'RUNS [7D]' },
  { value: 38, label: 'DOCS FILED' },
  { value: 9, label: 'LEADS QUEUED' },
];

const AUTOMATIONS: readonly { name: string; today: string }[] = [
  { name: 'INBOX → LEDGER', today: '14 RUNS TODAY' },
  { name: 'EMAIL → JOB FOLDER', today: '11 RUNS TODAY' },
  { name: 'LEAD FORM → CALL LIST', today: '3 RUNS TODAY' },
];

const FEED: readonly { time: string; text: string }[] = [
  { time: '9:38', text: 'PO-2214 → ledger' },
  { time: '9:12', text: '4 photos → Johnson Deck' },
  { time: '8:57', text: 'S. Parks → call list' },
];

export function drawTierSpec01({ ctx, width, progress }: SpecScreenDrawParams) {
  const p = LAYOUT.padding;
  const cw = width - p * 2;

  const structP = phase(progress, 0, 0.4);

  screenHeader(ctx, 'WORKFLOWS', [
    { text: '// SPEC-01 :: DELIVERED', color: COLORS.captionLine },
    { text: 'SUPPORT WINDOW · DAY 12 OF 30', color: COLORS.tan },
  ], structP);

  // ── Counter tiles ──
  let y = 300;
  const tileGap = 16;
  const tileW = (cw - tileGap * 2) / 3;
  const tileH = 150;
  COUNTERS.forEach((c, i) => {
    const tileP = win(progress, 0.12 + i * 0.07, 0.4 + i * 0.07);
    const tx = p + i * (tileW + tileGap);
    panel(ctx, tx, y, tileW, tileH, tileP);
    const value = countUp(c.value, phase(progress, 0.15 + i * 0.07, 0.6 + i * 0.07));
    drawText(ctx, String(value), tx + tileW / 2, y + 64, `500 52px ${MONO}`, 'rgba(255, 255, 255, 0.92)', tileP, 'center');
    drawText(ctx, c.label, tx + tileW / 2, y + 116, `20px ${MONO}`, COLORS.captionLine, tileP, 'center');
  });

  // ── Automations — all live ──
  y += tileH + 52;
  sectionLabel(ctx, 'AUTOMATIONS', p, y, win(progress, 0.3, 0.55));
  y += 50;

  const rowH = 122;
  AUTOMATIONS.forEach((a, i) => {
    const rowP = win(progress, 0.35 + i * 0.08, 0.6 + i * 0.08);
    panel(ctx, p, y, cw, rowH - 16, rowP);
    drawText(ctx, a.name, p + 30, y + 44, `500 27px ${MONO}`, COLORS.titleLine, rowP);
    drawText(ctx, a.today, p + 30, y + 82, `22px ${MONO}`, COLORS.captionLine, rowP);
    tag(ctx, 'LIVE', p + cw - 30, y + (rowH - 16) / 2, COLORS.olive, rowP, 'right');
    y += rowH;
  });

  // ── Today ──
  y += 26;
  const feedP = win(progress, 0.6, 0.8);
  sectionLabel(ctx, 'TODAY', p, y, feedP);
  y += 46;

  FEED.forEach((row, i) => {
    const rowP = win(progress, 0.65 + i * 0.06, 0.84 + i * 0.06);
    drawText(ctx, row.time, p, y, `24px ${MONO}`, COLORS.captionLine, rowP);
    drawText(ctx, row.text, p + 96, y, `26px ${MOHAVE}`, COLORS.bodyLine, rowP);
    if (i < FEED.length - 1) divider(ctx, p, y + 26, p + cw, rowP * 0.6);
    y += 54;
  });

  // ── Handover line — the tier's paper deliverables, stated as fact ──
  const footP = win(progress, 0.85, 1.0);
  drawText(ctx, 'RUNBOOK DELIVERED · CREW TRAINED', p, LAYOUT.tabBarY - 36, `22px ${MONO}`, COLORS.bodyLine, footP);

  // ===== CHROME =====
  drawTabBar(ctx, 'settings', width, LAYOUT.tabBarY, progress);
  drawStatusBar(ctx, width, progress);
}
