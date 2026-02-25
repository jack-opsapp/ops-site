/**
 * QuestionFrame — Full-viewport question layout
 *
 * Layout (top to bottom):
 *  - Toolbar row: step dots left, Back/Continue right
 *  - Question badge + text: compact prompt, left-aligned
 *  - Input component: fills all remaining vertical space, full width
 *
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
    filter: 'blur(4px)',
  },
  animate: {
    opacity: 1,
    filter: 'blur(0px)',
    transition: {
      duration: 0.45,
      ease: EASE,
      staggerChildren: 0.08,
    },
  },
  exit: {
    opacity: 0,
    filter: 'blur(4px)',
    transition: {
      duration: 0.25,
      ease: EASE,
    },
  },
};

const childVariants = {
  initial: { opacity: 0, y: 10 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: EASE },
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
        className="flex flex-col h-full w-full"
      >
        {/* Toolbar: dots left, nav buttons right */}
        <motion.div
          variants={childVariants}
          className="flex items-center justify-between px-6 md:px-10 lg:px-16 pt-4 pb-2"
        >
          <StepDots
            totalSteps={totalQuestionsInChunk}
            currentStep={questionIndex}
            completedSteps={completedSteps}
            onNavigate={onNavigateToStep}
          />

          <div className="flex items-center gap-3">
            {!isFirstQuestion && (
              <button
                type="button"
                onClick={onBack}
                className="font-caption uppercase tracking-[0.15em] text-[11px] text-ops-text-secondary hover:text-ops-text-primary border border-ops-border hover:border-ops-border-hover rounded-[3px] px-4 py-2 transition-all duration-200 cursor-pointer"
              >
                Back
              </button>
            )}

            <AnimatePresence>
              {animationDone && selectionValue !== null && (
                <motion.button
                  type="button"
                  onClick={handleContinue}
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 8 }}
                  transition={{ duration: 0.25, ease: EASE }}
                  className="font-caption uppercase tracking-[0.15em] text-[11px] bg-white text-ops-background rounded-[3px] px-5 py-2 cursor-pointer hover:bg-white/90 transition-colors duration-200"
                >
                  Continue
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Question prompt — compact, left-aligned */}
        <motion.div
          variants={childVariants}
          className="px-6 md:px-10 lg:px-16 pb-4"
        >
          <span className="font-caption text-[10px] uppercase tracking-[0.25em] text-ops-accent">
            {getTypeBadge(question.type)}
          </span>
          <h2 className="font-heading text-lg md:text-xl font-light text-ops-text-primary max-w-2xl mt-2 leading-[1.4]">
            {question.text}
          </h2>
        </motion.div>

        {/* Divider */}
        <div className="mx-6 md:mx-10 lg:mx-16 border-b border-white/[0.06]" />

        {/* Input component — fills remaining space, full width */}
        <motion.div
          variants={childVariants}
          className="flex-1 min-h-0 w-full px-2 md:px-6 py-4"
        >
          {question.type === 'likert' && (
            <LikertRadialGauge
              key={question.id}
              onSelect={() => {}}
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
              onSelect={() => {}}
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
              onSelect={() => {}}
              autoAdvance={false}
              onSelectionChange={handleSelectionChange}
              onAnimationComplete={handleAnimationComplete}
              savedAnswer={typeof savedAnswer === 'string' ? savedAnswer : undefined}
            />
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
