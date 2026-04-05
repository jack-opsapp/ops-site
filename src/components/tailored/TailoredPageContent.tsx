'use client';

import type { Dictionary } from '@/i18n/types';

interface TailoredPageContentProps {
  dict: Dictionary;
}

/** Helper to read a string key from the dictionary */
function t(dict: Dictionary, key: string): string {
  const value = dict[key];
  return typeof value === 'string' ? value : key;
}

export function TailoredPageContent({ dict }: TailoredPageContentProps) {
  return (
    <main className="bg-ops-background min-h-screen">
      {/* Placeholder — sections added in subsequent tasks */}
      <section className="min-h-screen flex items-center justify-center">
        <p className="text-ops-text-secondary font-heading text-lg">
          {t(dict, 'hero.heading')}
        </p>
      </section>
    </main>
  );
}
