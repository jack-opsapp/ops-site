/**
 * ChunkReview — Section summary before submission
 *
 * Shows all questions + answers from the current chunk.
 * User can tap any row to revise, or confirm to submit and continue.
 * Left-aligned layout per system.md.
 */

'use client';

import { motion } from 'framer-motion';
import type { ClientQuestion } from '@/lib/assessment/types';

const EASE = [0.22, 1, 0.36, 1] as const;

interface ChunkReviewProps {
  questions: ClientQuestion[];
  savedAnswers: Map<string, number | string>;
  chunkNumber: number;
  totalChunks: number;
  onRevise: (index: number) => void;
  onConfirm: () => void;
}

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.06, delayChildren: 0.15 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12, filter: 'blur(3px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.4, ease: EASE },
  },
};

function getTypeBadge(type: string): string {
  switch (type) {
    case 'situational': return 'SCENARIO';
    case 'likert': return 'SCALE';
    case 'forced_choice': return 'CHOICE';
    default: return 'QUESTION';
  }
}

function LikertDots({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: 7 }, (_, i) => {
        const v = i + 1;
        const isSelected = v === value;
        return (
          <div
            key={i}
            className={isSelected ? 'w-[5px] h-[5px] bg-ops-accent' : 'w-[5px] h-[5px] bg-white/15'}
            style={isSelected ? { boxShadow: '0 0 4px rgba(89, 119, 148, 0.4)' } : undefined}
          />
        );
      })}
      <span className="ml-2 font-caption text-[10px] text-ops-text-secondary/50 tabular-nums">
        {value} / 7
      </span>
    </div>
  );
}

function AnswerDisplay({ question, answer }: { question: ClientQuestion; answer: number | string }) {
  if (question.type === 'likert' && typeof answer === 'number') {
    return <LikertDots value={answer} />;
  }

  if (question.options && typeof answer === 'string') {
    const option = question.options.find(o => o.key === answer);
    if (option) {
      return (
        <p className="font-heading text-sm text-ops-text-secondary/70 leading-snug line-clamp-2">
          {option.text}
        </p>
      );
    }
  }

  return (
    <span className="font-heading text-sm text-ops-text-secondary/50">
      {String(answer)}
    </span>
  );
}

export default function ChunkReview({
  questions,
  savedAnswers,
  chunkNumber,
  totalChunks,
  onRevise,
  onConfirm,
}: ChunkReviewProps) {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="h-full overflow-y-auto"
    >
      <div className="max-w-2xl pl-[8%] md:pl-[12%] lg:pl-[14%] pr-6 md:pr-10 py-8 md:py-12">
        {/* Section label */}
        <motion.span
          variants={itemVariants}
          className="block font-caption text-[10px] uppercase tracking-[0.25em] text-ops-accent mb-6"
        >
          [ Section Review ]
        </motion.span>

        {/* Title */}
        <motion.h2
          variants={itemVariants}
          className="font-heading font-bold uppercase text-ops-text-primary text-2xl md:text-3xl tracking-tight mb-3"
        >
          Section {chunkNumber} Complete
        </motion.h2>

        {/* Subtitle */}
        <motion.p
          variants={itemVariants}
          className="font-heading font-light text-ops-text-secondary/50 text-sm leading-relaxed mb-8"
        >
          Review your responses before continuing. Tap any row to revise.
        </motion.p>

        {/* Divider */}
        <motion.div
          variants={itemVariants}
          className="border-b border-white/[0.06] mb-6"
        />

        {/* Question list */}
        {questions.map((question, index) => {
          const answer = savedAnswers.get(question.id);
          const hasAnswer = answer !== undefined;

          return (
            <motion.button
              key={question.id}
              variants={itemVariants}
              type="button"
              onClick={() => onRevise(index)}
              className="w-full text-left group mb-4 last:mb-0 border border-white/[0.06] hover:border-white/[0.12] rounded-[3px] px-5 py-4 transition-colors duration-200 cursor-pointer"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  {/* Question number + type */}
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-caption text-[10px] text-ops-text-secondary/30 tabular-nums">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <span className="font-caption text-[9px] uppercase tracking-[0.2em] text-ops-accent/60">
                      {getTypeBadge(question.type)}
                    </span>
                  </div>

                  {/* Question text */}
                  <p className="font-heading text-sm font-light text-ops-text-primary/80 leading-snug mb-3 line-clamp-2">
                    {question.text}
                  </p>

                  {/* Answer display */}
                  {hasAnswer && <AnswerDisplay question={question} answer={answer} />}
                </div>

                {/* Revise indicator */}
                <span className="font-caption text-[9px] uppercase tracking-[0.15em] text-ops-text-secondary/30 group-hover:text-ops-text-secondary/60 transition-colors mt-1 flex-shrink-0">
                  Revise
                </span>
              </div>
            </motion.button>
          );
        })}

        {/* Confirm button */}
        <motion.div
          variants={itemVariants}
          className="mt-8"
        >
          <button
            type="button"
            onClick={onConfirm}
            className="font-caption uppercase tracking-[0.2em] text-[11px] text-ops-background bg-white rounded-[3px] px-8 py-3 cursor-pointer transition-all duration-200 hover:bg-white/90"
          >
            Confirm & Continue
          </button>
        </motion.div>
      </div>
    </motion.div>
  );
}
