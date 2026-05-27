'use client';

/**
 * SpecConfirmation — /spec/confirmation rendering surface (post-Stripe success).
 *
 * Server-rendered shell (in `app/spec/confirmation/page.tsx`) fetches the
 * Stripe Checkout Session + (optional) spec_projects row and hands them to
 * this client component for the animated UI. Three render modes:
 *
 *   1. `sessionIdProvided=false` — landed without a session_id. Soft state.
 *   2. `session.isPaid=false` — payment still processing (race with the
 *      Stripe webhook). Friendly "refresh in a few seconds" state.
 *   3. `session.isPaid=true` — full confirmation: tier + amount, founder
 *      welcome block, 4-milestone timeline, intake CTA, discovery CTA,
 *      30-day Guarantee reminder, Stripe receipt link.
 *
 * Animation choreography mirrors the bible OPS BOARD pattern (per
 * animation-architect + data-visualization skills): subtle entrance fades,
 * timeline strokes left-to-right, markers pop sequentially, no spring,
 * single easing curve, reduced-motion-aware.
 *
 * Bible: 04_CUSTOMER_UX.md § /spec/confirmation, 07_ROLLOUT.md § 8.
 */

import { motion, useReducedMotion } from 'framer-motion';
import Link from 'next/link';
import { theme } from '@/lib/theme';
import type { Dictionary } from '@/i18n/types';
import {
  SpecMilestoneTimeline,
  type Milestone,
  type MilestoneStatus,
} from './SpecMilestoneTimeline';

const ease = theme.animation.easing as [number, number, number, number];

const TIER_TOTAL_CENTS: Record<string, number> = {
  setup: 300000,
  build: 850000,
  enterprise: 1800000,
};

const TIER_DISPLAY: Record<string, string> = {
  setup: 'Setup',
  build: 'Build',
  enterprise: 'Enterprise',
};

export interface ConfirmationSession {
  sessionId: string;
  isPaid: boolean;
  tier: string | null;
  amountTotal: number | null; // cents
  currency: string;
  customerEmail: string | null;
  customerName: string | null;
  receiptUrl: string | null;
  intakeTokenFromMetadata: string | null;
  fullPriceCents: number | null;
}

export interface ConfirmationProject {
  id: string;
  tier: string | null;
  status: string | null;
  walkthrough_completed_at: string | null;
  intake_token_issued_at: string | null;
  intake_completed_at: string | null;
  scope_doc_signed_at: string | null;
  midpoint_accepted_at: string | null;
  deposit_paid_at: string | null;
  customer_name: string | null;
}

interface Props {
  dict: Dictionary;
  session: ConfirmationSession | null;
  project: ConfirmationProject | null;
  sessionIdProvided: boolean;
  /**
   * Optional founder-welcome video URL. When undefined, the welcome block
   * renders the static text fallback (07_ROLLOUT.md open item 1 — recording
   * is an asset task, may land Phase 1 or Phase 2).
   */
  founderVideoUrl?: string;
  /**
   * Discovery scheduling URL (Calendly / Cal.com). Sourced server-side from
   * SPEC_DISCOVERY_CALENDLY_URL so it rotates without a redeploy. When unset,
   * the secondary CTA falls back to "scheduling arrives by email" copy.
   */
  discoveryUrl?: string | null;
}

function t(dict: Dictionary, key: string, fallback: string): string {
  const value = dict[key];
  return typeof value === 'string' && value.trim().length > 0 ? value : fallback;
}

function formatCAD(cents: number | null): string {
  if (cents === null || cents === undefined) return '—';
  return `$${(cents / 100).toLocaleString('en-CA', {
    maximumFractionDigits: 0,
  })}`;
}

function buildMilestones(args: {
  tier: string | null;
  project: ConfirmationProject | null;
}): Milestone[] {
  const tier = args.tier;
  const milestoneCents =
    tier && TIER_TOTAL_CENTS[tier] ? TIER_TOTAL_CENTS[tier] / 4 : null;
  const amountLabel = milestoneCents ? formatCAD(milestoneCents) : null;

  const project = args.project;
  // Determine where in the four-stop pipeline we are. Default to "P1 paid,
  // P2 next" when no project row is available (Phase 0 fallback / pre-Stage-C.1).
  const statuses: Record<Milestone['key'], MilestoneStatus> = {
    p1: 'paid',
    p2: 'next',
    p3: 'upcoming',
    p4: 'upcoming',
  };

  if (project?.scope_doc_signed_at) {
    statuses.p2 = 'paid';
    statuses.p3 = 'next';
  }
  if (project?.midpoint_accepted_at) {
    statuses.p3 = 'paid';
    statuses.p4 = 'next';
  }
  if (project?.walkthrough_completed_at) {
    statuses.p4 = 'paid';
  }

  // Promote the next-in-line to "current" so the rail highlights one stop.
  const nextKey = (['p1', 'p2', 'p3', 'p4'] as const).find(
    (k) => statuses[k] === 'next'
  );
  if (nextKey) statuses[nextKey] = 'current';

  return [
    {
      key: 'p1',
      label: 'Deposit',
      detail: 'Funds discovery.',
      amountLabel,
      status: statuses.p1,
    },
    {
      key: 'p2',
      label: 'Scope sign-off',
      detail: 'Funds build kickoff.',
      amountLabel,
      status: statuses.p2,
    },
    {
      key: 'p3',
      label: 'Midpoint demo',
      detail: 'Bills when work clears review.',
      amountLabel,
      status: statuses.p3,
    },
    {
      key: 'p4',
      label: 'Delivery walkthrough',
      detail: 'Starts your 30-day Guarantee.',
      amountLabel,
      status: statuses.p4,
    },
  ];
}

function resolveIntakeHref(args: {
  session: ConfirmationSession | null;
  project: ConfirmationProject | null;
}): string | null {
  const token = args.session?.intakeTokenFromMetadata;
  if (token) return `/spec/intake/${token}`;
  // Project has an issued intake token but the plaintext isn't accessible
  // server-side (the DB stores only the hash). Fall through to the
  // "check your email" CTA in the rendering layer.
  return null;
}

export default function SpecConfirmation({
  dict,
  session,
  project,
  sessionIdProvided,
  founderVideoUrl,
  discoveryUrl,
}: Props) {
  const prefersReducedMotion = useReducedMotion() ?? false;

  if (!sessionIdProvided) {
    return <PendingState reason="missing_session_id" />;
  }

  if (!session) {
    return <PendingState reason="unverified" />;
  }

  if (!session.isPaid) {
    return <PendingState reason="awaiting_capture" />;
  }

  const tier = session.tier ?? project?.tier ?? null;
  const tierDisplay = tier && TIER_DISPLAY[tier] ? TIER_DISPLAY[tier] : tier ?? '—';
  const milestones = buildMilestones({ tier, project });
  const intakeHref = resolveIntakeHref({ session, project });
  const calendlyUrl = discoveryUrl ?? null;

  // Fade-in stagger for the major sections. One curve, no spring.
  const fade = (delay: number) => ({
    initial: prefersReducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    transition: prefersReducedMotion
      ? { duration: 0 }
      : { duration: 0.5, delay, ease },
  });

  return (
    <main className="bg-ops-background min-h-screen">
      <div className="mx-auto max-w-[860px] px-6 py-20">
        <motion.div {...fade(0)} className="flex items-center justify-between mb-10">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-ops-text-mute">
            {"// DEPOSIT CONFIRMED"}
          </p>
          <p className="font-mono text-[10px] tabular-nums tracking-[0.15em] text-ops-text-mute">
            [session :: {session.sessionId.slice(-8)}]
          </p>
        </motion.div>

        <motion.h1
          {...fade(0.05)}
          className="font-cakemono font-light text-[44px] sm:text-[56px] uppercase tracking-[0.02em] text-ops-text-primary leading-[1.05]"
        >
          {t(dict, 'confirmation.heading', "You're in.")}
        </motion.h1>

        <motion.p
          {...fade(0.12)}
          className="mt-4 font-mohave font-light text-[16px] leading-relaxed text-ops-text-secondary max-w-[560px]"
        >
          {t(
            dict,
            'confirmation.subtitle',
            'Deposit received. Here is what happens next.'
          )}
        </motion.p>

        {/* Session card */}
        <motion.section
          {...fade(0.2)}
          aria-label="Payment summary"
          className="mt-10 glass-surface px-6 py-5"
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            <SessionCell
              label="Package"
              value={`${tierDisplay} Package`}
              valueClassName="font-cakemono font-light uppercase tracking-[0.04em]"
            />
            <SessionCell
              label="Paid"
              value={`${formatCAD(session.amountTotal)} ${session.currency}`}
              valueClassName="font-mono tabular-nums"
            />
            <SessionCell
              label="Total"
              value={
                session.fullPriceCents
                  ? `${formatCAD(session.fullPriceCents)} ${session.currency}`
                  : tier && TIER_TOTAL_CENTS[tier]
                    ? `${formatCAD(TIER_TOTAL_CENTS[tier])} ${session.currency}`
                    : '—'
              }
              hint="across 4 milestones"
              valueClassName="font-mono tabular-nums"
            />
          </div>
          {session.customerEmail && (
            <p className="mt-4 font-mono text-[11px] tracking-[0.15em] uppercase text-ops-text-mute">
              [receipt sent to {session.customerEmail}]
            </p>
          )}
        </motion.section>

        {/* Founder welcome */}
        <motion.section
          {...fade(0.28)}
          aria-label="Welcome"
          className="mt-10 grid grid-cols-1 md:grid-cols-[260px_1fr] gap-6 items-start"
        >
          <FounderMedia videoUrl={founderVideoUrl} />
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-ops-text-mute mb-3">
              {"// OPERATOR :: JACKSON"}
            </p>
            <p className="font-mohave font-light text-[15px] leading-relaxed text-ops-text-primary">
              Thanks for trusting us with your build. Your intake is the next
              thing that matters — the more honest your answers, the closer
              your scope sits to what you actually need.
            </p>
            <p className="mt-3 font-mohave font-light text-[14px] leading-relaxed text-ops-text-secondary">
              I will review your intake, draft your scope, and book your
              discovery. Your delivery walkthrough is the anchor for your
              30-day Guarantee.
            </p>
          </div>
        </motion.section>

        {/* Milestone timeline */}
        <motion.div {...fade(0.36)}>
          <SpecMilestoneTimeline milestones={milestones} />
        </motion.div>

        {/* CTAs */}
        <motion.section
          {...fade(0.46)}
          aria-label="Next steps"
          className="mt-12 grid grid-cols-1 sm:grid-cols-2 gap-3"
        >
          <IntakeCta href={intakeHref} hasEmail={Boolean(session.customerEmail)} />
          <DiscoveryCta href={calendlyUrl} />
        </motion.section>

        {/* Guarantee reminder */}
        <motion.section
          {...fade(0.54)}
          className="mt-10 border-l-2 pl-4 py-1"
          style={{ borderColor: 'var(--color-ops-accent)' }}
        >
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-ops-text-mute mb-2">
            {"// 30-DAY GUARANTEE"}
          </p>
          <p className="font-mohave font-light text-[13px] leading-relaxed text-ops-text-secondary max-w-[620px]">
            Your 30-day Guarantee Refund window starts at your delivery
            walkthrough. Within that window you can walk away with no defect
            proof and no cure period.{' '}
            <Link
              href="/legal?page=spec-terms"
              className="text-ops-text-primary underline underline-offset-2 hover:text-ops-accent"
            >
              Exclusions apply
            </Link>
            : chargeback or fraud, material misrepresentation, prohibited
            workflow, material breach, non-payment disablement, and continued
            use of delivered modules after a refund.
          </p>
        </motion.section>

        {/* Footer links */}
        <motion.footer
          {...fade(0.62)}
          className="mt-10 flex flex-wrap items-center gap-6"
        >
          {session.receiptUrl && (
            <a
              href={session.receiptUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-[11px] uppercase tracking-[0.18em] text-ops-text-secondary hover:text-ops-text-primary"
            >
              View Stripe receipt
            </a>
          )}
          <Link
            href="/spec"
            className="font-mono text-[11px] uppercase tracking-[0.18em] text-ops-text-mute hover:text-ops-text-primary"
          >
            Back to OPS SPEC
          </Link>
        </motion.footer>
      </div>
    </main>
  );
}

function SessionCell({
  label,
  value,
  hint,
  valueClassName,
}: {
  label: string;
  value: string;
  hint?: string;
  valueClassName?: string;
}) {
  return (
    <div>
      <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ops-text-mute mb-1">
        {label}
      </p>
      <p
        className={`text-[18px] text-ops-text-primary ${valueClassName ?? 'font-mohave font-light'}`}
      >
        {value}
      </p>
      {hint && (
        <p className="mt-1 font-mono text-[10px] tracking-[0.15em] uppercase text-ops-text-mute">
          [{hint}]
        </p>
      )}
    </div>
  );
}

function FounderMedia({ videoUrl }: { videoUrl?: string }) {
  if (videoUrl) {
    return (
      <div
        className="aspect-video w-full overflow-hidden glass-surface"
        style={{ borderRadius: '10px' }}
      >
        <video
          className="w-full h-full object-cover"
          src={videoUrl}
          controls
          playsInline
          preload="metadata"
        />
      </div>
    );
  }
  return (
    <div
      className="aspect-video w-full flex items-center justify-center glass-surface"
      role="img"
      aria-label="Founder welcome — video forthcoming"
      style={{ borderRadius: '10px' }}
    >
      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-ops-text-mute text-center px-4 leading-relaxed">
        {"// FOUNDER WELCOME"}
        <br />
        [video shipping shortly]
      </p>
    </div>
  );
}

function IntakeCta({
  href,
  hasEmail,
}: {
  href: string | null;
  hasEmail: boolean;
}) {
  if (href) {
    return (
      <Link
        href={href}
        className="block px-5 py-4 rounded-[5px] border border-ops-accent text-ops-accent transition-colors duration-150 hover:bg-ops-accent hover:text-black"
      >
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] mb-1">
          {"// STEP 01"}
        </p>
        <p className="font-cakemono font-light text-[16px] uppercase tracking-[0.04em]">
          Open your intake link
        </p>
        <p className="font-mohave font-light text-[12px] mt-1 opacity-80">
          30-45 min. Save and resume anytime.
        </p>
      </Link>
    );
  }
  return (
    <div className="block px-5 py-4 rounded-[5px] border border-ops-border">
      <p className="font-mono text-[10px] uppercase tracking-[0.2em] mb-1 text-ops-text-mute">
        {"// STEP 01"}
      </p>
      <p className="font-cakemono font-light text-[16px] uppercase tracking-[0.04em] text-ops-text-primary">
        Check your inbox
      </p>
      <p className="font-mohave font-light text-[12px] mt-1 text-ops-text-secondary">
        {hasEmail
          ? 'Your intake link is in the deposit-confirmation email.'
          : 'Your intake link is on its way via email.'}
      </p>
    </div>
  );
}

function DiscoveryCta({ href }: { href: string | null }) {
  if (href) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="block px-5 py-4 rounded-[5px] border border-ops-border hover:border-ops-border-hover transition-colors duration-150"
      >
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] mb-1 text-ops-text-mute">
          {"// STEP 02"}
        </p>
        <p className="font-cakemono font-light text-[16px] uppercase tracking-[0.04em] text-ops-text-primary">
          Book your discovery session
        </p>
        <p className="font-mohave font-light text-[12px] mt-1 text-ops-text-secondary">
          Reserve a slot once intake is in.
        </p>
      </a>
    );
  }
  return (
    <div className="block px-5 py-4 rounded-[5px] border border-ops-border opacity-70">
      <p className="font-mono text-[10px] uppercase tracking-[0.2em] mb-1 text-ops-text-mute">
        {"// STEP 02"}
      </p>
      <p className="font-cakemono font-light text-[16px] uppercase tracking-[0.04em] text-ops-text-primary">
        Book your discovery session
      </p>
      <p className="font-mohave font-light text-[12px] mt-1 text-ops-text-secondary">
        Scheduling link arrives once intake is in.
      </p>
    </div>
  );
}

function PendingState({
  reason,
}: {
  reason: 'missing_session_id' | 'unverified' | 'awaiting_capture';
}) {
  const headline =
    reason === 'missing_session_id'
      ? 'No payment session detected.'
      : reason === 'awaiting_capture'
        ? 'Processing your payment.'
        : 'We could not verify your payment.';

  const body =
    reason === 'missing_session_id'
      ? 'If you completed checkout, your confirmation email has the next steps.'
      : reason === 'awaiting_capture'
        ? 'Stripe is still confirming the capture. Refresh in a few seconds. If this persists, check your email.'
        : 'If you completed checkout, your confirmation email has the next steps.';

  return (
    <main className="bg-ops-background min-h-screen flex items-center justify-center">
      <div className="mx-auto max-w-[520px] px-6 py-24">
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-ops-text-mute">
          {"// PENDING"}
        </p>
        <h1 className="mt-3 font-cakemono font-light text-[32px] uppercase tracking-[0.02em] text-ops-text-primary leading-tight">
          {headline}
        </h1>
        <p className="mt-4 font-mohave font-light text-[14px] leading-relaxed text-ops-text-secondary">
          {body}
        </p>
        <div className="mt-8 flex gap-6">
          <Link
            href="/spec"
            className="font-mono text-[11px] uppercase tracking-[0.18em] text-ops-accent hover:underline"
          >
            Back to OPS SPEC
          </Link>
        </div>
      </div>
    </main>
  );
}
