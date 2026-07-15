/**
 * Shared SPEC Stripe Checkout Session builder.
 *
 * Source: ops-software-bible/SPEC/07_ROLLOUT.md § Gate resolutions —
 *         SPEC-STRIPE-ADDRESS-TAX-SPIKE (locked field set).
 *
 * Used by:
 *  - `/api/spec/create-checkout-session` Path A (buyer == account_holder)
 *  - `/spec/checkout/[buyer_checkout_token]` Path B post-approval (buyer ≠ account_holder)
 *
 * The locked contract requires every Checkout Session for a SPEC deposit to set
 * the SAME field set, regardless of which entry point creates it. Centralizing
 * here prevents drift between Path A and Path B.
 *
 * Server-only — never import from client code.
 */

import type Stripe from 'stripe';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { getStripe } from '@/lib/shop/stripe';
import {
  tierDepositCents,
  SPEC_TIER_DISPLAY_NAMES,
  type SpecTier,
} from './pricing';
import { SPEC_TERMS_VERSION_HASH } from './tos-version';
import {
  attributionToStripeMetadata,
  type OpsAttribution,
} from './attribution';

/**
 * Per-tier deposit line copy for the Stripe checkout page (10_TIER_MODEL_V2 § 2).
 * Payment shapes differ per tier, so the deposit line has to say what this
 * payment is and when the rest lands.
 */
const DEPOSIT_LINE_COPY: Record<SpecTier, { name: string; description: string }> = {
  spec01: {
    name: '50% Deposit',
    description:
      'Books your slot and funds discovery + scope sign-off. The other half is invoiced at the delivery walkthrough, net-15.',
  },
  spec02: {
    name: '25% Deposit (P1 of 4)',
    description:
      'P1 funds discovery + scope work. P2 fires at scope sign-off, P3 at the midpoint review, P4 at the delivery walkthrough — each invoiced net-15.',
  },
  spec03: {
    name: 'Deposit',
    description:
      'Fixed against the $25,000 floor. Your total locks at scope sign-off; the remainder is split across three checkpoints, invoiced net-15.',
  },
};

export interface CreateSpecStripeSessionArgs {
  tier: SpecTier;
  /** Buyer's email — the customer email Stripe will send the receipt to. */
  buyerEmail: string;
  buyerUserId: string;
  companyId: string;
  /** Pre-fill the Stripe Customer name field. */
  companyName: string;
  /** Spec project id — written to Stripe metadata + the spec_projects row. */
  specProjectId: string;
  /** Optional existing Stripe customer id to reuse (avoids duplicate Customers). */
  existingStripeCustomerId: string | null;
  /** Billing address — pre-collected from `/spec/billing-address`. */
  billing: {
    line1: string;
    line2: string | null;
    city: string;
    /** ISO 3166-2 subdivision code, e.g. 'BC', 'ON'. Never 'QC' (Quebec-rejected upstream). */
    province: string;
    postal_code: string;
    country: string;
  };
  /** First-touch attribution payload for Stripe metadata. */
  attribution: OpsAttribution;
  /** Origin used to build success / cancel URLs. */
  origin: string;
}

export interface CreateSpecStripeSessionResult {
  sessionId: string;
  url: string;
  stripeCustomerId: string;
  depositCents: number;
}

/**
 * Build a Stripe Checkout Session for a SPEC deposit per the locked
 * SPEC-STRIPE-ADDRESS-TAX-SPIKE contract:
 *
 *  - `customer` pre-filled (Stripe rejects `customer_email` when `customer` is set)
 *  - `automatic_tax.enabled = true`
 *  - `billing_address_collection = 'required'`
 *  - `consent_collection.terms_of_service = 'required'`
 *  - `phone_number_collection.enabled = true`
 *  - `custom_fields` includes optional GST/HST number
 *  - `metadata` carries `type`, `spec_project_id`, `user_id`, `company_id`,
 *    `tier`, `tos_version_hash`, and the attribution UTMs/click ids
 *
 * Side effects:
 *  - Creates the Stripe Customer if one doesn't already exist and persists
 *    `companies.stripe_customer_id` for reuse on future engagements.
 *  - Persists `stripe_customer_id` and `stripe_session_id` on `spec_projects`
 *    so the webhook can correlate.
 *
 * Never throws on Stripe errors — wraps + rethrows with context.
 */
export async function createSpecStripeCheckoutSession(
  args: CreateSpecStripeSessionArgs,
): Promise<CreateSpecStripeSessionResult> {
  const {
    tier,
    buyerEmail,
    buyerUserId,
    companyId,
    companyName,
    specProjectId,
    existingStripeCustomerId,
    billing,
    attribution,
    origin,
  } = args;

  const stripe = getStripe();
  const db = getSupabaseAdmin();
  const depositCents = tierDepositCents(tier);

  let stripeCustomerId = existingStripeCustomerId;
  if (!stripeCustomerId) {
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
              name: `${SPEC_TIER_DISPLAY_NAMES[tier]} — ${DEPOSIT_LINE_COPY[tier].name}`,
              description: DEPOSIT_LINE_COPY[tier].description,
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
    const message = err instanceof Error ? err.message : String(err);
    throw new Error(`stripe_checkout_create_failed: ${message}`);
  }

  if (!session.url) {
    throw new Error('stripe_checkout_missing_url');
  }

  await db
    .from('spec_projects')
    .update({
      stripe_customer_id: stripeCustomerId,
      stripe_session_id: session.id,
    })
    .eq('id', specProjectId);

  return {
    sessionId: session.id,
    url: session.url,
    stripeCustomerId,
    depositCents,
  };
}
