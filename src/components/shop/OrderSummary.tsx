'use client';

/**
 * OrderSummary — Sticky sidebar for the checkout page.
 *
 * Shows cart items (thumbnail, name, variant, qty, line price),
 * subtotal, shipping (if known), tax (if known), and total.
 *
 * Design: bg-surface with ultra-thin border, sticky at top-24
 * (accounts for fixed nav height). Kosugi caps for labels,
 * tabular nums for prices.
 */

import Image from 'next/image';
import { useCartStore } from '@/lib/stores/cart';

interface OrderSummaryProps {
  shippingCents?: number;
  taxCents?: number;
}

export default function OrderSummary({ shippingCents, taxCents }: OrderSummaryProps) {
  const items = useCartStore((s) => s.items);
  const subtotalCents = useCartStore((s) => s.subtotalCents());
  const totalCents = subtotalCents + (shippingCents ?? 0) + (taxCents ?? 0);

  return (
    <div className="bg-ops-surface border border-white/[0.06] rounded-[3px] p-5 sticky top-24">
      <span className="font-caption uppercase tracking-[0.1em] text-ops-text-primary text-[10px] block mb-4">
        Order Summary
      </span>

      {/* Items */}
      {items.map((item) => (
        <div key={item.variantId} className="flex gap-2.5 py-2.5 border-b border-white/[0.06]">
          <div className="w-10 h-10 bg-ops-surface-elevated rounded-[2px] flex-shrink-0 overflow-hidden relative">
            {item.imageSrc ? (
              <Image src={item.imageSrc} alt="" fill className="object-cover" sizes="40px" />
            ) : (
              <div className="w-full h-full" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-ops-text-primary text-[9px] font-body uppercase truncate">{item.productName}</p>
            <p className="text-ops-text-secondary text-[8px] font-caption mt-0.5">
              {item.variantLabel} × {item.quantity}
            </p>
          </div>
          <span className="text-ops-accent text-[10px] flex-shrink-0 tabular-nums">
            ${((item.priceCents * item.quantity) / 100).toFixed(2)}
          </span>
        </div>
      ))}

      {/* Totals */}
      <div className="pt-3 space-y-1.5">
        <div className="flex justify-between">
          <span className="font-caption uppercase tracking-[0.1em] text-ops-text-secondary text-[9px]">Subtotal</span>
          <span className="text-ops-text-primary text-[10px] tabular-nums">${(subtotalCents / 100).toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-caption uppercase tracking-[0.1em] text-ops-text-secondary text-[9px]">Shipping</span>
          <span className="text-ops-text-secondary text-[10px] tabular-nums">
            {shippingCents != null ? (shippingCents === 0 ? 'Free' : `$${(shippingCents / 100).toFixed(2)}`) : '—'}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="font-caption uppercase tracking-[0.1em] text-ops-text-secondary text-[9px]">Tax</span>
          <span className="text-ops-text-secondary text-[10px] tabular-nums">
            {taxCents != null ? `$${(taxCents / 100).toFixed(2)}` : '—'}
          </span>
        </div>
        <div className="flex justify-between pt-2 border-t border-ops-border">
          <span className="font-caption uppercase tracking-[0.1em] text-ops-text-primary text-[10px]">Total</span>
          <span className="text-ops-text-primary text-[13px] tabular-nums">${(totalCents / 100).toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}
