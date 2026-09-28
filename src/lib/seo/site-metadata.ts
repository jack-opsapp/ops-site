/**
 * Site-level metadata for the two root layouts, and the per-route fields
 * the root layout used to derive from the request path.
 *
 * The root layouts are static: they know their locale but not which page
 * they wrap. Everything sitewide lives in siteMetadata(); a page whose
 * canonical and og:url used to come from the layout declares them with
 * routeMetadata(path, locale), which yields exactly what the layout
 * produced for that path.
 *
 * Next.js merges metadata shallowly per key, so a page that sets
 * `openGraph` replaces the layout's whole Open Graph object — routeMetadata
 * therefore spreads the sitewide fields back in.
 */

import type { Metadata } from 'next';
import type { Locale } from '@/i18n/types';
import { buildLocaleAlternates, buildLocaleUrl } from '@/i18n/routes';

type OpenGraph = NonNullable<Metadata['openGraph']>;

const OG_IMAGE_URL = 'https://opsapp.co/images/og-image.png';

export function siteOpenGraph(locale: Locale) {
  return {
    type: 'website',
    locale: locale === 'es' ? 'es_MX' : 'en_US',
    siteName: 'OPS',
    images: [
      {
        url: OG_IMAGE_URL,
        width: 1200,
        height: 630,
        alt: 'OPS — Job management built for trades crews',
      },
    ],
  } satisfies OpenGraph;
}

export function siteMetadata(locale: Locale): Metadata {
  return {
    metadataBase: new URL('https://opsapp.co'),
    title: {
      default: locale === 'es'
        ? 'OPS — Gestión de Trabajo para Equipos de Campo'
        : 'OPS — Job Management for Trades Crews',
      template: '%s | OPS',
    },
    description: locale === 'es'
      ? 'App de gestión de trabajo para negocios de servicio y equipos de campo. Seguimiento de proyectos, programación de equipos, documentación fotográfica y facturación. Sin entrenamiento necesario.'
      : 'Job management app for service-based businesses and field crews. Project tracking, crew scheduling, photo documentation, and invoicing. No training required — your crew opens it and knows what to do.',
    openGraph: siteOpenGraph(locale),
    twitter: {
      card: 'summary_large_image',
      images: [OG_IMAGE_URL],
    },
    // Color-scheme-aware SVG favicons. app/apple-icon.png + app/favicon.ico
    // auto-convention files remain as raster fallbacks.
    icons: {
      icon: [
        { url: '/brand/icon-light.svg', media: '(prefers-color-scheme: light)', type: 'image/svg+xml' },
        { url: '/brand/icon-dark.svg', media: '(prefers-color-scheme: dark)', type: 'image/svg+xml' },
      ],
    },
  };
}

/**
 * The Open Graph URL and canonical/hreflang for one route — for pages that
 * do not otherwise set them. `path` is the canonical English path.
 */
export function routeMetadata(path: string, locale: Locale) {
  return {
    openGraph: { ...siteOpenGraph(locale), url: buildLocaleUrl(path, locale) },
    alternates: buildLocaleAlternates(path, locale),
  } satisfies Metadata;
}
