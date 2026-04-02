'use client';

/**
 * ProductGrid — Orchestrates product cards + inline expansion.
 *
 * 3-column grid (responsive: 2 on tablet, 1 on mobile).
 * When a card is clicked, it expands to full width (col-span-full)
 * via Framer Motion LayoutGroup + AnimatePresence.
 *
 * The LayoutGroup ensures all cards participate in layout animations
 * when one expands — siblings reflow smoothly.
 */

import { useState } from 'react';
import { AnimatePresence, LayoutGroup } from 'framer-motion';
import ProductCard from './ProductCard';
import ProductExpanded from './ProductExpanded';
import type { ShopProductWithDetails } from '@/lib/shop/types';

interface ProductGridProps {
  products: ShopProductWithDetails[];
}

export default function ProductGrid({ products }: ProductGridProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <LayoutGroup>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence mode="popLayout">
          {products.map((product, index) =>
            expandedId === product.id ? (
              <ProductExpanded
                key={`expanded-${product.id}`}
                product={product}
                onClose={() => setExpandedId(null)}
              />
            ) : (
              <ProductCard
                key={product.id}
                product={product}
                onClick={() => setExpandedId(product.id)}
                index={index}
              />
            )
          )}
        </AnimatePresence>
      </div>
    </LayoutGroup>
  );
}
