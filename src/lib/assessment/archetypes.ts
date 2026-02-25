/**
 * Leadership Assessment — Archetype Matching Engine
 *
 * Pure-math module that matches a user's ScoreProfile to the closest
 * ArchetypeProfile using weighted cosine similarity with red-flag penalties.
 */

import type { Dimension, ScoreProfile, SimpleScores, ArchetypeProfile } from './types';
import { DIMENSIONS } from './types';

/* ------------------------------------------------------------------ */
/*  Cosine Similarity                                                  */
/* ------------------------------------------------------------------ */

/**
 * Cosine similarity between two equal-length numeric vectors.
 *
 * If `weights` is provided, each dimension i is scaled by weights[i]
 * before the dot-product and magnitude calculations:
 *   a'[i] = a[i] * w[i],  b'[i] = b[i] * w[i]
 *   sim = dot(a', b') / (|a'| * |b'|)
 *
 * Returns a value in [-1, 1].  Returns 0 when either magnitude is 0.
 */
export function cosineSimilarity(
  a: number[],
  b: number[],
  weights?: number[],
): number {
  const n = a.length;

  let dot = 0;
  let magA = 0;
  let magB = 0;

  for (let i = 0; i < n; i++) {
    const w = weights ? weights[i] : 1;
    const ai = a[i] * w;
    const bi = b[i] * w;
    dot += ai * bi;
    magA += ai * ai;
    magB += bi * bi;
  }

  const denom = Math.sqrt(magA) * Math.sqrt(magB);
  if (denom === 0) return 0;
  return dot / denom;
}

/* ------------------------------------------------------------------ */
/*  Profile → Vector                                                   */
/* ------------------------------------------------------------------ */

/**
 * Converts a SimpleScores record into a 6-element array ordered by DIMENSIONS:
 * [drive, resilience, vision, connection, adaptability, integrity]
 */
export function profileToVector(scores: SimpleScores): number[] {
  return DIMENSIONS.map((dim: Dimension) => scores[dim]);
}

/* ------------------------------------------------------------------ */
/*  Red-Flag Penalties                                                 */
/* ------------------------------------------------------------------ */

/**
 * For each archetype, checks every dimension's red_flags thresholds against
 * the user's actual score. Each triggered flag subtracts 0.15 from that
 * archetype's similarity. Multiple flags stack, but the score floors at 0.
 *
 * A red flag is triggered when:
 *   - red_flags[dim].below exists AND user score < that threshold
 *   - red_flags[dim].above exists AND user score > that threshold
 *
 * Uses the `.score` property from the full ScoreProfile (not confidence).
 */
export function applyRedFlagPenalties(
  similarities: Map<string, number>,
  scoreProfile: ScoreProfile,
  archetypes: ArchetypeProfile[],
): Map<string, number> {
  const PENALTY = 0.15;

  for (const archetype of archetypes) {
    let sim = similarities.get(archetype.id);
    if (sim === undefined) continue;

    for (const dim of DIMENSIONS) {
      const flags = archetype.red_flags[dim];
      if (!flags) continue;

      const userScore = scoreProfile[dim].score;

      if (flags.below !== undefined && userScore < flags.below) {
        sim -= PENALTY;
      }
      if (flags.above !== undefined && userScore > flags.above) {
        sim -= PENALTY;
      }
    }

    similarities.set(archetype.id, Math.max(0, sim));
  }

  return similarities;
}

/* ------------------------------------------------------------------ */
/*  Full Matching Pipeline                                             */
/* ------------------------------------------------------------------ */

export interface MatchResult {
  primary: string;
  secondary: string;
  similarities: Record<string, number>;
  needs_tiebreak: boolean;
}

/**
 * Full archetype matching pipeline:
 *
 * 1. Extract simple scores (just the `.score` values) from the ScoreProfile.
 * 2. Convert to a vector using profileToVector.
 * 3. For each archetype, convert its ideal_scores to a vector and compute
 *    cosine similarity weighted by the user's per-dimension confidence.
 * 4. Apply red-flag penalties.
 * 5. Sort by descending similarity.
 * 6. Primary = highest, secondary = second highest.
 * 7. If the top two are within 0.05 of each other, set needs_tiebreak = true.
 */
export function matchArchetype(
  scoreProfile: ScoreProfile,
  archetypes: ArchetypeProfile[],
): MatchResult {
  // Step 1 — extract simple scores from the full profile
  const simpleScores: SimpleScores = {} as SimpleScores;
  for (const dim of DIMENSIONS) {
    simpleScores[dim] = scoreProfile[dim].score;
  }

  // Step 2 — convert user scores to vector
  const userVector = profileToVector(simpleScores);

  // Build confidence weights vector (same DIMENSIONS order)
  const confidenceWeights = DIMENSIONS.map((dim: Dimension) => scoreProfile[dim].confidence);

  // Step 3 — compute weighted cosine similarity for each archetype
  const similarityMap = new Map<string, number>();
  for (const archetype of archetypes) {
    const archetypeVector = profileToVector(archetype.ideal_scores);
    const sim = cosineSimilarity(userVector, archetypeVector, confidenceWeights);
    similarityMap.set(archetype.id, sim);
  }

  // Step 4 — apply red-flag penalties
  applyRedFlagPenalties(similarityMap, scoreProfile, archetypes);

  // Step 5 — sort by similarity descending
  const sorted = Array.from(similarityMap.entries()).sort((a, b) => b[1] - a[1]);

  // Step 6 — primary = highest, secondary = second highest
  const primary = sorted[0][0];
  const secondary = sorted.length > 1 ? sorted[1][0] : sorted[0][0];

  // Step 7 — tiebreak check (within 0.05)
  const needs_tiebreak =
    sorted.length > 1 && Math.abs(sorted[0][1] - sorted[1][1]) <= 0.05;

  // Build plain-object similarities record
  const similarities: Record<string, number> = {};
  similarityMap.forEach((score, id) => {
    similarities[id] = score;
  });

  return { primary, secondary, similarities, needs_tiebreak };
}
