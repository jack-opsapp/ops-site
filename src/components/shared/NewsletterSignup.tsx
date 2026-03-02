/**
 * NewsletterSignup — Reusable inline newsletter form
 *
 * Email input + submit. Can be placed in footer, sidebar,
 * or standalone sections. Calls POST /api/newsletter.
 */

'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Dictionary } from '@/i18n/types';

interface NewsletterSignupProps {
  /** Source tag for tracking where the signup came from */
  source?: string;
  /** Compact mode for footer/sidebar placement */
  compact?: boolean;
  /** Common dictionary for translations */
  commonDict?: Dictionary;
}

export default function NewsletterSignup({
  source = 'website',
  compact = false,
  commonDict,
}: NewsletterSignupProps) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const t = (key: string, fallback: string) => {
    if (!commonDict) return fallback;
    const value = commonDict[key];
    return typeof value === 'string' ? value : fallback;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes('@')) return;

    setStatus('loading');
    setErrorMsg('');

    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source }),
      });

      if (res.ok) {
        setStatus('success');
        setEmail('');
      } else {
        const data = await res.json();
        setErrorMsg(data.error || t('newsletter.errorDefault', 'Something went wrong.'));
        setStatus('error');
      }
    } catch {
      setErrorMsg(t('newsletter.errorConnection', 'Connection failed. Please try again.'));
      setStatus('error');
    }
  };

  if (status === 'success') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        className={compact ? '' : 'py-2'}
      >
        <p className="font-caption text-[10px] uppercase tracking-[0.2em] text-emerald-400">
          {t('newsletter.successTitle', "You're in.")}
        </p>
        <p className="font-body text-ops-text-secondary text-xs mt-1">
          {t('newsletter.successMessage', "We'll keep you posted on what ships.")}
        </p>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={compact ? '' : 'py-2'}>
      <div className={`flex ${compact ? 'gap-2' : 'gap-3'}`}>
        <input
          type="email"
          value={email}
          onChange={(e) => { setEmail(e.target.value); if (status === 'error') setStatus('idle'); }}
          placeholder={t('newsletter.placeholder', 'you@company.com')}
          required
          className={`flex-1 px-4 ${compact ? 'py-2.5' : 'py-3'} rounded-[3px] bg-ops-surface border border-ops-border text-ops-text-primary font-body text-sm placeholder:text-ops-text-secondary/30 focus:outline-none focus:border-ops-border-hover transition-colors min-w-0`}
        />
        <button
          type="submit"
          disabled={status === 'loading'}
          className={`flex-shrink-0 font-caption uppercase tracking-[0.15em] text-xs ${compact ? 'px-4 py-2.5' : 'px-6 py-3'} rounded-[3px] bg-ops-text-primary text-ops-background hover:bg-white/90 transition-all duration-200 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed`}
        >
          {status === 'loading' ? '...' : t('newsletter.subscribe', 'Subscribe')}
        </button>
      </div>

      <AnimatePresence>
        {status === 'error' && errorMsg && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="font-body text-[11px] text-red-400 mt-2"
          >
            {errorMsg}
          </motion.p>
        )}
      </AnimatePresence>
    </form>
  );
}
