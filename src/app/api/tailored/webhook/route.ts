/**
 * POST /api/tailored/webhook
 *
 * Stripe webhook for Tailored deposit events.
 * Verifies signature, processes checkout.session.completed.
 */

import { NextResponse } from 'next/server';
import { getStripe } from '@/lib/shop/stripe';
import type Stripe from 'stripe';

export async function POST(request: Request) {
  const stripe = getStripe();
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'Missing signature.' }, { status: 400 });
  }

  const webhookSecret = process.env.STRIPE_TAILORED_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error('Missing STRIPE_TAILORED_WEBHOOK_SECRET env var.');
    return NextResponse.json({ error: 'Webhook not configured.' }, { status: 500 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature.' }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const metadata = session.metadata ?? {};

    // Only process tailored deposits
    if (metadata.type !== 'tailored_deposit') {
      return NextResponse.json({ received: true });
    }

    console.log('[Tailored Webhook] Deposit received:', {
      package: metadata.package,
      deposit: metadata.deposit_amount,
      fullPrice: metadata.full_price,
      email: session.customer_details?.email,
      sessionId: session.id,
    });

    // Future: write to Supabase tailored_deposits table
    // Future: trigger intake interview link generation
    // Future: send confirmation email
  }

  return NextResponse.json({ received: true });
}
