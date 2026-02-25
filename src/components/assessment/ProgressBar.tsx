/**
 * ProgressBar — Thin animated progress indicator for assessment flow
 *
 * Fills left→right with accent color. Uses CSS transitions for smooth
 * width changes. Subtle glow at the leading edge.
 */

'use client';

import { motion } from 'framer-motion';

interface ProgressBarProps {
  progress: number; // 0 to 1
}

const EASE = [0.22, 1, 0.36, 1] as const;

export default function ProgressBar({ progress }: ProgressBarProps) {
  const pct = Math.max(0, Math.min(1, progress)) * 100;

  return (
    <div className="w-full h-[2px] bg-white/[0.04] relative overflow-hidden">
      <motion.div
        className="absolute inset-y-0 left-0"
        style={{ backgroundColor: '#597794' }}
        initial={{ width: '0%' }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.6, ease: EASE }}
      />
      {/* Leading-edge glow */}
      <motion.div
        className="absolute inset-y-0 w-[40px]"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(89, 119, 148, 0.4), transparent)',
          filter: 'blur(4px)',
        }}
        initial={{ left: '0%' }}
        animate={{ left: `calc(${pct}% - 20px)` }}
        transition={{ duration: 0.6, ease: EASE }}
      />
    </div>
  );
}
