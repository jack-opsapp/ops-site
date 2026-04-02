/**
 * POST /api/shop/webhook
 *
 * Stripe webhook handler. Safety net for payment events.
 * Handles payment_intent.succeeded (confirms order if pending)
 * and payment_intent.payment_failed (releases reservations, cancels order).
 *
 * Uses raw request body for Stripe signature verification.
 * Requires STRIPE_WEBHOOK_SECRET env var (separate from OPS-Web's webhook secret).
 */

import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { getStripe } from '@/lib/shop/stripe';
import type Stripe from 'stripe';

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature header.' }, { status: 400 });
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error('[SHOP WEBHOOK] STRIPE_WEBHOOK_SECRET not configured.');
    return NextResponse.json({ error: 'Webhook not configured.' }, { status: 500 });
  }

  let event: Stripe.Event;

  try {
    const stripe = getStripe();
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error('[SHOP WEBHOOK] Signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature.' }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();

  switch (event.type) {
    case 'payment_intent.succeeded': {
      const pi = event.data.object as Stripe.PaymentIntent;
      console.log(`[SHOP WEBHOOK] payment_intent.succeeded: ${pi.id}`);

      const { data: order } = await supabase
        .from('shop_orders')
        .select('id, status')
        .eq('stripe_payment_intent_id', pi.id)
        .maybeSingle();

      if (order && order.status === 'pending') {
        // Confirm the order (same logic as confirm-order route — idempotent)
        await supabase
          .from('shop_orders')
          .update({ status: 'paid', paid_at: new Date().toISOString() })
          .eq('id', order.id);

        const { data: orderItems } = await supabase
          .from('shop_order_items')
          .select('variant_id, quantity')
          .eq('order_id', order.id);

        if (orderItems) {
          for (const item of orderItems) {
            if (!item.variant_id) continue;
            const { data: variant } = await supabase
              .from('shop_variants')
              .select('stock_quantity, reserved_quantity')
              .eq('id', item.variant_id)
              .single();

            if (variant) {
              await supabase
                .from('shop_variants')
                .update({
                  stock_quantity: variant.stock_quantity - item.quantity,
                  reserved_quantity: Math.max(0, variant.reserved_quantity - item.quantity),
                })
                .eq('id', item.variant_id);
            }
          }
        }

        await supabase
          .from('shop_inventory_reservations')
          .delete()
          .eq('stripe_payment_intent_id', pi.id);

        console.log(`[SHOP WEBHOOK] Order confirmed via webhook: ${order.id}`);
      }
      break;
    }

    case 'payment_intent.payment_failed': {
      const pi = event.data.object as Stripe.PaymentIntent;
      console.log(`[SHOP WEBHOOK] payment_intent.payment_failed: ${pi.id}`);

      // Release inventory reservations
      const { data: reservations } = await supabase
        .from('shop_inventory_reservations')
        .select('variant_id, quantity')
        .eq('stripe_payment_intent_id', pi.id);

      if (reservations) {
        for (const res of reservations) {
          const { data: variant } = await supabase
            .from('shop_variants')
            .select('reserved_quantity')
            .eq('id', res.variant_id)
            .single();

          if (variant) {
            await supabase
              .from('shop_variants')
              .update({ reserved_quantity: Math.max(0, variant.reserved_quantity - res.quantity) })
              .eq('id', res.variant_id);
          }
        }
      }

      await supabase
        .from('shop_inventory_reservations')
        .delete()
        .eq('stripe_payment_intent_id', pi.id);

      // Cancel the order
      await supabase
        .from('shop_orders')
        .update({ status: 'cancelled' })
        .eq('stripe_payment_intent_id', pi.id);

      console.log(`[SHOP WEBHOOK] Order cancelled due to payment failure: ${pi.id}`);
      break;
    }
  }

  return NextResponse.json({ received: true });
}
