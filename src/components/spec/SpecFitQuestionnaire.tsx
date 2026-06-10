'use client';

/**
 * SpecFitQuestionnaire — "Help me choose" modal.
 *
 * A focused glass overlay, one question per screen (scope → timeline → crew
 * size → budget band; never "which features"). Selecting an option advances;
 * the final selection runs the pure `recommend()` and hands the tier back to
 * the page, which scrolls to the packages, highlights the fit, and persists
 * ?fit= to the URL.
 *
 * Motion (animation-architect + web-animations): scrim fade + panel
 * fade/lift + per-question slide on the single OPS easing curve. Under
 * prefers-reduced-motion every transition collapses to a short fade with no
 * travel — an equivalent reduced variant, not a disabled one. No ambient
 * motion. Body scroll locks; Escape + scrim close; focus is trapped and
 * seeded on the first option each step.
 */

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { theme } from '@/lib/theme';
import type { SpecTier } from '@/lib/spec/pricing';
import { recommend, type FitAnswers } from '@/lib/spec/recommend';

const ease = theme.animation.easing as [number, number, number, number];

export interface FitOption {
  value: string;
  label: string;
}

export interface FitQuestion {
  /** Maps to a FitAnswers key: scope | timeline | team | budget. */
  key: keyof FitAnswers;
  question: string;
  options: FitOption[];
}

export interface FitQuestionnaireCopy {
  eyebrow: string;
  title: string;
  back: string;
  close: string;
  questions: FitQuestion[];
}

interface SpecFitQuestionnaireProps {
  open: boolean;
  copy: FitQuestionnaireCopy;
  onClose: () => void;
  onComplete: (tier: SpecTier, answers: FitAnswers) => void;
}

export default function SpecFitQuestionnaire({
  open,
  copy,
  onClose,
  onComplete,
}: SpecFitQuestionnaireProps) {
  const reduce = useReducedMotion() ?? false;
  const panelRef = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);
  const [answers, setAnswers] = useState<FitAnswers>({});
  const [wasOpen, setWasOpen] = useState(open);

  const total = copy.questions.length;
  const q = copy.questions[step];

  // Fresh start every time the modal opens (supports retake). React's
  // "adjust state during render when a prop changes" pattern — resetting here
  // instead of in an effect avoids a cascading post-render re-render.
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setStep(0);
      setDir(1);
      setAnswers({});
    }
  }

  // Body scroll lock + Escape + a focus trap while open.
  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      if (e.key !== 'Tab') return;
      const panel = panelRef.current;
      if (!panel) return;
      const focusable = panel.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])',
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }

    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  // Seed focus on the first option whenever the step (or open) changes.
  useEffect(() => {
    if (!open) return;
    const id = requestAnimationFrame(() => {
      const firstOption = panelRef.current?.querySelector<HTMLElement>('[data-fit-option]');
      firstOption?.focus();
    });
    return () => cancelAnimationFrame(id);
  }, [open, step]);

  function choose(value: string) {
    const next: FitAnswers = { ...answers, [q.key]: value };
    setAnswers(next);
    if (step < total - 1) {
      setDir(1);
      setStep((s) => s + 1);
    } else {
      onComplete(recommend(next), next);
    }
  }

  function goBack() {
    if (step > 0) {
      setDir(-1);
      setStep((s) => s - 1);
    }
  }

  const slide = reduce ? 0 : 24;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduce ? 0.15 : 0.2, ease }}
        >
          {/* Scrim */}
          <button
            type="button"
            aria-label={copy.close}
            onClick={onClose}
            className="absolute inset-0 cursor-default bg-black/70 backdrop-blur-sm"
            tabIndex={-1}
          />

          {/* Panel */}
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label={copy.title}
            tabIndex={-1}
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: 24 }}
            transition={{ duration: reduce ? 0.15 : 0.28, ease }}
            className="relative z-10 w-full max-w-[560px] overflow-hidden rounded-t-[12px] border border-ops-border bg-ops-glass-dense p-6 backdrop-blur-xl sm:rounded-[12px] sm:p-8"
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-4">
              <span className="font-caption text-[11px] uppercase tracking-[0.2em] text-ops-text-tertiary">
                {copy.eyebrow}
              </span>
              <button
                type="button"
                onClick={onClose}
                aria-label={copy.close}
                className="-mr-1 -mt-1 flex h-7 w-7 items-center justify-center rounded-[3px] text-ops-text-tertiary transition-colors duration-150 hover:text-ops-text-primary focus-visible:outline focus-visible:outline-[1.5px] focus-visible:outline-ops-accent focus-visible:outline-offset-2"
              >
                <svg className="h-3.5 w-3.5" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                  <path d="M3 3l8 8M11 3l-8 8" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            <p className="mt-1 font-heading font-light text-lg text-ops-text-primary">{copy.title}</p>

            {/* Progress */}
            <div className="mt-5 flex items-center gap-3">
              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-ops-text-mute [font-variant-numeric:tabular-nums_slashed-zero]">
                {String(step + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
              </span>
              <div className="flex flex-1 gap-1.5" aria-hidden="true">
                {copy.questions.map((_, i) => (
                  <span
                    key={i}
                    className={`h-px flex-1 transition-colors duration-300 ${
                      i < step ? 'bg-white/40' : i === step ? 'bg-white/70' : 'bg-white/12'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Question + options */}
            <div className="mt-6 min-h-[316px]">
              <AnimatePresence mode="wait" custom={dir}>
                <motion.div
                  key={step}
                  custom={dir}
                  initial={{ opacity: 0, x: dir * slide }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -dir * slide }}
                  transition={{ duration: reduce ? 0.12 : 0.25, ease }}
                >
                  <p className="font-heading font-light text-xl text-ops-text-primary leading-snug">
                    {q.question}
                  </p>
                  <div className="mt-5 flex flex-col gap-2.5">
                    {q.options.map((opt) => {
                      const selected = answers[q.key] === opt.value;
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          data-fit-option
                          onClick={() => choose(opt.value)}
                          className={`group flex w-full items-center gap-3 rounded-[5px] border px-4 py-3.5 text-left transition-colors duration-150 cursor-pointer focus-visible:outline focus-visible:outline-[1.5px] focus-visible:outline-ops-accent focus-visible:outline-offset-2 ${
                            selected
                              ? 'border-white/30 bg-white/[0.04]'
                              : 'border-white/[0.10] hover:border-white/25 hover:bg-white/[0.02]'
                          }`}
                        >
                          <span
                            aria-hidden="true"
                            className={`h-1.5 w-1.5 flex-shrink-0 rounded-full transition-colors duration-150 ${
                              selected ? 'bg-white/70' : 'bg-white/20 group-hover:bg-white/40'
                            }`}
                          />
                          <span className="font-heading font-light text-sm text-ops-text-secondary leading-snug">
                            {opt.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Footer */}
            <div className="mt-6 flex items-center justify-between border-t border-white/[0.06] pt-4">
              <button
                type="button"
                onClick={goBack}
                disabled={step === 0}
                className="font-mono text-[10px] uppercase tracking-[0.18em] text-ops-text-tertiary transition-colors duration-150 hover:text-ops-text-primary disabled:pointer-events-none disabled:opacity-0 focus-visible:outline focus-visible:outline-[1.5px] focus-visible:outline-ops-accent focus-visible:outline-offset-2"
              >
                {copy.back}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
