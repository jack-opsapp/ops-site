/**
 * QuestionFrame — Question text + routed input component + transitions
 *
 * Routes by question type:
 *  - 'likert'        -> LikertRadialGauge
 *  - 'situational'   -> SituationalGrid
 *  - 'forced_choice' -> ForcedChoiceFork
 *
 * key={question.id} forces remount between questions (components lock
 * after selection via internal refs). AnimatePresence mode="wait" for
 * cinematic enter/exit transitions.
 */

'use client';

import { motion, AnimatePresence } from 'framer-motion';
import type { ClientQuestion } from '@/lib/assessment/types';
import LikertRadialGauge from './LikertRadialGauge';
import SituationalGrid from './SituationalGrid';
import ForcedChoiceFork from './ForcedChoiceFork';

interface QuestionFrameProps {
  question: ClientQuestion;
  onAnswer: (value: number | string) => void;
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

export default function QuestionFrame({ question, onAnswer }: QuestionFrameProps) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={question.id}
        variants={questionVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        className="flex flex-col items-center justify-center min-h-full px-6 md:px-10 py-8"
      >
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
          className="font-heading text-3xl md:text-4xl font-semibold text-ops-text-primary text-center max-w-2xl mb-6 md:mb-8 leading-[1.15]"
        >
          {question.text}
        </motion.h2>

        {/* Divider */}
        <motion.div
          variants={textVariants}
          className="w-12 h-px mb-8 md:mb-12"
          style={{ backgroundColor: 'rgba(89, 119, 148, 0.15)' }}
        />

        {/* Input component */}
        <motion.div variants={componentVariants} className="w-full max-w-4xl">
          {question.type === 'likert' && (
            <LikertRadialGauge
              key={question.id}
              onSelect={(value) => onAnswer(value)}
            />
          )}

          {question.type === 'situational' && question.options && (
            <SituationalGrid
              key={question.id}
              options={question.options}
              onSelect={(key) => onAnswer(key)}
            />
          )}

          {question.type === 'forced_choice' && question.options && (
            <ForcedChoiceFork
              key={question.id}
              options={question.options}
              onSelect={(key) => onAnswer(key)}
            />
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
