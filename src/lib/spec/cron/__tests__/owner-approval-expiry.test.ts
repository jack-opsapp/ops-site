import { strict as assert } from 'node:assert';
import { test } from 'node:test';

import { runOwnerApprovalExpiry } from '../owner-approval-expiry';
import { makeFakeSupabase } from './fake-supabase';

function daysFromNow(now: Date, days: number): string {
  return new Date(now.getTime() + days * 86_400_000).toISOString();
}

test('owner approval expiry: pending request past expires_at flips to expired + cancels project', async () => {
  const now = new Date('2026-06-01T17:00:00Z');
  const db = makeFakeSupabase({
    spec_owner_approval_requests: [
      {
        id: 'app-1',
        spec_project_id: 'proj-1',
        buyer_user_id: 'user-buyer',
        account_holder_user_id: 'user-owner',
        linked_company_id: 'co-1',
        tier: 'build',
        status: 'pending',
        expires_at: daysFromNow(now, -1), // expired yesterday
        is_test: false,
      },
    ],
    spec_projects: [
      {
        id: 'proj-1',
        status: 'awaiting_owner_approval',
        customer_email: 'buyer@example.com',
        customer_name: 'Bob Buyer',
        tos_version_accepted: null,
        tos_accepted_at: null,
        billing_province: null,
      },
    ],
    users: [
      {
        id: 'user-owner',
        email: 'owner@example.com',
        name: 'Olive Owner',
        first_name: 'Olive',
      },
    ],
    notifications: [],
    spec_communications: [],
    spec_email_outbox: [],
    role_permissions: [{ role_id: 'role-spec', permission: 'spec.admin', scope: 'all' }],
    user_roles: [{ user_id: 'user-jackson', role_id: 'role-spec' }],
    user_permission_overrides: [],
  });

  const result = await runOwnerApprovalExpiry(db, now);
  assert.equal(result.fired, 1);
  assert.equal(result.errored, 0);

  const approval = db.rows.spec_owner_approval_requests[0];
  assert.equal(approval.status, 'expired');
  assert.ok(approval.decided_at);

  const project = db.rows.spec_projects[0];
  assert.equal(project.status, 'cancelled');
  assert.equal(project.cancellation_reason, 'owner_approval_expired');
  assert.ok(project.cancelled_at);
  // CHECK constraint placeholder TOS values must be set since we leave
  // the pre-deposit-state safe zone.
  assert.equal(project.tos_version_accepted, 'owner_approval_expired');
  assert.ok(project.tos_accepted_at);

  // Two outbox emails (buyer + owner).
  const outboxInserts = db.recordedInserts.filter((r) => r.table === 'spec_email_outbox');
  assert.equal(outboxInserts.length, 2);
  const templateIds = outboxInserts.map((i) => i.rows[0].template_id).sort();
  assert.deepEqual(templateIds, [
    'spec.owner_approval_expired_buyer',
    'spec.owner_approval_expired_owner',
  ]);

  // Notifications: 2 customer rows + N operator rows (1 here, since
  // only user-jackson holds the spec.admin permission).
  const notifInserts = db.recordedInserts.filter((r) => r.table === 'notifications');
  // notifyCustomer inserts singletons (one each), notifyOperators inserts a
  // batch — so we expect 3 inserts total.
  assert.equal(notifInserts.length, 3);
});

test('owner approval expiry: pending request not yet expired is left alone', async () => {
  const now = new Date('2026-06-01T17:00:00Z');
  const db = makeFakeSupabase({
    spec_owner_approval_requests: [
      {
        id: 'app-fresh',
        spec_project_id: 'proj-fresh',
        buyer_user_id: 'user-buyer',
        account_holder_user_id: 'user-owner',
        linked_company_id: 'co-1',
        tier: 'build',
        status: 'pending',
        expires_at: daysFromNow(now, +3), // expires in 3 days
        is_test: false,
      },
    ],
    spec_projects: [],
    users: [],
    notifications: [],
    spec_communications: [],
    spec_email_outbox: [],
    role_permissions: [],
    user_roles: [],
    user_permission_overrides: [],
  });

  const result = await runOwnerApprovalExpiry(db, now);
  assert.equal(result.considered, 0);
  assert.equal(result.fired, 0);
});

test('owner approval expiry: already-decided requests are not re-expired', async () => {
  const now = new Date('2026-06-01T17:00:00Z');
  const db = makeFakeSupabase({
    spec_owner_approval_requests: [
      {
        id: 'app-approved',
        spec_project_id: 'proj-approved',
        status: 'approved',
        expires_at: daysFromNow(now, -10),
      },
    ],
    spec_projects: [],
    users: [],
    notifications: [],
    spec_communications: [],
    spec_email_outbox: [],
    role_permissions: [],
    user_roles: [],
    user_permission_overrides: [],
  });

  const result = await runOwnerApprovalExpiry(db, now);
  assert.equal(result.considered, 0);
});
