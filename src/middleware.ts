/**
 * Locale routing middleware.
 *
 * URL structure:
 *   - English (default): /foo
 *   - Spanish:           /es/foo   — only for routes with fully-translated
 *                                    Spanish content (see TRANSLATED_PATHS
 *                                    in src/i18n/server.ts)
 *
 * Flow:
 *   1. /es/<translated path>
 *        → rewrite internally to /<path>
 *        → set x-locale=es header
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
 *        → pass through with x-locale=en
 *
 * Server components read `x-locale` via headers() in getLocale(). Pages
 * that read getLocale() opt into dynamic rendering; translated Spanish
 * pages cache via ISR after first hit.
 */

import { NextRequest, NextResponse } from 'next/server';
import { COOKIE_NAME, COOKIE_MAX_AGE } from '@/i18n/config';
import {
  maybeBuildFirstTouchPayload,
  readAttributionFromRequest,
  writeAttributionCookie,
} from '@/lib/spec/attribution';

// Mirror of TRANSLATED_PATHS in src/i18n/server.ts — kept here as a
// constant rather than imported because middleware runs in the Edge
// runtime and importing from server.ts could pull in headers()/cookies()
// transitively, which middleware can't use.
const TRANSLATED_PATHS = new Set<string>([
  '/',
  '/platform',
  '/plans',
  '/spec',
  '/company',
  '/resources',
  '/tools',
  '/shop',
]);

function isTranslated(pathname: string): boolean {
  return TRANSLATED_PATHS.has(pathname);
}

function withAttributionCookie(request: NextRequest, response: NextResponse): NextResponse {
  const payload = maybeBuildFirstTouchPayload(
    request.nextUrl,
    readAttributionFromRequest(request),
  );
  if (payload) writeAttributionCookie(response, payload);
  return response;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // --- Spanish-prefixed URL ---
  if (pathname === '/es' || pathname.startsWith('/es/')) {
    const internalPath = pathname === '/es' ? '/' : pathname.slice(3);

    // Untranslated route: /es/<path> doesn't really serve Spanish — redirect
    // to the English URL rather than rendering English content under a /es URL.
    if (!isTranslated(internalPath)) {
      const url = request.nextUrl.clone();
      url.pathname = internalPath;
      return withAttributionCookie(request, NextResponse.redirect(url, 308));
    }

    // Translated route: rewrite internally with the locale header + cookie sync.
    const url = request.nextUrl.clone();
    url.pathname = internalPath;

    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-locale', 'es');
    requestHeaders.set('x-pathname', pathname);

    const response = NextResponse.rewrite(url, {
      request: { headers: requestHeaders },
    });
    response.cookies.set(COOKIE_NAME, 'es', {
      path: '/',
      maxAge: COOKIE_MAX_AGE,
      sameSite: 'lax',
    });
    return withAttributionCookie(request, response);
  }

  // --- Unprefixed URL with cookie=es ---
  // Only redirect to /es when the route actually has a Spanish version.
  const cookieLocale = request.cookies.get(COOKIE_NAME)?.value;
  if (cookieLocale === 'es' && isTranslated(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = pathname === '/' ? '/es' : `/es${pathname}`;
    return withAttributionCookie(request, NextResponse.redirect(url, 308));
  }

  // --- Default: English ---
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-locale', 'en');
  requestHeaders.set('x-pathname', pathname);
  return withAttributionCookie(
    request,
    NextResponse.next({ request: { headers: requestHeaders } }),
  );
}

export const config = {
  /**
   * Exclude API routes, Next.js internals, the metadata routes
   * (sitemap.xml, robots.txt) and any path with a file extension
   * (favicons, images, fonts, the IndexNow key file at the root).
   */
  matcher: ['/((?!api|_next/static|_next/image|_vercel|sitemap.xml|robots.txt|.*\\..*).*)'],
};
