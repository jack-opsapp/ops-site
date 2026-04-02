'use client';

/**
 * ShippingMethodSelector — Radio buttons for selecting a shipping method.
 *
 * Each option shows: name, description, price (or "Free" if qualifies).
 * Selected option: white/25 border + elevated bg. Unselected: default border.
 *
 * Hides "Free Shipping" option if subtotal doesn't meet min_order_cents.
 * Shows effective price (0 if qualifies for free via a paid method's threshold).
 */

import type { ShopShippingMethod } from '@/lib/shop/types';

interface ShippingMethodSelectorProps {
  methods: ShopShippingMethod[];
  selectedId: string | null;
  subtotalCents: number;
  onSelect: (id: string) => void;
}

export default function ShippingMethodSelector({ methods, selectedId, subtotalCents, onSelect }: ShippingMethodSelectorProps) {
  return (
    <div className="mb-6">
      <span className="font-caption uppercase tracking-[0.15em] text-[8px] text-ops-text-secondary block mb-3">
        Shipping Method
      </span>
      <div className="space-y-2" role="radiogroup" aria-label="Shipping method">
        {methods.map((method) => {
          const isFreeByThreshold = method.min_order_cents != null && subtotalCents >= method.min_order_cents;
          const effectivePrice = isFreeByThreshold ? 0 : method.price_cents;

          // Hide the "Free Shipping" method if subtotal doesn't qualify
          if (method.price_cents === 0 && method.min_order_cents != null && subtotalCents < method.min_order_cents) {
            return null;
          }

          return (
            <label
              key={method.id}
              className={`
                flex items-center gap-3 p-3 rounded-[2px] border cursor-pointer transition-colors duration-200
                focus-within:ring-1 focus-within:ring-ops-accent
                ${selectedId === method.id
                  ? 'border-white/25 bg-ops-surface-elevated'
                  : 'border-ops-border hover:border-ops-border-hover'
                }
              `}
            >
              <input
                type="radio"
                name="shipping-method"
                value={method.id}
                checked={selectedId === method.id}
                onChange={() => onSelect(method.id)}
                className="accent-white w-4 h-4 cursor-pointer"
              />
              <div className="flex-1">
                <p className="text-ops-text-primary text-[10px] font-body uppercase tracking-[0.05em]">
                  {method.name}
                </p>
                {method.description && (
                  <p className="text-ops-text-secondary text-[9px] mt-0.5">{method.description}</p>
                )}
              </div>
              <span className="text-ops-accent text-[10px] tabular-nums">
                {effectivePrice === 0 ? 'Free' : `$${(effectivePrice / 100).toFixed(2)}`}
              </span>
            </label>
          );
        })}
      </div>
    </div>
  );
}
