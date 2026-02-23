/**
 * PostFAQ — Light-theme FAQ accordion for journal posts
 *
 * Renders a custom light-background FAQ section. The shared FAQ/FAQItem
 * components are dark-theme (white text on dark bg), so this component
 * re-implements the accordion with dark-on-light text colors.
 */

'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SectionLabel } from '@/components/ui';

interface PostFAQProps {
  faqs: { question: string; answer: string }[];
}

function LightFAQItem({
  question,
  answer,
}: {
  question: string;
  answer: string;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between gap-4 py-5 text-left cursor-pointer"
        aria-expanded={isOpen}
      >
        <span className="font-heading font-medium text-lg text-ops-text-dark">
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

      <hr className="border-0 h-px w-full bg-[rgba(26,26,26,0.1)]" />
    </div>
  );
}

export default function PostFAQ({ faqs }: PostFAQProps) {
  if (!faqs || faqs.length === 0) return null;

  return (
    <section className="bg-ops-background-light py-16">
      <div className="max-w-[680px] mx-auto px-6">
        <SectionLabel
          label="FREQUENTLY ASKED"
          className="mb-12 !text-ops-text-secondary"
        />

        <div>
          {faqs.map((faq, index) => (
            <LightFAQItem
              key={index}
              question={faq.question}
              answer={faq.answer}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
