/**
 * ContactBlock — Left-aligned contact section with email and CTA
 *
 * Server component. Displays team contact info with mailto link.
 */

import { SectionLabel, FadeInUp } from '@/components/ui';
import Button from '@/components/ui/Button';

interface ContactBlockProps {
  id?: string;
}

export default function ContactBlock({ id }: ContactBlockProps) {
  return (
    <section id={id} className="py-20">
      <FadeInUp>
        <SectionLabel label="GET IN TOUCH" className="mb-6" />

        <h2 className="font-heading font-bold uppercase leading-[0.95] tracking-tight text-ops-text-primary text-3xl md:text-4xl">
          TALK TO THE TEAM
        </h2>

        <div className="mt-8">
          <a
            href="mailto:hello@opsapp.co"
            className="font-heading text-ops-text-secondary hover:text-ops-text-primary underline transition-colors duration-200"
          >
            hello@opsapp.co
          </a>

          <p className="mt-3 font-heading font-light text-ops-text-secondary">
            We respond within 24 hours. Usually faster.
          </p>
        </div>

        <div className="mt-8">
          <Button variant="ghost" href="mailto:hello@opsapp.co" external>
            SEND US A MESSAGE -&gt;
          </Button>
        </div>
      </FadeInUp>
    </section>
  );
}
