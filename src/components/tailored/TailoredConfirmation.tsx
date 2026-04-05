'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { theme } from '@/lib/theme';
import type { Dictionary } from '@/i18n/types';

const ease = theme.animation.easing as [number, number, number, number];

interface SessionData {
  package: string;
  amount: number;
  currency: string;
  customerEmail: string | null;
  status: string;
  fullPrice: string | null;
}

function t(dict: Dictionary, key: string): string {
  const value = dict[key];
  return typeof value === 'string' ? value : key;
}

export default function TailoredConfirmation({ dict }: { dict: Dictionary }) {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [session, setSession] = useState<SessionData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!sessionId) {
      setLoading(false);
      return;
    }
    fetch(`/api/tailored/checkout-session?session_id=${sessionId}`)
      .then((res) => res.json())
      .then((data) => {
        setSession(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [sessionId]);

  const packageName = session?.package
    ? session.package.charAt(0).toUpperCase() + session.package.slice(1)
    : '';

  const timelineKey = session?.package
    ? `confirmation.timeline.${session.package}`
    : '';

  return (
    <main className="bg-ops-background min-h-screen flex items-center justify-center">
      <div className="max-w-[560px] mx-auto px-6 py-24 text-center">
        {loading ? (
          <p className="font-heading text-ops-text-secondary">Loading...</p>
        ) : !session || session.status !== 'paid' ? (
          <div>
            <p className="font-heading text-ops-text-secondary mb-4">
              Could not verify payment. If you completed checkout, check your email for confirmation.
            </p>
            <Link
              href="/tailored"
              className="font-caption uppercase tracking-[0.15em] text-xs text-ops-accent hover:underline"
            >
              Back to Tailored
            </Link>
          </div>
        ) : (
          <>
            {/* Success checkmark */}
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, ease }}
              className="w-16 h-16 mx-auto mb-8 rounded-full border-2 border-ops-accent flex items-center justify-center"
            >
              <svg className="w-7 h-7 text-ops-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </motion.div>

            <motion.h1
              className="font-heading font-bold uppercase text-3xl text-ops-text-primary tracking-tight"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15, ease }}
            >
              {t(dict, 'confirmation.heading')}
            </motion.h1>

            <motion.p
              className="font-heading font-light text-base text-ops-text-secondary mt-3"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.25, ease }}
            >
              {t(dict, 'confirmation.subtitle')}
            </motion.p>

            <motion.div
              className="mt-8 p-5 rounded-[3px] border border-white/[0.08] bg-ops-surface-elevated/50 text-left"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.35, ease }}
            >
              <div className="flex justify-between items-center mb-3">
                <span className="font-caption text-[10px] text-ops-accent uppercase tracking-[0.15em]">
                  {packageName} Package
                </span>
                <span className="font-heading font-semibold text-ops-text-primary">
                  ${((session.amount ?? 0) / 100).toLocaleString()} {(session.currency ?? 'cad').toUpperCase()}
                </span>
              </div>
              {session.customerEmail && (
                <p className="font-heading font-light text-xs text-white/40">
                  Confirmation sent to {session.customerEmail}
                </p>
              )}
            </motion.div>

            <motion.div
              className="mt-8 text-left"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.45, ease }}
            >
              <p className="font-heading font-light text-sm text-ops-text-secondary leading-relaxed">
                {t(dict, 'confirmation.nextSteps')}
              </p>
              {timelineKey && (
                <p className="font-heading font-light text-sm text-ops-accent mt-3">
                  {t(dict, timelineKey)}
                </p>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.6, ease }}
              className="mt-10"
            >
              <Link
                href="/"
                className="font-caption uppercase tracking-[0.15em] text-xs text-ops-text-secondary hover:text-ops-text-primary transition-colors"
              >
                Back to OPS
              </Link>
            </motion.div>
          </>
        )}
      </div>
    </main>
  );
}
