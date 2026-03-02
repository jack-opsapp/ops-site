/**
 * Hero — Full-viewport landing section
 * Headline, subtext, two CTAs, trust line, founder quote
 */

import Image from 'next/image';
import Button from '@/components/ui/Button';
import GradientOverlay from '@/components/ui/GradientOverlay';
import { getTDict } from '@/i18n/server';

const APP_STORE_URL = 'https://apps.apple.com/us/app/ops-job-crew-management/id6746662078';

const HERO_IMAGE = '/images/hero-home.png';

export default async function Hero() {
  const dict = await getTDict('home');
  const t = (key: string) => {
    const value = dict[key];
    return typeof value === 'string' ? value : key;
  };

  return (
    <section className="relative min-h-screen w-full overflow-hidden bg-ops-background">
      {/* Background: subtle dark gradient with noise texture feel */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0f0f0f] via-ops-background to-[#060606]" />

      {/* Hero background image — layered above base gradient, below top overlays */}
      {HERO_IMAGE && (
        <Image
          src={HERO_IMAGE}
          alt=""
          fill
          priority
          className="object-cover opacity-[0.55]"
        />
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-ops-background via-ops-background/40 to-transparent" />

      {/* Subtle noise grain via repeating micro-gradient */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")',
          backgroundRepeat: 'repeat',
          backgroundSize: '256px 256px',
        }}
        aria-hidden="true"
      />

      {/* Gradient overlay fading to background at bottom */}
      <GradientOverlay direction="to-bottom" opacity={0.6} />

      {/* Content: anchored to lower-left */}
      <div className="relative z-10 flex min-h-screen flex-col justify-end px-6 pb-[clamp(4rem,10vh,8rem)] sm:px-10 md:px-16 lg:px-24">
        {/* Headline */}
        <h1
          className="font-heading font-bold uppercase leading-[0.95] tracking-tight text-ops-text-primary max-w-[800px]"
          style={{ fontSize: 'clamp(3rem, 6vw, 5.5rem)' }}
        >
          {t('hero.headline')}
        </h1>

        {/* Subtext */}
        <p className="mt-4 font-heading font-light text-lg text-ops-text-secondary sm:text-xl md:text-2xl max-w-[600px]">
          {t('hero.subtext')}
        </p>

        {/* CTA buttons */}
        <div className="mt-8 flex items-center gap-4">
          <Button variant="solid" href={APP_STORE_URL} external={true}>
            {t('hero.ctaDownload')}
          </Button>
          <Button variant="ghost" href="https://try.opsapp.co/tutorial-intro" external={true}>
            {t('hero.ctaTry')}
          </Button>
        </div>

        {/* Trust line */}
        <p className="mt-4 font-caption text-xs text-ops-text-secondary tracking-[0.1em]">
          {t('hero.trustLine')}
        </p>

        {/* Founder quote */}
        <div className="hidden lg:block border-l-2 border-white/20 pl-6 mt-10 max-w-[560px]">
          <p className="font-heading font-light text-base text-ops-text-secondary leading-relaxed">
            {t('hero.founderQuote')}
          </p>
          <p className="font-caption uppercase tracking-[0.15em] text-[11px] text-ops-text-secondary mt-2">
            {t('hero.founderName')}
          </p>
        </div>
      </div>
    </section>
  );
}
