/**
 * Tailored phone scene constants.
 * Reuses base constants from platform and adds tailored-specific values.
 */

export {
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  COLORS,
  LAYOUT,
  TIMING,
} from '@/components/platform/phone-scene/constants';

/** Tailored accent overlay colors */
export const TAILORED_COLORS = {
  accentOverlay: 'rgba(89, 119, 148, 0.25)',
  accentOverlayStrong: 'rgba(89, 119, 148, 0.40)',
  accentBorder: 'rgba(89, 119, 148, 0.55)',
  accentText: '#7BA0C0',       // Brighter than base accent for 3D texture readability
  accentTextDim: '#597794',    // Original accent for subtle labels
  accentGlow: 'rgba(89, 119, 148, 0.18)',
} as const;

/**
 * Boosted text colors — higher contrast for 3D texture pipeline.
 * The emissive map at 0.6 intensity + environment lighting dims everything.
 */
export const TEXT = {
  primary: 'rgba(255, 255, 255, 0.93)',
  secondary: 'rgba(255, 255, 255, 0.62)',
  tertiary: 'rgba(255, 255, 255, 0.40)',
  muted: 'rgba(255, 255, 255, 0.22)',
} as const;

/** Screen edge → card edge */
export const CONTENT_PADDING = 56;
/** Card edge → content inside card */
export const CARD_PADDING = 38;
/** Top of screen → first content (below status bar) */
export const TOP_INSET = 80;

export type TailoredPhase = 'home' | 'packages' | 'analysis' | 'building' | 'custom';

export const PHASE_TIMING = {
  /** Standard transition between phases */
  fadeOut: 150,
  drawIn: 500,
  /** Faster transition for package selection */
  fastFadeOut: 100,
  fastDrawIn: 350,
} as const;
