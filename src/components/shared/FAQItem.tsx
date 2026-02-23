/**
 * FAQItem — Expandable accordion item with Framer Motion height animation
 *
 * Client component. Click to expand/collapse answer.
 * Plus icon rotates 45deg to become an X when open.
 */

'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Divider } from '@/components/ui';

interface FAQItemProps {
  question: string;
  answer: string;
}

export default function FAQItem({ question, answer }: FAQItemProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between gap-4 py-5 text-left cursor-pointer"
        aria-expanded={isOpen}
      >
        <span className="font-heading font-medium text-lg text-ops-text-primary">
          {question}
        </span>

        <motion.div
          animate={{ rotate: isOpen ? 45 : 0 }}
          transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="shrink-0"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              d="M8 1V15M1 8H15"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              className="text-ops-text-secondary"
            />
          </svg>
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <p className="font-body font-light text-ops-text-secondary pt-4 pb-2">
              {answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <Divider />
    </div>
  );
}
