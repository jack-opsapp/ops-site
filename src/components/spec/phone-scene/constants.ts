/**
 * SPEC phone scene constants — self-contained (no platform imports).
 *
 * Every value maps to OPS design-system tokens (src/lib/theme.ts /
 * DESIGN.md); the handful of white-alpha ladders are boosted from their DOM
 * values because the emissive 3D texture pipeline dims everything — the
 * boosts restore the DESIGN.md hierarchy as *rendered*, matching the
 * platform scene's calibration.
 */

// --- Canvas Dimensions ---
// Proportional to the iPhone screen mesh's aspect; 2x DPR at draw time.
export const CANVAS_WIDTH = 750;
export const CANVAS_HEIGHT = 1540;

// Canvas 750px ↔ ~395pt iPhone width → 1.9 px per iOS pt.
export const PX_PER_PT = 1.9;

// --- Page phases (the IntersectionObserver contract with SpecPageContent) ---
// hero → 'home' · ladder → 'packages' · OPS BOARD → 'analysis' ·
// white-label/ongoing → 'building' · tier DETAILS → 'custom'.
// The v2 screens narrate the ladder itself: one company climbing
// wire it ('packages' = SPEC-01) → run it ('analysis' = SPEC-02) →
// own it ('building' + 'custom' = SPEC-03).
export type SpecPhase = 'home' | 'packages' | 'analysis' | 'building' | 'custom';

// --- v2 tier slugs (bible SPEC/10 § 6) — the scene's native tier contract ---
export type SpecTierId = 'spec01' | 'spec02' | 'spec03';

export const SPEC_TIER_IDS: readonly SpecTierId[] = ['spec01', 'spec02', 'spec03'];

export function isSpecTierId(value: string | null | undefined): value is SpecTierId {
  return value === 'spec01' || value === 'spec02' || value === 'spec03';
}

// --- Colors ---
export const COLORS = {
  background: '#0A0A0A',
  cardFill: 'rgba(255, 255, 255, 0.06)',    // Subtle lift — boosted for 3D texture visibility
  border: 'rgba(255, 255, 255, 0.18)',       // Card outlines — boosted for 3D readability
  separator: 'rgba(255, 255, 255, 0.15)',    // Divider lines — boosted for 3D readability

  // Text ladder (rendered-contrast boosts of --text / --text-2 / --text-3)
  titleLine: 'rgba(255, 255, 255, 0.80)',
  bodyLine: 'rgba(255, 255, 255, 0.50)',
  captionLine: 'rgba(255, 255, 255, 0.30)',

  // Accent — primary CTA only, one accent element per screen (spec v2 steel blue)
  accent: '#6F94B0',
  accentGlow: 'rgba(111, 148, 176, 0.3)',

  // Earth tones — semantic only (theme.colors.olive/tan/rose)
  olive: '#9DB582',
  tan: '#C4A868',
  rose: '#B58289',

  // Financial ramp (theme.colors.fin*)
  finRevenue: '#C4A868',
  finProfit: '#9DB582',
  finCost: '#B58289',
  finReceivables: '#D4A574',
  finOverdue: '#93321A',
} as const;

/** Job/task status palette — Assets.xcassets/Colors/Job Status/*.colorset
 *  live hex (resolved by OPSStyle.Colors.statusColor). */
export const STATUS = {
  rfq: '#8F9AA3',        // StatusRFQ — cool grey-blue
  estimated: '#B6AC97',  // StatusEstimated — warm putty
  accepted: '#8FA577',   // StatusAccepted — olive-green
  inProgress: '#D99A3E', // StatusInProgress — amber
  completed: '#BA7458',  // StatusCompleted — terracotta
} as const;

// --- Layout Constants ---
export const LAYOUT = {
  padding: 40,             // Screen edge padding (~16pt at canvas scale)
  cardRadius: 6,           // 3pt × ~2x scale (OPSStyle.Layout.cornerRadius)
  panelRadius: 19,         // L1 glass panel — OPSStyle panelRadius 10pt × 1.9
  smallRadius: 8,          // ~4pt at canvas scale
  borderWidth: 1.5,        // Boosted for 3D readability
  coloredBorderWidth: 8,   // 4pt colored left borders at canvas scale
  tabBarHeight: 120,       // Bottom tab bar zone height
  tabBarY: CANVAS_HEIGHT - 120, // Y position where tab bar starts
  tabIconSize: 53.2,       // OPSStyle.Layout.tabBarIconSize 28pt × 1.9
  pinSize: 16,             // Map pin circle diameter
} as const;

// --- Timing ---
export const TIMING = {
  fadeOutDuration: 150,    // Screen fade out on phase switch (ms)
  // OPSStyle easeOut: cubic-bezier(0.22, 1, 0.36, 1) approximated via
  // easeOutQuart — fast departure, soft landing.
  easeOut: (t: number): number => {
    const clamped = Math.min(1, Math.max(0, t));
    const t1 = 1 - clamped;
    return 1 - t1 * t1 * t1 * t1;
  },
};

/**
 * Draw-in duration per screen. The Deckset designer gets a cinematic window —
 * its draw IS the sequence (plan drafts → materials price → client render);
 * everything else lands with the platform hero's assured cadence.
 */
export function drawInDuration(phase: SpecPhase, tier: SpecTierId | null): number {
  if (phase === 'custom') {
    return tier === 'spec03' || tier === null ? 2400 : 1000;
  }
  switch (phase) {
    case 'home':
      return 600;
    case 'packages':
      return 900;
    case 'analysis':
      return 900;
    case 'building':
      return 1000;
  }
}

// --- Bar Tab Definitions ---
// The real 7-tab owner set in the real order (MainTabView.swift — the demo
// persona holds every permission, so Leads, Books, and Catalog all show).
// The spec phone's screens are scroll-driven, not tap-driven; the bar is
// faithful chrome with a per-screen active position.
export type BarTabId =
  | 'home'      // nav-home
  | 'leads'     // nav-pipeline
  | 'books'     // nav-pulse
  | 'jobboard'  // nav-jobs
  | 'catalog'   // nav-catalog
  | 'schedule'  // nav-calendar
  | 'settings'; // nav-settings

export const BAR_TABS: readonly BarTabId[] = [
  'home',
  'leads',
  'books',
  'jobboard',
  'catalog',
  'schedule',
  'settings',
];

export const BAR_TAB_COUNT = BAR_TABS.length;

/** Bar position of a tab id, for screens declaring their active tab. */
export function barTabIndex(id: BarTabId): number {
  return BAR_TABS.indexOf(id);
}
