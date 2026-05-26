/**
 * POST /api/spec/create-checkout-session
 *
 * Creates a Stripe Checkout Session for a SPEC package deposit.
 * Returns the Stripe hosted checkout URL for client redirect.
 *
 * The completed event lands on /api/shop/webhook (the consolidated
 * Stripe handler) and is dispatched on metadata.type === 'spec_deposit'.
 *
 * Phase 0 safety: gated by `SPEC_LIVE_DEPOSITS_ENABLED`. While false
 * (default), the route returns 503 and the page renders "Talk to the
 * founder" CTAs instead of "Pay Deposit" so we don't run automated live
 * deposits against an endpoint missing Phase 1 gates (auth, company,
 * billing-address / Quebec attestation, Stripe Tax, ToS consent, full
 * metadata, project row pre-creation). See SPEC/07_ROLLOUT.md § Phase 0.
 */

import { NextResponse } from 'next/server';
import { getStripe } from '@/lib/shop/stripe';

function depositsLive(): boolean {
  return process.env.SPEC_LIVE_DEPOSITS_ENABLED === 'true';
}

const PACKAGES = {
  setup: {
    name: 'OPS SPEC — Setup',
    fullPrice: 300000,   // $3,000 in cents
    deposit: 150000,     // $1,500
  },
  build: {
    name: 'OPS SPEC — Build',
    fullPrice: 850000,   // $8,500
    deposit: 425000,     // $4,250
  },
  enterprise: {
    name: 'OPS SPEC — Enterprise',
    fullPrice: 1800000,  // $18,000
    deposit: 900000,     // $9,000
  },
} as const;

type PackageKey = keyof typeof PACKAGES;

interface RequestBody {
  package: string;
}

export async function POST(request: Request) {
  // Phase 0 safety gate — automated deposits are paused until Phase 1 lands.
  if (!depositsLive()) {
    return NextResponse.json(
      {
        error: 'Deposits are paused. Please use the contact form to talk to the founder.',
        contactUrl: '/resources#contact',
      },
      { status: 503 },
    );
  }

  try {
    const body = (await request.json()) as RequestBody;
    const pkgKey = body.package as PackageKey;

    if (!pkgKey || !(pkgKey in PACKAGES)) {
      return NextResponse.json(
        { error: 'Invalid package. Must be setup, build, or enterprise.' },
        { status: 400 }
      );
    }

    const pkg = PACKAGES[pkgKey];
    const stripe = getStripe();
    const origin = request.headers.get('origin') ?? 'https://opsapp.co';

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'cad',
            product_data: {
              name: `${pkg.name} — 50% Deposit`,
              description: `Deposit for ${pkg.name}. Remaining balance due at delivery.`,
            },
            unit_amount: pkg.deposit,
          },
          quantity: 1,
        },
      ],
      metadata: {
        type: 'spec_deposit',
        package: pkgKey,
        deposit_amount: String(pkg.deposit),
        full_price: String(pkg.fullPrice),
      },
      success_url: `${origin}/spec/confirmation?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/spec`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error('SPEC checkout error:', err);
    return NextResponse.json(
      { error: 'Failed to create checkout session.' },
      { status: 500 }
    );
  }
}
