/**
 * SPEC Terms of Service — version hash
 *
 * Build-time sha256 of the SPEC ToS prose stored in `legalDocuments['spec-terms']`.
 * Consumed by the Stage C.1 create-checkout-session route so the accepted
 * version is stamped on `checkout.session.metadata.tos_version_hash` and
 * persisted alongside the engagement record. Any change to the prose, title,
 * dates, or version field produces a new hash, giving us per-engagement
 * version pinning per Section 23 of the SPEC ToS.
 *
 * Server-only. Hash is computed synchronously at module-evaluate time using
 * Node's crypto module — no async, no env-var lookup, no request-time work.
 */

import { createHash } from 'node:crypto';
import { legalDocuments } from '@/lib/legal-content';

const SPEC_TERMS_KEY = 'spec-terms';

function buildCanonicalString(): string {
  const doc = legalDocuments[SPEC_TERMS_KEY];
  if (!doc) {
    throw new Error(
      `legalDocuments['${SPEC_TERMS_KEY}'] is missing — SPEC ToS version hash cannot be computed.`,
    );
  }
  const header = [
    `title: ${doc.title}`,
    `lastUpdated: ${doc.lastUpdated}`,
    `effectiveDate: ${doc.effectiveDate}`,
    `version: ${doc.version ?? ''}`,
  ].join('\n');
  const body = doc.sections
    .map((section) => `# ${section.id} :: ${section.title}\n\n${section.content}`)
    .join('\n\n');
  return `${header}\n\n${body}`;
}

export const SPEC_TERMS_CANONICAL_STRING: string = buildCanonicalString();

export const SPEC_TERMS_VERSION_HASH: string = createHash('sha256')
  .update(SPEC_TERMS_CANONICAL_STRING, 'utf8')
  .digest('hex');
