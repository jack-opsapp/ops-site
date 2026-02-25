/**
 * Seed Synthetic Population
 *
 * Generates 200 synthetic leadership assessment profiles across 9 persona
 * types.  Inserts sessions, simulated responses, and computes percentile
 * norms for the `score_norms` table.
 *
 * Run:  npx tsx scripts/seed-synthetic-population.ts
 */

import { createClient } from '@supabase/supabase-js';
import { nanoid } from 'nanoid';
import type {
  Dimension,
  SimpleScores,
  ScoreProfile,
  ArchetypeProfile,
  PoolQuestion,
} from '../src/lib/assessment/types';
import { DIMENSIONS } from '../src/lib/assessment/types';
import { matchArchetype } from '../src/lib/assessment/archetypes';
import { initializeScoreProfile, scoreBatch } from '../src/lib/assessment/scoring';

/* ------------------------------------------------------------------ */
/*  Supabase Client (service role)                                     */
/* ------------------------------------------------------------------ */

const supabase = createClient(
  'https://ijeekuhbatykdomumfjx.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlqZWVrdWhiYXR5a2RvbXVtZmp4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTI3MzYxOCwiZXhwIjoyMDg2ODQ5NjE4fQ.GevX3JY6TSV7BPaDNcLxqSkkJbYRTIFJsNOJwiajoI4',
);

/* ------------------------------------------------------------------ */
/*  Persona Definitions                                                */
/* ------------------------------------------------------------------ */

interface PersonaDef {
  name: string;
  count: number;
  /** Center score for each dimension (0-100 scale) */
  centers: SimpleScores;
  /** Per-dimension SD (defaults to 12 if omitted) */
  sd?: number;
}

const PERSONAS: PersonaDef[] = [
  {
    name: 'balanced_leader',
    count: 30,
    centers: { drive: 62, resilience: 63, vision: 60, connection: 61, adaptability: 64, integrity: 65 },
    sd: 11,
  },
  {
    name: 'driven_executor',
    count: 25,
    centers: { drive: 78, resilience: 74, vision: 55, connection: 42, adaptability: 44, integrity: 58 },
    sd: 12,
  },
  {
    name: 'visionary_strategist',
    count: 20,
    centers: { drive: 58, resilience: 52, vision: 80, connection: 50, adaptability: 76, integrity: 55 },
    sd: 12,
  },
  {
    name: 'people_connector',
    count: 25,
    centers: { drive: 50, resilience: 55, vision: 52, connection: 80, adaptability: 58, integrity: 75 },
    sd: 11,
  },
  {
    name: 'resilient_anchor',
    count: 20,
    centers: { drive: 56, resilience: 78, vision: 50, connection: 55, adaptability: 52, integrity: 76 },
    sd: 12,
  },
  {
    name: 'adaptive_innovator',
    count: 20,
    centers: { drive: 55, resilience: 50, vision: 76, connection: 48, adaptability: 82, integrity: 45 },
    sd: 13,
  },
  {
    name: 'high_performer',
    count: 15,
    centers: { drive: 82, resilience: 80, vision: 78, connection: 76, adaptability: 79, integrity: 83 },
    sd: 10,
  },
  {
    name: 'developing_leader',
    count: 25,
    centers: { drive: 40, resilience: 42, vision: 38, connection: 45, adaptability: 44, integrity: 48 },
    sd: 14,
  },
  {
    name: 'specialist',
    count: 20,
    centers: { drive: 82, resilience: 80, vision: 38, connection: 35, adaptability: 40, integrity: 42 },
    sd: 13,
  },
];

/* ------------------------------------------------------------------ */
/*  Correlation Matrix                                                 */
/* ------------------------------------------------------------------ */

// Dimension order: drive, resilience, vision, connection, adaptability, integrity
const CORRELATION_MATRIX: number[][] = [
  [1.0,  0.45, 0.35, 0.15, 0.20, 0.25],
  [0.45, 1.0,  0.20, 0.30, 0.25, 0.40],
  [0.35, 0.20, 1.0,  0.25, 0.50, 0.15],
  [0.15, 0.30, 0.25, 1.0,  0.35, 0.45],
  [0.20, 0.25, 0.50, 0.35, 1.0,  0.20],
  [0.25, 0.40, 0.15, 0.45, 0.20, 1.0],
];

/* ------------------------------------------------------------------ */
/*  Cholesky Decomposition (inline)                                    */
/* ------------------------------------------------------------------ */

/**
 * Returns lower-triangular matrix L such that L * L^T = A.
 * A must be symmetric positive-definite.
 */
function choleskyDecomposition(A: number[][]): number[][] {
  const n = A.length;
  const L: number[][] = Array.from({ length: n }, () => new Array(n).fill(0));

  for (let i = 0; i < n; i++) {
    for (let j = 0; j <= i; j++) {
      let sum = 0;
      for (let k = 0; k < j; k++) {
        sum += L[i][k] * L[j][k];
      }
      if (i === j) {
        const val = A[i][i] - sum;
        if (val <= 0) {
          throw new Error(`Matrix is not positive-definite at index ${i}`);
        }
        L[i][j] = Math.sqrt(val);
      } else {
        L[i][j] = (A[i][j] - sum) / L[j][j];
      }
    }
  }
  return L;
}

/* ------------------------------------------------------------------ */
/*  Box-Muller Normal RNG                                              */
/* ------------------------------------------------------------------ */

function boxMullerPair(): [number, number] {
  let u1: number, u2: number;
  do { u1 = Math.random(); } while (u1 === 0);
  u2 = Math.random();
  const mag = Math.sqrt(-2.0 * Math.log(u1));
  return [mag * Math.cos(2.0 * Math.PI * u2), mag * Math.sin(2.0 * Math.PI * u2)];
}

/** Generate n independent standard-normal samples. */
function sampleStandardNormal(n: number): number[] {
  const result: number[] = [];
  while (result.length < n) {
    const [a, b] = boxMullerPair();
    result.push(a);
    if (result.length < n) result.push(b);
  }
  return result;
}

/* ------------------------------------------------------------------ */
/*  Multivariate Normal Sampling                                       */
/* ------------------------------------------------------------------ */

/**
 * Generate one sample from N(centers, diag(sd^2) * R) using Cholesky factor L.
 * L is the Cholesky of the correlation matrix R.
 * Each dimension is then scaled by sd and shifted by centers.
 */
function sampleProfile(
  L: number[][],
  centers: number[],
  sd: number,
): number[] {
  const z = sampleStandardNormal(6);
  const x: number[] = new Array(6).fill(0);

  // x = L * z  (correlated standard normals)
  for (let i = 0; i < 6; i++) {
    for (let j = 0; j <= i; j++) {
      x[i] += L[i][j] * z[j];
    }
  }

  // Scale and shift, then clamp to [0, 100]
  return x.map((val, i) => {
    const raw = centers[i] + val * sd;
    return Math.max(0, Math.min(100, Math.round(raw)));
  });
}

/* ------------------------------------------------------------------ */
/*  Synthetic Names                                                    */
/* ------------------------------------------------------------------ */

const FIRST_NAMES = [
  'Alex', 'Jordan', 'Taylor', 'Morgan', 'Casey', 'Riley', 'Quinn', 'Avery',
  'Sage', 'Reese', 'Dakota', 'Jamie', 'Skyler', 'Emerson', 'Finley', 'Rowan',
  'Harper', 'Blake', 'Drew', 'Hayden', 'Parker', 'Spencer', 'Cameron', 'Devon',
  'Jesse', 'Lane', 'Peyton', 'Kendall', 'Logan', 'Addison', 'River', 'Phoenix',
  'Ellis', 'Robin', 'Sam', 'Charlie', 'Max', 'Lee', 'Kai', 'Ari',
];

function randomName(): string {
  return FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
}

/* ------------------------------------------------------------------ */
/*  Timestamp Generator                                                */
/* ------------------------------------------------------------------ */

/** Returns a random ISO timestamp within the past `days` days. */
function randomTimestamp(days: number): string {
  const now = Date.now();
  const offset = Math.floor(Math.random() * days * 24 * 60 * 60 * 1000);
  return new Date(now - offset).toISOString();
}

/* ------------------------------------------------------------------ */
/*  Simulated Response Generator                                       */
/* ------------------------------------------------------------------ */

/**
 * Given a target SimpleScores profile and a set of questions, simulate
 * plausible answer values.
 *
 * For likert questions (1-5 scale): maps the profile score (0-100) for
 * the question's primary dimension to a noisy likert value.
 *
 * For situational/forced_choice: picks the option whose dimension
 * contributions best align with the profile, with some randomness.
 */
function simulateAnswer(
  question: PoolQuestion,
  profileScores: SimpleScores,
): number | string {
  if (question.type === 'likert') {
    // Map 0-100 score to 1-5 likert
    const dimScore = profileScores[question.dimension];
    // Base mapping: 0->1, 25->2, 50->3, 75->4, 100->5
    let base = 1 + (dimScore / 100) * 4;
    // Add noise (SD ~0.7)
    const [noise] = boxMullerPair();
    base += noise * 0.7;
    // Clamp to 1-5 and round
    const answer = Math.max(1, Math.min(5, Math.round(base)));
    // If reverse scored, flip on the 1-5 scale
    return question.reverse_scored ? 6 - answer : answer;
  }

  // Situational / forced_choice — pick best-aligned option
  if (question.options && question.options.length > 0) {
    let bestKey = question.options[0].key;
    let bestScore = -Infinity;

    for (const option of question.options) {
      let alignment = 0;
      for (const dim of DIMENSIONS) {
        const optionWeight = option.scores[dim] ?? 0;
        alignment += optionWeight * (profileScores[dim] / 100);
      }
      // Add randomness
      const [noise] = boxMullerPair();
      alignment += noise * 0.3;

      if (alignment > bestScore) {
        bestScore = alignment;
        bestKey = option.key;
      }
    }
    return bestKey;
  }

  // Fallback: return 3 (neutral likert)
  return 3;
}

/* ------------------------------------------------------------------ */
/*  Percentile Computation                                             */
/* ------------------------------------------------------------------ */

function computePercentileMap(values: number[]): Record<string, number> {
  const sorted = [...values].sort((a, b) => a - b);
  const n = sorted.length;

  const percentileAt = (p: number): number => {
    const idx = (p / 100) * (n - 1);
    const lo = Math.floor(idx);
    const hi = Math.ceil(idx);
    if (lo === hi) return sorted[lo];
    return sorted[lo] + (sorted[hi] - sorted[lo]) * (idx - lo);
  };

  return {
    '10': Math.round(percentileAt(10)),
    '25': Math.round(percentileAt(25)),
    '50': Math.round(percentileAt(50)),
    '75': Math.round(percentileAt(75)),
    '90': Math.round(percentileAt(90)),
  };
}

/* ------------------------------------------------------------------ */
/*  Main                                                               */
/* ------------------------------------------------------------------ */

async function main() {
  console.log('=== Seed Synthetic Population ===\n');

  // ---- 1. Pre-compute Cholesky factor ----
  console.log('Computing Cholesky decomposition of correlation matrix...');
  const L = choleskyDecomposition(CORRELATION_MATRIX);
  console.log('  Done.\n');

  // ---- 2. Fetch question pool ----
  console.log('Fetching question pool from Supabase...');
  const { data: allQuestions, error: qError } = await supabase
    .from('question_pool')
    .select('*');

  if (qError || !allQuestions) {
    throw new Error(`Failed to fetch question pool: ${qError?.message ?? 'No data'}`);
  }

  const pool = allQuestions as PoolQuestion[];
  // Filter to quick-version questions only
  const quickPool = pool.filter((q) => q.version_availability.includes('quick'));
  console.log(`  Total questions: ${pool.length}, quick-eligible: ${quickPool.length}\n`);

  if (quickPool.length < 15) {
    throw new Error(`Need at least 15 quick-eligible questions, only found ${quickPool.length}`);
  }

  // ---- 3. Fetch archetype profiles ----
  console.log('Fetching archetype profiles...');
  const { data: archetypes, error: archError } = await supabase
    .from('archetype_profiles')
    .select('*');

  if (archError || !archetypes) {
    throw new Error(`Failed to fetch archetypes: ${archError?.message ?? 'No data'}`);
  }

  const archetypeProfiles = archetypes as ArchetypeProfile[];
  console.log(`  Found ${archetypeProfiles.length} archetypes.\n`);

  // ---- 4. Generate profiles ----
  console.log('Generating 200 synthetic profiles...\n');

  interface SyntheticProfile {
    persona: string;
    scores: SimpleScores;
    scoreProfile: ScoreProfile;
    archetype: string;
    secondaryArchetype: string;
    firstName: string;
    completedAt: string;
    token: string;
    simulatedAnswers: { question_id: string; answer_value: number | string }[];
    questions: PoolQuestion[];
  }

  const allProfiles: SyntheticProfile[] = [];

  for (const persona of PERSONAS) {
    const centers = DIMENSIONS.map((dim) => persona.centers[dim]);
    const sd = persona.sd ?? 12;

    console.log(`  Persona: ${persona.name} (${persona.count} profiles, SD=${sd})`);

    for (let i = 0; i < persona.count; i++) {
      // Sample correlated scores
      const rawScores = sampleProfile(L, centers, sd);

      const scores: SimpleScores = {} as SimpleScores;
      DIMENSIONS.forEach((dim, idx) => {
        scores[dim] = rawScores[idx];
      });

      // Pick 15 random questions from the quick pool (shuffle and take first 15)
      const shuffled = [...quickPool].sort(() => Math.random() - 0.5);
      const selectedQuestions = shuffled.slice(0, 15);

      // Simulate answers
      const simulatedAnswers = selectedQuestions.map((q) => ({
        question_id: q.id,
        answer_value: simulateAnswer(q, scores),
      }));

      // Score through the real scoring engine
      const scoreProfile = scoreBatch(selectedQuestions, simulatedAnswers);

      // Override the score values to match our synthetic target scores.
      // The scoring engine uses Bayesian updates which won't converge to our
      // exact desired values with only 15 items, so we set the .score field
      // directly while keeping the confidence/SE metadata from the engine.
      for (const dim of DIMENSIONS) {
        scoreProfile[dim] = {
          ...scoreProfile[dim],
          score: scores[dim],
        };
      }

      // Match archetype
      const matchResult = matchArchetype(scoreProfile, archetypeProfiles);

      allProfiles.push({
        persona: persona.name,
        scores,
        scoreProfile,
        archetype: matchResult.primary,
        secondaryArchetype: matchResult.secondary,
        firstName: randomName(),
        completedAt: randomTimestamp(90),
        token: nanoid(12),
        simulatedAnswers,
        questions: selectedQuestions,
      });
    }
  }

  console.log(`\n  Total profiles generated: ${allProfiles.length}\n`);

  // ---- 5. Insert assessment_sessions ----
  console.log('Inserting assessment sessions...');

  // Insert in batches of 50 to avoid request size limits
  const BATCH_SIZE = 50;
  const sessionIdMap = new Map<string, string>(); // token -> session id

  for (let start = 0; start < allProfiles.length; start += BATCH_SIZE) {
    const batch = allProfiles.slice(start, start + BATCH_SIZE);

    const sessionRows = batch.map((p) => ({
      token: p.token,
      first_name: p.firstName,
      email: null,
      version: 'quick' as const,
      status: 'completed' as const,
      current_chunk: 3,
      total_chunks: 3,
      completed_at: p.completedAt,
      archetype: p.archetype,
      secondary_archetype: p.secondaryArchetype,
      scores: p.scores,
      score_details: p.scoreProfile,
      ai_analysis: null,
      validity_flags: null,
      demographic_context: null,
      metadata: { is_synthetic: true, persona_type: p.persona },
      is_synthetic: true,
    }));

    const { data: inserted, error: insertError } = await supabase
      .from('assessment_sessions')
      .insert(sessionRows)
      .select('id, token');

    if (insertError) {
      throw new Error(`Failed to insert sessions batch at ${start}: ${insertError.message}`);
    }

    if (inserted) {
      for (const row of inserted) {
        sessionIdMap.set(row.token as string, row.id as string);
      }
    }

    console.log(`  Inserted sessions ${start + 1} - ${Math.min(start + BATCH_SIZE, allProfiles.length)}`);
  }

  console.log(`  Total sessions inserted: ${sessionIdMap.size}\n`);

  // ---- 6. Insert assessment_responses ----
  console.log('Inserting assessment responses (15 per session)...');

  let totalResponsesInserted = 0;

  for (let start = 0; start < allProfiles.length; start += BATCH_SIZE) {
    const batch = allProfiles.slice(start, start + BATCH_SIZE);
    const responseRows: Record<string, unknown>[] = [];

    for (const profile of batch) {
      const sessionId = sessionIdMap.get(profile.token);
      if (!sessionId) continue;

      for (let ansIdx = 0; ansIdx < profile.simulatedAnswers.length; ansIdx++) {
        const answer = profile.simulatedAnswers[ansIdx];
        const question = profile.questions[ansIdx];

        // Assign chunk numbers: 5 per chunk for 3 chunks
        const chunkNumber = Math.floor(ansIdx / 5) + 1;

        // Generate a plausible response time (3-15 seconds)
        const responseTimeMs = 3000 + Math.floor(Math.random() * 12000);

        // Spread answer timestamps across a few minutes after session start
        const baseTime = new Date(profile.completedAt).getTime();
        const answerOffset = ansIdx * (15000 + Math.floor(Math.random() * 20000)); // 15-35s apart
        const answeredAt = new Date(baseTime - (15 * 35000) + answerOffset).toISOString();

        responseRows.push({
          session_id: sessionId,
          chunk_number: chunkNumber,
          question_id: answer.question_id,
          question_type: question.type,
          question_text: question.text,
          answer_value: answer.answer_value,
          dimension_target: question.dimension,
          secondary_dimension_target: question.secondary_dimension ?? null,
          response_time_ms: responseTimeMs,
          answered_at: answeredAt,
        });
      }
    }

    if (responseRows.length > 0) {
      // Insert responses in sub-batches of 200 rows
      const RESPONSE_BATCH = 200;
      for (let rStart = 0; rStart < responseRows.length; rStart += RESPONSE_BATCH) {
        const rBatch = responseRows.slice(rStart, rStart + RESPONSE_BATCH);
        const { error: rInsertError } = await supabase
          .from('assessment_responses')
          .insert(rBatch);

        if (rInsertError) {
          throw new Error(
            `Failed to insert responses at profile batch ${start}, response sub-batch ${rStart}: ${rInsertError.message}`,
          );
        }
        totalResponsesInserted += rBatch.length;
      }
    }

    console.log(`  Processed response batch for profiles ${start + 1} - ${Math.min(start + BATCH_SIZE, allProfiles.length)} (${totalResponsesInserted} total responses)`);
  }

  console.log(`  Total responses inserted: ${totalResponsesInserted}\n`);

  // ---- 7. Compute and insert percentile norms ----
  console.log('Computing percentile norms...');

  const dimensionScoreArrays: Record<Dimension, number[]> = {
    drive: [],
    resilience: [],
    vision: [],
    connection: [],
    adaptability: [],
    integrity: [],
  };

  for (const profile of allProfiles) {
    for (const dim of DIMENSIONS) {
      dimensionScoreArrays[dim].push(profile.scores[dim]);
    }
  }

  const normRows: {
    dimension: Dimension;
    segment: string;
    percentile_map: Record<string, number>;
    sample_size: number;
  }[] = [];

  for (const dim of DIMENSIONS) {
    const pMap = computePercentileMap(dimensionScoreArrays[dim]);
    normRows.push({
      dimension: dim,
      segment: 'all',
      percentile_map: pMap,
      sample_size: allProfiles.length,
    });
    console.log(`  ${dim}: p10=${pMap['10']} p25=${pMap['25']} p50=${pMap['50']} p75=${pMap['75']} p90=${pMap['90']}`);
  }

  // Upsert into score_norms (unique on dimension + segment)
  const { error: normError } = await supabase
    .from('score_norms')
    .upsert(normRows, { onConflict: 'dimension,segment' });

  if (normError) {
    throw new Error(`Failed to upsert score_norms: ${normError.message}`);
  }

  console.log('\n  Percentile norms inserted/updated.\n');

  // ---- Done ----
  console.log('=== Seeding Complete ===');
  console.log(`  Sessions:   ${allProfiles.length}`);
  console.log(`  Responses:  ${totalResponsesInserted}`);
  console.log(`  Norm rows:  ${normRows.length}`);
  console.log('');
}

main().catch((err) => {
  console.error('\nFATAL ERROR:', err);
  process.exit(1);
});
