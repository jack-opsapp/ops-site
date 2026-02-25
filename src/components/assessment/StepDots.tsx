/**
 * StepDots — Square dot navigation for questions within a chunk
 *
 * 5 square dots (6x6px, OPS star style).
 * Completed: clickable, success (#A5B368), hover brightens
 * Current: accent with subtle glow
 * Future: bg-white/10, not clickable
 */

'use client';

import { motion } from 'framer-motion';

interface StepDotsProps {
  totalSteps: number;
  currentStep: number;          // 0-indexed
  completedSteps: Set<number>;  // indices with saved answers
  onNavigate: (index: number) => void;
}

export default function StepDots({
  totalSteps,
  currentStep,
  completedSteps,
  onNavigate,
}: StepDotsProps) {
  return (
    <div className="flex items-center gap-2.5">
      {Array.from({ length: totalSteps }, (_, i) => {
        const isCurrent = i === currentStep;
        const isCompleted = completedSteps.has(i);
        const isFuture = !isCurrent && !isCompleted;
        const isClickable = isCompleted && !isCurrent;

        return (
          <motion.button
            key={i}
            type="button"
            disabled={!isClickable}
            onClick={() => isClickable && onNavigate(i)}
            className="relative block"
            style={{
              width: 6,
              height: 6,
              cursor: isClickable ? 'pointer' : 'default',
            }}
            whileHover={isClickable ? { scale: 1.4 } : undefined}
            transition={{ duration: 0.15 }}
          >
            <motion.div
              layoutId={isCurrent ? 'step-dot-active' : undefined}
              className={
                isCurrent
                  ? 'w-full h-full bg-ops-accent'
                  : isCompleted
                    ? 'w-full h-full transition-colors'
                    : 'w-full h-full bg-white/10'
              }
              style={
                isCurrent
                  ? { boxShadow: '0 0 6px rgba(89, 119, 148, 0.4)' }
                  : isCompleted
                    ? { backgroundColor: 'rgba(165, 179, 104, 0.5)', boxShadow: '0 0 4px rgba(165, 179, 104, 0.2)' }
                    : undefined
              }
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            />
          </motion.button>
        );
      })}
    </div>
  );
}
