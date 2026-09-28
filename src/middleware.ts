/**
 * Locale routing middleware.
 *
 * URL structure:
 *   - English (default): /foo      → src/app/(en)/foo
 *   - Spanish:           /es/foo   → src/app/(es)/es/foo — only for routes
 *                                    with fully-translated Spanish content
 *                                    (TRANSLATED_PATHS in src/i18n/routes.ts)
 *
 * Every URL is served by the route file at that same path; the middleware
 * never rewrites and never passes the locale to rendering. Pages know their
 * locale from their route group, so they render statically.
 *
 * Flow (rules in resolveLocaleRoute, src/i18n/routes.ts):
 *   1. /es/<translated path>
 *        → serve it
 *        → sync ops-lang cookie to 'es'
 *
 *   2. /es/<UNtranslated path>
 *        → 308 redirect to /<path>
 *        (No Spanish version exists, so don't pretend the URL serves one.)
 *
 *   3. /<translated path> with cookie=es
 *        → 308 redirect to /es/<path>
 *        (Keeps URL in sync with locale so internal English-relative
 *         <Link>s don't strand Spanish users.)
 *
 *   4. /<UNtranslated path> with cookie=es
 *        → pass through as English. Don't loop into /es/ for content that
 *          doesn't exist there.
 *
 *   5. Everything else
 *        → pass through (English)
 *
 * Every response also carries first-touch attribution (attachFirstTouch).
 */

import { NextRequest, NextResponse } from 'next/server';
import { COOKIE_NAME, COOKIE_MAX_AGE } from '@/i18n/config';
import { resolveLocaleRoute } from '@/i18n/routes';
import {
  FIRST_TOUCH_COOKIE_NAME,
  FIRST_TOUCH_MAX_AGE_SECONDS,
  LEGACY_ATTRIBUTION_COOKIE_NAME,
  resolveFirstTouch,
  serializeFirstTouchPayload,
} from '@/lib/analytics/first-touch';

function attachFirstTouch(
  request: NextRequest,
  response: NextResponse,
): NextResponse {
  const decision = resolveFirstTouch({
    canonicalValue: request.cookies.get(FIRST_TOUCH_COOKIE_NAME)?.value,
    legacyValue: request.cookies.get(LEGACY_ATTRIBUTION_COOKIE_NAME)?.value,
    url: request.nextUrl.toString(),
    referrer: request.headers.get('referer') ?? '',
    capturedAt: new Date().toISOString(),
    anonymousId: crypto.randomUUID(),
  });
  if (!decision.shouldWrite || !decision.payload) return response;

  const isOpsProductionHost =
    request.nextUrl.hostname === 'opsapp.co' ||
    request.nextUrl.hostname.endsWith('.opsapp.co');
  response.cookies.set({
    name: FIRST_TOUCH_COOKIE_NAME,
    value: serializeFirstTouchPayload(decision.payload),
    path: '/',
    domain: isOpsProductionHost ? '.opsapp.co' : undefined,
    maxAge: FIRST_TOUCH_MAX_AGE_SECONDS,
    sameSite: 'lax',
    secure: request.nextUrl.protocol === 'https:',
    httpOnly: false,
  });
  return response;
}

export function middleware(request: NextRequest) {
  const decision = resolveLocaleRoute(
    request.nextUrl.pathname,
    request.cookies.get(COOKIE_NAME)?.value,
  );

  if (decision.kind === 'redirect') {
    const url = request.nextUrl.clone();
    url.pathname = decision.pathname;
    return attachFirstTouch(request, NextResponse.redirect(url, 308));
  }

  const response = NextResponse.next();
  if (decision.kind === 'spanish') {
    response.cookies.set(COOKIE_NAME, 'es', {
      path: '/',
      maxAge: COOKIE_MAX_AGE,
      sameSite: 'lax',
    });
  }
  return attachFirstTouch(request, response);
}

export const config = {
  /**
   * Exclude API routes, Next.js internals, the metadata routes
   * (sitemap.xml, robots.txt) and any path with a file extension
   * (favicons, images, fonts, the IndexNow key file at the root).
   */
  matcher: ['/((?!api|_next/static|_next/image|_vercel|sitemap.xml|robots.txt|.*\\..*).*)'],
};
