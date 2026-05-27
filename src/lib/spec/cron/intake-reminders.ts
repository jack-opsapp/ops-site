/**
 * Task 1 — Intake reminders.
 *
 * Source: SPEC/06_CONTRACT_AND_EMAILS.md cron-jobs table
 *         + SPEC/07_ROLLOUT.md § 11 Phase 1 email template list.
 *
 * For every spec_projects row where status='deposit_paid' AND
 * intake_completed_at IS NULL, we walk the D14 / D21 / D28 reminder
 * sequence (one nudge per cadence, gated by intake_reminder_count so a
 * given row never receives the same nudge twice). Cadence chosen to
 * match the Stage H template ids spec.intake_reminder_1/_2/_3 and the
 * locked trigger contract in 06_CONTRACT_AND_EMAILS.md.
 *
 * 03_WORKFLOW.md mentions a D14 / D30 / D60 alternate in one passage;
 * the resolved 06 table wins and this implementation tracks 06. The
 * bible companion update notes the drift for the next consolidation
 * pass.
 *
 * Per-row work:
 *   1. enqueue spec_email_outbox row with the right template_id
 *   2. bump intake_reminder_count, stamp last_intake_reminder_at
 *   3. write a system-channel spec_communications evidence row
 *
 * The cron does NOT dispatch the email inline — task 6 (email-outbox
 * retry) picks up freshly-enqueued rows on the next run. That keeps
 * dispatch / enqueue concerns separated and means a degraded OPS-Web
 * internal endpoint never blocks the nudge scheduler.
 */

import type { SupabaseClient } from '@supabase/supabase-js';

import { emptyTaskResult, safeMutate, type TaskResult } from './types';
import { logSystemCommunication } from './notifications';

const TASK = 'intake_reminders';

interface IntakeCandidate {
  id: string;
  customer_email: string;
  buyer_user_id: string;
  linked_company_id: string | null;
  deposit_paid_at: string;
  intake_reminder_count: number;
  is_test: boolean;
}

type NudgeStage = 1 | 2 | 3;

const STAGE_DAYS: Record<NudgeStage, number> = { 1: 14, 2: 21, 3: 28 };
const STAGE_TEMPLATE: Record<NudgeStage, string> = {
  1: 'spec.intake_reminder_1',
  2: 'spec.intake_reminder_2',
  3: 'spec.intake_reminder_3',
};

export async function runIntakeReminders(
  db: SupabaseClient,
  now: Date,
): Promise<TaskResult> {
  const result = emptyTaskResult(TASK);

  const { data: rows, error } = await db
    .from('spec_projects')
    .select('id, customer_email, buyer_user_id, linked_company_id, deposit_paid_at, intake_reminder_count, is_test')
    .eq('status', 'deposit_paid')
    .is('intake_completed_at', null)
    .not('deposit_paid_at', 'is', null)
    .lt('intake_reminder_count', 3);

  if (error) {
    result.details.push(`query error: ${error.message}`);
    result.errored += 1;
    return result;
  }
  const candidates = (rows ?? []) as IntakeCandidate[];
  result.considered = candidates.length;

  for (const row of candidates) {
    const nextStage = (row.intake_reminder_count + 1) as NudgeStage;
    if (nextStage > 3) continue;
    const requiredDays = STAGE_DAYS[nextStage];
    const ageDays = daysBetween(new Date(row.deposit_paid_at), now);
    if (ageDays < requiredDays) continue;

    const ok = await safeMutate(result, row.id, async () => {
      await enqueueAndStamp(db, row, nextStage, now);
    });
    if (ok !== null) {
      result.fired += 1;
      result.details.push(
        `${row.id}: stage ${nextStage} (${STAGE_TEMPLATE[nextStage]}) at deposit+${ageDays}d`,
      );
    }
  }

  return result;
}

async function enqueueAndStamp(
  db: SupabaseClient,
  row: IntakeCandidate,
  stage: NudgeStage,
  now: Date,
): Promise<void> {
  const templateId = STAGE_TEMPLATE[stage];
  const { error: enqErr } = await db.from('spec_email_outbox').insert({
    template_id: templateId,
    recipient_email: row.customer_email.trim().toLowerCase(),
    recipient_user_id: row.buyer_user_id,
    spec_project_id: row.id,
    payload: {
      spec_project_id: row.id,
      stage,
    },
    status: 'pending',
    attempts: 0,
    is_test: row.is_test,
  });
  if (enqErr) throw new Error(`outbox insert failed: ${enqErr.message}`);

  const { error: upErr } = await db
    .from('spec_projects')
    .update({
      intake_reminder_count: stage,
      last_intake_reminder_at: now.toISOString(),
    })
    .eq('id', row.id)
    // Guard against the same nudge double-firing if two cron instances race.
    .eq('intake_reminder_count', stage - 1);
  if (upErr) throw new Error(`spec_projects update failed: ${upErr.message}`);

  await logSystemCommunication(db, {
    specProjectId: row.id,
    summary: `intake reminder ${stage} fired (${templateId})`,
    body: `Enqueued spec_email_outbox row for ${templateId}; stage=${stage}, deposit_paid_at age in days exceeded threshold ${STAGE_DAYS[stage]}.`,
  });
}

function daysBetween(from: Date, to: Date): number {
  return Math.floor((to.getTime() - from.getTime()) / 86_400_000);
}
