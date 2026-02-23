/**
 * PlatformHero — Full-viewport hero for the Platform page
 *
 * Server component. Dark CSS gradient background creating a subtle
 * atmospheric feel, GradientOverlay at bottom, content anchored lower-left.
 */

import { SectionLabel, GradientOverlay } from '@/components/ui';

export default function PlatformHero() {
  return (
    <section className="relative min-h-screen w-full overflow-hidden bg-ops-background">
      {/* Layered CSS gradients for atmospheric depth */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#111111] via-ops-background to-[#050508]" />
      <div className="absolute inset-0 bg-gradient-to-tr from-[#0A0A0A] via-transparent to-[#0D1117]/30" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0A0E14]/20 to-ops-background/90" />

      {/* Subtle noise grain */}
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
      <GradientOverlay direction="to-bottom" opacity={0.7} />

      {/* Content: anchored to lower-left */}
      <div className="relative z-10 flex min-h-screen flex-col justify-end px-6 pb-[clamp(4rem,10vh,8rem)] sm:px-10 md:px-16 lg:px-24">
        <SectionLabel label="PLATFORM" className="mb-6" />

        <h1
          className="font-heading font-bold uppercase leading-[0.95] tracking-tight text-ops-text-primary"
          style={{ fontSize: 'clamp(3rem, 6vw, 5rem)' }}
        >
          EVERY TOOL YOUR
          <br />
          CREW NEEDS.
          <br />
          NOTHING THEY DON&apos;T.
        </h1>

        <p className="mt-6 font-caption uppercase tracking-[0.15em] text-sm text-ops-text-secondary">
          Project management built for boots on the ground.
        </p>
      </div>
    </section>
  );
}
