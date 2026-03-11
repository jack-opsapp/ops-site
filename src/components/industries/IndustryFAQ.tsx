import { SectionLabel, FadeInUp } from '@/components/ui';
import FAQItem from '@/components/shared/FAQItem';

interface FAQEntry {
  question: string;
  answer: string;
}

interface IndustryFAQProps {
  universalFaq: FAQEntry[];
  industryFaq: FAQEntry[];
}

export default function IndustryFAQ({ universalFaq, industryFaq }: IndustryFAQProps) {
  const allFaq = [...universalFaq, ...industryFaq];

  return (
    <section className="py-24 md:py-32 bg-ops-background">
      <div className="max-w-3xl mx-auto px-6 md:px-10">
        <FadeInUp>
          <SectionLabel label="FREQUENTLY ASKED" className="mb-12" />
          <div>
            {allFaq.map((item, index) => (
              <FAQItem key={index} question={item.question} answer={item.answer} />
            ))}
          </div>
        </FadeInUp>
      </div>
    </section>
  );
}
