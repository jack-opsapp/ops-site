/**
 * POST /api/shop/confirm-order
 *
 * Called after Stripe.js confirmPayment succeeds on the client.
 * Verifies payment, updates order status, deducts stock, clears reservations.
 * Idempotent — safe to call multiple times for the same order.
 */

import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { getStripe } from '@/lib/shop/stripe';

export async function POST(request: Request) {
  try {
    const { orderId, paymentIntentId } = (await request.json()) as {
      orderId: string;
      paymentIntentId: string;
    };

    if (!orderId || !paymentIntentId) {
      return NextResponse.json({ error: 'Missing orderId or paymentIntentId.' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    const stripe = getStripe();

    // 1. Verify payment succeeded
    const pi = await stripe.paymentIntents.retrieve(paymentIntentId);
    if (pi.status !== 'succeeded') {
      return NextResponse.json({ error: `Payment not successful. Status: ${pi.status}` }, { status: 400 });
    }

    // 2. Fetch order
    const { data: order, error: orderError } = await supabase
      .from('shop_orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      return NextResponse.json({ error: 'Order not found.' }, { status: 404 });
    }

    // Idempotency: if already paid, return success
    if (order.status === 'paid') {
      return NextResponse.json({ success: true, orderNumber: order.order_number });
    }

    // 3. Update order status to paid
    await supabase
      .from('shop_orders')
      .update({ status: 'paid', paid_at: new Date().toISOString() })
      .eq('id', orderId);

    // 4. Deduct actual stock and clear reserved quantity
    const { data: orderItems } = await supabase
      .from('shop_order_items')
      .select('variant_id, quantity')
      .eq('order_id', orderId);

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

    // 5. Clear reservations for this payment intent
    await supabase
      .from('shop_inventory_reservations')
      .delete()
      .eq('stripe_payment_intent_id', paymentIntentId);

    // 6. Log confirmation (email integration to be added when SendGrid/Resend is configured)
    console.log(`[SHOP] Order confirmed: ${order.order_number} — email: ${order.email}`);

    return NextResponse.json({ success: true, orderNumber: order.order_number });
  } catch (err) {
    console.error('confirm-order error:', err);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
