/**
 * Assessment Flow Route — /tools/leadership/assess
 *
 * Client component that reads ?version= from URL and mounts
 * the full assessment flow. Defaults to 'quick' if no version specified.
 */

'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import AssessmentFlow from '@/components/assessment/AssessmentFlow';
import type { AssessmentVersion } from '@/lib/assessment/types';

function AssessmentContent() {
  const searchParams = useSearchParams();
  const versionParam = searchParams.get('version');
  const version: AssessmentVersion =
    versionParam === 'deep' ? 'deep' : 'quick';

  return <AssessmentFlow version={version} />;
}

export default function AssessPage() {
  return (
    <Suspense
      fallback={
        <div className="fixed inset-0 z-50 bg-ops-background flex items-center justify-center">
          <p className="font-caption text-xs uppercase tracking-[0.2em] text-ops-text-secondary">
            Loading...
          </p>
        </div>
      }
    >
      <AssessmentContent />
    </Suspense>
  );
}
