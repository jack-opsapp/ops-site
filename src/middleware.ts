/**
 * Locale routing middleware.
 *
 * URL structure:
 *   - English (default): /foo
 *   - Spanish:           /es/foo
 *
 * Flow:
 *   1. Request hits /es/<path>           → rewrite internally to /<path>
 *                                          + set x-locale=es header
 *                                          + sync ops-lang cookie to 'es'
 *   2. Request hits /<path> with cookie=es
 *                                        → 308 redirect to /es/<path>
 *                                          (keeps URL in sync with locale
 *                                           so internal English-relative
 *                                           links don't strand a Spanish
 *                                           user on English content)
 *   3. Otherwise (English)               → pass through
 *                                          + set x-locale=en header
 *
 * Server components read `x-locale` via headers() in getLocale().
 * Pages that call getLocale() opt into dynamic rendering; Spanish pages
 * are cached via ISR on first hit. The English variants remain SSG.
 */

import { NextRequest, NextResponse } from 'next/server';
import { COOKIE_NAME, COOKIE_MAX_AGE } from '@/i18n/config';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // --- Spanish-prefixed URL ---
  if (pathname === '/es' || pathname.startsWith('/es/')) {
    const internalPath = pathname === '/es' ? '/' : pathname.slice(3);

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
    return response;
  }

  // --- Unprefixed URL, but the visitor's saved preference is Spanish ---
  const cookieLocale = request.cookies.get(COOKIE_NAME)?.value;
  if (cookieLocale === 'es') {
    const url = request.nextUrl.clone();
    url.pathname = pathname === '/' ? '/es' : `/es${pathname}`;
    return NextResponse.redirect(url, 308);
  }

  // --- Default: English ---
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-locale', 'en');
  requestHeaders.set('x-pathname', pathname);
  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  /**
   * Exclude API routes, Next.js internals, the metadata routes
   * (sitemap.xml, robots.txt) and any path with a file extension
   * (favicons, images, fonts, the IndexNow key file at the root).
   */
  matcher: ['/((?!api|_next/static|_next/image|_vercel|sitemap.xml|robots.txt|.*\\..*).*)'],
};
