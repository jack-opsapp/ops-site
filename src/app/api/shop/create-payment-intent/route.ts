/**
 * POST /api/shop/create-payment-intent
 *
 * Called when user proceeds from Shipping to Payment step.
 * Validates cart, reserves inventory, calculates totals,
 * creates Stripe PaymentIntent, creates order in Supabase.
 */

import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { getStripe } from '@/lib/shop/stripe';
import { generateOrderNumber } from '@/lib/shop/queries';
import type { CreatePaymentIntentRequest, ShopVariant, ShopProduct } from '@/lib/shop/types';

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CreatePaymentIntentRequest;
    const { items, shippingAddress, shippingMethodId, email } = body;

    if (!items?.length || !shippingAddress || !shippingMethodId || !email) {
      return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    const stripe = getStripe();

    // 1. Validate variants and check stock
    const variantIds = items.map((i) => i.variantId);
    const { data: variants, error: variantsError } = await supabase
      .from('shop_variants')
      .select('*, product:shop_products(*)')
      .in('id', variantIds);

    if (variantsError || !variants) {
      return NextResponse.json({ error: 'Failed to validate cart items.' }, { status: 500 });
    }

    const variantMap = new Map(variants.map((v: any) => [v.id, v]));

    for (const item of items) {
      const variant = variantMap.get(item.variantId) as (ShopVariant & { product: ShopProduct }) | undefined;
      if (!variant) {
        return NextResponse.json({ error: `Item not found.` }, { status: 400 });
      }
      const available = variant.stock_quantity - variant.reserved_quantity;
      if (available < item.quantity) {
        return NextResponse.json({
          error: `Insufficient stock for ${variant.product.name}. Available: ${available}.`,
        }, { status: 409 });
      }
    }

    // 2. Reserve inventory
    for (const item of items) {
      await supabase.from('shop_inventory_reservations').insert({
        variant_id: item.variantId,
        quantity: item.quantity,
        stripe_payment_intent_id: 'pending',
      });

      const variant = variantMap.get(item.variantId) as ShopVariant;
      await supabase
        .from('shop_variants')
        .update({ reserved_quantity: variant.reserved_quantity + item.quantity })
        .eq('id', item.variantId);
    }

    // 3. Fetch shipping method
    const { data: shippingMethod } = await supabase
      .from('shop_shipping_methods')
      .select('*')
      .eq('id', shippingMethodId)
      .single();

    if (!shippingMethod) {
      return NextResponse.json({ error: 'Invalid shipping method.' }, { status: 400 });
    }

    // 4. Calculate totals
    let subtotalCents = 0;
    for (const item of items) {
      const variant = variantMap.get(item.variantId) as ShopVariant;
      subtotalCents += variant.price_cents * item.quantity;
    }

    const shippingCents =
      shippingMethod.min_order_cents != null && subtotalCents >= shippingMethod.min_order_cents
        ? 0
        : shippingMethod.price_cents;

    // Tax: Stripe Tax integration requires account configuration.
    // For now, set to 0. Integrate Stripe Tax when account is configured.
    const taxCents = 0;

    const totalCents = subtotalCents + shippingCents + taxCents;

    // 5. Create Stripe PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalCents,
      currency: 'usd',
      metadata: {
        source: 'ops-merch-store',
        email,
      },
    });

    // Update reservations with actual PI ID
    for (const item of items) {
      await supabase
        .from('shop_inventory_reservations')
        .update({ stripe_payment_intent_id: paymentIntent.id })
        .eq('variant_id', item.variantId)
        .eq('stripe_payment_intent_id', 'pending');
    }

    // 6. Create order
    const orderNumber = await generateOrderNumber();

    const orderItems = items.map((item) => {
      const variant = variantMap.get(item.variantId) as any;
      const product = variant.product as ShopProduct;
      return {
        product_id: product.id,
        variant_id: variant.id,
        product_name: product.name,
        variant_label: variant.sku,
        sku: variant.sku,
        image_url: product.images?.[0] ?? null,
        unit_price_cents: variant.price_cents,
        quantity: item.quantity,
        option_values: null,
      };
    });

    const { data: order, error: orderError } = await supabase
      .from('shop_orders')
      .insert({
        order_number: orderNumber,
        email,
        shipping_address: shippingAddress,
        shipping_method_id: shippingMethodId,
        subtotal_cents: subtotalCents,
        shipping_cents: shippingCents,
        tax_cents: taxCents,
        total_cents: totalCents,
        stripe_payment_intent_id: paymentIntent.id,
        status: 'pending',
      })
      .select('id')
      .single();

    if (orderError || !order) {
      console.error('Order creation error:', orderError);
      return NextResponse.json({ error: 'Failed to create order.' }, { status: 500 });
    }

    await supabase.from('shop_order_items').insert(
      orderItems.map((oi) => ({ ...oi, order_id: order.id }))
    );

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      orderId: order.id,
      taxCents,
      shippingCents,
      totalCents,
    });
  } catch (err) {
    console.error('create-payment-intent error:', err);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
