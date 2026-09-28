/**
 * Site-level metadata — what every page inherits from its root layout, and
 * the per-route fields pages declare themselves now that the root layout is
 * static and cannot see the request path.
 *
 * The strings are pinned to the values the header-reading root layout
 * produced before the static-render change (production 60f9e03).
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { routeMetadata, siteMetadata, siteOpenGraph } from '../site-metadata';

const OG_IMAGE = {
  url: 'https://opsapp.co/images/og-image.png',
  width: 1200,
  height: 630,
  alt: 'OPS — Job management built for trades crews',
};

describe('siteOpenGraph', () => {
  it('carries the sitewide Open Graph fields without a page URL', () => {
    assert.deepEqual(siteOpenGraph('en'), {
      type: 'website',
      locale: 'en_US',
      siteName: 'OPS',
      images: [OG_IMAGE],
    });
    assert.equal(siteOpenGraph('es').locale, 'es_MX');
  });
});

describe('siteMetadata', () => {
  it('matches the English root metadata minus the path-derived fields', () => {
    const metadata = siteMetadata('en');
    assert.equal(String(metadata.metadataBase), 'https://opsapp.co/');
    assert.deepEqual(metadata.title, {
      default: 'OPS — Job Management for Trades Crews',
      template: '%s | OPS',
    });
    assert.equal(
      metadata.description,
      'Job management app for service-based businesses and field crews. Project tracking, crew scheduling, photo documentation, and invoicing. No training required — your crew opens it and knows what to do.',
    );
    assert.deepEqual(metadata.openGraph, siteOpenGraph('en'));
    assert.deepEqual(metadata.twitter, {
      card: 'summary_large_image',
      images: ['https://opsapp.co/images/og-image.png'],
    });
    assert.deepEqual(metadata.icons, {
      icon: [
        { url: '/brand/icon-light.svg', media: '(prefers-color-scheme: light)', type: 'image/svg+xml' },
        { url: '/brand/icon-dark.svg', media: '(prefers-color-scheme: dark)', type: 'image/svg+xml' },
      ],
    });
    assert.equal('alternates' in metadata, false);
  });

  it('matches the Spanish root metadata', () => {
    const metadata = siteMetadata('es');
    assert.deepEqual(metadata.title, {
      default: 'OPS — Gestión de Trabajo para Equipos de Campo',
      template: '%s | OPS',
    });
    assert.equal(
      metadata.description,
      'App de gestión de trabajo para negocios de servicio y equipos de campo. Seguimiento de proyectos, programación de equipos, documentación fotográfica y facturación. Sin entrenamiento necesario.',
    );
    assert.deepEqual(metadata.openGraph, siteOpenGraph('es'));
  });
});

describe('routeMetadata', () => {
  it('reproduces the layout-derived URL and canonical for an English-only route', () => {
    assert.deepEqual(routeMetadata('/shop/checkout', 'en'), {
      openGraph: { ...siteOpenGraph('en'), url: 'https://opsapp.co/shop/checkout' },
      alternates: { canonical: 'https://opsapp.co/shop/checkout' },
    });
  });

  it('keeps hreflang for a translated route', () => {
    assert.deepEqual(routeMetadata('/plans', 'es').alternates, {
      canonical: 'https://opsapp.co/es/plans',
      languages: {
        en: 'https://opsapp.co/plans',
        es: 'https://opsapp.co/es/plans',
        'x-default': 'https://opsapp.co/plans',
      },
    });
  });
});
