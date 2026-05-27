/**
 * Task 8 — Non-payment 7-day threshold disable.
 *
 * Source: SPEC/07_ROLLOUT.md § 12 + 06_CONTRACT_AND_EMAILS.md § 5
 * (Payment terms: "Non-payment: modules disabled after 7 calendar days
 * past the net-15 due date").
 *
 * For every spec_payments row where:
 *   status='invoiced' OR status='overdue'
 *   AND due_date IS NOT NULL
 *   AND due_date < (now() - interval '7 days')
 *
 * Flip every spec_module_entitlements row for the same spec_project_id
 * that isn't already disabled to `enabled=false, disabled_reason='non_payment'`.
 * Idempotency: rows already at `disabled_reason='non_payment'` are
 * skipped, so a project that's already non-payment-disabled doesn't
 * keep firing notifications every day.
 *
 * Notifications: one customer email + in-app notification per project
 * the first time it crosses the threshold, plus an operator alert.
 * We detect "first time" by checking if any entitlement row for the
 * project still has disabled_reason != 'non_payment' before we update.
 */

import type { SupabaseClient } from '@supabase/supabase-js';

import { emptyTaskResult, safeMutate, type TaskResult } from './types';
import { logSystemCommunication, notifyCustomer, notifyOperators } from './notifications';

const TASK = 'non_payment_disable';
const THRESHOLD_DAYS = 7;

interface OverdueRow {
  id: string;
  spec_project_id: string;
  milestone: string;
  due_date: string;
}

interface ProjectRow {
  id: string;
  customer_email: string;
  buyer_user_id: string;
  linked_company_id: string | null;
  tier: string;
}

export async function runNonPaymentDisable(
  db: SupabaseClient,
  now: Date,
): Promise<TaskResult> {
  const result = emptyTaskResult(TASK);

  // due_date is a `date` (no time), so do the math in JS to construct
  // the cutoff. Anything with due_date <= cutoff (i.e. >7d past due)
  // qualifies. We add the +0d-grace per spec (net-15 + 7d = 22 days
  // past invoice date; but the rule is anchored on due_date itself,
  // so the cutoff is "due_date older than 7 calendar days").
  const cutoff = new Date(now.getTime() - THRESHOLD_DAYS * 86_400_000);
  const cutoffDate = cutoff.toISOString().slice(0, 10);

  const { data: rows, error } = await db
    .from('spec_payments')
    .select('id, spec_project_id, milestone, due_date, status')
    .in('status', ['invoiced', 'overdue'])
    .not('due_date', 'is', null)
    .lt('due_date', cutoffDate);

  if (error) {
    result.details.push(`query error: ${error.message}`);
    result.errored += 1;
    return result;
  }
  const overdueRows = (rows ?? []) as OverdueRow[];

  // Group by spec_project_id — many milestones may be overdue for one
  // project; we want to disable once per project, not once per
  // milestone.
  const byProject = new Map<string, OverdueRow[]>();
  for (const row of overdueRows) {
    const arr = byProject.get(row.spec_project_id);
    if (arr) arr.push(row);
    else byProject.set(row.spec_project_id, [row]);
  }
  result.considered = byProject.size;

  for (const [projectId, milestones] of byProject) {
    const ok = await safeMutate(result, projectId, async () => {
      const fired = await disableProject(db, projectId, milestones, now);
      if (fired) {
        result.fired += 1;
        result.details.push(
          `${projectId}: disabled for non_payment (overdue milestones: ${milestones.map((m) => m.milestone).join(',')})`,
        );
      }
    });
    // safeMutate already counted the error in errored if ok===null.
    if (ok === null) continue;
  }

  return result;
}

async function disableProject(
  db: SupabaseClient,
  projectId: string,
  milestones: OverdueRow[],
  now: Date,
): Promise<boolean> {
  // Fetch existing entitlement rows so we can detect first-time disable.
  const { data: existing, error: entErr } = await db
    .from('spec_module_entitlements')
    .select('id, enabled, disabled_reason')
    .eq('spec_project_id', projectId);
  if (entErr) throw new Error(`entitlements lookup failed: ${entErr.message}`);

  const rows = existing ?? [];
  if (rows.length === 0) {
    // No entitlement rows yet — project hasn't reached scope sign-off.
    // Nothing to disable; nothing to notify (the upstream invoice
    // flow is responsible for surfacing pre-scope overdue cases).
    return false;
  }

  // Was anything still enabled OR disabled for a reason other than
  // non_payment before this run? If so, this is the first time we're
  // disabling.
  const firstTime = rows.some((r) => r.enabled === true || r.disabled_reason !== 'non_payment');
  if (!firstTime) return false;

  const { error: upErr } = await db
    .from('spec_module_entitlements')
    .update({ enabled: false, disabled_reason: 'non_payment', disabled_at: now.toISOString() })
    .eq('spec_project_id', projectId)
    .neq('disabled_reason', 'non_payment');
  if (upErr) throw new Error(`entitlement update failed: ${upErr.message}`);

  // Look up project context for notifications.
  const { data: project, error: projErr } = await db
    .from('spec_projects')
    .select('id, customer_email, buyer_user_id, linked_company_id, tier, is_test')
    .eq('id', projectId)
    .maybeSingle();
  if (projErr) throw new Error(`project lookup failed: ${projErr.message}`);
  if (!project) throw new Error(`project ${projectId} not found`);

  const p = project as ProjectRow & { is_test: boolean };

  // Customer-facing email enqueue. The non-payment notice template is
  // not in Stage H yet (see migration 2026-05-26-02 — no
  // spec.modules_disabled_non_payment row); enqueue anyway. Task 6
  // will surface the missing template via permanent_failure once
  // OPS-Web's endpoint reports `invalid_template`.
  const { error: enqErr } = await db.from('spec_email_outbox').insert({
    template_id: 'spec.modules_disabled_non_payment',
    recipient_email: p.customer_email.trim().toLowerCase(),
    recipient_user_id: p.buyer_user_id,
    spec_project_id: projectId,
    payload: {
      spec_project_id: projectId,
      tier: p.tier,
      overdue_milestones: milestones.map((m) => ({ milestone: m.milestone, due_date: m.due_date })),
    },
    status: 'pending',
    attempts: 0,
    is_test: p.is_test,
  });
  if (enqErr) throw new Error(`email enqueue failed: ${enqErr.message}`);

  if (p.linked_company_id) {
    await notifyCustomer(db, {
      userId: p.buyer_user_id,
      companyId: p.linked_company_id,
      type: 'spec_modules_disabled_non_payment',
      title: 'SPEC MODULES DISABLED',
      body: 'An invoice is more than 7 days past due. SPEC modules are paused until payment clears.',
      persistent: true,
      projectId,
      actionUrl: `/account/spec/${projectId}/request-refund`,
    });
  }

  await notifyOperators(db, {
    type: 'spec_modules_disabled_non_payment',
    title: 'SPEC MODULES DISABLED — NON-PAYMENT',
    body: `Project ${projectId} (tier ${p.tier}) entitlements flipped to non_payment. Overdue milestones: ${milestones.map((m) => m.milestone).join(', ')}.`,
    persistent: true,
    projectId,
    actionUrl: `/admin/spec/${projectId}`,
  });

  await logSystemCommunication(db, {
    specProjectId: projectId,
    summary: `non_payment threshold crossed → entitlements disabled`,
    body: `Overdue milestones: ${milestones.map((m) => `${m.milestone} due ${m.due_date}`).join('; ')}. Entitlements flipped: enabled=false, disabled_reason='non_payment'.`,
  });

  return true;
}
