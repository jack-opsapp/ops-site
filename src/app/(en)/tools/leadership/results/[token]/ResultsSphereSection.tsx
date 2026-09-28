/**
 * ResultsSphereSection — Client wrapper for LeadershipSphere on results page
 *
 * Wraps the LeadershipSphere component (which requires 'use client')
 * for use inside the server component results page.
 */

'use client';

import LeadershipSphere from '@/components/assessment/LeadershipSphere';
import type { SimpleScores, DimensionSubScores, Dimension, AssessmentVersion } from '@/lib/assessment/types';

interface ResultsSphereSectionProps {
  scores: SimpleScores;
  subScores?: DimensionSubScores;
  dimensionDescriptions?: Record<Dimension, string>;
  version?: AssessmentVersion;
}

export default function ResultsSphereSection({
  scores,
  subScores,
  dimensionDescriptions,
  version,
}: ResultsSphereSectionProps) {
  return (
    <LeadershipSphere
      scores={scores}
      subScores={subScores}
      dimensionDescriptions={dimensionDescriptions}
      version={version}
      className="w-full h-full"
    />
  );
}
