/**
 * AssessmentFlow — Core state machine orchestrator
 *
 * Manages the full assessment lifecycle:
 *   starting → questioning → submitting_chunk → chunk_transition →
 *   questioning (loop) → email_capture → generating → complete
 *
 * Calls server actions for data persistence and AI generation.
 * Renders the appropriate UI for each phase.
 */

'use client';

import { useReducer, useEffect, useCallback, useRef } from 'react';
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
import QuestionFrame from './QuestionFrame';
import ChunkTransition from './ChunkTransition';
import EmailCapture from './EmailCapture';
import GeneratingState from './GeneratingState';

/* ------------------------------------------------------------------ */
/*  State Types                                                        */
/* ------------------------------------------------------------------ */

type Phase =
  | 'starting'
  | 'questioning'
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
  // Track whether API + animation are both done for chunk transition
  chunkApiDone: boolean;
  chunkAnimDone: boolean;
  nextQuestions: ClientQuestion[] | null;
}

/* ------------------------------------------------------------------ */
/*  Actions                                                            */
/* ------------------------------------------------------------------ */

type FlowAction =
  | { type: 'START_SUCCESS'; sessionId: string; token: string; questions: ClientQuestion[]; totalChunks: number }
  | { type: 'ANSWER'; value: number | string; responseTimeMs: number }
  | { type: 'CHUNK_SUBMITTED'; complete: boolean; questions?: ClientQuestion[]; currentChunk: number; totalChunks: number }
  | { type: 'CHUNK_ANIM_DONE' }
  | { type: 'CHUNK_API_DONE'; complete: boolean; questions?: ClientQuestion[]; currentChunk: number; totalChunks: number }
  | { type: 'EMAIL_SUBMITTED' }
  | { type: 'GENERATION_COMPLETE'; token: string }
  | { type: 'ERROR'; message: string }
  | { type: 'RETRY' }
  | { type: 'BEGIN_QUESTION' };

function reducer(state: FlowState, action: FlowAction): FlowState {
  switch (action.type) {
    case 'START_SUCCESS':
      return {
        ...state,
        phase: 'questioning',
        sessionId: action.sessionId,
        token: action.token,
        questions: action.questions,
        totalChunks: action.totalChunks,
        currentChunk: 1,
        questionIndex: 0,
        questionStartTime: Date.now(),
        error: null,
      };

    case 'ANSWER': {
      const question = state.questions[state.questionIndex];
      const response: ChunkSubmission = {
        question_id: question.id,
        answer_value: action.value,
        response_time_ms: action.responseTimeMs,
      };
      const newResponses = [...state.chunkResponses, response];
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
        questionIndex: state.questionIndex + 1,
        questionStartTime: Date.now(),
      };
    }

    case 'CHUNK_SUBMITTED': {
      if (action.complete) {
        // Last chunk — go to email capture
        return {
          ...state,
          phase: 'email_capture',
          chunkResponses: [],
          currentChunk: action.currentChunk,
          totalChunks: action.totalChunks,
        };
      }
      // Transition to chunk_transition phase (animation + API concurrent)
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
        // Both done — proceed to questioning
        return {
          ...state,
          phase: 'questioning',
          questions: state.nextQuestions,
          nextQuestions: null,
          questionIndex: 0,
          questionStartTime: Date.now(),
          chunkAnimDone: false,
          chunkApiDone: false,
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
      // Return to previous actionable phase
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
/*  Component                                                          */
/* ------------------------------------------------------------------ */

interface AssessmentFlowProps {
  version: AssessmentVersion;
}

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
          // Start chunk transition animation, API result comes later or already done
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

  const handleAnswer = useCallback((value: number | string) => {
    dispatch({
      type: 'ANSWER',
      value,
      responseTimeMs: Date.now() - state.questionStartTime,
    });
  }, [state.questionStartTime]);

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
  let answeredSoFar = 0;

  if (state.phase === 'questioning' || state.phase === 'submitting_chunk') {
    answeredSoFar = (state.currentChunk - 1) * questionsPerChunk + state.questionIndex;
  } else if (state.phase === 'chunk_transition') {
    answeredSoFar = state.currentChunk * questionsPerChunk;
  } else if (state.phase === 'email_capture' || state.phase === 'generating' || state.phase === 'complete') {
    answeredSoFar = totalQuestions;
  }

  const progress = totalQuestions > 0 ? answeredSoFar / totalQuestions : 0;

  /* ---- Phase variants for AnimatePresence ---- */

  const phaseVariants = {
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as const } },
    exit: { opacity: 0, y: -12, transition: { duration: 0.25 } },
  };

  /* ---- Render ---- */

  return (
    <AssessmentOverlay progress={progress} onExit={handleExit}>
      <AnimatePresence mode="wait">
        {/* Starting / Loading */}
        {state.phase === 'starting' && (
          <motion.div
            key="starting"
            {...phaseVariants}
            className="flex-1 flex items-center justify-center min-h-full"
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

        {/* Questioning */}
        {state.phase === 'questioning' && state.questions[state.questionIndex] && (
          <motion.div key={`q-${state.questions[state.questionIndex].id}`} {...phaseVariants} className="flex-1 flex min-h-full">
            <QuestionFrame
              question={state.questions[state.questionIndex]}
              onAnswer={handleAnswer}
            />
          </motion.div>
        )}

        {/* Submitting chunk (brief, transitions quickly) */}
        {state.phase === 'submitting_chunk' && (
          <motion.div
            key="submitting"
            {...phaseVariants}
            className="flex-1 flex items-center justify-center min-h-full"
          >
            <p className="font-caption text-xs uppercase tracking-[0.2em] text-ops-text-secondary">
              Processing...
            </p>
          </motion.div>
        )}

        {/* Chunk transition */}
        {state.phase === 'chunk_transition' && (
          <motion.div key="chunk-transition" {...phaseVariants} className="flex-1 min-h-full">
            <ChunkTransition
              chunkNumber={state.currentChunk}
              totalChunks={state.totalChunks}
              onComplete={handleChunkTransitionComplete}
            />
          </motion.div>
        )}

        {/* Email capture */}
        {state.phase === 'email_capture' && (
          <motion.div key="email" {...phaseVariants} className="flex-1 min-h-full">
            <EmailCapture
              isSubmitting={false}
              onSubmit={handleEmailSubmit}
            />
          </motion.div>
        )}

        {/* Generating */}
        {state.phase === 'generating' && (
          <motion.div key="generating" {...phaseVariants} className="flex-1 min-h-full">
            <GeneratingState />
          </motion.div>
        )}

        {/* Error */}
        {state.phase === 'error' && (
          <motion.div
            key="error"
            {...phaseVariants}
            className="flex-1 flex items-center justify-center min-h-full"
          >
            <div className="text-center max-w-md px-6">
              <p className="font-caption text-xs uppercase tracking-[0.2em] text-red-400/80 mb-4">
                [ Something went wrong ]
              </p>
              <p className="font-body text-ops-text-secondary text-sm mb-8">
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
