/**
 * SPEC-03 · PROPRIETARY — Deckset, the flagship. Shown when the visitor
 * opens the SPEC-03 card's details.
 *
 * Not an OPS screen: the customer's own standalone app, wearing their brand
 * (the white-label story). The draw IS the pitch, in Deckset's three modes:
 *
 *   DRAW   — the deck plan drafts itself on the grid: perimeter, joists,
 *            decking, stairs, posts, dimensions
 *   PRICE  — the material takeoff prices in, line by line, to a total
 *   RENDER — the client-ready view lands with the one accent CTA
 *
 * The mode strip tracks the sequence live; the screen settles on RENDER —
 * plan drawn, materials priced, ready to send. What "own it" means.
 */

import { COLORS, LAYOUT } from '../constants';
import { drawStatusBar, phase } from './chrome';
import { CAKE, MOHAVE, MONO, drawText, sectionLabel, panel, divider, win, countUp, fmtUSD, toneAlpha } from './kit';
import type { SpecScreenDrawParams } from './types';

// ── Sequence windows (in screen progress) ──
const DRAW_WIN: readonly [number, number] = [0.06, 0.46];
const PRICE_WIN: readonly [number, number] = [0.46, 0.72];
const RENDER_WIN: readonly [number, number] = [0.72, 1.0];

const MATERIALS: readonly { name: string; spec: string; price: number }[] = [
  { name: 'DECKING', spec: '34 BOARDS · 16 FT', price: 2278 },
  { name: 'JOISTS 2×8', spec: '11 @ 16" OC', price: 486 },
  { name: 'ALUM RAIL', spec: '44 LF', price: 1892 },
  { name: 'FASTENERS', spec: 'KIT', price: 214 },
];
const MATERIALS_TOTAL = MATERIALS.reduce((sum, m) => sum + m.price, 0);

/** Progressively trace a closed polyline: draws prog ∈ [0,1] of its length. */
function tracePath(
  ctx: CanvasRenderingContext2D,
  points: readonly (readonly [number, number])[],
  prog: number,
) {
  if (prog <= 0) return;
  const segs: number[] = [];
  let total = 0;
  for (let i = 0; i < points.length; i++) {
    const [x1, y1] = points[i];
    const [x2, y2] = points[(i + 1) % points.length];
    const len = Math.hypot(x2 - x1, y2 - y1);
    segs.push(len);
    total += len;
  }
  let remaining = total * Math.min(1, prog);
  ctx.beginPath();
  ctx.moveTo(points[0][0], points[0][1]);
  for (let i = 0; i < points.length && remaining > 0; i++) {
    const [x1, y1] = points[i];
    const [x2, y2] = points[(i + 1) % points.length];
    const len = segs[i];
    if (remaining >= len) {
      ctx.lineTo(x2, y2);
      remaining -= len;
    } else {
      const f = remaining / len;
      ctx.lineTo(x1 + (x2 - x1) * f, y1 + (y2 - y1) * f);
      remaining = 0;
    }
  }
  ctx.stroke();
}

export function drawTierSpec03({ ctx, width, progress }: SpecScreenDrawParams) {
  const p = LAYOUT.padding;
  const cw = width - p * 2;

  const structP = phase(progress, 0, 0.3);

  // ===== DECKSET CHROME — the customer's app, the customer's brand =====
  drawText(ctx, 'DECKSET', p, 140, `300 52px ${CAKE}`, 'rgba(255, 255, 255, 0.92)', structP);
  // Brand chip — neutral (their name above the fold; white-label anatomy)
  if (structP > 0) {
    ctx.save();
    ctx.globalAlpha = structP;
    ctx.font = `500 22px ${MONO}`;
    const brandW = ctx.measureText('CASCADE DECK & RAIL').width + 36;
    ctx.beginPath();
    ctx.roundRect(p + cw - brandW, 118, brandW, 44, 8);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.fill();
    ctx.strokeStyle = COLORS.border;
    ctx.lineWidth = LAYOUT.borderWidth;
    ctx.stroke();
    ctx.fillStyle = COLORS.bodyLine;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('CASCADE DECK & RAIL', p + cw - brandW / 2, 141);
    ctx.restore();
  }

  drawText(ctx, 'JOHNSON RESIDENCE', p, 214, `500 34px ${MOHAVE}`, COLORS.titleLine, structP);
  drawText(ctx, "COMPOSITE · 16' × 12'", p + cw, 214, `24px ${MONO}`, COLORS.captionLine, structP, 'right');

  // ===== MODE STRIP — segmented control; the active mode tracks the draw =====
  const modes = ['DRAW', 'PRICE', 'RENDER'] as const;
  const activeMode = progress < PRICE_WIN[0] ? 0 : progress < RENDER_WIN[0] ? 1 : 2;
  const stripY = 258;
  const stripH = 62;
  if (structP > 0) {
    ctx.save();
    ctx.globalAlpha = structP;
    ctx.beginPath();
    ctx.roundRect(p, stripY, cw, stripH, 8);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.10)';
    ctx.lineWidth = LAYOUT.borderWidth;
    ctx.stroke();

    const segW = (cw - 12) / 3;
    modes.forEach((mode, i) => {
      const sx = p + 6 + i * segW;
      const isActive = i === activeMode;
      if (isActive) {
        // Active = white surface shift — never accent (MOBILE.md § 4.1)
        ctx.beginPath();
        ctx.roundRect(sx, stripY + 6, segW, stripH - 12, 6);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.10)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.22)';
        ctx.lineWidth = 1;
        ctx.stroke();
      }
      ctx.font = `500 22px ${MONO}`;
      ctx.fillStyle = isActive ? 'rgba(255, 255, 255, 0.92)' : COLORS.captionLine;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(mode, sx + segW / 2, stripY + stripH / 2 + 1);
    });
    ctx.restore();
  }

  // ===== PLAN CANVAS — the deck drafts itself =====
  const planY = 352;
  const planH = 520;
  panel(ctx, p, planY, cw, planH, structP);

  // Dot grid
  if (structP > 0) {
    ctx.save();
    ctx.globalAlpha = structP * 0.12;
    ctx.fillStyle = '#FFFFFF';
    for (let gx = p + 28; gx < p + cw - 10; gx += 36) {
      for (let gy = planY + 28; gy < planY + planH - 10; gy += 36) {
        ctx.beginPath();
        ctx.arc(gx, gy, 1.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();
  }

  // Deck footprint — 16' × 12' at ~26 px/ft, dimensions left/bottom
  const deckW = 416;
  const deckH = 312;
  const deckX = p + (cw - deckW) / 2 + 22;
  const deckY = planY + 62;

  const perimP = win(progress, DRAW_WIN[0], DRAW_WIN[0] + 0.14);
  const joistP = win(progress, 0.16, 0.30);
  const boardP = win(progress, 0.24, 0.36);
  const stairP = win(progress, 0.30, 0.40);
  const postP = win(progress, 0.34, 0.42);
  const dimP = win(progress, 0.38, DRAW_WIN[1]);

  // Perimeter — traces like a pen
  if (perimP > 0) {
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.lineWidth = 3;
    tracePath(ctx, [
      [deckX, deckY],
      [deckX + deckW, deckY],
      [deckX + deckW, deckY + deckH],
      [deckX, deckY + deckH],
    ], perimP);
    ctx.restore();
  }

  // Joists — 11 verticals @ 16" OC
  if (joistP > 0) {
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.22)';
    ctx.lineWidth = 1.5;
    const joists = 11;
    for (let i = 1; i <= joists; i++) {
      const jp = win(joistP, (i - 1) / joists, i / joists);
      if (jp <= 0) continue;
      const jx = deckX + (deckW / (joists + 1)) * i;
      ctx.globalAlpha = jp;
      ctx.beginPath();
      ctx.moveTo(jx, deckY + 4);
      ctx.lineTo(jx, deckY + 4 + (deckH - 8) * jp);
      ctx.stroke();
    }
    ctx.restore();
  }

  // Decking — horizontal board courses over the joists
  if (boardP > 0) {
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.10)';
    ctx.lineWidth = 1;
    const courses = 13;
    for (let i = 1; i < courses; i++) {
      const bp = win(boardP, (i - 1) / courses, i / courses);
      if (bp <= 0) continue;
      const by = deckY + (deckH / courses) * i;
      ctx.globalAlpha = bp;
      ctx.beginPath();
      ctx.moveTo(deckX + 4, by);
      ctx.lineTo(deckX + 4 + (deckW - 8) * bp, by);
      ctx.stroke();
    }
    ctx.restore();
  }

  // Stairs — three nested treads off the bottom-right corner
  if (stairP > 0) {
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.55)';
    ctx.lineWidth = 2;
    const stW = 128;
    for (let i = 0; i < 3; i++) {
      const sp = win(stairP, i * 0.3, i * 0.3 + 0.5);
      if (sp <= 0) continue;
      const sy = deckY + deckH + 6 + i * 20;
      const sw = stW - i * 22;
      const sx = deckX + deckW - stW + (stW - sw) / 2 - 30;
      ctx.globalAlpha = sp;
      ctx.strokeRect(sx, sy, sw, 16);
    }
    ctx.restore();
  }

  // Posts — rail posts on the perimeter
  if (postP > 0) {
    ctx.save();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.80)';
    const posts: Array<[number, number]> = [];
    for (let i = 0; i <= 4; i++) posts.push([deckX + (deckW / 4) * i, deckY]);
    for (let i = 1; i <= 3; i++) {
      posts.push([deckX, deckY + (deckH / 3) * i]);
      posts.push([deckX + deckW, deckY + (deckH / 3) * i]);
    }
    for (let i = 0; i <= 2; i++) posts.push([deckX + (deckW / 4) * i, deckY + deckH]);
    posts.forEach(([px2, py2], i) => {
      const pp = win(postP, i / posts.length, (i + 2) / posts.length);
      if (pp <= 0) return;
      ctx.globalAlpha = pp;
      ctx.beginPath();
      ctx.arc(px2, py2, 5, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.restore();
  }

  // Dimensions — drafting standard: extension ticks + mono labels
  if (dimP > 0) {
    ctx.save();
    ctx.globalAlpha = dimP * 0.8;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.40)';
    ctx.lineWidth = 1;
    // Bottom span
    const hDimY = deckY + deckH + 76;
    ctx.beginPath(); ctx.moveTo(deckX, hDimY); ctx.lineTo(deckX + deckW, hDimY); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(deckX, hDimY - 8); ctx.lineTo(deckX, hDimY + 8); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(deckX + deckW, hDimY - 8); ctx.lineTo(deckX + deckW, hDimY + 8); ctx.stroke();
    // Left span
    const vDimX = deckX - 42;
    ctx.beginPath(); ctx.moveTo(vDimX, deckY); ctx.lineTo(vDimX, deckY + deckH); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(vDimX - 8, deckY); ctx.lineTo(vDimX + 8, deckY); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(vDimX - 8, deckY + deckH); ctx.lineTo(vDimX + 8, deckY + deckH); ctx.stroke();
    ctx.restore();

    drawText(ctx, "16'-0\"", deckX + deckW / 2, hDimY - 18, `22px ${MONO}`, COLORS.bodyLine, dimP, 'center');
    ctx.save();
    ctx.globalAlpha = dimP;
    ctx.translate(vDimX - 18, deckY + deckH / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.font = `22px ${MONO}`;
    ctx.fillStyle = COLORS.bodyLine;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText("12'-0\"", 0, 0);
    ctx.restore();

    // Area readout — top-right of the plan panel
    drawText(ctx, '192 SQ FT', p + cw - 26, planY + 40, `500 24px ${MONO}`, COLORS.titleLine, dimP, 'right');
  }

  // ===== TAKEOFF — the materials price in =====
  let y = planY + planH + 44;
  const takeoffLabelP = win(progress, PRICE_WIN[0] - 0.04, PRICE_WIN[0] + 0.08);
  sectionLabel(ctx, 'MATERIALS', p, y, takeoffLabelP);
  y += 46;

  const rowH = 56;
  MATERIALS.forEach((mat, i) => {
    const span = (PRICE_WIN[1] - PRICE_WIN[0] - 0.06) / MATERIALS.length;
    const rowP = win(progress, PRICE_WIN[0] + i * span, PRICE_WIN[0] + (i + 1) * span + 0.04);
    drawText(ctx, mat.name, p, y, `500 26px ${MONO}`, COLORS.titleLine, rowP);
    drawText(ctx, mat.spec, p + 250, y, `22px ${MONO}`, COLORS.captionLine, rowP);
    drawText(ctx, fmtUSD(mat.price), p + cw, y, `26px ${MONO}`, COLORS.bodyLine, rowP, 'right');
    y += rowH;
  });

  // Total — counts up as the rows land
  const totalP = win(progress, PRICE_WIN[1] - 0.1, PRICE_WIN[1] + 0.04);
  divider(ctx, p, y - 12, p + cw, totalP);
  y += 26;
  drawText(ctx, 'MATERIALS TOTAL', p, y, `24px ${MONO}`, COLORS.bodyLine, totalP);
  const total = countUp(MATERIALS_TOTAL, phase(progress, PRICE_WIN[0], PRICE_WIN[1]));
  drawText(ctx, fmtUSD(total), p + cw, y, `500 40px ${MONO}`, 'rgba(255, 255, 255, 0.92)', totalP, 'right');

  // ===== CLIENT VIEW — the render + the one accent CTA =====
  y += 58;
  const renderP = win(progress, RENDER_WIN[0], RENDER_WIN[0] + 0.16);
  sectionLabel(ctx, 'CLIENT VIEW', p, y, renderP);
  y += 40;

  const rvH = 236;
  panel(ctx, p, y, cw, rvH, renderP);

  // Isometric deck render — warm composite tones, the "client-ready" beat
  if (renderP > 0) {
    // 2:1 isometric axes
    const ax = 0.866, ay = 0.5;
    const aLen = 210, bLen = 156; // 16' and 12' in iso units
    const tx = p + 92 + bLen * ax;  // top corner, leaving room for the b-axis leftward
    const ty = y + 58;
    const A = [tx + aLen * ax, ty + aLen * ay] as const;          // +a (right-down)
    const B = [A[0] - bLen * ax, A[1] + bLen * ay] as const;      // +b (left-down)
    const C = [tx - bLen * ax, ty + bLen * ay] as const;

    // Deck top — board courses along the a-axis
    const boards = 9;
    for (let i = 0; i < boards; i++) {
      const bp = win(renderP, i / (boards + 3), (i + 3) / (boards + 3));
      if (bp <= 0) continue;
      const f0 = i / boards, f1 = (i + 1) / boards;
      const p0 = [tx - bLen * ax * f0, ty + bLen * ay * f0] as const;
      const p1 = [tx - bLen * ax * f1, ty + bLen * ay * f1] as const;
      ctx.save();
      ctx.globalAlpha = bp;
      ctx.fillStyle = toneAlpha(COLORS.tan, i % 2 === 0 ? 0.34 : 0.24);
      ctx.beginPath();
      ctx.moveTo(p0[0], p0[1]);
      ctx.lineTo(p0[0] + aLen * ax, p0[1] + aLen * ay);
      ctx.lineTo(p1[0] + aLen * ax, p1[1] + aLen * ay);
      ctx.lineTo(p1[0], p1[1]);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    const faceP = win(renderP, 0.35, 0.8);
    if (faceP > 0) {
      ctx.save();
      ctx.globalAlpha = faceP;
      // Front fascia (a-edge at +b) — darker
      const drop = 22;
      ctx.fillStyle = toneAlpha(COLORS.tan, 0.14);
      ctx.beginPath();
      ctx.moveTo(C[0], C[1]);
      ctx.lineTo(B[0], B[1]);
      ctx.lineTo(B[0], B[1] + drop);
      ctx.lineTo(C[0], C[1] + drop);
      ctx.closePath();
      ctx.fill();
      // Side fascia (b-edge at +a) — darkest
      ctx.fillStyle = toneAlpha(COLORS.tan, 0.09);
      ctx.beginPath();
      ctx.moveTo(B[0], B[1]);
      ctx.lineTo(A[0], A[1]);
      ctx.lineTo(A[0], A[1] + drop);
      ctx.lineTo(B[0], B[1] + drop);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    // Rail on the two back edges — posts + top rail
    const railP = win(renderP, 0.45, 1.0);
    if (railP > 0) {
      ctx.save();
      ctx.globalAlpha = railP;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.55)';
      ctx.lineWidth = 2;
      const railH = 40;
      const back: Array<readonly [number, number]> = [];
      for (let i = 0; i <= 4; i++) back.push([tx + (aLen * ax * i) / 4, ty + (aLen * ay * i) / 4]);
      for (let i = 1; i <= 3; i++) back.push([tx - (bLen * ax * i) / 3, ty + (bLen * ay * i) / 3]);
      back.forEach(([bx2, by2]) => {
        ctx.beginPath();
        ctx.moveTo(bx2, by2);
        ctx.lineTo(bx2, by2 - railH);
        ctx.stroke();
      });
      // Top rails
      ctx.beginPath();
      ctx.moveTo(tx, ty - railH);
      ctx.lineTo(A[0], A[1] - railH);
      ctx.moveTo(tx, ty - railH);
      ctx.lineTo(C[0], C[1] - railH);
      ctx.stroke();
      ctx.restore();
    }
  }

  // The CTA — the single accent element in the entire scene
  const ctaP = win(progress, 0.86, 1.0);
  if (ctaP > 0) {
    const ctaW = 300;
    const ctaH = 72;
    const ctaX = p + cw - ctaW - 26;
    const ctaY = y + rvH / 2 - ctaH / 2;
    ctx.save();
    ctx.globalAlpha = ctaP;
    ctx.beginPath();
    ctx.roundRect(ctaX, ctaY, ctaW, ctaH, 10);
    ctx.fillStyle = COLORS.accent;
    ctx.fill();
    ctx.font = `300 27px ${CAKE}`;
    ctx.fillStyle = '#000000';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('SEND TO CLIENT →', ctaX + ctaW / 2, ctaY + ctaH / 2 + 1);
    ctx.restore();
  }

  // ===== CHROME ===== — Deckset wears the device, not the OPS bar
  drawStatusBar(ctx, width, progress);
}
