/**
 * Task 6 — spec_email_outbox retry / dispatch.
 *
 * Source: SPEC/07_ROLLOUT.md § 12 + 06_CONTRACT_AND_EMAILS.md cron-jobs.
 *
 * Picks up rows in `spec_email_outbox` that are eligible for a send
 * attempt and POSTs them to OPS-Web's internal SPEC send endpoint via
 * `dispatchSpecEmail` (see ./dispatch-email.ts for the topology
 * decision).
 *
 * Eligibility:
 *   status IN ('pending','failed')
 *   AND attempts < MAX_ATTEMPTS
 *   AND (last_attempt_at IS NULL OR last_attempt_at < now() - 1h)
 *
 * Result mapping:
 *   dispatch returns ok=true                → status='sent', sent_at=now()
 *   dispatch returns ok=false kind=permanent → bump attempts; if >=5 set
 *                                              status='permanent_failure',
 *                                              notify operators.
 *   dispatch returns ok=false kind=transient → bump attempts; status='failed'.
 *                                              If attempts==5, mark permanent.
 *   dispatch returns ok=false kind=not_configured → log + stop the task
 *                                              early. We do NOT bump
 *                                              attempts on a config
 *                                              error — that would walk
 *                                              every row toward
 *                                              permanent_failure on a
 *                                              deploy where the OPS-Web
 *                                              endpoint env vars were
 *                                              accidentally unset.
 */

import type { SupabaseClient } from '@supabase/supabase-js';

import { emptyTaskResult, safeMutate, type TaskResult } from './types';
import { dispatchSpecEmail, type DispatchResult } from './dispatch-email';
import { notifyOperators } from './notifications';

const TASK = 'spec_email_outbox_retry';
const MAX_ATTEMPTS = 5;
const RETRY_COOLDOWN_MS = 60 * 60 * 1000; // 1 hour
const MAX_ROWS_PER_RUN = 500; // safety cap; cron runs daily so this is plenty

interface OutboxRow {
  id: string;
  template_id: string;
  recipient_email: string;
  recipient_user_id: string | null;
  spec_project_id: string | null;
  payload: Record<string, unknown>;
  attempts: number;
  is_test: boolean;
}

export async function runSpecEmailOutboxRetry(
  db: SupabaseClient,
  now: Date,
): Promise<TaskResult> {
  const result = emptyTaskResult(TASK);
  const cooldownIso = new Date(now.getTime() - RETRY_COOLDOWN_MS).toISOString();

  const { data: rows, error } = await db
    .from('spec_email_outbox')
    .select('id, template_id, recipient_email, recipient_user_id, spec_project_id, payload, attempts, is_test, last_attempt_at')
    .in('status', ['pending', 'failed'])
    .lt('attempts', MAX_ATTEMPTS)
    .or(`last_attempt_at.is.null,last_attempt_at.lt.${cooldownIso}`)
    .order('created_at', { ascending: true })
    .limit(MAX_ROWS_PER_RUN);

  if (error) {
    result.details.push(`query error: ${error.message}`);
    result.errored += 1;
    return result;
  }
  const candidates = (rows ?? []) as Array<OutboxRow & { last_attempt_at: string | null }>;
  result.considered = candidates.length;

  let configError = false;

  for (const row of candidates) {
    if (configError) {
      // Once we know the OPS-Web endpoint isn't configured, no point
      // hammering it for every row. Stop here without bumping anything.
      break;
    }

    const dispatchResult = await dispatchSpecEmail({
      templateId: row.template_id,
      recipientEmail: row.recipient_email,
      recipientUserId: row.recipient_user_id,
      specProjectId: row.spec_project_id,
      payload: row.payload,
      isTest: row.is_test,
    });

    if (dispatchResult.ok === false && dispatchResult.kind === 'not_configured') {
      configError = true;
      result.details.push(`OPS-Web internal dispatch not configured — task aborted`);
      console.error('[spec/cron/email-outbox-retry]', dispatchResult.error);
      // Operator-notify so this doesn't fail silently forever.
      await notifyOperators(db, {
        type: 'spec_email_dispatch_misconfigured',
        title: 'SPEC EMAIL DISPATCH MISCONFIGURED',
        body: `Cron could not reach the OPS-Web internal SPEC send endpoint. Pending outbox rows: ${candidates.length}. Check OPS_WEB_INTERNAL_BASE_URL + OPS_INTERNAL_DISPATCH_SECRET.`,
        persistent: true,
        actionUrl: `/admin/spec`,
      });
      break;
    }

    await safeMutate(result, row.id, async () => {
      await persistDispatchOutcome(db, row, dispatchResult, now);
      result.fired += 1;
    });
  }

  return result;
}

async function persistDispatchOutcome(
  db: SupabaseClient,
  row: OutboxRow,
  dispatchResult: DispatchResult,
  now: Date,
): Promise<void> {
  const nowIso = now.toISOString();

  if (dispatchResult.ok === true) {
    const { error } = await db
      .from('spec_email_outbox')
      .update({
        status: 'sent',
        sent_at: nowIso,
        last_attempt_at: nowIso,
        last_error: dispatchResult.status === 'sent' ? null : `delivery_status=${dispatchResult.status}`,
      })
      .eq('id', row.id);
    if (error) throw new Error(`success update failed: ${error.message}`);
    return;
  }

  const nextAttempts = row.attempts + 1;
  const reachedCap = nextAttempts >= MAX_ATTEMPTS;
  const isPermanent = dispatchResult.kind === 'permanent';
  const newStatus =
    isPermanent || reachedCap ? 'permanent_failure' : 'failed';
  const errMsg = `${dispatchResult.kind} http=${'httpStatus' in dispatchResult ? dispatchResult.httpStatus : 'n/a'} ${dispatchResult.error.slice(0, 400)}`;

  const { error } = await db
    .from('spec_email_outbox')
    .update({
      status: newStatus,
      attempts: nextAttempts,
      last_attempt_at: nowIso,
      last_error: errMsg,
    })
    .eq('id', row.id);
  if (error) throw new Error(`failure update failed: ${error.message}`);

  if (newStatus === 'permanent_failure') {
    await notifyOperators(db, {
      type: 'spec_email_permanent_failure',
      title: 'SPEC EMAIL PERMANENT FAILURE',
      body: `Outbox row ${row.id} (${row.template_id} → ${row.recipient_email}) reached permanent_failure after ${nextAttempts} attempts. Last error: ${errMsg.slice(0, 200)}`,
      persistent: true,
      projectId: row.spec_project_id,
      actionUrl: row.spec_project_id ? `/admin/spec/${row.spec_project_id}` : `/admin/spec`,
    });
  }
}
