/**
 * GET /api/tailored/checkout-session?session_id=X
 *
 * Retrieves a completed Stripe Checkout Session for the confirmation page.
 */

import { NextResponse } from 'next/server';
import { getStripe } from '@/lib/shop/stripe';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('session_id');

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Missing session_id parameter.' },
        { status: 400 }
      );
    }

    const stripe = getStripe();
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    return NextResponse.json({
      package: session.metadata?.package ?? 'unknown',
      amount: session.amount_total,
      currency: session.currency,
      customerEmail: session.customer_details?.email ?? null,
      status: session.payment_status,
      fullPrice: session.metadata?.full_price ?? null,
    });
  } catch (err) {
    console.error('Checkout session retrieval error:', err);
    return NextResponse.json(
      { error: 'Failed to retrieve session.' },
      { status: 500 }
    );
  }
}
