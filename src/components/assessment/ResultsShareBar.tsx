/**
 * ResultsShareBar — Copy link button for sharing results
 *
 * Simple centered section with a copy-to-clipboard button.
 * Shows brief "Copied!" feedback on click.
 */

'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FadeInUp, SectionLabel } from '@/components/ui';

interface ResultsShareBarProps {
  token: string;
}

export default function ResultsShareBar({ token }: ResultsShareBarProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    const url = `${window.location.origin}/tools/leadership/results/${token}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = url;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [token]);

  return (
    <section className="py-16 md:py-24">
      <div className="max-w-[900px] mx-auto px-6 md:px-10">
        <FadeInUp>
          <SectionLabel label="Share" className="mb-6" />
        </FadeInUp>

        <FadeInUp delay={0.08}>
          <p className="font-body text-ops-text-secondary text-sm mb-6">
            Share your leadership profile with your team.
          </p>
        </FadeInUp>

        <FadeInUp delay={0.14}>
          <button
            onClick={handleCopy}
            className="inline-flex items-center justify-center gap-2.5 font-caption uppercase tracking-[0.15em] text-xs px-8 py-3.5 rounded-[3px] transition-all duration-200 cursor-pointer bg-transparent text-ops-text-primary border border-ops-border hover:border-ops-border-hover active:border-white/40"
          >
            {/* Link icon */}
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.2">
              <path d="M5.8 8.2a3 3 0 0 0 4.2 0l2-2a3 3 0 0 0-4.2-4.2l-1.1 1" />
              <path d="M8.2 5.8a3 3 0 0 0-4.2 0l-2 2a3 3 0 0 0 4.2 4.2l1.1-1" />
            </svg>

            <AnimatePresence mode="wait">
              {copied ? (
                <motion.span
                  key="copied"
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.15 }}
                >
                  Copied
                </motion.span>
              ) : (
                <motion.span
                  key="copy"
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.15 }}
                >
                  Copy Link
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </FadeInUp>
      </div>
    </section>
  );
}
