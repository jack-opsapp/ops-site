/**
 * Spanish root layout — the translated routes listed in TRANSLATED_PATHS
 * (src/i18n/routes.ts), served at /es/<path>. Static: the locale comes from
 * this route group, never from the request.
 */

import type { Metadata } from 'next';
import SiteDocument from '@/components/layout/SiteDocument';
import { setRequestLocale } from '@/i18n/server';
import { siteMetadata } from '@/lib/seo/site-metadata';

// Same refresh window as the English root layout.
export const revalidate = 300;

export const metadata: Metadata = siteMetadata('es');

export default function SpanishRootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  setRequestLocale('es');
  return <SiteDocument locale="es">{children}</SiteDocument>;
}
