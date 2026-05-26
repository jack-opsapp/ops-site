/**
 * High-entropy token helpers for SPEC owner-approval + buyer-checkout flows.
 *
 * Source: ops-software-bible/SPEC/02_DATA_MODEL.md §
 *         spec_owner_approval_requests (tokens stored as hashes; plaintext
 *         emitted in URLs once, never re-readable from the DB).
 *
 * The bible specifies "bcrypt/argon2 hashes" for the password-hashing class
 * of operations. Our tokens are 192 bits of entropy (UUID v4 + 16 random
 * bytes), so SHA-256 with a constant-time compare is equivalent in security
 * AND avoids both a dependency and the per-verify CPU cost of bcrypt. The
 * threat model is "DB compromise should not yield active tokens" — SHA-256
 * meets that bar for high-entropy inputs.
 *
 * Server-only — never import from client code.
 */

import crypto from 'node:crypto';

/**
 * Generate a high-entropy token suitable for use in a single-use URL.
 * Format: `<uuid_v4>.<32_hex_chars>` — URL-safe, ~192 bits of entropy.
 */
export function generateApprovalToken(): string {
  const uuid = crypto.randomUUID();
  const suffix = crypto.randomBytes(16).toString('hex');
  return `${uuid}.${suffix}`;
}

/**
 * Hash a token for at-rest storage. Hex-encoded SHA-256 (64 chars).
 */
export function hashApprovalToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

/**
 * Constant-time comparison of a plaintext token against a stored hash.
 * Returns `false` on any encoding error rather than throwing.
 */
export function verifyApprovalToken(plaintext: string, storedHash: string): boolean {
  if (!plaintext || !storedHash) return false;
  let computed: string;
  try {
    computed = hashApprovalToken(plaintext);
  } catch {
    return false;
  }
  const a = Buffer.from(computed, 'utf8');
  const b = Buffer.from(storedHash, 'utf8');
  if (a.length !== b.length) return false;
  try {
    return crypto.timingSafeEqual(a, b);
  } catch {
    return false;
  }
}
