/**
 * Task 4 — customer_requested hold expiry.
 *
 * Source: SPEC/03_WORKFLOW.md § "Customer-requested pause" +
 *         SPEC/06_CONTRACT_AND_EMAILS.md cron-jobs table.
 *
 * For every spec_projects row where status='on_hold' AND
 * hold_type='customer_requested' AND on_hold_expires_at < now(), flip
 * the project to 'stalled_on_hold'. Per the locked capacity semantics
 * (03_WORKFLOW.md § Capacity-consuming states), customer_requested
 * holds already freed the slot at on-hold-entry, so no capacity change
 * is needed here.
 *
 * Notify the customer + the operator. The customer email template
 * spec.hold_expired_customer_requested is not in the Stage H registry —
 * we enqueue anyway; task 6 dispatch will surface the missing template
 * via permanent_failure; the operator notification is the operative
 * surface either way.
 */

import type { SupabaseClient } from '@supabase/supabase-js';

import { emptyTaskResult, safeMutate, type TaskResult } from './types';
import { logSystemCommunication, notifyCustomer, notifyOperators } from './notifications';

const TASK = 'customer_requested_hold_expiry';

interface ExpiredHold {
  id: string;
  customer_email: string;
  buyer_user_id: string;
  linked_company_id: string | null;
  tier: string;
  on_hold_at: string | null;
  on_hold_expires_at: string;
  is_test: boolean;
}

export async function runCustomerRequestedHoldExpiry(
  db: SupabaseClient,
  now: Date,
): Promise<TaskResult> {
  const result = emptyTaskResult(TASK);
  const nowIso = now.toISOString();

  const { data: rows, error } = await db
    .from('spec_projects')
    .select('id, customer_email, buyer_user_id, linked_company_id, tier, on_hold_at, on_hold_expires_at, is_test')
    .eq('status', 'on_hold')
    .eq('hold_type', 'customer_requested')
    .not('on_hold_expires_at', 'is', null)
    .lt('on_hold_expires_at', nowIso);

  if (error) {
    result.details.push(`query error: ${error.message}`);
    result.errored += 1;
    return result;
  }
  const candidates = (rows ?? []) as ExpiredHold[];
  result.considered = candidates.length;

  for (const row of candidates) {
    const ok = await safeMutate(result, row.id, async () => {
      await stallHold(db, row, nowIso);
    });
    if (ok !== null) {
      result.fired += 1;
      result.details.push(`${row.id}: customer_requested hold past expiry → stalled_on_hold`);
    }
  }

  return result;
}

async function stallHold(
  db: SupabaseClient,
  row: ExpiredHold,
  nowIso: string,
): Promise<void> {
  // 1. Flip status. Guard against races.
  const { data: updated, error: upErr } = await db
    .from('spec_projects')
    .update({ status: 'stalled_on_hold', stalled_at: nowIso, stalled_reason: 'customer_requested_hold_expired' })
    .eq('id', row.id)
    .eq('status', 'on_hold')
    .eq('hold_type', 'customer_requested')
    .select('id')
    .maybeSingle();
  if (upErr) throw new Error(`stall update failed: ${upErr.message}`);
  if (!updated) throw new Error('hold was concurrently resumed — skipping');

  // 2. Enqueue customer email (template TBD in Stage H — see file header).
  const { error: enqErr } = await db.from('spec_email_outbox').insert({
    template_id: 'spec.hold_expired_customer_requested',
    recipient_email: row.customer_email.trim().toLowerCase(),
    recipient_user_id: row.buyer_user_id,
    spec_project_id: row.id,
    payload: { spec_project_id: row.id, tier: row.tier },
    status: 'pending',
    attempts: 0,
    is_test: row.is_test,
  });
  if (enqErr) throw new Error(`email enqueue failed: ${enqErr.message}`);

  // 3. In-app customer notification (if we have a linked_company_id).
  if (row.linked_company_id) {
    await notifyCustomer(db, {
      userId: row.buyer_user_id,
      companyId: row.linked_company_id,
      type: 'spec_hold_expired',
      title: 'SPEC PAUSED — REACH OUT TO RESUME',
      body: 'Your SPEC pause has reached 90 days. Reach out anytime to pick up where you left off.',
      persistent: false,
      projectId: row.id,
    });
  }

  // 4. Operator notification.
  await notifyOperators(db, {
    type: 'spec_hold_expired',
    title: 'SPEC HOLD EXPIRED',
    body: `customer_requested hold expired for ${row.id} (tier ${row.tier}) → stalled_on_hold.`,
    persistent: false,
    projectId: row.id,
    actionUrl: `/admin/spec/${row.id}`,
  });

  await logSystemCommunication(db, {
    specProjectId: row.id,
    summary: 'customer_requested hold expired → stalled_on_hold',
    body: `on_hold_at=${row.on_hold_at ?? 'unknown'}; on_hold_expires_at=${row.on_hold_expires_at}; status now stalled_on_hold.`,
  });
}
