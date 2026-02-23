/**
 * Starburst — Full-viewport interactive section
 *
 * Signature visual: a 3D rotating radial burst with depth-based styling.
 * Bold diagonal typography — "COMMAND" upper-left, "CHAOS" lower-right.
 */

'use client';

import StarburstCanvas from '@/components/animations/StarburstCanvas';

export default function Starburst() {
  return (
    <section className="relative h-[60vh] md:h-[80vh] w-full overflow-hidden bg-ops-background">
      {/* Canvas background — absolute, fills section */}
      <StarburstCanvas className="absolute inset-0 w-full h-full" />

      {/* Overlaid typography — pointer-events-none so canvas hover works */}
      <div className="pointer-events-none absolute inset-0">
        {/* Upper-left */}
        <h2
          className="absolute font-heading font-bold uppercase leading-[0.95] tracking-tight text-ops-text-primary text-5xl md:text-8xl"
          style={{
            top: '32%',
            left: '6%',
            opacity: 0.9,
          }}
        >
          COMMAND
        </h2>

        {/* Lower-right */}
        <h2
          className="absolute font-heading font-bold uppercase leading-[0.95] tracking-tight text-ops-text-primary text-5xl md:text-8xl"
          style={{
            bottom: '32%',
            right: '6%',
            opacity: 0.9,
          }}
        >
          CHAOS
        </h2>
      </div>
    </section>
  );
}
