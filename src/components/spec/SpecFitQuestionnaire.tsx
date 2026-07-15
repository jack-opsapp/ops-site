'use client';

/**
 * SpecFitQuestionnaire — the tier guide v2 ("60-second fit check").
 *
 * Method authority: 09_TIER_GUIDE_DESIGN § 3 (branch on OPS experience;
 * cold questions only about the prospect's own world), outcomes remapped
 * per 10_TIER_MODEL_V2 § 7 via lib/spec/recommend.ts. The result renders
 * inside the modal: outcome + the bracketed driver + honest-floor notes,
 * with the free trial leading every result it can. SPEC-03 is never a
 * checkout from here — it's a founder conversation.
 *
 * Shell (kept from the v1 modal): glass overlay, one question per screen,
 * body scroll lock, Escape + scrim close, focus trap, focus seeded per
 * step. Motion on the single OPS curve; under prefers-reduced-motion every
 * transition collapses to a short fade with no travel. E1 is the one
 * multi-select (checkboxes + explicit CONTINUE, no auto-advance).
 */

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { theme } from '@/lib/theme';
import type { Dictionary } from '@/i18n/types';
import {
  recommendCold,
  recommendExisting,
  type ColdAnswers,
  type ExistingAnswers,
  type GuideResult,
} from '@/lib/spec/recommend';
import { trackSpecMarketingEvent } from '@/lib/marketing-analytics';

const ease = theme.animation.easing as [number, number, number, number];

/** Free-trial entry (confirmed signup URL — lib/spec/seo-redirects targets). */
const TRIAL_URL = 'https://app.opsapp.co/register?source=spec_guide';
/** Founder conversation entry (same contact form the package CTAs use). */
const FOUNDER_URL = '/resources#contact';

type StepId =
  | 'branch'
  | 'c1'
  | 'c2'
  | 'c3'
  | 'c4'
  | 'c5'
  | 'c6'
  | 'e1'
  | 'disconfirm'
  | 'e2'
  | 'e3'
  | 'result';

interface GuideState {
  step: StepId;
  cold: Partial<ColdAnswers>;
  walls: ExistingAnswers['walls'];
  disconfirm?: ExistingAnswers['disconfirm'];
  e2?: ExistingAnswers['e2'];
  e3?: ExistingAnswers['e3'];
  result: GuideResult | null;
}

const INITIAL: GuideState = { step: 'branch', cold: {}, walls: [], result: null };

interface SpecFitQuestionnaireProps {
  open: boolean;
  dict: Dictionary;
  onClose: () => void;
  /** Fired the moment a result is computed — page applies highlight + ?fit=. */
  onResult: (result: GuideResult) => void;
}

function t(dict: Dictionary, key: string): string {
  const value = dict[key];
  return typeof value === 'string' ? value : key;
}

export default function SpecFitQuestionnaire({
  open,
  dict,
  onClose,
  onResult,
}: SpecFitQuestionnaireProps) {
  const reduce = useReducedMotion() ?? false;
  const panelRef = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<GuideState>(INITIAL);
  const [dir, setDir] = useState(1);
  const [wasOpen, setWasOpen] = useState(open);

  // Fresh start every time the modal opens (supports retake). Adjust-during-
  // render pattern — avoids a cascading post-render re-render. Side effects
  // (analytics) stay out of render — see the effect below.
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setState(INITIAL);
      setDir(1);
    }
  }

  useEffect(() => {
    if (open) trackSpecMarketingEvent('tier_guide_started', {});
  }, [open]);

  // Hand the computed result to the page AFTER commit — calling onResult
  // during a state updater would update the parent (Router/replaceState)
  // mid-render.
  const result = state.result;
  useEffect(() => {
    if (!result) return;
    trackSpecMarketingEvent('tier_guide_completed', {
      lane: result.branch,
      outcome: result.headline,
      driver: result.driver,
      data_setup_rider: result.dataSetupRider,
      founder_escape: result.founderEscape,
    });
    onResult(result);
    // onResult is intentionally read once per computed result — the parent
    // callback identity is stable (useCallback in SpecPageContent).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [result]);

  // Body scroll lock + Escape + focus trap while open.
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
        'button:not([disabled]), [href], input:not([disabled]), [tabindex]:not([tabindex="-1"])',
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

  // Seed focus per step: the result heading on the result screen, else the
  // first option control.
  useEffect(() => {
    if (!open) return;
    const id = requestAnimationFrame(() => {
      const target =
        panelRef.current?.querySelector<HTMLElement>('[data-guide-focus]') ??
        panelRef.current?.querySelector<HTMLElement>('[data-fit-option]');
      target?.focus();
    });
    return () => cancelAnimationFrame(id);
  }, [open, state.step]);

  // ── Path machinery ────────────────────────────────────────────────────────

  /** The cold sequence, honoring the C2 skip when C1 = manual. */
  function coldSequence(cold: Partial<ColdAnswers>): StepId[] {
    return cold.c1 === 'manual'
      ? ['c1', 'c3', 'c4', 'c5', 'c6']
      : ['c1', 'c2', 'c3', 'c4', 'c5', 'c6'];
  }

  /** The existing sequence, honoring the conditional interstitials. */
  function existingSequence(s: GuideState): StepId[] {
    const seq: StepId[] = ['e1'];
    if (s.walls.includes('missing')) seq.push('disconfirm');
    if (s.walls.includes('data')) seq.push('e2');
    if (s.walls.includes('missing') && s.disconfirm === 'genuinely_missing') seq.push('e3');
    return seq;
  }

  function activeSequence(s: GuideState): StepId[] {
    if (s.step === 'branch') return [];
    if (['c1', 'c2', 'c3', 'c4', 'c5', 'c6'].includes(s.step)) return coldSequence(s.cold);
    return existingSequence(s);
  }

  // All handlers compute the next state from the current closure state and
  // commit it with a plain setState — no side effects inside updaters (they
  // double-fire under StrictMode and can update the parent mid-render).

  function chooseBranch(branch: 'cold' | 'existing') {
    trackSpecMarketingEvent('tier_guide_branched', { branch });
    setDir(1);
    setState({ ...state, step: branch === 'cold' ? 'c1' : 'e1' });
  }

  function chooseCold(key: keyof ColdAnswers, value: string) {
    trackSpecMarketingEvent('tier_guide_answered', { step: key, option: value });
    const cold: Partial<ColdAnswers> = { ...state.cold, [key]: value };
    if (key === 'c1' && value === 'manual') cold.c2 = 'na';
    const seq = coldSequence(cold);
    const idx = seq.indexOf(key as StepId);
    const next = seq[idx + 1];
    setDir(1);
    if (!next) {
      setState({ ...state, cold, step: 'result', result: recommendCold(cold as ColdAnswers) });
    } else {
      setState({ ...state, cold, step: next });
    }
  }

  function toggleWall(wall: ExistingAnswers['walls'][number]) {
    setState({
      ...state,
      walls: state.walls.includes(wall)
        ? state.walls.filter((w) => w !== wall)
        : [...state.walls, wall],
    });
  }

  function existingResult(s: GuideState): GuideResult {
    return recommendExisting({ walls: s.walls, disconfirm: s.disconfirm, e2: s.e2, e3: s.e3 });
  }

  function continueFromE1() {
    trackSpecMarketingEvent('tier_guide_answered', { step: 'e1', option: state.walls.join(',') });
    setDir(1);
    if (state.walls.includes('missing')) {
      setState({ ...state, step: 'disconfirm' });
    } else if (state.walls.includes('data')) {
      setState({ ...state, step: 'e2' });
    } else {
      setState({ ...state, step: 'result', result: existingResult(state) });
    }
  }

  function chooseExisting(step: 'disconfirm' | 'e2' | 'e3', value: string) {
    trackSpecMarketingEvent('tier_guide_answered', { step, option: value });
    const next: GuideState = { ...state, [step]: value } as GuideState;
    const seq = existingSequence(next);
    const after = seq[seq.indexOf(step) + 1];
    setDir(1);
    if (!after) {
      setState({ ...next, step: 'result', result: existingResult(next) });
    } else {
      setState({ ...next, step: after });
    }
  }

  function goBack() {
    setDir(-1);
    setState((s) => {
      if (s.step === 'result') {
        // Back out of the result to the last question of the taken lane.
        const seq = s.result?.branch === 'cold' ? coldSequence(s.cold) : existingSequence(s);
        return { ...s, step: seq[seq.length - 1] ?? 'branch', result: null };
      }
      const seq = activeSequence(s);
      const idx = seq.indexOf(s.step);
      if (idx > 0) return { ...s, step: seq[idx - 1] };
      return { ...s, step: 'branch' };
    });
  }

  function restart() {
    setDir(-1);
    setState({ ...INITIAL });
  }

  // ── Render helpers ────────────────────────────────────────────────────────

  const slide = reduce ? 0 : 24;

  function OptionButton({
    label,
    hint,
    selected,
    onSelect,
  }: {
    label: string;
    hint: string;
    selected?: boolean;
    onSelect: () => void;
  }) {
    return (
      <button
        type="button"
        data-fit-option
        onClick={onSelect}
        className={`group flex w-full items-start gap-3 rounded-[5px] border px-4 py-3.5 text-left transition-colors duration-150 cursor-pointer focus-visible:outline focus-visible:outline-[1.5px] focus-visible:outline-ops-accent focus-visible:outline-offset-2 ${
          selected
            ? 'border-white/30 bg-white/[0.04]'
            : 'border-white/[0.10] hover:border-white/25 hover:bg-white/[0.02]'
        }`}
      >
        <span
          aria-hidden="true"
          className={`mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full transition-colors duration-150 ${
            selected ? 'bg-white/70' : 'bg-white/20 group-hover:bg-white/40'
          }`}
        />
        <span className="flex flex-col gap-0.5">
          <span className="font-heading font-light text-sm text-ops-text-secondary leading-snug">
            {label}
          </span>
          <span className="font-heading font-light text-xs text-ops-text-mute leading-snug">
            {hint}
          </span>
        </span>
      </button>
    );
  }

  function SingleSelect({
    id,
    options,
    onSelect,
  }: {
    id: string;
    options: string[];
    onSelect: (value: string) => void;
  }) {
    return (
      <>
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ops-text-mute [font-variant-numeric:tabular-nums_slashed-zero]">
          {t(dict, `guide.${id}.kicker`)}
        </p>
        <p className="mt-2 font-heading font-light text-xl text-ops-text-primary leading-snug">
          {t(dict, `guide.${id}.prompt`)}
        </p>
        <div className="mt-5 flex flex-col gap-2.5" role="radiogroup" aria-label={t(dict, `guide.${id}.prompt`)}>
          {options.map((value) => (
            <OptionButton
              key={value}
              label={t(dict, `guide.${id}.${value}.label`)}
              hint={t(dict, `guide.${id}.${value}.hint`)}
              onSelect={() => onSelect(value)}
            />
          ))}
        </div>
      </>
    );
  }

  // Progress: position within the taken lane (branch + result excluded).
  const seq = activeSequence(state);
  const stepIndex = seq.indexOf(state.step);
  const showProgress = state.step !== 'branch' && state.step !== 'result' && stepIndex >= 0;

  const resultKey =
    result?.headline === 'spec03_conversation' ? 'spec03' : (result?.headline ?? 'ops');

  function renderStep() {
    switch (state.step) {
      case 'branch':
        return (
          <SingleSelect
            id="branch"
            options={['cold', 'existing']}
            onSelect={(v) => chooseBranch(v as 'cold' | 'existing')}
          />
        );
      case 'c1':
      case 'c2':
      case 'c3':
      case 'c4':
      case 'c5':
      case 'c6': {
        const optionsByStep: Record<string, string[]> = {
          c1: ['manual', 'light_tool'],
          c2: ['start_clean', 'bring_history'],
          c3: ['solo', 'multi_crew', 'multi_division'],
          c4: ['rarely', 'weekly', 'constant'],
          c5: ['no', 'yes'],
          c6: ['show_me', 'myself', 'not_sure', 'do_for_me'],
        };
        const id = state.step;
        return (
          <SingleSelect
            id={id}
            options={optionsByStep[id]}
            onSelect={(v) => chooseCold(id as keyof ColdAnswers, v)}
          />
        );
      }
      case 'e1':
        return (
          <>
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ops-text-mute [font-variant-numeric:tabular-nums_slashed-zero]">
              {t(dict, 'guide.e1.kicker')}
            </p>
            <p className="mt-2 font-heading font-light text-xl text-ops-text-primary leading-snug">
              {t(dict, 'guide.e1.prompt')}
            </p>
            <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.14em] text-ops-text-mute">
              {t(dict, 'guide.e1.subprompt')}
            </p>
            <div className="mt-5 flex flex-col gap-2.5" role="group" aria-label={t(dict, 'guide.e1.prompt')}>
              {(['setting', 'stages', 'fields', 'data', 'missing'] as const).map((wall) => {
                const checked = state.walls.includes(wall);
                return (
                  <label
                    key={wall}
                    className={`group flex w-full cursor-pointer items-start gap-3 rounded-[5px] border px-4 py-3.5 transition-colors duration-150 ${
                      checked
                        ? 'border-white/30 bg-white/[0.04]'
                        : 'border-white/[0.10] hover:border-white/25 hover:bg-white/[0.02]'
                    }`}
                  >
                    <input
                      type="checkbox"
                      data-fit-option
                      checked={checked}
                      onChange={() => toggleWall(wall)}
                      className="mt-1 h-3.5 w-3.5 flex-shrink-0 cursor-pointer appearance-none rounded-[2px] border border-white/30 bg-transparent transition-colors duration-150 checked:border-white/70 checked:bg-white/70 focus-visible:outline focus-visible:outline-[1.5px] focus-visible:outline-ops-accent focus-visible:outline-offset-2"
                    />
                    <span className="flex flex-col gap-0.5">
                      <span className="font-heading font-light text-sm text-ops-text-secondary leading-snug">
                        {t(dict, `guide.e1.${wall}.label`)}
                      </span>
                      <span className="font-heading font-light text-xs text-ops-text-mute leading-snug">
                        {t(dict, `guide.e1.${wall}.hint`)}
                      </span>
                    </span>
                  </label>
                );
              })}
            </div>
            <button
              type="button"
              onClick={continueFromE1}
              disabled={state.walls.length === 0}
              className="mt-5 inline-flex items-center justify-center rounded-[5px] border border-ops-border px-6 py-3 font-caption text-xs uppercase tracking-[0.15em] text-ops-text-primary transition-colors duration-200 cursor-pointer hover:border-ops-border-hover disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline focus-visible:outline-[1.5px] focus-visible:outline-ops-accent focus-visible:outline-offset-2"
            >
              {t(dict, 'guide.e1.continue')}
            </button>
          </>
        );
      case 'disconfirm':
        return (
          <SingleSelect
            id="disconfirm"
            options={['is_setting', 'genuinely_missing']}
            onSelect={(v) => chooseExisting('disconfirm', v)}
          />
        );
      case 'e2':
        return (
          <SingleSelect
            id="e2"
            options={['simple', 'incumbent_simple', 'incumbent_complex']}
            onSelect={(v) => chooseExisting('e2', v)}
          />
        );
      case 'e3':
        return (
          <SingleSelect
            id="e3"
            options={['one_module', 'several']}
            onSelect={(v) => chooseExisting('e3', v)}
          />
        );
      case 'result': {
        if (!result) return null;
        const isOps = result.headline === 'ops';
        const isConversation = result.headline === 'spec03_conversation';
        const seeTierLabel = t(dict, 'guide.result.ctaSeeTier').replace(
          '{tier}',
          t(dict, `board.tierLabels.${result.fitTier ?? 'spec02'}`),
        );
        return (
          <div aria-live="polite">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ops-text-mute [font-variant-numeric:tabular-nums_slashed-zero]">
              {t(dict, 'guide.result.label')}
            </p>
            <h3
              data-guide-focus
              tabIndex={-1}
              className="mt-2 font-heading font-light text-2xl text-ops-text-primary tracking-tight outline-none"
            >
              {t(dict, `guide.result.${resultKey}.headline`)}
            </h3>
            <div aria-hidden="true" className="mt-3 h-px w-16 bg-white/25" />
            <p className="mt-4 font-heading font-light text-sm text-ops-text-secondary leading-relaxed">
              {t(dict, `guide.result.${resultKey}.reason`)}
            </p>
            <p className="mt-3 font-mono text-[11px] text-ops-text-tertiary leading-relaxed [font-variant-numeric:tabular-nums_slashed-zero]">
              {t(dict, `guide.driver.${result.driver}`)}
            </p>

            {/* Honest-floor notes — short tan-railed lines, never hidden. */}
            <div className="mt-5 flex flex-col gap-2.5">
              {result.settingPointer && <GuideNote text={t(dict, 'guide.notes.settingPointer')} />}
              {result.dataSetupRider && <GuideNote text={t(dict, 'guide.notes.dataSetupRider')} />}
              {result.spec01Door && <GuideNote text={t(dict, 'guide.notes.spec01Door')} />}
              {result.founderEscape && !isConversation && (
                <GuideNote text={t(dict, 'guide.notes.founderEscape')} />
              )}
              {!isOps && !isConversation && <GuideNote text={t(dict, 'guide.notes.trialLead')} />}
            </div>

            {/* Actions — the free door leads every result it can. */}
            <div className="mt-6 flex flex-col gap-2.5 sm:flex-row sm:flex-wrap">
              <a
                href={TRIAL_URL}
                onClick={() =>
                  trackSpecMarketingEvent('tier_guide_trial_started', {
                    lane: result.branch,
                    driver: result.driver,
                  })
                }
                className={`inline-flex items-center justify-center rounded-[5px] px-6 py-3 font-caption text-xs uppercase tracking-[0.15em] transition-colors duration-200 cursor-pointer focus-visible:outline focus-visible:outline-[1.5px] focus-visible:outline-ops-accent focus-visible:outline-offset-2 ${
                  isOps
                    ? 'bg-ops-accent text-ops-background hover:bg-ops-accent/90'
                    : 'border border-ops-border text-ops-text-primary hover:border-ops-border-hover'
                }`}
              >
                {t(dict, 'guide.result.ctaTrial')}
              </a>
              {result.fitTier && (
                <button
                  type="button"
                  onClick={onClose}
                  className="inline-flex items-center justify-center rounded-[5px] bg-ops-accent px-6 py-3 font-caption text-xs uppercase tracking-[0.15em] text-ops-background transition-colors duration-200 cursor-pointer hover:bg-ops-accent/90 focus-visible:outline focus-visible:outline-[1.5px] focus-visible:outline-ops-accent focus-visible:outline-offset-2"
                >
                  {seeTierLabel}
                </button>
              )}
              {(isConversation || result.founderEscape) && (
                <a
                  href={FOUNDER_URL}
                  onClick={() => {
                    trackSpecMarketingEvent('tier_guide_founder_escape', {
                      lane: result.branch,
                      driver: result.driver,
                    });
                    onClose();
                  }}
                  className={`inline-flex items-center justify-center rounded-[5px] px-6 py-3 font-caption text-xs uppercase tracking-[0.15em] transition-colors duration-200 cursor-pointer focus-visible:outline focus-visible:outline-[1.5px] focus-visible:outline-ops-accent focus-visible:outline-offset-2 ${
                    isConversation
                      ? 'bg-ops-accent text-ops-background hover:bg-ops-accent/90'
                      : 'border border-ops-border text-ops-text-primary hover:border-ops-border-hover'
                  }`}
                >
                  {t(dict, 'guide.result.ctaFounder')}
                </a>
              )}
            </div>
          </div>
        );
      }
    }
  }

  function GuideNote({ text }: { text: string }) {
    return (
      <p className="border-l-2 border-ops-tan/60 pl-3 font-heading font-light text-xs text-ops-text-tertiary leading-relaxed">
        {text}
      </p>
    );
  }

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
            aria-label={t(dict, 'questionnaire.close')}
            onClick={onClose}
            className="absolute inset-0 cursor-default bg-black/70 backdrop-blur-sm"
            tabIndex={-1}
          />

          {/* Panel */}
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label={t(dict, 'guide.title')}
            tabIndex={-1}
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: 24 }}
            transition={{ duration: reduce ? 0.15 : 0.28, ease }}
            className="relative z-10 flex max-h-[92dvh] w-full max-w-[560px] flex-col overflow-hidden rounded-t-[12px] border border-ops-border bg-ops-glass-dense p-6 backdrop-blur-xl sm:rounded-[12px] sm:p-8"
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-4">
              <span className="font-caption text-[11px] uppercase tracking-[0.2em] text-ops-text-tertiary">
                {t(dict, 'questionnaire.eyebrow')}
              </span>
              <button
                type="button"
                onClick={onClose}
                aria-label={t(dict, 'questionnaire.close')}
                className="-mr-1 -mt-1 flex h-7 w-7 items-center justify-center rounded-[3px] text-ops-text-tertiary transition-colors duration-150 hover:text-ops-text-primary focus-visible:outline focus-visible:outline-[1.5px] focus-visible:outline-ops-accent focus-visible:outline-offset-2"
              >
                <svg className="h-3.5 w-3.5" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                  <path d="M3 3l8 8M11 3l-8 8" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            <p className="mt-1 font-heading font-light text-lg text-ops-text-primary">
              {t(dict, 'guide.title')}
            </p>

            {/* Progress — reflects the actual length of the chosen path. */}
            {showProgress && (
              <div className="mt-5 flex items-center gap-3">
                <span
                  className="font-mono text-[10px] uppercase tracking-[0.18em] text-ops-text-mute [font-variant-numeric:tabular-nums_slashed-zero]"
                  aria-label={t(dict, 'guide.a11y.progress')
                    .replace('{n}', String(stepIndex + 1))
                    .replace('{total}', String(seq.length))}
                >
                  {String(stepIndex + 1).padStart(2, '0')} / {String(seq.length).padStart(2, '0')}
                </span>
                <div className="flex flex-1 gap-1.5" aria-hidden="true">
                  {seq.map((_, i) => (
                    <span
                      key={i}
                      className={`h-px flex-1 transition-colors duration-300 ${
                        i < stepIndex ? 'bg-white/40' : i === stepIndex ? 'bg-white/70' : 'bg-white/12'
                      }`}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Step body */}
            <div className="mt-6 min-h-[316px] flex-1 overflow-y-auto pr-1">
              <AnimatePresence mode="wait" custom={dir}>
                <motion.div
                  key={state.step}
                  custom={dir}
                  initial={{ opacity: 0, x: dir * slide }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -dir * slide }}
                  transition={{ duration: reduce ? 0.12 : 0.25, ease }}
                >
                  {renderStep()}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Footer */}
            <div className="mt-6 flex items-center justify-between border-t border-white/[0.06] pt-4">
              <button
                type="button"
                onClick={goBack}
                disabled={state.step === 'branch'}
                className="font-mono text-[10px] uppercase tracking-[0.18em] text-ops-text-tertiary transition-colors duration-150 hover:text-ops-text-primary disabled:pointer-events-none disabled:opacity-0 focus-visible:outline focus-visible:outline-[1.5px] focus-visible:outline-ops-accent focus-visible:outline-offset-2"
              >
                {t(dict, 'guide.back')}
              </button>
              {state.step === 'result' && (
                <button
                  type="button"
                  onClick={restart}
                  className="font-mono text-[10px] uppercase tracking-[0.18em] text-ops-text-tertiary transition-colors duration-150 hover:text-ops-text-primary focus-visible:outline focus-visible:outline-[1.5px] focus-visible:outline-ops-accent focus-visible:outline-offset-2"
                >
                  {t(dict, 'guide.restart')}
                </button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
