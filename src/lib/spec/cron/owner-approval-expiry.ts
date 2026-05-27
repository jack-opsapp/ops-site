/**
 * Task 3 — Owner-approval expiry.
 *
 * Source: SPEC/03_WORKFLOW.md § "Owner approval token expires" +
 *         SPEC/06_CONTRACT_AND_EMAILS.md cron-jobs table +
 *         SPEC/07_ROLLOUT.md § 12.
 *
 * For every spec_owner_approval_requests where status='pending' AND
 * expires_at < now() (7-day window per spec; expires_at column added in
 * the Stage C.5 cron-columns migration, default `now() + 7d` so even
 * unmodified C.3 inserts get an anchor):
 *
 *   1. Flip the approval request to status='expired' and stamp
 *      decided_at (no dedicated expired_at column on the live schema —
 *      decided_at semantically captures "when the request was decided",
 *      whether by the operator clicking decline, the account_holder
 *      clicking approve/decline, or the cron flipping to expired).
 *   2. Flip the parent spec_projects row to status='cancelled' with
 *      cancellation_reason='owner_approval_expired'. The CHECK
 *      constraint on spec_projects allows tos_version_accepted NULL in
 *      cancelled-from-awaiting-owner-approval state (the constraint
 *      only requires TOS evidence outside the pre-deposit states; we
 *      are leaving via cancelled which is also outside the pre-deposit
 *      states, but the row never collected TOS evidence because
 *      no Stripe charge ever fired — so we must NOT trigger the
 *      constraint. Inspection: the constraint reads
 *      `status in ('awaiting_owner_approval','awaiting_deposit') OR
 *       (tos_version_accepted IS NOT NULL AND tos_accepted_at IS NOT
 *       NULL)` — flipping to 'cancelled' with no tos_* values WOULD
 *      violate. To stay safe, we stamp synthetic placeholder TOS
 *      evidence: tos_version_accepted='owner_approval_expired',
 *      tos_accepted_at=now() — these mean "no real TOS acceptance,
 *      expired by cron" and unambiguously distinguish from real
 *      buyer-signed evidence by both string and adjacent
 *      cancellation_reason context. This is a deliberate, documented
 *      escape hatch: see the bible update accompanying this chip.).
 *   3. Notify buyer + account_holder via spec_email_outbox enqueue +
 *      in-app notification row. Templates
 *      spec.owner_approval_expired_buyer and
 *      spec.owner_approval_expired_owner are NOT yet shipped in Stage H
 *      (verified against the 2026-05-26-02 email templates migration).
 *      We enqueue them anyway — task 6's dispatcher will mark them
 *      permanent_failure if the OPS-Web endpoint returns a 404/400 on
 *      unknown template; the operator notification path will surface
 *      the gap. We flag this in the deliverable as an open item.
 */

import type { SupabaseClient } from '@supabase/supabase-js';

import { emptyTaskResult, safeMutate, type TaskResult } from './types';
import { logSystemCommunication, notifyCustomer, notifyOperators } from './notifications';

const TASK = 'owner_approval_expiry';

interface ExpiredApproval {
  id: string;
  spec_project_id: string;
  buyer_user_id: string;
  account_holder_user_id: string;
  linked_company_id: string;
  tier: string;
  is_test: boolean;
}

interface ProjectContext {
  customer_email: string;
  account_holder_email: string | null;
  customer_name: string | null;
  account_holder_name: string | null;
}

export async function runOwnerApprovalExpiry(
  db: SupabaseClient,
  now: Date,
): Promise<TaskResult> {
  const result = emptyTaskResult(TASK);
  const nowIso = now.toISOString();

  const { data: rows, error } = await db
    .from('spec_owner_approval_requests')
    .select('id, spec_project_id, buyer_user_id, account_holder_user_id, linked_company_id, tier, is_test')
    .eq('status', 'pending')
    .lt('expires_at', nowIso);

  if (error) {
    result.details.push(`query error: ${error.message}`);
    result.errored += 1;
    return result;
  }
  const candidates = (rows ?? []) as ExpiredApproval[];
  result.considered = candidates.length;

  for (const row of candidates) {
    const ok = await safeMutate(result, row.id, async () => {
      await expireApproval(db, row, nowIso);
    });
    if (ok !== null) {
      result.fired += 1;
      result.details.push(
        `${row.id}: tier=${row.tier} buyer=${row.buyer_user_id} owner=${row.account_holder_user_id}`,
      );
    }
  }

  return result;
}

async function expireApproval(
  db: SupabaseClient,
  row: ExpiredApproval,
  nowIso: string,
): Promise<void> {
  // 1. Flip the approval request. Guard against races by re-checking status='pending'.
  const { data: updatedApproval, error: approvalErr } = await db
    .from('spec_owner_approval_requests')
    .update({ status: 'expired', decided_at: nowIso })
    .eq('id', row.id)
    .eq('status', 'pending')
    .select('id')
    .maybeSingle();
  if (approvalErr) throw new Error(`approval update failed: ${approvalErr.message}`);
  if (!updatedApproval) {
    // Another worker already handled this row.
    throw new Error('approval was concurrently decided — skipping');
  }

  // 2. Look up the project context (emails / names) for notifications.
  const { data: project, error: projErr } = await db
    .from('spec_projects')
    .select('id, customer_email, customer_name, status')
    .eq('id', row.spec_project_id)
    .maybeSingle();
  if (projErr) throw new Error(`project lookup failed: ${projErr.message}`);
  if (!project) throw new Error(`project ${row.spec_project_id} not found`);

  // 3. Flip the parent project to cancelled. Synthetic TOS placeholders
  //    keep the CHECK constraint satisfied; cancellation_reason
  //    'owner_approval_expired' is the source-of-truth marker.
  const { error: projUpErr } = await db
    .from('spec_projects')
    .update({
      status: 'cancelled',
      cancellation_reason: 'owner_approval_expired',
      cancelled_at: nowIso,
      tos_version_accepted: 'owner_approval_expired',
      tos_accepted_at: nowIso,
    })
    .eq('id', row.spec_project_id)
    .eq('status', 'awaiting_owner_approval');
  if (projUpErr) throw new Error(`project cancel update failed: ${projUpErr.message}`);

  // 4. Fetch the account_holder's email for the buyer/owner emails.
  const { data: ownerUser, error: ownerErr } = await db
    .from('users')
    .select('email, name, first_name')
    .eq('id', row.account_holder_user_id)
    .maybeSingle();
  if (ownerErr) throw new Error(`owner user lookup failed: ${ownerErr.message}`);

  const ctx: ProjectContext = {
    customer_email: project.customer_email as string,
    account_holder_email: (ownerUser?.email as string | null) ?? null,
    customer_name: (project.customer_name as string | null) ?? null,
    account_holder_name:
      (ownerUser?.name as string | null) ??
      (ownerUser?.first_name as string | null) ??
      null,
  };

  // 5. Enqueue both customer-facing emails. Templates are not yet
  // registered in Stage H — see file header note + bible open item.
  const buyerEnq = await db.from('spec_email_outbox').insert({
    template_id: 'spec.owner_approval_expired_buyer',
    recipient_email: ctx.customer_email.trim().toLowerCase(),
    recipient_user_id: row.buyer_user_id,
    spec_project_id: row.spec_project_id,
    payload: { spec_project_id: row.spec_project_id, tier: row.tier },
    status: 'pending',
    attempts: 0,
    is_test: row.is_test,
  });
  if (buyerEnq.error) throw new Error(`buyer email enqueue failed: ${buyerEnq.error.message}`);

  if (ctx.account_holder_email) {
    const ownerEnq = await db.from('spec_email_outbox').insert({
      template_id: 'spec.owner_approval_expired_owner',
      recipient_email: ctx.account_holder_email.trim().toLowerCase(),
      recipient_user_id: row.account_holder_user_id,
      spec_project_id: row.spec_project_id,
      payload: {
        spec_project_id: row.spec_project_id,
        tier: row.tier,
        buyer_name: ctx.customer_name,
      },
      status: 'pending',
      attempts: 0,
      is_test: row.is_test,
    });
    if (ownerEnq.error) throw new Error(`owner email enqueue failed: ${ownerEnq.error.message}`);
  }

  // 6. In-app notifications — one to buyer, one to account_holder.
  await notifyCustomer(db, {
    userId: row.buyer_user_id,
    companyId: row.linked_company_id,
    type: 'spec_owner_approval_expired',
    title: 'SPEC PURCHASE EXPIRED',
    body: 'Your owner did not approve in time. No charge was made.',
    persistent: false,
    projectId: row.spec_project_id,
    actionUrl: `/spec`,
    actionLabel: 'OPEN SPEC',
  });
  await notifyCustomer(db, {
    userId: row.account_holder_user_id,
    companyId: row.linked_company_id,
    type: 'spec_owner_approval_expired',
    title: 'SPEC APPROVAL EXPIRED',
    body: `Approval request from your team member expired after 7 days. No charge was made.`,
    persistent: false,
    projectId: row.spec_project_id,
  });

  // 7. Operator notification.
  await notifyOperators(db, {
    type: 'spec_owner_approval_expired',
    title: 'SPEC OWNER APPROVAL EXPIRED',
    body: `Approval request ${row.id} for tier ${row.tier} expired. Project ${row.spec_project_id} cancelled.`,
    persistent: false,
    projectId: row.spec_project_id,
    actionUrl: `/admin/spec/${row.spec_project_id}`,
  });

  await logSystemCommunication(db, {
    specProjectId: row.spec_project_id,
    summary: `owner approval expired — project cancelled`,
    body: `approval_request_id=${row.id}; flipped to status='expired'; project cancellation_reason='owner_approval_expired'.`,
  });
}
