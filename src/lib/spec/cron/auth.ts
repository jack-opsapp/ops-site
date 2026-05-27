/**
 * Vercel-cron Authorization header verifier.
 *
 * Vercel automatically attaches `Authorization: Bearer ${CRON_SECRET}`
 * to scheduled cron invocations when CRON_SECRET is set as an
 * environment variable on the project. Any caller that doesn't carry
 * that header is rejected with 401. The check is constant-time to
 * avoid timing-leak inference of the secret.
 *
 * Docs: https://vercel.com/docs/cron-jobs/manage-cron-jobs#securing-cron-jobs
 */

import { timingSafeEqual } from 'node:crypto';

export type AuthOutcome =
  | { ok: true }
  | { ok: false; status: 401 | 500; reason: string };

export function verifyCronAuth(request: Request): AuthOutcome {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return { ok: false, status: 500, reason: 'CRON_SECRET not configured' };
  }
  const header = request.headers.get('authorization');
  if (!header) {
    return { ok: false, status: 401, reason: 'missing Authorization header' };
  }
  const expected = `Bearer ${secret}`;
  if (!constantTimeEquals(header, expected)) {
    return { ok: false, status: 401, reason: 'invalid CRON_SECRET' };
  }
  return { ok: true };
}

function constantTimeEquals(a: string, b: string): boolean {
  // Different-length compare must still be constant-time to avoid
  // leaking the secret length.
  const aBuf = Buffer.from(a);
  const bBuf = Buffer.from(b);
  if (aBuf.length !== bBuf.length) {
    // Compare equal-length buffers anyway, then return false.
    const dummy = Buffer.alloc(aBuf.length);
    timingSafeEqual(aBuf, dummy);
    return false;
  }
  return timingSafeEqual(aBuf, bBuf);
}
