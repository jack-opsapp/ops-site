/**
 * POST /api/tailored/create-checkout-session
 *
 * Creates a Stripe Checkout Session for a Tailored package deposit.
 * Returns the Stripe hosted checkout URL for client redirect.
 */

import { NextResponse } from 'next/server';
import { getStripe } from '@/lib/shop/stripe';

const PACKAGES = {
  setup: {
    name: 'OPS Tailored — Setup',
    fullPrice: 300000,   // $3,000 in cents
    deposit: 150000,     // $1,500
  },
  build: {
    name: 'OPS Tailored — Build',
    fullPrice: 850000,   // $8,500
    deposit: 425000,     // $4,250
  },
  enterprise: {
    name: 'OPS Tailored — Enterprise',
    fullPrice: 1800000,  // $18,000
    deposit: 900000,     // $9,000
  },
} as const;

type PackageKey = keyof typeof PACKAGES;

interface RequestBody {
  package: string;
}

export async function POST(request: Request) {
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
        type: 'tailored_deposit',
        package: pkgKey,
        deposit_amount: String(pkg.deposit),
        full_price: String(pkg.fullPrice),
      },
      success_url: `${origin}/tailored/confirmation?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/tailored`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error('Tailored checkout error:', err);
    return NextResponse.json(
      { error: 'Failed to create checkout session.' },
      { status: 500 }
    );
  }
}
