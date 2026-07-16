'use client';

/**
 * SpecOpsBoard — public capacity / queue / delivery visualization.
 *
 * Renders the OPS BOARD section between HowItWorks and Pricing per
 * 04_CUSTOMER_UX.md § 3. Data source: server-rendered initial snapshot
 * (passed via `initialSnapshot` from page.tsx → SpecPageContent) which
 * reads `public.spec_public_board_snapshot` via `lib/spec/board.ts`.
 *
 * Animation choreography (per animation-architect + data-visualization):
 *   • On-enter (IntersectionObserver, 30% threshold):
 *       - Header fades 200ms
 *       - Tier rows stagger 80ms apart at 400ms each
 *       - Timeline strokes left-to-right then markers pop sequentially
 *   • On row selection:
 *       - 2px steel-blue left rail (200ms)
 *       - Other rows dim 40% (200ms)
 *       - Timeline markers slide to new positions (350ms)
 *   • Ambient: LIVE indicator dot 2s soft pulse (CSS keyframe).
 *     The ONLY ambient motion on the page.
 *   • Single easing curve: cubic-bezier(0.22, 1, 0.36, 1). No spring.
 *   • Reduced-motion: SSR and the first client render always emit the
 *     motion-initial markup, so hydration matches byte-for-byte. One commit
 *     after mount the preference takes effect and the section settles with a
 *     single 200ms fade and zero transform motion (no slides, draws, or pops).
 *     The LIVE-dot pulse is disabled purely by the global reduced-motion CSS
 *     rule in globals.css, never by the component.
 *
 * Edge cases:
 *   • Tier WAITLIST → row in amber + "Join waitlist" CTA
 *   • Tier closed (is_accepting_bookings = false) → "CLOSED — RESUMES [public_note]"
 *   • Snapshot derivation lives in lib/spec/board-display (selectDisplayRows),
 *     shared with the sticky deposit bar. A populated snapshot — live, stale,
 *     or the seeded operator baseline — renders its rows; only a zero-tier
 *     snapshot falls back to the dictionary defaults. The is_stale flag drives
 *     the LIVE/FALLBACK badge + amber timestamp, not whether rows are shown.
 *   • refreshed_at > 72h → amber timestamp + "UPDATED [N] DAYS AGO"
 *   • All-tiers-OPEN → hides any future "WAITLIST" UI
 *
 * Mobile (< 768px): tier rows stack as cards. Timeline strip stays at bottom.
 */

import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useReducedMotion } from './useReducedMotion';
import { theme } from '@/lib/theme';
import { SectionLabel } from '@/components/ui';
import type { SpecBoardSnapshot, SpecBoardTier } from '@/lib/spec/board';
import {
  TIER_DURATIONS,
  type DisplayRow,
  type SpecOpsBoardCopy,
  selectDisplayRows,
  availabilityTone,
} from '@/lib/spec/board-display';
import { computeTimelineWindows } from '@/lib/spec/timeline';

// The snapshot → display-row derivation moved to lib/spec/board-display so
// the sticky deposit bar can reuse the exact same logic. Re-export the copy
// shape so existing consumers (SpecPageContent) keep their import path.
export type { SpecOpsBoardCopy } from '@/lib/spec/board-display';

const ease = theme.animation.easing as [number, number, number, number];

interface SpecOpsBoardProps {
  /** Server-rendered snapshot. May be empty + stale on Supabase outage. */
  initialSnapshot: SpecBoardSnapshot;
  copy: SpecOpsBoardCopy;
}

function buildUpdatedLabel(refreshedAt: string | null, copy: SpecOpsBoardCopy): string {
  if (!refreshedAt) return copy.updatedJustNow;
  const t = Date.parse(refreshedAt);
  if (Number.isNaN(t)) return copy.updatedJustNow;
  const ageMin = (Date.now() - t) / (1000 * 60);
  if (ageMin < 1) return copy.updatedJustNow;
  if (ageMin < 60) return `${Math.floor(ageMin)} ${copy.updatedMinAgo}`;
  const ageHr = ageMin / 60;
  if (ageHr < 24) return `${Math.floor(ageHr)} ${copy.updatedHrAgo}`;
  const ageDays = ageHr / 24;
  return `${Math.floor(ageDays)} ${copy.updatedDaysAgo}`;
}

function availabilityToneClass(
  availability: DisplayRow['availability'],
  isSelected: boolean,
  isDimmed: boolean,
): string {
  // Earth-tone semantic colour (shared with the sticky deposit bar via
  // board-display). Dimming overrides for unselected rows once active.
  if (isDimmed && !isSelected) return 'text-ops-text-mute';
  return availabilityTone(availability);
}

export default function SpecOpsBoard({ initialSnapshot, copy }: SpecOpsBoardProps) {
  const reduceMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  // Reduced-motion users skip the observer wait: `reduceMotion` is false on
  // the first render (see ./useReducedMotion) and flips true one commit after
  // mount, which settles the section without transform motion. Everyone else
  // waits for the IntersectionObserver to flip `hasObserved` to true once 30%
  // of the section is in view.
  const [hasObserved, setHasObserved] = useState(false);
  const hasEntered = reduceMotion || hasObserved;

  // Snapshot state. Initial value is the server-rendered snapshot — we
  // do not refetch on mount (server data is fresh enough; the 5-min
  // pg_cron + edge cache keeps it current within tolerance). Future
  // work can poll /api/spec/board if Phase 2 wants sub-5min freshness.
  const snapshot = initialSnapshot;

  const rows = useMemo<DisplayRow[]>(
    () => selectDisplayRows(snapshot, copy),
    [snapshot, copy],
  );

  // Default selected row: SPEC-02 (the recommended tier) unless not present.
  const [selectedTier, setSelectedTier] = useState<SpecBoardTier>(() => {
    const recommendedRow = rows.find((r) => r.tier === 'spec02' && r.isAcceptingBookings);
    if (recommendedRow) return 'spec02';
    const firstOpen = rows.find((r) => r.isAcceptingBookings);
    return firstOpen?.tier ?? 'spec01';
  });

  const isLive = !snapshot.is_stale && snapshot.refreshed_at !== null;
  const updatedLabel = buildUpdatedLabel(snapshot.refreshed_at, copy);

  // Hide WAITLIST row if all tiers are OPEN (per spec).
  // (Practically the row is rendered per tier; this hook is a no-op for
  // table layout — left here as a placeholder for any future "Join
  // waitlist" badge row that might be appended separately.)

  useEffect(() => {
    // On a reduced-motion client this effect first runs with reduceMotion
    // still false (the observer attaches), then re-runs once the hook flips
    // true — the early return then leaves the observer disconnected, and
    // hasEntered stays true via `reduceMotion` from there on.
    if (reduceMotion) return;
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setHasObserved(true);
            observer.disconnect();
            return;
          }
        }
      },
      { threshold: 0.3 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [reduceMotion]);

  const selectedRow = rows.find((r) => r.tier === selectedTier) ?? rows[0];

  return (
    <section
      ref={sectionRef}
      id="board"
      aria-label="OPS BOARD — current intake"
      className="relative py-24 md:py-32 bg-ops-background"
    >
      {/* Section header + LIVE indicator */}
      <header className="max-w-[1320px] mx-auto px-6 sm:px-10 md:px-16 lg:px-24">
        <motion.div
          // `initial` is read only at mount, where reduceMotion is false by
          // the hook's contract (see ./useReducedMotion), so this markup is
          // constant across SSR and hydration. Reduced motion is honored
          // through the transitions below, not by swapping the initial.
          initial={{ opacity: 0 }}
          animate={hasEntered ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.2, ease }}
          className="flex items-baseline justify-between gap-4 flex-wrap"
        >
          <SectionLabel label={copy.sectionLabel} />
          <div
            className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.15em] [font-variant-numeric:tabular-nums_slashed-zero]"
            aria-live="polite"
          >
            {isLive && (
              <span className="flex items-center gap-1.5 text-ops-olive">
                <span
                  // Class is constant for SSR consistency; the global
                  // prefers-reduced-motion rule in globals.css is the single
                  // control that disables this pulse.
                  className="inline-block w-1.5 h-1.5 rounded-full bg-ops-olive animate-spec-pulse"
                  aria-hidden="true"
                />
                {copy.liveLabel}
              </span>
            )}
            {!isLive && (
              <span className="text-ops-tan">{copy.staleLabel}</span>
            )}
            <span className="text-ops-text-mute" aria-hidden="true">·</span>
            <span
              // buildUpdatedLabel reads Date.now(), so a minute boundary
              // crossed between SSR and hydration changes the text; suppress
              // and reconcile to the client, same as the timeline date spans.
              suppressHydrationWarning
              className={snapshot.is_stale ? 'text-ops-tan' : 'text-ops-text-tertiary'}
            >
              {copy.updatedPrefix} {updatedLabel}
            </span>
          </div>
        </motion.div>

        {snapshot.is_stale && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={hasEntered ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.2, ease, delay: reduceMotion ? 0 : 0.08 }}
            className="mt-3 font-mono text-[10px] uppercase tracking-[0.12em] text-ops-text-mute"
          >
            {copy.unavailableNote}
          </motion.p>
        )}

        {/* Sub-eyebrow */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={hasEntered ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.2, ease, delay: reduceMotion ? 0 : 0.12 }}
          className="mt-10 font-mono text-[11px] uppercase tracking-[0.18em] text-ops-text-tertiary"
        >
          {copy.subEyebrow}
        </motion.p>

        {/* DESKTOP TABLE — md and up */}
        <div className="hidden md:block mt-6 border-t border-white/[0.08]">
          {/* Column headers */}
          <div className="grid grid-cols-[1.2fr_1fr_0.8fr_1.4fr_1.6fr] gap-4 py-4 border-b border-white/[0.06] font-mono text-[10px] uppercase tracking-[0.18em] text-ops-text-mute [font-variant-numeric:tabular-nums_slashed-zero]">
            <span>{copy.headers.tier}</span>
            <span>{copy.headers.availability}</span>
            <span>{copy.headers.waitlist}</span>
            <span>{copy.headers.nextIntake}</span>
            <span>{copy.headers.yourDelivery}</span>
          </div>

          {/* Tier rows */}
          <div className="flex flex-col">
            {rows.map((row, index) => {
              const isSelected = row.tier === selectedTier;
              const isDimmed = selectedTier !== row.tier && rows.some((r) => r.tier === selectedTier);
              const tone = availabilityToneClass(row.availability, isSelected, isDimmed);
              return (
                <motion.button
                  key={row.tier}
                  type="button"
                  onClick={() => row.isAcceptingBookings && setSelectedTier(row.tier)}
                  initial={{ opacity: 0, y: 8 }}
                  animate={hasEntered ? { opacity: isDimmed && !isSelected ? 0.4 : 1, y: 0 } : { opacity: 0, y: 8 }}
                  transition={
                    reduceMotion
                      ? { opacity: { duration: 0.2, ease }, y: { duration: 0 } }
                      : {
                          opacity: { duration: 0.4, delay: 0.2 + index * 0.08, ease },
                          y: { duration: 0.4, delay: 0.2 + index * 0.08, ease },
                        }
                  }
                  disabled={!row.isAcceptingBookings}
                  aria-pressed={isSelected}
                  aria-label={`${row.label} — ${row.availability}`}
                  className={`
                    relative grid grid-cols-[1.2fr_1fr_0.8fr_1.4fr_1.6fr] gap-4 py-5 border-b border-white/[0.04]
                    text-left transition-colors duration-200 cursor-pointer
                    ${row.isAcceptingBookings ? 'hover:bg-white/[0.02]' : 'cursor-not-allowed'}
                    ${isSelected ? 'bg-white/[0.03]' : ''}
                  `}
                >
                  {/* Selection left rail */}
                  <span
                    aria-hidden="true"
                    className={`absolute left-0 top-1 bottom-1 w-[2px] transition-all duration-200 ${
                      isSelected ? 'bg-white/50 opacity-100' : 'bg-transparent opacity-0'
                    }`}
                  />
                  {/* TIER */}
                  <div className="flex items-center gap-2 pl-3">
                    <span className={`font-mono text-[10px] text-ops-text-mute transition-opacity ${isSelected ? 'opacity-100' : 'opacity-40'}`} aria-hidden="true">
                      ›
                    </span>
                    <span className="font-mono text-[13px] uppercase tracking-[0.15em] text-ops-text-primary [font-variant-numeric:tabular-nums_slashed-zero]">
                      {row.label}
                    </span>
                  </div>
                  {/* AVAILABILITY */}
                  <span className={`flex items-center font-mono text-[11px] uppercase tracking-[0.15em] ${tone} [font-variant-numeric:tabular-nums_slashed-zero]`}>
                    {row.availability === 'OPEN' && copy.status.open}
                    {row.availability === 'LIMITED' && copy.status.limited}
                    {row.availability === 'WAITLIST' && copy.status.waitlist}
                    {row.availability === 'CLOSED' && copy.status.closed}
                  </span>
                  {/* WAITLIST */}
                  <span className="flex items-center font-mono text-[11px] text-ops-text-tertiary [font-variant-numeric:tabular-nums_slashed-zero]">
                    {row.waitlistText}
                  </span>
                  {/* NEXT INTAKE */}
                  <span className="flex items-center font-mono text-[11px] uppercase tracking-[0.12em] text-ops-text-secondary [font-variant-numeric:tabular-nums_slashed-zero]">
                    {row.nextIntakeText}
                  </span>
                  {/* YOUR DELIVERY */}
                  <span className="flex items-center font-mono text-[11px] uppercase tracking-[0.12em] text-ops-text-secondary [font-variant-numeric:tabular-nums_slashed-zero]">
                    {row.deliveryText}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* MOBILE STACK — below md */}
        <div className="md:hidden mt-6 flex flex-col gap-3">
          {rows.map((row, index) => {
            const isSelected = row.tier === selectedTier;
            const tone = availabilityToneClass(row.availability, isSelected, false);
            return (
              <motion.button
                key={row.tier}
                type="button"
                onClick={() => row.isAcceptingBookings && setSelectedTier(row.tier)}
                initial={{ opacity: 0, y: 8 }}
                animate={hasEntered ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
                transition={
                  reduceMotion
                    ? { opacity: { duration: 0.2, ease }, y: { duration: 0 } }
                    : { duration: 0.4, delay: 0.2 + index * 0.08, ease }
                }
                disabled={!row.isAcceptingBookings}
                aria-pressed={isSelected}
                aria-label={`${row.label} — ${row.availability}`}
                className={`
                  relative w-full text-left p-5 rounded-[3px] border transition-colors duration-200
                  ${isSelected
                    ? 'border-white/[0.20] bg-white/[0.03]'
                    : 'border-white/[0.08] hover:border-white/[0.15]'}
                  ${row.isAcceptingBookings ? 'cursor-pointer' : 'cursor-not-allowed opacity-60'}
                `}
              >
                <div className="flex items-baseline justify-between gap-3">
                  <span className="font-mono text-[13px] uppercase tracking-[0.15em] text-ops-text-primary [font-variant-numeric:tabular-nums_slashed-zero]">
                    {row.label}
                  </span>
                  <span className={`font-mono text-[11px] uppercase tracking-[0.15em] ${tone} [font-variant-numeric:tabular-nums_slashed-zero]`}>
                    {row.availability === 'OPEN' && copy.status.open}
                    {row.availability === 'LIMITED' && copy.status.limited}
                    {row.availability === 'WAITLIST' && copy.status.waitlist}
                    {row.availability === 'CLOSED' && copy.status.closed}
                  </span>
                </div>
                <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 font-mono text-[10px] [font-variant-numeric:tabular-nums_slashed-zero]">
                  <dt className="text-ops-text-mute uppercase tracking-[0.15em]">{copy.headers.waitlist}</dt>
                  <dd className="text-ops-text-secondary text-right uppercase tracking-[0.12em]">{row.waitlistText}</dd>
                  <dt className="text-ops-text-mute uppercase tracking-[0.15em]">{copy.headers.nextIntake}</dt>
                  <dd className="text-ops-text-secondary text-right uppercase tracking-[0.12em]">{row.nextIntakeText}</dd>
                  <dt className="text-ops-text-mute uppercase tracking-[0.15em]">{copy.headers.yourDelivery}</dt>
                  <dd className="text-ops-text-secondary text-right uppercase tracking-[0.12em]">{row.deliveryText}</dd>
                </dl>
              </motion.button>
            );
          })}
        </div>

        {/* Timeline strip — bottom of section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={hasEntered ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: reduceMotion ? 0.2 : 0.4, delay: reduceMotion ? 0 : 0.6, ease }}
          className="mt-12"
          aria-label="Engagement timeline"
        >
          <SpecBoardTimeline
            selectedRow={selectedRow}
            copy={copy}
            hasEntered={hasEntered}
            reduceMotion={reduceMotion}
          />
        </motion.div>
      </header>
    </section>
  );
}

interface SpecBoardTimelineProps {
  selectedRow: DisplayRow;
  copy: SpecOpsBoardCopy;
  hasEntered: boolean;
  reduceMotion: boolean;
}

/**
 * Horizontal four-marker timeline. Markers slide on row selection.
 * Pure visual — no interaction. Reads selected row's deliveryText to
 * surface the delivery window beneath the DELIVERY marker.
 */
function SpecBoardTimeline({ selectedRow, copy, hasEntered, reduceMotion }: SpecBoardTimelineProps) {
  const { discovery, build } = TIER_DURATIONS[selectedRow.tier];

  // Real date windows projected forward from today + the selected tier's
  // durations. `new Date()` is read at render; the date spans carry
  // suppressHydrationWarning so an SSR/CSR midnight-boundary difference
  // reconciles to the client's day rather than throwing a hydration mismatch.
  const phases = useMemo(
    () =>
      computeTimelineWindows({
        today: new Date(),
        start: selectedRow.startMonday,
        discovery,
        build,
        labels: copy.timeline,
        unavailable: !selectedRow.isAcceptingBookings,
      }),
    [selectedRow, discovery, build, copy.timeline],
  );

  // Visual x-positions (0..1). Proportions, not a literal time scale —
  // discovery sits near the start, build spans the middle, delivery anchors
  // the right edge.
  const X = [0, 0.22, 0.58, 1] as const;

  return (
    <div className="relative w-full">
      {/* Ticked measurement substrate — minor ticks hanging below the rail,
          faded at both ends. Reads as an aerospace tape, not a stepper. */}
      <div
        aria-hidden="true"
        className="absolute left-0 right-0 top-2 h-2"
        style={{
          backgroundImage:
            'linear-gradient(90deg, rgba(255,255,255,0.12) 0 1px, transparent 1px)',
          backgroundRepeat: 'repeat-x',
          backgroundSize: '11px 8px',
          backgroundPosition: '0 top',
          maskImage: 'linear-gradient(90deg, transparent, #000 5%, #000 95%, transparent)',
          WebkitMaskImage: 'linear-gradient(90deg, transparent, #000 5%, #000 95%, transparent)',
        }}
      />
      {/* Base rail hairline */}
      <div aria-hidden="true" className="absolute left-0 right-0 top-2 h-px bg-white/[0.12]" />
      {/* Rail draw-in — the one entrance. The rail builds itself left→right. */}
      <motion.div
        aria-hidden="true"
        initial={{ scaleX: 0 }}
        animate={hasEntered ? { scaleX: 1 } : { scaleX: 0 }}
        transition={{ duration: reduceMotion ? 0 : 0.8, delay: reduceMotion ? 0 : 0.6, ease }}
        style={{ transformOrigin: 'left' }}
        className="absolute left-0 right-0 top-2 h-px bg-white/[0.22]"
      />
      {/* "Next: discovery" accent segment — TODAY → DISCOVERY, the imminent step. */}
      <motion.div
        aria-hidden="true"
        initial={{ scaleX: 0 }}
        animate={hasEntered ? { scaleX: 1 } : { scaleX: 0 }}
        transition={{ duration: reduceMotion ? 0 : 0.5, delay: reduceMotion ? 0 : 1.05, ease }}
        style={{ transformOrigin: 'left', width: `${X[1] * 100}%` }}
        className="absolute left-0 top-2 h-px bg-ops-accent"
      />

      {/* Nodes + monospaced date windows */}
      <ul className="relative h-[92px]" role="list">
        {phases.map((phase, i) => {
          const isToday = phase.key === 'today';
          const isLast = i === phases.length - 1;
          const colAlign = isToday
            ? 'items-start text-left'
            : isLast
              ? 'items-end text-right'
              : 'items-center text-center';
          const shift = isToday ? 'translate-x-0' : isLast ? '-translate-x-full' : '-translate-x-1/2';
          return (
            <li
              key={phase.key}
              className={`absolute top-0 flex flex-col ${colAlign} ${shift}`}
              style={{ left: `${X[i] * 100}%` }}
            >
              {/* Node box (16px) centered on the rail at top-2 (8px). */}
              <span className="relative flex h-4 w-4 items-center justify-center" aria-hidden="true">
                {isToday && !reduceMotion && (
                  // Single pulsing halo — the page's ONLY infinite animation.
                  // The first render always includes it on both server and
                  // client (reduceMotion is false at mount), so hydration
                  // matches; for reduced-motion users it unmounts one commit
                  // after mount. This JS-driven infinite loop is the one case
                  // the global reduced-motion CSS rule can't reach, so the
                  // branch has to stay.
                  <motion.span
                    className="absolute h-2.5 w-2.5 rounded-[2px] ring-1 ring-ops-accent"
                    animate={{ scale: [1, 1.8], opacity: [0.5, 0] }}
                    transition={{ duration: 2.0, repeat: Infinity, ease }}
                  />
                )}
                <motion.span
                  initial={{ scale: 0.4, opacity: 0 }}
                  animate={hasEntered ? { scale: 1, opacity: 1 } : { scale: 0.4, opacity: 0 }}
                  transition={{ duration: reduceMotion ? 0 : 0.35, delay: reduceMotion ? 0 : 0.95 + i * 0.1, ease }}
                  className={
                    isToday
                      ? 'block h-2.5 w-2.5 rounded-[2px] bg-ops-accent'
                      : 'block h-2.5 w-2.5 rounded-[2px] border border-white/30 bg-ops-background'
                  }
                />
              </span>
              {/* Phase label */}
              <span className="mt-3 font-mono text-[10px] uppercase tracking-[0.16em] text-ops-text-tertiary [font-variant-numeric:tabular-nums_slashed-zero] whitespace-nowrap">
                {phase.label}
              </span>
              {/* Date window — real, projected forward from today */}
              <span
                suppressHydrationWarning
                className={`mt-1.5 font-mono text-[11px] [font-variant-numeric:tabular-nums_slashed-zero] whitespace-nowrap ${
                  isToday ? 'text-ops-text-secondary' : 'text-ops-text-mute'
                }`}
              >
                {phase.range}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
