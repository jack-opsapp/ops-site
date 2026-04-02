'use client';

/**
 * CategoryFilter — Horizontal pill-style toggle buttons.
 *
 * "ALL" default (solid white bg / dark text), one pill per active category
 * from shop_categories. Active pill: solid white bg / dark text.
 * Inactive: ghost (border, muted text, hover brightens).
 *
 * Animation: Framer Motion layoutId for the active pill indicator.
 * The white background morphs between pills on selection. Duration: 300ms,
 * project easing [0.22, 1, 0.36, 1].
 *
 * Typography: Kosugi, uppercase, tracking-[0.15em], text-[10px].
 * Accessibility: buttons with aria-pressed for active state.
 */

import { motion, useReducedMotion } from 'framer-motion';
import { theme } from '@/lib/theme';
import type { ShopCategory } from '@/lib/shop/types';

interface CategoryFilterProps {
  categories: ShopCategory[];
  activeSlug: string | null;
  onSelect: (slug: string | null) => void;
}

export default function CategoryFilter({ categories, activeSlug, onSelect }: CategoryFilterProps) {
  const shouldReduceMotion = useReducedMotion();

  const pills = [
    { slug: null, label: 'All' },
    ...categories.map((c) => ({ slug: c.slug, label: c.name })),
  ];

  return (
    <div className="flex flex-wrap justify-center gap-3 mb-10" role="group" aria-label="Filter by category">
      {pills.map((pill) => {
        const isActive = pill.slug === activeSlug;
        return (
          <button
            key={pill.slug ?? 'all'}
            onClick={() => onSelect(pill.slug)}
            aria-pressed={isActive}
            className={`
              relative font-caption uppercase tracking-[0.15em] text-[10px] px-4 py-1.5 rounded-[2px] transition-colors duration-200 cursor-pointer
              focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ops-accent
              ${isActive
                ? 'text-ops-background'
                : 'text-ops-text-secondary border border-ops-border hover:border-ops-border-hover hover:text-ops-text-primary'
              }
            `}
          >
            {/* Animated active background — morphs between pills */}
            {isActive && (
              <motion.div
                layoutId="category-pill-active"
                className="absolute inset-0 bg-ops-text-primary rounded-[2px]"
                transition={
                  shouldReduceMotion
                    ? { duration: 0 }
                    : { duration: 0.3, ease: theme.animation.easing }
                }
              />
            )}
            <span className="relative z-10">{pill.label}</span>
          </button>
        );
      })}
    </div>
  );
}
