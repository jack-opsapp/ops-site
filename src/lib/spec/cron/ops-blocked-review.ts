/**
 * Task 5 — ops_blocked hold review reminder.
 *
 * Source: SPEC/06_CONTRACT_AND_EMAILS.md cron-jobs table +
 *         SPEC/03_WORKFLOW.md § "OPS-blocked".
 *
 * Optional per Phase 1 spec. If a project sits at status='on_hold'
 * with hold_type='ops_blocked' for more than 14 days, dispatch a
 * persistent operator notification suggesting Jackson decide: convert
 * to customer_requested (frees slot) or escalate to stall. No
 * customer-facing action.
 *
 * Idempotency: stamp ops_blocked_review_reminder_sent_at on the
 * spec_projects row so the reminder fires once per ops_blocked spell.
 * If the hold is resumed and a new ops_blocked spell starts later, we
 * detect it because on_hold_at resets at the new hold-entry — but we
 * intentionally do NOT reset ops_blocked_review_reminder_sent_at on
 * resume (that would require touching sibling-chip resume code). The
 * cron uses `ops_blocked_review_reminder_sent_at IS NULL OR
 *  ops_blocked_review_reminder_sent_at < on_hold_at` to handle a fresh
 * spell correctly when on_hold_at is moved forward.
 */

import type { SupabaseClient } from '@supabase/supabase-js';

import { emptyTaskResult, safeMutate, type TaskResult } from './types';
import { logSystemCommunication, notifyOperators } from './notifications';

const TASK = 'ops_blocked_review_reminder';
const THRESHOLD_DAYS = 14;

interface OpsBlockedCandidate {
  id: string;
  tier: string;
  on_hold_at: string;
  on_hold_reason: string | null;
  ops_blocked_review_reminder_sent_at: string | null;
}

export async function runOpsBlockedReviewReminder(
  db: SupabaseClient,
  now: Date,
): Promise<TaskResult> {
  const result = emptyTaskResult(TASK);

  const thresholdIso = new Date(now.getTime() - THRESHOLD_DAYS * 86_400_000).toISOString();

  const { data: rows, error } = await db
    .from('spec_projects')
    .select('id, tier, on_hold_at, on_hold_reason, ops_blocked_review_reminder_sent_at')
    .eq('status', 'on_hold')
    .eq('hold_type', 'ops_blocked')
    .not('on_hold_at', 'is', null)
    .lt('on_hold_at', thresholdIso);

  if (error) {
    result.details.push(`query error: ${error.message}`);
    result.errored += 1;
    return result;
  }
  const candidates = (rows ?? []) as OpsBlockedCandidate[];
  result.considered = candidates.length;

  for (const row of candidates) {
    // Skip if the most recent reminder was sent AFTER the current
    // ops_blocked spell started. This catches "we already nudged for
    // this spell" without breaking on resume → re-hold sequences.
    if (
      row.ops_blocked_review_reminder_sent_at &&
      new Date(row.ops_blocked_review_reminder_sent_at) >= new Date(row.on_hold_at)
    ) {
      continue;
    }

    const ok = await safeMutate(result, row.id, async () => {
      await fireReminder(db, row, now);
    });
    if (ok !== null) {
      result.fired += 1;
      result.details.push(
        `${row.id}: ops_blocked since ${row.on_hold_at} — operator reminder dispatched`,
      );
    }
  }

  return result;
}

async function fireReminder(
  db: SupabaseClient,
  row: OpsBlockedCandidate,
  now: Date,
): Promise<void> {
  await notifyOperators(db, {
    type: 'spec_ops_blocked_review',
    title: 'SPEC OPS-BLOCKED 14 DAYS',
    body: `Tier ${row.tier} project ${row.id} ops_blocked since ${row.on_hold_at.slice(0, 10)}. Decide: convert to customer_requested (free slot) or escalate to stall. Reason on file: ${row.on_hold_reason ?? '—'}.`,
    persistent: true,
    projectId: row.id,
    actionUrl: `/admin/spec/${row.id}`,
  });

  const { error: upErr } = await db
    .from('spec_projects')
    .update({ ops_blocked_review_reminder_sent_at: now.toISOString() })
    .eq('id', row.id);
  if (upErr) throw new Error(`stamp update failed: ${upErr.message}`);

  await logSystemCommunication(db, {
    specProjectId: row.id,
    summary: `ops_blocked 14d operator reminder dispatched`,
    body: `ops_blocked since ${row.on_hold_at}; operator notification persistent=true; no customer-facing action.`,
  });
}
