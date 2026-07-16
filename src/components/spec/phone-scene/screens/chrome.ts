/**
 * App chrome + canvas primitives for the SPEC phone screens.
 *
 * Vendored from the platform scene's iOS-audited drawing kit — the chrome is
 * measured against the real app (full derivation + file:line citations in
 * the platform scene's chrome-reference). Canvas 750px ↔ ~395pt iPhone width
 * → 1.9 px per iOS pt. LAYOUT.tabBarY maps to the real tab bar's top edge
 * (the 34pt home-indicator strip is compressed out of the stylized screen).
 *
 * The spec phone is scroll-driven, not tap-driven — the hover machinery is
 * gone; the bar draws the real 7-tab owner set with a per-screen active
 * position.
 */

import { COLORS, LAYOUT, BAR_TABS, BAR_TAB_COUNT, PX_PER_PT, type BarTabId } from '../constants';

/** Draw a rounded rectangle outline (optionally filled) */
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

/** Draw a project pin — matches iOS ProjectAnnotationRenderer exactly.
 *  Solid center dot (task type color) + stroke ring (status color).
 *  iOS dims: dot 12pt, ring 20pt total → at canvas 2x: dot r12, ring r20. */
export function drawMapPin(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  dotColor: string,
  ringColor?: string,
  progress = 1,
) {
  if (progress <= 0) return;
  const ring = ringColor ?? dotColor;
  const dotR = 12;
  const ringR = 20;
  const ringStroke = 4;

  ctx.save();
  ctx.globalAlpha = progress;

  ctx.beginPath();
  ctx.arc(cx, cy, ringR, 0, Math.PI * 2);
  ctx.strokeStyle = ring;
  ctx.lineWidth = ringStroke;
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(cx, cy, dotR, 0, Math.PI * 2);
  ctx.fillStyle = dotColor;
  ctx.fill();

  ctx.restore();
}

/** Calculate sub-phase progress for staggered draw-in animations.
 *  Returns 0 before `start`, 1 after `end`, linearly interpolated between. */
export function phase(progress: number, start: number, end: number): number {
  if (progress <= start) return 0;
  if (progress >= end) return 1;
  return (progress - start) / (end - start);
}

/** Clear the entire canvas with background color */
export function clearCanvas(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.fillStyle = COLORS.background;
  ctx.fillRect(0, 0, w, h);
}

// ---------------------------------------------------------------------------
// App chrome — measured against the real iOS app.
// ---------------------------------------------------------------------------

/** OPSStyle.Colors — exact iOS hex values (OPSStyle.swift). Chrome is drawn
 *  with the app's real ladder, not the wireframe's boosted white opacities. */
const CHROME = {
  textPrimary: '#EDEDED',   // Colors.primaryText — selected tab icon
  textSecondary: '#B5B5B5', // Colors.secondaryText — tab underline (never accent)
  textTertiary: '#8A8A8A',  // Colors.tertiaryText — unselected tab icons
  white: '#FFFFFF',         // Colors.buttonText — FAB ring/bolt; status bar glyphs
  black: '#000000',         // Colors.invertedText — FAB badge count
  tan: '#C4A868',           // Colors.warningStatus — FAB badge fill
} as const;

// CustomTabBar.swift geometry (pt → px at 1.9)
const TAB_ICON = LAYOUT.tabIconSize;       // 53.2 — OPSStyle.Layout.tabBarIconSize (28pt × 1.9)
const TAB_BAR_H = 100 * PX_PER_PT;         // 190 — bar height (CustomTabBar.swift)
const TAB_UNDERLINE_Y = 16 * PX_PER_PT;    // 30.4 — lane top padding (spacing3 = 16pt)
const TAB_UNDERLINE_H = 2 * PX_PER_PT;     // 3.8 — underline thickness (2pt)
const TAB_ICON_CENTER_Y = 41 * PX_PER_PT;  // 77.9 — 16pt padding + 50pt button / 2
const CARBON_UNIT = TAB_ICON / 32;         // 1.66 — Carbon glyphs live on a 32-unit grid
const CARBON_STROKE = CARBON_UNIT * 2;     // 3.3 — Carbon 2-unit stroke weight

/** Draw the tab bar — the real 7-tab owner set in the real order.
 *  Layout matches CustomTabBar.swift: 28pt icons spaced evenly so the screen-
 *  edge padding equals the inter-icon gap; monochrome active state (underline
 *  secondaryText, icon primaryText — no accent on nav); background is the
 *  real bar's pure-black gradient scrim.
 *  `activeId` names the highlighted position, or null for no highlight. */
export function drawTabBar(
  ctx: CanvasRenderingContext2D,
  activeId: BarTabId | null,
  canvasWidth: number,
  tabBarY: number,
  progress = 1,
) {
  if (progress <= 0) return;

  // Even-gap layout: edge padding == inter-icon gap → (750 − 7×53.2)/8 = 47.2
  const gap = (canvasWidth - BAR_TAB_COUNT * TAB_ICON) / (BAR_TAB_COUNT + 1);
  const cell = TAB_ICON + gap;
  const iconY = tabBarY + TAB_ICON_CENTER_Y;
  const activeIndex = activeId ? BAR_TABS.indexOf(activeId) : -1;

  ctx.save();
  ctx.globalAlpha = progress;

  // Background — black scrim gradient: transparent at bar top, solid by 30%,
  // held solid to the base. The bar melts into the content behind it.
  const scrim = ctx.createLinearGradient(0, tabBarY, 0, tabBarY + TAB_BAR_H);
  scrim.addColorStop(0, 'rgba(10, 10, 10, 0)');
  scrim.addColorStop(0.3, COLORS.background);
  scrim.addColorStop(1, COLORS.background);
  ctx.fillStyle = scrim;
  ctx.fillRect(0, tabBarY, canvasWidth, TAB_BAR_H);

  for (let i = 0; i < BAR_TAB_COUNT; i++) {
    const cx = gap + TAB_ICON / 2 + i * cell;
    const isActive = i === activeIndex;

    // Selected underline — iconSize wide, 2pt tall, monochrome secondaryText,
    // riding at the lane top above the icon
    if (isActive) {
      ctx.fillStyle = CHROME.textSecondary;
      ctx.beginPath();
      ctx.roundRect(
        cx - TAB_ICON / 2,
        tabBarY + TAB_UNDERLINE_Y,
        TAB_ICON,
        TAB_UNDERLINE_H,
        TAB_UNDERLINE_H / 2,
      );
      ctx.fill();
    }

    // Icon state colors: selected primaryText, unselected tertiaryText
    ctx.strokeStyle = isActive ? CHROME.textPrimary : CHROME.textTertiary;
    ctx.fillStyle = isActive ? CHROME.textPrimary : CHROME.textTertiary;

    drawTabIcon(ctx, BAR_TABS[i], cx, iconY);
  }

  ctx.restore();
}

/** Draw individual tab icons — the real nav glyph assets (Assets.xcassets/
 *  nav-*), redrawn as centerline strokes on the source 32-unit grid at the
 *  28pt icon box. Six are filled Carbon paths rendered as 2-unit centerline
 *  strokes; nav-pulse is a native stroke asset traced verbatim. */
function drawTabIcon(
  ctx: CanvasRenderingContext2D,
  id: BarTabId,
  cx: number,
  cy: number,
) {
  const u = CARBON_UNIT;
  // Map a Carbon 32-grid coordinate to canvas px, centered on (cx, cy)
  const px = (ux: number) => cx + (ux - 16) * u;
  const py = (uy: number) => cy + (uy - 16) * u;

  ctx.save();
  ctx.lineWidth = CARBON_STROKE;
  ctx.lineJoin = 'round'; // Carbon corners carry a ~2-unit rounding
  ctx.lineCap = 'butt';

  switch (id) {
    case 'home': // Carbon `home`: gable roof with eaves, walls, open doorway
      ctx.beginPath();
      ctx.moveTo(px(2), py(14.2));
      ctx.lineTo(px(16), py(3.2));
      ctx.lineTo(px(30), py(14.2));
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(px(5), py(11.8));
      ctx.lineTo(px(5), py(26));
      ctx.quadraticCurveTo(px(5), py(27), px(6), py(27));
      ctx.lineTo(px(13), py(27));
      ctx.lineTo(px(13), py(18));
      ctx.quadraticCurveTo(px(13), py(17), px(14), py(17));
      ctx.lineTo(px(18), py(17));
      ctx.quadraticCurveTo(px(19), py(17), px(19), py(18));
      ctx.lineTo(px(19), py(27));
      ctx.lineTo(px(26), py(27));
      ctx.quadraticCurveTo(px(27), py(27), px(27), py(26));
      ctx.lineTo(px(27), py(11.8));
      ctx.stroke();
      break;

    case 'leads': // Carbon `network--2` (nav-pipeline): 3 node rings + T connector
      ctx.beginPath();
      ctx.moveTo(px(6), py(23));
      ctx.lineTo(px(6), py(17));
      ctx.quadraticCurveTo(px(6), py(16), px(7), py(16));
      ctx.lineTo(px(25), py(16));
      ctx.quadraticCurveTo(px(26), py(16), px(26), py(17));
      ctx.lineTo(px(26), py(23));
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(px(16), py(16));
      ctx.lineTo(px(16), py(9));
      ctx.stroke();
      for (const [nx, ny] of [[16, 6], [6, 26], [26, 26]] as const) {
        ctx.beginPath();
        ctx.arc(px(nx), py(ny), 3 * u, 0, Math.PI * 2);
        ctx.stroke();
      }
      break;

    case 'books': { // nav-pulse: bespoke OPS pulse waveform (stroke asset, not Carbon)
      ctx.lineWidth = 2.25 * u;
      ctx.lineCap = 'round';
      const pulse: readonly (readonly [number, number])[] = [
        [1, 16], [6, 16], [8.5, 13], [11, 16], [13.5, 20],
        [15.5, 5], [17.5, 25], [20, 16], [22.5, 13], [25, 16], [31, 16],
      ];
      ctx.beginPath();
      ctx.moveTo(px(pulse[0][0]), py(pulse[0][1]));
      for (let p = 1; p < pulse.length; p++) {
        ctx.lineTo(px(pulse[p][0]), py(pulse[p][1]));
      }
      ctx.stroke();
      break;
    }

    case 'jobboard': // Carbon `portfolio`: wide case + top handle
      ctx.beginPath();
      ctx.roundRect(px(3), py(11), 26 * u, 16 * u, 1.5 * u);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(px(11), py(11));
      ctx.lineTo(px(11), py(6.2));
      ctx.quadraticCurveTo(px(11), py(5), px(12.2), py(5));
      ctx.lineTo(px(19.8), py(5));
      ctx.quadraticCurveTo(px(21), py(5), px(21), py(6.2));
      ctx.lineTo(px(21), py(11));
      ctx.stroke();
      break;

    case 'catalog': // Carbon `cube` (nav-catalog): iso cube — hex shell + internal Y
      ctx.beginPath();
      ctx.moveTo(px(16), py(2));
      ctx.lineTo(px(28), py(9));
      ctx.lineTo(px(28), py(23));
      ctx.lineTo(px(16), py(30));
      ctx.lineTo(px(4), py(23));
      ctx.lineTo(px(4), py(9));
      ctx.closePath();
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(px(4), py(9));
      ctx.lineTo(px(16), py(16));
      ctx.lineTo(px(28), py(9));
      ctx.moveTo(px(16), py(16));
      ctx.lineTo(px(16), py(30));
      ctx.stroke();
      break;

    case 'schedule': // Carbon `calendar`: body, header band, two binding pins
      ctx.beginPath();
      ctx.roundRect(px(5), py(5), 22 * u, 22 * u, 1.5 * u);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(px(6), py(11));
      ctx.lineTo(px(26), py(11));
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(px(11), py(2));
      ctx.lineTo(px(11), py(8));
      ctx.moveTo(px(21), py(2));
      ctx.lineTo(px(21), py(8));
      ctx.stroke();
      break;

    case 'settings': // Carbon `settings`: 6-tooth gear, arc valleys, center ring
      {
        const tipR = 13.2 * u;     // Tooth tip radius (centerline)
        const valleyR = 10 * u;    // Valley radius (centerline, concave arcs)
        const half = 0.192;        // Tooth angular half-width (±11°, radial flanks)
        const step = Math.PI / 3;  // 6 teeth, first at 12 o'clock

        ctx.beginPath();
        for (let t = 0; t < 6; t++) {
          const a = -Math.PI / 2 + t * step;
          ctx.arc(cx, cy, tipR, a - half, a + half);
          ctx.arc(cx, cy, valleyR, a + half, a + step - half);
        }
        ctx.closePath();
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(cx, cy, 5 * u, 0, Math.PI * 2);
        ctx.stroke();
      }
      break;
  }

  ctx.restore();
}

// --- Dynamic Island dimensions (status bar alignment; the island itself is
//     a 3D mesh on the phone, not canvas) ---
const ISLAND_H = 48;
const ISLAND_Y = 16;
const ISLAND_CENTER_Y = ISLAND_Y + ISLAND_H / 2; // y = 40

/** Draw the iOS status bar — time + location arrow left; signal, wifi,
 *  battery right. Dark-mode iOS proportions at 1.9 px/pt. Device time is
 *  9:41 — the screens' feed timestamps sync around it. */
export function drawStatusBar(
  ctx: CanvasRenderingContext2D,
  canvasWidth: number,
  progress = 1,
) {
  if (progress <= 0) return;
  const SYS_FONT = '-apple-system, SF Pro Text, Helvetica Neue, sans-serif';
  const y = ISLAND_CENTER_Y + 4;
  const margin = 35 * PX_PER_PT; // 66.5 — status bar ear inset
  const capHalf = 6 * PX_PER_PT; // 11.4 — half of the shared 12pt glyph cap

  ctx.save();
  ctx.globalAlpha = progress;
  ctx.textBaseline = 'middle';

  // --- LEFT: time + location arrow ---
  ctx.font = `600 ${Math.round(17 * PX_PER_PT)}px ${SYS_FONT}`;
  ctx.fillStyle = CHROME.white;
  ctx.textAlign = 'left';
  ctx.fillText('9:41', margin, y);
  const timeW = ctx.measureText('9:41').width;

  // Location services indicator — filled kite right of the time
  // (OPS is a field app actively using location)
  const arrowX = margin + timeW + 24;
  const arrowS = 12;
  ctx.save();
  ctx.translate(arrowX, y);
  ctx.scale(-1, 1);
  ctx.rotate(-Math.PI / 4);
  ctx.fillStyle = CHROME.white;
  ctx.strokeStyle = CHROME.white;
  ctx.lineWidth = 2;
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(0, -arrowS);
  ctx.lineTo(arrowS * 0.55, arrowS * 0.4);
  ctx.lineTo(0, arrowS * 0.05);
  ctx.lineTo(-arrowS * 0.55, arrowS * 0.4);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  // --- RIGHT: cellular bars, wifi, battery (right-to-left) ---
  const rightEdge = canvasWidth - margin;
  const iconGap = 7 * PX_PER_PT;

  // ── Battery — 25×13pt shell + nub; shell/nub at 40% white, fill solid ──
  const batShellW = 25 * PX_PER_PT;
  const batShellH = 13 * PX_PER_PT;
  const nubW = 2.9;
  const nubH = 9.5;
  const batShellX = rightEdge - nubW - 1 - batShellW;
  const batShellY = y - batShellH / 2;
  const dimWhite = 'rgba(255, 255, 255, 0.4)';

  ctx.fillStyle = dimWhite;
  ctx.beginPath();
  ctx.roundRect(batShellX + batShellW + 1, y - nubH / 2, nubW, nubH, [0, nubW, nubW, 0]);
  ctx.fill();

  ctx.strokeStyle = dimWhite;
  ctx.lineWidth = PX_PER_PT;
  ctx.beginPath();
  ctx.roundRect(batShellX, batShellY, batShellW, batShellH, 8);
  ctx.stroke();

  const fillInset = 2 * PX_PER_PT;
  ctx.fillStyle = CHROME.white;
  ctx.beginPath();
  ctx.roundRect(
    batShellX + fillInset,
    batShellY + fillInset,
    batShellW - fillInset * 2,
    batShellH - fillInset * 2,
    4.5,
  );
  ctx.fill();

  // ── WiFi — 17×12pt fan: point wedge + 2 arc bands, ±41° sweep ──
  const sweep = 0.716;
  const wifiOuterR = 24;
  const wifiHalfW = wifiOuterR * Math.sin(sweep);
  const wifiCenterX = batShellX - iconGap - wifiHalfW;
  const wifiBaseY = y + capHalf;

  ctx.fillStyle = CHROME.white;
  const bands = [
    { innerR: 0, outerR: 7.4 },
    { innerR: 9.2, outerR: 15.7 },
    { innerR: 17.5, outerR: 24 },
  ];

  for (const band of bands) {
    ctx.beginPath();
    if (band.innerR === 0) {
      ctx.moveTo(wifiCenterX, wifiBaseY);
      ctx.arc(wifiCenterX, wifiBaseY, band.outerR, -Math.PI / 2 - sweep, -Math.PI / 2 + sweep);
      ctx.closePath();
    } else {
      ctx.arc(wifiCenterX, wifiBaseY, band.outerR, -Math.PI / 2 - sweep, -Math.PI / 2 + sweep);
      ctx.arc(wifiCenterX, wifiBaseY, band.innerR, -Math.PI / 2 + sweep, -Math.PI / 2 - sweep, true);
      ctx.closePath();
    }
    ctx.fill();
  }

  // ── Cellular signal — 4 bars (3pt wide, 2pt gaps), bottom-aligned ──
  const barW = 3 * PX_PER_PT;
  const barGap = 2 * PX_PER_PT;
  const barsGroupW = 4 * barW + 3 * barGap;
  const barsStartX = wifiCenterX - wifiHalfW - iconGap - barsGroupW;
  const barBottom = y + capHalf;
  const barHeights = [8.6, 13.3, 18.1, 22.8]; // 4.5/7/9.5/12pt
  ctx.fillStyle = CHROME.white;
  for (let i = 0; i < 4; i++) {
    const bh = barHeights[i];
    const bx = barsStartX + i * (barW + barGap);
    ctx.beginPath();
    ctx.roundRect(bx, barBottom - bh, barW, bh, 1.9);
    ctx.fill();
  }

  ctx.restore();
}

/** Draw the floating action button — matches FloatingActionMenu.swift:
 *  64pt frosted circle, solid white 2pt ring, SF `bolt` outline, and the
 *  review-count badge (warningStatus tan capsule, black mono count). */
export function drawFAB(
  ctx: CanvasRenderingContext2D,
  canvasWidth: number,
  tabBarY: number,
  progress = 1,
) {
  if (progress <= 0) return;

  const radius = 32 * PX_PER_PT;
  const cx = canvasWidth - 36 * PX_PER_PT - radius;
  const cy = tabBarY - 74 * PX_PER_PT - radius;

  ctx.save();
  ctx.globalAlpha = progress;

  // Frosted glass circle — approximates .ultraThinMaterial.opacity(0.8)
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.clip();
  ctx.filter = 'blur(16px)';
  const fabCanvasW = ctx.canvas.width;
  const fabCanvasH = ctx.canvas.height;
  const fabLogicalH = fabCanvasH / (fabCanvasW / canvasWidth);
  ctx.drawImage(ctx.canvas, 0, 0, fabCanvasW, fabCanvasH,
    0, 0, canvasWidth, fabLogicalH);
  ctx.filter = 'none';
  ctx.fillStyle = 'rgba(10, 10, 10, 0.45)';
  ctx.fillRect(cx - radius, cy - radius, radius * 2, radius * 2);
  ctx.restore();

  // Ring — solid white buttonText at Border.thick (2pt)
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.strokeStyle = CHROME.white;
  ctx.lineWidth = 2 * PX_PER_PT;
  ctx.stroke();

  // Lightning bolt — SF `bolt` outline, white
  ctx.strokeStyle = CHROME.white;
  ctx.lineWidth = 4.6;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(cx + 3, cy - 29);
  ctx.lineTo(cx - 20, cy + 4);
  ctx.lineTo(cx + 2, cy + 4);
  ctx.lineTo(cx - 3, cy + 29);
  ctx.lineTo(cx + 20, cy - 4);
  ctx.lineTo(cx - 2, cy - 4);
  ctx.closePath();
  ctx.stroke();

  // Review-count badge — tan capsule, black mono count, topTrailing + (6, −4)
  ctx.font = '600 23px "JetBrains Mono", monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const countW = ctx.measureText('16').width;
  const badgeH = 35;
  const badgeW = Math.max(countW + 2 * 5 * PX_PER_PT, badgeH);
  const badgeRight = cx + radius + 6 * PX_PER_PT;
  const badgeTop = cy - radius - 4 * PX_PER_PT;

  ctx.beginPath();
  ctx.roundRect(badgeRight - badgeW, badgeTop, badgeW, badgeH, badgeH / 2);
  ctx.fillStyle = CHROME.tan;
  ctx.fill();

  ctx.fillStyle = CHROME.black;
  ctx.fillText('16', badgeRight - badgeW / 2, badgeTop + badgeH / 2 + 1);

  ctx.restore();
}
