'use client';

/**
 * FeaturedHero — Full-width banner for the featured product.
 *
 * Emotional beat: Entry/Arrival — counters skepticism with confidence.
 * Sharp ease-out entry, no wobble. The banner says "this is the drop."
 *
 * Two-column layout: large product image (left), product info (right).
 * "NEW DROP" label in Kosugi accent, product name in Mohave light uppercase,
 * description, and "SHOP NOW — $XX" solid button.
 *
 * Animation: FadeInUp on mount, 800ms, project easing.
 * Reduced motion: instant opacity, no y-translate.
 *
 * Responsive: stacks vertically on mobile (image above, info below).
 */

import Image from 'next/image';
import { motion, useReducedMotion } from 'framer-motion';
import { theme } from '@/lib/theme';
import type { ShopProductWithDetails } from '@/lib/shop/types';

interface FeaturedHeroProps {
  product: ShopProductWithDetails;
  onShopNow: () => void;
}

export default function FeaturedHero({ product, onShopNow }: FeaturedHeroProps) {
  const shouldReduceMotion = useReducedMotion();
  const primaryImage = product.images[0];
  const displayPrice = product.variants.length > 0
    ? Math.min(...product.variants.map(v => v.price_cents))
    : product.price_cents;

  return (
    <motion.div
      initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 20 }}
      animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: theme.animation.easing }}
      className="bg-ops-surface border border-ops-border rounded-[3px] overflow-hidden mb-12"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
        {/* Left: Product image */}
        <div className="bg-ops-surface-elevated relative aspect-square md:aspect-auto md:min-h-[320px]">
          {primaryImage ? (
            <Image
              src={primaryImage}
              alt={product.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-24 h-24 border-2 border-white/15 rounded-[2px] flex items-center justify-center">
                <span className="text-white/30 text-[10px] font-caption uppercase">IMG</span>
              </div>
            </div>
          )}
        </div>

        {/* Right: Product info */}
        <div className="flex flex-col justify-center p-8 md:p-12">
          <span className="font-caption uppercase tracking-[0.15em] text-[9px] text-ops-accent mb-3">
            New Drop
          </span>
          <h2 className="font-heading text-ops-text-primary text-2xl md:text-3xl font-light uppercase tracking-[0.05em] mb-2">
            {product.name}
          </h2>
          {product.description && (
            <p className="text-ops-text-secondary text-sm font-body font-light leading-relaxed mb-6 max-w-md">
              {product.description}
            </p>
          )}
          <button
            onClick={onShopNow}
            className="inline-flex items-center justify-center bg-ops-text-primary text-ops-background px-6 py-3 rounded-[3px] font-caption uppercase tracking-[0.15em] text-xs hover:bg-white/90 active:bg-white/80 transition-all duration-200 cursor-pointer w-fit focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ops-accent focus-visible:ring-offset-2 focus-visible:ring-offset-ops-surface"
          >
            Shop Now — ${(displayPrice / 100).toFixed(2)}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
