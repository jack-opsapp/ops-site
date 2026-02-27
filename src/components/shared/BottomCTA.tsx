/**
 * BottomCTA — Reusable bottom-of-page call to action
 *
 * Full-width section with CSS gradient background,
 * bold left-aligned heading, optional subtext, primary CTA button,
 * and optional newsletter signup.
 * Used on Platform, Plans, Company, and other pages.
 */

import Button from '@/components/ui/Button';
import NewsletterSignup from '@/components/shared/NewsletterSignup';
import { FadeInUp } from '@/components/ui';

interface BottomCTAProps {
  heading: string;
  subtext?: string;
  buttonText: string;
  buttonHref: string;
  external?: boolean;
  /** Show newsletter signup below the CTA button */
  showNewsletter?: boolean;
  /** Source tag for newsletter tracking */
  newsletterSource?: string;
}

export default function BottomCTA({
  heading,
  subtext,
  buttonText,
  buttonHref,
  external = false,
  showNewsletter = false,
  newsletterSource = 'bottom-cta',
}: BottomCTAProps) {
  return (
    <section className="relative py-32 md:py-40 bg-ops-background overflow-hidden">
      {/* Subtle CSS gradient background */}
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
          <h2 className="font-heading font-bold uppercase leading-[0.95] tracking-tight text-ops-text-primary text-4xl md:text-6xl">
            {heading}
          </h2>
        </FadeInUp>

        {subtext && (
          <FadeInUp delay={0.08}>
            <p className="mt-6 font-heading font-light text-lg md:text-xl text-ops-text-secondary">
              {subtext}
            </p>
          </FadeInUp>
        )}

        <FadeInUp delay={subtext ? 0.14 : 0.08}>
          <div className="mt-10">
            <Button variant="solid" href={buttonHref} external={external}>
              {buttonText}
            </Button>
          </div>
        </FadeInUp>

        {showNewsletter && (
          <FadeInUp delay={subtext ? 0.2 : 0.14}>
            <div className="mt-12 pt-8 border-t border-ops-border max-w-md">
              <p className="font-caption text-ops-text-secondary uppercase tracking-[0.15em] text-[11px] mb-3">
                Stay in the loop
              </p>
              <NewsletterSignup source={newsletterSource} compact />
            </div>
          </FadeInUp>
        )}
      </div>
    </section>
  );
}
