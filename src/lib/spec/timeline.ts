/**
 * SPEC timeline date engine.
 *
 * Computes the four engagement-phase date windows (Today → Discovery →
 * Build → Delivery) shown on the OPS BOARD timeline, projected forward
 * from a real start date so the schedule reads as a committed calendar
 * ("DISCOVERY · JUN 15 — JUN 20") instead of vague marketing copy
 * ("NEXT OPEN SLOT" / "1-2 WEEKS").
 *
 * Pure + deterministic: the caller passes `today` in — the engine never
 * reads the clock itself — so it is trivially testable and stays
 * SSR/CSR-consistent when the caller normalizes `today`. All arithmetic is
 * UTC-calendar to match the `next_start_week` Mondays parsed in UTC by
 * `lib/spec/board` consumers.
 *
 * Window semantics (max-bound, so labels read as a confident outer edge):
 *   - today:     the current calendar date (single date)
 *   - discovery: [start .. start + discovery.max]
 *   - build:     [discoveryEnd + 1 .. discoveryEnd + 1 + build.max]
 *   - delivery:  [start + discovery.min + build.min .. start + discovery.max + build.max]
 *     (matches the existing delivery math in SpecOpsBoard.buildLiveRows)
 */

export type TimelinePhaseKey = 'today' | 'discovery' | 'build' | 'delivery';
export const TIMELINE_PHASE_KEYS: readonly TimelinePhaseKey[] = [
  'today',
  'discovery',
  'build',
  'delivery',
] as const;

export interface TimelinePhase {
  key: TimelinePhaseKey;
  label: string;
  /** Formatted window — "JUN 09" or "JUN 12 — JUN 17", or the unknown glyph. */
  range: string;
}

export interface ComputeTimelineParams {
  /** Reference "now" — pass `new Date()`; the engine normalizes to UTC day. */
  today: Date;
  /** Next-open-slot Monday from the snapshot. Null → engine projects the next Monday. */
  start: Date | null;
  /** [min, max] discovery duration in days for the selected tier. */
  discovery: [number, number];
  /** [min, max] build duration in days for the selected tier. */
  build: [number, number];
  /** Phase labels (localized) — `copy.timeline`. */
  labels: Record<TimelinePhaseKey, string>;
  /** Tier closed / no projectable schedule → future windows render as `unknownLabel`. */
  unavailable?: boolean;
  /** Glyph shown for an unknown window. Defaults to the OPS empty-state em-dash. */
  unknownLabel?: string;
}

const SHORT_MONTH = [
  'JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN',
  'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC',
] as const;

/** Normalize any Date to UTC calendar midnight (drops time-of-day + TZ drift). */
export function toUtcDay(d: Date): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

function addDays(d: Date, n: number): Date {
  const r = new Date(d);
  r.setUTCDate(d.getUTCDate() + n);
  return r;
}

/** "JUN 09" — uppercase short month + zero-padded day. */
export function formatTimelineDate(d: Date): string {
  return `${SHORT_MONTH[d.getUTCMonth()]} ${String(d.getUTCDate()).padStart(2, '0')}`;
}

function windowLabel(a: Date, b: Date): string {
  return `${formatTimelineDate(a)} — ${formatTimelineDate(b)}`;
}

/** The next Monday strictly after `from` (a week out when `from` is itself a Monday). */
export function upcomingMonday(from: Date): Date {
  const day = from.getUTCDay(); // 0=Sun .. 6=Sat
  const delta = ((8 - day) % 7) || 7;
  return addDays(from, delta);
}

export function computeTimelineWindows(params: ComputeTimelineParams): TimelinePhase[] {
  const { discovery, build, labels } = params;
  const today = toUtcDay(params.today);
  const unknown = params.unknownLabel ?? '—';

  if (params.unavailable) {
    return TIMELINE_PHASE_KEYS.map((key) => ({
      key,
      label: labels[key],
      range: key === 'today' ? formatTimelineDate(today) : unknown,
    }));
  }

  const start = toUtcDay(params.start ?? upcomingMonday(today));
  const discoveryEnd = addDays(start, discovery[1]);
  const buildStart = addDays(discoveryEnd, 1);
  const buildEnd = addDays(buildStart, build[1]);
  const deliveryMin = addDays(start, discovery[0] + build[0]);
  const deliveryMax = addDays(start, discovery[1] + build[1]);

  return [
    { key: 'today', label: labels.today, range: formatTimelineDate(today) },
    { key: 'discovery', label: labels.discovery, range: windowLabel(start, discoveryEnd) },
    { key: 'build', label: labels.build, range: windowLabel(buildStart, buildEnd) },
    { key: 'delivery', label: labels.delivery, range: windowLabel(deliveryMin, deliveryMax) },
  ];
}
