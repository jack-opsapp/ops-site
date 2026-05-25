/**
 * Shared types for SPEC screen drawing functions.
 */

export interface SpecScreenDrawParams {
  ctx: CanvasRenderingContext2D;
  width: number;
  height: number;
  progress: number;
  /** Selected package tier — only used by 'custom' screen */
  tier?: 'setup' | 'build' | 'enterprise' | null;
}

export type SpecScreenDrawFn = (params: SpecScreenDrawParams) => void;
