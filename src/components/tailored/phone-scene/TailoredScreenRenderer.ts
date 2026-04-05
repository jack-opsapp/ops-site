/**
 * TailoredScreenRenderer — Canvas 2D orchestrator for tailored phone screens.
 *
 * Manages phase transitions with fade-out → draw-in animations.
 * Follows the same pattern as platform's ScreenRenderer but simpler
 * (no tab bar interaction, no hover states).
 */

import { CANVAS_WIDTH, CANVAS_HEIGHT, TIMING, PHASE_TIMING } from './constants';
import type { TailoredPhase } from './constants';
import type { TailoredScreenDrawFn } from './screens/types';

import { drawTailoredHome } from './screens/tailored-home';
import { drawTailoredPackages } from './screens/tailored-packages';
import { drawTailoredAnalysis } from './screens/tailored-analysis';
import { drawTailoredBuilding } from './screens/tailored-building';
import { drawTailoredCustom } from './screens/tailored-custom';

const SCREEN_MAP: Record<TailoredPhase, TailoredScreenDrawFn> = {
  home: drawTailoredHome,
  packages: drawTailoredPackages,
  analysis: drawTailoredAnalysis,
  building: drawTailoredBuilding,
  custom: drawTailoredCustom,
};

export class TailoredScreenRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private activePhase: TailoredPhase = 'home';
  private activeTier: 'setup' | 'build' | 'enterprise' | null = null;
  private animationProgress = 0;
  private animationStartTime = 0;
  private isAnimating = false;
  private isFadingOut = false;
  private fadeProgress = 1;
  private pendingPhase: TailoredPhase | null = null;
  private pendingTier: typeof this.activeTier = null;
  private rafId: number | null = null;
  private onFrameCallback: (() => void) | null = null;
  private paused = false;
  private useFastTiming = false;

  constructor() {
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

  setPaused(paused: boolean) {
    this.paused = paused;
    if (!paused && !this.rafId) {
      this.drawCurrentFrame();
    }
  }

  /** Switch to a new phase with transition animation */
  switchPhase(phase: TailoredPhase, tier?: string | null) {
    if (phase === this.activePhase && tier === (this.activeTier ?? undefined)) return;

    // Use fast timing for package selection, standard for scroll phases
    this.useFastTiming = phase === 'custom' || phase === 'packages';

    this.pendingPhase = phase;
    this.pendingTier = (tier as typeof this.activeTier) ?? null;

    // Start fade out
    this.isFadingOut = true;
    this.fadeProgress = 1;
    this.animationStartTime = performance.now();
    this.startLoop();
  }

  /** Instant switch (reduced motion) */
  switchPhaseInstant(phase: TailoredPhase, tier?: string | null) {
    this.activePhase = phase;
    this.activeTier = (tier as typeof this.activeTier) ?? null;
    this.animationProgress = 1;
    this.fadeProgress = 1;
    this.isAnimating = false;
    this.isFadingOut = false;
    this.drawCurrentFrame();
  }

  /** Initial draw with animation */
  startInitialDraw() {
    this.animationProgress = 0;
    this.isAnimating = true;
    this.animationStartTime = performance.now();
    this.startLoop();
  }

  /** Static render at full progress */
  drawStatic(phase?: TailoredPhase) {
    if (phase) this.activePhase = phase;
    this.animationProgress = 1;
    this.fadeProgress = 1;
    this.drawCurrentFrame();
  }

  private startLoop() {
    if (this.rafId) return;
    this.animate();
  }

  private animate = () => {
    if (this.paused) {
      this.rafId = null;
      return;
    }

    const now = performance.now();
    const fadeOutDur = this.useFastTiming ? PHASE_TIMING.fastFadeOut : PHASE_TIMING.fadeOut;
    const drawInDur = this.useFastTiming ? PHASE_TIMING.fastDrawIn : PHASE_TIMING.drawIn;
    let needsLoop = false;

    // Fade out phase
    if (this.isFadingOut) {
      const elapsed = now - this.animationStartTime;
      this.fadeProgress = Math.max(0, 1 - elapsed / fadeOutDur);

      if (this.fadeProgress <= 0) {
        // Fade complete — switch to pending phase and start draw-in
        this.isFadingOut = false;
        if (this.pendingPhase) {
          this.activePhase = this.pendingPhase;
          this.activeTier = this.pendingTier;
          this.pendingPhase = null;
          this.pendingTier = null;
        }
        this.animationProgress = 0;
        this.isAnimating = true;
        this.animationStartTime = now;
      }
      needsLoop = true;
    }

    // Draw-in phase
    if (this.isAnimating && !this.isFadingOut) {
      const elapsed = now - this.animationStartTime;
      this.animationProgress = Math.min(1, elapsed / drawInDur);
      this.fadeProgress = 1;

      if (this.animationProgress >= 1) {
        this.isAnimating = false;
      }
      needsLoop = true;
    }

    this.drawCurrentFrame();

    if (needsLoop) {
      this.rafId = requestAnimationFrame(this.animate);
    } else {
      this.rafId = null;
    }
  };

  private drawCurrentFrame() {
    const { ctx } = this;
    const width = CANVAS_WIDTH;
    const height = CANVAS_HEIGHT;

    // Clear
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = '#0A0A0A';
    ctx.fillRect(0, 0, width, height);

    // Apply fade
    ctx.save();
    ctx.globalAlpha = this.fadeProgress;

    // Draw active screen
    const drawFn = SCREEN_MAP[this.activePhase];
    drawFn({
      ctx,
      width,
      height,
      progress: TIMING.easeOut(this.animationProgress),
      tier: this.activeTier,
    });

    ctx.restore();

    // Notify Three.js texture needs update
    this.onFrameCallback?.();
  }
}
