/**
 * Assessment Flow Route — /tools/leadership/assess
 *
 * Client component that reads ?version= and ?token= from the URL.
 *   - Token present → attempt server-side resume
 *   - No token → fresh start immediately
 *
 * Session identity lives in the URL, not localStorage.
 * localStorage is only used for draft answers (mid-chunk progress).
 */

'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { Suspense, useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import AssessmentFlow from '@/components/assessment/AssessmentFlow';
import type { ResumeData } from '@/components/assessment/AssessmentFlow';
import type { AssessmentVersion } from '@/lib/assessment/types';
import { resumeAssessment } from '@/lib/assessment/actions';
import {
  getDraftAnswers,
  clearDraftAnswers,
} from '@/lib/assessment/session-storage';

/* ------------------------------------------------------------------ */
/*  Resume state                                                       */
/* ------------------------------------------------------------------ */

type ResumeState =
  | { status: 'checking' }
  | { status: 'prompt'; data: ResumeData }
  | { status: 'fresh' }
  | { status: 'resuming'; data: ResumeData };

const EASE = [0.22, 1, 0.36, 1] as const;

/** Strip the token param from the URL without triggering navigation */
function stripTokenFromUrl() {
  const url = new URL(window.location.href);
  url.searchParams.delete('token');
  window.history.replaceState(null, '', url.toString());
}

/* ------------------------------------------------------------------ */
/*  Inner content (has access to searchParams)                         */
/* ------------------------------------------------------------------ */

function AssessmentContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const versionParam = searchParams.get('version');
  const version: AssessmentVersion =
    versionParam === 'deep' ? 'deep' : 'quick';
  const tokenParam = searchParams.get('token');
  const upgradeFromParam = searchParams.get('upgrade_from');

  // Upgrade sessions skip resume logic — go straight to fresh start
  const [resumeState, setResumeState] = useState<ResumeState>(
    upgradeFromParam ? { status: 'fresh' } : tokenParam ? { status: 'checking' } : { status: 'fresh' },
  );

  useEffect(() => {
    // No token in URL → nothing to check
    if (!tokenParam) return;

    let cancelled = false;

    (async () => {
      try {
        const result = await resumeAssessment(tokenParam);

        if (cancelled) return;

        // Invalid token or completed session → strip token, start fresh
        if (!result || result.version !== version) {
          stripTokenFromUrl();
          clearDraftAnswers();
          setResumeState({ status: 'fresh' });
          return;
        }

        const draftAnswers = getDraftAnswers() ?? undefined;

        setResumeState({
          status: 'prompt',
          data: {
            sessionId: result.sessionId,
            token: result.token,
            questions: result.questions,
            currentChunk: result.currentChunk,
            totalChunks: result.totalChunks,
            draftAnswers,
          },
        });
      } catch {
        // Network error — strip token, start fresh
        if (!cancelled) {
          stripTokenFromUrl();
          clearDraftAnswers();
          setResumeState({ status: 'fresh' });
        }
      }
    })();

    return () => { cancelled = true; };
  }, [tokenParam, version]);

  const handleContinue = useCallback(() => {
    if (resumeState.status === 'prompt') {
      setResumeState({ status: 'resuming', data: resumeState.data });
    }
  }, [resumeState]);

  const handleStartFresh = useCallback(() => {
    // Clear all assessment data from localStorage
    clearDraftAnswers();
    try {
      // Remove any other assessment-related keys
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith('ops_assessment')) localStorage.removeItem(key);
      });
    } catch {
      // ignore
    }

    // Use router.replace to properly sync URL with Next.js (not just history.replaceState)
    const url = new URL(window.location.href);
    url.searchParams.delete('token');
    router.replace(url.pathname + '?' + url.searchParams.toString());

    setResumeState({ status: 'fresh' });
  }, [router]);

  // Checking phase — show minimal loading
  if (resumeState.status === 'checking') {
    return (
      <div className="fixed inset-0 z-50 bg-ops-background flex items-center justify-center">
        <p className="font-caption text-xs uppercase tracking-[0.2em] text-ops-text-secondary">
          Loading...
        </p>
      </div>
    );
  }

  // Resume prompt
  if (resumeState.status === 'prompt') {
    return (
      <div className="fixed inset-0 z-50 bg-ops-background flex items-center">
        <motion.div
          initial={{ opacity: 0, y: 16, filter: 'blur(4px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 0.55, ease: EASE }}
          className="w-full pl-[8%] md:pl-[12%] lg:pl-[14%] pr-6 md:pr-10"
        >
          {/* Section label */}
          <span className="block font-caption text-[10px] uppercase tracking-[0.25em] text-ops-accent mb-8">
            [ RESUME ]
          </span>

          {/* Title */}
          <h1 className="font-heading font-bold uppercase text-ops-text-primary text-4xl md:text-5xl lg:text-6xl leading-[0.92] tracking-tight mb-6">
            Pick up where
            <br />
            you left off
          </h1>

          {/* Accent divider */}
          <div
            className="w-16 h-px mb-8"
            style={{ backgroundColor: 'rgba(89, 119, 148, 0.2)' }}
          />

          {/* Progress indicator */}
          <p className="font-caption text-[10px] uppercase tracking-[0.2em] text-ops-text-secondary mb-2">
            Section {resumeState.data.currentChunk} of {resumeState.data.totalChunks}
          </p>

          {/* Description */}
          <p className="font-heading font-light text-ops-text-secondary/50 text-sm leading-relaxed max-w-md mb-14">
            You have an in-progress assessment. Continue from where you
            stopped, or start a fresh session.
          </p>

          {/* Action buttons */}
          <div className="flex items-center gap-4">
            <button
              onClick={handleContinue}
              className="font-caption uppercase tracking-[0.2em] text-[11px] text-ops-background rounded-[3px] px-10 py-3.5 cursor-pointer transition-all duration-300 bg-white hover:bg-white/90"
            >
              Continue
            </button>
            <button
              onClick={handleStartFresh}
              className="font-caption uppercase tracking-[0.2em] text-[11px] text-ops-text-primary rounded-[3px] px-10 py-3.5 cursor-pointer transition-all duration-300 bg-transparent border border-ops-border hover:border-ops-border-hover"
            >
              Start Fresh
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Resuming — mount AssessmentFlow with resume data
  if (resumeState.status === 'resuming') {
    return <AssessmentFlow version={version} resumeData={resumeState.data} />;
  }

  // Fresh start (or upgrade from quick)
  return (
    <AssessmentFlow
      version={version}
      upgradeFromToken={version === 'deep' && upgradeFromParam ? upgradeFromParam : undefined}
    />
  );
}

/* ------------------------------------------------------------------ */
/*  Page wrapper                                                       */
/* ------------------------------------------------------------------ */

export default function AssessPage() {
  return (
    <Suspense
      fallback={
        <div className="fixed inset-0 z-50 bg-ops-background flex items-center justify-center">
          <p className="font-caption text-xs uppercase tracking-[0.2em] text-ops-text-secondary">
            Loading...
          </p>
        </div>
      }
    >
      <AssessmentContent />
    </Suspense>
  );
}
