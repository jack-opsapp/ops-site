/**
 * SPEC notification dispatch helpers (service-role, server-only).
 *
 * Notifications live in `public.notifications` (text user_id + text company_id;
 * the table is consumed by OPS-Web's NotificationsDrawer mounted in
 * dashboard-layout.tsx). The rail is alive per resolved
 * `SPEC-NOTIFICATION-RAIL-DEPRECATED` (2026-05-25) — the earlier "deprecated"
 * flag was a false alarm about the visual placement moving to an edge-tab
 * drawer; the system itself is in active production use.
 *
 * Locked routing (SPEC/07_ROLLOUT.md § Gate resolutions):
 *   - Customer rows:   company_id = linked_company_id (guaranteed non-null
 *                       by SPEC-NO-COMPANY-BUYER-FLOW-LOCK)
 *   - Operator rows:   company_id = OPS_OPERATIONS_COMPANY_ID
 *                       ('00000000-0000-0000-0000-00000000000a' — seeded by
 *                       migration `..02-internal-company.sql`)
 *
 * Operator membership is derived from the same data source the
 * `private.is_spec_operator()` SQL function uses:
 *   - users with role_permissions(permission='spec.admin', scope='all') via
 *     the SPEC Operator role (id = '00000000-0000-0000-0000-0000000000a1'),
 *     enumerated through public.user_roles
 *   - users with user_permission_overrides(permission='spec.admin',
 *     granted=true) — by convention every override row carries
 *     company_id = OPS_OPERATIONS_COMPANY_ID
 *
 * NEVER throws to the caller — webhook side-effects must continue even if a
 * single notification insert fails. Errors are logged internally.
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

export interface NotificationDispatchOptions {
  /** Override the service-role Supabase client (testing only). */
  db?: SupabaseClient;
}

export const OPS_OPERATIONS_COMPANY_ID = '00000000-0000-0000-0000-00000000000a';
export const SPEC_OPERATOR_ROLE_ID = '00000000-0000-0000-0000-0000000000a1';

export type SpecNotificationType =
  | 'spec_deposit_received'
  | 'spec_deposit_confirmed'
  | 'spec_quebec_leak_refunded'
  | 'spec_dispute_opened'
  | 'spec_owner_approval_requested'
  | 'spec_owner_approval_granted'
  | 'spec_owner_approval_declined'
  | 'spec_intake_completed'
  | 'spec_refund_requested'
  | 'spec_regulated_workflow_flagged';

interface NotificationInsert {
  user_id: string;
  company_id: string;
  type: SpecNotificationType;
  title: string;
  body: string;
  action_url: string;
  action_label: string;
  persistent: boolean;
}

export interface DispatchSpecOperatorNotificationArgs {
  type: SpecNotificationType;
  title: string;
  body: string;
  persistent: boolean;
  specProjectId: string;
  actionLabel?: string;
}

export interface DispatchSpecCustomerNotificationArgs {
  recipientUserId: string;
  linkedCompanyId: string;
  type: SpecNotificationType;
  title: string;
  body: string;
  persistent: boolean;
  actionUrl: string;
  actionLabel?: string;
}

/**
 * Returns the union of user IDs that satisfy `private.is_spec_operator()`:
 *  - members of the SPEC Operator role (via user_roles → role_permissions)
 *  - users with explicit spec.admin override (granted=true)
 *
 * All IDs returned as text (matches `notifications.user_id` column type).
 */
export async function getSpecOperatorUserIds(
  options: NotificationDispatchOptions = {},
): Promise<string[]> {
  const db = options.db ?? getSupabaseAdmin();
  const ids = new Set<string>();

  const { data: roleRows, error: roleErr } = await db
    .from('user_roles')
    .select('user_id, roles!inner(id), role_permissions:roles!inner(role_permissions!inner(permission, scope))')
    .eq('roles.id', SPEC_OPERATOR_ROLE_ID);

  if (roleErr) {
    // Fall back to a simpler two-step lookup if the embedded select fails
    // (Supabase PostgREST sometimes rejects deep relationship traversals).
    const { data: simpleRoleRows, error: simpleErr } = await db
      .from('user_roles')
      .select('user_id')
      .eq('role_id', SPEC_OPERATOR_ROLE_ID);
    if (simpleErr) {
      console.error('[spec/notifications] user_roles lookup failed', simpleErr);
    } else if (simpleRoleRows) {
      for (const r of simpleRoleRows) {
        if (typeof r.user_id === 'string') ids.add(r.user_id);
      }
    }
  } else if (roleRows) {
    for (const r of roleRows) {
      if (typeof r.user_id === 'string') ids.add(r.user_id);
    }
  }

  const { data: overrideRows, error: overrideErr } = await db
    .from('user_permission_overrides')
    .select('user_id')
    .eq('permission', 'spec.admin')
    .eq('granted', true);

  if (overrideErr) {
    console.error('[spec/notifications] user_permission_overrides lookup failed', overrideErr);
  } else if (overrideRows) {
    for (const r of overrideRows) {
      if (typeof r.user_id === 'string') ids.add(r.user_id);
    }
  }

  return Array.from(ids);
}

async function insertNotificationRows(
  rows: NotificationInsert[],
  db: SupabaseClient,
): Promise<void> {
  if (rows.length === 0) return;
  const { error } = await db.from('notifications').insert(rows);
  if (error) {
    console.error('[spec/notifications] insert failed', {
      count: rows.length,
      types: rows.map((r) => r.type),
      error: error.message,
    });
  }
}

/**
 * Insert one notification row per SPEC operator user. Always
 * `company_id = OPS_OPERATIONS_COMPANY_ID`. Never throws.
 */
export async function dispatchSpecOperatorNotification(
  args: DispatchSpecOperatorNotificationArgs,
  options: NotificationDispatchOptions = {},
): Promise<void> {
  const db = options.db ?? getSupabaseAdmin();
  let operatorIds: string[] = [];
  try {
    operatorIds = await getSpecOperatorUserIds({ db });
  } catch (err) {
    console.error('[spec/notifications] getSpecOperatorUserIds threw', err);
    return;
  }
  if (operatorIds.length === 0) {
    console.warn('[spec/notifications] no SPEC operators found — operator notification dropped', {
      type: args.type,
      specProjectId: args.specProjectId,
    });
    return;
  }

  const rows: NotificationInsert[] = operatorIds.map((userId) => ({
    user_id: userId,
    company_id: OPS_OPERATIONS_COMPANY_ID,
    type: args.type,
    title: args.title,
    body: args.body,
    action_url: `/admin/spec/${args.specProjectId}`,
    action_label: args.actionLabel ?? 'OPEN',
    persistent: args.persistent,
  }));
  await insertNotificationRows(rows, db);
}

/**
 * Insert a single notification row for the customer (buyer or account_holder).
 * `company_id = linked_company_id` per locked routing. Never throws.
 */
export async function dispatchSpecCustomerNotification(
  args: DispatchSpecCustomerNotificationArgs,
  options: NotificationDispatchOptions = {},
): Promise<void> {
  const db = options.db ?? getSupabaseAdmin();
  await insertNotificationRows(
    [
      {
        user_id: args.recipientUserId,
        company_id: args.linkedCompanyId,
        type: args.type,
        title: args.title,
        body: args.body,
        action_url: args.actionUrl,
        action_label: args.actionLabel ?? 'OPEN',
        persistent: args.persistent,
      },
    ],
    db,
  );
}
