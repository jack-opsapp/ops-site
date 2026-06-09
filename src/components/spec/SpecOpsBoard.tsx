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
 *   • Reduced-motion: instant final state, single 200ms fade, no pulse.
 *
 * Edge cases:
 *   • Tier WAITLIST → row in amber + "Join waitlist" CTA
 *   • Tier closed (is_accepting_bookings = false) → "CLOSED — RESUMES [public_note]"
 *   • Snapshot unavailable / is_stale → static fallback from dictionary,
 *     "LIVE" indicator hidden, timestamp shifts to amber
 *   • refreshed_at > 72h → amber timestamp + "UPDATED [N] DAYS AGO"
 *   • All-tiers-OPEN → hides any future "WAITLIST" UI
 *
 * Mobile (< 768px): tier rows stack as cards. Timeline strip stays at bottom.
 */

import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { theme } from '@/lib/theme';
import { SectionLabel } from '@/components/ui';
import type {
  SpecBoardSnapshot,
  SpecBoardTier,
  SpecBoardTierRow,
} from '@/lib/spec/board';
import { SPEC_BOARD_TIERS } from '@/lib/spec/board';

const ease = theme.animation.easing as [number, number, number, number];

/**
 * Per-tier duration window (days). Mirrors `public.spec_capacity` seed
 * in 02_DATA_MODEL.md. Used to compute the delivery date strip when a
 * row is selected. Defensive defaults — if the snapshot lacks
 * `next_start_week`, the helper falls back to a relative window.
 */
const TIER_DURATIONS: Record<SpecBoardTier, {
  discovery: [number, number];
  build: [number, number];
}> = {
  setup: { discovery: [3, 5], build: [7, 14] },
  build: { discovery: [5, 7], build: [14, 21] },
  enterprise: { discovery: [7, 14], build: [28, 42] },
};

/** Section copy keys — pulled from spec.json so en/es swap cleanly. */
export interface SpecOpsBoardCopy {
  sectionLabel: string;
  subEyebrow: string;
  liveLabel: string;
  staleLabel: string;
  updatedPrefix: string;
  updatedJustNow: string;
  updatedMinAgo: string;
  updatedHrAgo: string;
  updatedDaysAgo: string;
  unavailableNote: string;
  headers: {
    tier: string;
    availability: string;
    waitlist: string;
    nextIntake: string;
    yourDelivery: string;
  };
  timeline: {
    today: string;
    discovery: string;
    build: string;
    delivery: string;
  };
  status: {
    open: string;
    limited: string;
    waitlist: string;
    closed: string;
  };
  waitlist: {
    zero: string;
    range: string;
    many: string;
  };
  closedPrefix: string;
  nextStartPrefix: string;
  deliveryPrefix: string;
  deliveryUnknown: string;
  fallback: Record<
    SpecBoardTier,
    { nextIntake: string; delivery: string }
  >;
  /** Per-tier display label (SETUP / BUILD / ENTERPRISE). */
  tierLabels: Record<SpecBoardTier, string>;
}

interface SpecOpsBoardProps {
  /** Server-rendered snapshot. May be empty + stale on Supabase outage. */
  initialSnapshot: SpecBoardSnapshot;
  copy: SpecOpsBoardCopy;
}

interface DisplayRow {
  tier: SpecBoardTier;
  label: string;
  availability: 'OPEN' | 'LIMITED' | 'WAITLIST' | 'CLOSED';
  waitlistText: string;
  nextIntakeText: string;
  deliveryText: string;
  isAcceptingBookings: boolean;
  publicNote: string | null;
}

/** Static fallback rows used when the snapshot is unavailable. */
function buildFallbackRows(copy: SpecOpsBoardCopy): DisplayRow[] {
  return SPEC_BOARD_TIERS.map((tier) => ({
    tier,
    label: copy.tierLabels[tier],
    availability: 'OPEN' as const,
    waitlistText: copy.waitlist.zero,
    nextIntakeText: copy.fallback[tier].nextIntake,
    deliveryText: copy.fallback[tier].delivery,
    isAcceptingBookings: true,
    publicNote: null,
  }));
}

/** Parse ISO year-week like "2026-23" into the Monday of that week. */
function parseIsoYearWeek(yearWeek: string): Date | null {
  const match = /^(\d{4})-?W?-?(\d{1,2})$/.exec(yearWeek);
  if (!match) return null;
  const year = Number(match[1]);
  const week = Number(match[2]);
  if (!Number.isFinite(year) || !Number.isFinite(week) || week < 1 || week > 53) return null;
  // ISO 8601: week 1 is the week containing the first Thursday.
  // Jan 4 always falls in week 1, so we work from there.
  const jan4 = new Date(Date.UTC(year, 0, 4));
  const jan4Day = jan4.getUTCDay() || 7; // 1..7 (Mon..Sun)
  const week1Monday = new Date(jan4);
  week1Monday.setUTCDate(jan4.getUTCDate() - (jan4Day - 1));
  const target = new Date(week1Monday);
  target.setUTCDate(week1Monday.getUTCDate() + (week - 1) * 7);
  return target;
}

const SHORT_MONTH = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

function formatShortDate(d: Date): string {
  return `${SHORT_MONTH[d.getUTCMonth()]} ${String(d.getUTCDate()).padStart(2, '0')}`;
}

function buildLiveRows(
  snapshot: SpecBoardSnapshot,
  copy: SpecOpsBoardCopy,
): DisplayRow[] {
  // Index snapshot rows by tier for fast lookup. Tiers missing from the
  // snapshot fall back to OPEN / dictionary defaults.
  const byTier = new Map<SpecBoardTier, SpecBoardTierRow>();
  for (const row of snapshot.tiers) byTier.set(row.tier, row);

  return SPEC_BOARD_TIERS.map((tier) => {
    const row = byTier.get(tier);
    const fallbackText = copy.fallback[tier];
    if (!row) {
      return {
        tier,
        label: copy.tierLabels[tier],
        availability: 'OPEN' as const,
        waitlistText: copy.waitlist.zero,
        nextIntakeText: fallbackText.nextIntake,
        deliveryText: fallbackText.delivery,
        isAcceptingBookings: true,
        publicNote: null,
      };
    }

    const isClosed = !row.is_accepting_bookings;
    const availability = isClosed ? 'CLOSED' : row.availability;

    const waitlistText =
      row.waitlist_bucket === '0'
        ? copy.waitlist.zero
        : row.waitlist_bucket === '1-2'
          ? copy.waitlist.range
          : copy.waitlist.many;

    let nextIntakeText = fallbackText.nextIntake;
    let deliveryText = fallbackText.delivery;
    if (!isClosed && row.next_start_week) {
      const startMonday = parseIsoYearWeek(row.next_start_week);
      if (startMonday) {
        nextIntakeText = `${copy.nextStartPrefix} ${formatShortDate(startMonday)}`;
        const { discovery, build } = TIER_DURATIONS[tier];
        const deliveryMin = new Date(startMonday);
        deliveryMin.setUTCDate(startMonday.getUTCDate() + discovery[0] + build[0]);
        const deliveryMax = new Date(startMonday);
        deliveryMax.setUTCDate(startMonday.getUTCDate() + discovery[1] + build[1]);
        deliveryText = `${formatShortDate(deliveryMin)} — ${formatShortDate(deliveryMax)}`;
      }
    } else if (isClosed) {
      nextIntakeText = row.public_note
        ? `${copy.closedPrefix} ${row.public_note.toUpperCase()}`
        : copy.closedPrefix;
      deliveryText = copy.deliveryUnknown;
    }

    return {
      tier,
      label: copy.tierLabels[tier],
      availability,
      waitlistText,
      nextIntakeText,
      deliveryText,
      isAcceptingBookings: !isClosed,
      publicNote: row.public_note,
    };
  });
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
  // The status text gets the earth-tone semantic colour. Olive for OPEN,
  // tan for LIMITED, amber/tan for WAITLIST, rose for CLOSED.
  // Dimming overrides for unselected rows once a row is active.
  if (isDimmed && !isSelected) return 'text-ops-text-mute';
  switch (availability) {
    case 'OPEN':
      return 'text-ops-olive';
    case 'LIMITED':
      return 'text-ops-tan';
    case 'WAITLIST':
      return 'text-ops-tan';
    case 'CLOSED':
      return 'text-ops-rose';
  }
}

export default function SpecOpsBoard({ initialSnapshot, copy }: SpecOpsBoardProps) {
  const reduceMotion = useReducedMotion() ?? false;
  const sectionRef = useRef<HTMLElement>(null);
  // Reduced-motion users always render in the final state immediately;
  // everyone else waits for the IntersectionObserver to flip
  // `hasObserved` to true once 30% of the section is in view.
  const [hasObserved, setHasObserved] = useState(false);
  const hasEntered = reduceMotion || hasObserved;

  // Snapshot state. Initial value is the server-rendered snapshot — we
  // do not refetch on mount (server data is fresh enough; the 5-min
  // pg_cron + edge cache keeps it current within tolerance). Future
  // work can poll /api/spec/board if Phase 2 wants sub-5min freshness.
  const snapshot = initialSnapshot;

  const rows = useMemo<DisplayRow[]>(() => {
    if (snapshot.is_stale || snapshot.tiers.length === 0) {
      return buildFallbackRows(copy);
    }
    return buildLiveRows(snapshot, copy);
  }, [snapshot, copy]);

  // Default selected row: BUILD (per spec § 3) unless not present.
  const [selectedTier, setSelectedTier] = useState<SpecBoardTier>(() => {
    const buildRow = rows.find((r) => r.tier === 'build' && r.isAcceptingBookings);
    if (buildRow) return 'build';
    const firstOpen = rows.find((r) => r.isAcceptingBookings);
    return firstOpen?.tier ?? 'setup';
  });

  const isLive = !snapshot.is_stale && snapshot.refreshed_at !== null;
  const updatedLabel = buildUpdatedLabel(snapshot.refreshed_at, copy);

  // Hide WAITLIST row if all tiers are OPEN (per spec).
  // (Practically the row is rendered per tier; this hook is a no-op for
  // table layout — left here as a placeholder for any future "Join
  // waitlist" badge row that might be appended separately.)

  useEffect(() => {
    // Reduced-motion path bypasses the observer entirely — hasEntered
    // is already derived from `reduceMotion` above. Skipping the effect
    // body avoids setState-in-effect.
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
          initial={reduceMotion ? false : { opacity: 0 }}
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
                  className={`inline-block w-1.5 h-1.5 rounded-full bg-ops-olive ${reduceMotion ? '' : 'animate-spec-pulse'}`}
                  aria-hidden="true"
                />
                {copy.liveLabel}
              </span>
            )}
            {!isLive && (
              <span className="text-ops-tan">{copy.staleLabel}</span>
            )}
            <span className="text-ops-text-mute" aria-hidden="true">·</span>
            <span className={snapshot.is_stale ? 'text-ops-tan' : 'text-ops-text-tertiary'}>
              {copy.updatedPrefix} {updatedLabel}
            </span>
          </div>
        </motion.div>

        {snapshot.is_stale && (
          <motion.p
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={hasEntered ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.2, ease, delay: 0.08 }}
            className="mt-3 font-mono text-[10px] uppercase tracking-[0.12em] text-ops-text-mute"
          >
            {copy.unavailableNote}
          </motion.p>
        )}

        {/* Sub-eyebrow */}
        <motion.p
          initial={reduceMotion ? false : { opacity: 0 }}
          animate={hasEntered ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.2, ease, delay: 0.12 }}
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
                  initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                  animate={hasEntered ? { opacity: isDimmed && !isSelected ? 0.4 : 1, y: 0 } : { opacity: 0, y: 8 }}
                  transition={{
                    opacity: { duration: 0.4, delay: 0.2 + index * 0.08, ease },
                    y: { duration: 0.4, delay: 0.2 + index * 0.08, ease },
                  }}
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
                initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                animate={hasEntered ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
                transition={{ duration: 0.4, delay: 0.2 + index * 0.08, ease }}
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
          initial={reduceMotion ? false : { opacity: 0 }}
          animate={hasEntered ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.4, delay: 0.6, ease }}
          className="mt-12"
          aria-label="Engagement timeline"
        >
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ops-text-mute mb-4">
            {copy.timeline.today} / {copy.timeline.discovery} / {copy.timeline.build} / {copy.timeline.delivery}
          </p>
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
  // Fixed marker positions along the timeline (0..1).
  // TODAY=0, DISCOVERY=0.18, BUILD=0.5, DELIVERY=0.92.
  // These are visual proportions, not literal time scales — the actual
  // dates come from copy + the selected row.
  const markers = [
    { key: 'today', x: 0, label: copy.timeline.today, sub: null as string | null },
    { key: 'discovery', x: 0.18, label: copy.timeline.discovery, sub: selectedRow.nextIntakeText },
    { key: 'build', x: 0.5, label: copy.timeline.build, sub: null },
    { key: 'delivery', x: 0.92, label: copy.timeline.delivery, sub: selectedRow.deliveryText },
  ] as const;

  return (
    <div className="relative w-full">
      {/* Track — a horizontal hairline */}
      <motion.div
        initial={reduceMotion ? false : { scaleX: 0, transformOrigin: 'left' }}
        animate={hasEntered ? { scaleX: 1 } : { scaleX: 0 }}
        transition={{ duration: 0.6, delay: 0.7, ease }}
        className="absolute left-0 right-0 top-3 h-px bg-white/[0.12]"
        aria-hidden="true"
      />
      {/* Markers */}
      <ul className="relative grid grid-cols-1 gap-0 h-24" role="list">
        {markers.map((marker, index) => (
          <li
            key={marker.key}
            className="absolute top-0 -translate-x-1/2 flex flex-col items-center text-center"
            style={{ left: `${marker.x * 100}%` }}
          >
            <motion.span
              initial={reduceMotion ? false : { opacity: 0, scale: 0.4 }}
              animate={hasEntered ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.4 }}
              transition={{ duration: 0.35, delay: 0.9 + index * 0.08, ease }}
              className={`block w-2.5 h-2.5 rounded-full ${
                marker.key === 'today' ? 'bg-ops-accent' : 'bg-white/40'
              }`}
              aria-hidden="true"
            />
            <span className="mt-3 font-mono text-[10px] uppercase tracking-[0.15em] text-ops-text-tertiary [font-variant-numeric:tabular-nums_slashed-zero] whitespace-nowrap">
              {marker.label}
            </span>
            {marker.sub && (
              <motion.span
                key={`${marker.key}-${marker.sub}`}
                initial={reduceMotion ? false : { opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, ease }}
                className="mt-1 font-mono text-[10px] text-ops-text-mute [font-variant-numeric:tabular-nums_slashed-zero] whitespace-nowrap max-w-[160px] truncate"
              >
                {marker.sub}
              </motion.span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
