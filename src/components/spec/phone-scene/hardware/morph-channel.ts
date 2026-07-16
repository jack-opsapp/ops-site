/**
 * Morph channels + ramp math for the SPEC phone hardware.
 *
 * Vendored from the platform scene's approved hardware direction
 * (docs/plans/2026-07-10-phone-hardware-look-design.md) and adapted for the
 * /spec page, which drives TWO independent scalars instead of the platform's
 * single scroll-glide:
 *
 *   drawing — 0 = solid powder-coat hardware, 1 = the engineering drawing
 *             (canvas-black occluder body + hairline contour ink). The spec
 *             page raises this only while the BUILD zone owns the phone —
 *             "we draft your machine" made physical.
 *   glass   — 0 = real smudged screen glass (hero product shot),
 *             1 = zero-glare perfect display (content phases, where the
 *             screen is the story). The marketing convention: Apple's own
 *             guidelines prohibit screen reflections in product imagery.
 *
 * Material tagging contract (read by MorphRig, written by PhoneModel):
 *   material.userData.morphFill = true
 *     Solid-state material that recedes to the drawing's canvas-black
 *     occluder: color → #050506, light response → 0.
 *   material.userData.morphScreen = true
 *     The display's glass layer: clearcoat/env/reflectivity → 0 across the
 *     glass channel. Color/roughness/emissive are never touched — the
 *     display itself never dims, only its glass sheds.
 *   material.userData.morphLine = { from: number, to: number }
 *     Drawing ink whose opacity runs from → to across the line window
 *     (the frame's machined edge-catch starts at its solid-state 0.45 and
 *     grows into the drawing's structure tier; all other ink starts at 0).
 *
 * Ramp windows — linear remaps of an ALREADY-EASED t (the phase rig's
 * exponential convergence supplies the curve; re-easing here would
 * double-apply it):
 *   line [0.05, 0.85] — INK LEADS: the drawing is established over the
 *                       still-solid body almost as soon as the resolve begins
 *   body [0.30, 1]    — RECESSION FOLLOWS: the body only starts losing its
 *                       light once the ink can carry the silhouette
 * Ordering is the invariant: if recession led, the phone would die into the
 * canvas before the drawing existed (verified failure on the platform build —
 * a black void mid-flight). The object must be present at every t.
 */

/** Window (in drawing t) over which the solid body recedes to occluder-black. */
export const BODY_WINDOW: readonly [number, number] = [0.3, 1];

/** Window (in drawing t) over which the drawing's ink fades in. */
export const LINE_WINDOW: readonly [number, number] = [0.05, 0.85];

const clamp01 = (t: number): number => (t < 0 ? 0 : t > 1 ? 1 : t);

/** Linear remap of t across a window, clamped to [0, 1]. */
function windowMix(t: number, [start, end]: readonly [number, number]): number {
  return clamp01((t - start) / (end - start));
}

/** Body recession progress for a given drawing t. */
export function bodyMix(drawingT: number): number {
  return windowMix(drawingT, BODY_WINDOW);
}

/** Ink arrival progress for a given drawing t. */
export function lineMix(drawingT: number): number {
  return windowMix(drawingT, LINE_WINDOW);
}

export interface MorphChannel {
  publish(t: number): void;
  subscribe(cb: (t: number) => void): () => void;
}

/**
 * Zero-React-churn pub/sub — frames are published from the phase rig's
 * useFrame loop and consumed imperatively by MorphRig / PhoneEnvironment.
 * Late subscribers (Suspense stragglers: the SVG badge, the engraving font)
 * replay the last value so anchor entry mid-page lands the correct state.
 */
export function createMorphChannel(): MorphChannel {
  const subscribers = new Set<(t: number) => void>();
  let last = 0;
  let published = false;

  return {
    publish(t) {
      // Skip no-op publishes so subscribers only drive materials on change.
      if (published && t === last) return;
      published = true;
      last = t;
      for (const cb of subscribers) cb(t);
    },
    subscribe(cb) {
      subscribers.add(cb);
      if (published) cb(last);
      return () => {
        subscribers.delete(cb);
      };
    },
  };
}
