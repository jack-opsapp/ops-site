/**
 * CompetitorLinkedText — Inline auto-linker for competitor mentions in body copy.
 *
 * Detects mentions of the 8 competitors that have their own /compare/ pages
 * and renders each as a styled <Link>. Skips self-linking when the current
 * route already targets that competitor's compare page.
 *
 * Used by IndustrySolutions, IndustryPainPointCard, and the shared FAQItem
 * — anywhere industry body copy or FAQ answers might mention a competitor.
 */

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';

const COMPETITORS: ReadonlyArray<{ readonly name: string; readonly href: string }> = [
  // Ordered longest-first so 'Housecall Pro' matches before 'Housecall'.
  { name: 'Housecall Pro', href: '/compare/housecall-pro' },
  { name: 'ServiceTitan', href: '/compare/servicetitan' },
  { name: 'FieldPulse', href: '/compare/fieldpulse' },
  { name: 'FieldEdge', href: '/compare/fieldedge' },
  { name: 'BuildOps', href: '/compare/buildops' },
  { name: 'Simpro', href: '/compare/simpro' },
  { name: 'Jobber', href: '/compare/jobber' },
  { name: 'Zuper', href: '/compare/zuper' },
];

const PATTERN_SOURCE =
  '\\b(' +
  COMPETITORS.map((c) => c.name.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')).join('|') +
  ')\\b';

const DEFAULT_LINK_CLASS =
  'underline decoration-ops-border hover:decoration-ops-text-primary text-ops-text-secondary hover:text-ops-text-primary transition-colors';

interface Props {
  text: string;
  /** Optional override for the link className applied to anchored mentions. */
  linkClassName?: string;
}

export default function CompetitorLinkedText({ text, linkClassName = DEFAULT_LINK_CLASS }: Props) {
  const pathname = usePathname();
  const pattern = new RegExp(PATTERN_SOURCE, 'g');

  const nodes: ReactNode[] = [];
  let lastIdx = 0;
  let key = 0;

  for (const match of text.matchAll(pattern)) {
    const matchedName = match[1];
    const matchStart = match.index ?? 0;
    const matchEnd = matchStart + matchedName.length;
    const entry = COMPETITORS.find((c) => c.name === matchedName);
    if (!entry) continue;

    if (matchStart > lastIdx) {
      nodes.push(text.slice(lastIdx, matchStart));
    }

    if (pathname === entry.href) {
      nodes.push(matchedName);
    } else {
      nodes.push(
        <Link key={`cl-${key++}`} href={entry.href} className={linkClassName}>
          {matchedName}
        </Link>
      );
    }

    lastIdx = matchEnd;
  }

  if (lastIdx === 0) return <>{text}</>;
  if (lastIdx < text.length) nodes.push(text.slice(lastIdx));
  return <>{nodes}</>;
}
