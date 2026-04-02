/**
 * /shop/confirmation — Order confirmation page
 *
 * Server component. Fetches order by ID from query param.
 * Shows animated checkmark, order number, itemized receipt,
 * shipping address, and "Back to Shop" CTA.
 *
 * Emotional beat: Achievement — clean, sharp acknowledgment.
 * Not a parade, a stamp. The checkmark is the peak moment.
 */

import { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { getOrderWithItems } from '@/lib/shop/queries';
import FadeInUp from '@/components/ui/FadeInUp';

export const metadata: Metadata = {
  title: 'Order Confirmed — OPS Gear',
};

interface ConfirmationPageProps {
  searchParams: Promise<{ order?: string }>;
}

export default async function ConfirmationPage({ searchParams }: ConfirmationPageProps) {
  const { order: orderId } = await searchParams;

  if (!orderId) redirect('/shop');

  const order = await getOrderWithItems(orderId);
  if (!order) notFound();

  const address = order.shipping_address;

  return (
    <div className="pt-24 pb-20 px-6 md:px-10 max-w-[600px] mx-auto text-center">
      {/* Checkmark — the peak moment */}
      <FadeInUp>
        <div className="w-12 h-12 border-2 border-ops-accent rounded-full mx-auto mb-5 flex items-center justify-center">
          <span className="text-ops-accent text-xl" aria-hidden="true">✓</span>
        </div>

        <h1 className="font-heading text-ops-text-primary text-xl font-light uppercase tracking-[0.05em] mb-2">
          Order Confirmed
        </h1>
        <p className="text-ops-text-secondary text-xs font-caption mb-1">
          {order.order_number}
        </p>
        <p className="text-ops-text-secondary text-xs font-body mb-8">
          Confirmation sent to {order.email}
        </p>
      </FadeInUp>

      {/* Order summary card */}
      <FadeInUp delay={0.1}>
        <div className="bg-ops-surface border border-white/[0.06] rounded-[3px] p-5 text-left mb-6">
          {order.items.map((item) => (
            <div key={item.id} className="flex gap-2.5 py-2 border-b border-white/[0.06] last:border-b-0">
              <div className="w-9 h-9 bg-ops-surface-elevated rounded-[2px] flex-shrink-0 overflow-hidden relative">
                {item.image_url ? (
                  <Image src={item.image_url} alt="" fill className="object-cover" sizes="36px" />
                ) : (
                  <div className="w-full h-full" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-ops-text-primary text-[9px] font-body uppercase truncate">
                  {item.product_name}
                </p>
                <p className="text-ops-text-secondary text-[8px] font-caption mt-0.5">
                  {item.variant_label} × {item.quantity}
                </p>
              </div>
              <span className="text-ops-accent text-[10px] flex-shrink-0 tabular-nums">
                ${((item.unit_price_cents * item.quantity) / 100).toFixed(2)}
              </span>
            </div>
          ))}

          {/* Totals */}
          <div className="pt-3 space-y-1.5">
            <div className="flex justify-between">
              <span className="font-caption uppercase tracking-[0.1em] text-ops-text-secondary text-[9px]">Subtotal</span>
              <span className="text-ops-text-primary text-[10px] tabular-nums">${(order.subtotal_cents / 100).toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-caption uppercase tracking-[0.1em] text-ops-text-secondary text-[9px]">Shipping</span>
              <span className="text-ops-text-primary text-[10px] tabular-nums">
                {order.shipping_cents === 0 ? 'Free' : `$${(order.shipping_cents / 100).toFixed(2)}`}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-caption uppercase tracking-[0.1em] text-ops-text-secondary text-[9px]">Tax</span>
              <span className="text-ops-text-primary text-[10px] tabular-nums">${(order.tax_cents / 100).toFixed(2)}</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-ops-border">
              <span className="font-caption uppercase tracking-[0.1em] text-ops-text-primary text-[10px]">Total</span>
              <span className="text-ops-text-primary text-[13px] tabular-nums">${(order.total_cents / 100).toFixed(2)}</span>
            </div>
          </div>
        </div>
      </FadeInUp>

      {/* Shipping address */}
      <FadeInUp delay={0.2}>
        <div className="bg-ops-surface border border-white/[0.06] rounded-[3px] px-5 py-4 text-left mb-8">
          <span className="font-caption uppercase tracking-[0.15em] text-[8px] text-ops-text-secondary block mb-2">
            Shipping To
          </span>
          <p className="text-ops-text-primary text-[11px] font-body leading-relaxed">
            {address.firstName} {address.lastName}<br />
            {address.line1}<br />
            {address.line2 && <>{address.line2}<br /></>}
            {address.city}, {address.state} {address.zip}
          </p>
        </div>
      </FadeInUp>

      {/* Back to Shop CTA */}
      <FadeInUp delay={0.3}>
        <Link
          href="/shop"
          className="inline-flex items-center justify-center font-caption uppercase tracking-[0.15em] text-xs px-6 py-3 rounded-[3px] bg-transparent text-ops-text-primary border border-ops-border hover:border-ops-border-hover transition-all duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ops-accent"
        >
          Back to Shop
        </Link>
      </FadeInUp>
    </div>
  );
}
