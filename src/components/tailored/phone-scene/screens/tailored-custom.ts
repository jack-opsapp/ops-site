/**
 * Tailored Custom Screen — The finished product, tier-specific.
 *
 * Setup:     Configured OPS — custom pipeline stages, custom fields.
 * Build:     Deck Designer tool — grid, shape, dimensions, materials.
 * Enterprise: Full deck company suite — membrane orders, railing catalogue, carpentry.
 */

import { COLORS, LAYOUT, TAILORED_COLORS, TEXT, CONTENT_PADDING, CARD_PADDING, TOP_INSET } from '../constants';
import {
  phase, roundedRect, drawText, drawCheck,
  statusBar, bottomNav, FONTS,
} from './draw-helpers';
import type { TailoredScreenDrawParams } from './types';

const P = CONTENT_PADDING;
const CP = CARD_PADDING;

// ─── Setup: Configured OPS ──────────────────────────────────────────────────

function drawSetupTier({ ctx, width, height, progress }: TailoredScreenDrawParams) {
  const cw = width - P * 2;
  const lx = P + CP;
  const rx = P + cw - CP;

  const structP = phase(progress, 0, 0.35);
  const contentP = phase(progress, 0.15, 0.6);
  const detailP = phase(progress, 0.4, 0.8);
  const accentP = phase(progress, 0.6, 1.0);

  statusBar(ctx, width, structP);

  let y = TOP_INSET;

  // Title
  drawText(ctx, 'MAVERICK PROJECTS', P, y, FONTS.titleLg, TEXT.primary, structP);
  y += 44;

  // Badge
  const badgeText = 'Configured by OPS Tailored';
  const badgeW = 260;
  roundedRect(ctx, P, y, badgeW, 34, 3, TAILORED_COLORS.accentGlow, TAILORED_COLORS.accentBorder, contentP);
  drawText(ctx, badgeText, P + badgeW / 2, y + 17, FONTS.labelSm, TAILORED_COLORS.accentText, contentP, 'center');
  y += 60;

  // Pipeline section
  drawText(ctx, 'CUSTOM PIPELINE', P, y, FONTS.labelXs, TEXT.muted, structP);
  y += 28;

  const stages = ['Lead', 'Measure', 'Design', 'Quote', 'Build', 'Inspect'];
  const stageGap = 8;
  const stageW = (cw - (stages.length - 1) * stageGap) / stages.length;
  const activeIdx = 4;

  stages.forEach((s, i) => {
    const sx = P + i * (stageW + stageGap);
    const isActive = i === activeIdx;
    const isPast = i < activeIdx;
    roundedRect(ctx, sx, y, stageW, 42, 3,
      isActive ? TAILORED_COLORS.accentGlow : isPast ? 'rgba(165, 179, 104, 0.08)' : COLORS.cardFill,
      isActive ? TAILORED_COLORS.accentBorder : isPast ? 'rgba(165, 179, 104, 0.25)' : COLORS.border,
      structP,
    );
    drawText(ctx, s, sx + stageW / 2, y + 22, FONTS.labelXs,
      isActive ? TAILORED_COLORS.accentText : isPast ? COLORS.stageAccepted : TEXT.tertiary,
      contentP, 'center');
  });
  y += 42 + 32;

  // ── Card 1: Johnson Deck & Patio ──
  const card1Y = y;
  const card1H = 430;
  roundedRect(ctx, P, card1Y, cw, card1H, LAYOUT.cardRadius, COLORS.cardFill, COLORS.border, structP);

  if (contentP > 0) {
    ctx.save();
    ctx.globalAlpha = contentP;
    ctx.fillStyle = COLORS.stageInProgress;
    ctx.beginPath();
    ctx.roundRect(P, card1Y, 6, card1H, [LAYOUT.cardRadius, 0, 0, LAYOUT.cardRadius]);
    ctx.fill();
    ctx.restore();
  }

  const clx = lx + 6;
  let cy = card1Y + 40;

  drawText(ctx, 'Johnson Deck & Patio', clx, cy, FONTS.bodyMed, TEXT.primary, contentP);
  const badge1W = 118;
  roundedRect(ctx, rx - badge1W, card1Y + 28, badge1W, 32, 4,
    'rgba(196, 168, 104, 0.1)', 'rgba(196, 168, 104, 0.3)', contentP);
  drawText(ctx, 'Build Phase', rx - badge1W / 2, card1Y + 44, FONTS.labelXs,
    COLORS.stageInProgress, contentP, 'center');
  cy += 48;

  drawText(ctx, '1847 Oak Ridge Dr, San Diego', clx, cy, FONTS.labelSm, TEXT.tertiary, contentP);
  cy += 50;

  // Divider
  if (detailP > 0) {
    ctx.save();
    ctx.globalAlpha = detailP * 0.2;
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(clx, cy);
    ctx.lineTo(rx, cy);
    ctx.stroke();
    ctx.restore();
  }
  cy += 38;

  drawText(ctx, 'CUSTOM FIELDS', clx, cy, FONTS.labelXs, TEXT.muted, detailP);
  cy += 40;

  const fields = [
    { label: 'Material', value: 'Trex Composite' },
    { label: 'Sq Ft', value: '240' },
    { label: 'Railing', value: 'Glass Panel' },
    { label: 'Permit', value: '#24-1847' },
    { label: 'Timeline', value: '3 weeks' },
    { label: 'Crew', value: 'Team Alpha' },
  ];

  const colW = (rx - clx - 32) / 2;
  fields.forEach((f, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const fx = clx + col * (colW + 32);
    const fy = cy + row * 68;

    drawText(ctx, f.label, fx, fy, FONTS.labelXs, TEXT.tertiary, detailP);
    drawText(ctx, f.value, fx, fy + 36, FONTS.bodyMed, TEXT.primary, detailP);
  });

  y = card1Y + card1H + 24;

  // ── Card 2 ──
  const card2H = 156;
  roundedRect(ctx, P, y, cw, card2H, LAYOUT.cardRadius, COLORS.cardFill, COLORS.border, accentP);

  if (accentP > 0) {
    ctx.save();
    ctx.globalAlpha = accentP;
    ctx.fillStyle = COLORS.stageEstimated;
    ctx.beginPath();
    ctx.roundRect(P, y, 6, card2H, [LAYOUT.cardRadius, 0, 0, LAYOUT.cardRadius]);
    ctx.fill();
    ctx.restore();
  }

  drawText(ctx, 'Smith Vinyl Membrane', clx, y + 40, FONTS.bodyMed, TEXT.primary, accentP);
  const badge2W = 94;
  roundedRect(ctx, rx - badge2W, y + 28, badge2W, 32, 4,
    'rgba(129, 149, 181, 0.1)', 'rgba(129, 149, 181, 0.3)', accentP);
  drawText(ctx, 'Quoted', rx - badge2W / 2, y + 44, FONTS.labelXs,
    COLORS.stageEstimated, accentP, 'center');

  drawText(ctx, '456 Pine St  \u2022  Duradek 60mil  \u2022  180 sq ft', clx, y + 84, FONTS.labelSm, TEXT.tertiary, accentP);
  drawText(ctx, 'Railing: Cable  \u2022  Permit: Pending', clx, y + 120, FONTS.labelXs, TEXT.muted, accentP);

  bottomNav(ctx, width, height, structP);
}

// ─── Build: Deck Designer ───────────────────────────────────────────────────

function drawBuildTier({ ctx, width, height, progress }: TailoredScreenDrawParams) {
  const cw = width - P * 2;
  const lx = P + CP;
  const rx = P + cw - CP;

  const structP = phase(progress, 0, 0.35);
  const contentP = phase(progress, 0.15, 0.6);
  const detailP = phase(progress, 0.4, 0.8);
  const accentP = phase(progress, 0.6, 1.0);

  statusBar(ctx, width, structP);

  let y = TOP_INSET;

  // Header
  drawText(ctx, '\u2190', P, y, FONTS.title, TEXT.secondary, structP);
  drawText(ctx, 'DECK DESIGNER', P + 44, y, FONTS.caption, TAILORED_COLORS.accentText, structP);
  y += 46;
  drawText(ctx, 'Johnson Residence', P, y, FONTS.title, TEXT.primary, structP);
  drawText(ctx, "16' \u00D7 12'  \u2022  Composite", rx, y, FONTS.labelSm, TEXT.tertiary, contentP, 'right');
  y += 44;

  // Grid Canvas
  const gridY = y;
  const gridH = 460;
  roundedRect(ctx, P, gridY, cw, gridH, LAYOUT.cardRadius, 'rgba(255,255,255,0.02)', 'rgba(255,255,255,0.08)', structP);

  if (structP > 0) {
    ctx.save();
    ctx.globalAlpha = structP * 0.1;
    ctx.fillStyle = '#fff';
    for (let gx = P + 24; gx < P + cw; gx += 32) {
      for (let gy = gridY + 24; gy < gridY + gridH; gy += 32) {
        ctx.beginPath();
        ctx.arc(gx, gy, 1.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();
  }

  const deckMargin = 80;
  const deckX = P + deckMargin;
  const deckY = gridY + 50;
  const deckW = cw - deckMargin * 2;
  const deckH = 260;

  if (contentP > 0) {
    ctx.save();
    ctx.globalAlpha = contentP;
    ctx.fillStyle = TAILORED_COLORS.accentGlow;
    ctx.beginPath();
    ctx.roundRect(deckX, deckY, deckW, deckH, 4);
    ctx.fill();
    ctx.strokeStyle = TAILORED_COLORS.accentBorder;
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();
  }

  if (detailP > 0) {
    ctx.save();
    ctx.globalAlpha = detailP * 0.18;
    ctx.strokeStyle = TAILORED_COLORS.accentText;
    ctx.lineWidth = 1;
    for (let by = deckY + 20; by < deckY + deckH; by += 20) {
      ctx.beginPath();
      ctx.moveTo(deckX + 6, by);
      ctx.lineTo(deckX + deckW - 6, by);
      ctx.stroke();
    }
    ctx.restore();
  }

  if (detailP > 0) {
    ctx.save();
    ctx.globalAlpha = detailP * 0.65;
    ctx.fillStyle = TEXT.primary;
    const ps = 55;
    for (let px = deckX; px <= deckX + deckW; px += ps) {
      ctx.beginPath(); ctx.arc(px, deckY, 4, 0, Math.PI * 2); ctx.fill();
    }
    for (let py = deckY + ps; py <= deckY + deckH; py += ps) {
      ctx.beginPath(); ctx.arc(deckX, py, 4, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(deckX + deckW, py, 4, 0, Math.PI * 2); ctx.fill();
    }
    for (let px = deckX; px <= deckX + deckW * 0.55; px += ps) {
      ctx.beginPath(); ctx.arc(px, deckY + deckH, 4, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
  }

  if (detailP > 0) {
    const stX = deckX + deckW * 0.6;
    const stBW = deckW * 0.4;
    for (let i = 0; i < 3; i++) {
      const sy = deckY + deckH + i * 18 + 4;
      const sw = stBW - i * 18;
      const sx = stX + (stBW - sw) / 2;
      ctx.save();
      ctx.globalAlpha = detailP * 0.45;
      ctx.fillStyle = TAILORED_COLORS.accentOverlay;
      ctx.strokeStyle = TAILORED_COLORS.accentBorder;
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.roundRect(sx, sy, sw, 14, 2); ctx.fill(); ctx.stroke();
      ctx.restore();
    }
  }

  if (accentP > 0) {
    ctx.save();
    ctx.globalAlpha = accentP * 0.8;
    ctx.strokeStyle = TEXT.tertiary;
    ctx.lineWidth = 1;
    const hDimY = deckY + deckH + 66;
    ctx.beginPath(); ctx.moveTo(deckX, hDimY); ctx.lineTo(deckX + deckW, hDimY); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(deckX, hDimY - 8); ctx.lineTo(deckX, hDimY + 8); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(deckX + deckW, hDimY - 8); ctx.lineTo(deckX + deckW, hDimY + 8); ctx.stroke();
    drawText(ctx, "16'", deckX + deckW / 2, hDimY - 16, FONTS.caption, TAILORED_COLORS.accentText, 1, 'center');
    const vDimX = deckX - 36;
    ctx.beginPath(); ctx.moveTo(vDimX, deckY); ctx.lineTo(vDimX, deckY + deckH); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(vDimX - 8, deckY); ctx.lineTo(vDimX + 8, deckY); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(vDimX - 8, deckY + deckH); ctx.lineTo(vDimX + 8, deckY + deckH); ctx.stroke();
    ctx.save();
    ctx.translate(vDimX - 16, deckY + deckH / 2);
    ctx.rotate(-Math.PI / 2);
    drawText(ctx, "12'", 0, 0, FONTS.caption, TAILORED_COLORS.accentText, 1, 'center');
    ctx.restore();
    ctx.restore();
  }

  y = gridY + gridH + 24;

  // Tool Palette
  const toolGap = 12;
  const toolW = (cw - toolGap * 3) / 4;
  const toolH = 60;
  const tools = ['Grid', 'Boards', 'Railing', 'Steps'];

  tools.forEach((name, i) => {
    const tx = P + i * (toolW + toolGap);
    const isActive = i === 1;
    roundedRect(ctx, tx, y, toolW, toolH, 4,
      isActive ? TAILORED_COLORS.accentGlow : COLORS.cardFill,
      isActive ? TAILORED_COLORS.accentBorder : COLORS.border,
      contentP,
    );
    if (contentP > 0) {
      const icx = tx + toolW / 2;
      const icy = y + 22;
      ctx.save();
      ctx.globalAlpha = contentP;
      ctx.strokeStyle = isActive ? TAILORED_COLORS.accentText : TEXT.tertiary;
      ctx.lineWidth = 1.5;
      if (i === 0) {
        for (const ox of [-6, 5]) for (const oy of [-6, 5]) ctx.strokeRect(icx + ox - 3, icy + oy - 3, 6, 6);
      } else if (i === 1) {
        for (let li = -1; li <= 1; li++) { ctx.beginPath(); ctx.moveTo(icx - 8, icy + li * 6); ctx.lineTo(icx + 8, icy + li * 6); ctx.stroke(); }
      } else if (i === 2) {
        for (const ox of [-7, 0, 7]) { ctx.beginPath(); ctx.moveTo(icx + ox, icy - 7); ctx.lineTo(icx + ox, icy + 7); ctx.stroke(); }
        ctx.beginPath(); ctx.moveTo(icx - 9, icy - 7); ctx.lineTo(icx + 9, icy - 7); ctx.stroke();
      } else {
        ctx.beginPath(); ctx.moveTo(icx - 8, icy - 6); ctx.lineTo(icx, icy - 6); ctx.lineTo(icx, icy); ctx.lineTo(icx + 8, icy); ctx.lineTo(icx + 8, icy + 6); ctx.stroke();
      }
      ctx.restore();
    }
    drawText(ctx, name, tx + toolW / 2, y + 48, FONTS.labelXs,
      isActive ? TAILORED_COLORS.accentText : TEXT.tertiary, contentP, 'center');
  });
  y += toolH + 22;

  // Material Card
  const matH = 142;
  roundedRect(ctx, P, y, cw, matH, LAYOUT.cardRadius, COLORS.cardFill, COLORS.border, contentP);
  drawText(ctx, 'MATERIAL', lx, y + 34, FONTS.labelXs, TEXT.muted, detailP);
  drawText(ctx, 'Trex Composite Decking', lx, y + 68, FONTS.bodyMed, TEXT.primary, detailP);
  if (detailP > 0) {
    ctx.save();
    ctx.globalAlpha = detailP;
    ctx.fillStyle = '#C4A868';
    ctx.beginPath(); ctx.roundRect(lx, y + 96, 22, 14, 3); ctx.fill();
    ctx.restore();
  }
  drawText(ctx, 'Toasted Sand', lx + 36, y + 104, FONTS.labelSm, TEXT.secondary, detailP);
  drawText(ctx, '$4.25/ft', rx, y + 68, FONTS.caption, TEXT.secondary, detailP, 'right');
  y += matH + 20;

  // Estimate Bar
  const estH = 100;
  roundedRect(ctx, P, y, cw, estH, LAYOUT.cardRadius, TAILORED_COLORS.accentGlow, TAILORED_COLORS.accentBorder, accentP);
  drawText(ctx, 'Est. Materials', lx, y + 34, FONTS.labelSm, TEXT.secondary, accentP);
  drawText(ctx, '$4,847', lx, y + 72, FONTS.price, TAILORED_COLORS.accentText, accentP);
  drawText(ctx, 'Generate Quote \u2192', rx, y + 54, FONTS.caption, TAILORED_COLORS.accentText, accentP, 'right');

  bottomNav(ctx, width, height, structP);
}

// ─── Enterprise: Full Deck Company Suite ─────────────────────────────────────

function drawEnterpriseTier({ ctx, width, height, progress }: TailoredScreenDrawParams) {
  const cw = width - P * 2;
  const lx = P + CP;
  const rx = P + cw - CP;

  const structP = phase(progress, 0, 0.3);
  const contentP = phase(progress, 0.12, 0.55);
  const detailP = phase(progress, 0.35, 0.75);
  const accentP = phase(progress, 0.55, 1.0);

  statusBar(ctx, width, structP);

  let y = TOP_INSET;

  // Header
  drawText(ctx, 'MAVERICK OPERATIONS', P, y, FONTS.titleLg, TEXT.primary, structP);
  y += 44;

  // Tabs
  const tabs = ['Overview', 'Materials', 'Catalogue', 'Carpentry'];
  let tabX = P;
  tabs.forEach((t, i) => {
    const isActive = i === 1;
    const tw = 130;
    if (isActive && contentP > 0) {
      ctx.save();
      ctx.globalAlpha = contentP;
      ctx.fillStyle = TAILORED_COLORS.accentText;
      ctx.fillRect(tabX, y + 22, tw - 16, 2);
      ctx.restore();
    }
    drawText(ctx, t, tabX, y + 8, FONTS.labelSm,
      isActive ? TAILORED_COLORS.accentText : TEXT.tertiary, contentP);
    tabX += tw;
  });
  y += 52;

  // Vinyl Membrane Orders
  drawText(ctx, 'VINYL MEMBRANE ORDERS', P, y, FONTS.labelXs, TEXT.muted, structP);
  y += 30;

  // Order cards
  const oH = 148;
  for (let oi = 0; oi < 2; oi++) {
    const isFirst = oi === 0;
    const oP = isFirst ? contentP : detailP;
    roundedRect(ctx, P, y, cw, oH, LAYOUT.cardRadius, COLORS.cardFill, COLORS.border, isFirst ? structP : contentP);

    drawText(ctx, isFirst ? 'PO-2847' : 'PO-2851', lx, y + 38, FONTS.bodyMed, TEXT.primary, oP);
    drawText(ctx, isFirst ? 'Duradek  \u2022  Ultra Classic Walk-on' : 'Econodek  \u2022  Premium 60mil',
      lx, y + 76, FONTS.labelSm, TEXT.secondary, oP);
    drawText(ctx, isFirst ? 'Delivery: Apr 8' : 'Delivery: Apr 14', lx, y + 112, FONTS.labelXs, TEXT.tertiary, oP);

    const sbLabel = isFirst ? 'Shipped' : 'Processing';
    const sbColor = isFirst ? COLORS.stageAccepted : COLORS.stageInProgress;
    const sbBg = isFirst ? 'rgba(165, 179, 104, 0.1)' : 'rgba(196, 168, 104, 0.1)';
    const sbBorder = isFirst ? 'rgba(165, 179, 104, 0.3)' : 'rgba(196, 168, 104, 0.3)';
    const sbW = isFirst ? 96 : 114;
    roundedRect(ctx, rx - sbW, y + 28, sbW, 34, 4, sbBg, sbBorder, oP);
    drawText(ctx, sbLabel, rx - sbW / 2, y + 45, FONTS.labelXs, sbColor, oP, 'center');

    y += oH + 18;
  }
  y += 18;

  // Railing Catalogue
  drawText(ctx, 'RAILING CATALOGUE', P, y, FONTS.labelXs, TEXT.muted, detailP);
  y += 30;

  const railings = [
    { name: 'Glass Panel', stock: '12 in stock', color: 'rgba(160, 200, 230, 0.3)' },
    { name: 'Cable Rail', stock: '8 in stock', color: 'rgba(180, 180, 180, 0.25)' },
    { name: 'Aluminum', stock: '24 in stock', color: 'rgba(200, 200, 210, 0.2)' },
    { name: 'Cedar Wood', stock: '6 in stock', color: 'rgba(196, 168, 104, 0.25)' },
  ];

  const railGap = 14;
  const railW = (cw - railGap) / 2;
  const railH = 108;

  railings.forEach((r, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const rcx = P + col * (railW + railGap);
    const rcy = y + row * (railH + railGap);
    const rP = phase(accentP, i * 0.1, i * 0.1 + 0.5);

    roundedRect(ctx, rcx, rcy, railW, railH, 4, COLORS.cardFill, COLORS.border, rP);

    if (rP > 0) {
      ctx.save();
      ctx.globalAlpha = rP;
      ctx.fillStyle = r.color;
      ctx.beginPath();
      ctx.roundRect(rcx, rcy, railW, 6, [4, 4, 0, 0]);
      ctx.fill();
      ctx.restore();
    }

    const rlx = rcx + 22;
    drawText(ctx, r.name, rlx, rcy + 44, FONTS.bodyMed, TEXT.primary, rP);
    drawText(ctx, r.stock, rlx, rcy + 82, FONTS.labelXs, TEXT.tertiary, rP);
  });
  y += 2 * (railH + railGap) + 30;

  // Carpentry Projects
  drawText(ctx, 'CARPENTRY PROJECTS', P, y, FONTS.labelXs, TEXT.muted, accentP);
  y += 30;

  const projects = [
    { name: 'Custom Pergola', client: 'Miller Residence', status: 'In Progress', color: COLORS.stageInProgress },
    { name: 'Cedar Privacy Wall', client: 'Thompson', status: 'Quoted', color: COLORS.stageEstimated },
  ];

  const pH = 92;
  projects.forEach((proj, i) => {
    const pP = phase(accentP, 0.2 + i * 0.15, 0.7 + i * 0.15);
    roundedRect(ctx, P, y, cw, pH, LAYOUT.cardRadius, COLORS.cardFill, COLORS.border, pP);

    if (pP > 0) {
      ctx.save();
      ctx.globalAlpha = pP;
      ctx.fillStyle = proj.color;
      ctx.beginPath();
      ctx.roundRect(P, y, 5, pH, [LAYOUT.cardRadius, 0, 0, LAYOUT.cardRadius]);
      ctx.fill();
      ctx.restore();
    }

    const plx = lx + 4;
    drawText(ctx, proj.name, plx, y + 34, FONTS.bodyMed, TEXT.primary, pP);
    drawText(ctx, proj.client, plx, y + 66, FONTS.labelXs, TEXT.tertiary, pP);

    const sbW = 110;
    roundedRect(ctx, rx - sbW, y + 28, sbW, 34, 4, 'rgba(255,255,255,0.03)', undefined, pP);
    drawText(ctx, proj.status, rx - sbW / 2, y + 45, FONTS.labelXs, proj.color, pP, 'center');

    y += pH + 18;
  });

  bottomNav(ctx, width, height, structP);
}

// ─── Dispatch ────────────────────────────────────────────────────────────────

export function drawTailoredCustom(params: TailoredScreenDrawParams) {
  const tier = params.tier ?? 'build';
  switch (tier) {
    case 'setup':
      return drawSetupTier(params);
    case 'enterprise':
      return drawEnterpriseTier(params);
    case 'build':
    default:
      return drawBuildTier(params);
  }
}
