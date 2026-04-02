'use client';

/**
 * ProductCard — Collapsed state of a product in the grid.
 *
 * Emotional beat: Discovery — invites exploration. Hover lift (-translate-y-1)
 * and border brighten signal interactivity without demanding attention.
 *
 * Layout: Image area (surface-elevated bg, aspect-square) above info area
 * (product name + price). Card styling follows existing Card.tsx pattern:
 * bg-surface, 1px border at 10% opacity, 3px radius.
 *
 * Animation: Framer Motion layout + layoutId for seamless morph to
 * ProductExpanded. Staggered entrance (FadeInUp, 50ms delay per index).
 * Easing: project standard.
 *
 * Reduced motion: no y-translate on entrance, instant opacity.
 * Accessibility: cursor-pointer, focus-visible ring.
 */

import Image from 'next/image';
import { motion, useReducedMotion } from 'framer-motion';
import { theme } from '@/lib/theme';
import type { ShopProductWithDetails } from '@/lib/shop/types';

interface ProductCardProps {
  product: ShopProductWithDetails;
  onClick: () => void;
  index: number;
}

export default function ProductCard({ product, onClick, index }: ProductCardProps) {
  const shouldReduceMotion = useReducedMotion();
  const primaryImage = product.images[0];
  const displayPrice = product.variants.length > 0
    ? Math.min(...product.variants.map(v => v.price_cents))
    : product.price_cents;

  return (
    <motion.div
      layout
      layoutId={`product-card-${product.id}`}
      initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 20 }}
      animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
      exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 10 }}
      transition={{
        layout: { duration: 0.4, ease: theme.animation.easing },
        opacity: { duration: 0.4, delay: index * 0.05, ease: theme.animation.easing },
        y: { duration: 0.4, delay: index * 0.05, ease: theme.animation.easing },
      }}
      onClick={onClick}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(); } }}
      tabIndex={0}
      role="button"
      aria-label={`View ${product.name} — $${(displayPrice / 100).toFixed(2)}`}
      className="bg-ops-surface border border-ops-border rounded-[3px] overflow-hidden cursor-pointer transition-all duration-300 hover:border-ops-border-hover hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ops-accent"
    >
      {/* Image area */}
      <div className="bg-ops-surface-elevated aspect-square relative">
        {primaryImage ? (
          <Image
            src={primaryImage}
            alt={product.name}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 border-2 border-white/15 rounded-[2px] flex items-center justify-center">
              <span className="text-white/30 text-[10px] font-caption uppercase">IMG</span>
            </div>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3">
        <p className="text-ops-text-primary text-[11px] font-body uppercase tracking-[0.05em] truncate">
          {product.name}
        </p>
        <p className="text-ops-accent text-[11px] mt-0.5 tabular-nums">
          ${(displayPrice / 100).toFixed(2)}
        </p>
      </div>
    </motion.div>
  );
}
