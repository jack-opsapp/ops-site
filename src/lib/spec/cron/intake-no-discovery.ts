/**
 * Task 2 — Intake-completed-no-discovery nudges.
 *
 * Source: SPEC/06_CONTRACT_AND_EMAILS.md cron-jobs table.
 *
 * For every spec_projects row where intake_completed_at IS NOT NULL
 * AND discovery_scheduled_at IS NULL, walk the D7 / D14 / D21 reminder
 * sequence using spec.intake_completed_no_discovery_1/_2/_3.
 *
 * Pattern matches task 1 (intake-reminders) — enqueue an outbox row,
 * bump the counter, stamp the timestamp, log a system communication.
 * The actual email send happens in task 6 (email-outbox retry) on the
 * next run.
 */

import type { SupabaseClient } from '@supabase/supabase-js';

import { emptyTaskResult, safeMutate, type TaskResult } from './types';
import { logSystemCommunication } from './notifications';

const TASK = 'intake_no_discovery_nudges';

interface NoDiscoveryCandidate {
  id: string;
  customer_email: string;
  buyer_user_id: string;
  intake_completed_at: string;
  intake_no_discovery_reminder_count: number;
  is_test: boolean;
}

type NudgeStage = 1 | 2 | 3;
const STAGE_DAYS: Record<NudgeStage, number> = { 1: 7, 2: 14, 3: 21 };
const STAGE_TEMPLATE: Record<NudgeStage, string> = {
  1: 'spec.intake_completed_no_discovery_1',
  2: 'spec.intake_completed_no_discovery_2',
  3: 'spec.intake_completed_no_discovery_3',
};

export async function runIntakeNoDiscoveryNudges(
  db: SupabaseClient,
  now: Date,
): Promise<TaskResult> {
  const result = emptyTaskResult(TASK);

  const { data: rows, error } = await db
    .from('spec_projects')
    .select('id, customer_email, buyer_user_id, intake_completed_at, intake_no_discovery_reminder_count, is_test')
    .not('intake_completed_at', 'is', null)
    .is('discovery_scheduled_at', null)
    .lt('intake_no_discovery_reminder_count', 3);

  if (error) {
    result.details.push(`query error: ${error.message}`);
    result.errored += 1;
    return result;
  }
  const candidates = (rows ?? []) as NoDiscoveryCandidate[];
  result.considered = candidates.length;

  for (const row of candidates) {
    const nextStage = (row.intake_no_discovery_reminder_count + 1) as NudgeStage;
    if (nextStage > 3) continue;
    const requiredDays = STAGE_DAYS[nextStage];
    const ageDays = daysBetween(new Date(row.intake_completed_at), now);
    if (ageDays < requiredDays) continue;

    const ok = await safeMutate(result, row.id, async () => {
      await enqueueAndStamp(db, row, nextStage, now);
    });
    if (ok !== null) {
      result.fired += 1;
      result.details.push(
        `${row.id}: no_discovery stage ${nextStage} (${STAGE_TEMPLATE[nextStage]}) at intake+${ageDays}d`,
      );
    }
  }

  return result;
}

async function enqueueAndStamp(
  db: SupabaseClient,
  row: NoDiscoveryCandidate,
  stage: NudgeStage,
  now: Date,
): Promise<void> {
  const templateId = STAGE_TEMPLATE[stage];
  const { error: enqErr } = await db.from('spec_email_outbox').insert({
    template_id: templateId,
    recipient_email: row.customer_email.trim().toLowerCase(),
    recipient_user_id: row.buyer_user_id,
    spec_project_id: row.id,
    payload: { spec_project_id: row.id, stage },
    status: 'pending',
    attempts: 0,
    is_test: row.is_test,
  });
  if (enqErr) throw new Error(`outbox insert failed: ${enqErr.message}`);

  const { error: upErr } = await db
    .from('spec_projects')
    .update({
      intake_no_discovery_reminder_count: stage,
      last_intake_no_discovery_reminder_at: now.toISOString(),
    })
    .eq('id', row.id)
    .eq('intake_no_discovery_reminder_count', stage - 1);
  if (upErr) throw new Error(`spec_projects update failed: ${upErr.message}`);

  await logSystemCommunication(db, {
    specProjectId: row.id,
    summary: `no-discovery reminder ${stage} fired (${templateId})`,
    body: `Enqueued spec_email_outbox row for ${templateId}; stage=${stage}, intake_completed_at age in days exceeded threshold ${STAGE_DAYS[stage]}.`,
  });
}

function daysBetween(from: Date, to: Date): number {
  return Math.floor((to.getTime() - from.getTime()) / 86_400_000);
}
