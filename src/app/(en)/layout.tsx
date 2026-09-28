/**
 * English root layout — every route except the Spanish pages under
 * src/app/(es)/es. Static: the locale comes from this route group, never
 * from the request, so pages below it prerender and refresh by ISR.
 */

import type { Metadata } from 'next';
import SiteDocument from '@/components/layout/SiteDocument';
import { setRequestLocale } from '@/i18n/server';
import { siteMetadata } from '@/lib/seo/site-metadata';

// Every page re-renders at most every 5 minutes, so data read while
// rendering (journal lists, related-journal rails, shop products, the
// store-live flag in the navigation) stays as fresh as it was when pages
// rendered per request. Journal writes also revalidate on demand through
// /api/revalidate/journal.
export const revalidate = 300;

export const metadata: Metadata = siteMetadata('en');

export default function EnglishRootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  setRequestLocale('en');
  return <SiteDocument locale="en">{children}</SiteDocument>;
}
