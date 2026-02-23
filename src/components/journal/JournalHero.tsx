/**
 * JournalHero -- Minimal hero for the Journal index page
 *
 * Server component. Dark background with section label and bold heading.
 * Top padding accounts for the fixed navigation bar.
 */

import { SectionLabel } from '@/components/ui';

export default function JournalHero() {
  return (
    <section className="bg-ops-background pt-32 pb-12">
      <div className="max-w-[1400px] mx-auto px-6 md:px-10">
        <SectionLabel label="JOURNAL" />
        <h1 className="mt-4 font-heading font-bold uppercase leading-tight text-ops-text-primary text-4xl md:text-6xl">
          FIELD NOTES FROM THE FRONT LINES
        </h1>
      </div>
    </section>
  );
}
