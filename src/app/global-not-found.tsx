/**
 * Unmatched URLs — the full 404 page, server-rendered inside the English
 * site shell and prerendered once at build time.
 *
 * With two root layouts ((en) and (es)) there is no app-wide not-found
 * boundary; global-not-found renders its own document for every URL no
 * route claims (enabled by `experimental.globalNotFound` in next.config.ts).
 * notFound() thrown inside a page still renders that group's not-found.tsx.
 */

import type { Metadata } from 'next';
import SiteDocument from '@/components/layout/SiteDocument';
import NotFoundContent from '@/components/shared/NotFoundContent';
import { setRequestLocale } from '@/i18n/server';
import { siteMetadata } from '@/lib/seo/site-metadata';

// Same refresh window as the root layouts: the navigation's store-live
// flag is read while rendering.
export const revalidate = 300;

export const metadata: Metadata = siteMetadata('en');

export default function GlobalNotFound() {
  setRequestLocale('en');
  return (
    <SiteDocument locale="en">
      <NotFoundContent />
    </SiteDocument>
  );
}
