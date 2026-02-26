/**
 * AssessmentFlow — Core state machine orchestrator
 *
 * Manages the full assessment lifecycle:
 *   starting → cover → cover_exit → questioning → chunk_review →
 *   submitting_chunk → chunk_transition → questioning (loop) →
 *   email_capture → generating → complete
 *
 * Supports back navigation and step dot navigation within chunks.
 * Uses QuestionTransition star galaxy between questions.
 * Uses CoverTransition galaxy burst between cover and first question.
 */

'use client';

import { useReducer, useEffect, useCallback, useRef, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import type {
  AssessmentVersion,
  ClientQuestion,
  ChunkSubmission,
} from '@/lib/assessment/types';
import {
  startAssessment,
  startUpgradeAssessment,
  submitChunkAndGetNext,
  submitEmailAndGenerateResults,
} from '@/lib/assessment/actions';
import {
  saveDraftAnswers,
  clearDraftAnswers,
} from '@/lib/assessment/session-storage';
import AssessmentOverlay from './AssessmentOverlay';
import type { PhaseLabel } from './AssessmentOverlay';
import QuestionFrame from './QuestionFrame';
import QuestionTransition from './QuestionTransition';
import ChunkTransition from './ChunkTransition';
import EmailCapture from './EmailCapture';
import ChunkReview from './ChunkReview';
import GeneratingState from './GeneratingState';
import StepDots from './StepDots';

/* ------------------------------------------------------------------ */
/*  State Types                                                        */
/* ------------------------------------------------------------------ */

type Phase =
  | 'starting'
  | 'cover'
  | 'cover_exit'
  | 'questioning'
  | 'question_transition'
  | 'chunk_review'
  | 'submitting_chunk'
  | 'chunk_transition'
  | 'email_capture'
  | 'generating'
  | 'complete'
  | 'error';

interface FlowState {
  phase: Phase;
  version: AssessmentVersion;
  sessionId: string | null;
  token: string | null;
  currentChunk: number;
  totalChunks: number;
  questions: ClientQuestion[];
  questionIndex: number;
  chunkResponses: ChunkSubmission[];
  questionStartTime: number;
  error: string | null;
  chunkApiDone: boolean;
  chunkAnimDone: boolean;
  nextQuestions: ClientQuestion[] | null;
  savedAnswers: Map<string, number | string>;
  transitionDirection: 'forward' | 'back';
  isTransitioning: boolean;
  targetQuestionIndex: number;
  isRevising: boolean;
}

/* ------------------------------------------------------------------ */
/*  Actions                                                            */
/* ------------------------------------------------------------------ */

type FlowAction =
  | { type: 'START_SUCCESS'; sessionId: string; token: string; questions: ClientQuestion[]; totalChunks: number }
  | { type: 'DISMISS_COVER' }
  | { type: 'COVER_EXIT_DONE' }
  | { type: 'SELECT_ANSWER'; questionId: string; value: number | string }
  | { type: 'CONFIRM_ADVANCE'; responseTimeMs: number }
  | { type: 'GO_BACK' }
  | { type: 'NAVIGATE_TO_STEP'; index: number }
  | { type: 'QUESTION_TRANSITION_DONE' }
  | { type: 'CONFIRM_CHUNK' }
  | { type: 'COMPLETE_SECTION' }
  | { type: 'REVISE_QUESTION'; index: number }
  | { type: 'CHUNK_SUBMITTED'; complete: boolean; questions?: ClientQuestion[]; currentChunk: number; totalChunks: number }
  | { type: 'CHUNK_ANIM_DONE' }
  | { type: 'CHUNK_API_DONE'; complete: boolean; questions?: ClientQuestion[]; currentChunk: number; totalChunks: number }
  | { type: 'EMAIL_SUBMITTED' }
  | { type: 'GENERATION_COMPLETE'; token: string }
  | { type: 'ERROR'; message: string }
  | { type: 'RETRY' };

function reducer(state: FlowState, action: FlowAction): FlowState {
  switch (action.type) {
    case 'START_SUCCESS':
      return {
        ...state,
        phase: 'cover',
        sessionId: action.sessionId,
        token: action.token,
        questions: action.questions,
        totalChunks: action.totalChunks,
        currentChunk: 1,
        questionIndex: 0,
        error: null,
        savedAnswers: new Map(),
      };

    case 'DISMISS_COVER':
      return {
        ...state,
        phase: 'cover_exit',
      };

    case 'COVER_EXIT_DONE':
      return {
        ...state,
        phase: 'questioning',
        questionStartTime: Date.now(),
      };

    case 'SELECT_ANSWER': {
      const newAnswers = new Map(state.savedAnswers);
      newAnswers.set(action.questionId, action.value);
      return {
        ...state,
        savedAnswers: newAnswers,
      };
    }

    case 'CONFIRM_ADVANCE': {
      const question = state.questions[state.questionIndex];
      const savedValue = state.savedAnswers.get(question.id);
      if (savedValue === undefined) return state;

      const response: ChunkSubmission = {
        question_id: question.id,
        answer_value: savedValue,
        response_time_ms: action.responseTimeMs,
      };

      const existingIdx = state.chunkResponses.findIndex(r => r.question_id === question.id);
      const newResponses = existingIdx >= 0
        ? state.chunkResponses.map((r, i) => i === existingIdx ? response : r)
        : [...state.chunkResponses, response];

      // If revising from chunk_review, return to review after answering
      if (state.isRevising) {
        return {
          ...state,
          chunkResponses: newResponses,
          phase: 'chunk_review',
          isRevising: false,
        };
      }

      const isLastInChunk = state.questionIndex >= state.questions.length - 1;

      if (isLastInChunk) {
        return {
          ...state,
          chunkResponses: newResponses,
          phase: 'chunk_review',
        };
      }

      return {
        ...state,
        chunkResponses: newResponses,
        phase: 'question_transition',
        transitionDirection: 'forward',
        isTransitioning: true,
        targetQuestionIndex: state.questionIndex + 1,
      };
    }

    case 'GO_BACK': {
      // If revising from chunk_review, return to review
      if (state.isRevising) {
        return {
          ...state,
          phase: 'chunk_review',
          isRevising: false,
        };
      }
      if (state.questionIndex <= 0) return state;
      return {
        ...state,
        phase: 'question_transition',
        transitionDirection: 'back',
        isTransitioning: true,
        targetQuestionIndex: state.questionIndex - 1,
      };
    }

    case 'NAVIGATE_TO_STEP': {
      const idx = action.index;
      if (idx === state.questionIndex) return state;
      if (idx < 0 || idx >= state.questions.length) return state;
      return {
        ...state,
        phase: 'question_transition',
        transitionDirection: idx > state.questionIndex ? 'forward' : 'back',
        isTransitioning: true,
        targetQuestionIndex: idx,
      };
    }

    case 'QUESTION_TRANSITION_DONE':
      return {
        ...state,
        phase: 'questioning',
        questionIndex: state.targetQuestionIndex,
        questionStartTime: Date.now(),
        isTransitioning: false,
      };

    case 'CONFIRM_CHUNK': {
      // Rebuild chunkResponses from savedAnswers to capture any revisions
      const rebuiltResponses: ChunkSubmission[] = state.questions.map(q => {
        const existing = state.chunkResponses.find(r => r.question_id === q.id);
        return {
          question_id: q.id,
          answer_value: state.savedAnswers.get(q.id) ?? existing?.answer_value ?? 0,
          response_time_ms: existing?.response_time_ms ?? 0,
        };
      });
      return {
        ...state,
        phase: 'submitting_chunk',
        chunkResponses: rebuiltResponses,
      };
    }

    case 'COMPLETE_SECTION':
      return {
        ...state,
        phase: 'chunk_review',
        isRevising: false,
      };

    case 'REVISE_QUESTION':
      return {
        ...state,
        phase: 'questioning',
        questionIndex: action.index,
        questionStartTime: Date.now(),
        isRevising: true,
      };

    case 'CHUNK_SUBMITTED': {
      if (action.complete) {
        return {
          ...state,
          phase: 'email_capture',
          chunkResponses: [],
          currentChunk: action.currentChunk,
          totalChunks: action.totalChunks,
        };
      }
      return {
        ...state,
        phase: 'chunk_transition',
        chunkResponses: [],
        chunkApiDone: true,
        chunkAnimDone: false,
        nextQuestions: action.questions || null,
        currentChunk: action.currentChunk,
        totalChunks: action.totalChunks,
      };
    }

    case 'CHUNK_ANIM_DONE': {
      if (state.chunkApiDone && state.nextQuestions) {
        return {
          ...state,
          phase: 'questioning',
          questions: state.nextQuestions,
          nextQuestions: null,
          questionIndex: 0,
          questionStartTime: Date.now(),
          chunkAnimDone: false,
          chunkApiDone: false,
          savedAnswers: new Map(),
        };
      }
      return { ...state, chunkAnimDone: true };
    }

    case 'CHUNK_API_DONE': {
      if (action.complete) {
        return {
          ...state,
          phase: 'email_capture',
          chunkResponses: [],
          currentChunk: action.currentChunk,
          totalChunks: action.totalChunks,
        };
      }
      if (state.chunkAnimDone && action.questions) {
        return {
          ...state,
          phase: 'questioning',
          questions: action.questions,
          nextQuestions: null,
          questionIndex: 0,
          questionStartTime: Date.now(),
          chunkAnimDone: false,
          chunkApiDone: false,
          currentChunk: action.currentChunk,
          totalChunks: action.totalChunks,
          savedAnswers: new Map(),
        };
      }
      return {
        ...state,
        chunkApiDone: true,
        nextQuestions: action.questions || null,
        currentChunk: action.currentChunk,
        totalChunks: action.totalChunks,
      };
    }

    case 'EMAIL_SUBMITTED':
      return { ...state, phase: 'generating' };

    case 'GENERATION_COMPLETE':
      return { ...state, phase: 'complete', token: action.token };

    case 'ERROR':
      return { ...state, phase: 'error', error: action.message };

    case 'RETRY': {
      if (state.sessionId && state.questions.length > 0) {
        if (state.chunkResponses.length > 0) {
          return { ...state, phase: 'submitting_chunk', error: null };
        }
        return { ...state, phase: 'questioning', error: null, questionStartTime: Date.now() };
      }
      return { ...state, phase: 'starting', error: null };
    }

    default:
      return state;
  }
}

/* ------------------------------------------------------------------ */
/*  Cover labels                                                       */
/* ------------------------------------------------------------------ */

const VERSION_META = {
  quick: { label: 'QUICK', questions: '15 questions', time: '~3 min' },
  deep: { label: 'DEEP', questions: '50 questions', time: '~12 min' },
} as const;

/* ------------------------------------------------------------------ */
/*  Cover animation variants                                           */
/* ------------------------------------------------------------------ */

const EASE = [0.22, 1, 0.36, 1] as const;

const coverContainerVariants = {
  visible: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.15,
    },
  },
  exit: {
    transition: {
      staggerChildren: 0.06,
      staggerDirection: -1,
    },
  },
};

const coverItemVariants = {
  hidden: { opacity: 0, y: 16, filter: 'blur(4px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.55, ease: EASE },
  },
  exit: {
    opacity: 0,
    y: -12,
    filter: 'blur(6px)',
    transition: { duration: 0.35, ease: EASE },
  },
};

const coverTitleVariants = {
  hidden: { opacity: 0, y: 24, filter: 'blur(6px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.7, ease: EASE },
  },
  exit: {
    opacity: 0,
    y: -20,
    filter: 'blur(8px)',
    transition: { duration: 0.4, ease: EASE },
  },
};

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export interface ResumeData {
  sessionId: string;
  token: string;
  questions: ClientQuestion[];
  currentChunk: number;
  totalChunks: number;
  draftAnswers?: Record<string, number | string>;
}

interface AssessmentFlowProps {
  version: AssessmentVersion;
  resumeData?: ResumeData;
  upgradeFromToken?: string;
}

export default function AssessmentFlow({ version, resumeData, upgradeFromToken }: AssessmentFlowProps) {
  const router = useRouter();
  const hasStarted = useRef(false);
  const [beginHovered, setBeginHovered] = useState(false);
  const submittingStartRef = useRef(0);
  const chunkGalaxyOffsetRef = useRef(0);

  // Build initial saved answers from resumeData drafts
  const initialSavedAnswers = useMemo(() => {
    if (!resumeData?.draftAnswers) return new Map<string, number | string>();
    return new Map(Object.entries(resumeData.draftAnswers));
  }, [resumeData]);

  // Resume: compute starting phase and question index (skip cover)
  const initialResumeState = useMemo(() => {
    if (!resumeData) return { phase: 'starting' as Phase, questionIndex: 0 };
    const drafts = resumeData.draftAnswers ?? {};
    const allAnswered = resumeData.questions.length > 0
      && resumeData.questions.every(q => q.id in drafts);
    if (allAnswered) {
      return { phase: 'chunk_review' as Phase, questionIndex: 0 };
    }
    // Find first unanswered question
    const idx = resumeData.questions.findIndex(q => !(q.id in drafts));
    return { phase: 'questioning' as Phase, questionIndex: idx >= 0 ? idx : 0 };
  }, [resumeData]);

  const [state, dispatch] = useReducer(reducer, {
    phase: initialResumeState.phase,
    version,
    sessionId: resumeData?.sessionId ?? null,
    token: resumeData?.token ?? null,
    currentChunk: resumeData?.currentChunk ?? 0,
    totalChunks: resumeData?.totalChunks ?? 0,
    questions: resumeData?.questions ?? [],
    questionIndex: initialResumeState.questionIndex,
    chunkResponses: [],
    questionStartTime: Date.now(),
    error: null,
    chunkApiDone: false,
    chunkAnimDone: false,
    nextQuestions: null,
    savedAnswers: initialSavedAnswers,
    transitionDirection: 'forward',
    isTransitioning: false,
    targetQuestionIndex: 0,
    isRevising: false,
  });

  /* ---- Start assessment ---- */
  useEffect(() => {
    if (state.phase !== 'starting' || hasStarted.current) return;
    hasStarted.current = true;

    (async () => {
      try {
        const result = upgradeFromToken
          ? await startUpgradeAssessment(upgradeFromToken)
          : await startAssessment(version);
        dispatch({
          type: 'START_SUCCESS',
          sessionId: result.sessionId,
          token: result.token,
          questions: result.questions,
          totalChunks: result.totalChunks,
        });
      } catch (err) {
        dispatch({ type: 'ERROR', message: err instanceof Error ? err.message : 'Failed to start assessment' });
        hasStarted.current = false;
      }
    })();
  }, [state.phase, version, upgradeFromToken]);

  /* ---- Cover exit: fade to black, then enter questioning ---- */
  useEffect(() => {
    if (state.phase !== 'cover_exit') return;
    // Wait for the cover exit animation to finish (~600ms), then advance
    const timer = setTimeout(() => {
      dispatch({ type: 'COVER_EXIT_DONE' });
    }, 700);
    return () => clearTimeout(timer);
  }, [state.phase]);

  /* ---- Submit chunk ---- */
  useEffect(() => {
    if (state.phase !== 'submitting_chunk' || !state.sessionId) return;

    (async () => {
      try {
        const result = await submitChunkAndGetNext(state.sessionId!, state.chunkResponses);

        if (result.complete) {
          dispatch({
            type: 'CHUNK_SUBMITTED',
            complete: true,
            currentChunk: result.currentChunk,
            totalChunks: result.totalChunks,
          });
        } else {
          dispatch({
            type: 'CHUNK_SUBMITTED',
            complete: false,
            questions: result.questions,
            currentChunk: result.currentChunk,
            totalChunks: result.totalChunks,
          });
        }
      } catch (err) {
        dispatch({ type: 'ERROR', message: err instanceof Error ? err.message : 'Failed to submit responses' });
      }
    })();
  }, [state.phase, state.sessionId, state.chunkResponses]);

  /* ---- Navigate on complete ---- */
  useEffect(() => {
    if (state.phase === 'complete' && state.token) {
      clearDraftAnswers();
      router.push(`/tools/leadership/results/${state.token}`);
    }
  }, [state.phase, state.token, router]);

  /* ---- Push token into URL whenever we have one (silent, no re-render) ---- */
  useEffect(() => {
    if (state.token) {
      const url = new URL(window.location.href);
      if (url.searchParams.get('token') !== state.token) {
        url.searchParams.set('token', state.token);
        window.history.replaceState(null, '', url.toString());
      }
    }
  }, [state.token]);

  /* ---- Persist draft answers on each selection ---- */
  useEffect(() => {
    if (state.savedAnswers.size > 0 && state.sessionId) {
      const obj: Record<string, number | string> = {};
      state.savedAnswers.forEach((v, k) => { obj[k] = v; });
      saveDraftAnswers(obj);
    }
  }, [state.savedAnswers, state.sessionId]);

  /* ---- Track galaxy elapsed time across submitting → chunk_transition ---- */
  useEffect(() => {
    if (state.phase === 'submitting_chunk') {
      submittingStartRef.current = Date.now();
    }
    if (state.phase === 'chunk_transition') {
      chunkGalaxyOffsetRef.current = (Date.now() - submittingStartRef.current) / 1000;
    }
  }, [state.phase]);

  /* ---- Clear draft answers when chunk is submitted to server ---- */
  useEffect(() => {
    if (state.phase === 'chunk_transition' || state.phase === 'email_capture') {
      clearDraftAnswers();
    }
  }, [state.phase]);

  /* ---- Handlers ---- */

  const handleDismissCover = useCallback(() => {
    dispatch({ type: 'DISMISS_COVER' });
  }, []);

  const handleConfirmAdvance = useCallback((value: number | string) => {
    const question = state.questions[state.questionIndex];
    dispatch({ type: 'SELECT_ANSWER', questionId: question.id, value });
    dispatch({
      type: 'CONFIRM_ADVANCE',
      responseTimeMs: Date.now() - state.questionStartTime,
    });
  }, [state.questions, state.questionIndex, state.questionStartTime]);

  const handleBack = useCallback(() => {
    dispatch({ type: 'GO_BACK' });
  }, []);

  const handleNavigateToStep = useCallback((index: number) => {
    dispatch({ type: 'NAVIGATE_TO_STEP', index });
  }, []);

  const handleQuestionTransitionComplete = useCallback(() => {
    dispatch({ type: 'QUESTION_TRANSITION_DONE' });
  }, []);

  const handleChunkTransitionComplete = useCallback(() => {
    dispatch({ type: 'CHUNK_ANIM_DONE' });
  }, []);

  const handleEmailSubmit = useCallback(async (firstName: string, email: string) => {
    if (!state.sessionId) return;
    dispatch({ type: 'EMAIL_SUBMITTED' });

    try {
      const result = await submitEmailAndGenerateResults(state.sessionId, firstName, email);
      dispatch({ type: 'GENERATION_COMPLETE', token: result.token });
    } catch (err) {
      dispatch({ type: 'ERROR', message: err instanceof Error ? err.message : 'Failed to generate results' });
    }
  }, [state.sessionId]);

  const handleSaveAnswer = useCallback((value: number | string) => {
    const question = state.questions[state.questionIndex];
    dispatch({ type: 'SELECT_ANSWER', questionId: question.id, value });
  }, [state.questions, state.questionIndex]);

  const handleCompleteSection = useCallback(() => {
    dispatch({ type: 'COMPLETE_SECTION' });
  }, []);

  const handleExit = useCallback(() => {
    router.push('/tools/leadership');
  }, [router]);

  /* ---- Progress calculation ---- */

  const questionsPerChunk = 5;
  const totalQuestions = state.totalChunks * questionsPerChunk;

  const answeredSoFar = state.phase === 'email_capture' || state.phase === 'generating' || state.phase === 'complete'
    ? totalQuestions
    : state.phase === 'chunk_transition'
      ? (state.currentChunk - 1) * questionsPerChunk
      : state.phase === 'cover' || state.phase === 'cover_exit' || state.phase === 'starting'
        ? 0
        : (state.currentChunk - 1) * questionsPerChunk + state.savedAnswers.size;

  const progress = totalQuestions > 0 ? answeredSoFar / totalQuestions : 0;

  // Locked progress: completed (submitted) sections shown in white
  const lockedProgress = totalQuestions > 0
    ? Math.max(0, (state.currentChunk - 1)) * questionsPerChunk / totalQuestions
    : 0;

  /* ---- Phase label for header ---- */
  let phaseLabel: PhaseLabel = 'ASSESSMENT';
  if (state.phase === 'chunk_review') phaseLabel = 'SECTION REVIEW';
  else if (state.phase === 'chunk_transition') phaseLabel = 'SECTION COMPLETE';
  else if (state.phase === 'email_capture') phaseLabel = 'ALMOST THERE';
  else if (state.phase === 'generating') phaseLabel = 'GENERATING';

  /* ---- Question counter ---- */
  const currentQuestionNumber =
    state.phase === 'questioning' || state.phase === 'submitting_chunk' || state.phase === 'question_transition'
      ? (state.currentChunk - 1) * questionsPerChunk + state.questionIndex + 1
      : undefined;

  /* ---- Completed steps set ---- */
  const completedSteps = useMemo(() => {
    const set = new Set<number>();
    for (let i = 0; i < state.questions.length; i++) {
      if (state.savedAnswers.has(state.questions[i].id)) {
        set.add(i);
      }
    }
    return set;
  }, [state.questions, state.savedAnswers]);

  const isFirstQuestion = state.questionIndex === 0 && !state.isRevising;
  const currentQuestion = state.questions[state.questionIndex];
  const savedAnswer = currentQuestion ? state.savedAnswers.get(currentQuestion.id) : undefined;
  const isUpgrade = !!upgradeFromToken;
  const meta = isUpgrade
    ? { label: 'DEEP — UPGRADE', questions: '35 questions', time: '~8 min' }
    : VERSION_META[version];

  // Revision mode navigation flags
  const allChunkQuestionsAnswered = state.questions.every(q => state.savedAnswers.has(q.id));
  const nextQuestionAnswered = state.questionIndex < state.questions.length - 1
    ? state.savedAnswers.has(state.questions[state.questionIndex + 1].id)
    : false;

  /* ---- Phase variants (simple) ---- */

  const phaseVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration: 0.5, ease: EASE } },
    exit: { opacity: 0, transition: { duration: 0.3, ease: EASE } },
  };

  /* ---- Directional question variants ---- */

  const questionVariants = {
    initial: (dir: 'forward' | 'back') => ({
      opacity: 0,
      x: dir === 'forward' ? 80 : -80,
      filter: 'blur(4px)',
    }),
    animate: {
      opacity: 1,
      x: 0,
      filter: 'blur(0px)',
      transition: { duration: 0.45, ease: EASE },
    },
    exit: {
      opacity: 0,
      transition: { duration: 0.2, ease: EASE },
    },
  };

  /* ---- Render ---- */

  return (
    <AssessmentOverlay
      progress={progress}
      lockedProgress={lockedProgress}
      onExit={handleExit}
      phaseLabel={phaseLabel}
      questionNumber={currentQuestionNumber}
      totalQuestions={totalQuestions > 0 ? totalQuestions : undefined}
      chunkNumber={state.currentChunk > 0 ? state.currentChunk : undefined}
      totalChunks={state.totalChunks > 0 ? state.totalChunks : undefined}
    >
      {/* Persistent background galaxy — dims during questions, brightens between */}
      {(state.phase === 'questioning' || state.phase === 'question_transition') && (
        <QuestionTransition
          dimmed={state.phase !== 'question_transition'}
          dimLevel={currentQuestion?.type === 'forced_choice' ? 0.1 : undefined}
          onBrightComplete={handleQuestionTransitionComplete}
        />
      )}

      {/* Persistent StepDots — rendered outside AnimatePresence so they don't disappear during question transitions */}
      {(state.phase === 'questioning' || state.phase === 'question_transition') && state.questions.length > 0 && (
        <div className="absolute top-0 left-0 right-0 z-[15]">
          <div className="h-[6vh] md:h-[8vh]" />
          <div className="px-6 md:px-10 lg:px-16 pb-5">
            <StepDots
              totalSteps={state.questions.length}
              currentStep={state.phase === 'question_transition' ? state.targetQuestionIndex : state.questionIndex}
              completedSteps={completedSteps}
              onNavigate={handleNavigateToStep}
            />
          </div>
        </div>
      )}

      <AnimatePresence mode="wait" custom={state.transitionDirection}>
        {/* Starting / Loading */}
        {state.phase === 'starting' && (
          <motion.div
            key="starting"
            {...phaseVariants}
            className="flex-1 flex items-center justify-center h-full"
          >
            <div className="text-center">
              <motion.div
                className="w-8 h-8 border border-ops-border rounded-full mx-auto mb-4"
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                style={{ borderTopColor: '#597794' }}
              />
              <p className="font-caption text-xs uppercase tracking-[0.2em] text-ops-text-secondary">
                Preparing assessment...
              </p>
            </div>
          </motion.div>
        )}

        {/* Cover page */}
        {state.phase === 'cover' && (
          <motion.div
            key="cover"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={coverContainerVariants}
            className="flex-1 flex items-center h-full"
          >
            <div className="w-full pl-[8%] md:pl-[12%] lg:pl-[14%] pr-6 md:pr-10">
              {/* Version badge */}
              <motion.span
                variants={coverItemVariants}
                className="block font-caption text-[10px] uppercase tracking-[0.25em] text-ops-accent mb-8"
              >
                [ {meta.label} ]
              </motion.span>

              {/* Title */}
              <motion.h1
                variants={coverTitleVariants}
                className="font-heading font-bold uppercase text-ops-text-primary text-5xl md:text-6xl lg:text-7xl leading-[0.92] tracking-tight mb-8"
              >
                Leadership
                <br />
                Assessment
              </motion.h1>

              {/* Accent divider */}
              <motion.div
                variants={coverItemVariants}
                className="w-16 h-px mb-8"
                style={{ backgroundColor: 'rgba(89, 119, 148, 0.2)' }}
              />

              {/* Meta stats — inline */}
              <motion.div
                variants={coverItemVariants}
                className="flex items-center gap-6 mb-4"
              >
                <span className="font-caption text-[10px] uppercase tracking-[0.2em] text-ops-text-secondary">
                  {meta.questions}
                </span>
                <span className="w-px h-3 bg-white/[0.1]" />
                <span className="font-caption text-[10px] uppercase tracking-[0.2em] text-ops-text-secondary">
                  {meta.time}
                </span>
              </motion.div>

              {/* Description */}
              <motion.p
                variants={coverItemVariants}
                className="font-heading font-light text-ops-text-secondary/50 text-sm leading-relaxed max-w-md mb-14"
              >
                {isUpgrade
                  ? 'Building on your quick assessment results. Answer honestly — your prior responses are already factored in.'
                  : 'Answer honestly — there are no right or wrong responses. A dedicated AI analyst will interpret your unique patterns and deliver a nuanced portrait of your leadership.'}
              </motion.p>

              {/* Begin button */}
              <motion.button
                variants={coverItemVariants}
                onClick={handleDismissCover}
                onMouseEnter={() => setBeginHovered(true)}
                onMouseLeave={() => setBeginHovered(false)}
                className="group relative font-caption uppercase tracking-[0.2em] text-[11px] text-ops-background rounded-[3px] px-10 py-3.5 cursor-pointer transition-all duration-300 overflow-hidden"
                style={{
                  background: beginHovered
                    ? 'rgba(255, 255, 255, 0.92)'
                    : 'rgba(255, 255, 255, 1)',
                }}
              >
                {/* Subtle accent underline that expands on hover */}
                <span
                  className="absolute bottom-0 left-0 h-[2px] transition-all duration-500 ease-out"
                  style={{
                    width: beginHovered ? '100%' : '0%',
                    backgroundColor: 'rgba(89, 119, 148, 0.5)',
                  }}
                />
                {isUpgrade ? 'Continue Assessment' : 'Begin Assessment'}
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* Questioning */}
        {state.phase === 'questioning' && currentQuestion && (
          <motion.div
            key={`q-${currentQuestion.id}`}
            custom={state.transitionDirection}
            variants={questionVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="flex-1 flex h-full"
          >
            <QuestionFrame
              question={currentQuestion}
              questionIndex={state.questionIndex}
              totalQuestionsInChunk={state.questions.length}
              isFirstQuestion={isFirstQuestion}
              savedAnswer={savedAnswer}
              completedSteps={completedSteps}
              onAnswer={handleConfirmAdvance}
              onBack={handleBack}
              onNavigateToStep={handleNavigateToStep}
              isRevising={state.isRevising}
              allChunkQuestionsAnswered={allChunkQuestionsAnswered}
              nextQuestionAnswered={nextQuestionAnswered}
              onSaveAnswer={handleSaveAnswer}
              onCompleteSection={handleCompleteSection}
              hideStepDots
            />
          </motion.div>
        )}

        {/* Chunk review — summary before submission */}
        {state.phase === 'chunk_review' && (
          <motion.div key="chunk-review" {...phaseVariants} className="flex-1 h-full">
            <ChunkReview
              questions={state.questions}
              savedAnswers={state.savedAnswers}
              chunkNumber={state.currentChunk}
              totalChunks={state.totalChunks}
              onRevise={(index) => dispatch({ type: 'REVISE_QUESTION', index })}
              onConfirm={() => dispatch({ type: 'CONFIRM_CHUNK' })}
            />
          </motion.div>
        )}

        {/* Submitting chunk — galaxy starts building immediately */}
        {state.phase === 'submitting_chunk' && (
          <motion.div
            key="submitting"
            {...phaseVariants}
            className="flex-1 h-full"
          >
            <ChunkTransition
              chunkNumber={state.currentChunk}
              totalChunks={state.totalChunks}
              onComplete={() => {}}
              galaxyOnly
            />
          </motion.div>
        )}

        {/* Chunk transition — continues galaxy from submitting phase */}
        {state.phase === 'chunk_transition' && (
          <motion.div key="chunk-transition" {...phaseVariants} className="flex-1 h-full">
            <ChunkTransition
              chunkNumber={state.currentChunk}
              totalChunks={state.totalChunks}
              onComplete={handleChunkTransitionComplete}
              elapsedOffset={chunkGalaxyOffsetRef.current}
            />
          </motion.div>
        )}

        {/* Email capture */}
        {state.phase === 'email_capture' && (
          <motion.div key="email" {...phaseVariants} className="flex-1 h-full">
            <EmailCapture
              isSubmitting={false}
              onSubmit={handleEmailSubmit}
              totalQuestions={totalQuestions > 0 ? totalQuestions : undefined}
            />
          </motion.div>
        )}

        {/* Generating */}
        {state.phase === 'generating' && (
          <motion.div key="generating" {...phaseVariants} className="flex-1 h-full">
            <GeneratingState />
          </motion.div>
        )}

        {/* Error */}
        {state.phase === 'error' && (
          <motion.div
            key="error"
            {...phaseVariants}
            className="flex-1 flex items-center justify-center h-full"
          >
            <div className="max-w-md px-6">
              <p className="font-caption text-xs uppercase tracking-[0.2em] text-red-400/80 mb-4">
                [ Something went wrong ]
              </p>
              <p className="font-heading text-ops-text-secondary text-sm mb-8">
                {state.error || 'An unexpected error occurred.'}
              </p>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => dispatch({ type: 'RETRY' })}
                  className="inline-flex items-center justify-center font-caption uppercase tracking-[0.15em] text-xs px-6 py-3 rounded-[3px] transition-all duration-200 cursor-pointer bg-ops-text-primary text-ops-background hover:bg-white/90"
                >
                  Try again
                </button>
                <button
                  onClick={handleExit}
                  className="inline-flex items-center justify-center font-caption uppercase tracking-[0.15em] text-xs px-6 py-3 rounded-[3px] transition-all duration-200 cursor-pointer bg-transparent text-ops-text-primary border border-ops-border hover:border-ops-border-hover"
                >
                  Exit
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </AssessmentOverlay>
  );
}
