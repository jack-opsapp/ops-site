/**
 * POST /api/cron/spec-nudges
 *
 * SPEC Phase 1 daily nudge / status-flip / outbox-retry processor.
 *
 * Source spec:
 *   - ops-software-bible/SPEC/07_ROLLOUT.md § 12 (Cron jobs)
 *   - ops-software-bible/SPEC/06_CONTRACT_AND_EMAILS.md § Cron jobs
 *   - ops-software-bible/SPEC/03_WORKFLOW.md § state transitions
 *
 * Vercel cron schedule (see ../../../../../vercel.json):
 *   0 17 * * *   → 09:00 America/Vancouver during PST (UTC-8).
 *                  Drifts to 10:00 local during PDT (UTC-7). The
 *                  one-hour DST drift is acceptable for daily nudges
 *                  (none are minute-sensitive). Vercel cron evaluates
 *                  schedules in fixed UTC; there is no native local-TZ
 *                  cron expression.
 *
 * Auth: Vercel automatically attaches Authorization: Bearer
 * ${CRON_SECRET} when CRON_SECRET is set as an env var. Any caller
 * without that header gets 401. The check is constant-time.
 *
 * Cost note: Vercel cron is free on Pro tier. This route is invoked
 * once per day and finishes well under the 300s default function
 * timeout. Active CPU consumption is dominated by the email dispatch
 * fan-out (task 6) — bounded at MAX_ROWS_PER_RUN=500.
 *
 * Failure isolation: each task runs in its own try/catch so a single
 * task's blowup never blocks the rest. Within a task, each row is
 * also wrapped in safeMutate so one bad row doesn't break the batch.
 *
 * The route ALWAYS returns 200 with the run summary when CRON_SECRET
 * validation passes — even if every task errored. The response body
 * carries the per-task breakdown so Vercel cron logs capture it. A
 * 5xx response would trigger Vercel's cron retry, which we don't want
 * for a partially-successful run.
 */

import { NextResponse } from 'next/server';

import { getSupabaseAdmin } from '@/lib/supabase-admin';

import { verifyCronAuth } from '@/lib/spec/cron/auth';
import { runIntakeReminders } from '@/lib/spec/cron/intake-reminders';
import { runIntakeNoDiscoveryNudges } from '@/lib/spec/cron/intake-no-discovery';
import { runOwnerApprovalExpiry } from '@/lib/spec/cron/owner-approval-expiry';
import { runCustomerRequestedHoldExpiry } from '@/lib/spec/cron/hold-expiry';
import { runOpsBlockedReviewReminder } from '@/lib/spec/cron/ops-blocked-review';
import { runSpecEmailOutboxRetry } from '@/lib/spec/cron/email-outbox-retry';
import { runConversionEventOutboxRetry } from '@/lib/spec/cron/conversion-event-retry';
import { runNonPaymentDisable } from '@/lib/spec/cron/non-payment-disable';
import { persistRunSummary, summarize } from '@/lib/spec/cron/run-summary';
import { emptyTaskResult, type TaskResult } from '@/lib/spec/cron/types';

// Vercel cron POSTs by default. We accept both POST and GET (manual
// operator invocation from the admin force-run button uses GET).
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 300;

export async function POST(request: Request) {
  return handle(request);
}

export async function GET(request: Request) {
  return handle(request);
}

async function handle(request: Request) {
  const auth = verifyCronAuth(request);
  if (!auth.ok) {
    console.warn('[spec/cron] auth rejected:', auth.reason);
    return NextResponse.json({ error: auth.reason }, { status: auth.status });
  }

  const startedAt = Date.now();
  const now = new Date();
  const db = getSupabaseAdmin();

  // Each task is wrapped so one failure doesn't block the others.
  // We deliberately run sequentially (not in parallel) — total daily
  // volume is small and sequential ordering matches the spec narrative
  // (reminders / status flips before outbox retry).
  const results: TaskResult[] = [];

  results.push(
    await tryTask('intake_reminders', () => runIntakeReminders(db, now)),
  );
  results.push(
    await tryTask('intake_no_discovery_nudges', () => runIntakeNoDiscoveryNudges(db, now)),
  );
  results.push(
    await tryTask('owner_approval_expiry', () => runOwnerApprovalExpiry(db, now)),
  );
  results.push(
    await tryTask('customer_requested_hold_expiry', () => runCustomerRequestedHoldExpiry(db, now)),
  );
  results.push(
    await tryTask('ops_blocked_review_reminder', () => runOpsBlockedReviewReminder(db, now)),
  );
  results.push(
    await tryTask('non_payment_disable', () => runNonPaymentDisable(db, now)),
  );
  // Outbox retry tasks LAST so freshly-enqueued rows from earlier
  // tasks have a chance to dispatch in this same run.
  results.push(
    await tryTask('spec_email_outbox_retry', () => runSpecEmailOutboxRetry(db, now)),
  );
  results.push(
    await tryTask('conversion_event_outbox_retry', () => runConversionEventOutboxRetry(db, now)),
  );

  const summary = summarize(results, startedAt, now);
  await persistRunSummary(db, summary);

  return NextResponse.json({ status: 'ok', summary });
}

async function tryTask(
  task: string,
  fn: () => Promise<TaskResult>,
): Promise<TaskResult> {
  try {
    return await fn();
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`[spec/cron] task ${task} threw:`, msg);
    const result = emptyTaskResult(task);
    result.errored = 1;
    result.details.push(`task-level throw: ${msg.slice(0, 400)}`);
    return result;
  }
}
