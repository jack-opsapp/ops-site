'use client';

/**
 * SpecStickyDepositBar — persistent bottom-docked deposit CTA.
 *
 * Finishes the "obvious CTA" workstream: once the hero scrolls away, a slim
 * hairline glass bar stays docked with ONE primary action plus a live
 * focal-tier readout (tier · availability · next intake) derived from the
 * SAME board snapshot the OPS BOARD renders — via selectDisplayRows, so the
 * two can never disagree. No fabricated "N slots left" integer; the readout
 * is the real availability bucket + next-intake date, or the em-dash empty
 * state when unknown.
 *
 * Motion (animation-architect + web-animations): a Framer useScroll-driven
 * translateY + fade reveal bound to scroll position — the bar tracks the
 * scroll as the hero's bottom passes (no time-based easing). Under
 * prefers-reduced-motion it simply docks (snaps in/out, no slide/fade) at
 * the same threshold — an equivalent reduced variant, not a disabled one.
 * No infinite/ambient motion. That preference feeds the scroll transforms
 * rather than switching the style shape, so the MotionValue binding is
 * identical on server and client — the two can never desync on hydration, and
 * the reduced variant holds even when the preference resolves true only after
 * mount (which the SSR-safe local hook ./useReducedMotion does).
 *
 * Flag-safe: when depositsEnabled is false the single action becomes the
 * "Talk to the founder" contact link; when true it routes to the canonical
 * /spec/billing-address deposit entry (shared with the package cards).
 */

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  motion,
  useMotionValueEvent,
  useScroll,
  useTransform,
} from 'framer-motion';
import { useReducedMotion } from './useReducedMotion';
import type { SpecBoardSnapshot } from '@/lib/spec/board';
import {
  availabilityLabel,
  availabilityTone,
  selectDisplayRows,
  type SpecOpsBoardCopy,
} from '@/lib/spec/board-display';
import { formatCad, tierDepositCents, type SpecTier } from '@/lib/spec/pricing';
import { specBillingAddressPath } from '@/lib/spec/deposit-entry';
import { trackSpecMarketingEvent } from '@/lib/marketing-analytics';

/** Pixels of slide travel for the reveal. */
const TRAVEL = 64;

interface SpecStickyDepositBarProps {
  /** Phase 0 safety flag — false → "Talk to the founder" contact link. */
  depositsEnabled: boolean;
  /** Tier the bar reserves. Defaults to build; follows the questionnaire fit. */
  focalTier: SpecTier;
  /** Server-fetched board snapshot — drives the live readout. */
  boardSnapshot: SpecBoardSnapshot;
  /** Board copy (shared with SpecOpsBoard) for the readout labels. */
  copy: SpecOpsBoardCopy;
  /** Deposit CTA template with {tier} + {deposit} placeholders. */
  reserveTemplate: string;
  /** Region aria-label. */
  ariaLabel: string;
  /** Off-state contact link copy + href (reused from packages.contactCta). */
  contactCtaText: string;
  contactCtaHref: string;
  /** Ref to the hero block — the bar reveals once its bottom scrolls past. */
  revealAfterRef: React.RefObject<HTMLElement | null>;
  /** Optional secondary "help me choose" affordance (desktop only). */
  onHelpMeChoose?: () => void;
  helpMeChooseLabel?: string;
}

function clamp01(n: number): number {
  return n < 0 ? 0 : n > 1 ? 1 : n;
}

export default function SpecStickyDepositBar({
  depositsEnabled,
  focalTier,
  boardSnapshot,
  copy,
  reserveTemplate,
  ariaLabel,
  contactCtaText,
  contactCtaHref,
  revealAfterRef,
  onHelpMeChoose,
  helpMeChooseLabel,
}: SpecStickyDepositBarProps) {
  const reduceMotion = useReducedMotion();
  const { scrollY } = useScroll();

  // Reveal threshold = the hero's bottom edge in document space. Held in a
  // ref so the scroll-driven transforms always read the latest measurement
  // without re-instantiating the motion values. Starts large so the bar is
  // hidden until measured (no first-paint flash).
  const thresholdRef = useRef<number>(100_000);
  const [revealed, setRevealed] = useState(false);

  // Latest reduced-motion preference, mirrored into a ref so the scroll
  // transforms below read it each tick without ever swapping the style shape
  // (a MotionValue↔plain-value swap would leave framer's binding stale).
  // Written from an effect, never during render.
  const reduceMotionRef = useRef(false);
  useEffect(() => {
    reduceMotionRef.current = reduceMotion;
  }, [reduceMotion]);

  // Measure the reveal threshold (hero bottom in document space) on mount,
  // on resize, and once more after a frame + after load so font/image-driven
  // reflow is captured. Imperative — writes thresholdRef, no re-render. Also
  // seeds `revealed` from the current scroll so a deep-linked / already-
  // scrolled load resolves correctly.
  useEffect(() => {
    const measure = () => {
      const el = revealAfterRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      thresholdRef.current = rect.bottom + window.scrollY;
      const isPast = window.scrollY >= thresholdRef.current - TRAVEL / 2;
      setRevealed((prev) => (prev === isPast ? prev : isPast));
    };
    const raf = requestAnimationFrame(measure);
    window.addEventListener('resize', measure, { passive: true });
    window.addEventListener('load', measure);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', measure);
      window.removeEventListener('load', measure);
    };
  }, [revealAfterRef]);

  // Function-form transforms read thresholdRef (and the reduced-motion ref)
  // each frame, so a late measurement (fonts, images) is picked up without a
  // stale input range. Under reduced motion the SAME thresholds drive a snap:
  // y pins to 0 (no slide) and opacity flips 0→1 at the band midpoint — the
  // identical cutoff `revealed` uses (progress > 0.5 ⇔ v > threshold − TRAVEL/2)
  // — so opacity, aria-hidden, and pointer-events all flip together. The
  // preference is read through a ref, not branched into the style shape, so
  // these MotionValues stay permanently bound: swapping a style key between a
  // MotionValue and a plain value leaves framer's binding stale (observed live —
  // opacity pinned at its last motion-applied value, the bar never docking).
  const y = useTransform(scrollY, (v) => {
    if (reduceMotionRef.current) return 0;
    const start = thresholdRef.current - TRAVEL;
    return (1 - clamp01((v - start) / TRAVEL)) * TRAVEL;
  });
  const opacity = useTransform(scrollY, (v) => {
    const start = thresholdRef.current - TRAVEL;
    const progress = clamp01((v - start) / TRAVEL);
    if (reduceMotionRef.current) return progress > 0.5 ? 1 : 0;
    return progress;
  });

  // `revealed` gates pointer-events + aria-hidden for both motion paths, and
  // drives the snap visibility under reduced motion.
  useMotionValueEvent(scrollY, 'change', (v) => {
    const isPast = v >= thresholdRef.current - TRAVEL / 2;
    setRevealed((prev) => (prev === isPast ? prev : isPast));
  });

  const rows = useMemo(() => selectDisplayRows(boardSnapshot, copy), [boardSnapshot, copy]);
  const focalRow = useMemo(
    () => rows.find((r) => r.tier === focalTier) ?? rows[0],
    [rows, focalTier],
  );

  // Human designation (SPEC-0N), never the raw slug; deposit from pricing.ts.
  const reserveLabel = reserveTemplate
    .replace('{tier}', copy.tierLabels[focalTier])
    .replace('{deposit}', formatCad(tierDepositCents(focalTier)));

  function handleReserve() {
    trackSpecMarketingEvent('pay_deposit_click', { tier: focalTier, source: 'sticky_bar' });
    window.location.href = specBillingAddressPath(focalTier);
  }

  const ctaClass =
    'inline-flex items-center justify-center text-center font-caption uppercase tracking-[0.15em] ' +
    'text-[11px] sm:text-xs px-5 py-3 rounded-[5px] bg-ops-accent text-ops-background ' +
    'hover:bg-ops-accent/90 transition-colors duration-200 cursor-pointer whitespace-nowrap ' +
    '[font-variant-numeric:tabular-nums_slashed-zero] focus-visible:outline focus-visible:outline-[1.5px] ' +
    'focus-visible:outline-ops-accent focus-visible:outline-offset-2';

  return (
    <motion.aside
      aria-label={ariaLabel}
      aria-hidden={!revealed}
      // The style shape is constant — across SSR/hydration AND across
      // preference flips; reduced-motion behavior lives inside the scroll
      // transforms above, not in a branch here.
      style={{ y, opacity, pointerEvents: revealed ? 'auto' : 'none' }}
      className="fixed inset-x-0 bottom-0 z-40 border-t border-ops-border bg-ops-glass-dense backdrop-blur-md"
    >
      <div className="mx-auto flex max-w-[1320px] flex-col gap-3 px-6 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-10 md:px-16 lg:px-24">
        {/* Live focal-tier readout — composed from the shared board rows. */}
        <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.14em] [font-variant-numeric:tabular-nums_slashed-zero]">
          <span className="text-ops-text-primary">{copy.tierLabels[focalRow.tier]}</span>
          <span className="text-ops-text-mute" aria-hidden="true">·</span>
          <span className={availabilityTone(focalRow.availability)}>
            {availabilityLabel(focalRow.availability, copy)}
          </span>
          <span className="hidden text-ops-text-mute sm:inline" aria-hidden="true">·</span>
          <span className="hidden text-ops-text-secondary sm:inline">{focalRow.nextIntakeText}</span>
        </div>

        {/* Secondary "help me choose" (desktop) + the one primary action. */}
        <div className="flex w-full items-center justify-end gap-3 sm:w-auto sm:gap-4">
          {onHelpMeChoose && helpMeChooseLabel && (
            <button
              type="button"
              onClick={onHelpMeChoose}
              className="hidden cursor-pointer font-mono text-[10px] uppercase tracking-[0.18em] text-ops-text-tertiary transition-colors duration-150 hover:text-ops-text-primary focus-visible:outline focus-visible:outline-[1.5px] focus-visible:outline-ops-accent focus-visible:outline-offset-2 sm:inline-flex"
            >
              {helpMeChooseLabel}
            </button>
          )}
          {depositsEnabled ? (
            <button type="button" onClick={handleReserve} className={`${ctaClass} w-full sm:w-auto`}>
              {reserveLabel}
            </button>
          ) : (
            <a href={contactCtaHref} className={`${ctaClass} w-full sm:w-auto`}>
              {contactCtaText}
            </a>
          )}
        </div>
      </div>
    </motion.aside>
  );
}
