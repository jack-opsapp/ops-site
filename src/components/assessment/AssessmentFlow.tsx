/**
 * AssessmentFlow — Core state machine orchestrator
 *
 * Manages the full assessment lifecycle:
 *   starting → cover → questioning → submitting_chunk → chunk_transition →
 *   questioning (loop) → email_capture → generating → complete
 *
 * Supports back navigation and step dot navigation within chunks.
 * Uses QuestionTransition star galaxy between questions.
 */

'use client';

import { useReducer, useEffect, useCallback, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import type {
  AssessmentVersion,
  ClientQuestion,
  ChunkSubmission,
} from '@/lib/assessment/types';
import {
  startAssessment,
  submitChunkAndGetNext,
  submitEmailAndGenerateResults,
} from '@/lib/assessment/actions';
import AssessmentOverlay from './AssessmentOverlay';
import type { PhaseLabel } from './AssessmentOverlay';
import QuestionFrame from './QuestionFrame';
import QuestionTransition from './QuestionTransition';
import ChunkTransition from './ChunkTransition';
import EmailCapture from './EmailCapture';
import GeneratingState from './GeneratingState';

/* ------------------------------------------------------------------ */
/*  State Types                                                        */
/* ------------------------------------------------------------------ */

type Phase =
  | 'starting'
  | 'cover'
  | 'questioning'
  | 'question_transition'
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
  // Chunk transition coordination
  chunkApiDone: boolean;
  chunkAnimDone: boolean;
  nextQuestions: ClientQuestion[] | null;
  // Navigation & confirm mode
  savedAnswers: Map<string, number | string>;
  transitionDirection: 'forward' | 'back';
  isTransitioning: boolean;
  targetQuestionIndex: number;
}

/* ------------------------------------------------------------------ */
/*  Actions                                                            */
/* ------------------------------------------------------------------ */

type FlowAction =
  | { type: 'START_SUCCESS'; sessionId: string; token: string; questions: ClientQuestion[]; totalChunks: number }
  | { type: 'DISMISS_COVER' }
  | { type: 'SELECT_ANSWER'; questionId: string; value: number | string }
  | { type: 'CONFIRM_ADVANCE'; responseTimeMs: number }
  | { type: 'GO_BACK' }
  | { type: 'NAVIGATE_TO_STEP'; index: number }
  | { type: 'QUESTION_TRANSITION_DONE' }
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

      const isLastInChunk = state.questionIndex >= state.questions.length - 1;

      if (isLastInChunk) {
        return {
          ...state,
          chunkResponses: newResponses,
          phase: 'submitting_chunk',
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
  quick: { title: 'Quick Assessment', questions: '15 questions', time: '~3 minutes' },
  deep: { title: 'Deep Assessment', questions: '50 questions', time: '~12 minutes' },
} as const;

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

interface AssessmentFlowProps {
  version: AssessmentVersion;
}

const EASE = [0.22, 1, 0.36, 1] as const;

export default function AssessmentFlow({ version }: AssessmentFlowProps) {
  const router = useRouter();
  const hasStarted = useRef(false);

  const [state, dispatch] = useReducer(reducer, {
    phase: 'starting',
    version,
    sessionId: null,
    token: null,
    currentChunk: 0,
    totalChunks: 0,
    questions: [],
    questionIndex: 0,
    chunkResponses: [],
    questionStartTime: Date.now(),
    error: null,
    chunkApiDone: false,
    chunkAnimDone: false,
    nextQuestions: null,
    savedAnswers: new Map(),
    transitionDirection: 'forward',
    isTransitioning: false,
    targetQuestionIndex: 0,
  });

  /* ---- Start assessment ---- */
  useEffect(() => {
    if (state.phase !== 'starting' || hasStarted.current) return;
    hasStarted.current = true;

    (async () => {
      try {
        const result = await startAssessment(version);
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
  }, [state.phase, version]);

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
      router.push(`/tools/leadership/results/${state.token}`);
    }
  }, [state.phase, state.token, router]);

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

  const handleExit = useCallback(() => {
    router.push('/tools/leadership');
  }, [router]);

  /* ---- Progress calculation ---- */

  const questionsPerChunk = 5;
  const totalQuestions = state.totalChunks * questionsPerChunk;

  const answeredSoFar = state.phase === 'email_capture' || state.phase === 'generating' || state.phase === 'complete'
    ? totalQuestions
    : state.phase === 'chunk_transition'
      ? state.currentChunk * questionsPerChunk
      : state.phase === 'cover' || state.phase === 'starting'
        ? 0
        : (state.currentChunk - 1) * questionsPerChunk + state.savedAnswers.size;

  const progress = totalQuestions > 0 ? answeredSoFar / totalQuestions : 0;

  /* ---- Phase label for header ---- */
  let phaseLabel: PhaseLabel = 'ASSESSMENT';
  if (state.phase === 'chunk_transition') phaseLabel = 'SECTION COMPLETE';
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

  const isFirstQuestion = state.currentChunk === 1 && state.questionIndex === 0;
  const currentQuestion = state.questions[state.questionIndex];
  const savedAnswer = currentQuestion ? state.savedAnswers.get(currentQuestion.id) : undefined;
  const meta = VERSION_META[version];

  /* ---- Phase variants ---- */

  const phaseVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration: 0.5, ease: EASE } },
    exit: { opacity: 0, transition: { duration: 0.3, ease: EASE } },
  };

  /* ---- Render ---- */

  return (
    <AssessmentOverlay
      progress={progress}
      onExit={handleExit}
      phaseLabel={phaseLabel}
      questionNumber={currentQuestionNumber}
      totalQuestions={totalQuestions > 0 ? totalQuestions : undefined}
      chunkNumber={state.currentChunk > 0 ? state.currentChunk : undefined}
      totalChunks={state.totalChunks > 0 ? state.totalChunks : undefined}
    >
      {/* Question transition overlay */}
      {state.phase === 'question_transition' && (
        <QuestionTransition
          direction={state.transitionDirection}
          onComplete={handleQuestionTransitionComplete}
        />
      )}

      <AnimatePresence mode="wait">
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
            {...phaseVariants}
            className="flex-1 flex items-center justify-center h-full"
          >
            <div className="flex flex-col items-center text-center px-6 max-w-lg">
              {/* Version badge */}
              <motion.span
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1, ease: EASE }}
                className="font-caption text-[10px] uppercase tracking-[0.25em] text-ops-accent mb-6"
              >
                [ {version === 'quick' ? 'Quick' : 'Deep'} ]
              </motion.span>

              {/* Title */}
              <motion.h1
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2, ease: EASE }}
                className="font-heading font-bold uppercase text-ops-text-primary text-4xl md:text-5xl lg:text-6xl leading-[0.95] tracking-tight mb-6"
              >
                Leadership
                <br />
                Assessment
              </motion.h1>

              {/* Meta line */}
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.35, ease: EASE }}
                className="font-heading font-light text-ops-text-secondary text-base mb-3"
              >
                {meta.questions} &middot; {meta.time}
              </motion.p>

              {/* Description */}
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.45, ease: EASE }}
                className="font-heading font-light text-ops-text-secondary/60 text-sm mb-12 max-w-sm"
              >
                Answer honestly — there are no right or wrong responses. Your results are generated instantly.
              </motion.p>

              {/* Begin button */}
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6, ease: EASE }}
                onClick={handleDismissCover}
                className="font-caption uppercase tracking-[0.15em] text-[11px] bg-white text-ops-background rounded-[3px] px-8 py-3 cursor-pointer hover:bg-white/90 transition-colors duration-200"
              >
                Begin
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* Questioning */}
        {(state.phase === 'questioning' || state.phase === 'question_transition') && currentQuestion && (
          <motion.div key={`q-${currentQuestion.id}`} {...phaseVariants} className="flex-1 flex h-full">
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
            />
          </motion.div>
        )}

        {/* Submitting chunk */}
        {state.phase === 'submitting_chunk' && (
          <motion.div
            key="submitting"
            {...phaseVariants}
            className="flex-1 flex items-center justify-center h-full"
          >
            <p className="font-caption text-xs uppercase tracking-[0.2em] text-ops-text-secondary">
              Processing...
            </p>
          </motion.div>
        )}

        {/* Chunk transition */}
        {state.phase === 'chunk_transition' && (
          <motion.div key="chunk-transition" {...phaseVariants} className="flex-1 h-full">
            <ChunkTransition
              chunkNumber={state.currentChunk}
              totalChunks={state.totalChunks}
              onComplete={handleChunkTransitionComplete}
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
            <div className="text-center max-w-md px-6">
              <p className="font-caption text-xs uppercase tracking-[0.2em] text-red-400/80 mb-4">
                [ Something went wrong ]
              </p>
              <p className="font-heading text-ops-text-secondary text-sm mb-8">
                {state.error || 'An unexpected error occurred.'}
              </p>
              <div className="flex items-center justify-center gap-4">
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
