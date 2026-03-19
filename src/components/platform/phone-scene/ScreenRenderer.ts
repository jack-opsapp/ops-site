/**
 * ScreenRenderer — Canvas 2D orchestrator for wireframe screens.
 *
 * Manages an offscreen <canvas>, draws the active screen with animated
 * draw-in transitions, and provides the canvas as a texture source for R3F.
 */

import { CANVAS_WIDTH, CANVAS_HEIGHT, TIMING, DEFAULT_TAB, TABS, LAYOUT } from './constants';
import { drawTabBar, clearCanvas } from './draw-utils';
import { drawHomeScreen } from './screens/home-screen';
import { drawJobBoardScreen } from './screens/jobboard-screen';
import { drawScheduleScreen } from './screens/schedule-screen';
import { drawSettingsScreen } from './screens/settings-screen';
import type { TabId } from './constants';
import type { ScreenDrawFn } from './screens/types';

const SCREEN_DRAW_MAP: Record<TabId, ScreenDrawFn> = {
  home: drawHomeScreen,
  jobboard: drawJobBoardScreen,
  schedule: drawScheduleScreen,
  settings: drawSettingsScreen,
};

export class ScreenRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private activeTab: TabId = DEFAULT_TAB;
  private animationProgress = 0; // 0 = nothing drawn, 1 = fully drawn
  private animationStartTime = 0;
  private isAnimating = false;
  private isFadingOut = false;
  private fadeProgress = 1; // 1 = fully visible, 0 = faded out
  private pendingTab: TabId | null = null;
  private rafId: number | null = null;
  private onFrameCallback: (() => void) | null = null;

  constructor() {
    this.canvas = document.createElement('canvas');
    this.canvas.width = CANVAS_WIDTH;
    this.canvas.height = CANVAS_HEIGHT;
    const ctx = this.canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas 2D context not available');
    this.ctx = ctx;

    // Render a static frame immediately so the canvas is never blank
    // (prevents flash when Sprint 3 maps this as a texture)
    this.drawStatic();
  }

  /** Get the canvas element (for use as CanvasTexture source) */
  getCanvas(): HTMLCanvasElement {
    return this.canvas;
  }

  /** Get current active tab */
  getActiveTab(): TabId {
    return this.activeTab;
  }

  /** Set a callback to fire every animation frame (for texture.needsUpdate) */
  onFrame(callback: () => void) {
    this.onFrameCallback = callback;
  }

  /** Start the initial draw-in animation for the default tab */
  startInitialDraw() {
    this.animationProgress = 0;
    this.fadeProgress = 1;
    this.isAnimating = true;
    this.animationStartTime = performance.now();
    this.animate();
  }

  /** Switch to a different tab with fade-out → draw-in transition.
   *  Rapid taps update the pending target instead of being dropped. */
  switchTab(newTab: TabId) {
    if (newTab === this.activeTab && !this.isFadingOut) return;

    if (this.isFadingOut) {
      // Mid-transition: update target — the fade will resolve to the latest tap
      this.pendingTab = newTab;
      return;
    }

    this.pendingTab = newTab;
    this.isFadingOut = true;
    this.animationStartTime = performance.now();
    this.isAnimating = true;

    if (!this.rafId) {
      this.animate();
    }
  }

  /** Main animation loop */
  private animate = () => {
    const now = performance.now();
    const elapsed = now - this.animationStartTime;

    if (this.isFadingOut) {
      // Fade out current screen
      this.fadeProgress = Math.max(0, 1 - elapsed / TIMING.fadeOutDuration);

      if (this.fadeProgress <= 0) {
        // Fade complete — switch to new tab and start draw-in
        this.isFadingOut = false;
        if (this.pendingTab) {
          this.activeTab = this.pendingTab;
          this.pendingTab = null;
        }
        this.animationProgress = 0;
        this.fadeProgress = 1;
        this.animationStartTime = performance.now();
      }
    } else if (this.animationProgress < 1) {
      // Draw-in animation
      const rawProgress = elapsed / TIMING.drawInDuration;
      this.animationProgress = Math.min(1, TIMING.easeOut(rawProgress));
    }

    // Render current frame
    this.renderFrame();

    // Continue or stop
    if (this.isFadingOut || this.animationProgress < 1) {
      this.rafId = requestAnimationFrame(this.animate);
    } else {
      this.isAnimating = false;
      this.rafId = null;
      // One final render at progress=1 to ensure crisp final state
      this.renderFrame();
    }
  };

  /** Render a single frame of the current screen + tab bar */
  private renderFrame() {
    const { ctx } = this;
    const w = CANVAS_WIDTH;
    const h = CANVAS_HEIGHT;

    clearCanvas(ctx, w, h);

    ctx.save();
    ctx.globalAlpha = this.fadeProgress;

    // Draw active screen
    const drawFn = SCREEN_DRAW_MAP[this.activeTab];
    drawFn({ ctx, width: w, height: h, progress: this.animationProgress });

    // Draw tab bar (always drawn with the screen's progress)
    const activeIndex = TABS.findIndex((t) => t.id === this.activeTab);
    drawTabBar(ctx, activeIndex, w, LAYOUT.tabBarY, this.animationProgress);

    ctx.restore();

    // Notify listener (for Three.js texture update)
    this.onFrameCallback?.();
  }

  /** Draw a static frame at full progress (for fallback / no-animation mode) */
  drawStatic(tab?: TabId) {
    if (tab) this.activeTab = tab;
    this.animationProgress = 1;
    this.fadeProgress = 1;
    this.renderFrame();
  }

  /** Check if currently animating (for R3F frame loop demand) */
  isCurrentlyAnimating(): boolean {
    return this.isAnimating;
  }

  /** Clean up */
  destroy() {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    this.onFrameCallback = null;
  }
}
