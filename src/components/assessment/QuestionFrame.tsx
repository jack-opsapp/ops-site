/**
 * QuestionFrame — Full-viewport question layout
 *
 * Layout:
 *  - Spacer pushes content down from top
 *  - Step dots just above section title
 *  - Question badge + text
 *  - Divider + usage instruction
 *  - Back button below instruction (same spacing as dots→title)
 *  - Input component fills remaining space
 *
 * Auto-advances after selection animation completes.
 */

'use client';

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

function getTypeBadge(type: string): string {
  switch (type) {
    case 'situational': return 'SCENARIO';
    case 'likert': return 'SCALE';
    case 'forced_choice': return 'CHOICE';
    default: return 'QUESTION';
  }
}

function getInstruction(type: string): string {
  switch (type) {
    case 'likert': return 'Select a point on the scale below';
    case 'situational': return 'Choose the response that best describes you';
    case 'forced_choice': return 'Select the option that resonates most';
    default: return 'Select your response below';
  }
}

const questionVariants = {
  initial: { opacity: 0, filter: 'blur(4px)' },
  animate: {
    opacity: 1,
    filter: 'blur(0px)',
    transition: { duration: 0.45, ease: EASE, staggerChildren: 0.08 },
  },
  exit: {
    opacity: 0,
    filter: 'blur(4px)',
    transition: { duration: 0.25, ease: EASE },
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
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={question.id}
        variants={questionVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        className="relative flex flex-col h-full w-full"
      >
        {/* Spacer — pushes content down from the top */}
        <div className="h-[6vh] md:h-[8vh]" />

        {/* Step dots — just above section title */}
        <motion.div
          variants={childVariants}
          className="px-6 md:px-10 lg:px-16 pb-5"
        >
          <StepDots
            totalSteps={totalQuestionsInChunk}
            currentStep={questionIndex}
            completedSteps={completedSteps}
            onNavigate={onNavigateToStep}
          />
        </motion.div>

        {/* Question prompt */}
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

        {/* Usage instruction */}
        <motion.p
          variants={childVariants}
          className="px-6 md:px-10 lg:px-16 pt-3 font-caption text-[10px] uppercase tracking-[0.2em] text-ops-text-secondary/40"
        >
          {getInstruction(question.type)}
        </motion.p>

        {/* Back button — below instruction, matching dots→title spacing */}
        {!isFirstQuestion && (
          <motion.div
            variants={childVariants}
            className="px-6 md:px-10 lg:px-16 pt-5"
          >
            <button
              type="button"
              onClick={onBack}
              className="font-caption uppercase tracking-[0.15em] text-[11px] text-ops-text-secondary/50 hover:text-ops-text-primary border border-ops-border/50 hover:border-ops-border-hover rounded-[3px] px-4 py-2 transition-all duration-200 cursor-pointer"
            >
              Back
            </button>
          </motion.div>
        )}

        {/* Input component — fills remaining space, auto-advances */}
        <motion.div
          variants={childVariants}
          className="flex-1 min-h-0 w-full px-2 md:px-6 py-2"
        >
          {question.type === 'likert' && (
            <LikertRadialGauge
              key={question.id}
              onSelect={(value) => onAnswer(value)}
              autoAdvance={true}
              savedAnswer={typeof savedAnswer === 'number' ? savedAnswer : undefined}
            />
          )}

          {question.type === 'situational' && question.options && (
            <SituationalGrid
              key={question.id}
              options={question.options}
              onSelect={(value) => onAnswer(value)}
              autoAdvance={true}
              savedAnswer={typeof savedAnswer === 'string' ? savedAnswer : undefined}
            />
          )}

          {question.type === 'forced_choice' && question.options && (
            <ForcedChoiceFork
              key={question.id}
              options={question.options}
              onSelect={(value) => onAnswer(value)}
              autoAdvance={true}
              savedAnswer={typeof savedAnswer === 'string' ? savedAnswer : undefined}
            />
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
