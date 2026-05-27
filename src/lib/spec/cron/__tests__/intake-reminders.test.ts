import { strict as assert } from 'node:assert';
import { test } from 'node:test';

import { runIntakeReminders } from '../intake-reminders';
import { makeFakeSupabase } from './fake-supabase';

function daysAgo(now: Date, days: number): string {
  return new Date(now.getTime() - days * 86_400_000).toISOString();
}

test('intake reminders: D14 stage 1 fires once and stamps counters', async () => {
  const now = new Date('2026-06-01T17:00:00Z');
  const db = makeFakeSupabase({
    spec_projects: [
      {
        id: 'proj-1',
        status: 'deposit_paid',
        intake_completed_at: null,
        deposit_paid_at: daysAgo(now, 15), // 15d > 14d threshold
        intake_reminder_count: 0,
        customer_email: 'bob@example.com',
        buyer_user_id: 'user-bob',
        linked_company_id: 'co-1',
        is_test: false,
      },
    ],
    spec_email_outbox: [],
    spec_communications: [],
  });

  const result = await runIntakeReminders(db, now);

  assert.equal(result.fired, 1);
  assert.equal(result.errored, 0);

  const outbox = db.recordedInserts.find((r) => r.table === 'spec_email_outbox');
  assert.ok(outbox, 'email outbox row inserted');
  assert.equal(outbox!.rows[0].template_id, 'spec.intake_reminder_1');
  assert.equal(outbox!.rows[0].recipient_email, 'bob@example.com');
  assert.equal(outbox!.rows[0].spec_project_id, 'proj-1');

  const project = db.rows.spec_projects[0];
  assert.equal(project.intake_reminder_count, 1);
  assert.ok(project.last_intake_reminder_at, 'last_intake_reminder_at stamped');

  // Run again with the same now → should not re-fire.
  const second = await runIntakeReminders(db, now);
  assert.equal(second.fired, 0);
});

test('intake reminders: stage 2 fires at D21 after stage 1 already at count=1', async () => {
  const now = new Date('2026-06-01T17:00:00Z');
  const db = makeFakeSupabase({
    spec_projects: [
      {
        id: 'proj-2',
        status: 'deposit_paid',
        intake_completed_at: null,
        deposit_paid_at: daysAgo(now, 22), // 22d > 21d threshold
        intake_reminder_count: 1,
        customer_email: 'alice@example.com',
        buyer_user_id: 'user-alice',
        linked_company_id: 'co-2',
        is_test: false,
      },
    ],
    spec_email_outbox: [],
    spec_communications: [],
  });

  const result = await runIntakeReminders(db, now);

  assert.equal(result.fired, 1);
  const outbox = db.recordedInserts.find((r) => r.table === 'spec_email_outbox');
  assert.equal(outbox!.rows[0].template_id, 'spec.intake_reminder_2');
  assert.equal(db.rows.spec_projects[0].intake_reminder_count, 2);
});

test('intake reminders: does not fire before D14', async () => {
  const now = new Date('2026-06-01T17:00:00Z');
  const db = makeFakeSupabase({
    spec_projects: [
      {
        id: 'proj-3',
        status: 'deposit_paid',
        intake_completed_at: null,
        deposit_paid_at: daysAgo(now, 13), // 13d < 14d threshold
        intake_reminder_count: 0,
        customer_email: 'cat@example.com',
        buyer_user_id: 'user-cat',
        linked_company_id: 'co-3',
        is_test: false,
      },
    ],
    spec_email_outbox: [],
    spec_communications: [],
  });

  const result = await runIntakeReminders(db, now);
  assert.equal(result.fired, 0);
  assert.equal(db.recordedInserts.filter((r) => r.table === 'spec_email_outbox').length, 0);
});

test('intake reminders: skips rows already at count=3', async () => {
  const now = new Date('2026-06-01T17:00:00Z');
  const db = makeFakeSupabase({
    spec_projects: [
      {
        id: 'proj-4',
        status: 'deposit_paid',
        intake_completed_at: null,
        deposit_paid_at: daysAgo(now, 90),
        intake_reminder_count: 3,
        customer_email: 'dan@example.com',
        buyer_user_id: 'user-dan',
        linked_company_id: 'co-4',
        is_test: false,
      },
    ],
    spec_email_outbox: [],
    spec_communications: [],
  });

  const result = await runIntakeReminders(db, now);
  assert.equal(result.considered, 0);
  assert.equal(result.fired, 0);
});

test('intake reminders: ignores rows where intake_completed_at is set', async () => {
  const now = new Date('2026-06-01T17:00:00Z');
  const db = makeFakeSupabase({
    spec_projects: [
      {
        id: 'proj-5',
        status: 'deposit_paid',
        intake_completed_at: daysAgo(now, 1),
        deposit_paid_at: daysAgo(now, 30),
        intake_reminder_count: 0,
        customer_email: 'ed@example.com',
        buyer_user_id: 'user-ed',
        linked_company_id: 'co-5',
        is_test: false,
      },
    ],
    spec_email_outbox: [],
    spec_communications: [],
  });

  const result = await runIntakeReminders(db, now);
  assert.equal(result.considered, 0);
  assert.equal(result.fired, 0);
});
