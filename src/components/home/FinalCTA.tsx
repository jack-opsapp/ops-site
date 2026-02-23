/**
 * FinalCTA — Bottom-of-page call to action
 *
 * Server component. Full-width section with a bold headline,
 * subtext, and primary CTA button.
 */

import Button from '@/components/ui/Button';
import { FadeInUp } from '@/components/ui';

export default function FinalCTA() {
  return (
    <section className="relative py-32 md:py-48 bg-ops-background overflow-hidden">
      {/* Subtle CSS gradient overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'linear-gradient(180deg, #0A0A0A 0%, #111111 40%, #0E0E0E 70%, #0A0A0A 100%)',
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 max-w-[1400px] mx-auto px-6 md:px-10">
        <FadeInUp>
          <h2
            className="font-heading font-bold uppercase leading-[0.95] tracking-tight text-ops-text-primary text-5xl md:text-7xl"
          >
            YOUR OPERATION.
            <br />
            YOUR RULES.
          </h2>
        </FadeInUp>

        <FadeInUp delay={0.08}>
          <p className="mt-6 font-heading font-light text-lg md:text-xl text-ops-text-secondary">
            Stop managing your crew from a group chat.
          </p>
        </FadeInUp>

        <FadeInUp delay={0.14}>
          <div className="mt-10">
            <Button variant="solid" href="https://app.opsapp.co" external>
              GET OPS
            </Button>
          </div>
        </FadeInUp>
      </div>
    </section>
  );
}
