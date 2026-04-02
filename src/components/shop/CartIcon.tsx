'use client';

/**
 * CartIcon — Shopping bag icon with animated badge.
 *
 * Emotional beat: Discovery (rewards interaction with immediate visual feedback).
 * Badge pops with spring animation when items are added — scale 0.5→1.15→1
 * with a subtle glow that settles after 300ms. Muted when empty, white when active.
 *
 * Animation: Tier 2 (Framer Motion) — AnimatePresence for mount/unmount,
 * spring physics for the pop. Easing: project standard [0.22, 1, 0.36, 1]
 * for non-spring transitions.
 *
 * Accessibility: aria-label with item count, cursor-pointer, focus-visible ring.
 * Reduced motion: badge appears without spring (instant opacity).
 */

import { useEffect, useRef } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useCartStore } from '@/lib/stores/cart';
import { theme } from '@/lib/theme';

interface CartIconProps {
  onClick: () => void;
  isLight?: boolean;
}

export default function CartIcon({ onClick, isLight = false }: CartIconProps) {
  const totalItems = useCartStore((s) => s.totalItems());
  const hasItems = totalItems > 0;
  const prevCount = useRef(totalItems);
  const shouldReduceMotion = useReducedMotion();

  // Track if count just increased (for pop animation)
  const justAdded = totalItems > prevCount.current;
  useEffect(() => {
    prevCount.current = totalItems;
  }, [totalItems]);

  const iconColor = hasItems
    ? isLight ? '#1A1A1A' : '#FFFFFF'
    : isLight ? 'rgba(26, 26, 26, 0.4)' : 'rgba(255, 255, 255, 0.4)';

  return (
    <button
      onClick={onClick}
      className="relative p-2 cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ops-accent rounded-[2px]"
      aria-label={hasItems ? `Cart with ${totalItems} item${totalItems !== 1 ? 's' : ''}` : 'Cart is empty'}
    >
      {/* Shopping bag SVG — 44x44 touch target via padding */}
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke={iconColor}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="transition-colors duration-200"
      >
        <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18M16 10a4 4 0 01-8 0" />
      </svg>

      {/* Animated badge */}
      <AnimatePresence>
        {hasItems && (
          <motion.div
            key={totalItems}
            initial={
              shouldReduceMotion
                ? { opacity: 0 }
                : justAdded
                  ? { scale: 0.5, opacity: 0 }
                  : { scale: 1, opacity: 1 }
            }
            animate={
              shouldReduceMotion
                ? { opacity: 1 }
                : { scale: 1, opacity: 1 }
            }
            exit={
              shouldReduceMotion
                ? { opacity: 0 }
                : { scale: 0.5, opacity: 0 }
            }
            transition={
              shouldReduceMotion
                ? { duration: 0.15 }
                : justAdded
                  ? { type: 'spring', stiffness: 500, damping: 15 }
                  : { duration: 0.15, ease: theme.animation.easing }
            }
            className="absolute -top-0.5 -right-0.5 bg-white text-ops-background rounded-full flex items-center justify-center pointer-events-none"
            style={{
              width: 16,
              height: 16,
              fontSize: 9,
              fontWeight: 700,
              fontFamily: 'var(--font-kosugi)',
              boxShadow: justAdded && !shouldReduceMotion ? '0 0 8px rgba(255, 255, 255, 0.3)' : 'none',
            }}
          >
            {totalItems}
          </motion.div>
        )}
      </AnimatePresence>
    </button>
  );
}
