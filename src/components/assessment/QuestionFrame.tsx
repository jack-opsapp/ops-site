/**
 * QuestionFrame — Question text + routed input component + navigation
 *
 * Routes by question type:
 *  - 'likert'        -> LikertRadialGauge
 *  - 'situational'   -> SituationalGrid
 *  - 'forced_choice' -> ForcedChoiceFork
 *
 * Includes Back/Continue navigation buttons and StepDots.
 * Input components run in manual confirm mode (autoAdvance=false).
 */

'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ClientQuestion } from '@/lib/assessment/types';
import LikertRadialGauge from './LikertRadialGauge';
import SituationalGrid from './SituationalGrid';
import ForcedChoiceFork from './ForcedChoiceFork';
import StepDots from './StepDots';

interface QuestionFrameProps {
  question: ClientQuestion;
  questionIndex: number;
  totalQuestionsInChunk: number;
  isFirstQuestion: boolean;
  savedAnswer?: number | string;
  completedSteps: Set<number>;
  onAnswer: (value: number | string) => void;
  onBack: () => void;
  onNavigateToStep: (index: number) => void;
}

const EASE = [0.22, 1, 0.36, 1] as const;

/** Map question type to display badge label */
function getTypeBadge(type: string): string {
  switch (type) {
    case 'situational': return 'SCENARIO';
    case 'likert': return 'SCALE';
    case 'forced_choice': return 'CHOICE';
    default: return 'QUESTION';
  }
}

const questionVariants = {
  initial: {
    opacity: 0,
    y: 30,
    filter: 'blur(6px)',
  },
  animate: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: {
      duration: 0.5,
      ease: EASE,
      staggerChildren: 0.12,
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    filter: 'blur(4px)',
    transition: {
      duration: 0.3,
      ease: EASE,
    },
  },
};

const textVariants = {
  initial: { opacity: 0, y: 16 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: EASE },
  },
  exit: { opacity: 0 },
};

const componentVariants = {
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: EASE, delay: 0.15 },
  },
  exit: { opacity: 0 },
};

export default function QuestionFrame({
  question,
  questionIndex,
  totalQuestionsInChunk,
  isFirstQuestion,
  savedAnswer,
  completedSteps,
  onAnswer,
  onBack,
  onNavigateToStep,
}: QuestionFrameProps) {
  // Track selection + animation state for confirm mode
  const [selectionValue, setSelectionValue] = useState<number | string | null>(
    savedAnswer ?? null
  );
  const [animationDone, setAnimationDone] = useState(
    savedAnswer !== undefined
  );

  const handleSelectionChange = useCallback((value: number | string) => {
    setSelectionValue(value);
    setAnimationDone(false);
  }, []);

  const handleAnimationComplete = useCallback(() => {
    setAnimationDone(true);
  }, []);

  const handleContinue = useCallback(() => {
    if (selectionValue !== null) {
      onAnswer(selectionValue);
    }
  }, [selectionValue, onAnswer]);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={question.id}
        variants={questionVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        className="flex flex-col items-center justify-center h-full px-6 md:px-10 py-8"
      >
        {/* Step dots */}
        <StepDots
          totalSteps={totalQuestionsInChunk}
          currentStep={questionIndex}
          completedSteps={completedSteps}
          onNavigate={onNavigateToStep}
        />

        {/* Question type badge */}
        <motion.span
          variants={textVariants}
          className="font-caption text-[10px] uppercase tracking-[0.25em] text-ops-accent mb-4"
        >
          {getTypeBadge(question.type)}
        </motion.span>

        {/* Question text */}
        <motion.h2
          variants={textVariants}
          className="font-heading text-2xl md:text-3xl lg:text-4xl font-light text-ops-text-primary text-center max-w-3xl mb-6 md:mb-8 leading-[1.3] tracking-tight"
        >
          {question.text}
        </motion.h2>

        {/* Divider */}
        <motion.div
          variants={textVariants}
          className="w-12 h-px mb-8 md:mb-12"
          style={{ backgroundColor: 'rgba(89, 119, 148, 0.15)' }}
        />

        {/* Input component — manual confirm mode */}
        <motion.div variants={componentVariants} className="w-full max-w-5xl">
          {question.type === 'likert' && (
            <LikertRadialGauge
              key={question.id}
              onSelect={() => {}} // no-op in manual mode
              autoAdvance={false}
              onSelectionChange={handleSelectionChange}
              onAnimationComplete={handleAnimationComplete}
              savedAnswer={typeof savedAnswer === 'number' ? savedAnswer : undefined}
            />
          )}

          {question.type === 'situational' && question.options && (
            <SituationalGrid
              key={question.id}
              options={question.options}
              onSelect={() => {}} // no-op in manual mode
              autoAdvance={false}
              onSelectionChange={handleSelectionChange}
              onAnimationComplete={handleAnimationComplete}
              savedAnswer={typeof savedAnswer === 'string' ? savedAnswer : undefined}
            />
          )}

          {question.type === 'forced_choice' && question.options && (
            <ForcedChoiceFork
              key={question.id}
              options={question.options}
              onSelect={() => {}} // no-op in manual mode
              autoAdvance={false}
              onSelectionChange={handleSelectionChange}
              onAnimationComplete={handleAnimationComplete}
              savedAnswer={typeof savedAnswer === 'string' ? savedAnswer : undefined}
            />
          )}
        </motion.div>

        {/* Navigation buttons */}
        <div className="flex items-center justify-between w-full max-w-4xl mt-8">
          {/* Back button */}
          {!isFirstQuestion ? (
            <button
              type="button"
              onClick={onBack}
              className="font-caption uppercase tracking-[0.15em] text-[11px] text-ops-text-secondary hover:text-ops-text-primary border border-ops-border hover:border-ops-border-hover rounded-[3px] px-5 py-2.5 transition-all duration-200 cursor-pointer"
            >
              Back
            </button>
          ) : (
            <div />
          )}

          {/* Continue button — fades in after animation completes */}
          <AnimatePresence>
            {animationDone && selectionValue !== null && (
              <motion.button
                type="button"
                onClick={handleContinue}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={{ duration: 0.3, ease: EASE }}
                className="font-caption uppercase tracking-[0.15em] text-[11px] bg-white text-ops-background rounded-[3px] px-6 py-2.5 cursor-pointer hover:bg-white/90 transition-colors duration-200 ml-auto"
              >
                Continue
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
