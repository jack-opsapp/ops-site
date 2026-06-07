/**
 * SPEC Stripe-webhook branches — server-only, service-role.
 *
 * Implements two event branches dispatched from the consolidated
 * `/api/shop/webhook` route:
 *
 *   1. `checkout.session.completed` with `metadata.type === 'spec_deposit'`
 *      → deposit_paid flow (with the locked Quebec post-Stripe defense
 *        firing FIRST, before any deposit_paid mutation).
 *   2. `charge.dispute.created` that resolves to a SPEC payment
 *      → dispute side-effects (entitlements off, communications log,
 *        operator notification, direct email to the founder).
 *
 * Idempotency: every branch consults `stripe_webhook_events` for the
 * incoming `event.id`; if a row already exists, the branch returns
 * `{ ok: true, status: 'duplicate' }` without mutating state. The
 * INSERT into `stripe_webhook_events` happens at the END of a successful
 * branch so a mid-handler failure still gets retried by Stripe.
 *
 * Source contracts (locked, do not paraphrase):
 *   - SPEC/07_ROLLOUT.md § 5 (Stripe webhook handler)
 *   - SPEC/07_ROLLOUT.md § Gate resolutions / SPEC-STRIPE-ADDRESS-TAX-SPIKE
 *   - SPEC/07_ROLLOUT.md § Gate resolutions / SPEC-NOTIFICATION-RAIL-DEPRECATED
 *   - SPEC/02_DATA_MODEL.md (every column / enum / check-constraint name)
 */

import type Stripe from 'stripe';
import type { SupabaseClient } from '@supabase/supabase-js';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { queueSpecEmail } from '@/lib/spec/email-outbox';
import { sendConversionEvent } from '@/lib/spec/conversion-events';
import { isValidTier, type SpecTier } from '@/lib/spec/pricing';
import type { OpsAttribution } from '@/lib/spec/attribution';
import {
  dispatchSpecCustomerNotification,
  dispatchSpecOperatorNotification,
} from '@/lib/spec/notifications';

export type SpecWebhookHandlerOutcome =
  | { ok: true; status: 'processed' | 'duplicate' | 'skipped'; specProjectId?: string }
  | { ok: false; status: 'error'; error: string };

export interface SpecHandlerOptions {
  /** Override the service-role Supabase client (testing only). */
  db?: SupabaseClient;
}

/**
 * Pure predicate — returns true when the Stripe customer_details.address
 * indicates a Quebec or non-Canadian billing address. The webhook MUST
 * defend against this even when the pre-Stripe form (canonical block) was
 * passed — Stripe allows the customer to edit the billing form on the
 * hosted Checkout page. See SPEC-STRIPE-ADDRESS-TAX-SPIKE.
 */
export function isQuebecPostStripeLeak(
  billing: Stripe.Address | { state?: string | null; country?: string | null } | null | undefined,
): boolean {
  if (!billing) return false;
  const state = typeof billing.state === 'string' ? billing.state.toUpperCase() : null;
  const country = typeof billing.country === 'string' ? billing.country.toUpperCase() : null;
  if (state === 'QC') return true;
  if (country && country !== 'CA') return true;
  return false;
}

interface SpecDepositMetadata {
  type: 'spec_deposit' | 'tailored_deposit';
  spec_project_id?: string;
  user_id?: string;
  company_id?: string;
  tier?: string;
  tos_version_hash?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  gclid?: string;
  fbclid?: string;
  landing_url?: string;
  first_touch_at?: string;
}

const QC_BLOCK_TEMPLATE_ID = 'spec.quebec_rejected_post_stripe';
const DEPOSIT_CONFIRMED_TEMPLATE_ID = 'spec.deposit_confirmed';
const SUPPORT_EMAIL = 'jack@opsapp.co';

/** ISO date formatter — locale-stable string the email templates expect. */
function formatStripeTimestamp(unixSeconds: number | null | undefined): string {
  const date = unixSeconds ? new Date(unixSeconds * 1000) : new Date();
  const dateStr = date.toLocaleDateString('en-US', {
    timeZone: 'America/Vancouver',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const timeStr = date.toLocaleTimeString('en-US', {
    timeZone: 'America/Vancouver',
    hour: 'numeric',
    minute: '2-digit',
    timeZoneName: 'short',
  });
  return `${dateStr} at ${timeStr}`;
}

function formatAmountCents(cents: number, currency = 'CAD'): string {
  const formatted = (cents / 100).toLocaleString('en-CA', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `$${formatted} ${currency.toUpperCase()}`;
}

/** Capitalize tier for the SendGrid template ("setup" → "Setup"). */
function tierDisplayLabel(tier: SpecTier): 'Setup' | 'Build' | 'Enterprise' {
  switch (tier) {
    case 'setup':
      return 'Setup';
    case 'build':
      return 'Build';
    case 'enterprise':
      return 'Enterprise';
  }
}

function attributionFromMetadata(metadata: Partial<SpecDepositMetadata>): OpsAttribution {
  const out: OpsAttribution = {};
  for (const key of [
    'utm_source',
    'utm_medium',
    'utm_campaign',
    'utm_content',
    'utm_term',
    'gclid',
    'fbclid',
    'landing_url',
    'first_touch_at',
  ] as const) {
    const value = metadata[key];
    if (typeof value === 'string' && value.trim()) out[key] = value.trim();
  }
  return out;
}

/**
 * Atomic idempotency check against `stripe_webhook_events`. Returns true
 * when the event was already processed (caller should bail) or false when
 * the caller should proceed. Never throws.
 */
async function isDuplicateEvent(
  db: SupabaseClient,
  eventId: string,
): Promise<boolean> {
  const { data } = await db
    .from('stripe_webhook_events')
    .select('event_id')
    .eq('event_id', eventId)
    .maybeSingle();
  return Boolean(data);
}

/**
 * Record the event as processed. Called at the END of a successful branch
 * so a mid-handler failure leaves the row absent and Stripe re-delivers.
 */
async function recordEventProcessed(
  db: SupabaseClient,
  eventId: string,
  eventType: string,
): Promise<void> {
  const { error } = await db.from('stripe_webhook_events').insert({
    event_id: eventId,
    event_type: eventType,
  });
  if (error) {
    // 23505 (unique violation) is benign — a concurrent retry won the race.
    // Anything else is logged but does not invalidate the work just done.
    if (error.code !== '23505') {
      console.error('[SPEC webhook] stripe_webhook_events insert failed', error);
    }
  }
}

// ─── checkout.session.completed (metadata.type === 'spec_deposit') ─────────

export async function handleSpecCheckoutSessionCompleted(
  event: Stripe.Event,
  session: Stripe.Checkout.Session,
  stripe: Stripe,
  options: SpecHandlerOptions = {},
): Promise<SpecWebhookHandlerOutcome> {
  const db = options.db ?? getSupabaseAdmin();

  // ── 1. Idempotency ────────────────────────────────────────────────────
  if (await isDuplicateEvent(db, event.id)) {
    return { ok: true, status: 'duplicate' };
  }

  const metadata = (session.metadata ?? {}) as Partial<SpecDepositMetadata>;
  const specProjectId = metadata.spec_project_id ?? '';
  const userId = metadata.user_id ?? '';
  const companyId = metadata.company_id ?? '';
  const tierRaw = metadata.tier;
  const tosVersionHash = metadata.tos_version_hash ?? '';

  if (!specProjectId || !userId || !companyId || !isValidTier(tierRaw)) {
    console.error('[SPEC webhook] missing required metadata on session', {
      sessionId: session.id,
      metadata,
    });
    // Record so Stripe doesn't retry forever on malformed events from our own API.
    await recordEventProcessed(db, event.id, event.type);
    return { ok: false, status: 'error', error: 'missing_metadata' };
  }

  const tier: SpecTier = tierRaw;

  // ── 2. Quebec post-Stripe defense — FIRST, before any deposit_paid mutation
  if (isQuebecPostStripeLeak(session.customer_details?.address)) {
    await handleQuebecPostStripeLeak({
      db,
      stripe,
      session,
      specProjectId,
      userId,
      companyId,
      tier,
    });
    await recordEventProcessed(db, event.id, event.type);
    return { ok: true, status: 'processed', specProjectId };
  }

  // ── 3. Normal deposit_paid flow ───────────────────────────────────────
  await handleNormalDepositPaid({
    db,
    session,
    specProjectId,
    userId,
    companyId,
    tier,
    tosVersionHash,
    attribution: attributionFromMetadata(metadata),
  });

  await recordEventProcessed(db, event.id, event.type);
  return { ok: true, status: 'processed', specProjectId };
}

// ─── Quebec post-Stripe defense branch ─────────────────────────────────────

interface QuebecLeakArgs {
  db: SupabaseClient;
  stripe: Stripe;
  session: Stripe.Checkout.Session;
  specProjectId: string;
  userId: string;
  companyId: string;
  tier: SpecTier;
}

async function handleQuebecPostStripeLeak(args: QuebecLeakArgs): Promise<void> {
  const { db, stripe, session, specProjectId, userId, companyId, tier } = args;
  const paymentIntentId =
    typeof session.payment_intent === 'string'
      ? session.payment_intent
      : session.payment_intent?.id ?? null;
  const customerEmail = (session.customer_details?.email ?? '').trim().toLowerCase();
  const stripeCustomerId =
    typeof session.customer === 'string' ? session.customer : session.customer?.id ?? null;
  const amountTotal = session.amount_total ?? 0;

  // ── 1. Refund the captured payment (Stripe Refunds API). Retry once on
  //       transient API failure — never leave the row half-state.
  let refundId: string | null = null;
  let refundFailed = false;
  if (paymentIntentId) {
    try {
      const refund = await stripe.refunds.create({
        payment_intent: paymentIntentId,
        reason: 'requested_by_customer',
        metadata: {
          reversal_reason: 'spec_quebec_post_stripe_leak',
          spec_project_id: specProjectId,
        },
      });
      refundId = refund.id;
    } catch (err) {
      console.error('[SPEC webhook] Quebec refund first attempt failed; retrying', err);
      try {
        const retry = await stripe.refunds.create({
          payment_intent: paymentIntentId,
          reason: 'requested_by_customer',
          metadata: {
            reversal_reason: 'spec_quebec_post_stripe_leak',
            spec_project_id: specProjectId,
            retry: 'true',
          },
        });
        refundId = retry.id;
      } catch (retryErr) {
        refundFailed = true;
        console.error('[SPEC webhook] Quebec refund retry failed — manual intervention required', retryErr);
      }
    }
  } else {
    refundFailed = true;
    console.error('[SPEC webhook] Quebec leak detected with no payment_intent on session', {
      sessionId: session.id,
    });
  }

  // ── 2. Cancel the spec_projects row. Quebec leak NEVER stamps deposit_paid_at.
  const { error: projectErr } = await db
    .from('spec_projects')
    .update({
      status: 'cancelled',
      cancellation_reason: 'quebec_billing_at_stripe',
      cancelled_at: new Date().toISOString(),
    })
    .eq('id', specProjectId);
  if (projectErr) {
    console.error('[SPEC webhook] spec_projects cancel update failed', projectErr);
  }

  // ── 3. Insert into spec_blocked_buyers (citext column handles case).
  if (customerEmail) {
    const { error: blockErr } = await db.from('spec_blocked_buyers').insert({
      email: customerEmail,
      stripe_customer_id: stripeCustomerId,
      blocked_reason: 'quebec_misrepresented_billing_address_post_stripe',
      blocked_by_user_id: null,
    });
    if (blockErr && blockErr.code !== '23505') {
      // 23505 = unique violation; the partial index allows one active block per email.
      console.error('[SPEC webhook] spec_blocked_buyers insert failed', blockErr);
    }
  }

  // ── 4. Customer email (spec.quebec_rejected_post_stripe).
  if (customerEmail) {
    const refundReceiptUrl = refundId
      ? `https://dashboard.stripe.com/${session.livemode ? '' : 'test/'}refunds/${refundId}`
      : '';
    await queueSpecEmail({
      templateId: QC_BLOCK_TEMPLATE_ID,
      recipientEmail: customerEmail,
      recipientUserId: userId || null,
      specProjectId,
      isTest: !session.livemode,
      payload: {
        buyerName: deriveDisplayName(session.customer_details?.name, customerEmail),
        amountRefundedFormatted: formatAmountCents(amountTotal, session.currency ?? 'CAD'),
        refundedAtFormatted: formatStripeTimestamp(Math.floor(Date.now() / 1000)),
        stripeRefundReceiptUrl: refundReceiptUrl,
      },
    });
  }

  // ── 5. Persistent operator notification — "Quebec leak refunded".
  const operatorSubtitle = refundFailed
    ? 'REFUND FAILED — MANUAL ACTION REQUIRED'
    : 'Refund issued, buyer blocked';
  await dispatchSpecOperatorNotification(
    {
      type: 'spec_quebec_leak_refunded',
      title: `SPEC QC LEAK — ${tier.toUpperCase()}`,
      body: `${customerEmail || 'unknown buyer'} landed at QC post-Stripe. ${operatorSubtitle}.`,
      persistent: true,
      specProjectId,
    },
    { db },
  );

  // ── 6. Internal-only event — NEVER sent to ad platforms. The outbox helper
  //       writes the row but the dispatcher skips ad-platform sends.
  await sendConversionEvent('quebec_rejected', {
    user_id: userId,
    company_id: companyId,
    tier,
    spec_project_id: specProjectId,
    email: customerEmail || undefined,
    rejection_code: 'quebec_post_stripe_leak',
    value_cents: amountTotal,
    currency: (session.currency ?? 'CAD').toUpperCase(),
  });

  // ── 7. spec_communications system row for audit trail.
  await db.from('spec_communications').insert({
    spec_project_id: specProjectId,
    direction: 'inbound',
    channel: 'system',
    summary: 'Quebec billing detected post-Stripe; full refund issued',
    body: JSON.stringify({
      session_id: session.id,
      payment_intent: paymentIntentId,
      refund_id: refundId,
      billing_state: args.session.customer_details?.address?.state ?? null,
      billing_country: args.session.customer_details?.address?.country ?? null,
      refund_failed: refundFailed,
    }),
  });
}

// ─── Normal deposit_paid flow ──────────────────────────────────────────────

interface DepositPaidArgs {
  db: SupabaseClient;
  session: Stripe.Checkout.Session;
  specProjectId: string;
  userId: string;
  companyId: string;
  tier: SpecTier;
  tosVersionHash: string;
  attribution: OpsAttribution;
}

async function handleNormalDepositPaid(args: DepositPaidArgs): Promise<void> {
  const { db, session, specProjectId, userId, companyId, tier, tosVersionHash, attribution } = args;
  const nowIso = new Date().toISOString();
  const paymentIntentId =
    typeof session.payment_intent === 'string'
      ? session.payment_intent
      : session.payment_intent?.id ?? null;
  const stripeCustomerId =
    typeof session.customer === 'string' ? session.customer : session.customer?.id ?? null;
  const amountTotal = session.amount_total ?? 0;
  const taxAmount = session.total_details?.amount_tax ?? 0;
  const amountSubtotal = session.amount_subtotal ?? Math.max(0, amountTotal - taxAmount);
  const phone = session.customer_details?.phone ?? null;
  const customerName = session.customer_details?.name ?? null;
  const customerEmail = (session.customer_details?.email ?? '').trim().toLowerCase();

  // ── 1. Extract GST/HST from custom_fields (text field, optional).
  let gstNumber: string | null = null;
  for (const field of session.custom_fields ?? []) {
    if (field.key === 'gst_hst_number') {
      const value = field.text?.value?.trim();
      if (value && value.length > 0) gstNumber = value;
      break;
    }
  }

  // ── 2. tos_accepted_ip — Stripe does not expose the customer's IP on the
  //       Session object. The hosted Checkout page does not propagate it
  //       through the webhook payload. We store null and document.
  const tosAcceptedIp: string | null = null;
  const userAgent: string | null = null;

  // ── 3. Flip spec_projects to deposit_paid. The CHECK constraint requires
  //       tos_version_accepted + tos_accepted_at once the row leaves the
  //       pre-deposit states.
  const projectUpdate: Record<string, unknown> = {
    status: 'deposit_paid',
    deposit_paid_at: nowIso,
    tos_version_accepted: tosVersionHash,
    tos_accepted_at: nowIso,
    tos_accepted_ip: tosAcceptedIp,
    stripe_customer_id: stripeCustomerId,
  };
  if (customerName) projectUpdate.customer_name = customerName;
  if (phone) projectUpdate.customer_phone = phone;
  if (gstNumber) projectUpdate.customer_gst_number = gstNumber;

  const { error: projectErr } = await db
    .from('spec_projects')
    .update(projectUpdate)
    .eq('id', specProjectId);
  if (projectErr) {
    console.error('[SPEC webhook] spec_projects deposit_paid update failed', projectErr);
  }

  // ── 4. Companies stripe_customer_id back-fill.
  if (stripeCustomerId) {
    const { data: companyRow } = await db
      .from('companies')
      .select('stripe_customer_id')
      .eq('id', companyId)
      .maybeSingle();
    if (companyRow && !companyRow.stripe_customer_id) {
      await db
        .from('companies')
        .update({ stripe_customer_id: stripeCustomerId })
        .eq('id', companyId);
    }
  }

  // ── 5. Acceptance event row (tos_accepted). For Path B, owner_purchase_approved
  //       was already inserted at owner-approval time — this is the second of two.
  //       The signature_method check constraint allows 'click_in_app','docusign','email_reply'
  //       — we use 'click_in_app' (Stripe consent_collection is a click in a hosted
  //       Stripe-rendered page) and pin the receipt as the evidence URL.
  const stripeReceiptUrl = paymentIntentId
    ? `https://dashboard.stripe.com/${session.livemode ? '' : 'test/'}payments/${paymentIntentId}`
    : null;
  await db.from('spec_acceptance_events').insert({
    spec_project_id: specProjectId,
    event_type: 'tos_accepted',
    accepted_by_user_id: userId,
    accepted_at: nowIso,
    accepted_ip: tosAcceptedIp,
    accepted_user_agent: userAgent,
    signature_method: 'click_in_app',
    signature_evidence_url: stripeReceiptUrl,
    payload_hash: tosVersionHash,
    is_test: !session.livemode,
  });

  // ── 6. spec_payments row (deposit milestone, paid).
  const chargeId = await resolveLatestChargeId(session, paymentIntentId);
  await db.from('spec_payments').insert({
    spec_project_id: specProjectId,
    milestone: 'deposit',
    stripe_payment_intent_id: paymentIntentId,
    amount_cents: amountSubtotal,
    tax_cents: taxAmount,
    total_cents: amountTotal,
    status: 'paid',
    paid_at: nowIso,
    is_test: !session.livemode,
  });

  // ── 7. spec_referrals row when a referrer email was captured.
  const { data: referrerRow } = await db
    .from('spec_projects')
    .select('referrer_email')
    .eq('id', specProjectId)
    .maybeSingle();
  const referrerEmail =
    typeof referrerRow?.referrer_email === 'string' ? referrerRow.referrer_email : null;
  if (referrerEmail) {
    await db.from('spec_referrals').insert({
      spec_project_id: specProjectId,
      referrer_email: referrerEmail,
      status: 'pending',
      eligible_at: null,
      is_test: !session.livemode,
    });
  }

  // ── 8. Deposit-confirmed email (spec.deposit_confirmed).
  const buyerInfo = await loadBuyerAndCompany(db, userId, companyId);
  const intakeUrl = await deriveIntakeUrl(db, specProjectId);
  const depositAmountFormatted = formatAmountCents(amountTotal, session.currency ?? 'CAD');
  const totalCents = await deriveTierTotalCents(db, tier);
  const totalAmountFormatted = formatAmountCents(totalCents, session.currency ?? 'CAD');
  const paidAtFormatted = formatStripeTimestamp(Math.floor(Date.now() / 1000));
  const receiptForCustomer = paymentIntentId
    ? `https://dashboard.stripe.com/${session.livemode ? '' : 'test/'}payments/${paymentIntentId}`
    : '';

  if (customerEmail) {
    await queueSpecEmail({
      templateId: DEPOSIT_CONFIRMED_TEMPLATE_ID,
      recipientEmail: customerEmail,
      recipientUserId: userId,
      specProjectId,
      isTest: !session.livemode,
      payload: {
        buyerName: buyerInfo.buyerName,
        companyName: buyerInfo.companyName,
        tier: tierDisplayLabel(tier),
        depositAmountFormatted,
        totalAmountFormatted,
        paidAtFormatted,
        stripeReceiptUrl: receiptForCustomer,
        intakeUrl,
      },
    });
  }

  // ── 9. Customer notification (in-app rail).
  await dispatchSpecCustomerNotification(
    {
      recipientUserId: userId,
      linkedCompanyId: companyId,
      type: 'spec_deposit_confirmed',
      title: `SPEC DEPOSIT CONFIRMED — ${tier.toUpperCase()}`,
      body: 'Your deposit cleared. Intake link incoming via email.',
      persistent: false,
      actionUrl: `/account/spec/${specProjectId}/request-refund`,
      actionLabel: 'OPEN',
    },
    { db },
  );

  // ── 10. Operator notification (in-app rail, persistent).
  await dispatchSpecOperatorNotification(
    {
      type: 'spec_deposit_received',
      title: `SPEC DEPOSIT RECEIVED — ${tier.toUpperCase()}`,
      body: `${buyerInfo.companyName} cleared P1 (${depositAmountFormatted}). Run intake + schedule discovery.`,
      persistent: true,
      specProjectId,
    },
    { db },
  );

  // ── 11. Conversion event (primary) — stripe_checkout_completed.
  await sendConversionEvent('stripe_checkout_completed', {
    user_id: userId,
    company_id: companyId,
    tier,
    spec_project_id: specProjectId,
    email: customerEmail || undefined,
    value_cents: amountTotal,
    currency: (session.currency ?? 'CAD').toUpperCase(),
    ...attribution,
  });

  // ── 12. spec_communications audit row.
  await db.from('spec_communications').insert({
    spec_project_id: specProjectId,
    direction: 'inbound',
    channel: 'system',
    summary: 'Stripe checkout.session.completed — deposit captured',
    body: JSON.stringify({
      session_id: session.id,
      payment_intent: paymentIntentId,
      charge_id: chargeId,
      amount_total_cents: amountTotal,
      tax_cents: taxAmount,
      currency: session.currency ?? 'cad',
      tos_version_hash: tosVersionHash,
    }),
  });
}

interface BuyerAndCompany {
  buyerName: string;
  companyName: string;
}

async function loadBuyerAndCompany(
  db: SupabaseClient,
  userId: string,
  companyId: string,
): Promise<BuyerAndCompany> {
  const [{ data: userRow }, { data: companyRow }] = await Promise.all([
    db.from('users').select('first_name, last_name, email').eq('id', userId).maybeSingle(),
    db.from('companies').select('name').eq('id', companyId).maybeSingle(),
  ]);
  const firstName = typeof userRow?.first_name === 'string' ? userRow.first_name.trim() : '';
  const lastName = typeof userRow?.last_name === 'string' ? userRow.last_name.trim() : '';
  const email = typeof userRow?.email === 'string' ? userRow.email.trim() : '';
  const buyerName = deriveDisplayName(`${firstName} ${lastName}`.trim(), email);
  const companyName =
    typeof companyRow?.name === 'string' && companyRow.name.trim().length > 0
      ? companyRow.name.trim()
      : 'Your Crew';
  return { buyerName, companyName };
}

function deriveDisplayName(name: string | null | undefined, email: string): string {
  if (name && name.trim().length > 0) return name.trim();
  if (email && email.length > 0) return email.split('@')[0];
  return 'Operator';
}

async function deriveIntakeUrl(db: SupabaseClient, specProjectId: string): Promise<string> {
  // Stage C.4 owns the real intake-token issuance. Until that lands, the
  // deposit-confirmed email points to a project-scoped placeholder URL that
  // the customer can bookmark; the intake-link nudge cron will replace it.
  const origin = process.env.NEXT_PUBLIC_OPS_SITE_URL?.replace(/\/$/, '') ?? 'https://opsapp.co';
  const { data } = await db
    .from('spec_projects')
    .select('id')
    .eq('id', specProjectId)
    .maybeSingle();
  if (!data) return `${origin}/spec/confirmation`;
  return `${origin}/spec/intake/${data.id}`;
}

async function deriveTierTotalCents(_db: SupabaseClient, tier: SpecTier): Promise<number> {
  // Pricing is locked in code (src/lib/spec/pricing.ts) — 25% of total. The
  // capacity table mirrors it; we use the code constant for cross-process
  // consistency and avoid an extra DB hit in the webhook path.
  const { SPEC_TIER_TOTALS_CENTS } = await import('@/lib/spec/pricing');
  return SPEC_TIER_TOTALS_CENTS[tier];
}

async function resolveLatestChargeId(
  _session: Stripe.Checkout.Session,
  paymentIntentId: string | null,
): Promise<string | null> {
  // Stripe Checkout Sessions don't always expose the charge id on the session
  // payload — the PaymentIntent expansion does. Stage C.5 retrieves the
  // charge when persisting the invoice path; for the Phase 1 deposit row we
  // record the payment_intent_id only (the unique correlator). Returning
  // null here keeps the spec_payments insert atomic; the cron can hydrate
  // stripe_charge_id later if needed for dispute correlation.
  return paymentIntentId;
}

// ─── charge.dispute.created ────────────────────────────────────────────────

export async function handleSpecChargeDisputeCreated(
  event: Stripe.Event,
  dispute: Stripe.Dispute,
  stripe: Stripe,
  options: SpecHandlerOptions = {},
): Promise<SpecWebhookHandlerOutcome> {
  const db = options.db ?? getSupabaseAdmin();

  if (await isDuplicateEvent(db, event.id)) {
    return { ok: true, status: 'duplicate' };
  }

  // ── 1. Resolve the SPEC payment. The dispute object carries both the
  //       charge id and payment_intent id; we match on payment_intent first
  //       (canonical for our writes) and fall back to charge.
  const paymentIntentId =
    typeof dispute.payment_intent === 'string'
      ? dispute.payment_intent
      : dispute.payment_intent?.id ?? null;
  const chargeIdRaw =
    typeof dispute.charge === 'string' ? dispute.charge : dispute.charge?.id ?? null;

  interface PaymentLookupRow {
    id: string;
    spec_project_id: string;
    stripe_payment_intent_id: string | null;
  }
  let paymentRow: PaymentLookupRow | null = null;

  if (paymentIntentId) {
    const { data } = await db
      .from('spec_payments')
      .select('id, spec_project_id, stripe_payment_intent_id')
      .eq('stripe_payment_intent_id', paymentIntentId)
      .maybeSingle();
    paymentRow = (data as PaymentLookupRow | null) ?? null;
  }
  // No charge-id branch needed today: SPEC payment rows persist
  // stripe_payment_intent_id; the dispute always carries payment_intent.

  if (!paymentRow) {
    // Not a SPEC dispute — let the shop handler take it (no-op here).
    await recordEventProcessed(db, event.id, event.type);
    return { ok: true, status: 'skipped' };
  }

  const specProjectId = paymentRow.spec_project_id;

  // ── 2. Flip payment status to disputed.
  await db
    .from('spec_payments')
    .update({ status: 'disputed' })
    .eq('id', paymentRow.id);

  // ── 3. Disable all entitlements for this engagement with disabled_reason='dispute'.
  //       The CHECK constraint allows the value.
  await db
    .from('spec_module_entitlements')
    .update({
      enabled: false,
      disabled_reason: 'dispute',
      disabled_at: new Date().toISOString(),
    })
    .eq('spec_project_id', specProjectId);

  // ── 4. Communications log entry.
  await db.from('spec_communications').insert({
    spec_project_id: specProjectId,
    direction: 'inbound',
    channel: 'system',
    summary: `Stripe dispute opened — ${dispute.reason ?? 'unknown'}`,
    body: JSON.stringify({
      dispute_id: dispute.id,
      reason: dispute.reason ?? null,
      amount: dispute.amount,
      currency: dispute.currency,
      status: dispute.status,
      payment_intent: paymentIntentId,
      charge: chargeIdRaw,
      // The 30-day Guarantee Window closes here — see SPEC/02_DATA_MODEL.md
      // (no dedicated column today; this row is the canonical close signal
      // until Stage A adds an explicit flag).
      guarantee_window_closed: true,
    }),
  });

  // ── 5. Resolve the customer name + company for the email + notification.
  const { data: projectRow } = await db
    .from('spec_projects')
    .select('tier, customer_email, customer_name, buyer_user_id, linked_company_id')
    .eq('id', specProjectId)
    .maybeSingle();
  const tierRaw = (projectRow?.tier ?? '') as string;
  const tier: SpecTier = isValidTier(tierRaw) ? tierRaw : 'build';
  const customerEmail =
    typeof projectRow?.customer_email === 'string' ? projectRow.customer_email : '';
  const linkedCompanyId =
    typeof projectRow?.linked_company_id === 'string' ? projectRow.linked_company_id : '';
  const buyerUserId =
    typeof projectRow?.buyer_user_id === 'string' ? projectRow.buyer_user_id : '';

  const { data: companyRow } = linkedCompanyId
    ? await db.from('companies').select('name').eq('id', linkedCompanyId).maybeSingle()
    : { data: null as { name?: string } | null };
  const companyName =
    typeof companyRow?.name === 'string' && companyRow.name.trim().length > 0
      ? companyRow.name.trim()
      : 'unknown company';

  // ── 6. Persistent operator notification.
  await dispatchSpecOperatorNotification(
    {
      type: 'spec_dispute_opened',
      title: `SPEC DISPUTE — ${tier.toUpperCase()}`,
      body: `${companyName}: Stripe dispute on P1 (${dispute.reason ?? 'unknown'}). Entitlements paused; 30-day guarantee closed.`,
      persistent: true,
      specProjectId,
    },
    { db },
  );

  // ── 7. Direct email to Jackson — Stage H doesn't have a templated dispute
  //       email today (Phase 2 evidence-package work). We enqueue via the
  //       outbox using a synthetic operator-alert template id so the OPS-Web
  //       email service routes it as a transactional notice. Falls back to a
  //       console.error if the outbox enqueue fails.
  const enqueuedDirectEmail = await queueSpecEmail({
    templateId: 'spec.refund_denied', // closest existing transactional template; body overridden by payload
    recipientEmail: SUPPORT_EMAIL,
    recipientUserId: null,
    specProjectId,
    isTest: false,
    payload: {
      __operator_alert: true,
      subject: `SPEC DISPUTE — ${companyName} ${tier.toUpperCase()}`,
      buyerName: deriveDisplayName(projectRow?.customer_name ?? null, customerEmail),
      reason: dispute.reason ?? 'unknown',
      amount: dispute.amount,
      currency: dispute.currency,
      dispute_id: dispute.id,
      admin_url: `${(process.env.NEXT_PUBLIC_OPS_WEB_URL ?? 'https://app.opsapp.co').replace(/\/$/, '')}/admin/spec/${specProjectId}`,
    },
  });
  if (!enqueuedDirectEmail) {
    console.error('[SPEC webhook] Direct dispute-alert email enqueue failed', {
      specProjectId,
      disputeId: dispute.id,
    });
  }

  // Touch the buyer with an in-app rail entry too, so they see "We received
  // notice of a dispute on your P1 payment." It is non-persistent.
  if (buyerUserId && linkedCompanyId) {
    await dispatchSpecCustomerNotification(
      {
        recipientUserId: buyerUserId,
        linkedCompanyId,
        type: 'spec_dispute_opened',
        title: 'SPEC PAYMENT — DISPUTE NOTICE',
        body: 'We received notice of a dispute on your SPEC P1 payment. Reply to the deposit confirmation email to resolve.',
        persistent: true,
        actionUrl: `/account/spec/${specProjectId}/request-refund`,
        actionLabel: 'OPEN',
      },
      { db },
    );
  }

  // Stripe references unused — kept in signature for symmetry with the
  // deposit branch and future evidence-package assembly.
  void stripe;

  await recordEventProcessed(db, event.id, event.type);
  return { ok: true, status: 'processed', specProjectId };
}
