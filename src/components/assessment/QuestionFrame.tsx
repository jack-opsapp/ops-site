/**
 * QuestionFrame — Question text + routed input component + transitions
 *
 * Routes by question type:
 *  - 'likert'        → LikertRadialGauge
 *  - 'situational'   → SituationalGrid
 *  - 'forced_choice' → ForcedChoiceFork
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
      ease: [0.22, 1, 0.36, 1] as const,
      staggerChildren: 0.12,
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    filter: 'blur(4px)',
    transition: {
      duration: 0.3,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  },
};

const textVariants = {
  initial: { opacity: 0, y: 16 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
  },
  exit: { opacity: 0 },
};

const componentVariants = {
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const, delay: 0.15 },
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
        {/* Question text */}
        <motion.h2
          variants={textVariants}
          className="font-heading text-2xl md:text-3xl text-ops-text-primary text-center max-w-2xl mb-8 md:mb-12 leading-snug"
        >
          {question.text}
        </motion.h2>

        {/* Input component */}
        <motion.div variants={componentVariants} className="w-full max-w-3xl">
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
