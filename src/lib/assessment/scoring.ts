/**
 * Leadership Assessment — Bayesian Scoring Engine
 *
 * Pure-TypeScript math module. No external dependencies.
 */

import type {
  Dimension,
  ScoreProfile,
  DimensionScore,
  ValidityFlags,
  PoolQuestion,
} from './types';
import { DIMENSIONS } from './types';

/* ------------------------------------------------------------------ */
/*  1. initializeScoreProfile                                          */
/* ------------------------------------------------------------------ */

/**
 * Creates a blank score profile with uninformative priors for every
 * dimension.
 */
export function initializeScoreProfile(): ScoreProfile {
  const profile = {} as ScoreProfile;
  for (const dim of DIMENSIONS) {
    profile[dim] = {
      score: 50,
      confidence: 0.1,
      standard_error: 0.5,
      responses_count: 0,
      raw_sum: 0,
      max_possible: 0,
    };
  }
  return profile;
}

/* ------------------------------------------------------------------ */
/*  2. scoreResponse                                                   */
/* ------------------------------------------------------------------ */

/**
 * Scores a single response against a question's weights.
 *
 * - Likert (answer 1-5): looks up `question.scoring_weights[answerValue]`
 * - Situational / forced_choice: finds the matching option by key,
 *   then uses `option.scores`
 *
 * Returns raw score contribution per dimension from this single response.
 */
export function scoreResponse(
  question: PoolQuestion,
  answerValue: number | string,
): Record<Dimension, number> {
  const contributions: Record<Dimension, number> = {
    drive: 0,
    resilience: 0,
    vision: 0,
    connection: 0,
    adaptability: 0,
    integrity: 0,
  };

  if (question.type === 'likert') {
    const key = answerValue.toString();
    const weights = question.scoring_weights[key];
    if (weights) {
      for (const dim of DIMENSIONS) {
        if (weights[dim] !== undefined) {
          contributions[dim] = weights[dim]!;
        }
      }
    }
  } else {
    // situational or forced_choice
    const option = question.options?.find(
      (o) => o.key === answerValue.toString(),
    );
    if (option) {
      for (const dim of DIMENSIONS) {
        if (option.scores[dim] !== undefined) {
          contributions[dim] = option.scores[dim]!;
        }
      }
    }
  }

  return contributions;
}

/* ------------------------------------------------------------------ */
/*  3. updateProfile                                                   */
/* ------------------------------------------------------------------ */

/**
 * Bayesian update of a score profile with contributions from one item.
 *
 * Returns a NEW profile (immutable — never mutates the input).
 */
export function updateProfile(
  profile: ScoreProfile,
  scoreContributions: Record<Dimension, number>,
  itemDifficulty: number,
): ScoreProfile {
  const itemReliability = itemDifficulty; // 0-1

  // Deep-clone the incoming profile so we never mutate it.
  const next = {} as ScoreProfile;
  for (const dim of DIMENSIONS) {
    next[dim] = { ...profile[dim] };
  }

  for (const dim of DIMENSIONS) {
    const contribution = scoreContributions[dim];
    if (contribution === 0) continue; // no contribution — skip

    const prior = next[dim];

    const newScore =
      (prior.score * prior.confidence + contribution * itemReliability) /
      (prior.confidence + itemReliability);

    const newConfidence = Math.min(1.0, prior.confidence + itemReliability);

    const newCount = prior.responses_count + 1;

    const standardError = Math.sqrt(1 / (newCount + 1));

    next[dim] = {
      score: newScore,
      confidence: newConfidence,
      standard_error: standardError,
      responses_count: newCount,
      raw_sum: prior.raw_sum + contribution,
      max_possible: prior.max_possible + 100, // theoretical max per item
    };
  }

  return next;
}

/* ------------------------------------------------------------------ */
/*  4. scoreBatch                                                      */
/* ------------------------------------------------------------------ */

/**
 * Scores an entire batch of responses, folding them into a profile.
 */
export function scoreBatch(
  questions: PoolQuestion[],
  answers: { question_id: string; answer_value: number | string }[],
  existingProfile?: ScoreProfile,
): ScoreProfile {
  let profile = existingProfile ?? initializeScoreProfile();

  for (const answer of answers) {
    const question = questions.find((q) => q.id === answer.question_id);
    if (!question) continue; // skip unknown questions

    const contributions = scoreResponse(question, answer.answer_value);
    profile = updateProfile(profile, contributions, question.difficulty);
  }

  return profile;
}

/* ------------------------------------------------------------------ */
/*  5. computeValidityFlags                                            */
/* ------------------------------------------------------------------ */

/**
 * Computes validity / reliability indicators from all responses in a
 * session.
 */
export function computeValidityFlags(
  allResponses: {
    question_id: string;
    answer_value: number | string;
    response_time_ms: number | null;
  }[],
  questions: PoolQuestion[],
): ValidityFlags {
  /* ---------- inconsistency_index ---------- */
  // Build a map of question_id -> response for fast lookup
  const responseMap = new Map<
    string,
    { question_id: string; answer_value: number | string; response_time_ms: number | null }
  >();
  for (const r of allResponses) {
    responseMap.set(r.question_id, r);
  }

  // Build a map of question_id -> PoolQuestion
  const questionMap = new Map<string, PoolQuestion>();
  for (const q of questions) {
    questionMap.set(q.id, q);
  }

  // Group questions by validity_pair_id
  const pairGroups = new Map<string, PoolQuestion[]>();
  for (const q of questions) {
    if (q.validity_pair_id) {
      const group = pairGroups.get(q.validity_pair_id) ?? [];
      group.push(q);
      pairGroups.set(q.validity_pair_id, group);
    }
  }

  let pairDeltaSum = 0;
  let pairCount = 0;
  for (const [, group] of pairGroups) {
    if (group.length < 2) continue;
    // Compare the first two members of each pair
    const qA = group[0];
    const qB = group[1];
    const rA = responseMap.get(qA.id);
    const rB = responseMap.get(qB.id);
    if (!rA || !rB) continue;

    let valA = typeof rA.answer_value === 'number' ? rA.answer_value : Number(rA.answer_value);
    let valB = typeof rB.answer_value === 'number' ? rB.answer_value : Number(rB.answer_value);

    if (isNaN(valA) || isNaN(valB)) continue; // non-Likert pair — skip

    // Account for reverse scoring: if a question is reverse scored,
    // invert on a 1-5 scale (1↔5, 2↔4, 3→3)
    if (qA.reverse_scored) valA = 6 - valA;
    if (qB.reverse_scored) valB = 6 - valB;

    pairDeltaSum += Math.abs(valA - valB);
    pairCount++;
  }

  const inconsistencyIndex = pairCount > 0 ? pairDeltaSum / pairCount : 0;

  /* ---------- impression_management ---------- */
  let imHighCount = 0;
  let imTotal = 0;
  for (const q of questions) {
    if (!q.is_impression_management) continue;
    imTotal++;
    const resp = responseMap.get(q.id);
    if (!resp) continue;
    const val = typeof resp.answer_value === 'number' ? resp.answer_value : Number(resp.answer_value);
    if (val === 4 || val === 5) {
      imHighCount++;
    }
  }
  const impressionManagement = imTotal > 0 ? imHighCount / imTotal : 0;

  /* ---------- straight_line_pct ---------- */
  const likertAnswers: number[] = [];
  for (const resp of allResponses) {
    const q = questionMap.get(resp.question_id);
    if (!q || q.type !== 'likert') continue;
    const val = typeof resp.answer_value === 'number' ? resp.answer_value : Number(resp.answer_value);
    if (!isNaN(val)) likertAnswers.push(val);
  }

  let straightLinePct = 0;
  if (likertAnswers.length > 0) {
    // Find the most common answer
    const freq = new Map<number, number>();
    for (const v of likertAnswers) {
      freq.set(v, (freq.get(v) ?? 0) + 1);
    }
    let maxFreq = 0;
    for (const count of freq.values()) {
      if (count > maxFreq) maxFreq = count;
    }
    straightLinePct = maxFreq / likertAnswers.length;
  }

  /* ---------- fast_response_pct ---------- */
  let fastCount = 0;
  const totalResponses = allResponses.length;
  for (const resp of allResponses) {
    if (resp.response_time_ms !== null && resp.response_time_ms < 2000) {
      fastCount++;
    }
  }
  const fastResponsePct = totalResponses > 0 ? fastCount / totalResponses : 0;

  /* ---------- overall_reliability ---------- */
  let overallReliability: 'high' | 'medium' | 'low';

  if (
    inconsistencyIndex > 2.5 ||
    impressionManagement > 0.75 ||
    straightLinePct > 0.7
  ) {
    overallReliability = 'low';
  } else if (
    inconsistencyIndex < 1.5 &&
    impressionManagement < 0.5 &&
    straightLinePct < 0.5
  ) {
    overallReliability = 'high';
  } else {
    overallReliability = 'medium';
  }

  return {
    inconsistency_index: inconsistencyIndex,
    impression_management: impressionManagement,
    straight_line_pct: straightLinePct,
    fast_response_pct: fastResponsePct,
    overall_reliability: overallReliability,
  };
}

/* ------------------------------------------------------------------ */
/*  6. getConfidenceLevel                                              */
/* ------------------------------------------------------------------ */

/**
 * Maps a standard-error value to a human-readable confidence tier.
 */
export function getConfidenceLevel(se: number): 'high' | 'medium' | 'low' {
  if (se < 0.1) return 'high';
  if (se <= 0.2) return 'medium';
  return 'low';
}
