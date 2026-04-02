'use client';

/**
 * CartItem — Single item row in the cart drawer.
 *
 * Shows thumbnail, product name, variant label, quantity adjuster, and line price.
 * Remove button (×) on desktop. Quantity buttons disabled at boundaries (min 1, max stock).
 *
 * Design: OPS surface elevated for thumbnail bg, accent color for price,
 * Kosugi caps for labels, 44px+ touch targets on quantity buttons.
 */

import Image from 'next/image';
import { useCartStore } from '@/lib/stores/cart';
import type { CartItem as CartItemType } from '@/lib/shop/types';

interface CartItemProps {
  item: CartItemType;
}

export default function CartItem({ item }: CartItemProps) {
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);

  const linePrice = item.priceCents * item.quantity;

  return (
    <div className="flex gap-3 py-3 border-b border-white/[0.06]">
      {/* Thumbnail — 50×50, surface elevated bg */}
      <div className="w-[50px] h-[50px] bg-ops-surface-elevated rounded-[2px] flex-shrink-0 overflow-hidden relative">
        {item.imageSrc ? (
          <Image
            src={item.imageSrc}
            alt={item.productName}
            fill
            className="object-cover"
            sizes="50px"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-white/20 text-[7px] font-caption uppercase">IMG</span>
          </div>
        )}
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-ops-text-primary text-[10px] font-body uppercase tracking-[0.05em] truncate">
              {item.productName}
            </p>
            <p className="text-ops-text-secondary text-[9px] font-caption uppercase tracking-[0.1em] mt-0.5">
              {item.variantLabel}
            </p>
          </div>
          <button
            onClick={() => removeItem(item.variantId)}
            className="text-ops-text-secondary hover:text-ops-text-primary transition-colors text-sm cursor-pointer flex-shrink-0 p-1 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ops-accent rounded-[2px]"
            aria-label={`Remove ${item.productName} from cart`}
          >
            ×
          </button>
        </div>

        <div className="flex items-center justify-between mt-2">
          {/* Quantity adjuster — min 44px touch targets via padding */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
              disabled={item.quantity <= 1}
              className="border border-ops-border text-ops-text-secondary px-2 py-1 rounded-[2px] text-[9px] cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed hover:border-ops-border-hover transition-colors min-w-[28px] min-h-[28px] flex items-center justify-center focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ops-accent"
              aria-label="Decrease quantity"
            >
              −
            </button>
            <span className="text-ops-text-primary text-[10px] w-4 text-center tabular-nums">{item.quantity}</span>
            <button
              onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
              disabled={item.quantity >= item.maxQuantity}
              className="border border-ops-border text-ops-text-secondary px-2 py-1 rounded-[2px] text-[9px] cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed hover:border-ops-border-hover transition-colors min-w-[28px] min-h-[28px] flex items-center justify-center focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ops-accent"
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>

          {/* Line price in accent */}
          <span className="text-ops-accent text-[11px] tabular-nums">
            ${(linePrice / 100).toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
}
