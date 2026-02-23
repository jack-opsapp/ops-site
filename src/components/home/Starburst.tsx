/**
 * Starburst — Full-viewport interactive section
 *
 * Signature visual element: a slowly rotating radial burst with hoverable
 * nodes, flanked by bold "ORGANIZE / EVERYTHING" typography. No section
 * label — the visual IS the section.
 */

'use client';

import StarburstCanvas from '@/components/animations/StarburstCanvas';

export default function Starburst() {
  return (
    <section className="relative min-h-screen w-full overflow-hidden bg-ops-background">
      {/* Canvas background — absolute, fills section */}
      <StarburstCanvas className="absolute inset-0 w-full h-full" />

      {/* Overlaid typography — pointer-events-none so canvas hover works */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        {/* Left text block — positioned left of center */}
        <h2
          className="absolute font-heading font-bold uppercase leading-[0.95] tracking-tight text-ops-text-primary text-6xl md:text-8xl"
          style={{
            right: '52%',
            opacity: 0.9,
          }}
        >
          ORGANIZE
        </h2>

        {/* Right text block — positioned right of center */}
        <h2
          className="absolute font-heading font-bold uppercase leading-[0.95] tracking-tight text-ops-text-primary text-6xl md:text-8xl"
          style={{
            left: '52%',
            opacity: 0.9,
          }}
        >
          EVERYTHING
        </h2>
      </div>
    </section>
  );
}
