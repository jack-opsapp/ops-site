import { strict as assert } from 'node:assert';
import { test } from 'node:test';

import { runNonPaymentDisable } from '../non-payment-disable';
import { makeFakeSupabase } from './fake-supabase';

function daysAgoDate(now: Date, days: number): string {
  return new Date(now.getTime() - days * 86_400_000).toISOString().slice(0, 10);
}

test('non-payment disable: 8d-overdue invoice flips entitlements to non_payment', async () => {
  const now = new Date('2026-06-01T17:00:00Z');
  const db = makeFakeSupabase({
    spec_payments: [
      {
        id: 'pay-1',
        spec_project_id: 'proj-1',
        milestone: 'scope_signoff',
        due_date: daysAgoDate(now, 8),
        status: 'invoiced',
      },
    ],
    spec_module_entitlements: [
      {
        id: 'ent-1',
        spec_project_id: 'proj-1',
        module_key: 'jobs',
        enabled: true,
        disabled_reason: null,
      },
    ],
    spec_projects: [
      {
        id: 'proj-1',
        customer_email: 'bob@example.com',
        buyer_user_id: 'u',
        linked_company_id: 'co',
        tier: 'build',
        is_test: false,
      },
    ],
    spec_email_outbox: [],
    notifications: [],
    spec_communications: [],
    role_permissions: [],
    user_roles: [],
    user_permission_overrides: [],
  });

  const result = await runNonPaymentDisable(db, now);
  assert.equal(result.fired, 1);

  const ent = db.rows.spec_module_entitlements[0];
  assert.equal(ent.enabled, false);
  assert.equal(ent.disabled_reason, 'non_payment');
  assert.ok(ent.disabled_at);
});

test('non-payment disable: 6d-overdue invoice does not fire (under 7d threshold)', async () => {
  const now = new Date('2026-06-01T17:00:00Z');
  const db = makeFakeSupabase({
    spec_payments: [
      {
        id: 'pay-2',
        spec_project_id: 'proj-2',
        milestone: 'midpoint',
        due_date: daysAgoDate(now, 6),
        status: 'invoiced',
      },
    ],
    spec_module_entitlements: [
      { id: 'ent-2', spec_project_id: 'proj-2', module_key: 'jobs', enabled: true, disabled_reason: null },
    ],
    spec_projects: [
      { id: 'proj-2', customer_email: 'x@example.com', buyer_user_id: 'u', linked_company_id: 'co', tier: 'build', is_test: false },
    ],
    spec_email_outbox: [],
    notifications: [],
    spec_communications: [],
    role_permissions: [],
    user_roles: [],
    user_permission_overrides: [],
  });

  const result = await runNonPaymentDisable(db, now);
  assert.equal(result.considered, 0);
});

test('non-payment disable: idempotent — already-non_payment-disabled project does not re-fire', async () => {
  const now = new Date('2026-06-01T17:00:00Z');
  const db = makeFakeSupabase({
    spec_payments: [
      {
        id: 'pay-3',
        spec_project_id: 'proj-3',
        milestone: 'scope_signoff',
        due_date: daysAgoDate(now, 30),
        status: 'overdue',
      },
    ],
    spec_module_entitlements: [
      {
        id: 'ent-3',
        spec_project_id: 'proj-3',
        module_key: 'jobs',
        enabled: false,
        disabled_reason: 'non_payment',
        disabled_at: '2026-05-01T00:00:00Z',
      },
    ],
    spec_projects: [
      { id: 'proj-3', customer_email: 'x@example.com', buyer_user_id: 'u', linked_company_id: 'co', tier: 'build', is_test: false },
    ],
    spec_email_outbox: [],
    notifications: [],
    spec_communications: [],
    role_permissions: [],
    user_roles: [],
    user_permission_overrides: [],
  });

  const result = await runNonPaymentDisable(db, now);
  // Considered yes; fired no.
  assert.equal(result.considered, 1);
  assert.equal(result.fired, 0);
  assert.equal(db.recordedInserts.filter((r) => r.table === 'spec_email_outbox').length, 0);
});

test('non-payment disable: project with no entitlement rows is skipped (pre-scope-signoff)', async () => {
  const now = new Date('2026-06-01T17:00:00Z');
  const db = makeFakeSupabase({
    spec_payments: [
      {
        id: 'pay-4',
        spec_project_id: 'proj-4',
        milestone: 'deposit',
        due_date: daysAgoDate(now, 30),
        status: 'invoiced',
      },
    ],
    spec_module_entitlements: [],
    spec_projects: [
      { id: 'proj-4', customer_email: 'x@example.com', buyer_user_id: 'u', linked_company_id: 'co', tier: 'build', is_test: false },
    ],
    spec_email_outbox: [],
    notifications: [],
    spec_communications: [],
    role_permissions: [],
    user_roles: [],
    user_permission_overrides: [],
  });

  const result = await runNonPaymentDisable(db, now);
  assert.equal(result.fired, 0);
});
