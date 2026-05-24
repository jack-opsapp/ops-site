/**
 * Assessment Flow Route — /tools/leadership/assess (Server Shell)
 *
 * Server component that exports page metadata and renders the
 * interactive assessment flow on the client. The flow itself is
 * an in-product experience — not a public content surface — so the
 * page is excluded from indexing. The intro page at /tools/leadership
 * is the indexable landing for this funnel.
 */

import type { Metadata } from 'next';
import AssessClient from './AssessClient';

export const metadata: Metadata = {
  title: 'Leadership Assessment',
  description: 'Take the OPS leadership assessment. AI-powered scoring for trades business owners and crew leads.',
  robots: {
    index: false,
    follow: true,
  },
};

export default function AssessPage() {
  return <AssessClient />;
}
