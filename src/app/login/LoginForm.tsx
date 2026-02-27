/**
 * LoginForm — Client component for login/signup
 *
 * Supports email+password sign in, sign up, and Google OAuth.
 * Matches OPS design system: dark, minimal, Mohave headings.
 */

'use client';

import { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@/lib/supabase';

type Mode = 'login' | 'signup';

export default function LoginForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialMode = searchParams.get('mode') === 'signup' ? 'signup' : 'login';
  const callbackError = searchParams.get('error');
  const next = searchParams.get('next') ?? '/';

  const [mode, setMode] = useState<Mode>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(callbackError === 'auth_callback_failed' ? 'Authentication failed. Please try again.' : '');
  const [success, setSuccess] = useState('');

  const supabase = createClient();

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (mode === 'signup') {
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName },
          emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
        },
      });

      if (signUpError) {
        setError(signUpError.message);
      } else {
        setSuccess('Check your email to confirm your account.');
      }
    } else {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setError(signInError.message);
      } else {
        router.push(next);
        router.refresh();
      }
    }

    setLoading(false);
  };

  const handleGoogleAuth = async () => {
    setLoading(true);
    setError('');

    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    });

    if (oauthError) {
      setError(oauthError.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-24 bg-ops-background">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-[400px]"
      >
        {/* Logo */}
        <Link href="/" className="block mb-12">
          <Image
            src="/images/ops-logo-white.png"
            alt="OPS"
            width={56}
            height={24}
            className="object-contain"
          />
        </Link>

        {/* Heading */}
        <AnimatePresence mode="wait">
          <motion.div
            key={mode}
            initial={{ opacity: 0, x: mode === 'signup' ? 8 : -8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: mode === 'signup' ? -8 : 8 }}
            transition={{ duration: 0.2 }}
          >
            <h1 className="font-heading font-bold uppercase text-ops-text-primary text-3xl tracking-tight leading-[0.95] mb-2">
              {mode === 'login' ? 'Sign in' : 'Create account'}
            </h1>
            <p className="font-body text-ops-text-secondary text-sm mb-8">
              {mode === 'login'
                ? 'Access your OPS dashboard.'
                : 'Get started with OPS.'}
            </p>
          </motion.div>
        </AnimatePresence>

        {/* Google OAuth */}
        <button
          onClick={handleGoogleAuth}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-[3px] border border-ops-border bg-transparent hover:border-ops-border-hover hover:bg-white/[0.03] transition-all duration-200 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed mb-6"
        >
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          <span className="font-caption uppercase tracking-[0.12em] text-xs text-ops-text-primary">
            Continue with Google
          </span>
        </button>

        {/* Divider */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1 h-px bg-ops-border" />
          <span className="font-caption text-[10px] uppercase tracking-[0.2em] text-ops-text-secondary/50">
            or
          </span>
          <div className="flex-1 h-px bg-ops-border" />
        </div>

        {/* Email/Password Form */}
        <form onSubmit={handleEmailAuth} className="space-y-4">
          {mode === 'signup' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
            >
              <label className="block">
                <span className="font-caption text-[10px] uppercase tracking-[0.2em] text-ops-text-secondary mb-1.5 block">
                  Full Name
                </span>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Your name"
                  className="w-full px-4 py-3 rounded-[3px] bg-ops-surface border border-ops-border text-ops-text-primary font-body text-sm placeholder:text-ops-text-secondary/30 focus:outline-none focus:border-ops-border-hover transition-colors"
                />
              </label>
            </motion.div>
          )}

          <label className="block">
            <span className="font-caption text-[10px] uppercase tracking-[0.2em] text-ops-text-secondary mb-1.5 block">
              Email
            </span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              required
              className="w-full px-4 py-3 rounded-[3px] bg-ops-surface border border-ops-border text-ops-text-primary font-body text-sm placeholder:text-ops-text-secondary/30 focus:outline-none focus:border-ops-border-hover transition-colors"
            />
          </label>

          <label className="block">
            <span className="font-caption text-[10px] uppercase tracking-[0.2em] text-ops-text-secondary mb-1.5 block">
              Password
            </span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
              className="w-full px-4 py-3 rounded-[3px] bg-ops-surface border border-ops-border text-ops-text-primary font-body text-sm placeholder:text-ops-text-secondary/30 focus:outline-none focus:border-ops-border-hover transition-colors"
            />
          </label>

          {/* Error / Success */}
          <AnimatePresence>
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="font-body text-xs text-red-400"
              >
                {error}
              </motion.p>
            )}
            {success && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="font-body text-xs text-emerald-400"
              >
                {success}
              </motion.p>
            )}
          </AnimatePresence>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center font-caption uppercase tracking-[0.15em] text-xs px-6 py-3.5 rounded-[3px] bg-ops-text-primary text-ops-background hover:bg-white/90 active:bg-white/80 transition-all duration-200 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading
              ? 'Loading...'
              : mode === 'login'
              ? 'Sign In'
              : 'Create Account'}
          </button>
        </form>

        {/* Toggle mode */}
        <p className="mt-6 text-center font-body text-ops-text-secondary text-xs">
          {mode === 'login' ? (
            <>
              Don&apos;t have an account?{' '}
              <button
                onClick={() => { setMode('signup'); setError(''); setSuccess(''); }}
                className="text-ops-text-primary underline underline-offset-4 decoration-ops-border hover:decoration-ops-border-hover transition-colors cursor-pointer"
              >
                Sign up
              </button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <button
                onClick={() => { setMode('login'); setError(''); setSuccess(''); }}
                className="text-ops-text-primary underline underline-offset-4 decoration-ops-border hover:decoration-ops-border-hover transition-colors cursor-pointer"
              >
                Sign in
              </button>
            </>
          )}
        </p>

        {/* Legal footer */}
        <p className="mt-8 text-center font-body text-ops-text-secondary/40 text-[10px] leading-relaxed">
          By continuing, you agree to our{' '}
          <Link href="/legal?page=terms" className="underline hover:text-ops-text-secondary/60 transition-colors">
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link href="/legal?page=privacy" className="underline hover:text-ops-text-secondary/60 transition-colors">
            Privacy Policy
          </Link>
          .
        </p>
      </motion.div>
    </div>
  );
}
