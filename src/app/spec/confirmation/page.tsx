/**
 * SPEC deposit confirmation page.
 *
 * Route: /spec/confirmation?session_id=<stripe_session_id>
 *
 * Shown after a successful Stripe Checkout for a SPEC deposit. The page is
 * keyed on `session_id`, so it cannot be statically prerendered — `dynamic
 * = 'force-dynamic'` is mandatory.
 *
 * Server-side flow:
 *   1. Read `session_id` from search params.
 *   2. Retrieve the Stripe Checkout Session with `expand: ['payment_intent',
 *      'customer']`.
 *   3. Verify `metadata.type === 'spec_deposit'` and `payment_status === 'paid'`.
 *   4. If a `spec_project_id` is present in the metadata (Stage C.1+),
 *      look up the corresponding spec_projects row for intake-token state +
 *      walkthrough anchor. The Phase 0 path with no project row works as a
 *      fallback rendering.
 *   5. Render SpecConfirmation with the resolved props. If the session is
 *      missing or unpaid, render a soft "still processing" state instead of
 *      a hard error.
 *
 * Bible: 04_CUSTOMER_UX.md § /spec/confirmation, 07_ROLLOUT.md § 8.
 */

import type { Metadata } from 'next';
import { getTDict } from '@/i18n/server';
import SpecConfirmation, {
  type ConfirmationSession,
  type ConfirmationProject,
} from '@/components/spec/SpecConfirmation';
import { getStripe } from '@/lib/shop/stripe';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import type Stripe from 'stripe';

// The confirmation page reads `?session_id=<stripe_session_id>` — it can
// never be statically prerendered. Forces dynamic rendering on every request
// so Stripe + Supabase are consulted live.
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Deposit Confirmed — OPS SPEC',
  robots: { index: false },
};

interface PageProps {
  searchParams: Promise<{ session_id?: string }>;
}

const VALID_TIERS = new Set(['spec01', 'spec02', 'spec03']);

function readTier(metadata: Stripe.Metadata | null | undefined): string | null {
  if (!metadata) return null;
  const tier = (metadata.tier ?? metadata.package ?? '').toString().trim().toLowerCase();
  return VALID_TIERS.has(tier) ? tier : null;
}

async function resolveSession(
  sessionId: string | undefined
): Promise<{ session: ConfirmationSession | null; project: ConfirmationProject | null }> {
  if (!sessionId) return { session: null, project: null };

  let stripeSession: Stripe.Checkout.Session;
  try {
    const stripe = getStripe();
    stripeSession = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['payment_intent', 'customer'],
    });
  } catch (err) {
    console.error('[spec/confirmation] Stripe retrieve failed:', err);
    return { session: null, project: null };
  }

  const metadataType = stripeSession.metadata?.type ?? '';
  if (metadataType !== 'spec_deposit') {
    return { session: null, project: null };
  }

  const isPaid = stripeSession.payment_status === 'paid';
  const tier = readTier(stripeSession.metadata);

  const paymentIntent =
    typeof stripeSession.payment_intent === 'object' &&
    stripeSession.payment_intent !== null
      ? (stripeSession.payment_intent as Stripe.PaymentIntent)
      : null;

  const receiptUrl =
    paymentIntent?.latest_charge && typeof paymentIntent.latest_charge !== 'string'
      ? (paymentIntent.latest_charge as Stripe.Charge).receipt_url ?? null
      : null;

  const session: ConfirmationSession = {
    sessionId: stripeSession.id,
    isPaid,
    tier,
    amountTotal: stripeSession.amount_total ?? null,
    currency: (stripeSession.currency ?? 'cad').toUpperCase(),
    customerEmail:
      stripeSession.customer_details?.email ??
      stripeSession.customer_email ??
      null,
    customerName: stripeSession.customer_details?.name ?? null,
    receiptUrl,
    intakeTokenFromMetadata:
      (stripeSession.metadata?.intake_token ?? '').toString().trim() || null,
    fullPriceCents: Number(stripeSession.metadata?.full_price ?? '') || null,
  };

  // Optional: enrich with Supabase project state. Phase 0 has no project row;
  // Stage C.1 onward stores it. If Supabase env isn't configured (local builds
  // without service-role key), we skip silently.
  let project: ConfirmationProject | null = null;
  const projectIdFromMetadata =
    (stripeSession.metadata?.spec_project_id ?? '').toString().trim() || null;

  if (
    projectIdFromMetadata &&
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.SUPABASE_SERVICE_ROLE_KEY
  ) {
    try {
      const db = getSupabaseAdmin();
      const { data } = await db
        .from('spec_projects')
        .select(
          'id, tier, status, walkthrough_completed_at, intake_token_issued_at, intake_completed_at, scope_doc_signed_at, midpoint_accepted_at, deposit_paid_at, customer_name, locked_total_cents'
        )
        .eq('id', projectIdFromMetadata)
        .maybeSingle();
      if (data) {
        project = data as ConfirmationProject;
      }
    } catch (err) {
      console.warn('[spec/confirmation] Supabase project lookup failed:', err);
    }
  }

  return { session, project };
}

export default async function ConfirmationPage({ searchParams }: PageProps) {
  const { session_id } = await searchParams;
  const dict = await getTDict('spec');
  const { session, project } = await resolveSession(session_id);
  // Read at request time so the live scheduling link can rotate without a
  // redeploy. See bible 04_API_AND_INTEGRATION.md § Environment variables —
  // Stage C.4.
  const discoveryUrl = process.env.SPEC_DISCOVERY_CALENDLY_URL ?? null;

  return (
    <SpecConfirmation
      dict={dict}
      session={session}
      project={project}
      sessionIdProvided={Boolean(session_id)}
      discoveryUrl={discoveryUrl}
    />
  );
}
