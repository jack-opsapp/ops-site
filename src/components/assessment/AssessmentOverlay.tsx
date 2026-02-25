/**
 * AssessmentOverlay — Fixed full-screen overlay for the assessment flow
 *
 * Covers Navigation (z-40) and Footer with z-50.
 * Contains:
 *  - Ambient starfield canvas (base layer)
 *  - Radial gradient vignette for depth
 *  - Sticky header: OPS logo left, phase label center, EXIT ghost button right
 *  - ProgressBar below header
 *  - Corner accent marks (viewfinder aesthetic)
 *  - Assessment content area (children)
 *
 * Mounts with a cinematic fade-in + subtle scale.
 */

'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import ProgressBar from './ProgressBar';
import AssessmentStarfield from './AssessmentStarfield';

export type PhaseLabel = 'ASSESSMENT' | 'SECTION COMPLETE' | 'ALMOST THERE' | 'GENERATING';

interface AssessmentOverlayProps {
  progress: number;
  onExit: () => void;
  phaseLabel?: PhaseLabel;
  questionNumber?: number;
  totalQuestions?: number;
  chunkNumber?: number;
  totalChunks?: number;
  children: React.ReactNode;
}

export default function AssessmentOverlay({
  progress,
  onExit,
  phaseLabel = 'ASSESSMENT',
  questionNumber,
  totalQuestions,
  chunkNumber,
  totalChunks,
  children,
}: AssessmentOverlayProps) {
  return (
    <motion.div
      className="fixed inset-0 z-50 bg-ops-background flex flex-col"
      initial={{ opacity: 0, scale: 1.01 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] as const }}
    >
      {/* Ambient starfield — base layer */}
      <AssessmentStarfield />

      {/* Linear edge vignettes — top + bottom */}
      <div
        className="absolute inset-x-0 top-0 h-32 pointer-events-none"
        aria-hidden="true"
        style={{
          background: 'linear-gradient(to bottom, rgba(0, 0, 0, 0.35) 0%, transparent 100%)',
        }}
      />
      <div
        className="absolute inset-x-0 bottom-0 h-32 pointer-events-none"
        aria-hidden="true"
        style={{
          background: 'linear-gradient(to top, rgba(0, 0, 0, 0.35) 0%, transparent 100%)',
        }}
      />

      {/* Corner accent marks — viewfinder aesthetic */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        {/* Top-left */}
        <div className="absolute top-4 left-4 w-5 h-5 border-l border-t border-white/[0.04]" />
        {/* Top-right */}
        <div className="absolute top-4 right-4 w-5 h-5 border-r border-t border-white/[0.04]" />
        {/* Bottom-left */}
        <div className="absolute bottom-4 left-4 w-5 h-5 border-l border-b border-white/[0.04]" />
        {/* Bottom-right */}
        <div className="absolute bottom-4 right-4 w-5 h-5 border-r border-b border-white/[0.04]" />
      </div>

      {/* Header */}
      <header className="flex-shrink-0 relative z-10">
        <div className="flex items-center justify-between px-6 md:px-10 h-20">
          {/* Logo */}
          <Link href="/tools/leadership" className="flex-shrink-0">
            <Image
              src="/images/ops-logo-white.png"
              alt="OPS"
              width={48}
              height={20}
              className="object-contain"
              priority
            />
          </Link>

          {/* Phase label — center */}
          <AnimatePresence mode="wait">
            <motion.span
              key={phaseLabel}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] as const }}
              className="font-caption uppercase tracking-[0.25em] text-[10px] text-ops-text-secondary/60 hidden sm:block"
            >
              {phaseLabel}
            </motion.span>
          </AnimatePresence>

          {/* EXIT button */}
          <button
            onClick={onExit}
            className="font-caption uppercase tracking-[0.15em] text-[11px] text-ops-text-secondary hover:text-ops-text-primary transition-colors cursor-pointer px-4 py-2 border border-transparent hover:border-ops-border rounded-[3px]"
          >
            Exit
          </button>
        </div>

        {/* Subtle header bottom edge */}
        <div className="border-b border-white/[0.06]" />

        {/* Progress bar with context */}
        <ProgressBar
          progress={progress}
          questionNumber={questionNumber}
          totalQuestions={totalQuestions}
          chunkNumber={chunkNumber}
          totalChunks={totalChunks}
        />
      </header>

      {/* Content area */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden relative z-10">
        {children}
      </div>
    </motion.div>
  );
}
