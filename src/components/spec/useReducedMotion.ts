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
    setPrefersReduced(mql.matches);

    const onChange = (e: MediaQueryListEvent) => setPrefersReduced(e.matches);
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, []);

  return prefersReduced;
}
