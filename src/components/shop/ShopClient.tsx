'use client';

/**
 * ShopClient — Client-side orchestrator for the shop page.
 *
 * Receives server-fetched data (categories, products, featured product)
 * and manages client state (active category filter, scroll-to-grid on
 * hero CTA click).
 *
 * Renders: FeaturedHero (if featured product exists) → CategoryFilter → ProductGrid.
 */

import { useState, useMemo, useRef } from 'react';
import FeaturedHero from '@/components/shop/FeaturedHero';
import CategoryFilter from '@/components/shop/CategoryFilter';
import ProductGrid from '@/components/shop/ProductGrid';
import type { ShopCategory, ShopProductWithDetails } from '@/lib/shop/types';

interface ShopClientProps {
  categories: ShopCategory[];
  products: ShopProductWithDetails[];
  featuredProduct: ShopProductWithDetails | null;
}

export default function ShopClient({ categories, products, featuredProduct }: ShopClientProps) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  const filteredProducts = useMemo(() => {
    if (!activeCategory) return products;
    return products.filter((p) => p.category.slug === activeCategory);
  }, [products, activeCategory]);

  const scrollToGrid = () => {
    gridRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="pt-24 pb-20 px-6 md:px-10 max-w-[1400px] mx-auto">
      {/* Featured hero — only if a product is flagged as featured */}
      {featuredProduct && (
        <FeaturedHero product={featuredProduct} onShopNow={scrollToGrid} />
      )}

      {/* Category filters + Product grid */}
      <div ref={gridRef}>
        <CategoryFilter
          categories={categories}
          activeSlug={activeCategory}
          onSelect={setActiveCategory}
        />
        <ProductGrid products={filteredProducts} />

        {/* Empty state — no products match the filter */}
        {filteredProducts.length === 0 && (
          <div className="text-center py-20">
            <p className="text-ops-text-secondary text-sm font-body">
              No products in this category yet.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
