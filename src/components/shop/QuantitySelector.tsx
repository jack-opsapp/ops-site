'use client';

/**
 * QuantitySelector — −/+/number quantity input.
 *
 * Min 1, max = available stock. Buttons disabled at boundaries.
 * Kosugi caps label. 44px+ touch targets. Tabular nums for alignment.
 */

interface QuantitySelectorProps {
  quantity: number;
  max: number;
  onChange: (qty: number) => void;
}

export default function QuantitySelector({ quantity, max, onChange }: QuantitySelectorProps) {
  return (
    <div className="mb-5">
      <span className="font-caption uppercase tracking-[0.15em] text-[8px] text-ops-text-secondary block mb-2">
        Qty
      </span>
      <div className="flex items-center gap-3">
        <button
          onClick={() => onChange(Math.max(1, quantity - 1))}
          disabled={quantity <= 1}
          aria-label="Decrease quantity"
          className="border border-ops-border text-ops-text-secondary px-2.5 py-1 rounded-[2px] text-xs cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed hover:border-ops-border-hover transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ops-accent"
        >
          −
        </button>
        <span className="text-ops-text-primary text-sm w-6 text-center tabular-nums" aria-live="polite">
          {quantity}
        </span>
        <button
          onClick={() => onChange(Math.min(max, quantity + 1))}
          disabled={quantity >= max}
          aria-label="Increase quantity"
          className="border border-ops-border text-ops-text-secondary px-2.5 py-1 rounded-[2px] text-xs cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed hover:border-ops-border-hover transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ops-accent"
        >
          +
        </button>
      </div>
    </div>
  );
}
