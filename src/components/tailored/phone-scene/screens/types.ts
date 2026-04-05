/**
 * Shared types for tailored screen drawing functions.
 */

export interface TailoredScreenDrawParams {
  ctx: CanvasRenderingContext2D;
  width: number;
  height: number;
  progress: number;
  /** Selected package tier — only used by 'custom' screen */
  tier?: 'setup' | 'build' | 'enterprise' | null;
}

export type TailoredScreenDrawFn = (params: TailoredScreenDrawParams) => void;
