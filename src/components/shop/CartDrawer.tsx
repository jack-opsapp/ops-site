'use client';

/**
 * CartDrawer — Slide-over from right side of viewport.
 *
 * Emotional beat: Transition (maintains spatial continuity — drawer slides
 * in from the direction of the cart icon).
 *
 * Animation: Framer Motion AnimatePresence for mount/unmount.
 * Drawer translateX(100%) → 0, backdrop opacity 0 → 0.6.
 * Duration: 300ms. Easing: project standard [0.22, 1, 0.36, 1].
 * Reduced motion: instant opacity fade, no slide.
 *
 * Accessibility: Focus trap would be ideal (future). For now:
 * close on backdrop click, close on Escape (via onClose callback),
 * aria-label on close button, semantic landmarks.
 *
 * Layout: Header (YOUR CART + ×), scrollable item list, sticky footer
 * (subtotal + shipping note + CHECKOUT button). Empty state centered.
 */

import { useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useCartStore } from '@/lib/stores/cart';
import CartItem from './CartItem';
import Button from '@/components/ui/Button';
import { theme } from '@/lib/theme';
import Link from 'next/link';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const items = useCartStore((s) => s.items);
  const subtotalCents = useCartStore((s) => s.subtotalCents());
  const isEmpty = items.length === 0;
  const shouldReduceMotion = useReducedMotion();

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const slideTransition = shouldReduceMotion
    ? { duration: 0.15 }
    : { duration: 0.3, ease: theme.animation.easing };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={slideTransition}
            className="fixed inset-0 bg-black/60 z-50"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Drawer */}
          <motion.aside
            role="dialog"
            aria-label="Shopping cart"
            initial={shouldReduceMotion ? { opacity: 0 } : { x: '100%' }}
            animate={shouldReduceMotion ? { opacity: 1 } : { x: 0 }}
            exit={shouldReduceMotion ? { opacity: 0 } : { x: '100%' }}
            transition={slideTransition}
            className="fixed top-0 right-0 bottom-0 w-full max-w-[400px] bg-ops-surface border-l border-ops-border z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
              <span className="font-body text-ops-text-primary text-xs uppercase tracking-[0.1em] font-light">
                Your Cart
              </span>
              <button
                onClick={onClose}
                className="text-ops-text-secondary hover:text-ops-text-primary text-lg cursor-pointer transition-colors p-1 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ops-accent rounded-[2px]"
                aria-label="Close cart"
              >
                ×
              </button>
            </div>

            {isEmpty ? (
              /* Empty state — centered */
              <div className="flex-1 flex flex-col items-center justify-center px-5">
                <p className="text-ops-text-secondary text-sm font-body mb-4">
                  Your cart is empty
                </p>
                <Button variant="ghost" onClick={onClose}>
                  Browse Shop
                </Button>
              </div>
            ) : (
              <>
                {/* Item list — scrollable */}
                <div className="flex-1 overflow-y-auto px-5">
                  {items.map((item) => (
                    <CartItem key={item.variantId} item={item} />
                  ))}
                </div>

                {/* Footer — sticky */}
                <div className="px-5 py-4 border-t border-ops-border">
                  <div className="flex justify-between mb-1.5">
                    <span className="font-caption uppercase tracking-[0.1em] text-ops-text-secondary text-[9px]">
                      Subtotal
                    </span>
                    <span className="text-ops-text-primary text-[11px] tabular-nums">
                      ${(subtotalCents / 100).toFixed(2)}
                    </span>
                  </div>
                  <p className="text-ops-text-secondary text-[9px] font-caption mb-4">
                    Shipping calculated at checkout
                  </p>
                  <Link
                    href="/shop/checkout"
                    onClick={onClose}
                    className="block w-full bg-ops-text-primary text-ops-background text-center py-3 rounded-[3px] font-caption uppercase tracking-[0.15em] text-xs hover:bg-white/90 active:bg-white/80 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ops-accent focus-visible:ring-offset-2 focus-visible:ring-offset-ops-surface"
                  >
                    Checkout
                  </Link>
                </div>
              </>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
