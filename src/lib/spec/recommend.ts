/**
 * SPEC — "Help me choose" recommender.
 *
 * Pure + deterministic mapping from four buyer answers to a recommended
 * tier. No features questions — scope, timeline, crew size, and a budget
 * band only. Kept framework-free + side-effect-free so it is trivially
 * unit-testable and identical on server + client.
 *
 * Model:
 *   1. Score the buyer's NEEDS from scope (weighted strongest), timeline,
 *      and crew size — each answer adds points toward setup / build /
 *      enterprise.
 *   2. Pick the argmax. Ties bias to Build (the middle tier); a tie that
 *      doesn't include Build resolves to the more conservative tier
 *      (setup before enterprise) — never over-sell on a coin-flip.
 *   3. Apply the budget band as a CEILING, never a floor: a buyer can't be
 *      pushed above what they said they'll spend ($5k → setup only, $12k →
 *      build at most), but a big budget never inflates a small need.
 *
 * Budget-as-ceiling is the honest play: recommending an $8,500 Build to a
 * buyer who capped at $5,000 would be the kind of bait the OPS brand exists
 * to kill.
 */

import type { SpecTier } from './pricing';

export type FitScope = 'configure' | 'one_module' | 'rebuild';
export type FitTimeline = 'rush' | 'few_weeks' | 'no_rush';
export type FitTeam = 'solo' | 'small' | 'large';
export type FitBudget = 'low' | 'mid' | 'high';

export interface FitAnswers {
  scope?: FitScope;
  timeline?: FitTimeline;
  team?: FitTeam;
  budget?: FitBudget;
}

/** Ordered tiers, lowest → highest commitment. */
const TIER_ORDER: readonly SpecTier[] = ['setup', 'build', 'enterprise'];

type Score = Record<SpecTier, number>;

const ZERO: Score = { setup: 0, build: 0, enterprise: 0 };

/**
 * Need-signal point tables. Scope is weighted 2× timeline/crew because it
 * is the clearest read on how much custom work the engagement requires.
 */
const SCOPE_POINTS: Record<FitScope, Score> = {
  configure: { setup: 2, build: 0, enterprise: 0 },
  one_module: { setup: 0, build: 2, enterprise: 0 },
  rebuild: { setup: 0, build: 0, enterprise: 2 },
};

const TIMELINE_POINTS: Record<FitTimeline, Score> = {
  rush: { setup: 1, build: 0, enterprise: 0 }, // fastest → setup
  few_weeks: { setup: 0, build: 1, enterprise: 0 },
  no_rush: { setup: 0, build: 0, enterprise: 1 }, // longest runway → enterprise
};

const TEAM_POINTS: Record<FitTeam, Score> = {
  solo: { setup: 1, build: 0, enterprise: 0 },
  small: { setup: 0, build: 1, enterprise: 0 },
  large: { setup: 0, build: 0, enterprise: 1 },
};

/** Highest tier each budget band can afford — the recommendation ceiling. */
const BUDGET_CEILING: Record<FitBudget, SpecTier> = {
  low: 'setup', // up to ~$5k → only Setup ($3k) fits
  mid: 'build', // $5-12k → Build ($8.5k) fits, Enterprise ($18k) does not
  high: 'enterprise', // $12k+ → any tier
};

function add(into: Score, points: Score | undefined): Score {
  if (!points) return into;
  return {
    setup: into.setup + points.setup,
    build: into.build + points.build,
    enterprise: into.enterprise + points.enterprise,
  };
}

/**
 * Argmax over the score with deterministic tie-breaking: prefer Build when
 * it is tied for the lead, otherwise the more conservative tied tier.
 */
function pickNeed(score: Score): SpecTier {
  const max = Math.max(score.setup, score.build, score.enterprise);
  const tied = TIER_ORDER.filter((t) => score[t] === max);
  if (tied.includes('build')) return 'build';
  if (tied.includes('setup')) return 'setup';
  return 'enterprise';
}

/** Clamp a tier so it never exceeds the ceiling (by commitment order). */
function clampToCeiling(tier: SpecTier, ceiling: SpecTier): SpecTier {
  return TIER_ORDER.indexOf(tier) > TIER_ORDER.indexOf(ceiling) ? ceiling : tier;
}

export function recommend(answers: FitAnswers): SpecTier {
  let score = ZERO;
  if (answers.scope) score = add(score, SCOPE_POINTS[answers.scope]);
  if (answers.timeline) score = add(score, TIMELINE_POINTS[answers.timeline]);
  if (answers.team) score = add(score, TEAM_POINTS[answers.team]);

  const need = pickNeed(score);

  // No budget answered → no ceiling (treat as unconstrained).
  if (!answers.budget) return need;
  return clampToCeiling(need, BUDGET_CEILING[answers.budget]);
}
