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
  accentBorder: 'rgba(89, 119, 148, 0.50)',
  accentText: '#597794',
  accentGlow: 'rgba(89, 119, 148, 0.15)',
} as const;

export type TailoredPhase = 'home' | 'packages' | 'analysis' | 'building' | 'custom';

export const PHASE_TIMING = {
  /** Standard transition between phases */
  fadeOut: 150,
  drawIn: 500,
  /** Faster transition for package selection */
  fastFadeOut: 100,
  fastDrawIn: 350,
} as const;
