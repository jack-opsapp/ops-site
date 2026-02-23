/**
 * ResourcesHero — Half-viewport hero for the Resources page
 *
 * Server component. Plain dark background, bold left-aligned heading
 * anchored to lower-left with section label and subtext.
 */

import { SectionLabel } from '@/components/ui';

export default function ResourcesHero() {
  return (
    <section className="relative min-h-[50vh] w-full bg-ops-background">
      <div className="flex min-h-[50vh] max-w-[1400px] mx-auto flex-col justify-end px-6 md:px-10 pb-16">
        <SectionLabel label="RESOURCES" className="mb-6" />

        <h1 className="font-heading font-bold uppercase leading-[0.95] tracking-tight text-ops-text-primary text-4xl md:text-6xl">
          WE&apos;RE HERE TO HELP
        </h1>

        <p className="mt-4 font-caption uppercase tracking-[0.15em] text-sm text-ops-text-secondary">
          Everything you need to get started and stay running.
        </p>
      </div>
    </section>
  );
}
