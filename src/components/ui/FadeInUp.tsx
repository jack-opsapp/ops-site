/**
 * FadeInUp — Scroll-triggered reveal animation
 * Uses Framer Motion with OPS easing curve
 * Respects prefers-reduced-motion via CSS (globals.css)
 */

'use client';

import { motion } from 'framer-motion';
import { theme } from '@/lib/theme';

interface FadeInUpProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  id?: string;
}

export default function FadeInUp({
  children,
  delay = 0,
  className = '',
  id,
}: FadeInUpProps) {
  return (
    <motion.div
      id={id}
      initial={theme.animation.fadeInUp.initial}
      whileInView={theme.animation.fadeInUp.whileInView}
      transition={{
        ...theme.animation.fadeInUp.transition,
        delay,
      }}
      viewport={theme.animation.fadeInUp.viewport}
      className={className}
    >
      {children}
    </motion.div>
  );
}
