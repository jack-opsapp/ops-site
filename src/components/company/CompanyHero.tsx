/**
 * CompanyHero — Full-viewport hero for the Company page
 *
 * Server component. Dark atmospheric CSS gradient background,
 * bold left-aligned heading anchored to lower-left.
 * No CTA — this is a story page.
 */

import Image from 'next/image';
import { GradientOverlay } from '@/components/ui';

/**
 * To add a hero background image:
 * 1. Place image in /public/images/heroes/ (e.g. company-hero.jpg)
 * 2. Set HERO_IMAGE below to the filename
 */
const HERO_IMAGE: string | null = null;

export default function CompanyHero() {
  return (
    <section className="relative min-h-screen w-full overflow-hidden bg-ops-background">
      {/* Optional background image */}
      {HERO_IMAGE && (
        <Image
          src={`/images/heroes/${HERO_IMAGE}`}
          alt=""
          fill
          priority
          className="object-cover"
        />
      )}

      {/* Layered CSS gradients for atmospheric depth */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#111111] via-ops-background to-[#060608]" />
      <div className="absolute inset-0 bg-gradient-to-tr from-[#0A0A0A] via-transparent to-[#0D1117]/20" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0A0E14]/15 to-ops-background/90" />

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
      <div className="relative z-10 flex min-h-screen max-w-[1400px] mx-auto flex-col justify-end px-6 md:px-10 pb-24">
        <h1
          className="font-heading font-bold uppercase leading-[0.95] tracking-tight text-ops-text-primary"
          style={{ fontSize: 'clamp(3rem, 7vw, 6rem)' }}
        >
          WE BUILD WHAT
          <br />
          SHOULD EXIST
        </h1>
      </div>
    </section>
  );
}
