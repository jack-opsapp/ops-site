/**
 * Leadership Assessment — Adaptive Selection Engine
 *
 * Selects the next chunk of 5 questions using a combination of
 * deterministic logic (seed chunk / fallback) and AI-powered selection
 * (OpenAI gpt-4o for adaptive chunks).
 */

import type {
  ScoreProfile,
  PoolQuestion,
  ValidityFlags,
  AssessmentVersion,
  Dimension,
} from './types';
import { DIMENSIONS } from './types';
import { openai } from '../openai';

/* ------------------------------------------------------------------ */
/*  1. selectSeedChunk                                                 */
/* ------------------------------------------------------------------ */

/**
 * Deterministic first-chunk selection (no AI needed).
 *
 * 1. Filter pool by version_availability.
 * 2. Pick 1 question per dimension (6 candidates).
 * 3. Drop the one from the dimension with the most available items.
 * 4. Ensure at least 1 situational or forced_choice item (swap if needed).
 * 5. Sort by difficulty ascending (start easy).
 * 6. Return the 5 selected PoolQuestion objects.
 */
export function selectSeedChunk(
  pool: PoolQuestion[],
  version: AssessmentVersion,
): PoolQuestion[] {
  // Filter by version availability
  const available = pool.filter((q) =>
    q.version_availability.includes(version),
  );

  // Pick 1 question per dimension — prefer lower difficulty for seed
  const candidates: PoolQuestion[] = [];
  const dimensionCounts = new Map<Dimension, number>();

  for (const dim of DIMENSIONS) {
    const dimQuestions = available.filter((q) => q.dimension === dim);
    dimensionCounts.set(dim, dimQuestions.length);

    if (dimQuestions.length > 0) {
      // Pick the easiest question for this dimension
      const sorted = [...dimQuestions].sort(
        (a, b) => a.difficulty - b.difficulty,
      );
      candidates.push(sorted[0]);
    }
  }

  // If we have fewer than 6 candidates, return what we have (up to 5)
  if (candidates.length <= 5) {
    return candidates
      .sort((a, b) => a.difficulty - b.difficulty)
      .slice(0, 5);
  }

  // Drop the one from the dimension with the most available items
  let maxCount = -1;
  let dropDimension: Dimension = DIMENSIONS[0];
  for (const dim of DIMENSIONS) {
    const count = dimensionCounts.get(dim) ?? 0;
    if (count > maxCount) {
      maxCount = count;
      dropDimension = dim;
    }
  }

  const fiveSelected = candidates.filter(
    (q) => q.dimension !== dropDimension,
  );

  // Ensure at least 1 non-likert item (situational or forced_choice)
  const hasNonLikert = fiveSelected.some((q) => q.type !== 'likert');

  if (!hasNonLikert) {
    // Find a non-likert item from the available pool that isn't already selected
    const selectedIds = new Set(fiveSelected.map((q) => q.id));
    const nonLikertCandidates = available.filter(
      (q) =>
        !selectedIds.has(q.id) &&
        (q.type === 'situational' || q.type === 'forced_choice'),
    );

    if (nonLikertCandidates.length > 0) {
      // Sort by difficulty ascending — pick the easiest non-likert
      nonLikertCandidates.sort((a, b) => a.difficulty - b.difficulty);
      const replacement = nonLikertCandidates[0];

      // Swap out the likert with the lowest difficulty (least informative for seed)
      // Actually, swap out the one with the highest difficulty since we want easy start
      const likertItems = [...fiveSelected]
        .filter((q) => q.type === 'likert')
        .sort((a, b) => b.difficulty - a.difficulty);

      if (likertItems.length > 0) {
        const toRemove = likertItems[0]; // highest-difficulty likert
        const removeIdx = fiveSelected.findIndex(
          (q) => q.id === toRemove.id,
        );
        if (removeIdx !== -1) {
          fiveSelected[removeIdx] = replacement;
        }
      }
    }
  }

  // Sort by difficulty ascending (start easy)
  fiveSelected.sort((a, b) => a.difficulty - b.difficulty);

  return fiveSelected;
}

/* ------------------------------------------------------------------ */
/*  2. selectNextChunk                                                 */
/* ------------------------------------------------------------------ */

/**
 * Calls OpenAI gpt-4o to select the next 5 questions that will most
 * reduce uncertainty in the respondent's leadership profile.
 *
 * Falls back to deterministic selection if OpenAI fails or returns
 * an invalid response.
 */
export async function selectNextChunk(params: {
  scoreProfile: ScoreProfile;
  answeredIds: string[];
  pool: PoolQuestion[];
  version: AssessmentVersion;
  chunkNumber: number;
  totalChunks: number;
  validityFlags: ValidityFlags | null;
}): Promise<{ questionIds: string[]; reasoning: string }> {
  const {
    scoreProfile,
    answeredIds,
    pool,
    version,
    chunkNumber,
    totalChunks,
    validityFlags,
  } = params;

  // Build available pool (not yet answered, correct version)
  const answeredSet = new Set(answeredIds);
  const availablePool = pool.filter(
    (q) =>
      !answeredSet.has(q.id) && q.version_availability.includes(version),
  );

  if (availablePool.length <= 5) {
    // Not enough questions to choose from — return what's available
    return {
      questionIds: availablePool.map((q) => q.id),
      reasoning: 'Fewer than 5 questions remaining; returning all available.',
    };
  }

  // Build the system prompt
  const systemPrompt = `You are a psychometric assessment engine. Select the next 5 questions that will most reduce uncertainty in the respondent's leadership profile.

Selection priorities (in order):
1. REDUCE MAXIMUM UNCERTAINTY: Target dimensions with the highest standard error.
2. RESOLVE ARCHETYPE AMBIGUITY: If scores could map to 2-3 archetypes roughly equally, pick questions that differentiate between those archetypes.
3. CROSS-VALIDATE: Include at least 1 question re-testing a dimension where confidence is moderate but based on few items.
4. MIX QUESTION TYPES: Don't select 5 of the same type. Include at least 1 non-likert item.
5. DETECT GAMING: If response patterns suggest social desirability bias, include subtle forced-choice items.

Return a JSON object: { "selected_ids": ["id1", "id2", "id3", "id4", "id5"], "reasoning": "brief explanation" }`;

  // Build the user message payload
  const currentScores: Record<
    string,
    { score: number; confidence: number; standard_error: number; responses_count: number }
  > = {};
  for (const dim of DIMENSIONS) {
    const d = scoreProfile[dim];
    currentScores[dim] = {
      score: d.score,
      confidence: d.confidence,
      standard_error: d.standard_error,
      responses_count: d.responses_count,
    };
  }

  const availablePoolSummary = availablePool.map((q) => ({
    id: q.id,
    dimension: q.dimension,
    secondary_dimension: q.secondary_dimension,
    type: q.type,
    difficulty: q.difficulty,
  }));

  const userPayload = {
    current_scores: currentScores,
    answered_ids: answeredIds,
    available_pool: availablePoolSummary,
    chunk_number: chunkNumber,
    total_chunks: totalChunks,
    chunks_remaining: totalChunks - chunkNumber,
    validity_flags: validityFlags,
  };

  try {
    // 8-second timeout via AbortController
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const response = await openai.chat.completions.create(
      {
        model: 'gpt-4o',
        temperature: 0,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: JSON.stringify(userPayload) },
        ],
      },
      { signal: controller.signal },
    );

    clearTimeout(timeoutId);

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('Empty response from OpenAI');
    }

    const parsed = JSON.parse(content) as {
      selected_ids?: string[];
      reasoning?: string;
    };

    // Validate: must have exactly 5 IDs and all must be in available pool
    const availableIds = new Set(availablePool.map((q) => q.id));

    if (
      !Array.isArray(parsed.selected_ids) ||
      parsed.selected_ids.length !== 5 ||
      !parsed.selected_ids.every((id) => availableIds.has(id))
    ) {
      // Invalid response — fall back to deterministic
      const fallbackIds = deterministicFallback(scoreProfile, availablePool);
      return {
        questionIds: fallbackIds,
        reasoning:
          'AI returned invalid selection; used deterministic fallback.',
      };
    }

    return {
      questionIds: parsed.selected_ids,
      reasoning: parsed.reasoning ?? 'AI selection (no reasoning provided).',
    };
  } catch (error) {
    // Any failure (timeout, parse error, network) — fall back to deterministic
    const fallbackIds = deterministicFallback(scoreProfile, availablePool);
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    return {
      questionIds: fallbackIds,
      reasoning: `AI selection failed (${errorMessage}); used deterministic fallback.`,
    };
  }
}

/* ------------------------------------------------------------------ */
/*  3. deterministicFallback                                           */
/* ------------------------------------------------------------------ */

/**
 * Fallback selection when OpenAI is unavailable or returns invalid data.
 *
 * 1. Rank dimensions by standard error (highest SE = most uncertainty).
 * 2. For each available question, compute "information value":
 *      difficulty * (1 if targeting highest-SE dim, 0.5 if second-highest, 0.25 otherwise)
 * 3. Sort by information value descending.
 * 4. Ensure type mixing: if top 5 are all likert, swap the lowest-value
 *    one for the highest-value non-likert.
 * 5. Return 5 question IDs.
 */
export function deterministicFallback(
  scoreProfile: ScoreProfile,
  pool: PoolQuestion[],
): string[] {
  // Rank dimensions by standard error (highest first)
  const dimsBySE = [...DIMENSIONS].sort(
    (a, b) => scoreProfile[b].standard_error - scoreProfile[a].standard_error,
  );

  const highestSEDim = dimsBySE[0];
  const secondHighestSEDim = dimsBySE[1];

  // Compute information value for each question
  const scored = pool.map((q) => {
    let multiplier = 0.25;
    if (q.dimension === highestSEDim) {
      multiplier = 1;
    } else if (q.dimension === secondHighestSEDim) {
      multiplier = 0.5;
    }

    const informationValue = q.difficulty * multiplier;
    return { question: q, informationValue };
  });

  // Sort by information value descending
  scored.sort((a, b) => b.informationValue - a.informationValue);

  // Take top 5
  const top5 = scored.slice(0, 5);

  // Ensure type mixing: if all 5 are likert, swap lowest-value for highest-value non-likert
  const allLikert = top5.every((item) => item.question.type === 'likert');

  if (allLikert) {
    // Find the highest-value non-likert not already in top5
    const top5Ids = new Set(top5.map((item) => item.question.id));
    const nonLikertCandidates = scored.filter(
      (item) =>
        !top5Ids.has(item.question.id) && item.question.type !== 'likert',
    );

    if (nonLikertCandidates.length > 0) {
      // nonLikertCandidates is already sorted by informationValue desc
      const bestNonLikert = nonLikertCandidates[0];

      // Swap out the lowest-value item in top5
      // top5 is sorted desc, so lowest is last
      top5[top5.length - 1] = bestNonLikert;
    }
  }

  return top5.map((item) => item.question.id);
}
