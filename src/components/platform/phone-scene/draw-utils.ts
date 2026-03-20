/**
 * Canvas 2D drawing utilities for wireframe screens.
 * Every function draws with a progress parameter (0-1) for draw-in animation.
 */

import { COLORS, LAYOUT } from './constants';

/** Draw a rounded rectangle outline */
export function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
  strokeColor: string,
  fillColor?: string,
  progress = 1,
) {
  if (progress <= 0) return;
  ctx.save();
  ctx.globalAlpha = progress;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
  if (fillColor) {
    ctx.fillStyle = fillColor;
    ctx.fill();
  }
  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = LAYOUT.borderWidth;
  ctx.stroke();
  ctx.restore();
}

/** Draw a horizontal content line (text placeholder) */
export function drawContentLine(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  weight: 'title' | 'body' | 'caption',
  progress = 1,
) {
  if (progress <= 0) return;
  const colorMap = {
    title: COLORS.titleLine,
    body: COLORS.bodyLine,
    caption: COLORS.captionLine,
  };
  const thicknessMap = { title: 4, body: 2.5, caption: 1.5 }; // Boosted for 3D texture

  ctx.save();
  ctx.globalAlpha = progress;
  ctx.strokeStyle = colorMap[weight];
  ctx.lineWidth = thicknessMap[weight];
  ctx.beginPath();
  // Line draws from left to right based on progress
  ctx.moveTo(x, y);
  ctx.lineTo(x + width * Math.min(progress * 1.5, 1), y);
  ctx.stroke();
  ctx.restore();
}

/** Draw a colored left border on a card (kanban/schedule stage indicator) */
export function drawColoredLeftBorder(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  height: number,
  color: string,
  progress = 1,
) {
  if (progress <= 0) return;
  ctx.save();
  ctx.globalAlpha = progress;
  ctx.fillStyle = color;
  ctx.fillRect(x, y, LAYOUT.coloredBorderWidth, height * progress);
  ctx.restore();
}

/** Draw a circle (for icons, avatars, dots) */
export function drawCircle(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number,
  strokeColor: string,
  fillColor?: string,
  progress = 1,
) {
  if (progress <= 0) return;
  ctx.save();
  ctx.globalAlpha = progress;
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  if (fillColor) {
    ctx.fillStyle = fillColor;
    ctx.fill();
  }
  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = LAYOUT.borderWidth;
  ctx.stroke();
  ctx.restore();
}

/** Draw a pin marker with radial glow */
export function drawMapPin(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  progress = 1,
) {
  if (progress <= 0) return;
  ctx.save();
  ctx.globalAlpha = progress;

  // Radial glow
  const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, LAYOUT.pinSize * 2.5);
  gradient.addColorStop(0, COLORS.accentGlow);
  gradient.addColorStop(1, 'transparent');
  ctx.fillStyle = gradient;
  ctx.fillRect(cx - LAYOUT.pinSize * 3, cy - LAYOUT.pinSize * 3, LAYOUT.pinSize * 6, LAYOUT.pinSize * 6);

  // Pin circle
  ctx.beginPath();
  ctx.arc(cx, cy, LAYOUT.pinSize / 2, 0, Math.PI * 2);
  ctx.fillStyle = COLORS.accent;
  ctx.fill();
  ctx.restore();
}

/** Draw a chevron (>) for list items */
export function drawChevron(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  progress = 1,
) {
  if (progress <= 0) return;
  ctx.save();
  ctx.globalAlpha = progress * 0.4; // Chevrons are subtle
  ctx.strokeStyle = COLORS.bodyLine;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(x, y - size / 2);
  ctx.lineTo(x + size / 2, y);
  ctx.lineTo(x, y + size / 2);
  ctx.stroke();
  ctx.restore();
}

/** Draw a progress bar with colored segments */
export function drawProgressBar(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  totalWidth: number,
  segments: { color: string; fraction: number }[],
  progress = 1,
) {
  if (progress <= 0) return;
  ctx.save();
  ctx.globalAlpha = progress;
  let offsetX = x;
  for (const seg of segments) {
    const segWidth = totalWidth * seg.fraction;
    ctx.fillStyle = seg.color;
    ctx.fillRect(offsetX, y, segWidth * progress, 3);
    offsetX += segWidth + 4; // 4px gap between segments
  }
  ctx.restore();
}

/** Draw tab bar with 4 icons and active indicator */
export function drawTabBar(
  ctx: CanvasRenderingContext2D,
  activeIndex: number,
  canvasWidth: number,
  tabBarY: number,
  progress = 1,
) {
  if (progress <= 0) return;
  const tabWidth = canvasWidth / 4;
  const iconY = tabBarY + 55;

  ctx.save();
  ctx.globalAlpha = progress;

  // Separator line above tab bar
  ctx.strokeStyle = COLORS.separator;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, tabBarY + 10);
  ctx.lineTo(canvasWidth, tabBarY + 10);
  ctx.stroke();

  for (let i = 0; i < 4; i++) {
    const cx = tabWidth * i + tabWidth / 2;
    const isActive = i === activeIndex;

    // Active indicator line above icon
    if (isActive) {
      ctx.strokeStyle = COLORS.accent;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(cx - 15, tabBarY + 15);
      ctx.lineTo(cx + 15, tabBarY + 15);
      ctx.stroke();
    }

    // Icon strokes (simplified SF Symbols)
    ctx.strokeStyle = isActive ? COLORS.accent : COLORS.bodyLine;
    ctx.lineWidth = 1.5;
    ctx.fillStyle = 'transparent';

    drawTabIcon(ctx, i, cx, iconY);
  }

  ctx.restore();
}

/** Draw individual tab icons (simplified SF Symbol interpretations).
 *  Stroke color is set by the caller (drawTabBar) before invocation. */
function drawTabIcon(
  ctx: CanvasRenderingContext2D,
  index: number,
  cx: number,
  cy: number,
) {
  const s = 18; // Base icon half-size

  switch (index) {
    case 0: // Home — house outline
      ctx.beginPath();
      ctx.moveTo(cx, cy - s);           // Roof peak
      ctx.lineTo(cx + s, cy - 2);       // Right eave
      ctx.lineTo(cx + s * 0.7, cy - 2); // Right wall top
      ctx.lineTo(cx + s * 0.7, cy + s); // Right wall bottom
      ctx.lineTo(cx - s * 0.7, cy + s); // Left wall bottom
      ctx.lineTo(cx - s * 0.7, cy - 2); // Left wall top
      ctx.lineTo(cx - s, cy - 2);       // Left eave
      ctx.closePath();
      ctx.stroke();
      break;

    case 1: // Job Board — briefcase outline
      // Main body
      ctx.strokeRect(cx - s, cy - s * 0.5, s * 2, s * 1.5);
      // Handle
      ctx.beginPath();
      ctx.moveTo(cx - s * 0.4, cy - s * 0.5);
      ctx.lineTo(cx - s * 0.4, cy - s * 0.9);
      ctx.lineTo(cx + s * 0.4, cy - s * 0.9);
      ctx.lineTo(cx + s * 0.4, cy - s * 0.5);
      ctx.stroke();
      break;

    case 2: // Schedule — grid/calendar outline
      ctx.strokeRect(cx - s, cy - s, s * 2, s * 2);
      // Horizontal grid line
      ctx.beginPath();
      ctx.moveTo(cx - s, cy);
      ctx.lineTo(cx + s, cy);
      ctx.stroke();
      // Vertical grid line
      ctx.beginPath();
      ctx.moveTo(cx, cy - s);
      ctx.lineTo(cx, cy + s);
      ctx.stroke();
      break;

    case 3: // Settings — gear outline (simplified: circle with 4 notches)
      ctx.beginPath();
      ctx.arc(cx, cy, s * 0.6, 0, Math.PI * 2);
      ctx.stroke();
      // Notches at 4 cardinal points
      for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 2) {
        const nx = cx + Math.cos(angle) * s;
        const ny = cy + Math.sin(angle) * s;
        ctx.beginPath();
        ctx.moveTo(
          cx + Math.cos(angle) * s * 0.75,
          cy + Math.sin(angle) * s * 0.75,
        );
        ctx.lineTo(nx, ny);
        ctx.stroke();
      }
      // Add diagonal notches for a more gear-like look
      for (let angle = Math.PI / 4; angle < Math.PI * 2; angle += Math.PI / 2) {
        const nx = cx + Math.cos(angle) * s * 0.9;
        const ny = cy + Math.sin(angle) * s * 0.9;
        ctx.beginPath();
        ctx.moveTo(
          cx + Math.cos(angle) * s * 0.75,
          cy + Math.sin(angle) * s * 0.75,
        );
        ctx.lineTo(nx, ny);
        ctx.stroke();
      }
      break;
  }
}

/** Calculate sub-phase progress for staggered draw-in animations.
 *  Returns 0 before `start`, 1 after `end`, linearly interpolated between. */
export function phase(progress: number, start: number, end: number): number {
  if (progress <= start) return 0;
  if (progress >= end) return 1;
  return (progress - start) / (end - start);
}

// --- Dynamic Island dimensions (shared by status bar for alignment) ---
const ISLAND_W = 180;
const ISLAND_H = 48;
const ISLAND_Y = 16;
const ISLAND_CENTER_Y = ISLAND_Y + ISLAND_H / 2; // y = 40

/** Draw the iOS status bar — time, location arrow, cellular bars, wifi, battery.
 *  All icons ~half the island height (~24px). Vertically centered with island.
 *  Extra margin from screen edges for proper iOS inset. */
export function drawStatusBar(
  ctx: CanvasRenderingContext2D,
  canvasWidth: number,
  progress = 1,
) {
  if (progress <= 0) return;
  const SYS_FONT = '-apple-system, SF Pro Text, Helvetica Neue, sans-serif';
  const y = ISLAND_CENTER_Y;
  const margin = LAYOUT.padding + 16; // Extra inset from screen edges
  const iconH = ISLAND_H / 2; // ~24px — target height for all icons

  ctx.save();
  ctx.globalAlpha = progress;
  ctx.textBaseline = 'middle';

  // --- LEFT SIDE: Time + location arrow ---

  // Time — bold, sized to ~iconH
  ctx.font = `bold ${iconH + 4}px ${SYS_FONT}`;
  ctx.fillStyle = COLORS.titleLine;
  ctx.textAlign = 'left';
  ctx.fillText('1:29', margin, y);

  // Location arrow — filled triangle
  const arrowX = margin + 80;
  ctx.fillStyle = COLORS.accent;
  ctx.beginPath();
  ctx.moveTo(arrowX, y - 10);
  ctx.lineTo(arrowX + 8, y + 5);
  ctx.lineTo(arrowX - 1, y + 2);
  ctx.closePath();
  ctx.fill();

  // --- RIGHT SIDE: Cellular bars, wifi, battery ---
  const rightEdge = canvasWidth - margin;

  // Battery — ~iconH tall
  const batW = 48, batH = iconH;
  const batX = rightEdge - batW;
  const batY = y - batH / 2;
  ctx.strokeStyle = COLORS.bodyLine;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(batX, batY, batW - 5, batH, 4);
  ctx.stroke();
  // Battery tip
  ctx.fillStyle = COLORS.bodyLine;
  ctx.fillRect(batX + batW - 5, batY + 6, 4, batH - 12);
  // Battery fill — white
  ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
  ctx.beginPath();
  ctx.roundRect(batX + 2.5, batY + 2.5, batW - 11, batH - 5, 2.5);
  ctx.fill();
  // "100" inside
  ctx.font = `bold ${batH * 0.52}px ${SYS_FONT}`;
  ctx.fillStyle = '#0A0A0A';
  ctx.textAlign = 'center';
  ctx.fillText('100', batX + (batW - 5) / 2, y + 1);

  // Wifi icon — 3 arcs, sized to ~iconH
  const wifiX = batX - 34;
  const wifiBottom = y + iconH * 0.35;
  ctx.strokeStyle = COLORS.titleLine;
  ctx.lineWidth = 2;
  for (let i = 0; i < 3; i++) {
    const r = 6 + i * 7;
    ctx.beginPath();
    ctx.arc(wifiX, wifiBottom, r, -Math.PI * 0.75, -Math.PI * 0.25);
    ctx.stroke();
  }
  // Center dot
  ctx.beginPath();
  ctx.arc(wifiX, wifiBottom, 2.5, 0, Math.PI * 2);
  ctx.fillStyle = COLORS.titleLine;
  ctx.fill();

  // Cellular bars — 4 vertical bars increasing height (replaces SOS + dots)
  const barsX = wifiX - 42;
  const barW = 5;
  const barGap = 3;
  const barHeights = [0.35, 0.5, 0.7, 1.0]; // Fraction of iconH
  for (let i = 0; i < 4; i++) {
    const bh = iconH * barHeights[i];
    const bx = barsX + i * (barW + barGap);
    const by = y + iconH / 2 - bh; // Bottom-aligned
    ctx.beginPath();
    ctx.roundRect(bx, by, barW, bh, 1.5);
    ctx.fillStyle = COLORS.titleLine;
    ctx.fill();
  }

  ctx.restore();
}

/** Draw the Dynamic Island pill at the top center of the canvas.
 *  Corner radius = half height for a perfect pill shape. */
export function drawDynamicIsland(
  ctx: CanvasRenderingContext2D,
  canvasWidth: number,
  progress = 1,
) {
  if (progress <= 0) return;
  const x = (canvasWidth - ISLAND_W) / 2;
  const r = ISLAND_H / 2; // Perfect pill: radius = half height

  ctx.save();
  ctx.globalAlpha = progress;
  ctx.beginPath();
  ctx.roundRect(x, ISLAND_Y, ISLAND_W, ISLAND_H, r);
  ctx.fillStyle = '#1A1A1A';
  ctx.fill();
  ctx.strokeStyle = COLORS.border;
  ctx.lineWidth = LAYOUT.borderWidth;
  ctx.stroke();
  ctx.restore();
}

/** Draw the floating action button (lightning bolt) — static across all tabs.
 *  Positioned bottom-right, just above the tab bar. */
export function drawFAB(
  ctx: CanvasRenderingContext2D,
  canvasWidth: number,
  tabBarY: number,
  progress = 1,
) {
  if (progress <= 0) return;

  const radius = 48;
  const cx = canvasWidth - LAYOUT.padding - radius - 8;
  const cy = tabBarY - radius - 80; // Higher up — overlaps content like the real app

  ctx.save();
  ctx.globalAlpha = progress;

  // Outer ring
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.fillStyle = '#0A0A0A';
  ctx.fill();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
  ctx.lineWidth = 2.5;
  ctx.stroke();

  // Lightning bolt stroke
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.75)';
  ctx.lineWidth = 3;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(cx + 2, cy - 22);    // Top
  ctx.lineTo(cx - 10, cy + 2);    // Left mid
  ctx.lineTo(cx + 2, cy + 2);     // Center
  ctx.lineTo(cx - 2, cy + 22);    // Bottom
  ctx.lineTo(cx + 10, cy - 2);    // Right mid
  ctx.lineTo(cx - 2, cy - 2);     // Center
  ctx.closePath();
  ctx.stroke();

  // Notification badge — small gold circle with count
  const badgeR = 14;
  const badgeX = cx + radius * 0.65;
  const badgeY = cy - radius * 0.65;
  ctx.beginPath();
  ctx.arc(badgeX, badgeY, badgeR, 0, Math.PI * 2);
  ctx.fillStyle = COLORS.stageInProgress; // Gold
  ctx.fill();

  // Badge count
  ctx.fillStyle = '#0A0A0A';
  ctx.font = 'bold 16px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('16', badgeX, badgeY + 1);

  ctx.restore();
}

/** Clear the entire canvas with background color */
export function clearCanvas(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.fillStyle = COLORS.background;
  ctx.fillRect(0, 0, w, h);
}
