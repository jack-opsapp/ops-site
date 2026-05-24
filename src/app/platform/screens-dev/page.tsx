/**
 * Wireframe Screens — Dev Preview (Server Shell)
 *
 * Route: /platform/screens-dev
 *
 * Internal dev tool for previewing Canvas 2D wireframe screen output
 * alongside reference screenshots. Noindex — also blocked in robots.ts.
 */

import type { Metadata } from 'next';
import ScreensDevClient from './ScreensDevClient';

export const metadata: Metadata = {
  title: 'Wireframe Screens — Dev',
  description: 'Internal dev preview for platform wireframe canvases.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function ScreensDevPage() {
  return <ScreensDevClient />;
}
