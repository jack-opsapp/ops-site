/**
 * Notification + spec_communications helpers for the daily cron.
 *
 * Notification rows are written to `public.notifications` per the
 * resolved SPEC-NOTIFICATION-RAIL-DEPRECATED contract — the rail is
 * alive and consumed by OPS-Web's edge-tab NotificationsDrawer plus
 * the /admin/spec TODAY queue.
 *
 * Notification table columns (live schema, verified via Supabase MCP):
 *   user_id text NOT NULL, company_id text NOT NULL,
 *   type text NOT NULL DEFAULT 'mention', title text NOT NULL,
 *   body text NOT NULL, project_id text NULLABLE,
 *   persistent boolean DEFAULT false, action_url text NULLABLE,
 *   action_label text NULLABLE, is_read boolean NOT NULL DEFAULT false.
 *
 * Operator-facing rows MUST use `company_id = OPS_OPERATIONS_COMPANY_ID`.
 * Customer-facing rows use the project's linked_company_id.
 */

import type { SupabaseClient } from '@supabase/supabase-js';

export const OPS_OPERATIONS_COMPANY_ID = '00000000-0000-0000-0000-00000000000a';

export interface OperatorNotificationArgs {
  type: string;
  title: string;
  body: string;
  persistent?: boolean;
  actionUrl?: string | null;
  actionLabel?: string | null;
  projectId?: string | null;
}

/**
 * Insert one notification row per SPEC operator (users with the
 * spec.admin permission via the dedicated SPEC Operator role OR a
 * user_permission_overrides grant). The cron resolves "who is an
 * operator" by reading user_ids joined through role_permissions and
 * user_permission_overrides — same membership the private.is_spec_operator()
 * function consults. We bypass the SECURITY DEFINER function here
 * because the cron runs as service_role and needs the user_id list
 * to fan out one row per operator.
 */
export async function notifyOperators(
  db: SupabaseClient,
  args: OperatorNotificationArgs,
): Promise<number> {
  const operatorIds = await resolveOperatorUserIds(db);
  if (operatorIds.length === 0) {
    console.warn('[spec/cron/notifications] no SPEC operators found — notification skipped');
    return 0;
  }
  const rows = operatorIds.map((userId) => ({
    user_id: userId,
    company_id: OPS_OPERATIONS_COMPANY_ID,
    type: args.type,
    title: args.title,
    body: args.body,
    persistent: args.persistent ?? false,
    action_url: args.actionUrl ?? null,
    action_label: args.actionLabel ?? 'OPEN',
    project_id: args.projectId ?? null,
  }));
  const { error } = await db.from('notifications').insert(rows);
  if (error) {
    console.error('[spec/cron/notifications] operator insert failed:', error.message);
    return 0;
  }
  return rows.length;
}

export interface CustomerNotificationArgs {
  /** Buyer or account_holder user_id (uuid stringified). */
  userId: string;
  /** Customer's company id (uuid stringified). NEVER null per locked
   *  SPEC-NO-COMPANY-BUYER-FLOW-LOCK: every spec_projects.linked_company_id
   *  is non-null after Stage C.1 ships. */
  companyId: string;
  type: string;
  title: string;
  body: string;
  persistent?: boolean;
  actionUrl?: string | null;
  actionLabel?: string | null;
  projectId?: string | null;
}

export async function notifyCustomer(
  db: SupabaseClient,
  args: CustomerNotificationArgs,
): Promise<boolean> {
  const { error } = await db.from('notifications').insert({
    user_id: args.userId,
    company_id: args.companyId,
    type: args.type,
    title: args.title,
    body: args.body,
    persistent: args.persistent ?? false,
    action_url: args.actionUrl ?? null,
    action_label: args.actionLabel ?? 'OPEN',
    project_id: args.projectId ?? null,
  });
  if (error) {
    console.error('[spec/cron/notifications] customer insert failed:', error.message);
    return false;
  }
  return true;
}

/**
 * Append a `system`-channel spec_communications row. Used for cron run
 * summaries and per-event evidence (intake reminder fired, hold expiry
 * flipped, etc.) — keeps the audit trail per-project visible inside
 * /admin/spec/[id] without polluting the customer-facing log.
 */
export async function logSystemCommunication(
  db: SupabaseClient,
  args: {
    specProjectId: string;
    summary: string;
    body?: string | null;
  },
): Promise<void> {
  const { error } = await db.from('spec_communications').insert({
    spec_project_id: args.specProjectId,
    direction: 'outbound',
    channel: 'system',
    summary: args.summary,
    body: args.body ?? null,
  });
  if (error) {
    console.error('[spec/cron/notifications] spec_communications insert failed:', error.message);
  }
}

/**
 * Resolve user_ids who satisfy private.is_spec_operator() membership
 * by querying role_permissions + user_permission_overrides directly.
 * The cron is service_role so RLS does not apply. We deliberately do
 * NOT call the SECURITY DEFINER function — it expects a user JWT, and
 * the cron has none.
 */
async function resolveOperatorUserIds(db: SupabaseClient): Promise<string[]> {
  const ids = new Set<string>();

  // Branch 1: role_permissions(role_id) join user_roles(user_id, role_id)
  // where permission='spec.admin' AND scope='all'.
  const { data: rolePermRows, error: rpErr } = await db
    .from('role_permissions')
    .select('role_id')
    .eq('permission', 'spec.admin')
    .eq('scope', 'all');
  if (rpErr) {
    console.error('[spec/cron/notifications] role_permissions lookup failed:', rpErr.message);
  } else if (rolePermRows && rolePermRows.length > 0) {
    const roleIds = rolePermRows.map((r) => r.role_id as string);
    const { data: urRows, error: urErr } = await db
      .from('user_roles')
      .select('user_id')
      .in('role_id', roleIds);
    if (urErr) {
      console.error('[spec/cron/notifications] user_roles lookup failed:', urErr.message);
    } else if (urRows) {
      for (const row of urRows) {
        ids.add(row.user_id as string);
      }
    }
  }

  // Branch 2: user_permission_overrides where permission='spec.admin'
  // AND granted=true.
  const { data: overrideRows, error: oErr } = await db
    .from('user_permission_overrides')
    .select('user_id')
    .eq('permission', 'spec.admin')
    .eq('granted', true);
  if (oErr) {
    console.error('[spec/cron/notifications] user_permission_overrides lookup failed:', oErr.message);
  } else if (overrideRows) {
    for (const row of overrideRows) {
      ids.add(row.user_id as string);
    }
  }

  return Array.from(ids);
}
