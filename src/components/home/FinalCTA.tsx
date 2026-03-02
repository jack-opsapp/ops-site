/**
 * FinalCTA — Bottom-of-page call to action
 *
 * Full-width section with bold headline, subtext, two CTAs, and trust line.
 */

import Button from '@/components/ui/Button';
import { FadeInUp } from '@/components/ui';
import { getTDict } from '@/i18n/server';

const APP_STORE_URL = 'https://apps.apple.com/us/app/ops-job-crew-management/id6746662078';

export default async function FinalCTA() {
  const dict = await getTDict('home');
  const t = (key: string) => {
    const value = dict[key];
    return typeof value === 'string' ? value : key;
  };

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
            className="font-heading font-bold uppercase leading-[0.95] tracking-tight text-ops-text-primary max-w-[700px]"
            style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)' }}
          >
            {t('finalCta.heading')}
          </h2>
        </FadeInUp>

        <FadeInUp delay={0.08}>
          <p className="mt-6 font-heading font-light text-lg md:text-xl text-ops-text-secondary">
            {t('finalCta.subtext')}
          </p>
        </FadeInUp>

        <FadeInUp delay={0.14}>
          <div className="mt-10 flex items-center gap-4">
            <Button variant="solid" href={APP_STORE_URL} external>
              {t('finalCta.ctaDownload')}
            </Button>
            <Button variant="ghost" href="https://try.opsapp.co/tutorial-intro" external>
              {t('finalCta.ctaTry')}
            </Button>
          </div>
        </FadeInUp>

        <FadeInUp delay={0.2}>
          <p className="mt-4 font-caption text-xs text-ops-text-secondary tracking-[0.1em]">
            {t('finalCta.trustLine')}
          </p>
        </FadeInUp>
      </div>
    </section>
  );
}
