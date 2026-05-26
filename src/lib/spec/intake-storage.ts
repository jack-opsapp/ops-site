/**
 * Supabase Storage helpers for SPEC intake uploads.
 *
 * Source: ops-software-bible/SPEC/02_DATA_MODEL.md § Supabase Storage
 * configuration. Bucket `spec-intake` is operator-only RLS; customer uploads
 * go through a server route that uses the service-role client (RLS bypass).
 *
 * Authoritative MIME whitelist + 25MB cap re-validated server-side here —
 * the bucket-level whitelist is enforced by Supabase, but we never trust the
 * client and must short-circuit before touching the bucket.
 *
 * Server-only — never import from client code.
 */

import crypto from 'node:crypto';

export const SPEC_INTAKE_BUCKET = 'spec-intake';

export const SPEC_INTAKE_MAX_BYTES = 26214400; // 25 MB

export const SPEC_INTAKE_ALLOWED_MIME = [
  'application/pdf',
  'image/png',
  'image/jpeg',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
] as const;

export type SpecIntakeAllowedMime = (typeof SPEC_INTAKE_ALLOWED_MIME)[number];

const EXTENSION_FOR_MIME: Record<SpecIntakeAllowedMime, string> = {
  'application/pdf': 'pdf',
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
};

export function isAllowedIntakeMime(mime: string): mime is SpecIntakeAllowedMime {
  return (SPEC_INTAKE_ALLOWED_MIME as readonly string[]).includes(mime);
}

/**
 * Build a safe storage path for an uploaded intake file.
 * Format: `spec-intake/{spec_project_id}/{random}-{sanitized-name}.{ext}`
 *
 * Never trust client-supplied filenames. We strip everything except
 * [A-Za-z0-9-_.] and clip to 60 characters. The leading random hex prevents
 * filename collisions and obscures uploads from object-listing brute force.
 */
export function buildIntakeObjectPath(
  specProjectId: string,
  mime: SpecIntakeAllowedMime,
  originalFilename: string,
): string {
  if (!isUuid(specProjectId)) {
    throw new Error('buildIntakeObjectPath: invalid spec_project_id');
  }
  const random = crypto.randomBytes(8).toString('hex');
  const ext = EXTENSION_FOR_MIME[mime];
  const safe = sanitizeFilename(originalFilename, ext);
  return `${specProjectId}/${random}-${safe}`;
}

/**
 * Path-traversal guard. A valid intake file path must:
 *  - start with the project UUID + `/`
 *  - contain no `..` segments
 *  - contain no leading `/`
 *  - end with one of the allowed extensions
 */
export function isValidIntakeObjectPath(path: string, specProjectId: string): boolean {
  if (typeof path !== 'string' || path.length === 0) return false;
  if (!isUuid(specProjectId)) return false;
  if (path.startsWith('/')) return false;
  if (path.includes('..')) return false;
  if (!path.startsWith(`${specProjectId}/`)) return false;
  const tail = path.slice(specProjectId.length + 1);
  if (tail.length === 0 || tail.includes('/')) return false;
  const ext = tail.split('.').pop()?.toLowerCase() ?? '';
  return Object.values(EXTENSION_FOR_MIME).includes(ext);
}

function sanitizeFilename(name: string, fallbackExt: string): string {
  const trimmed = name.trim();
  const lastDot = trimmed.lastIndexOf('.');
  const stem = lastDot > 0 ? trimmed.slice(0, lastDot) : trimmed;
  const ext = lastDot > 0 ? trimmed.slice(lastDot + 1).toLowerCase() : fallbackExt;
  const safeStem = stem.replace(/[^A-Za-z0-9._-]+/g, '_').slice(0, 60) || 'file';
  const safeExt = ext.replace(/[^A-Za-z0-9]+/g, '').toLowerCase() || fallbackExt;
  return `${safeStem}.${safeExt}`;
}

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}
