'use client';

/**
 * ProductExpanded — Inline card expansion (product detail view).
 *
 * THE SIGNATURE INTERACTION. When a ProductCard is clicked, it morphs to
 * full grid width via Framer Motion layoutId. The card becomes two-column:
 * image gallery (left) + product details with options/qty/add-to-cart (right).
 * Siblings push down with spring physics.
 *
 * Emotional beat: Discovery → Commitment. The expansion rewards the click
 * with rich detail. The add-to-cart button carries weight — brief checkmark
 * morph on success acknowledges the action matters.
 *
 * Animation sequence:
 * 1. Card morphs to full width (layoutId, 400ms, project easing)
 * 2. Right column details fade in (opacity 0→1, 200ms delay after morph)
 * 3. On close: reverse — details fade out, card morphs back
 *
 * Reduced motion: instant expansion (no morph), instant detail reveal.
 *
 * Stock awareness:
 * - Out of stock: "SOLD OUT" disabled button
 * - Low stock (≤3): "Only X left" warning
 * - Reserved quantity subtracted from available stock
 *
 * Variant selection: tracks selected option values per option.
 * Finds matching variant from the product's variant list.
 * Out-of-stock combinations are disabled (strikethrough).
 */

import { useState, useMemo, useCallback } from 'react';
import Image from 'next/image';
import { motion, useReducedMotion } from 'framer-motion';
import { theme } from '@/lib/theme';
import { useCartStore } from '@/lib/stores/cart';
import OptionSelector from './OptionSelector';
import QuantitySelector from './QuantitySelector';
import type { ShopProductWithDetails, ShopProductOptionValue } from '@/lib/shop/types';

interface ProductExpandedProps {
  product: ShopProductWithDetails;
  onClose: () => void;
}

export default function ProductExpanded({ product, onClose }: ProductExpandedProps) {
  const addItem = useCartStore((s) => s.addItem);
  const shouldReduceMotion = useReducedMotion();

  // Track selected option values: { optionId: selectedValueId }
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>(() => {
    const defaults: Record<string, string> = {};
    for (const opt of product.options) {
      if (opt.values.length > 0) {
        defaults[opt.id] = opt.values[0].id;
      }
    }
    return defaults;
  });

  const [quantity, setQuantity] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [addedFeedback, setAddedFeedback] = useState(false);

  // Find the variant matching current selections
  const selectedVariant = useMemo(() => {
    const selectedValueIds = new Set(Object.values(selectedOptions));
    return product.variants.find((v) =>
      v.option_values.length === selectedValueIds.size &&
      v.option_values.every((ov) => selectedValueIds.has(ov.id))
    ) ?? null;
  }, [product.variants, selectedOptions]);

  const availableStock = selectedVariant
    ? selectedVariant.stock_quantity - selectedVariant.reserved_quantity
    : 0;

  const isSoldOut = availableStock <= 0;
  const isLowStock = availableStock > 0 && availableStock <= 3;

  const displayPrice = selectedVariant?.price_cents ?? product.price_cents;

  // Build the variant label from selected option values
  const variantLabel = useMemo(() => {
    return product.options
      .map((opt) => {
        const valueId = selectedOptions[opt.id];
        const value = opt.values.find((v) => v.id === valueId);
        return value?.value ?? '';
      })
      .filter(Boolean)
      .join(' / ');
  }, [product.options, selectedOptions]);

  // Determine which option values lead to out-of-stock variants
  const getDisabledIds = useCallback((optionId: string): Set<string> => {
    const disabled = new Set<string>();
    const option = product.options.find(o => o.id === optionId);
    if (!option) return disabled;

    for (const value of option.values) {
      // Test: would selecting this value lead to any in-stock variant?
      const testSelections = { ...selectedOptions, [optionId]: value.id };
      const testValueIds = new Set(Object.values(testSelections));
      const matchingVariant = product.variants.find((v) =>
        v.option_values.length === testValueIds.size &&
        v.option_values.every((ov) => testValueIds.has(ov.id))
      );
      if (!matchingVariant || (matchingVariant.stock_quantity - matchingVariant.reserved_quantity) <= 0) {
        disabled.add(value.id);
      }
    }
    return disabled;
  }, [product.options, product.variants, selectedOptions]);

  const handleAddToCart = () => {
    if (!selectedVariant || isSoldOut) return;
    addItem({
      productId: product.id,
      variantId: selectedVariant.id,
      productName: product.name,
      variantLabel,
      imageSrc: product.images[0] ?? '',
      priceCents: selectedVariant.price_cents,
      quantity,
      maxQuantity: availableStock,
    });
    // Checkmark feedback — brief morph (500ms) then revert
    setAddedFeedback(true);
    setTimeout(() => setAddedFeedback(false), 1200);
  };

  return (
    <motion.div
      layout
      layoutId={`product-card-${product.id}`}
      className="bg-ops-surface border border-white/15 rounded-[3px] overflow-hidden col-span-full"
      transition={
        shouldReduceMotion
          ? { layout: { duration: 0 } }
          : { layout: { duration: 0.4, ease: theme.animation.easing } }
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
        {/* Left: Image gallery */}
        <div className="bg-ops-surface-elevated p-6 flex flex-col gap-3">
          <div className="relative aspect-square rounded-[2px] overflow-hidden">
            {product.images[activeImageIndex] ? (
              <Image
                src={product.images[activeImageIndex]}
                alt={`${product.name} — image ${activeImageIndex + 1}`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-24 h-24 border-2 border-white/15 rounded-[2px] flex items-center justify-center">
                  <span className="text-white/30 text-[10px] font-caption uppercase">IMG</span>
                </div>
              </div>
            )}
          </div>
          {/* Thumbnails — only if multiple images */}
          {product.images.length > 1 && (
            <div className="flex gap-2">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImageIndex(i)}
                  aria-label={`View image ${i + 1}`}
                  className={`
                    w-11 h-11 rounded-[2px] overflow-hidden relative cursor-pointer flex-shrink-0
                    border transition-colors duration-200
                    ${i === activeImageIndex ? 'border-ops-accent' : 'border-ops-border hover:border-ops-border-hover'}
                    focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ops-accent
                  `}
                >
                  <Image src={img} alt="" fill className="object-cover" sizes="44px" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Product details — fades in after expansion */}
        <motion.div
          initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={
            shouldReduceMotion
              ? { duration: 0 }
              : { duration: 0.2, delay: 0.2, ease: theme.animation.easing }
          }
          className="p-6 flex flex-col"
        >
          {/* Header: category label + close button */}
          <div className="flex items-start justify-between mb-4">
            <span className="font-caption uppercase tracking-[0.15em] text-[9px] text-ops-accent">
              {product.category.name}
            </span>
            <button
              onClick={onClose}
              aria-label="Close product detail"
              className="text-ops-text-secondary hover:text-ops-text-primary text-lg cursor-pointer transition-colors -mt-1 p-1 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ops-accent rounded-[2px]"
            >
              ×
            </button>
          </div>

          <h3 className="font-heading text-ops-text-primary text-lg font-light uppercase tracking-[0.05em] mb-1">
            {product.name}
          </h3>
          <p className="text-ops-accent text-sm mb-3 tabular-nums">
            ${(displayPrice / 100).toFixed(2)}
          </p>
          {product.description && (
            <p className="text-ops-text-secondary text-[10px] font-body leading-[1.7] mb-5 max-w-sm">
              {product.description}
            </p>
          )}

          {/* Option selectors */}
          {product.options.map((opt) => (
            <OptionSelector
              key={opt.id}
              label={opt.name}
              values={opt.values}
              selectedId={selectedOptions[opt.id] ?? null}
              disabledIds={getDisabledIds(opt.id)}
              onSelect={(valueId) =>
                setSelectedOptions((prev) => ({ ...prev, [opt.id]: valueId }))
              }
            />
          ))}

          {/* Quantity — only if not sold out */}
          {!isSoldOut && (
            <QuantitySelector
              quantity={quantity}
              max={availableStock}
              onChange={setQuantity}
            />
          )}

          {/* Low stock warning */}
          {isLowStock && (
            <p className="text-ops-text-secondary text-[9px] font-caption mb-3">
              Only {availableStock} left
            </p>
          )}

          {/* Add to Cart — sits at bottom */}
          <div className="mt-auto">
            <button
              onClick={handleAddToCart}
              disabled={isSoldOut || !selectedVariant}
              aria-label={
                isSoldOut
                  ? 'Sold out'
                  : `Add ${product.name} to cart for $${((displayPrice * quantity) / 100).toFixed(2)}`
              }
              className={`
                w-full py-3 rounded-[2px] font-caption uppercase tracking-[0.15em] text-xs transition-all duration-200 cursor-pointer
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ops-accent focus-visible:ring-offset-2 focus-visible:ring-offset-ops-surface
                ${isSoldOut || !selectedVariant
                  ? 'bg-ops-surface-elevated text-ops-text-secondary/50 cursor-not-allowed'
                  : addedFeedback
                    ? 'bg-ops-accent text-white'
                    : 'bg-ops-text-primary text-ops-background hover:bg-white/90 active:bg-white/80'
                }
              `}
            >
              {isSoldOut
                ? 'Sold Out'
                : addedFeedback
                  ? '\u2713'
                  : `Add to Cart — $${((displayPrice * quantity) / 100).toFixed(2)}`
              }
            </button>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
