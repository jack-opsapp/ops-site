import { strict as assert } from 'node:assert';
import { test } from 'node:test';

import { runCustomerRequestedHoldExpiry } from '../hold-expiry';
import { makeFakeSupabase } from './fake-supabase';

function daysFromNow(now: Date, days: number): string {
  return new Date(now.getTime() + days * 86_400_000).toISOString();
}

test('customer_requested hold: expired row flips to stalled_on_hold', async () => {
  const now = new Date('2026-06-01T17:00:00Z');
  const db = makeFakeSupabase({
    spec_projects: [
      {
        id: 'proj-h1',
        status: 'on_hold',
        hold_type: 'customer_requested',
        on_hold_at: daysFromNow(now, -91),
        on_hold_expires_at: daysFromNow(now, -1),
        customer_email: 'pause@example.com',
        buyer_user_id: 'user-pause',
        linked_company_id: 'co-pause',
        tier: 'build',
        is_test: false,
      },
    ],
    notifications: [],
    spec_communications: [],
    spec_email_outbox: [],
    role_permissions: [],
    user_roles: [],
    user_permission_overrides: [],
  });

  const result = await runCustomerRequestedHoldExpiry(db, now);
  assert.equal(result.fired, 1);

  const project = db.rows.spec_projects[0];
  assert.equal(project.status, 'stalled_on_hold');
  assert.ok(project.stalled_at);
  assert.equal(project.stalled_reason, 'customer_requested_hold_expired');

  const outboxInserts = db.recordedInserts.filter((r) => r.table === 'spec_email_outbox');
  assert.equal(outboxInserts.length, 1);
  assert.equal(outboxInserts[0].rows[0].template_id, 'spec.hold_expired_customer_requested');
});

test('customer_requested hold: not-yet-expired row left alone', async () => {
  const now = new Date('2026-06-01T17:00:00Z');
  const db = makeFakeSupabase({
    spec_projects: [
      {
        id: 'proj-h2',
        status: 'on_hold',
        hold_type: 'customer_requested',
        on_hold_at: daysFromNow(now, -10),
        on_hold_expires_at: daysFromNow(now, +80),
        customer_email: 'fresh@example.com',
        buyer_user_id: 'u',
        linked_company_id: 'co',
        tier: 'build',
        is_test: false,
      },
    ],
    notifications: [],
    spec_communications: [],
    spec_email_outbox: [],
    role_permissions: [],
    user_roles: [],
    user_permission_overrides: [],
  });

  const result = await runCustomerRequestedHoldExpiry(db, now);
  assert.equal(result.considered, 0);
  assert.equal(result.fired, 0);
});

test('customer_requested hold: ops_blocked rows are ignored even if past expiry', async () => {
  const now = new Date('2026-06-01T17:00:00Z');
  const db = makeFakeSupabase({
    spec_projects: [
      {
        id: 'proj-ops-blocked',
        status: 'on_hold',
        hold_type: 'ops_blocked',
        on_hold_at: daysFromNow(now, -200),
        on_hold_expires_at: daysFromNow(now, -100),
        customer_email: 'opsblocked@example.com',
        buyer_user_id: 'u',
        linked_company_id: 'co',
        tier: 'build',
        is_test: false,
      },
    ],
    notifications: [],
    spec_communications: [],
    spec_email_outbox: [],
    role_permissions: [],
    user_roles: [],
    user_permission_overrides: [],
  });

  const result = await runCustomerRequestedHoldExpiry(db, now);
  assert.equal(result.considered, 0);
});
