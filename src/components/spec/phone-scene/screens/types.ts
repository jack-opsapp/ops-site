/**
 * Shared types for SPEC screen drawing functions.
 *
 * Each screen is a pure draw of (ctx, progress[, tier]) — same (inputs) →
 * same pixels, so scrub, rewind, and reduced-motion static renders are exact.
 */

import type { SpecTierId } from '../constants';

export interface SpecScreenDrawParams {
  ctx: CanvasRenderingContext2D;
  width: number;
  height: number;
  /** 0-1 progress for draw-in animation. 1 = fully drawn. */
  progress: number;
  /** Selected v2 tier — only the 'custom' phase reads it. */
  tier?: SpecTierId | null;
}

export type SpecScreenDrawFn = (params: SpecScreenDrawParams) => void;
