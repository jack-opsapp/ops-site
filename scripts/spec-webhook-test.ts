/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
/**
 * Stage C.2 — SPEC webhook handler unit tests.
 *
 * Run with:
 *   STRIPE_SECRET_KEY=sk_test_x \
 *   NEXT_PUBLIC_SUPABASE_URL=https://placeholder.supabase.co \
 *   SUPABASE_SERVICE_ROLE_KEY=placeholder \
 *   npx tsx scripts/spec-webhook-test.ts
 *
 * Exercises:
 *   - The Quebec post-Stripe defense predicate (state=QC | country!=CA → true;
 *     state=BC,country=CA → false; null billing → false).
 *   - The full deposit handler against a mock Supabase + Stripe client:
 *       · QC session → refund called + spec_projects cancelled + buyer
 *         block-list insert + email enqueued; deposit_paid never stamped.
 *       · BC session → deposit_paid stamped + tos_accepted event + payment
 *         row + deposit_confirmed email + customer + operator notifications.
 *   - Idempotency: a second invocation with the same event.id returns
 *     `{ ok: true, status: 'duplicate' }` and triggers no mutations.
 *   - The dispute handler against a mock Supabase: SPEC payment match flips
 *     payment.status='disputed', entitlements disabled, communications log
 *     written, operator notification dispatched. Non-SPEC dispute returns
 *     skipped without mutation.
 *
 * Uses Node's built-in `assert/strict` — no test runner required.
 */

import { strict as assert } from 'node:assert';
import type Stripe from 'stripe';
import {
  isQuebecPostStripeLeak,
  handleSpecCheckoutSessionCompleted,
  handleSpecChargeDisputeCreated,
} from '../src/lib/spec/webhook-handlers';

// ─── Mock Supabase client ────────────────────────────────────────────────

interface CallLog {
  table: string;
  op: 'select' | 'insert' | 'update' | 'delete';
  payload?: unknown;
  filters?: Array<{ col: string; val: unknown; kind: string }>;
}

interface MockTableState {
  rows: Record<string, unknown>[];
  // If set, the next .select().maybeSingle() returns this exact row regardless
  // of filters. Useful for asserting handler reads.
  forceSelectRow?: Record<string, unknown> | null;
}

interface MockDbConfig {
  // Pre-seeded select-returns by table — the handler queries these.
  selectReturns?: Record<string, Record<string, unknown> | null>;
  // Pre-seed: events already in stripe_webhook_events (idempotency cache hit).
  duplicateEventIds?: string[];
}

function createMockDb(config: MockDbConfig = {}) {
  const calls: CallLog[] = [];
  const tables: Record<string, MockTableState> = {};

  // Seed selectable rows
  for (const [table, row] of Object.entries(config.selectReturns ?? {})) {
    tables[table] = { rows: row ? [row] : [], forceSelectRow: row };
  }
  if (config.duplicateEventIds && config.duplicateEventIds.length > 0) {
    tables.stripe_webhook_events = {
      rows: config.duplicateEventIds.map((id) => ({ event_id: id })),
      forceSelectRow: { event_id: config.duplicateEventIds[0] },
    };
  }

  function from(table: string): any {
    const state = tables[table] ?? { rows: [] };
    const filters: Array<{ col: string; val: unknown; kind: string }> = [];

    // A builder is a PostgREST-shaped object: it is thenable AND has chainable
    // .eq / .is / .select / .maybeSingle / .single methods. Awaiting it without
    // .maybeSingle/.single returns the rows array (matches real Supabase).
    function makeBuilder(op: 'select' | 'update' | 'insert' = 'select'): any {
      const builder: any = {
        select: (_cols?: string) => builder,
        eq: (col: string, val: unknown) => {
          filters.push({ col, val, kind: 'eq' });
          return builder;
        },
        is: (col: string, val: unknown) => {
          filters.push({ col, val, kind: 'is' });
          return builder;
        },
        maybeSingle: async () => {
          calls.push({ table, op: 'select', filters: [...filters] });
          const found =
            state.forceSelectRow !== undefined ? state.forceSelectRow : state.rows[0] ?? null;
          return { data: found, error: null };
        },
        single: async () => {
          calls.push({ table, op: 'select', filters: [...filters] });
          const found =
            state.forceSelectRow !== undefined ? state.forceSelectRow : state.rows[0] ?? null;
          return { data: found, error: found ? null : { message: 'PGRST116 no rows' } };
        },
        // Thenable — when awaited directly, returns rows array (matches real
        // PostgREST builder when no .single() is chained).
        then: (resolve: (r: { data: unknown[]; error: null }) => void) => {
          if (op === 'select') {
            calls.push({ table, op: 'select', filters: [...filters] });
            const rows = state.forceSelectRow
              ? [state.forceSelectRow]
              : state.rows.length > 0
                ? state.rows
                : state.forceSelectRow === null
                  ? []
                  : [];
            resolve({ data: rows, error: null });
          } else {
            resolve({ data: [], error: null });
          }
        },
      };
      return builder;
    }

    const root: any = makeBuilder('select');

    root.insert = (payload: unknown) => {
      calls.push({ table, op: 'insert', payload, filters: [...filters] });
      return {
        select: () => ({
          single: async () => ({ data: Array.isArray(payload) ? payload[0] : payload, error: null }),
        }),
        then: (resolve: (r: { data: unknown; error: null }) => void) =>
          resolve({ data: payload, error: null }),
      };
    };

    root.update = (payload: unknown) => {
      const updFilters: Array<{ col: string; val: unknown; kind: string }> = [];
      const updBuilder: any = {
        eq: (col: string, val: unknown) => {
          updFilters.push({ col, val, kind: 'eq' });
          return updBuilder;
        },
        then: (resolve: (r: { data: null; error: null }) => void) => {
          calls.push({ table, op: 'update', payload, filters: updFilters });
          resolve({ data: null, error: null });
        },
      };
      return updBuilder;
    };

    return root;
  }

  return {
    from,
    calls,
    // Helper assertions
    countCalls(table: string, op: CallLog['op']): number {
      return calls.filter((c) => c.table === table && c.op === op).length;
    },
    findInsert(table: string): unknown | null {
      const row = calls.find((c) => c.table === table && c.op === 'insert');
      return row?.payload ?? null;
    },
    findUpdate(table: string): unknown | null {
      const row = calls.find((c) => c.table === table && c.op === 'update');
      return row?.payload ?? null;
    },
  };
}

// ─── Mock Stripe client ──────────────────────────────────────────────────

function createMockStripe() {
  const refundCalls: Array<Record<string, unknown>> = [];
  const stripe = {
    refunds: {
      create: async (args: Record<string, unknown>) => {
        refundCalls.push(args);
        return { id: 're_test_' + (refundCalls.length).toString(), object: 'refund' };
      },
    },
  } as unknown as Stripe;
  return { stripe, refundCalls };
}

// ─── Test fixtures ───────────────────────────────────────────────────────

function makeEvent(id: string, type: string, dataObject: unknown): Stripe.Event {
  return {
    id,
    type,
    object: 'event',
    api_version: '2024-12-18.acacia',
    created: Math.floor(Date.now() / 1000),
    data: { object: dataObject as any },
    livemode: false,
    pending_webhooks: 1,
    request: { id: null, idempotency_key: null },
  } as Stripe.Event;
}

function makeDepositSession(opts: {
  state?: string;
  country?: string;
  email?: string;
  amountTotal?: number;
}): Stripe.Checkout.Session {
  return {
    id: 'cs_test_' + Math.random().toString(36).slice(2, 10),
    object: 'checkout.session',
    livemode: false,
    customer: 'cus_test_x',
    customer_details: {
      email: opts.email ?? 'buyer@example.com',
      name: 'Sam Reyes',
      phone: '+16045551234',
      address: {
        line1: '100 Main St',
        line2: null,
        city: opts.state === 'QC' ? 'Montréal' : 'Vancouver',
        state: opts.state ?? 'BC',
        postal_code: 'V6B 0A1',
        country: opts.country ?? 'CA',
      },
      tax_exempt: 'none',
      tax_ids: [],
    },
    payment_intent: 'pi_test_x',
    amount_subtotal: 212500,
    amount_total: opts.amountTotal ?? 212500,
    total_details: { amount_tax: 0, amount_discount: 0, amount_shipping: 0 },
    currency: 'cad',
    metadata: {
      type: 'spec_deposit',
      spec_project_id: '00000000-0000-0000-0000-000000000001',
      user_id: '00000000-0000-0000-0000-000000000010',
      company_id: '00000000-0000-0000-0000-000000000020',
      tier: 'build',
      tos_version_hash: 'pending-stage-g-port',
    },
    custom_fields: [
      {
        key: 'gst_hst_number',
        label: { type: 'custom', custom: 'GST/HST number (optional)' },
        type: 'text',
        optional: true,
        text: { value: '', maximum_length: null, minimum_length: null },
      },
    ],
    consent: { terms_of_service: 'accepted' },
    consent_collection: { terms_of_service: 'required' } as any,
  } as unknown as Stripe.Checkout.Session;
}

function makeDispute(opts: {
  paymentIntent?: string;
  amount?: number;
  reason?: string;
}): Stripe.Dispute {
  return {
    id: 'dp_test_' + Math.random().toString(36).slice(2, 10),
    object: 'dispute',
    amount: opts.amount ?? 212500,
    charge: 'ch_test_x',
    currency: 'cad',
    payment_intent: opts.paymentIntent ?? 'pi_test_x',
    reason: opts.reason ?? 'fraudulent',
    status: 'warning_needs_response',
    livemode: false,
  } as unknown as Stripe.Dispute;
}

// ─── Tests ────────────────────────────────────────────────────────────────

const results: Array<{ name: string; pass: boolean; error?: string }> = [];

async function test(name: string, fn: () => Promise<void>): Promise<void> {
  try {
    await fn();
    results.push({ name, pass: true });
    process.stdout.write(`  PASS  ${name}\n`);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    results.push({ name, pass: false, error: message });
    process.stdout.write(`  FAIL  ${name}\n        ${message}\n`);
  }
}

async function main(): Promise<void> {
  process.stdout.write('\nSPEC webhook handler unit tests\n');
  process.stdout.write('────────────────────────────────\n');

  // ─── isQuebecPostStripeLeak predicate ────────────────────────────────
  await test('isQuebecPostStripeLeak: state=QC → true', async () => {
    assert.equal(isQuebecPostStripeLeak({ state: 'QC', country: 'CA' }), true);
  });
  await test('isQuebecPostStripeLeak: state=qc (lowercase) → true', async () => {
    assert.equal(isQuebecPostStripeLeak({ state: 'qc', country: 'CA' }), true);
  });
  await test('isQuebecPostStripeLeak: state=BC, country=CA → false', async () => {
    assert.equal(isQuebecPostStripeLeak({ state: 'BC', country: 'CA' }), false);
  });
  await test('isQuebecPostStripeLeak: state=BC, country=US → true (non-CA)', async () => {
    assert.equal(isQuebecPostStripeLeak({ state: 'BC', country: 'US' }), true);
  });
  await test('isQuebecPostStripeLeak: state=null, country=CA → false', async () => {
    assert.equal(isQuebecPostStripeLeak({ state: null, country: 'CA' }), false);
  });
  await test('isQuebecPostStripeLeak: undefined billing → false', async () => {
    assert.equal(isQuebecPostStripeLeak(undefined), false);
  });
  await test('isQuebecPostStripeLeak: null billing → false', async () => {
    assert.equal(isQuebecPostStripeLeak(null), false);
  });

  // ─── Idempotency ────────────────────────────────────────────────────
  await test('Deposit handler: duplicate event returns early without mutation', async () => {
    const event = makeEvent('evt_test_dup', 'checkout.session.completed', makeDepositSession({}));
    const db = createMockDb({ duplicateEventIds: ['evt_test_dup'] });
    const { stripe, refundCalls } = createMockStripe();
    const outcome = await handleSpecCheckoutSessionCompleted(
      event,
      event.data.object as Stripe.Checkout.Session,
      stripe,
      { db: db as any },
    );
    assert.equal(outcome.ok, true);
    assert.equal(outcome.status, 'duplicate');
    assert.equal(refundCalls.length, 0);
    assert.equal(db.countCalls('spec_projects', 'update'), 0);
    assert.equal(db.countCalls('spec_acceptance_events', 'insert'), 0);
    assert.equal(db.countCalls('spec_payments', 'insert'), 0);
  });

  // ─── Quebec defense ────────────────────────────────────────────────
  await test('Deposit handler: state=QC fires refund + cancel + block-list + email', async () => {
    const session = makeDepositSession({ state: 'QC', country: 'CA' });
    const event = makeEvent('evt_test_qc', 'checkout.session.completed', session);
    const db = createMockDb({
      selectReturns: {
        // Seed one SPEC operator user so the operator notification dispatch lands.
        user_roles: { user_id: 'op_jackson' },
      },
    });
    const { stripe, refundCalls } = createMockStripe();
    const outcome = await handleSpecCheckoutSessionCompleted(
      event,
      session,
      stripe,
      { db: db as any },
    );
    assert.equal(outcome.ok, true);
    assert.equal(outcome.status, 'processed');
    // Refund called with reason + metadata
    assert.equal(refundCalls.length, 1);
    assert.equal(refundCalls[0].payment_intent, 'pi_test_x');
    assert.equal(refundCalls[0].reason, 'requested_by_customer');
    assert.deepEqual((refundCalls[0].metadata as any).reversal_reason, 'spec_quebec_post_stripe_leak');
    // spec_projects updated to cancelled
    const projUpdate = db.findUpdate('spec_projects') as Record<string, unknown> | null;
    assert.ok(projUpdate, 'spec_projects update should have fired');
    assert.equal(projUpdate?.status, 'cancelled');
    assert.equal(projUpdate?.cancellation_reason, 'quebec_billing_at_stripe');
    // Block-list insert
    const blockInsert = db.findInsert('spec_blocked_buyers') as Record<string, unknown> | null;
    assert.ok(blockInsert, 'spec_blocked_buyers insert should have fired');
    assert.equal(blockInsert?.blocked_reason, 'quebec_misrepresented_billing_address_post_stripe');
    // deposit_paid_at NEVER stamped — verify by checking no spec_acceptance_events / spec_payments insert
    assert.equal(db.countCalls('spec_acceptance_events', 'insert'), 0);
    assert.equal(db.countCalls('spec_payments', 'insert'), 0);
    // Operator notification fired through my injected db (one row per operator)
    assert.ok(
      db.calls.some((c) => c.table === 'notifications' && c.op === 'insert'),
      'notifications insert for QC leak should have fired',
    );
    // spec_communications system audit row written through my mock
    const commInsert = db.findInsert('spec_communications') as Record<string, unknown> | null;
    assert.ok(commInsert, 'spec_communications insert fired');
    assert.equal(commInsert?.channel, 'system');
    // stripe_webhook_events row recorded at end
    assert.equal(db.countCalls('stripe_webhook_events', 'insert'), 1);
    // The customer email (spec_email_outbox) + conversion event (conversion_event_outbox)
    // go through C.1's queueSpecEmail / sendConversionEvent which use the real
    // supabase-admin singleton — verified in the integration test, not here.
  });

  await test('Deposit handler: country=US (non-CA) fires Quebec defense', async () => {
    const session = makeDepositSession({ state: 'BC', country: 'US' });
    const event = makeEvent('evt_test_us', 'checkout.session.completed', session);
    const db = createMockDb({});
    const { stripe, refundCalls } = createMockStripe();
    await handleSpecCheckoutSessionCompleted(event, session, stripe, { db: db as any });
    assert.equal(refundCalls.length, 1);
    const projUpdate = db.findUpdate('spec_projects') as Record<string, unknown> | null;
    assert.equal(projUpdate?.status, 'cancelled');
  });

  // ─── Normal deposit_paid flow ──────────────────────────────────────
  await test('Deposit handler: state=BC, country=CA fires normal deposit_paid flow', async () => {
    const session = makeDepositSession({ state: 'BC', country: 'CA' });
    const event = makeEvent('evt_test_bc', 'checkout.session.completed', session);
    const db = createMockDb({
      selectReturns: {
        // For the company stripe_customer_id back-fill check
        companies: { id: '00000000-0000-0000-0000-000000000020', stripe_customer_id: null, name: 'CanPro Deck and Rail' },
        // For the referrer check + intake URL derivation
        spec_projects: { id: '00000000-0000-0000-0000-000000000001', referrer_email: null },
        // For the operator notification dispatch (one operator user)
        user_roles: { user_id: 'op_jackson' },
        users: { first_name: 'Sam', last_name: 'Reyes', email: 'buyer@example.com' },
      },
    });
    const { stripe, refundCalls } = createMockStripe();
    const outcome = await handleSpecCheckoutSessionCompleted(
      event,
      session,
      stripe,
      { db: db as any },
    );
    assert.equal(outcome.ok, true);
    assert.equal(outcome.status, 'processed');
    // No refund called on the BC happy path
    assert.equal(refundCalls.length, 0);
    // spec_projects updated to deposit_paid
    const projUpdate = db.findUpdate('spec_projects') as Record<string, unknown> | null;
    assert.ok(projUpdate, 'spec_projects update fired');
    assert.equal(projUpdate?.status, 'deposit_paid');
    assert.ok(projUpdate?.deposit_paid_at, 'deposit_paid_at stamped');
    assert.equal(projUpdate?.tos_version_accepted, 'pending-stage-g-port');
    assert.ok(projUpdate?.tos_accepted_at, 'tos_accepted_at stamped');
    // tos_accepted event row
    const acceptInsert = db.findInsert('spec_acceptance_events') as Record<string, unknown> | null;
    assert.ok(acceptInsert, 'spec_acceptance_events insert fired');
    assert.equal(acceptInsert?.event_type, 'tos_accepted');
    assert.equal(acceptInsert?.signature_method, 'click_in_app');
    assert.equal(acceptInsert?.payload_hash, 'pending-stage-g-port');
    // P1 payment row
    const payInsert = db.findInsert('spec_payments') as Record<string, unknown> | null;
    assert.ok(payInsert, 'spec_payments insert fired');
    assert.equal(payInsert?.milestone, 'deposit');
    assert.equal(payInsert?.status, 'paid');
    assert.equal(payInsert?.amount_cents, 212500);
    assert.equal(payInsert?.stripe_payment_intent_id, 'pi_test_x');
    // Customer + operator notifications fired through my injected db
    const notificationInserts = db.calls.filter(
      (c) => c.table === 'notifications' && c.op === 'insert',
    );
    assert.ok(notificationInserts.length >= 1, 'notifications insert fired for deposit_paid');
    // spec_communications audit row
    const commInsert = db.findInsert('spec_communications') as Record<string, unknown> | null;
    assert.ok(commInsert, 'spec_communications insert fired');
    // stripe_webhook_events recorded
    assert.equal(db.countCalls('stripe_webhook_events', 'insert'), 1);
    // deposit_confirmed email + stripe_checkout_completed conversion event go
    // through C.1's queueSpecEmail / sendConversionEvent helpers (real
    // supabase-admin singleton) — verified in integration test, not here.
  });

  await test('Deposit handler: missing metadata returns error + records event', async () => {
    const session = makeDepositSession({});
    session.metadata = { type: 'spec_deposit' };
    const event = makeEvent('evt_test_bad', 'checkout.session.completed', session);
    const db = createMockDb({});
    const { stripe } = createMockStripe();
    const outcome = await handleSpecCheckoutSessionCompleted(
      event,
      session,
      stripe,
      { db: db as any },
    );
    assert.equal(outcome.ok, false);
    assert.equal(outcome.status, 'error');
    // Event recorded so Stripe stops retrying a malformed event
    assert.equal(db.countCalls('stripe_webhook_events', 'insert'), 1);
    // No project mutation
    assert.equal(db.countCalls('spec_projects', 'update'), 0);
  });

  // ─── Dispute handler ────────────────────────────────────────────────
  await test('Dispute handler: matching SPEC payment flips status + disables entitlements + dispatches', async () => {
    const dispute = makeDispute({});
    const event = makeEvent('evt_test_dispute', 'charge.dispute.created', dispute);
    const db = createMockDb({
      selectReturns: {
        spec_payments: {
          id: '00000000-0000-0000-0000-000000000100',
          spec_project_id: '00000000-0000-0000-0000-000000000001',
          stripe_payment_intent_id: 'pi_test_x',
        },
        spec_projects: {
          tier: 'build',
          customer_email: 'buyer@example.com',
          customer_name: 'Sam Reyes',
          buyer_user_id: '00000000-0000-0000-0000-000000000010',
          linked_company_id: '00000000-0000-0000-0000-000000000020',
        },
        companies: { name: 'CanPro Deck and Rail' },
        user_roles: { user_id: 'op_jackson' },
      },
    });
    const { stripe } = createMockStripe();
    const outcome = await handleSpecChargeDisputeCreated(event, dispute, stripe, { db: db as any });
    assert.equal(outcome.ok, true);
    assert.equal(outcome.status, 'processed');
    // payment status flipped to disputed
    const payUpdate = db.findUpdate('spec_payments') as Record<string, unknown> | null;
    assert.ok(payUpdate, 'spec_payments update fired');
    assert.equal(payUpdate?.status, 'disputed');
    // entitlements disabled for the engagement
    const entUpdate = db.findUpdate('spec_module_entitlements') as Record<string, unknown> | null;
    assert.ok(entUpdate, 'spec_module_entitlements update fired');
    assert.equal(entUpdate?.enabled, false);
    assert.equal(entUpdate?.disabled_reason, 'dispute');
    // communications row
    const commInsert = db.findInsert('spec_communications') as Record<string, unknown> | null;
    assert.ok(commInsert, 'spec_communications insert fired');
    assert.equal((commInsert as any).channel, 'system');
    // Operator + customer notifications fired through my injected db
    const notificationInserts = db.calls.filter(
      (c) => c.table === 'notifications' && c.op === 'insert',
    );
    assert.ok(notificationInserts.length >= 1, 'notifications insert fired for dispute');
    // stripe_webhook_events recorded
    assert.equal(db.countCalls('stripe_webhook_events', 'insert'), 1);
    // Direct dispute-alert email to Jackson goes through C.1's queueSpecEmail
    // (real supabase-admin singleton) — verified in integration test, not here.
  });

  await test('Dispute handler: no SPEC payment match returns skipped', async () => {
    const dispute = makeDispute({ paymentIntent: 'pi_unrelated' });
    const event = makeEvent('evt_test_dispute_skip', 'charge.dispute.created', dispute);
    const db = createMockDb({
      selectReturns: {
        spec_payments: null,
      },
    });
    const { stripe } = createMockStripe();
    const outcome = await handleSpecChargeDisputeCreated(event, dispute, stripe, { db: db as any });
    assert.equal(outcome.ok, true);
    assert.equal(outcome.status, 'skipped');
    // No SPEC-side mutations
    assert.equal(db.countCalls('spec_payments', 'update'), 0);
    assert.equal(db.countCalls('spec_module_entitlements', 'update'), 0);
  });

  await test('Dispute handler: duplicate event returns early without mutation', async () => {
    const dispute = makeDispute({});
    const event = makeEvent('evt_test_dispute_dup', 'charge.dispute.created', dispute);
    const db = createMockDb({
      duplicateEventIds: ['evt_test_dispute_dup'],
      selectReturns: {
        spec_payments: {
          id: 'p1',
          spec_project_id: 'sp1',
          stripe_payment_intent_id: 'pi_test_x',
        },
      },
    });
    const { stripe } = createMockStripe();
    const outcome = await handleSpecChargeDisputeCreated(event, dispute, stripe, { db: db as any });
    assert.equal(outcome.ok, true);
    assert.equal(outcome.status, 'duplicate');
    assert.equal(db.countCalls('spec_payments', 'update'), 0);
    assert.equal(db.countCalls('spec_module_entitlements', 'update'), 0);
  });

  // ─── Summary ────────────────────────────────────────────────────────
  const passCount = results.filter((r) => r.pass).length;
  const failCount = results.filter((r) => !r.pass).length;
  process.stdout.write('\n────────────────────────────────\n');
  process.stdout.write(`Results: ${passCount}/${results.length} passed`);
  if (failCount > 0) process.stdout.write(` (${failCount} failed)`);
  process.stdout.write('\n');
  process.exit(failCount === 0 ? 0 : 1);
}

main().catch((err) => {
  console.error('Test driver crashed:', err);
  process.exit(2);
});
