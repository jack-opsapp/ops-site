/**
 * AssessmentOverlay — Fixed full-screen overlay for the assessment flow
 *
 * Covers Navigation (z-40) and Footer with z-50.
 * Contains:
 *  - Sticky header: OPS logo left, EXIT ghost button right
 *  - ProgressBar below header
 *  - Assessment content area (children)
 *
 * Mounts with a cinematic fade-in + subtle scale.
 */

'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import ProgressBar from './ProgressBar';

interface AssessmentOverlayProps {
  progress: number;
  onExit: () => void;
  children: React.ReactNode;
}

export default function AssessmentOverlay({
  progress,
  onExit,
  children,
}: AssessmentOverlayProps) {
  return (
    <motion.div
      className="fixed inset-0 z-50 bg-ops-background flex flex-col"
      initial={{ opacity: 0, scale: 1.01 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] as const }}
    >
      {/* Header */}
      <header className="flex-shrink-0">
        <div className="flex items-center justify-between px-6 md:px-10 h-16">
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

          {/* EXIT button */}
          <button
            onClick={onExit}
            className="font-caption uppercase tracking-[0.15em] text-[11px] text-ops-text-secondary hover:text-ops-text-primary transition-colors cursor-pointer px-4 py-2 border border-transparent hover:border-ops-border rounded-[3px]"
          >
            Exit
          </button>
        </div>

        {/* Progress bar */}
        <ProgressBar progress={progress} />
      </header>

      {/* Content area */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        {children}
      </div>
    </motion.div>
  );
}
