/**
 * Hero — Full-viewport landing section
 * Dark gradient background, lower-left headline, two CTA buttons
 * Server component (no client interactivity)
 */

import Button from '@/components/ui/Button';
import GradientOverlay from '@/components/ui/GradientOverlay';

export default function Hero() {
  return (
    <section className="relative min-h-screen w-full overflow-hidden bg-ops-background">
      {/* Background: subtle dark gradient with noise texture feel */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0f0f0f] via-ops-background to-[#060606]" />
      <div className="absolute inset-0 bg-gradient-to-t from-ops-background/80 via-transparent to-transparent" />

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
          className="font-heading font-bold uppercase leading-[0.95] tracking-tight text-ops-text-primary"
          style={{ fontSize: 'clamp(4rem, 8vw, 7rem)' }}
        >
          RUN YOUR
          <br />
          OPERATION
        </h1>

        {/* Subtext */}
        <p className="mt-4 font-heading font-light text-lg text-ops-text-secondary sm:text-xl md:text-2xl">
          Job management your crew will actually use.
        </p>

        {/* CTA buttons */}
        <div className="mt-8 flex items-center gap-4">
          <Button variant="solid" href="https://app.opsapp.co" external={true}>
            GET OPS
          </Button>
          <Button variant="ghost" href="/platform">
            SEE PLATFORM
          </Button>
        </div>
      </div>
    </section>
  );
}
