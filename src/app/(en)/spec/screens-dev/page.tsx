/**
 * SPEC Screens — Dev Preview (Server Shell)
 *
 * Route: /spec/screens-dev
 *
 * Internal dev tool for previewing the Canvas 2D SPEC phone-scene screens
 * at progress=1. Noindex — also blocked in robots.ts. A client component
 * cannot export `metadata`, so this server shell owns the noindex robots
 * tag and renders the interactive client preview.
 */

import type { Metadata } from 'next';
import SpecScreensDevClient from './SpecScreensDevClient';
import { setRequestLocale } from '@/i18n/server';
import { routeMetadata } from '@/lib/seo/site-metadata';

export const metadata: Metadata = {
  // og:url + canonical for this path (the static root layout cannot see it).
  ...routeMetadata('/spec/screens-dev', 'en'),
  title: 'SPEC Screens — Dev',
  description: 'Internal dev preview for SPEC phone-scene canvases.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function SpecScreensDevPage() {
  setRequestLocale('en');
  return <SpecScreensDevClient />;
}
