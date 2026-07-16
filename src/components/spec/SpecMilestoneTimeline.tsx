'use client';

/**
 * SpecMilestoneTimeline — per-tier checkpoint visualization for
 * /spec/confirmation.
 *
 * Renders a horizontal steel-blue rail with one marker per checkpoint in the
 * tier's journey (Tier Model v2 shapes — spec01 runs 3 stops, spec02/03 run
 * 4; see lib/spec/confirmation-schedule.ts). Each stop shows an ordinal +
 * status line, label, amount, and detail. Completed payment stops read PAID;
 * spec01's evidence-only scope stop reads SIGNED. Animation follows the
 * bible's OPS BOARD choreography (per animation-architect +
 * data-visualization skills): rail strokes left-to-right, markers pop
 * sequentially. Single easing curve, no spring, reduced-motion-aware.
 *
 * Reduced-motion / hydration contract (matches SpecConfirmation): SSR and the
 * client's first render always emit the motion-initial markup via the
 * SSR-safe ./useReducedMotion hooks, and every entrance holds until the
 * preference is `resolved` one commit after mount so it is scheduled with the
 * correct variant. Reduced motion: rail + marker transforms snap (duration 0),
 * markers share a single 200ms opacity fade, and the CURRENT dot's pulse — a
 * JS-driven infinite loop the global reduced-motion CSS rule can't reach — is
 * swapped for a static twin one commit after mount (the SpecOpsBoard halo
 * pattern). The first render always includes the pulsing variant on both
 * sides, so hydration matches byte-for-byte.
 *
 * Bible: 04_CUSTOMER_UX.md § /spec/confirmation, § OPS BOARD animation
 *        choreography (the same pattern applied to a linear checkpoint rail).
 */

import { motion } from 'framer-motion';
import { useResolvedReducedMotion } from './useReducedMotion';
import { theme } from '@/lib/theme';
import {
  stopStatusLabel,
  type ScheduleStop,
} from '@/lib/spec/confirmation-schedule';

const ease = theme.animation.easing as [number, number, number, number];

interface Props {
  milestones: ScheduleStop[];
  /**
   * Per-tier delivery-window line rendered under the rail
   * (dictionary `confirmation.timeline.<tier>`). Null hides it.
   */
  deliveryNote?: string | null;
}

export function SpecMilestoneTimeline({ milestones, deliveryNote }: Props) {
  const { reduceMotion, resolved } = useResolvedReducedMotion();

  // Rail fill runs through every completed stop and touches the CURRENT
  // marker (markers sit at column starts, ≈ i/n across the rail). Derived
  // from the LAST active stop — the first-match variant would pin the fill
  // to the always-complete deposit forever.
  let activeIndex = 0;
  milestones.forEach((m, i) => {
    if (m.status !== 'upcoming') activeIndex = i;
  });
  const fillFraction =
    milestones.length === 0 ? 0 : activeIndex / milestones.length;

  return (
    <section
      aria-labelledby="spec-milestones-heading"
      className="mt-10 px-1"
    >
      <h2
        id="spec-milestones-heading"
        className="font-mono text-[10px] uppercase tracking-[0.2em] text-ops-text-mute mb-5"
      >
        {"// CHECKPOINTS"}
      </h2>

      <div className="relative">
        {/* Base rail — hairline */}
        <div
          aria-hidden
          className="absolute left-0 right-0 top-[10px] h-px"
          style={{ background: 'var(--color-ops-border)' }}
        />

        {/* Active rail — strokes left-to-right once the preference resolves;
            under reduced motion it snaps to the fill instantly. */}
        <motion.div
          aria-hidden
          className="absolute left-0 top-[10px] h-px bg-ops-accent"
          initial={{ width: 0 }}
          animate={resolved ? { width: `${fillFraction * 100}%` } : { width: 0 }}
          transition={
            reduceMotion ? { duration: 0 } : { duration: 0.9, delay: 0.2, ease }
          }
        />

        <ol
          className={`relative grid gap-3 ${
            milestones.length === 3 ? 'grid-cols-3' : 'grid-cols-4'
          }`}
        >
          {milestones.map((m, i) => (
            <MilestoneNode
              key={m.key}
              milestone={m}
              index={i}
              reduceMotion={reduceMotion}
              resolved={resolved}
              total={milestones.length}
            />
          ))}
        </ol>
      </div>

      {deliveryNote && (
        <p className="mt-6 font-mohave font-light text-[12px] leading-relaxed text-ops-text-secondary">
          {deliveryNote}
        </p>
      )}
    </section>
  );
}

function MilestoneNode({
  milestone,
  index,
  reduceMotion,
  resolved,
  total,
}: {
  milestone: ScheduleStop;
  index: number;
  reduceMotion: boolean;
  resolved: boolean;
  total: number;
}) {
  const isActive =
    milestone.status === 'complete' || milestone.status === 'current';

  // Each marker pops in sequence after the stroke finishes (matches bible
  // OPS BOARD choreography). Only times the full-motion variant — the reduced
  // transition below drops the delay and snaps the scale.
  const popDelay = 0.2 + 0.9 * (index / Math.max(total - 1, 1));

  return (
    <li className="relative flex flex-col items-start">
      <motion.div
        aria-hidden
        initial={{ scale: 0, opacity: 0 }}
        animate={resolved ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
        transition={
          reduceMotion
            ? { opacity: { duration: 0.2, ease }, scale: { duration: 0 } }
            : { duration: 0.3, delay: popDelay, ease }
        }
        className="relative w-[18px] h-[18px] flex items-center justify-center"
        style={{
          background: 'var(--color-ops-background)',
          border: `1.5px solid ${
            isActive ? 'var(--color-ops-accent, #6F94B0)' : 'rgba(255,255,255,0.18)'
          }`,
          borderRadius: '2px',
          marginLeft: '-2px',
        }}
      >
        {milestone.status === 'complete' && (
          <span
            className="block w-[6px] h-[6px] bg-ops-accent"
            style={{ borderRadius: '1px' }}
          />
        )}
        {milestone.status === 'current' &&
          (reduceMotion ? (
            // Static twin of the pulsing dot, swapped in one commit after
            // mount for reduced-motion visitors (reduceMotion is false on the
            // first render by the hook's contract, so hydration always sees
            // the pulsing variant below). Unmount-and-replace keeps every
            // prop shape constant — no animate/transition key ever changes
            // meaning on a live element.
            <span
              className="block w-[6px] h-[6px] bg-ops-accent"
              style={{ borderRadius: '1px' }}
            />
          ) : (
            // Pulsing fill — the page's only infinite animation. JS-driven,
            // so the global reduced-motion CSS rule can't neutralize it; the
            // branch above retires it post-mount instead.
            <motion.span
              className="block w-[6px] h-[6px] bg-ops-accent"
              style={{ borderRadius: '1px' }}
              animate={{ opacity: [1, 0.55, 1] }}
              transition={{ duration: 2.2, repeat: Infinity, ease: 'linear' }}
            />
          ))}
      </motion.div>

      <div className="mt-3 flex flex-col gap-1">
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-ops-text-mute">
          {milestone.ordinalLabel} :: {stopStatusLabel(milestone)}
        </span>
        <span
          className={`font-cakemono font-light text-[14px] uppercase tracking-[0.06em] ${
            isActive ? 'text-ops-text-primary' : 'text-ops-text-secondary'
          }`}
        >
          {milestone.label}
        </span>
        {milestone.amountLabel && (
          <span className="font-mono text-[12px] tabular-nums text-ops-text-secondary">
            {milestone.amountLabel}
          </span>
        )}
        <span className="font-mohave font-light text-[11px] leading-snug text-ops-text-mute">
          {milestone.detail}
        </span>
      </div>
    </li>
  );
}

export default SpecMilestoneTimeline;
