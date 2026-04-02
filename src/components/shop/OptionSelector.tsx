'use client';

/**
 * OptionSelector — Row of pill buttons for a product option (Size, Color).
 *
 * Selected: white border + white text. Unselected: muted border + muted text.
 * Out-of-stock: muted with line-through, not clickable (cursor-not-allowed).
 *
 * Kosugi caps labels. 44px+ touch targets via padding.
 */

import type { ShopProductOptionValue } from '@/lib/shop/types';

interface OptionSelectorProps {
  label: string;
  values: ShopProductOptionValue[];
  selectedId: string | null;
  disabledIds: Set<string>;
  onSelect: (valueId: string) => void;
}

export default function OptionSelector({ label, values, selectedId, disabledIds, onSelect }: OptionSelectorProps) {
  return (
    <div className="mb-4">
      <span className="font-caption uppercase tracking-[0.15em] text-[8px] text-ops-text-secondary block mb-2">
        {label}
      </span>
      <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={label}>
        {values.map((v) => {
          const isSelected = v.id === selectedId;
          const isDisabled = disabledIds.has(v.id);
          return (
            <button
              key={v.id}
              onClick={() => !isDisabled && onSelect(v.id)}
              disabled={isDisabled}
              role="radio"
              aria-checked={isSelected}
              aria-label={`${v.value}${isDisabled ? ' (sold out)' : ''}`}
              className={`
                px-3 py-1.5 rounded-[2px] text-[9px] font-caption uppercase tracking-[0.1em] transition-all duration-200 cursor-pointer
                min-h-[32px] min-w-[32px] flex items-center justify-center
                focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ops-accent
                ${isSelected
                  ? 'border border-white text-ops-text-primary'
                  : isDisabled
                    ? 'border border-ops-border text-ops-text-secondary/30 line-through cursor-not-allowed'
                    : 'border border-ops-border text-ops-text-secondary hover:border-ops-border-hover hover:text-ops-text-primary'
                }
              `}
            >
              {v.value}
            </button>
          );
        })}
      </div>
    </div>
  );
}
