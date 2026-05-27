/**
 * LegalContent — Renders a single legal document with TOC and sections
 *
 * Client component for Framer Motion AnimatePresence transitions
 * between tab switches. Includes anchor-linked table of contents.
 *
 * Supports multi-paragraph content, bullet lists (lines starting with -),
 * and pipe-delimited table formatting.
 */

'use client';

import { AnimatePresence, motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { Divider } from '@/components/ui';
import type { LegalDocument } from '@/lib/legal-content';

interface LegalContentProps {
  document: LegalDocument;
}

/**
 * Render inline markdown: **bold**, *italic*, and `code` spans.
 * Preserves verbatim source from the bible without changing the prose.
 */
function renderInline(text: string): ReactNode {
  const tokenRegex = /(\*\*[^*\n]+\*\*|`[^`\n]+`|\*[^*\n]+\*)/g;
  const parts: ReactNode[] = [];
  let lastIndex = 0;
  let key = 0;
  for (const match of text.matchAll(tokenRegex)) {
    const start = match.index ?? 0;
    if (start > lastIndex) {
      parts.push(text.slice(lastIndex, start));
    }
    const token = match[0];
    if (token.startsWith('**')) {
      parts.push(
        <strong key={key++} className="font-semibold text-ops-text-dark">
          {token.slice(2, -2)}
        </strong>,
      );
    } else if (token.startsWith('`')) {
      parts.push(
        <code
          key={key++}
          className="font-mono text-[0.875em] bg-ops-text-dark/[0.05] text-ops-text-dark px-1 py-0.5 rounded"
        >
          {token.slice(1, -1)}
        </code>,
      );
    } else {
      parts.push(
        <em key={key++} className="italic">
          {token.slice(1, -1)}
        </em>,
      );
    }
    lastIndex = start + token.length;
  }
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }
  return parts.length > 0 ? parts : text;
}

/**
 * Detect whether a block of text is a pipe-delimited table.
 * A table block has every non-empty line starting with |.
 */
function isTableBlock(block: string): boolean {
  const lines = block.split('\n').filter((l) => l.trim().length > 0);
  return lines.length >= 2 && lines.every((l) => l.trim().startsWith('|'));
}

/**
 * Parse a pipe-delimited table block into header + rows.
 * Skips separator rows (e.g. |---|---|).
 */
function parseTable(block: string): { headers: string[]; rows: string[][] } {
  const lines = block
    .split('\n')
    .filter((l) => l.trim().length > 0)
    .filter((l) => !l.match(/^\|\s*[-:]+(\s*\|\s*[-:]+)*\s*\|?\s*$/));

  const parse = (line: string): string[] =>
    line
      .split('|')
      .map((c) => c.trim())
      .filter((c) => c.length > 0);

  const headers = lines.length > 0 ? parse(lines[0]) : [];
  const rows = lines.slice(1).map(parse);
  return { headers, rows };
}

/**
 * Render a single content block (paragraph, bullet list, or table).
 */
function ContentBlock({ text, index }: { text: string; index: number }) {
  // Table block
  if (isTableBlock(text)) {
    const { headers, rows } = parseTable(text);
    return (
      <div className="overflow-x-auto my-4" key={index}>
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr>
              {headers.map((h, i) => (
                <th
                  key={i}
                  className="font-heading text-left text-xs font-semibold text-ops-text-dark px-3 py-2 border-b border-ops-text-dark/15 bg-ops-text-dark/[0.03]"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, ri) => (
              <tr key={ri}>
                {row.map((cell, ci) => (
                  <td
                    key={ci}
                    className="font-body text-sm text-ops-text-dark/80 px-3 py-2 border-b border-ops-text-dark/8 align-top"
                  >
                    {renderInline(cell)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  // Bullet list: block where every line starts with "- "
  const lines = text.split('\n');
  const allBullets = lines.every((l) => l.startsWith('- '));
  if (allBullets && lines.length > 0) {
    return (
      <ul
        key={index}
        className="list-disc list-outside pl-5 space-y-1.5 my-2"
      >
        {lines.map((line, li) => (
          <li
            key={li}
            className="font-body text-base leading-relaxed text-ops-text-dark/80"
          >
            {renderInline(line.replace(/^- /, ''))}
          </li>
        ))}
      </ul>
    );
  }

  // Mixed content: paragraph that may contain inline bullets
  // Check if some lines are bullets and some are not
  const hasBullets = lines.some((l) => l.startsWith('- '));
  if (hasBullets) {
    const groups: { type: 'text' | 'bullets'; lines: string[] }[] = [];
    for (const line of lines) {
      const isBullet = line.startsWith('- ');
      const lastGroup = groups[groups.length - 1];
      if (lastGroup && lastGroup.type === (isBullet ? 'bullets' : 'text')) {
        lastGroup.lines.push(line);
      } else {
        groups.push({
          type: isBullet ? 'bullets' : 'text',
          lines: [line],
        });
      }
    }
    return (
      <div key={index}>
        {groups.map((group, gi) => {
          if (group.type === 'bullets') {
            return (
              <ul
                key={gi}
                className="list-disc list-outside pl-5 space-y-1.5 my-2"
              >
                {group.lines.map((line, li) => (
                  <li
                    key={li}
                    className="font-body text-base leading-relaxed text-ops-text-dark/80"
                  >
                    {renderInline(line.replace(/^- /, ''))}
                  </li>
                ))}
              </ul>
            );
          }
          return (
            <p
              key={gi}
              className="font-body text-base leading-relaxed text-ops-text-dark/80 my-2"
            >
              {renderInline(group.lines.join('\n'))}
            </p>
          );
        })}
      </div>
    );
  }

  // Plain paragraph
  return (
    <p
      key={index}
      className="font-body text-base leading-relaxed text-ops-text-dark/80 my-2"
    >
      {renderInline(text)}
    </p>
  );
}

export default function LegalContent({ document: doc }: LegalContentProps) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={doc.title}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
        className="max-w-3xl"
      >
        {/* Last updated + effective date + version */}
        <div className="mt-10 mb-8 space-y-1">
          <p className="font-caption uppercase text-[10px] tracking-[0.15em] text-ops-text-secondary">
            Last updated: {doc.lastUpdated}
          </p>
          {doc.effectiveDate && (
            <p className="font-caption uppercase text-[10px] tracking-[0.15em] text-ops-text-secondary">
              Effective date: {doc.effectiveDate}
            </p>
          )}
          {doc.version && (
            <p className="font-caption uppercase text-[10px] tracking-[0.15em] text-ops-text-secondary">
              Version: {doc.version}
            </p>
          )}
        </div>

        {/* Table of contents */}
        <nav aria-label="Table of contents" className="space-y-2 mb-6">
          {doc.sections.map((section) => (
            <a
              key={section.id}
              href={`#${section.id}`}
              className="block font-caption uppercase text-[11px] tracking-[0.15em] text-ops-text-secondary hover:text-ops-accent transition-colors duration-200"
            >
              {section.title}
            </a>
          ))}
        </nav>

        <Divider className="bg-ops-text-dark/10" />

        {/* Sections */}
        {doc.sections.map((section) => {
          // Split content on double newlines to get blocks
          const blocks = section.content.split('\n\n');

          return (
            <div key={section.id}>
              <h2
                id={section.id}
                className="font-heading font-semibold text-xl text-ops-text-dark pt-8 pb-3"
              >
                {section.title}
              </h2>
              {blocks.map((block, i) => (
                <ContentBlock key={i} text={block} index={i} />
              ))}
            </div>
          );
        })}
      </motion.div>
    </AnimatePresence>
  );
}
