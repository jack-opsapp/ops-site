/**
 * SPEC-02 · SYSTEMS — delivered state, shown when the visitor opens the
 * SPEC-02 card's details.
 *
 * The backbone running the whole operation: money strip, live job board,
 * client base, receivables — everything in one system with the care plan
 * active. What $7,500 + $395/mo buys.
 */

import { COLORS, LAYOUT, STATUS } from '../constants';
import { drawTabBar, drawStatusBar, drawFAB, phase } from './chrome';
import { MOHAVE, MONO, drawText, screenHeader, sectionLabel, panel, tag, win, countUp } from './kit';
import type { SpecScreenDrawParams } from './types';

const KPIS: readonly { label: string; value: string; count?: number }[] = [
  { label: 'REVENUE [90D]', value: '', count: 148200 },
  { label: 'OWED', value: '$4,300' },
  { label: 'MARGIN', value: '31%' },
];

const JOBS: readonly { name: string; client: string; status: string; tone: string }[] = [
  { name: 'JOHNSON DECK', client: 'M. Johnson', status: 'IN PROG', tone: STATUS.inProgress },
  { name: 'MILLER RE-RAIL', client: 'K. Miller', status: 'ACCEPTED', tone: STATUS.accepted },
  { name: 'VISTA DURADEK', client: 'Vista HOA', status: 'QUOTING', tone: STATUS.estimated },
];

export function drawTierSpec02({ ctx, width, progress }: SpecScreenDrawParams) {
  const p = LAYOUT.padding;
  const cw = width - p * 2;

  const structP = phase(progress, 0, 0.4);

  screenHeader(ctx, 'BACKBONE', [
    { text: '// SPEC-02 :: ONE SYSTEM', color: COLORS.captionLine },
    { text: 'CARE PLAN · ACTIVE', color: COLORS.olive },
  ], structP);

  // ── Money strip ──
  let y = 300;
  const tileGap = 16;
  const tileW = (cw - tileGap * 2) / 3;
  const tileH = 150;
  KPIS.forEach((kpi, i) => {
    const tileP = win(progress, 0.12 + i * 0.07, 0.4 + i * 0.07);
    const tx = p + i * (tileW + tileGap);
    panel(ctx, tx, y, tileW, tileH, tileP);
    const value = kpi.count !== undefined
      ? `$${Math.round(countUp(kpi.count, phase(progress, 0.15, 0.6)) / 1000)}K`
      : kpi.value;
    drawText(ctx, value, tx + tileW / 2, y + 64, `500 46px ${MONO}`, 'rgba(255, 255, 255, 0.92)', tileP, 'center');
    drawText(ctx, kpi.label, tx + tileW / 2, y + 116, `19px ${MONO}`, COLORS.captionLine, tileP, 'center');
  });

  // ── Live job board ──
  y += tileH + 52;
  sectionLabel(ctx, 'JOBS', p, y, win(progress, 0.28, 0.52));
  y += 50;

  const rowH = 128;
  JOBS.forEach((job, i) => {
    const rowP = win(progress, 0.32 + i * 0.08, 0.58 + i * 0.08);
    panel(ctx, p, y, cw, rowH - 16, rowP);
    if (rowP > 0) {
      // Status left border — the board's stage color
      ctx.save();
      ctx.globalAlpha = rowP;
      ctx.fillStyle = job.tone;
      ctx.beginPath();
      ctx.roundRect(p, y, LAYOUT.coloredBorderWidth, rowH - 16, [LAYOUT.cardRadius, 0, 0, LAYOUT.cardRadius]);
      ctx.fill();
      ctx.restore();
    }
    drawText(ctx, job.name, p + 34, y + 44, `500 30px ${MOHAVE}`, COLORS.titleLine, rowP);
    drawText(ctx, job.client, p + 34, y + 82, `24px ${MOHAVE}`, COLORS.captionLine, rowP);
    tag(ctx, job.status, p + cw - 30, y + (rowH - 16) / 2, job.tone, rowP, 'right');
    y += rowH;
  });

  // ── Clients + records — the import/cleanup deliverable ──
  y += 24;
  const baseP = win(progress, 0.58, 0.78);
  sectionLabel(ctx, 'CLIENT BASE', p, y, baseP);
  y += 50;

  panel(ctx, p, y, cw, 96, baseP);
  drawText(ctx, '86 CLIENTS', p + 30, y + 48, `500 30px ${MONO}`, COLORS.titleLine, baseP);
  drawText(ctx, '1,240 RECORDS IMPORTED · CLEAN', p + cw - 30, y + 48, `22px ${MONO}`, COLORS.bodyLine, baseP, 'right');
  // (Receivables detail lives on the BACKBONE dashboard; the OWED tile above
  // already carries the number here — repeating it would just crowd the FAB.)

  // ===== CHROME =====
  drawTabBar(ctx, 'books', width, LAYOUT.tabBarY, progress);
  drawStatusBar(ctx, width, progress);
  drawFAB(ctx, width, LAYOUT.tabBarY, progress);
}
