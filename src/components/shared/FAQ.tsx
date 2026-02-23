/**
 * FAQ — Shared FAQ section with SectionLabel and expandable items
 *
 * Server component. Wraps FAQItem list in FadeInUp animation.
 */

import { SectionLabel, FadeInUp } from '@/components/ui';
import FAQItem from './FAQItem';

interface FAQProps {
  label: string;
  items: { question: string; answer: string }[];
  id?: string;
}

export default function FAQ({ label, items, id }: FAQProps) {
  return (
    <section id={id} className="py-24 md:py-32 bg-ops-background">
      <div className="max-w-3xl mx-auto px-6 md:px-10">
        <FadeInUp>
          <SectionLabel label={label} className="mb-12" />

          <div>
            {items.map((item, index) => (
              <FAQItem
                key={index}
                question={item.question}
                answer={item.answer}
              />
            ))}
          </div>
        </FadeInUp>
      </div>
    </section>
  );
}
