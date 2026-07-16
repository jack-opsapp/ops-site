/**
 * SpecScreenRenderer — Canvas 2D orchestrator for the SPEC phone screens.
 *
 * Manages an offscreen <canvas>, draws the active (phase, tier) screen with
 * fade-out → draw-in transitions, and provides the canvas as a texture
 * source for R3F. Screens are pure draws of progress — same inputs, same
 * pixels — so rewinds, instant switches (reduced motion), and static renders
 * are exact.
 */

import {
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  TIMING,
  drawInDuration,
  type SpecPhase,
  type SpecTierId,
} from './constants';
import { clearCanvas } from './screens/chrome';
import { drawHome } from './screens/home';
import { drawWorkflows } from './screens/workflows';
import { drawSystems } from './screens/systems';
import { drawBuilding } from './screens/building';
import { drawTierSpec01 } from './screens/tier-spec01';
import { drawTierSpec02 } from './screens/tier-spec02';
import { drawTierSpec03 } from './screens/tier-spec03';
import type { SpecScreenDrawFn } from './screens/types';

const PHASE_SCREENS: Record<Exclude<SpecPhase, 'custom'>, SpecScreenDrawFn> = {
  home: drawHome,
  packages: drawWorkflows,
  analysis: drawSystems,
  building: drawBuilding,
};

const TIER_SCREENS: Record<SpecTierId, SpecScreenDrawFn> = {
  spec01: drawTierSpec01,
  spec02: drawTierSpec02,
  spec03: drawTierSpec03,
};

/** The screen behind a (phase, tier) pair. 'custom' with no tier falls back
 *  to SPEC-02 — the recommended tier is the default story. */
export function resolveScreen(phase: SpecPhase, tier: SpecTierId | null): SpecScreenDrawFn {
  if (phase === 'custom') {
    return TIER_SCREENS[tier ?? 'spec02'];
  }
  return PHASE_SCREENS[phase];
}

export class SpecScreenRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private activePhase: SpecPhase = 'home';
  private activeTier: SpecTierId | null = null;
  private animationProgress = 0;
  private animationStartTime = 0;
  private isAnimating = false;
  private isFadingOut = false;
  private fadeProgress = 1;
  private pendingPhase: SpecPhase | null = null;
  private pendingTier: SpecTierId | null = null;
  private rafId: number | null = null;
  private onFrameCallback: (() => void) | null = null;
  private paused = false;

  constructor() {
    // 2x DPR for sharp rendering when mapped to the 3D screen texture.
    const DPR = 2;
    this.canvas = document.createElement('canvas');
    this.canvas.width = CANVAS_WIDTH * DPR;
    this.canvas.height = CANVAS_HEIGHT * DPR;
    const ctx = this.canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas 2D context not available');
    ctx.scale(DPR, DPR);
    this.ctx = ctx;
  }

  getCanvas(): HTMLCanvasElement {
    return this.canvas;
  }

  onFrame(callback: () => void) {
    this.onFrameCallback = callback;
  }

  /** Set the mount-time target without animating (deep-link entry). The
   *  first draw then draws the visitor's actual phase, not a home flash. */
  setInitial(phase: SpecPhase, tier: SpecTierId | null) {
    this.activePhase = phase;
    this.activeTier = tier;
  }

  setPaused(paused: boolean) {
    if (this.paused === paused) return;
    this.paused = paused;
    if (paused && this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    } else if (!paused && this.isAnimating && !this.rafId) {
      this.animationStartTime = performance.now();
      this.animate();
    }
  }

  /** Switch with fade-out → draw-in. Rapid phase changes update the pending
   *  target instead of being dropped. */
  switchPhase(phase: SpecPhase, tier: SpecTierId | null) {
    if (phase === this.activePhase && tier === this.activeTier && !this.isFadingOut) return;

    this.pendingPhase = phase;
    this.pendingTier = tier;

    if (this.isFadingOut) return; // mid-fade: resolves to the latest target

    this.isFadingOut = true;
    this.animationStartTime = performance.now();
    this.isAnimating = true;
    if (!this.rafId) this.animate();
  }

  /** Instant switch (reduced motion) — full-progress static frame. */
  switchPhaseInstant(phase: SpecPhase, tier: SpecTierId | null) {
    this.activePhase = phase;
    this.activeTier = tier;
    this.pendingPhase = null;
    this.pendingTier = null;
    this.animationProgress = 1;
    this.fadeProgress = 1;
    this.isAnimating = false;
    this.isFadingOut = false;
    this.renderFrame();
  }

  /** Initial draw-in animation for the current target. */
  startInitialDraw() {
    this.animationProgress = 0;
    this.fadeProgress = 1;
    this.isAnimating = true;
    this.animationStartTime = performance.now();
    this.animate();
  }

  /** Static render at full progress (reduced motion / fallbacks). */
  drawStatic(phase?: SpecPhase, tier?: SpecTierId | null) {
    if (phase) this.activePhase = phase;
    if (tier !== undefined) this.activeTier = tier;
    this.animationProgress = 1;
    this.fadeProgress = 1;
    this.renderFrame();
  }

  private animate = () => {
    if (this.paused) {
      this.rafId = null;
      return;
    }

    const now = performance.now();
    const elapsed = now - this.animationStartTime;

    if (this.isFadingOut) {
      this.fadeProgress = Math.max(0, 1 - elapsed / TIMING.fadeOutDuration);

      if (this.fadeProgress <= 0) {
        this.isFadingOut = false;
        if (this.pendingPhase) {
          this.activePhase = this.pendingPhase;
          this.activeTier = this.pendingTier;
          this.pendingPhase = null;
          this.pendingTier = null;
        }
        this.animationProgress = 0;
        this.fadeProgress = 1;
        this.animationStartTime = performance.now();
      }
    } else if (this.animationProgress < 1) {
      const duration = drawInDuration(this.activePhase, this.activeTier);
      this.animationProgress = Math.min(1, elapsed / duration);
    }

    this.renderFrame();

    if (this.isFadingOut || this.animationProgress < 1) {
      this.rafId = requestAnimationFrame(this.animate);
    } else {
      this.isAnimating = false;
      this.rafId = null;
      this.renderFrame(); // one final crisp frame
    }
  };

  private renderFrame() {
    const { ctx } = this;
    const w = CANVAS_WIDTH;
    const h = CANVAS_HEIGHT;

    clearCanvas(ctx, w, h);

    ctx.save();
    ctx.globalAlpha = this.fadeProgress;

    // Global progress carries the OPS curve once; screens window it with
    // linear phase() or the kit's win() per element.
    const drawFn = resolveScreen(this.activePhase, this.activeTier);
    drawFn({
      ctx,
      width: w,
      height: h,
      progress: TIMING.easeOut(this.animationProgress),
      tier: this.activeTier,
    });

    ctx.restore();

    this.onFrameCallback?.();
  }

  destroy() {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    this.onFrameCallback = null;
  }
}
