/**
 * ProgressBar — Thin animated progress indicator with contextual info
 *
 * Fills left->right with accent color. Subtle glow at the leading edge.
 * Above the bar: question counter (left) + section indicator (right).
 */

'use client';

import { motion, AnimatePresence } from 'framer-motion';

interface ProgressBarProps {
  progress: number; // 0 to 1
  questionNumber?: number;
  totalQuestions?: number;
  chunkNumber?: number;
  totalChunks?: number;
}

const EASE = [0.22, 1, 0.36, 1] as const;

export default function ProgressBar({
  progress,
  questionNumber,
  totalQuestions,
  chunkNumber,
  totalChunks,
}: ProgressBarProps) {
  const pct = Math.max(0, Math.min(1, progress)) * 100;
  const showContext = questionNumber != null && totalQuestions != null && totalQuestions > 0;
  const showSection = chunkNumber != null && totalChunks != null && totalChunks > 0;

  // Zero-pad question number to match total's width (e.g. "07 / 15")
  const qNum = questionNumber != null && totalQuestions != null
    ? String(questionNumber).padStart(String(totalQuestions).length, '0')
    : '';

  return (
    <div className="w-full">
      {/* Context row */}
      {(showContext || showSection) && (
        <div className="flex items-center justify-between px-6 md:px-10 py-2">
          <AnimatePresence mode="wait">
            {showContext && (
              <motion.span
                key={`q-${questionNumber}`}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.25, ease: EASE }}
                className="font-caption text-[11px] text-ops-text-secondary/60 tabular-nums"
              >
                {qNum} / {totalQuestions}
              </motion.span>
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            {showSection && (
              <motion.span
                key={`s-${chunkNumber}`}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.25, ease: EASE }}
                className="font-caption text-[10px] uppercase tracking-[0.2em] text-ops-text-secondary/40"
              >
                Section {chunkNumber} of {totalChunks}
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Progress bar */}
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
    </div>
  );
}
