/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Stage C.2 — SPEC webhook integration test against a real Supabase env.
 *
 * Requires:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 *   STRIPE_SECRET_KEY (test-mode sk_test_…)
 *
 * Run with:
 *   pnpm dotenv -e .env.local --                                 \
 *     npx tsx scripts/spec-webhook-integration.ts
 *
 * Pre-conditions in the target DB:
 *   - SPEC Phase 1 migrations applied (spec_projects + spec_acceptance_events
 *     + spec_payments + spec_communications + spec_email_outbox +
 *     stripe_webhook_events + spec_module_entitlements + spec_referrals all
 *     exist).
 *   - OPS Operations company seeded (id = 00000000-0000-0000-0000-00000000000a).
 *   - SPEC Operator role seeded with at least one user.
 *
 * Side effects (cleaned up on success):
 *   - Inserts a spec_projects row marked is_test=true with linked_company_id
 *     pointing to the OPS Operations seed (cleanest path with no foreign
 *     dependencies).
 *   - Runs both the deposit-paid branch and the dispute branch against
 *     constructed Stripe.Event objects.
 *   - Deletes the test rows (cascade) at the end.
 *
 * Exit code 0 on full pass; 1 on any failure.
 */

import { strict as assert } from 'node:assert';
import { createClient } from '@supabase/supabase-js';
import type Stripe from 'stripe';
import {
  handleSpecCheckoutSessionCompleted,
  handleSpecChargeDisputeCreated,
} from '../src/lib/spec/webhook-handlers';

const OPS_OPERATIONS_COMPANY_ID = '00000000-0000-0000-0000-00000000000a';

function assertEnv(name: string): string {
  const v = process.env[name];
  if (!v || v.startsWith('placeholder')) {
    throw new Error(`Missing ${name} — set it in .env.local before running.`);
  }
  return v;
}

interface TestContext {
  db: any; // SupabaseClient — generic-erased to keep this script free of DB-type tracking
  stripe: Stripe;
  specProjectId: string;
  buyerUserId: string;
  paymentIntentId: string;
  eventIds: string[];
}

async function setUp(): Promise<TestContext> {
  const url = assertEnv('NEXT_PUBLIC_SUPABASE_URL');
  const key = assertEnv('SUPABASE_SERVICE_ROLE_KEY');
  const stripeKey = assertEnv('STRIPE_SECRET_KEY');
  if (!stripeKey.startsWith('sk_test_')) {
    throw new Error('STRIPE_SECRET_KEY must be a test-mode key (sk_test_*).');
  }

  const db = createClient(url, key);
  const Stripe = (await import('stripe')).default;
  const stripe = new Stripe(stripeKey);

  // Find a real OPS user to play the buyer role — Jackson, who is already a
  // SPEC operator. The acceptance-event row needs accepted_by_user_id to FK
  // resolve. Use any existing user attached to OPS Operations company.
  const { data: jacksonUser } = await db
    .from('users')
    .select('id')
    .eq('email', 'jack@opsapp.co')
    .maybeSingle();
  const buyerUserId = typeof jacksonUser?.id === 'string' ? jacksonUser.id : '';
  if (!buyerUserId) {
    throw new Error('Could not find jack@opsapp.co user for integration test fixture.');
  }

  // Insert a spec_projects row in awaiting_deposit state.
  const paymentIntentId = `pi_test_integ_${Math.random().toString(36).slice(2, 10)}`;
  const { data: project, error: projErr } = await db
    .from('spec_projects')
    .insert({
      tier: 'build',
      status: 'awaiting_deposit',
      buyer_user_id: buyerUserId,
      account_holder_user_id: buyerUserId,
      linked_company_id: OPS_OPERATIONS_COMPANY_ID,
      customer_email: 'integration-test@opsapp.co',
      billing_address_line1: '100 Test St',
      billing_city: 'Vancouver',
      billing_province: 'BC',
      billing_postal_code: 'V6B 0A1',
      billing_country: 'CA',
      quebec_eligibility_attested_at: new Date().toISOString(),
      quebec_eligibility_payload: {
        no_qc_head_office: true,
        no_qc_operating_address: true,
        no_qc_establishment: true,
        no_material_qc_use: true,
      },
      attribution: { utm_source: 'integration_test', first_touch_at: new Date().toISOString() },
      is_test: true,
    })
    .select('id')
    .single();

  if (projErr || !project) {
    throw new Error(`spec_projects fixture insert failed: ${projErr?.message ?? 'unknown'}`);
  }
  const specProjectId = (project as any).id as string;
  return { db, stripe, specProjectId, buyerUserId, paymentIntentId, eventIds: [] };
}

function makeDepositEvent(ctx: TestContext, opts: { state?: string; country?: string }): Stripe.Event {
  const session = {
    id: `cs_test_integ_${Math.random().toString(36).slice(2, 10)}`,
    object: 'checkout.session',
    livemode: false,
    customer: 'cus_test_integ',
    customer_details: {
      email: 'integration-test@opsapp.co',
      name: 'Integration Test User',
      phone: '+16045550000',
      address: {
        line1: '100 Test St',
        line2: null,
        city: opts.state === 'QC' ? 'Montréal' : 'Vancouver',
        state: opts.state ?? 'BC',
        postal_code: 'V6B 0A1',
        country: opts.country ?? 'CA',
      },
    },
    payment_intent: ctx.paymentIntentId,
    amount_subtotal: 212500,
    amount_total: 212500,
    total_details: { amount_tax: 0 },
    currency: 'cad',
    metadata: {
      type: 'spec_deposit',
      spec_project_id: ctx.specProjectId,
      user_id: ctx.buyerUserId,
      company_id: OPS_OPERATIONS_COMPANY_ID,
      tier: 'build',
      tos_version_hash: 'pending-stage-g-port',
    },
    custom_fields: [],
  } as any;

  const eventId = `evt_test_integ_${Math.random().toString(36).slice(2, 10)}`;
  ctx.eventIds.push(eventId);
  return {
    id: eventId,
    type: 'checkout.session.completed',
    object: 'event',
    api_version: '2024-12-18.acacia',
    created: Math.floor(Date.now() / 1000),
    data: { object: session },
    livemode: false,
    pending_webhooks: 1,
    request: { id: null, idempotency_key: null },
  } as unknown as Stripe.Event;
}

function makeDisputeEvent(ctx: TestContext): Stripe.Event {
  const dispute = {
    id: `dp_test_integ_${Math.random().toString(36).slice(2, 10)}`,
    object: 'dispute',
    amount: 212500,
    charge: 'ch_test_integ',
    currency: 'cad',
    payment_intent: ctx.paymentIntentId,
    reason: 'fraudulent',
    status: 'warning_needs_response',
    livemode: false,
  };
  const eventId = `evt_test_integ_dispute_${Math.random().toString(36).slice(2, 10)}`;
  ctx.eventIds.push(eventId);
  return {
    id: eventId,
    type: 'charge.dispute.created',
    object: 'event',
    api_version: '2024-12-18.acacia',
    created: Math.floor(Date.now() / 1000),
    data: { object: dispute },
    livemode: false,
    pending_webhooks: 1,
    request: { id: null, idempotency_key: null },
  } as unknown as Stripe.Event;
}

async function tearDown(ctx: TestContext): Promise<void> {
  // Cascade delete child rows via spec_projects FK (most tables have
  // on delete cascade). spec_email_outbox cascades too. Communications +
  // entitlements + acceptance events + payments + referrals all cascade.
  await ctx.db.from('spec_blocked_buyers').delete().eq('email', 'integration-test@opsapp.co');
  await ctx.db.from('spec_projects').delete().eq('id', ctx.specProjectId);
  if (ctx.eventIds.length > 0) {
    await ctx.db.from('stripe_webhook_events').delete().in('event_id', ctx.eventIds);
  }
}

async function main(): Promise<void> {
  process.stdout.write('\nSPEC webhook integration test (real Supabase)\n');
  process.stdout.write('────────────────────────────────\n');

  const ctx = await setUp();
  let failed = false;
  try {
    process.stdout.write(`[setup] specProjectId=${ctx.specProjectId} buyer=${ctx.buyerUserId}\n`);

    // ── Test 1: Normal deposit_paid flow ──
    const depositEvent = makeDepositEvent(ctx, { state: 'BC', country: 'CA' });
    const outcome1 = await handleSpecCheckoutSessionCompleted(
      depositEvent,
      depositEvent.data.object as Stripe.Checkout.Session,
      ctx.stripe,
    );
    process.stdout.write(`[deposit] outcome=${JSON.stringify(outcome1)}\n`);
    assert.equal(outcome1.ok, true);
    assert.equal(outcome1.status, 'processed');

    // Verify spec_projects flipped
    const { data: projRow } = await ctx.db
      .from('spec_projects')
      .select('status, deposit_paid_at, tos_version_accepted, tos_accepted_at')
      .eq('id', ctx.specProjectId)
      .single();
    process.stdout.write(`[deposit] spec_projects=${JSON.stringify(projRow)}\n`);
    assert.equal((projRow as any)?.status, 'deposit_paid');
    assert.ok((projRow as any)?.deposit_paid_at, 'deposit_paid_at stamped');
    assert.equal((projRow as any)?.tos_version_accepted, 'pending-stage-g-port');

    // Verify spec_acceptance_events row
    const { data: acceptRows } = await ctx.db
      .from('spec_acceptance_events')
      .select('event_type, accepted_by_user_id, signature_method, payload_hash')
      .eq('spec_project_id', ctx.specProjectId);
    process.stdout.write(`[deposit] spec_acceptance_events=${JSON.stringify(acceptRows)}\n`);
    assert.ok((acceptRows as any[])?.some((r) => r.event_type === 'tos_accepted'));

    // Verify spec_payments row
    const { data: payRows } = await ctx.db
      .from('spec_payments')
      .select('milestone, status, amount_cents, stripe_payment_intent_id')
      .eq('spec_project_id', ctx.specProjectId);
    process.stdout.write(`[deposit] spec_payments=${JSON.stringify(payRows)}\n`);
    assert.ok(
      (payRows as any[])?.some((r) => r.milestone === 'deposit' && r.status === 'paid'),
      'spec_payments deposit row paid',
    );

    // Verify spec_email_outbox row
    const { data: emailRows } = await ctx.db
      .from('spec_email_outbox')
      .select('template_id, recipient_email, status')
      .eq('spec_project_id', ctx.specProjectId);
    process.stdout.write(`[deposit] spec_email_outbox=${JSON.stringify(emailRows)}\n`);
    assert.ok(
      (emailRows as any[])?.some((r) => r.template_id === 'spec.deposit_confirmed'),
      'spec_email_outbox deposit_confirmed row enqueued',
    );

    // Verify notifications
    const { data: notifRows } = await ctx.db
      .from('notifications')
      .select('user_id, company_id, type, persistent')
      .ilike('action_url', `%${ctx.specProjectId}%`);
    process.stdout.write(`[deposit] notifications=${JSON.stringify(notifRows)}\n`);
    assert.ok((notifRows as any[])?.length >= 1, 'notifications dispatched');

    // ── Test 2: Idempotency — replay the same event ──
    const outcome2 = await handleSpecCheckoutSessionCompleted(
      depositEvent,
      depositEvent.data.object as Stripe.Checkout.Session,
      ctx.stripe,
    );
    process.stdout.write(`[idempotency] outcome=${JSON.stringify(outcome2)}\n`);
    assert.equal(outcome2.status, 'duplicate');

    // ── Test 3: Dispute handler ──
    const disputeEvent = makeDisputeEvent(ctx);
    const outcome3 = await handleSpecChargeDisputeCreated(
      disputeEvent,
      disputeEvent.data.object as Stripe.Dispute,
      ctx.stripe,
    );
    process.stdout.write(`[dispute] outcome=${JSON.stringify(outcome3)}\n`);
    assert.equal(outcome3.ok, true);
    assert.equal(outcome3.status, 'processed');

    const { data: postDisputePayments } = await ctx.db
      .from('spec_payments')
      .select('status')
      .eq('spec_project_id', ctx.specProjectId);
    process.stdout.write(`[dispute] spec_payments after=${JSON.stringify(postDisputePayments)}\n`);
    assert.ok(
      (postDisputePayments as any[])?.every((r) => r.status === 'disputed'),
      'all spec_payments flipped to disputed',
    );

    process.stdout.write('\n[result] ALL CHECKS PASSED\n');
  } catch (err) {
    failed = true;
    console.error('\n[result] FAILED:', err instanceof Error ? err.message : err);
  } finally {
    await tearDown(ctx);
    process.stdout.write('[teardown] cleaned up test rows\n');
  }

  process.exit(failed ? 1 : 0);
}

main().catch((err) => {
  console.error('Integration driver crashed:', err);
  process.exit(2);
});
