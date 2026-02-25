/**
 * ResultsSphereSection — Client wrapper for LeadershipSphere on results page
 *
 * Wraps the LeadershipSphere component (which requires 'use client')
 * for use inside the server component results page.
 */

'use client';

import LeadershipSphere from '@/components/assessment/LeadershipSphere';
import type { SimpleScores, DimensionSubScores, Dimension } from '@/lib/assessment/types';

interface ResultsSphereSectionProps {
  scores: SimpleScores;
  subScores?: DimensionSubScores;
  dimensionDescriptions?: Record<Dimension, string>;
}

export default function ResultsSphereSection({
  scores,
  subScores,
  dimensionDescriptions,
}: ResultsSphereSectionProps) {
  return (
    <LeadershipSphere
      scores={scores}
      subScores={subScores}
      dimensionDescriptions={dimensionDescriptions}
      className="w-full h-full"
    />
  );
}
