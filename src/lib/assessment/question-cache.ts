/**
 * Leadership Assessment — Question Pool Cache
 *
 * Module-level in-memory cache for the question pool.
 * Fetches from Supabase and caches for 1 hour.
 */

import { supabaseAdmin } from '../supabase-admin';
import type { PoolQuestion, AssessmentVersion } from './types';

/* ------------------------------------------------------------------ */
/*  Cache State                                                        */
/* ------------------------------------------------------------------ */

const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

let cachedQuestions: PoolQuestion[] | null = null;
let cacheTimestamp: number | null = null;

/* ------------------------------------------------------------------ */
/*  Internal Helpers                                                   */
/* ------------------------------------------------------------------ */

function isCacheValid(): boolean {
  if (!cachedQuestions || !cacheTimestamp) return false;
  return Date.now() - cacheTimestamp < CACHE_TTL_MS;
}

async function loadAllQuestions(): Promise<PoolQuestion[]> {
  const { data, error } = await supabaseAdmin
    .from('question_pool')
    .select('*');

  if (error) {
    throw new Error(`Failed to fetch question pool: ${error.message}`);
  }

  if (!data) {
    return [];
  }

  cachedQuestions = data as PoolQuestion[];
  cacheTimestamp = Date.now();
  return cachedQuestions;
}

/* ------------------------------------------------------------------ */
/*  Exported Functions                                                 */
/* ------------------------------------------------------------------ */

/**
 * Returns all questions available for the given assessment version.
 *
 * Uses an in-memory cache with a 1-hour TTL. If the cache is stale or
 * empty, fetches all questions from the Supabase `question_pool` table
 * and filters by version_availability.
 */
export async function getQuestionPool(version: AssessmentVersion): Promise<PoolQuestion[]> {
  let allQuestions: PoolQuestion[];

  if (isCacheValid()) {
    allQuestions = cachedQuestions!;
  } else {
    allQuestions = await loadAllQuestions();
  }

  return allQuestions.filter((q) =>
    q.version_availability.includes(version),
  );
}

/**
 * Returns questions available for a version, excluding the given IDs.
 *
 * Useful for selecting the next chunk of questions without repeating
 * any that have already been served.
 */
export async function getAvailableQuestions(
  version: AssessmentVersion,
  excludeIds: string[],
): Promise<PoolQuestion[]> {
  const pool = await getQuestionPool(version);
  const excludeSet = new Set(excludeIds);
  return pool.filter((q) => !excludeSet.has(q.id));
}

/**
 * Returns a single question by ID, or null if not found.
 *
 * Ensures the cache is loaded before searching.
 */
export async function getQuestionById(id: string): Promise<PoolQuestion | null> {
  // Load cache if not already loaded
  if (!isCacheValid()) {
    await loadAllQuestions();
  }

  const question = cachedQuestions?.find((q) => q.id === id) ?? null;
  return question;
}

/**
 * Invalidates the cache, forcing a reload on the next call.
 */
export function invalidateCache(): void {
  cachedQuestions = null;
  cacheTimestamp = null;
}
