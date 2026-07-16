/**
 * WORKFLOWS — SPEC-01, shown while the visitor reads the tier ladder.
 *
 * "Your tools, wired together." Three production automations in the owner's
 * own accounts (bible SPEC/10 § 2), drawn as a wiring console: source and
 * destination nodes, a wire that draws in left → right, a LIVE tag once it
 * lands, and today's activity underneath. The ladder's first rung, running.
 */

import { COLORS, LAYOUT } from '../constants';
import { drawTabBar, drawStatusBar, phase } from './chrome';
import { MOHAVE, MONO, drawText, screenHeader, sectionLabel, panel, tag, divider, win } from './kit';
import type { SpecScreenDrawParams } from './types';

interface Wire {
  from: string;
  to: string;
  detail: string;
  event: string;
}

const WIRES: readonly Wire[] = [
  { from: 'INBOX', to: 'LEDGER', detail: 'Supplier invoices file themselves', event: 'PO-2214 · FILED · 9:38' },
  { from: 'EMAIL', to: 'JOB FOLDER', detail: 'Attachments land on the job', event: 'JOHNSON · 4 PHOTOS · 9:12' },
  { from: 'LEAD FORM', to: 'CALL LIST', detail: 'New leads hit your phone first', event: 'S. PARKS · QUEUED · 8:57' },
];

const FEED: readonly { time: string; text: string }[] = [
  { time: '9:38', text: 'PO-2214 → ledger' },
  { time: '9:12', text: '4 photos → Johnson Deck' },
  { time: '8:57', text: 'S. Parks → call list' },
  { time: '8:31', text: 'PO-2209 → ledger' },
];

export function drawWorkflows({ ctx, width, progress }: SpecScreenDrawParams) {
  const p = LAYOUT.padding;
  const cw = width - p * 2;

  const structP = phase(progress, 0, 0.4);

  screenHeader(ctx, 'WORKFLOWS', [
    { text: '// SPEC-01 :: YOUR TOOLS, WIRED', color: COLORS.captionLine },
    { text: '3 AUTOMATIONS · LIVE', color: COLORS.olive },
  ], structP);

  // ── Wire cards ──
  let y = 300;
  const cardH = 218;

  WIRES.forEach((wire, i) => {
    // Card shell arrives with structure; the wire draws with its own window
    const cardP = win(progress, 0.15 + i * 0.08, 0.4 + i * 0.08);
    const wireP = win(progress, 0.35 + i * 0.12, 0.62 + i * 0.12);
    const liveP = win(progress, 0.6 + i * 0.12, 0.78 + i * 0.12);

    panel(ctx, p, y, cw, cardH, cardP);

    const nodeY = y + 78;
    const nodeR = 9;
    const leftX = p + 34;
    const rightEdge = p + cw - 34;

    if (cardP > 0) {
      ctx.save();
      ctx.globalAlpha = cardP;

      // Source label + node
      ctx.font = `500 26px ${MONO}`;
      ctx.textBaseline = 'middle';
      ctx.textAlign = 'left';
      ctx.fillStyle = COLORS.titleLine;
      ctx.fillText(wire.from, leftX, nodeY);
      const fromW = ctx.measureText(wire.from).width;

      // Destination label (right-aligned)
      ctx.textAlign = 'right';
      ctx.fillText(wire.to, rightEdge, nodeY);
      const toW = ctx.measureText(wire.to).width;

      // Node dots — source filled once the card lands, dest fills with the wire
      const wireStartX = leftX + fromW + 26;
      const wireEndX = rightEdge - toW - 26;

      ctx.beginPath();
      ctx.arc(wireStartX, nodeY, nodeR, 0, Math.PI * 2);
      ctx.fillStyle = COLORS.titleLine;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(wireEndX, nodeY, nodeR, 0, Math.PI * 2);
      if (wireP >= 1) {
        ctx.fillStyle = COLORS.titleLine;
        ctx.fill();
      } else {
        ctx.strokeStyle = COLORS.separator;
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      // The wire — draws left → right on its window
      if (wireP > 0) {
        const span = wireEndX - wireStartX - nodeR * 2;
        ctx.strokeStyle = COLORS.titleLine;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(wireStartX + nodeR + 4, nodeY);
        ctx.lineTo(wireStartX + nodeR + 4 + span * wireP - 8 * wireP, nodeY);
        ctx.stroke();
      }

      ctx.restore();
    }

    // What it does — sentence case content (Mohave body)
    drawText(ctx, wire.detail, leftX, y + 132, `28px ${MOHAVE}`, COLORS.bodyLine, cardP);

    // Last event — mono metadata
    drawText(ctx, wire.event, leftX, y + 176, `22px ${MONO}`, COLORS.captionLine, liveP);

    // LIVE tag — lands after the wire connects
    tag(ctx, 'LIVE', rightEdge, y + 168, COLORS.olive, liveP, 'right');

    y += cardH + 20;
  });

  // ── Today's activity ──
  const feedP = win(progress, 0.62, 0.85);
  y += 14;
  sectionLabel(ctx, 'TODAY', p, y, feedP);
  y += 44;

  FEED.forEach((row, i) => {
    const rowP = win(progress, 0.68 + i * 0.05, 0.86 + i * 0.05);
    drawText(ctx, row.time, p, y, `24px ${MONO}`, COLORS.captionLine, rowP);
    drawText(ctx, row.text, p + 96, y, `26px ${MOHAVE}`, COLORS.bodyLine, rowP);
    if (i < FEED.length - 1) divider(ctx, p, y + 26, p + cw, rowP * 0.6);
    y += 54;
  });

  // ===== CHROME ===== — an owner-config surface: settings position
  drawTabBar(ctx, 'settings', width, LAYOUT.tabBarY, progress);
  drawStatusBar(ctx, width, progress);
}
