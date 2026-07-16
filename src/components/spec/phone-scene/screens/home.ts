/**
 * HOME — the real OPS app, hero phase.
 *
 * The visitor's first read: this is real software a business runs on, not a
 * mock. Map view with the next task and live job pins, adapted from the
 * platform scene's iOS-audited home exemplar (AppHeader / EventCarousel /
 * MapFilterChips / OPSMapContainer) onto the SPEC persona:
 *
 *   RAY — owner, CASCADE DECK & RAIL, San Diego.
 *
 * One company carries every screen in the scene; the page's scroll then
 * climbs it up the SPEC ladder (wire it → run it → own it).
 */

import { COLORS, LAYOUT, STATUS } from '../constants';
import { getMapImage } from '../hardware/canvas-fonts';
import { drawRoundedRect, drawCircle, drawMapPin, drawTabBar, drawStatusBar, drawFAB, phase } from './chrome';
import { CAKE, MOHAVE, MONO, drawText, toneAlpha } from './kit';
import type { SpecScreenDrawParams } from './types';

export function drawHome({ ctx, width, height, progress }: SpecScreenDrawParams) {
  const p = LAYOUT.padding;
  const contentWidth = width - p * 2;

  const structP = phase(progress, 0, 0.5);
  const contentP = phase(progress, 0.33, 0.83);
  const accentP = phase(progress, 0.67, 1.0);

  // ===== FULL-BLEED MAP BACKGROUND =====
  // Mapbox dark tile covers the whole screen; all UI layers on top.
  const mapAlpha = phase(progress, 0.15, 0.65);
  const mapImg = getMapImage();
  if (mapAlpha > 0 && mapImg) {
    const imgW = mapImg.naturalWidth;
    const imgH = mapImg.naturalHeight;
    const coverScale = Math.max(width / imgW, height / imgH);
    const drawW = imgW * coverScale;
    const drawH = imgH * coverScale;
    ctx.save();
    ctx.globalAlpha = mapAlpha;
    ctx.drawImage(mapImg, (width - drawW) / 2, (height - drawH) / 2, drawW, drawH);
    ctx.restore();
  }

  // Top gradient: black → transparent so the status bar + greeting read
  if (mapAlpha > 0) {
    ctx.save();
    ctx.globalAlpha = mapAlpha;
    const gradH = 280;
    const grad = ctx.createLinearGradient(0, 0, 0, gradH);
    grad.addColorStop(0, 'rgba(0, 0, 0, 1.0)');
    grad.addColorStop(0.4, 'rgba(0, 0, 0, 0.85)');
    grad.addColorStop(0.7, 'rgba(0, 0, 0, 0.4)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, gradH);
    ctx.restore();
  }

  const headerY = 120;

  // ===== APP HEADER =====
  // Avatar — initials disc, white ring (AppHeader avatarButton anatomy)
  const avatarR = 52;
  const avatarCx = width - p - avatarR - 4;
  const avatarCy = headerY + 41;
  if (structP > 0) {
    ctx.save();
    ctx.globalAlpha = structP;
    ctx.beginPath();
    ctx.arc(avatarCx, avatarCy, avatarR, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.fill();
    ctx.strokeStyle = COLORS.titleLine;
    ctx.lineWidth = 4;
    ctx.stroke();
    ctx.restore();
    drawText(ctx, 'R', avatarCx, avatarCy + 2, `500 42px ${MOHAVE}`, COLORS.titleLine, structP, 'center');
  }

  // Notification bell badge — bottom-left of avatar
  if (structP > 0) {
    const bx = avatarCx - avatarR * 0.55;
    const by = avatarCy + avatarR * 0.55;
    ctx.save();
    ctx.globalAlpha = structP;
    ctx.beginPath();
    ctx.arc(bx, by, 22, 0, Math.PI * 2);
    ctx.fillStyle = '#0A0A0A';
    ctx.fill();
    ctx.fillStyle = COLORS.titleLine;
    ctx.strokeStyle = COLORS.titleLine;
    ctx.lineWidth = 1.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    // Knob
    ctx.beginPath();
    ctx.arc(bx, by - 12, 2, 0, Math.PI * 2);
    ctx.fill();
    // Dome + flared brim
    ctx.beginPath();
    ctx.moveTo(bx - 3, by - 10);
    ctx.bezierCurveTo(bx - 10, by - 8, bx - 10, by - 2, bx - 10, by + 1);
    ctx.lineTo(bx - 12, by + 4);
    ctx.lineTo(bx + 12, by + 4);
    ctx.lineTo(bx + 10, by + 1);
    ctx.bezierCurveTo(bx + 10, by - 2, bx + 10, by - 8, bx + 3, by - 10);
    ctx.closePath();
    ctx.fill();
    // Clapper
    ctx.beginPath();
    ctx.arc(bx, by + 7, 3, 0, Math.PI);
    ctx.stroke();
    ctx.restore();
  }

  // Greeting — AppHeader home title: Cake Mono Light, UPPERCASED
  drawText(ctx, 'GOOD MORNING, RAY', p, headerY + 14, `300 44px ${CAKE}`, COLORS.titleLine, structP);

  // Company row + crew status (olive = crews active, semantic)
  const companyY = headerY + 68;
  drawText(ctx, 'CASCADE DECK & RAIL', p, companyY, `28px ${MONO}`, COLORS.captionLine, structP);
  if (structP > 0) {
    ctx.save();
    ctx.globalAlpha = structP;
    ctx.font = `28px ${MONO}`;
    const companyW = ctx.measureText('CASCADE DECK & RAIL').width;
    const dotX = p + companyW + 16;
    ctx.beginPath();
    ctx.arc(dotX, companyY, 6, 0, Math.PI * 2);
    ctx.fillStyle = COLORS.olive;
    ctx.fill();
    ctx.font = `24px ${MONO}`;
    ctx.fillStyle = COLORS.olive;
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'left';
    ctx.fillText('2 CREWS OUT', dotX + 14, companyY);
    ctx.restore();
  }

  // ===== NEXT-TASK CARD (EventCardView anatomy) =====
  const cardY = companyY + 44;
  const cardH = 191;

  // Frosted glass: clip to card, blur what's beneath, overlay tint
  if (structP > 0) {
    ctx.save();
    ctx.globalAlpha = structP;
    ctx.beginPath();
    ctx.roundRect(p, cardY, contentWidth, cardH, LAYOUT.cardRadius);
    ctx.clip();
    ctx.filter = 'blur(16px)';
    ctx.drawImage(ctx.canvas, 0, 0, ctx.canvas.width, ctx.canvas.height, 0, 0, width, height);
    ctx.filter = 'none';
    ctx.fillStyle = 'rgba(10, 10, 10, 0.45)';
    ctx.fillRect(p, cardY, contentWidth, cardH);
    ctx.restore();

    ctx.save();
    ctx.globalAlpha = structP;
    ctx.strokeStyle = COLORS.border;
    ctx.lineWidth = LAYOUT.borderWidth;
    ctx.beginPath();
    ctx.roundRect(p, cardY, contentWidth, cardH, LAYOUT.cardRadius);
    ctx.stroke();
    ctx.restore();
  }

  // Colored left border — tan: today's task is a site visit (semantic)
  if (accentP > 0) {
    ctx.save();
    ctx.globalAlpha = accentP;
    ctx.fillStyle = COLORS.tan;
    ctx.beginPath();
    ctx.roundRect(p, cardY, 12, cardH, [LAYOUT.cardRadius, 0, 0, LAYOUT.cardRadius]);
    ctx.fill();
    ctx.restore();
  }

  // Card content — cardTitle Mohave-Medium UPPERCASED / cardBody Mohave
  drawText(ctx, 'JOHNSON DECK — SITE MEASURE', p + 24, cardY + 52, `500 36px ${MOHAVE}`, COLORS.titleLine, contentP);
  drawText(ctx, 'M. Johnson', p + 24, cardY + 100, `28px ${MOHAVE}`, COLORS.bodyLine, contentP);
  drawText(ctx, '1847 Oak Ridge Dr, San Diego', p + 24, cardY + 140, `28px ${MOHAVE}`, COLORS.captionLine, contentP);

  // Stage badge — SITE VISIT (tan soft/line/tone, real OPSTag anatomy)
  const badgeW = 170;
  const badgeH = 38;
  const badgeX = width - p - badgeW - 18;
  const badgeY = cardY + cardH - 56;
  drawRoundedRect(ctx, badgeX, badgeY, badgeW, badgeH, LAYOUT.smallRadius,
    toneAlpha(COLORS.tan, 0.30), toneAlpha(COLORS.tan, 0.10), contentP);
  drawText(ctx, 'SITE VISIT', badgeX + badgeW / 2, badgeY + badgeH / 2,
    `24px ${MONO}`, COLORS.tan, contentP, 'center');

  // Carousel page dots — top-right inside card
  const dotSpacing = 22;
  const dotStartX = width - p - 28 - 4 * dotSpacing;
  const dotY = cardY + 32;
  for (let i = 0; i < 5; i++) {
    const isActive = i === 0;
    const dotColor = isActive ? COLORS.titleLine : 'rgba(255, 255, 255, 0.10)';
    drawCircle(ctx, dotStartX + i * dotSpacing, dotY, 7, dotColor, dotColor, contentP);
  }

  // ===== MAP FILTER CHIPS (MapFilterChips anatomy) =====
  const chipY = cardY + cardH + 32;
  const chips = ['TODAY [TASKS]', 'ACTIVE', 'ALL'];
  const chipH = 44;
  let chipX = p;
  for (let i = 0; i < 3; i++) {
    const isSelected = i === 0;
    const stroke = isSelected ? 'rgba(255, 255, 255, 0.35)' : 'rgba(255, 255, 255, 0.10)';
    const textColor = isSelected ? COLORS.titleLine : COLORS.captionLine;

    ctx.save();
    ctx.font = `24px ${MONO}`;
    const textW = ctx.measureText(chips[i]).width;
    ctx.restore();
    const chipW = textW + 48;

    if (contentP > 0) {
      ctx.save();
      ctx.globalAlpha = contentP;
      ctx.beginPath();
      ctx.roundRect(chipX, chipY, chipW, chipH, LAYOUT.cardRadius);
      ctx.clip();
      ctx.filter = 'blur(16px)';
      ctx.drawImage(ctx.canvas, 0, 0, ctx.canvas.width, ctx.canvas.height, 0, 0, width, height);
      ctx.filter = 'none';
      ctx.fillStyle = 'rgba(10, 10, 10, 0.45)';
      ctx.fillRect(chipX, chipY, chipW, chipH);
      ctx.restore();

      ctx.save();
      ctx.globalAlpha = contentP;
      ctx.strokeStyle = stroke;
      ctx.lineWidth = LAYOUT.borderWidth;
      ctx.beginPath();
      ctx.roundRect(chipX, chipY, chipW, chipH, LAYOUT.cardRadius);
      ctx.stroke();
      ctx.restore();
    }

    drawText(ctx, chips[i], chipX + chipW / 2, chipY + chipH / 2, `24px ${MONO}`, textColor, contentP, 'center');
    chipX += chipW + 16;
  }

  // ===== MAP PINS (ProjectAnnotationRenderer anatomy) =====
  const mapContentY = chipY + 58;
  const mapContentH = LAYOUT.tabBarY - mapContentY - 10;

  const drawPinLabel = (text: string, x: number, y: number, prog: number) => {
    if (prog <= 0) return;
    const font = `22px ${MONO}`;
    ctx.save();
    ctx.font = font;
    const textW = ctx.measureText(text).width;
    ctx.restore();

    // Radial gradient backdrop — solid center fading to clear
    const gradRx = textW / 2 + 30;
    const gradRy = 24;
    ctx.save();
    ctx.globalAlpha = prog;
    ctx.translate(x, y);
    ctx.scale(gradRx / gradRy, 1);
    const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, gradRy);
    grad.addColorStop(0, 'rgba(0, 0, 0, 0.40)');
    grad.addColorStop(0.6, 'rgba(0, 0, 0, 0.25)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(-gradRy, -gradRy, gradRy * 2, gradRy * 2);
    ctx.restore();

    ctx.save();
    ctx.globalAlpha = prog;
    ctx.font = font;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    ctx.shadowBlur = 4;
    ctx.shadowOffsetY = 1;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.90)';
    ctx.fillText(text, x, y);
    ctx.restore();
  };

  const labelOffset = 44;

  // Dot = task type tone, ring = pipeline status color — the persona's live board
  const pin1X = width * 0.38, pin1Y = mapContentY + mapContentH * 0.42;
  drawMapPin(ctx, pin1X, pin1Y, COLORS.tan, STATUS.inProgress, accentP);
  drawPinLabel('Johnson Deck', pin1X, pin1Y - labelOffset, accentP);

  const pin2X = width * 0.60, pin2Y = mapContentY + mapContentH * 0.18;
  drawMapPin(ctx, pin2X, pin2Y, COLORS.olive, STATUS.accepted, accentP);
  drawPinLabel('Miller Re-Rail', pin2X, pin2Y - labelOffset, accentP);

  const pin3X = width * 0.25, pin3Y = mapContentY + mapContentH * 0.70;
  drawMapPin(ctx, pin3X, pin3Y, STATUS.estimated, STATUS.estimated, accentP);
  drawPinLabel('Vista Duradek', pin3X, pin3Y - labelOffset, accentP);

  // ===== MAP CONTROL BUTTONS =====
  const btnR = 32;
  const btnX = width - p - btnR - 8;
  const btnBaseY = mapContentY + mapContentH * 0.32;
  const btnGap = 76;

  if (accentP > 0) {
    // Location button — location.fill arrow
    ctx.save();
    ctx.globalAlpha = accentP;
    ctx.beginPath();
    ctx.arc(btnX, btnBaseY, btnR, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(10, 10, 10, 0.85)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.20)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.restore();

    ctx.save();
    ctx.globalAlpha = accentP * 0.85;
    ctx.translate(btnX, btnBaseY);
    ctx.rotate(-Math.PI / 4);
    ctx.fillStyle = COLORS.titleLine;
    ctx.beginPath();
    ctx.moveTo(0, -14);
    ctx.lineTo(8, 10);
    ctx.lineTo(0, 4);
    ctx.lineTo(-8, 10);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // Person button — person.fill silhouette
    const py2 = btnBaseY + btnGap;
    ctx.save();
    ctx.globalAlpha = accentP;
    ctx.beginPath();
    ctx.arc(btnX, py2, btnR, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(10, 10, 10, 0.85)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.20)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.restore();

    ctx.save();
    ctx.globalAlpha = accentP * 0.85;
    ctx.fillStyle = COLORS.titleLine;
    ctx.beginPath();
    ctx.arc(btnX, py2 - 7, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(btnX - 13, py2 + 14);
    ctx.quadraticCurveTo(btnX - 13, py2 + 3, btnX, py2 + 2);
    ctx.quadraticCurveTo(btnX + 13, py2 + 3, btnX + 13, py2 + 14);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  // ===== CHROME =====
  drawTabBar(ctx, 'home', width, LAYOUT.tabBarY, progress);
  drawStatusBar(ctx, width, progress);
  drawFAB(ctx, width, LAYOUT.tabBarY, progress);
}
