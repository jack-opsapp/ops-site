/**
 * Leadership Assessment — Demo / Element Testbed (Server Shell)
 *
 * Route: /tools/leadership/demo
 *
 * Server component that exports page metadata and renders the client-side
 * testbed. Internal/dev-only — noindex.
 */

import type { Metadata } from 'next';
import DemoClient from './DemoClient';
import { setRequestLocale } from '@/i18n/server';
import { routeMetadata } from '@/lib/seo/site-metadata';

export const metadata: Metadata = {
  // og:url + canonical for this path (the static root layout cannot see it).
  ...routeMetadata('/tools/leadership/demo', 'en'),
  title: 'Assessment Component Testbed',
  description: 'Internal dev preview for leadership assessment components.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function LeadershipDemoPage() {
  setRequestLocale('en');
  return <DemoClient />;
}
