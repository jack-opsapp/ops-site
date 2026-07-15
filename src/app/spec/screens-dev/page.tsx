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

export const metadata: Metadata = {
  title: 'SPEC Screens — Dev',
  description: 'Internal dev preview for SPEC phone-scene canvases.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function SpecScreensDevPage() {
  return <SpecScreensDevClient />;
}
