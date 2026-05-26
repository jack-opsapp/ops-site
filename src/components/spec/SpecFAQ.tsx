/**
 * SpecFAQ — Server Component using native <details>/<summary>.
 *
 * Phase 1 rewrite per 04_CUSTOMER_UX.md § 8 + 07_ROLLOUT.md § 3.
 * The previous Framer-Motion accordion hid answers behind client-side
 * state — meaning SEO crawlers and LLM crawlers couldn't read the
 * answer text without executing JavaScript. The new implementation
 * uses native HTML <details>/<summary> so every answer ships in the
 * initial HTML payload and is indexed without JS.
 *
 * The JSON-LD FAQPage schema is rendered in app/spec/page.tsx from the
 * same dictionary items list — single source of truth.
 *
 * Visual treatment: tactical hairline rows, the "+" rotates to "−"
 * via CSS [open] selector + transform. Reduced-motion is handled by
 * the globals.css reduce-motion override (transition-duration: 0.01ms).
 *
 * Voice: 14 questions per spec. Each answer ≤ 4 sentences. Drafted
 * via ops-copywriter (terse, tactical, OPS voice).
 */

import { SectionLabel } from '@/components/ui';

interface FAQItem {
  question: string;
  answer: string;
}

interface SpecFAQProps {
  sectionLabel: string;
  items: FAQItem[];
}

export default function SpecFAQ({ sectionLabel, items }: SpecFAQProps) {
  return (
    <section
      id="faq"
      aria-label="Frequently asked questions"
      className="py-24 md:py-32 bg-ops-background"
    >
      <div className="max-w-[800px] mx-auto px-6 sm:px-10 md:px-16">
        <SectionLabel label={sectionLabel} className="mb-12" />

        <div className="flex flex-col">
          {items.map((item) => (
            <details
              key={item.question}
              className="group border-b border-white/[0.06] [&_summary::-webkit-details-marker]:hidden"
            >
              <summary
                className="
                  flex items-start justify-between gap-4 py-5
                  text-left cursor-pointer list-none
                  group-hover:[&_.faq-q]:text-ops-text-primary
                "
              >
                <span className="faq-q font-heading font-light text-sm md:text-[15px] text-ops-text-secondary transition-colors leading-snug">
                  {item.question}
                </span>
                <span
                  aria-hidden="true"
                  className="
                    shrink-0 mt-0.5 w-4 h-4 relative
                    text-ops-text-secondary group-hover:text-ops-text-primary transition-colors
                  "
                >
                  {/* Plus → minus via two strokes; the vertical stroke
                      rotates 90° when open, leaving a clean minus. */}
                  <span className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-px bg-current" />
                  <span
                    className="
                      absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-px bg-current
                      transition-transform duration-200 ease-[cubic-bezier(0.22,1,0.36,1)]
                      group-open:rotate-90 group-open:scale-y-0
                    "
                  />
                </span>
              </summary>
              <div className="pb-5 pr-8">
                <p className="font-heading font-light text-sm text-ops-text-tertiary leading-relaxed">
                  {item.answer}
                </p>
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
