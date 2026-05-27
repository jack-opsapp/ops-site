'use client';

/**
 * SpecMilestoneTimeline — 4-milestone visualization for /spec/confirmation.
 *
 * Renders a horizontal steel-blue rail with 4 markers (P1 Deposit → P2 Scope
 * → P3 Midpoint → P4 Delivery). Each milestone shows label, amount, and a
 * status chip ("paid" / "current" / "next" / "upcoming"). Animation follows
 * the bible's OPS BOARD choreography (per animation-architect +
 * data-visualization skills): rail strokes left-to-right, markers pop
 * sequentially. Single easing curve, no spring, reduced-motion-aware.
 *
 * Bible: 04_CUSTOMER_UX.md § /spec/confirmation, § OPS BOARD animation
 *        choreography (the same pattern applied to a 4-stop linear timeline).
 */

import { motion, useReducedMotion } from 'framer-motion';
import { theme } from '@/lib/theme';

const ease = theme.animation.easing as [number, number, number, number];

export type MilestoneStatus = 'paid' | 'current' | 'next' | 'upcoming';

export interface Milestone {
  key: 'p1' | 'p2' | 'p3' | 'p4';
  label: string;
  detail: string;
  amountLabel: string | null;
  status: MilestoneStatus;
}

interface Props {
  milestones: Milestone[];
}

const STATUS_LABEL: Record<MilestoneStatus, string> = {
  paid: 'PAID',
  current: 'CURRENT',
  next: 'NEXT',
  upcoming: 'UPCOMING',
};

export function SpecMilestoneTimeline({ milestones }: Props) {
  const prefersReducedMotion = useReducedMotion() ?? false;

  // Index of the milestone currently active. Drives rail fill width.
  const currentIndex = Math.max(
    0,
    milestones.findIndex((m) => m.status === 'current' || m.status === 'paid')
  );
  const fillFraction =
    milestones.length === 0
      ? 0
      : Math.min(1, (currentIndex + 1) / milestones.length - 0.5 / milestones.length);

  return (
    <section
      aria-labelledby="spec-milestones-heading"
      className="mt-10 px-1"
    >
      <h2
        id="spec-milestones-heading"
        className="font-mono text-[10px] uppercase tracking-[0.2em] text-ops-text-mute mb-5"
      >
        {"// MILESTONES"}
      </h2>

      <div className="relative">
        {/* Base rail — hairline */}
        <div
          aria-hidden
          className="absolute left-0 right-0 top-[10px] h-px"
          style={{ background: 'rgba(255, 255, 255, 0.10)' }}
        />

        {/* Active rail — strokes left-to-right on mount */}
        <motion.div
          aria-hidden
          className="absolute left-0 top-[10px] h-px bg-ops-accent"
          initial={{ width: 0 }}
          animate={{ width: `${fillFraction * 100}%` }}
          transition={{
            duration: prefersReducedMotion ? 0 : 0.9,
            delay: prefersReducedMotion ? 0 : 0.2,
            ease,
          }}
        />

        <ol className="relative grid grid-cols-4 gap-3">
          {milestones.map((m, i) => (
            <MilestoneNode
              key={m.key}
              milestone={m}
              index={i}
              prefersReducedMotion={prefersReducedMotion}
              total={milestones.length}
            />
          ))}
        </ol>
      </div>
    </section>
  );
}

function MilestoneNode({
  milestone,
  index,
  prefersReducedMotion,
  total,
}: {
  milestone: Milestone;
  index: number;
  prefersReducedMotion: boolean;
  total: number;
}) {
  const isActive =
    milestone.status === 'paid' || milestone.status === 'current';

  // Each marker pops in sequence after the stroke finishes (matches bible
  // OPS BOARD choreography). Reduced-motion: instant final state.
  const popDelay = prefersReducedMotion
    ? 0
    : 0.2 + (0.9 * (index / Math.max(total - 1, 1)));

  return (
    <li className="relative flex flex-col items-start">
      <motion.div
        aria-hidden
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{
          duration: prefersReducedMotion ? 0 : 0.3,
          delay: popDelay,
          ease,
        }}
        className="relative w-[18px] h-[18px] flex items-center justify-center"
        style={{
          background: '#000',
          border: `1.5px solid ${
            isActive ? 'var(--color-ops-accent, #6F94B0)' : 'rgba(255,255,255,0.18)'
          }`,
          borderRadius: '2px',
          marginLeft: '-2px',
        }}
      >
        {milestone.status === 'paid' && (
          <span
            className="block w-[6px] h-[6px] bg-ops-accent"
            style={{ borderRadius: '1px' }}
          />
        )}
        {milestone.status === 'current' && (
          <motion.span
            className="block w-[6px] h-[6px] bg-ops-accent"
            style={{ borderRadius: '1px' }}
            animate={
              prefersReducedMotion
                ? undefined
                : { opacity: [1, 0.55, 1] }
            }
            transition={
              prefersReducedMotion
                ? undefined
                : { duration: 2.2, repeat: Infinity, ease: 'linear' }
            }
          />
        )}
      </motion.div>

      <div className="mt-3 flex flex-col gap-1">
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-ops-text-mute">
          {milestone.key.toUpperCase()} :: {STATUS_LABEL[milestone.status]}
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
