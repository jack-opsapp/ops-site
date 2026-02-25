/**
 * EmailCapture — First name + email collection form
 *
 * Shown after the last assessment chunk. Captures lead info
 * before generating AI analysis. Cinematic entrance with
 * staggered field reveals.
 */

'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

interface EmailCaptureProps {
  isSubmitting: boolean;
  onSubmit: (firstName: string, email: string) => void;
  totalQuestions?: number;
}

const containerVariants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

const itemVariants = {
  initial: { opacity: 0, y: 20, filter: 'blur(4px)' },
  animate: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
  },
};

export default function EmailCapture({ isSubmitting, onSubmit, totalQuestions }: EmailCaptureProps) {
  const [firstName, setFirstName] = useState('');
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState<{ firstName?: string; email?: string }>({});

  function validate(): boolean {
    const newErrors: { firstName?: string; email?: string } = {};

    if (!firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Enter a valid email';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (validate() && !isSubmitting) {
      onSubmit(firstName.trim(), email.trim());
    }
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="initial"
      animate="animate"
      className="flex flex-col items-center justify-center min-h-full px-6 md:px-10 py-12"
    >
      <motion.div variants={itemVariants} className="w-full max-w-md">
        {/* Accent line */}
        <div
          className="w-8 h-px mb-5"
          style={{ backgroundColor: 'rgba(89, 119, 148, 0.2)' }}
        />

        <p className="font-caption text-ops-text-secondary uppercase tracking-[0.2em] text-xs mb-2">
          [ Almost there ]
        </p>
        <h2 className="font-heading text-3xl md:text-4xl text-ops-text-primary mb-3 leading-tight">
          Your results are ready.
        </h2>
        <p className="font-body text-ops-text-secondary text-sm mb-10">
          Enter your details to generate your personalized leadership analysis.
        </p>
      </motion.div>

      <form onSubmit={handleSubmit} className="w-full max-w-md space-y-5">
        {/* First Name */}
        <motion.div variants={itemVariants}>
          <label
            htmlFor="firstName"
            className="block font-caption uppercase tracking-[0.15em] text-[10px] text-ops-text-secondary mb-2"
          >
            First Name
          </label>
          <input
            id="firstName"
            type="text"
            value={firstName}
            onChange={(e) => {
              setFirstName(e.target.value);
              if (errors.firstName) setErrors((prev) => ({ ...prev, firstName: undefined }));
            }}
            disabled={isSubmitting}
            className="w-full bg-ops-surface border border-ops-border rounded-[3px] px-4 py-3 font-body text-ops-text-primary text-sm placeholder:text-ops-text-secondary/40 focus:outline-none focus:border-ops-accent transition-colors disabled:opacity-50"
            placeholder="Jackson"
            autoComplete="given-name"
          />
          {errors.firstName && (
            <p className="font-caption text-[10px] text-red-400/80 mt-1.5">
              {errors.firstName}
            </p>
          )}
        </motion.div>

        {/* Email */}
        <motion.div variants={itemVariants}>
          <label
            htmlFor="email"
            className="block font-caption uppercase tracking-[0.15em] text-[10px] text-ops-text-secondary mb-2"
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
            }}
            disabled={isSubmitting}
            className="w-full bg-ops-surface border border-ops-border rounded-[3px] px-4 py-3 font-body text-ops-text-primary text-sm placeholder:text-ops-text-secondary/40 focus:outline-none focus:border-ops-accent transition-colors disabled:opacity-50"
            placeholder="jackson@company.com"
            autoComplete="email"
          />
          {errors.email && (
            <p className="font-caption text-[10px] text-red-400/80 mt-1.5">
              {errors.email}
            </p>
          )}
        </motion.div>

        {/* Submit */}
        <motion.div variants={itemVariants} className="pt-3">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full inline-flex items-center justify-center font-caption uppercase tracking-[0.15em] text-xs px-6 py-3.5 rounded-[3px] transition-all duration-200 cursor-pointer bg-ops-text-primary text-ops-background hover:bg-white/90 active:bg-white/80 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Generating...' : 'Generate my results'}
          </button>
        </motion.div>

        {/* Completion context */}
        {totalQuestions != null && totalQuestions > 0 && (
          <motion.p
            variants={itemVariants}
            className="font-caption text-[10px] text-ops-text-secondary/40 text-center"
          >
            {totalQuestions} of {totalQuestions} questions complete
          </motion.p>
        )}

        {/* Privacy note */}
        <motion.p
          variants={itemVariants}
          className="font-caption text-[10px] text-ops-text-secondary/50 text-center"
        >
          We&apos;ll send your results to this email. No spam.
        </motion.p>
      </form>
    </motion.div>
  );
}
