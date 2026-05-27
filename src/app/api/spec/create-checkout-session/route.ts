/**
 * POST /api/spec/create-checkout-session
 *
 * Stage C.1 implementation of the SPEC Phase 1 deposit flow per
 * ops-software-bible/SPEC/07_ROLLOUT.md § 4 + § 13B and the locked
 * SPEC-STRIPE-ADDRESS-TAX-SPIKE / SPEC-NO-COMPANY-BUYER-FLOW-LOCK contracts.
 *
 * Flow (order matters):
 *  1. Master gate `SPEC_LIVE_DEPOSITS_ENABLED` — Phase 0 default false → 503.
 *  2. Parse + tier-validate the request body.
 *  3. Resolve the signed-in OPS user from cookies / Authorization header.
 *  4. Resolve the buyer's company via `resolveSpecCompanyForProject()` —
 *     no_company / company_deleted / no_account_holder all 409 with a
 *     `redirectTo` so the UI can route the buyer to /setup.
 *  5. Server-side validate the billing address + four Quebec attestations.
 *  6. spec_blocked_buyers pre-flight check (email + Stripe customer id).
 *  7. Merge first-touch attribution cookie into the row + Stripe metadata.
 *  8. Insert spec_projects row:
 *      - Path A (buyer == account_holder) → status='awaiting_deposit'
 *      - Path B (buyer ≠ account_holder)   → status='awaiting_owner_approval'
 *  9. Server-side conversion event: billing_address_submitted.
 * 10. Path A: get/create Stripe Customer, create Checkout Session per the
 *     locked field set (customer/customer_email, automatic_tax,
 *     billing_address_collection, consent_collection.terms_of_service,
 *     phone_number_collection, GST/HST custom_field, metadata.tos_version_hash),
 *     fire stripe_checkout_opened, return { stripe_url }.
 * 11. Path B: generate plaintext approval token, hash with SHA-256, insert
 *     spec_owner_approval_requests, queue spec.owner_approval_required email,
 *     fire owner_approval_requested, return { awaiting_approval: true }.
 *
 * The webhook handler extension (Stage C.2) flips spec_projects.status to
 * 'deposit_paid', stamps tos_version_accepted / tos_accepted_at / IP, and
 * dispatches the Quebec post-Stripe defense. This route never returns 200
 * for an invalid input — every error is an explicit 4xx with a typed code.
 */

import { NextRequest, NextResponse } from 'next/server';
import type Stripe from 'stripe';
import { getStripe } from '@/lib/shop/stripe';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { getCurrentUserFromRequest } from '@/lib/auth/get-current-user';
import { resolveSpecCompanyForProject } from '@/lib/spec/resolve-company';
import {
  validateBillingAndAttestations,
  type BillingAddress,
  type QuebecAttestations,
} from '@/lib/spec/quebec-validation';
import {
  isValidTier,
  tierDepositCents,
  SPEC_TIER_DISPLAY_NAMES,
  type SpecTier,
} from '@/lib/spec/pricing';
import { SPEC_TERMS_VERSION_HASH } from '@/lib/spec/tos-version';
import {
  attributionToStripeMetadata,
  readAttributionFromRequest,
  type OpsAttribution,
} from '@/lib/spec/attribution';
import { sendConversionEvent } from '@/lib/spec/conversion-events';
import { generateApprovalToken, hashApprovalToken } from '@/lib/spec/token-hash';
import { queueSpecEmail } from '@/lib/spec/email-outbox';

interface RequestBody {
  tier?: string;
  billing?: Partial<BillingAddress>;
  attestations?: Partial<QuebecAttestations>;
  referrer_email?: string;
}

function depositsLive(): boolean {
  return process.env.SPEC_LIVE_DEPOSITS_ENABLED === 'true';
}

function isStripeTestMode(): boolean {
  const key = process.env.STRIPE_SECRET_KEY ?? '';
  return key.startsWith('sk_test_');
}

const OPS_SITE_DEFAULT_ORIGIN = 'https://opsapp.co';

function getOrigin(req: NextRequest): string {
  return (
    req.headers.get('origin') ??
    process.env.NEXT_PUBLIC_OPS_SITE_URL ??
    OPS_SITE_DEFAULT_ORIGIN
  );
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  // ── 1. Phase 0 master gate ─────────────────────────────────────────────
  if (!depositsLive()) {
    return NextResponse.json(
      {
        error: 'Deposits are paused. Please use the contact form to talk to the founder.',
        contactUrl: '/resources#contact',
      },
      { status: 503 },
    );
  }

  // ── 2. Parse + validate body ───────────────────────────────────────────
  let body: RequestBody;
  try {
    body = (await req.json()) as RequestBody;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  if (!isValidTier(body.tier)) {
    return NextResponse.json(
      { error: 'Invalid tier. Must be setup, build, or enterprise.', field: 'tier' },
      { status: 400 },
    );
  }
  const tier: SpecTier = body.tier;

  const billingInput = body.billing ?? {};
  const billing: BillingAddress = {
    line1: String(billingInput.line1 ?? '').trim(),
    line2: typeof billingInput.line2 === 'string' ? billingInput.line2.trim() : null,
    city: String(billingInput.city ?? '').trim(),
    province: String(billingInput.province ?? '').trim().toUpperCase(),
    postal_code: String(billingInput.postal_code ?? '').trim().toUpperCase(),
    country: String(billingInput.country ?? 'CA').trim().toUpperCase(),
  };

  const attInput = body.attestations ?? {};
  const attestations: QuebecAttestations = {
    no_qc_head_office: attInput.no_qc_head_office === true,
    no_qc_operating_address: attInput.no_qc_operating_address === true,
    no_qc_establishment: attInput.no_qc_establishment === true,
    no_material_qc_use: attInput.no_material_qc_use === true,
  };

  // ── 3. Auth ────────────────────────────────────────────────────────────
  const currentUser = await getCurrentUserFromRequest(req);
  if (!currentUser) {
    return NextResponse.json(
      { error: 'You must be signed in to continue.' },
      { status: 401 },
    );
  }

  // ── 4. Company gate (SPEC-NO-COMPANY-BUYER-FLOW-LOCK) ──────────────────
  const resolved = await resolveSpecCompanyForProject(currentUser.id, tier);
  if (!resolved.ok) {
    return NextResponse.json(
      {
        error:
          resolved.reason === 'no_company'
            ? 'You need to finish setting up your company before paying a deposit.'
            : resolved.reason === 'company_deleted'
              ? 'Your company record is unavailable. Restart setup to continue.'
              : 'Your account is missing an owner. Restart account setup.',
        redirectTo: resolved.redirectTo,
        reason: resolved.reason,
      },
      { status: 409 },
    );
  }

  // ── 5. Server-side billing + Quebec validation ─────────────────────────
  const validation = validateBillingAndAttestations(billing, attestations);
  if (!validation.ok) {
    // Internal-only signal: Quebec block hits the operator log, not ad
    // platforms (per SPEC/04_CUSTOMER_UX.md § Conversion tracking).
    if (validation.code === 'province_quebec') {
      await sendConversionEvent('quebec_rejected', {
        user_id: currentUser.id,
        company_id: resolved.companyId,
        tier,
        email: currentUser.email ?? undefined,
        rejection_code: validation.code,
      });
    }
    return NextResponse.json(
      { error: validation.message, field: validation.field, code: validation.code },
      { status: 422 },
    );
  }

  const db = getSupabaseAdmin();
  const buyerEmail = (currentUser.email ?? '').trim().toLowerCase();

  // ── 6. Block-list pre-flight ───────────────────────────────────────────
  // companies.stripe_customer_id may or may not exist yet — check both
  // identifiers and lower-case-match the email (citext column handles case).
  const { data: companyRow } = await db
    .from('companies')
    .select('stripe_customer_id')
    .eq('id', resolved.companyId)
    .maybeSingle();
  const knownStripeCustomerId =
    typeof companyRow?.stripe_customer_id === 'string'
      ? companyRow.stripe_customer_id
      : null;

  if (buyerEmail) {
    const { data: blockedByEmail } = await db
      .from('spec_blocked_buyers')
      .select('id')
      .eq('email', buyerEmail)
      .is('unblocked_at', null)
      .maybeSingle();
    if (blockedByEmail) {
      // Generic message — never disclose block reason to the buyer.
      console.warn('[spec/create-checkout-session] block-list hit', {
        userId: currentUser.id,
        companyId: resolved.companyId,
        reason: 'email',
      });
      return NextResponse.json(
        { error: 'We cannot complete this request. Please contact the founder.' },
        { status: 403 },
      );
    }
  }
  if (knownStripeCustomerId) {
    const { data: blockedByStripe } = await db
      .from('spec_blocked_buyers')
      .select('id')
      .eq('stripe_customer_id', knownStripeCustomerId)
      .is('unblocked_at', null)
      .maybeSingle();
    if (blockedByStripe) {
      console.warn('[spec/create-checkout-session] block-list hit', {
        userId: currentUser.id,
        companyId: resolved.companyId,
        reason: 'stripe_customer_id',
      });
      return NextResponse.json(
        { error: 'We cannot complete this request. Please contact the founder.' },
        { status: 403 },
      );
    }
  }

  // ── 7. Attribution (first-touch cookie) ────────────────────────────────
  const attribution = readAttributionFromRequest(req);

  // ── 8. Insert spec_projects row ────────────────────────────────────────
  const status =
    resolved.isBuyerAccountHolder ? 'awaiting_deposit' : 'awaiting_owner_approval';
  const referrerEmail =
    typeof body.referrer_email === 'string' && body.referrer_email.trim().length > 0
      ? body.referrer_email.trim().toLowerCase()
      : null;

  const insertRow = {
    tier,
    status,
    buyer_user_id: currentUser.id,
    account_holder_user_id: resolved.accountHolderUserId,
    linked_company_id: resolved.companyId,
    customer_email: buyerEmail,
    billing_address_line1: billing.line1,
    billing_address_line2: billing.line2,
    billing_city: billing.city,
    billing_province: billing.province,
    billing_postal_code: billing.postal_code,
    billing_country: 'CA',
    quebec_eligibility_attested_at: new Date().toISOString(),
    quebec_eligibility_payload: attestations,
    attribution: attribution as unknown as Record<string, unknown>,
    referrer_email: referrerEmail,
    is_test: isStripeTestMode(),
    stripe_customer_id: knownStripeCustomerId,
  };

  const { data: projectRow, error: insertError } = await db
    .from('spec_projects')
    .insert(insertRow)
    .select('id')
    .single();

  if (insertError || !projectRow) {
    console.error('[spec/create-checkout-session] spec_projects insert failed', insertError);
    return NextResponse.json(
      { error: 'Could not start the deposit flow. Try again in a moment.' },
      { status: 500 },
    );
  }
  const specProjectId = projectRow.id as string;

  // ── 9. Fire the intermediate funnel event ──────────────────────────────
  await sendConversionEvent('billing_address_submitted', {
    user_id: currentUser.id,
    company_id: resolved.companyId,
    tier,
    spec_project_id: specProjectId,
    email: buyerEmail || undefined,
    ...attribution,
  });

  // ── 10/11. Branch — Path A (account holder) vs Path B (team member) ────
  if (resolved.isBuyerAccountHolder) {
    return handlePathA({
      req,
      db,
      stripe: getStripe(),
      tier,
      buyerEmail,
      buyerUserId: currentUser.id,
      companyId: resolved.companyId,
      companyName: resolved.companyName,
      knownStripeCustomerId,
      specProjectId,
      billing,
      attribution,
    });
  }

  return handlePathB({
    db,
    tier,
    buyerEmail,
    buyerUserId: currentUser.id,
    accountHolderUserId: resolved.accountHolderUserId,
    companyId: resolved.companyId,
    companyName: resolved.companyName,
    specProjectId,
    attribution,
    isTest: isStripeTestMode(),
  });
}

// ─── Path A — buyer is the account_holder ───────────────────────────────────

interface PathAArgs {
  req: NextRequest;
  db: ReturnType<typeof getSupabaseAdmin>;
  stripe: Stripe;
  tier: SpecTier;
  buyerEmail: string;
  buyerUserId: string;
  companyId: string;
  companyName: string;
  knownStripeCustomerId: string | null;
  specProjectId: string;
  billing: BillingAddress;
  attribution: OpsAttribution;
}

async function handlePathA(args: PathAArgs): Promise<NextResponse> {
  const {
    req,
    db,
    stripe,
    tier,
    buyerEmail,
    buyerUserId,
    companyId,
    companyName,
    knownStripeCustomerId,
    specProjectId,
    billing,
    attribution,
  } = args;
  const origin = getOrigin(req);
  const depositCents = tierDepositCents(tier);

  // Get or create a Stripe Customer with the pre-collected billing address.
  let stripeCustomerId = knownStripeCustomerId;
  if (!stripeCustomerId) {
    try {
      const customer = await stripe.customers.create({
        email: buyerEmail || undefined,
        name: companyName,
        address: {
          line1: billing.line1,
          line2: billing.line2 ?? undefined,
          city: billing.city,
          state: billing.province,
          postal_code: billing.postal_code,
          country: 'CA',
        },
        metadata: {
          ops_company_id: companyId,
          ops_user_id: buyerUserId,
          spec_project_id: specProjectId,
        },
      });
      stripeCustomerId = customer.id;
      await db
        .from('companies')
        .update({ stripe_customer_id: stripeCustomerId })
        .eq('id', companyId);
    } catch (err) {
      console.error('[spec/create-checkout-session] Stripe customer create failed', err);
      return NextResponse.json(
        { error: 'Stripe error. Please try again in a moment.' },
        { status: 502 },
      );
    }
  }

  const metadata: Record<string, string> = {
    type: 'spec_deposit',
    spec_project_id: specProjectId,
    user_id: buyerUserId,
    company_id: companyId,
    tier,
    tos_version_hash: SPEC_TERMS_VERSION_HASH,
    ...attributionToStripeMetadata(attribution),
  };

  let session: Stripe.Checkout.Session;
  try {
    session = await stripe.checkout.sessions.create({
      mode: 'payment',
      customer: stripeCustomerId,
      // Stripe rejects `customer_email` when `customer` is set, so we omit it
      // — the email lives on the Customer object already.
      automatic_tax: { enabled: true },
      billing_address_collection: 'required',
      consent_collection: { terms_of_service: 'required' },
      phone_number_collection: { enabled: true },
      custom_fields: [
        {
          key: 'gst_hst_number',
          label: { type: 'custom', custom: 'GST/HST number (optional)' },
          type: 'text',
          optional: true,
        },
      ],
      customer_update: {
        address: 'auto',
        name: 'auto',
        shipping: 'auto',
      },
      line_items: [
        {
          price_data: {
            currency: 'cad',
            product_data: {
              name: `${SPEC_TIER_DISPLAY_NAMES[tier]} — 25% Deposit (P1 of 4)`,
              description:
                'P1 deposit funds discovery + scope work. P2 fires at scope sign-off, P3 at midpoint demo, P4 at delivery walkthrough.',
            },
            unit_amount: depositCents,
            tax_behavior: 'exclusive',
          },
          quantity: 1,
        },
      ],
      metadata,
      payment_intent_data: { metadata },
      success_url: `${origin}/spec/confirmation?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/spec`,
    });
  } catch (err) {
    console.error('[spec/create-checkout-session] Stripe Checkout create failed', err);
    return NextResponse.json(
      { error: 'Stripe error. Please try again in a moment.' },
      { status: 502 },
    );
  }

  // Persist Stripe identifiers on the project row so the webhook can correlate.
  await db
    .from('spec_projects')
    .update({
      stripe_customer_id: stripeCustomerId,
      stripe_session_id: session.id,
    })
    .eq('id', specProjectId);

  await sendConversionEvent('stripe_checkout_opened', {
    user_id: buyerUserId,
    company_id: companyId,
    tier,
    spec_project_id: specProjectId,
    value_cents: depositCents,
    currency: 'CAD',
    email: buyerEmail || undefined,
    ...attribution,
  });

  return NextResponse.json({ stripe_url: session.url });
}

// ─── Path B — buyer ≠ account_holder ────────────────────────────────────────

interface PathBArgs {
  db: ReturnType<typeof getSupabaseAdmin>;
  tier: SpecTier;
  buyerEmail: string;
  buyerUserId: string;
  accountHolderUserId: string;
  companyId: string;
  companyName: string;
  specProjectId: string;
  attribution: OpsAttribution;
  isTest: boolean;
}

async function handlePathB(args: PathBArgs): Promise<NextResponse> {
  const {
    db,
    tier,
    buyerEmail,
    buyerUserId,
    accountHolderUserId,
    companyId,
    companyName,
    specProjectId,
    attribution,
    isTest,
  } = args;

  // Look up the account_holder's user row for email + first name.
  const { data: holderRow } = await db
    .from('users')
    .select('id, email, first_name, last_name')
    .eq('id', accountHolderUserId)
    .maybeSingle();
  const holderEmail =
    typeof holderRow?.email === 'string' ? holderRow.email.trim().toLowerCase() : null;

  if (!holderEmail) {
    console.error('[spec/create-checkout-session] Path B: account_holder has no email', {
      accountHolderUserId,
      companyId,
    });
    return NextResponse.json(
      { error: 'Your company owner is missing an email. Please contact support.' },
      { status: 500 },
    );
  }

  const totalCents = tierDepositCents(tier) * 4;
  const depositCents = tierDepositCents(tier);

  // Generate plaintext + hash. The plaintext is only ever transmitted in the
  // email link; the DB stores only the SHA-256 hash.
  const approvalTokenPlain = generateApprovalToken();
  const approvalTokenHash = hashApprovalToken(approvalTokenPlain);

  const { data: approvalRow, error: approvalErr } = await db
    .from('spec_owner_approval_requests')
    .insert({
      spec_project_id: specProjectId,
      buyer_user_id: buyerUserId,
      account_holder_user_id: accountHolderUserId,
      linked_company_id: companyId,
      tier,
      approved_total_cents: totalCents,
      approved_deposit_cents: depositCents,
      approved_tos_version_hash: SPEC_TERMS_VERSION_HASH,
      status: 'pending',
      approval_token_hash: approvalTokenHash,
      requested_at: new Date().toISOString(),
      is_test: isTest,
    })
    .select('id')
    .single();

  if (approvalErr || !approvalRow) {
    console.error('[spec/create-checkout-session] spec_owner_approval_requests insert failed', approvalErr);
    return NextResponse.json(
      { error: 'Could not request owner approval. Try again in a moment.' },
      { status: 500 },
    );
  }

  // Stamp the owner_approval_requested_at bookkeeping timestamp on the project.
  await db
    .from('spec_projects')
    .update({ owner_approval_requested_at: new Date().toISOString() })
    .eq('id', specProjectId);

  const opsSiteOrigin =
    process.env.NEXT_PUBLIC_OPS_SITE_URL?.replace(/\/$/, '') ?? OPS_SITE_DEFAULT_ORIGIN;
  const approvalUrl = `${opsSiteOrigin}/spec/owner-approval/${encodeURIComponent(approvalTokenPlain)}`;
  const holderFirstName =
    typeof holderRow?.first_name === 'string' ? holderRow.first_name : '';
  const holderName = holderFirstName || 'Operator';

  await queueSpecEmail({
    templateId: 'spec.owner_approval_required',
    recipientEmail: holderEmail,
    recipientUserId: accountHolderUserId,
    specProjectId,
    isTest,
    payload: {
      owner_first_name: holderName,
      buyer_email: buyerEmail,
      company_name: companyName,
      tier,
      tier_display_name: SPEC_TIER_DISPLAY_NAMES[tier],
      deposit_cents: depositCents,
      total_cents: totalCents,
      approval_url: approvalUrl,
      tos_version_hash: SPEC_TERMS_VERSION_HASH,
    },
  });

  await sendConversionEvent('owner_approval_requested', {
    user_id: buyerUserId,
    company_id: companyId,
    tier,
    spec_project_id: specProjectId,
    email: buyerEmail || undefined,
    ...attribution,
  });

  return NextResponse.json({ awaiting_approval: true });
}
