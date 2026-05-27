/**
 * Resolve the currently signed-in OPS user for a Next.js request,
 * reading from any of the supported auth carriers:
 *   1. `Authorization: Bearer <token>` header (when the client attaches it)
 *   2. `__session` cookie (Firebase Hosting / cross-subdomain convention)
 *   3. `ops-auth-token` cookie (OPS-Web convention)
 *   4. `sb-<ref>-auth-token` cookie (Supabase Auth SSR convention)
 *
 * The verified token is matched against `public.users` via the
 * auth_id → firebase_uid → email fallback chain. Returns null when
 * unauthenticated or the user row is missing.
 *
 * Server-only — never import from client code.
 */

import type { NextRequest } from 'next/server';
import { cookies as nextCookies, headers as nextHeaders } from 'next/headers';
import { verifyAuthToken, type VerifiedUser } from './verify-token';
import { findUserByAuth } from './find-user-by-auth';

export interface CurrentUser {
  id: string;
  email: string | null;
  companyId: string | null;
  verified: VerifiedUser;
}

const COOKIE_NAMES_PRIORITY = ['__session', 'ops-auth-token'];

/**
 * Extract an auth token from a NextRequest (used in API route handlers).
 */
function getTokenFromRequest(req: NextRequest): string | null {
  const auth = req.headers.get('authorization');
  if (auth?.toLowerCase().startsWith('bearer ')) {
    return auth.slice(7).trim();
  }
  for (const name of COOKIE_NAMES_PRIORITY) {
    const value = req.cookies.get(name)?.value;
    if (value) return value;
  }
  // Supabase SSR cookie naming: `sb-<project-ref>-auth-token`
  for (const cookie of req.cookies.getAll()) {
    if (cookie.name.startsWith('sb-') && cookie.name.endsWith('-auth-token')) {
      return parseSupabaseCookie(cookie.value);
    }
  }
  return null;
}

/**
 * Extract an auth token from the current Server Component request scope
 * (cookies() + headers()).
 */
async function getTokenFromServerContext(): Promise<string | null> {
  try {
    const headerStore = await nextHeaders();
    const auth = headerStore.get('authorization');
    if (auth?.toLowerCase().startsWith('bearer ')) {
      return auth.slice(7).trim();
    }
  } catch {
    // Outside a request scope — fall through to cookies()
  }

  try {
    const cookieStore = await nextCookies();
    for (const name of COOKIE_NAMES_PRIORITY) {
      const value = cookieStore.get(name)?.value;
      if (value) return value;
    }
    for (const cookie of cookieStore.getAll()) {
      if (cookie.name.startsWith('sb-') && cookie.name.endsWith('-auth-token')) {
        return parseSupabaseCookie(cookie.value);
      }
    }
  } catch {
    return null;
  }
  return null;
}

/**
 * Supabase SSR cookies are stored as JSON-encoded session objects.
 * We extract the `access_token` field; if the cookie isn't JSON we treat
 * it as the raw token directly.
 */
function parseSupabaseCookie(raw: string): string | null {
  try {
    const decoded = decodeURIComponent(raw);
    const parsed = JSON.parse(decoded);
    if (typeof parsed === 'string') return parsed;
    if (Array.isArray(parsed)) {
      // older format: [access_token, refresh_token]
      const head = parsed[0];
      return typeof head === 'string' ? head : null;
    }
    if (parsed && typeof parsed === 'object') {
      const token = (parsed as Record<string, unknown>).access_token;
      return typeof token === 'string' ? token : null;
    }
  } catch {
    return raw;
  }
  return null;
}

async function resolveUser(token: string): Promise<CurrentUser | null> {
  let verified: VerifiedUser;
  try {
    verified = await verifyAuthToken(token);
  } catch {
    return null;
  }

  const userRow = await findUserByAuth(
    verified.uid,
    verified.email,
    'id, company_id, email',
  );
  if (!userRow) return null;

  return {
    id: String(userRow.id),
    email: typeof userRow.email === 'string' ? userRow.email : verified.email ?? null,
    companyId: typeof userRow.company_id === 'string' ? userRow.company_id : null,
    verified,
  };
}

/** Server Component / generateMetadata helper. */
export async function getCurrentUserFromServerContext(): Promise<CurrentUser | null> {
  const token = await getTokenFromServerContext();
  if (!token) return null;
  return resolveUser(token);
}

/** Route Handler helper. */
export async function getCurrentUserFromRequest(req: NextRequest): Promise<CurrentUser | null> {
  const token = getTokenFromRequest(req);
  if (!token) return null;
  return resolveUser(token);
}

/**
 * Build the OPS-Web sign-in URL with a `returnTo` pointing back to the
 * given relative path on ops-site. Reads `NEXT_PUBLIC_OPS_WEB_URL` for the
 * OPS-Web origin; falls back to `https://opsapp.co` (same-origin assumption).
 */
export function buildOpsWebSignInUrl(opsSiteReturnPath: string): string {
  const opsWebBase =
    process.env.NEXT_PUBLIC_OPS_WEB_URL?.replace(/\/$/, '') ?? '';
  const opsSiteBase =
    process.env.NEXT_PUBLIC_OPS_SITE_URL?.replace(/\/$/, '') ?? 'https://opsapp.co';

  const returnUrl = opsSiteReturnPath.startsWith('http')
    ? opsSiteReturnPath
    : `${opsSiteBase}${opsSiteReturnPath.startsWith('/') ? '' : '/'}${opsSiteReturnPath}`;

  if (!opsWebBase) {
    // Same-origin deployment: ops-site and OPS-Web share the host.
    return `/login?returnTo=${encodeURIComponent(opsSiteReturnPath)}`;
  }
  return `${opsWebBase}/login?returnTo=${encodeURIComponent(returnUrl)}`;
}
