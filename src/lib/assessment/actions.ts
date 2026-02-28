'use server';

/**
 * Leadership Assessment — Server Actions
 *
 * Four public entry points for the assessment UI:
 *   startAssessment         → creates session, returns first chunk
 *   submitChunkAndGetNext   → scores chunk, returns next questions or completion flag
 *   submitEmailAndGenerate  → captures lead info, generates final analysis
 *   getResults              → fetches completed results by token
 */

import { nanoid } from 'nanoid';
import { supabaseAdmin } from '../supabase-admin';
import type {
  AssessmentVersion,
  DemographicContext,
  ChunkSubmission,
  ClientQuestion,
  AssessmentResult,
  ScoreProfile,
  SimpleScores,
  ArchetypeProfile,
  Dimension,
  ValidityFlags,
} from './types';
import { CHUNKS_PER_VERSION, DIMENSIONS } from './types';
import { initializeScoreProfile, scoreBatch, computeValidityFlags, computeSubScores } from './scoring';
import { matchArchetype } from './archetypes';
import { selectSeedChunk, selectNextChunk } from './adaptive-selection';
import { generateAnalysis } from './analysis-generator';
import { getQuestionPool } from './question-cache';

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function stripScoresToClient(questions: { id: string; type: string; text: string; options?: { key: string; text: string; scores?: unknown }[] | null }[]): ClientQuestion[] {
  return questions.map((q) => ({
    id: q.id,
    type: q.type as ClientQuestion['type'],
    text: q.text,
    options: q.options
      ? q.options.map((o) => ({ key: o.key, text: o.text }))
      : undefined,
  }));
}

/* ------------------------------------------------------------------ */
/*  1. startAssessment                                                 */
/* ------------------------------------------------------------------ */

export async function startAssessment(
  version: AssessmentVersion,
  demographicContext?: DemographicContext,
): Promise<{
  sessionId: string;
  token: string;
  questions: ClientQuestion[];
  totalChunks: number;
}> {
  const token = nanoid(12);
  const totalChunks = CHUNKS_PER_VERSION[version];

  // Get question pool and select seed chunk (before insert so IDs are available)
  const pool = await getQuestionPool(version);
  const seedQuestions = selectSeedChunk(pool, version);

  // Insert session row
  const { data: session, error: sessionError } = await supabaseAdmin
    .from('assessment_sessions')
    .insert({
      token,
      version,
      status: 'in_progress',
      current_chunk: 1,
      total_chunks: totalChunks,
      demographic_context: demographicContext ?? null,
      metadata: {
        current_chunk_question_ids: seedQuestions.map((q) => q.id),
      },
    })
    .select('id')
    .single();

  if (sessionError || !session) {
    throw new Error(`Failed to create session: ${sessionError?.message ?? 'Unknown error'}`);
  }

  return {
    sessionId: session.id,
    token,
    questions: stripScoresToClient(seedQuestions),
    totalChunks,
  };
}

/* ------------------------------------------------------------------ */
/*  1b. startUpgradeAssessment                                         */
/* ------------------------------------------------------------------ */

/**
 * Creates a deep assessment session that builds on a completed quick
 * session's score profile as Bayesian priors. The deep pool's own
 * 50+ questions are independent — the quick ScoreProfile just gives
 * the adaptive engine a head start.
 *
 * 7 chunks (35 questions) instead of 10 (50), since the combined
 * data points (15 quick + 35 deep) equal a full deep assessment.
 */
export async function startUpgradeAssessment(
  quickToken: string,
): Promise<{
  sessionId: string;
  token: string;
  questions: ClientQuestion[];
  totalChunks: number;
}> {
  // Fetch the completed quick session
  const { data: quickSession, error: quickError } = await supabaseAdmin
    .from('assessment_sessions')
    .select('id, version, status, score_details')
    .eq('token', quickToken)
    .single();

  if (quickError || !quickSession) {
    throw new Error('Quick assessment session not found');
  }
  if (quickSession.status !== 'completed') {
    throw new Error('Quick assessment is not yet completed');
  }
  if (quickSession.version !== 'quick') {
    throw new Error('Source session is not a quick assessment');
  }

  const quickScoreProfile = quickSession.score_details as ScoreProfile;
  if (!quickScoreProfile) {
    throw new Error('Quick assessment has no score data');
  }

  const token = nanoid(12);
  const totalChunks = 7; // 35 questions (vs 10 chunks / 50 for full deep)
  const version: AssessmentVersion = 'deep';

  // Get deep question pool
  const pool = await getQuestionPool(version);

  // Use selectNextChunk (not selectSeedChunk) so the adaptive engine
  // targets dimensions where the quick assessment had high uncertainty
  const { questionIds, reasoning } = await selectNextChunk({
    scoreProfile: quickScoreProfile,
    answeredIds: [], // deep pool is independent — no IDs to exclude
    pool,
    version,
    chunkNumber: 1,
    totalChunks,
    validityFlags: null,
  });

  const questionMap = new Map(pool.map((q) => [q.id, q]));
  const seedQuestions = questionIds
    .map((id) => questionMap.get(id))
    .filter(Boolean) as typeof pool;

  // Insert session row
  const { data: session, error: sessionError } = await supabaseAdmin
    .from('assessment_sessions')
    .insert({
      token,
      version,
      status: 'in_progress',
      current_chunk: 1,
      total_chunks: totalChunks,
      metadata: {
        upgrade_from_token: quickToken,
        quick_score_profile: quickScoreProfile,
        current_chunk_question_ids: questionIds,
        last_selection_reasoning: reasoning,
      },
    })
    .select('id')
    .single();

  if (sessionError || !session) {
    throw new Error(`Failed to create upgrade session: ${sessionError?.message ?? 'Unknown error'}`);
  }

  return {
    sessionId: session.id,
    token,
    questions: stripScoresToClient(seedQuestions),
    totalChunks,
  };
}

/* ------------------------------------------------------------------ */
/*  2. submitChunkAndGetNext                                           */
/* ------------------------------------------------------------------ */

export async function submitChunkAndGetNext(
  sessionId: string,
  responses: ChunkSubmission[],
): Promise<{
  complete: boolean;
  questions?: ClientQuestion[];
  currentChunk: number;
  totalChunks: number;
}> {
  // Validate session
  const { data: session, error: sessionError } = await supabaseAdmin
    .from('assessment_sessions')
    .select('id, version, status, current_chunk, total_chunks, metadata')
    .eq('id', sessionId)
    .single();

  if (sessionError || !session) {
    throw new Error('Session not found');
  }
  if (session.status !== 'in_progress') {
    throw new Error('Session is not in progress');
  }

  const version = session.version as AssessmentVersion;
  const currentChunk = session.current_chunk as number;
  const totalChunks = session.total_chunks as number;

  // For upgrade sessions, extract the quick score profile to use as priors
  const sessionMeta = (session.metadata ?? {}) as Record<string, unknown>;
  const quickPrior = sessionMeta.quick_score_profile as ScoreProfile | undefined;

  // Get question pool for lookups
  const pool = await getQuestionPool(version);
  const questionMap = new Map(pool.map((q) => [q.id, q]));

  // Insert response rows
  const responseRows = responses.map((r) => {
    const question = questionMap.get(r.question_id);
    return {
      session_id: sessionId,
      chunk_number: currentChunk,
      question_id: r.question_id,
      question_type: question?.type ?? 'likert',
      question_text: question?.text ?? '',
      answer_value: r.answer_value,
      dimension_target: question?.dimension ?? 'drive',
      secondary_dimension_target: question?.secondary_dimension ?? null,
      response_time_ms: r.response_time_ms,
    };
  });

  const { error: insertError } = await supabaseAdmin
    .from('assessment_responses')
    .insert(responseRows);

  if (insertError) {
    throw new Error(`Failed to save responses: ${insertError.message}`);
  }

  // Fetch ALL responses for this session to compute running scores
  const { data: allResponses, error: respError } = await supabaseAdmin
    .from('assessment_responses')
    .select('question_id, answer_value, response_time_ms')
    .eq('session_id', sessionId);

  if (respError || !allResponses) {
    throw new Error('Failed to fetch responses for scoring');
  }

  // Parse answer values
  const parsedResponses = allResponses.map((r) => ({
    question_id: r.question_id as string,
    answer_value: (typeof r.answer_value === 'object' ? JSON.parse(JSON.stringify(r.answer_value)) : r.answer_value) as number | string,
    response_time_ms: r.response_time_ms as number | null,
  }));

  // Score all responses (quick priors seed the profile for upgrade sessions)
  const scoreProfile = scoreBatch(
    pool,
    parsedResponses.map((r) => ({
      question_id: r.question_id,
      answer_value: r.answer_value,
    })),
    quickPrior,
  );

  // Compute validity flags
  const validityFlags = computeValidityFlags(parsedResponses, pool);

  // Update session with running scores
  const simpleScores: SimpleScores = {} as SimpleScores;
  for (const dim of DIMENSIONS) {
    simpleScores[dim] = Math.round(scoreProfile[dim].score);
  }

  const isLastChunk = currentChunk >= totalChunks;

  if (isLastChunk) {
    // Mark as needing email capture (still in_progress until email submitted)
    await supabaseAdmin
      .from('assessment_sessions')
      .update({
        scores: simpleScores,
        score_details: scoreProfile,
        validity_flags: validityFlags,
      })
      .eq('id', sessionId);

    return {
      complete: true,
      currentChunk,
      totalChunks,
    };
  }

  // Select next chunk via AI
  const answeredIds = parsedResponses.map((r) => r.question_id);

  const { questionIds, reasoning } = await selectNextChunk({
    scoreProfile,
    answeredIds,
    pool,
    version,
    chunkNumber: currentChunk + 1,
    totalChunks,
    validityFlags,
  });

  // Look up full questions
  const nextQuestions = questionIds
    .map((id) => questionMap.get(id))
    .filter(Boolean) as typeof pool;

  // Increment chunk and update session
  await supabaseAdmin
    .from('assessment_sessions')
    .update({
      current_chunk: currentChunk + 1,
      scores: simpleScores,
      score_details: scoreProfile,
      validity_flags: validityFlags,
      metadata: {
        last_selection_reasoning: reasoning,
        current_chunk_question_ids: questionIds,
      },
    })
    .eq('id', sessionId);

  return {
    complete: false,
    questions: stripScoresToClient(nextQuestions),
    currentChunk: currentChunk + 1,
    totalChunks,
  };
}

/* ------------------------------------------------------------------ */
/*  3. submitEmailAndGenerateResults                                   */
/* ------------------------------------------------------------------ */

export async function submitEmailAndGenerateResults(
  sessionId: string,
  firstName: string,
  email: string,
): Promise<{ token: string }> {
  // Fetch session
  const { data: session, error: sessionError } = await supabaseAdmin
    .from('assessment_sessions')
    .select('*')
    .eq('id', sessionId)
    .single();

  if (sessionError || !session) {
    throw new Error('Session not found');
  }

  const version = session.version as AssessmentVersion;

  // For upgrade sessions, extract the quick score profile to use as priors
  const emailSessionMeta = (session.metadata ?? {}) as Record<string, unknown>;
  const emailQuickPrior = emailSessionMeta.quick_score_profile as ScoreProfile | undefined;

  // Fetch all responses
  const { data: allResponses, error: respError } = await supabaseAdmin
    .from('assessment_responses')
    .select('*')
    .eq('session_id', sessionId)
    .order('answered_at', { ascending: true });

  if (respError || !allResponses) {
    throw new Error('Failed to fetch responses');
  }

  // Get question pool
  const pool = await getQuestionPool(version);

  // Parse responses
  const parsedResponses = allResponses.map((r) => ({
    question_id: r.question_id as string,
    answer_value: (typeof r.answer_value === 'object' ? JSON.parse(JSON.stringify(r.answer_value)) : r.answer_value) as number | string,
    response_time_ms: r.response_time_ms as number | null,
    question_text: r.question_text as string,
    question_type: r.question_type as string,
  }));

  // Full scoring (quick priors seed the profile for upgrade sessions)
  const scoreProfile = scoreBatch(
    pool,
    parsedResponses.map((r) => ({
      question_id: r.question_id,
      answer_value: r.answer_value,
    })),
    emailQuickPrior,
  );

  const validityFlags = computeValidityFlags(
    parsedResponses.map((r) => ({
      question_id: r.question_id,
      answer_value: r.answer_value,
      response_time_ms: r.response_time_ms,
    })),
    pool,
  );

  // Fetch archetype profiles
  const { data: archetypes, error: archError } = await supabaseAdmin
    .from('archetype_profiles')
    .select('*');

  if (archError || !archetypes) {
    throw new Error('Failed to fetch archetypes');
  }

  const archetypeProfiles = archetypes as ArchetypeProfile[];

  // Match archetypes
  const matchResult = matchArchetype(scoreProfile, archetypeProfiles);

  const primaryArchetype = archetypeProfiles.find((a) => a.id === matchResult.primary)!;
  const secondaryArchetype = archetypeProfiles.find((a) => a.id === matchResult.secondary)!;

  // Generate AI analysis
  const analysis = await generateAnalysis({
    version,
    scoreProfile,
    archetype: primaryArchetype,
    secondaryArchetype,
    responses: parsedResponses.map((r) => ({
      question_text: r.question_text,
      answer_value: r.answer_value,
      question_type: r.question_type,
    })),
    validityFlags,
    demographicContext: session.demographic_context as DemographicContext | null,
    needsTiebreak: matchResult.needs_tiebreak,
  });

  // Compute deterministic sub-scores and merge into analysis
  const deterministic = computeSubScores(
    pool,
    parsedResponses.map((r) => ({ question_id: r.question_id, answer_value: r.answer_value })),
    scoreProfile,
  );

  if (version === 'deep' && analysis.sub_scores) {
    // Deep: merge AI descriptions onto deterministic scores (AI scores as tiebreaker)
    for (const dim of DIMENSIONS) {
      const aiSubs = analysis.sub_scores[dim];
      const detSubs = deterministic[dim];
      if (!aiSubs || !detSubs) continue;

      analysis.sub_scores[dim] = detSubs.map((det) => {
        const aiMatch = aiSubs.find((a) => a.label === det.label);
        return {
          label: det.label,
          score: det.score,
          description: aiMatch?.description,
        };
      });
    }
  } else {
    // Quick (or AI didn't produce sub_scores): use deterministic scores only
    analysis.sub_scores = deterministic;
  }

  // Compute simple scores
  const simpleScores: SimpleScores = {} as SimpleScores;
  for (const dim of DIMENSIONS) {
    simpleScores[dim] = Math.round(scoreProfile[dim].score);
  }

  // Update session as completed
  await supabaseAdmin
    .from('assessment_sessions')
    .update({
      first_name: firstName,
      email,
      status: 'completed',
      completed_at: new Date().toISOString(),
      archetype: matchResult.primary,
      secondary_archetype: matchResult.secondary,
      scores: simpleScores,
      score_details: scoreProfile,
      ai_analysis: analysis,
      validity_flags: validityFlags,
    })
    .eq('id', sessionId);

  return { token: session.token as string };
}

/* ------------------------------------------------------------------ */
/*  4. getResults                                                      */
/* ------------------------------------------------------------------ */

export async function getResults(
  token: string,
): Promise<AssessmentResult | { error: string }> {
  // Fetch session by token
  const { data: session, error: sessionError } = await supabaseAdmin
    .from('assessment_sessions')
    .select('*')
    .eq('token', token)
    .single();

  if (sessionError || !session) {
    return { error: 'Results not found' };
  }

  if (session.status !== 'completed') {
    return { error: 'Assessment not yet completed' };
  }

  // Fetch primary and secondary archetypes
  const archetypeIds = [session.archetype, session.secondary_archetype].filter(Boolean);
  const { data: archetypes, error: archError } = await supabaseAdmin
    .from('archetype_profiles')
    .select('*')
    .in('id', archetypeIds);

  if (archError || !archetypes) {
    return { error: 'Failed to load archetype data' };
  }

  const primaryArchetype = archetypes.find((a: ArchetypeProfile) => a.id === session.archetype) as ArchetypeProfile;
  const secondaryArchetype = archetypes.find((a: ArchetypeProfile) => a.id === session.secondary_archetype) as ArchetypeProfile;

  if (!primaryArchetype || !secondaryArchetype) {
    return { error: 'Archetype data incomplete' };
  }

  // Fetch score norms
  const { data: norms } = await supabaseAdmin
    .from('score_norms')
    .select('dimension, percentile_map')
    .eq('segment', 'all');

  let normsRecord: Record<Dimension, { percentile: number }> | null = null;
  let medianScores: SimpleScores | null = null;

  if (norms && norms.length > 0) {
    const simpleScores = session.scores as SimpleScores;
    normsRecord = {} as Record<Dimension, { percentile: number }>;
    medianScores = {} as SimpleScores;

    for (const norm of norms) {
      const dim = norm.dimension as Dimension;
      const percentileMap = norm.percentile_map as Record<string, number>;
      const userScore = simpleScores[dim];

      // Find closest percentile
      let percentile = 50; // default
      const thresholds = Object.entries(percentileMap)
        .map(([p, score]) => ({ percentile: parseInt(p, 10), score: score as number }))
        .sort((a, b) => a.score - b.score);

      for (const t of thresholds) {
        if (userScore >= t.score) {
          percentile = t.percentile;
        }
      }

      normsRecord[dim] = { percentile };
      medianScores[dim] = percentileMap['50'] ?? 50;
    }
  }

  // Ensure sub_scores exist (backfill for legacy records)
  const analysis = session.ai_analysis as AssessmentResult['analysis'];
  if (!analysis.sub_scores) {
    const version = session.version as AssessmentVersion;
    const scoreProfile = session.score_details as ScoreProfile;

    // Fetch responses to compute sub-scores deterministically
    const { data: responses } = await supabaseAdmin
      .from('assessment_responses')
      .select('question_id, answer_value')
      .eq('session_id', session.id);

    if (responses && responses.length > 0) {
      const pool = await getQuestionPool(version);
      const parsed = responses.map((r) => ({
        question_id: r.question_id as string,
        answer_value: (typeof r.answer_value === 'object'
          ? JSON.parse(JSON.stringify(r.answer_value))
          : r.answer_value) as number | string,
      }));
      analysis.sub_scores = computeSubScores(pool, parsed, scoreProfile);
    }
  }

  return {
    archetype: primaryArchetype,
    secondary_archetype: secondaryArchetype,
    scores: session.scores as SimpleScores,
    score_details: session.score_details as ScoreProfile,
    analysis,
    validity: session.validity_flags as ValidityFlags,
    version: session.version as AssessmentVersion,
    first_name: session.first_name as string,
    completed_at: session.completed_at as string,
    norms: normsRecord,
    population_averages: medianScores,
  };
}

/* ------------------------------------------------------------------ */
/*  5. resumeAssessment                                                */
/* ------------------------------------------------------------------ */

export async function resumeAssessment(
  token: string,
): Promise<{
  sessionId: string;
  token: string;
  version: AssessmentVersion;
  questions: ClientQuestion[];
  currentChunk: number;
  totalChunks: number;
} | null> {
  // Look up session by token
  const { data: session, error: sessionError } = await supabaseAdmin
    .from('assessment_sessions')
    .select('id, token, version, status, current_chunk, total_chunks, metadata')
    .eq('token', token)
    .single();

  if (sessionError || !session) return null;
  if (session.status !== 'in_progress') return null;

  // Read stored question IDs from metadata
  const metadata = (session.metadata ?? {}) as Record<string, unknown>;
  const questionIds = metadata.current_chunk_question_ids as string[] | undefined;
  if (!questionIds || questionIds.length === 0) return null;

  const version = session.version as AssessmentVersion;

  // Fetch those questions from the pool and strip scoring data
  const pool = await getQuestionPool(version);
  const poolMap = new Map(pool.map((q) => [q.id, q]));
  const questions = questionIds
    .map((id) => poolMap.get(id))
    .filter(Boolean) as typeof pool;

  if (questions.length === 0) return null;

  return {
    sessionId: session.id as string,
    token: session.token as string,
    version,
    questions: stripScoresToClient(questions),
    currentChunk: session.current_chunk as number,
    totalChunks: session.total_chunks as number,
  };
}
