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

export const metadata: Metadata = {
  title: 'Assessment Component Testbed',
  description: 'Internal dev preview for leadership assessment components.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function LeadershipDemoPage() {
  return <DemoClient />;
}
