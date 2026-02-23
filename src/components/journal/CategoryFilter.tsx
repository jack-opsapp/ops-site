/**
 * CategoryFilter -- Client component for filtering journal posts by category
 *
 * Horizontal row of category buttons with "ALL" first.
 * Active category gets a white underline; inactive is muted.
 */

'use client';

import type { BlogCategory } from '@/lib/blog';

interface CategoryFilterProps {
  categories: BlogCategory[];
  activeSlug: string | null;
  onChange: (slug: string | null) => void;
}

export default function CategoryFilter({
  categories,
  activeSlug,
  onChange,
}: CategoryFilterProps) {
  return (
    <div className="flex flex-wrap items-center gap-6">
      {/* ALL button */}
      <button
        type="button"
        onClick={() => onChange(null)}
        className={`font-caption uppercase text-[11px] tracking-[0.15em] pb-1 transition-colors duration-200 ${
          activeSlug === null
            ? 'text-ops-text-primary border-b-2 border-white'
            : 'text-ops-text-secondary hover:text-ops-text-primary'
        }`}
      >
        ALL
      </button>

      {categories.map((cat) => (
        <button
          key={cat.id}
          type="button"
          onClick={() => onChange(cat.slug)}
          className={`font-caption uppercase text-[11px] tracking-[0.15em] pb-1 transition-colors duration-200 ${
            activeSlug === cat.slug
              ? 'text-ops-text-primary border-b-2 border-white'
              : 'text-ops-text-secondary hover:text-ops-text-primary'
          }`}
        >
          {cat.name}
        </button>
      ))}
    </div>
  );
}
