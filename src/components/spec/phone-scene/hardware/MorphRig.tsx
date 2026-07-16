'use client';

/**
 * MorphRig — drives the phone's tagged materials from the two spec channels.
 *
 * Vendored from the platform scene's approved hardware and adapted: the
 * platform drove body, ink, AND screen glass from one scroll-glide scalar;
 * the spec page separates them —
 *
 *   drawing — fills recede to occluder-black + ink fades in ("we draft your
 *             machine", raised only while the BUILD zone owns the phone)
 *   glass   — the screen's glass layer sheds for content phases (real
 *             smudged glass in the hero, zero-glare display when the screen
 *             is the story)
 *
 * Subscribes to both channels and imperatively drives every tagged material
 * in the phone group — zero React re-renders in the hot path.
 *
 * The drawing morph is a LIGHT-SPACE fade, not an alpha fade: solid fills
 * lerp color → the occluder's canvas-black and their light response → zero
 * (env, clearcoat, specular, metalness), so the body recedes into near-black
 * — one material per mesh, no transparency sorting, no doubled geometry.
 * Ink (tagged line materials) fades in across the earlier window. Scrubbing
 * back re-materializes exactly.
 *
 * Tagging contract (written by PhoneModel, documented in morph-channel.ts):
 *   userData.morphFill = true            → fill: recede to occluder-black
 *   userData.morphScreen = true          → screen glass: shed on glass t
 *   userData.morphLine = { from, to }    → ink: opacity from → to
 */

import { useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import { Color, type Group, type Material } from 'three';
import { bodyMix, lineMix, type MorphChannel } from './morph-channel';
import type { MutableRefObject } from 'react';

/** The drawing's canvas-black occluder fill color. */
const OCCLUDER_COLOR = new Color('#050506');

/**
 * Uniform-driven params lerp to a hard 0; define-backed params (clearcoat,
 * iridescence) floor at EPS instead — dropping them to exactly 0 removes
 * their shader define and forces a program recompile mid-animation (a
 * visible hitch). At 1e-4 their contribution is beneath one 8-bit color step.
 */
const EPS = 1e-4;

/** Numeric properties driven on fills: [key, target, defineBacked] */
const FILL_PARAMS: ReadonlyArray<readonly [string, number, boolean]> = [
  ['metalness', 0, false],
  ['roughness', 1, false],
  ['specularIntensity', 0, false],
  ['reflectivity', 0, false],
  ['envMapIntensity', 0, false],
  ['clearcoat', 0, true],
  ['iridescence', 0, true],
];

/** Screen glass sheds on the glass channel. Color/roughness/emissive stay —
    the display itself never dims, only its glass. */
const SCREEN_PARAMS: ReadonlyArray<readonly [string, number, boolean]> = [
  ['clearcoat', 0, true],
  ['envMapIntensity', 0, false],
  ['reflectivity', 0, false],
];

interface FillEntry {
  material: Material & { color?: Color } & Record<string, unknown>;
  fromColor: Color;
  fromNums: Array<readonly [string, number, number]>; // [key, from, target]
}

interface LineEntry {
  material: Material & { opacity: number };
  from: number;
  to: number;
}

type ScreenEntry = Pick<FillEntry, 'material' | 'fromNums'>;

interface MorphRigProps {
  drawing: MorphChannel;
  glass: MorphChannel;
  /** The rotating phone group — the traversal root for tagged materials. */
  phoneGroupRef: MutableRefObject<Group | null>;
}

export default function MorphRig({ drawing, glass, phoneGroupRef }: MorphRigProps) {
  const invalidate = useThree((s) => s.invalidate);

  useEffect(() => {
    const seen = new WeakSet<Material>();
    const fills: FillEntry[] = [];
    const lines: LineEntry[] = [];
    const screens: ScreenEntry[] = [];
    let lastDrawing: number | null = null;
    let lastGlass: number | null = null;

    // Collect any not-yet-seen tagged materials. Cheap when nothing is new
    // (a walk over ~70 objects, no allocation); re-run on every publish so
    // Suspense stragglers (the SVG-loaded OPS badge, the engraving font)
    // join the rig with their authored from-state snapshotted before any
    // drive touches them.
    const collect = () => {
      const root = phoneGroupRef.current;
      if (!root) return;
      root.traverse((obj) => {
        const material = (obj as { material?: Material | Material[] }).material;
        if (!material) return;
        for (const mat of Array.isArray(material) ? material : [material]) {
          if (seen.has(mat)) continue;
          const m = mat as FillEntry['material'];
          if (mat.userData.morphFill === true && m.color instanceof Color) {
            seen.add(mat);
            const fromNums: Array<readonly [string, number, number]> = [];
            for (const [key, target, defineBacked] of FILL_PARAMS) {
              const from = m[key];
              if (typeof from !== 'number') continue;
              // Floor define-backed params at EPS only when they start > 0
              // (a param that mounts at 0 has no define to preserve).
              const floored = defineBacked && from > 0 ? Math.max(target, EPS) : target;
              fromNums.push([key, from, floored]);
            }
            fills.push({ material: m, fromColor: m.color.clone(), fromNums });
          } else if (mat.userData.morphScreen === true) {
            seen.add(mat);
            const m2 = mat as FillEntry['material'];
            const fromNums: Array<readonly [string, number, number]> = [];
            for (const [key, target, defineBacked] of SCREEN_PARAMS) {
              const from = m2[key];
              if (typeof from !== 'number') continue;
              const floored = defineBacked && from > 0 ? Math.max(target, EPS) : target;
              fromNums.push([key, from, floored]);
            }
            screens.push({ material: m2, fromNums });
          } else if (mat.userData.morphLine) {
            const { from, to } = mat.userData.morphLine as { from: number; to: number };
            seen.add(mat);
            lines.push({ material: mat as LineEntry['material'], from, to });
          }
        }
      });
    };

    const driveDrawing = (t: number) => {
      const bt = bodyMix(t);
      const lt = lineMix(t);
      for (const { material, fromColor, fromNums } of fills) {
        material.color!.copy(fromColor).lerp(OCCLUDER_COLOR, bt);
        for (const [key, from, target] of fromNums) {
          (material as Record<string, unknown>)[key] = from + (target - from) * bt;
        }
      }
      for (const { material, from, to } of lines) {
        material.opacity = from + (to - from) * lt;
      }
    };

    const driveGlass = (t: number) => {
      for (const { material, fromNums } of screens) {
        for (const [key, from, target] of fromNums) {
          (material as Record<string, unknown>)[key] = from + (target - from) * t;
        }
      }
    };

    // Sub-threshold micro-jitter is invisible; endpoints always land exact.
    const meaningful = (t: number, last: number | null) =>
      last === null || t === 0 || t === 1 || Math.abs(t - last) >= 0.0015;

    // Shared sync path: collect, then drive BOTH dimensions with their last
    // known values. Any straggler material that joined in collect() is healed
    // to the current mixed state regardless of which channel published — a
    // fill that arrives mid-drawing must not stay powder-coat until the
    // drawing channel happens to move again.
    const sync = () => {
      collect();
      if (lastDrawing !== null) driveDrawing(lastDrawing);
      if (lastGlass !== null) driveGlass(lastGlass);
    };

    const unsubDrawing = drawing.subscribe((t) => {
      if (!meaningful(t, lastDrawing)) return;
      lastDrawing = t;
      sync();
      invalidate();
    });

    const unsubGlass = glass.subscribe((t) => {
      if (!meaningful(t, lastGlass)) return;
      lastGlass = t;
      sync();
      invalidate();
    });

    return () => {
      unsubDrawing();
      unsubGlass();
    };
  }, [drawing, glass, phoneGroupRef, invalidate]);

  return null;
}
