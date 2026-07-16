'use client';

import { useState, useEffect } from 'react';

/**
 * SSR-safe reduced-motion preference hook for the spec component family.
 *
 * Hydration contract: this returns `false` on the server AND on the first
 * client render, so the markup React hydrates against is always the
 * motion-enabled tree — server and client emit identical output and no
 * mismatch is possible. The user's real preference is read one commit after
 * mount (via the `matchMedia` subscription below) and from then on live-tracks
 * OS-level changes.
 *
 * This hook exists precisely because framer-motion's own `useReducedMotion`
 * reads `matchMedia` synchronously during the first client render: under
 * `prefers-reduced-motion: reduce` it returns `true` on the client while the
 * server rendered with `null`, so any SSR-visible branch on its value desyncs
 * the two trees and throws a hydration error. Deferring the read to an effect
 * is what keeps the first render constant across server and client.
 *
 * (A self-contained twin of phone-scene/hardware/useReducedMotion.ts — that
 * directory is a vendored, isolated bundle, so the spec components carry their
 * own copy rather than importing across that boundary.)
 */
export function useReducedMotion(): boolean {
  const [prefersReduced, setPrefersReduced] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
    // Deliberate: this one synchronous setState IS the deferred first read
    // that keeps SSR and the first client render byte-identical (the hook's
    // whole contract). Reading matchMedia during render is the hydration bug
    // this file exists to prevent.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPrefersReduced(mql.matches);

    const onChange = (e: MediaQueryListEvent) => setPrefersReduced(e.matches);
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, []);

  return prefersReduced;
}

/**
 * Variant for components whose entrances fire at mount rather than behind an
 * IntersectionObserver (the /spec/confirmation family). `reduceMotion` carries
 * the same hydration contract as useReducedMotion above; `resolved` flips true
 * in the SAME commit the real preference lands (both live in one state object,
 * so the update is atomic by construction).
 *
 * Why the extra flag: framer only reads the `transition` prop when an animate
 * target CHANGES. A component that launches its entrance at mount schedules it
 * with the first-render transition — flipping the transition one commit later
 * re-times nothing, so a reduced-motion visitor would still get the full
 * transform choreography. Holding the animate target equal to `initial` until
 * `resolved` guarantees every animation is scheduled exactly once, with the
 * variant that matches the visitor's real preference. (SpecOpsBoard gets this
 * for free from its observer gate; mount-fired components need `resolved`.)
 */
export function useResolvedReducedMotion(): {
  reduceMotion: boolean;
  resolved: boolean;
} {
  const [state, setState] = useState({ reduceMotion: false, resolved: false });

  useEffect(() => {
    const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
    // Deliberate, same contract as above; the single state object additionally
    // guarantees `reduceMotion` and `resolved` land in one atomic commit,
    // which the entrance gating depends on.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState({ reduceMotion: mql.matches, resolved: true });

    const onChange = (e: MediaQueryListEvent) =>
      setState({ reduceMotion: e.matches, resolved: true });
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, []);

  return state;
}
