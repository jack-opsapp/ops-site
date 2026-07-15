/**
 * Tier guide v2 — pure routing (no I/O, no React).
 *
 * Method authority: 09_TIER_GUIDE_DESIGN § 3 (the cold/existing branch,
 * every cold question answerable about the prospect's OWN world). Outcome
 * space remapped per 10_TIER_MODEL_V2 § 7: { ops, spec01, spec02,
 * spec03_conversation } with the $399 Data Setup add-on as a rider.
 *
 * Honest-floor rules (load-bearing, tested):
 *  - Ties resolve DOWN; uncertainty (`not_sure`) routes free, always.
 *  - SPEC-03 is NEVER a cold headline — a trade-tool signal surfaces the
 *    founder-conversation escape on whatever the result is.
 *  - Simple bring-my-history is the $399 Data Setup add-on, not a paid tier.
 *  - The free OPS door leads every result it can (the rider/door flags let
 *    the result screen render the floor first).
 */

export type GuideBranch = 'cold' | 'existing';

/** The v2 outcome space (10 § 7). spec03 is a conversation, never a checkout. */
export type GuideOutcome = 'ops' | 'spec01' | 'spec02' | 'spec03_conversation';

export interface ColdAnswers {
  /** C1 — what you run on. */
  c1: 'manual' | 'light_tool';
  /** C2 — your history ('na' when C1 = manual; the question is skipped). */
  c2: 'start_clean' | 'bring_history' | 'na';
  /** C3 — how you're built. */
  c3: 'solo' | 'multi_crew' | 'multi_division';
  /** C4-v2 — THE RE-TYPING: how much lands in your inbox that someone re-types. */
  c4: 'rarely' | 'weekly' | 'constant';
  /** C5-v2 — YOUR TRADE'S TOOL: a whole tool generic software doesn't have. */
  c5: 'no' | 'yes';
  /** C6 — setting it up: yourself or done for you. */
  c6: 'show_me' | 'myself' | 'not_sure' | 'do_for_me';
}

export interface ExistingAnswers {
  /** E1 — the wall(s), multi-select. */
  walls: Array<'setting' | 'stages' | 'fields' | 'data' | 'missing'>;
  /** Disconfirm interstitial — only when 'missing' is checked. */
  disconfirm?: 'is_setting' | 'genuinely_missing';
  /** E2 — migration scope, only when 'data' is checked. */
  e2?: 'simple' | 'incumbent_simple' | 'incumbent_complex';
  /** E3 — build breadth, only when 'missing' survived the disconfirm. */
  e3?: 'one_module' | 'several';
}

export interface GuideResult {
  branch: GuideBranch;
  headline: GuideOutcome;
  /** Driver key — the bracketed "because you said X" line in the dictionary. */
  driver:
    | 'fits_oob'
    | 'guided_self'
    | 'deferred_unsure'
    | 're_typing'
    | 'structure'
    | 'migration'
    | 'setting'
    | 'feature_gap'
    | 'data_setup'
    | 'trade_tool'
    | 'several';
  /** $399 Data Setup add-on note + affordance (the cheap honest floor for history moves). */
  dataSetupRider: boolean;
  /** "Or we wire it for you — $2,000" door on an OPS result with automation pain. */
  spec01Door: boolean;
  /** Trade-tool signal → TELL THE FOUNDER escape (never a cold SPEC-03 headline). */
  founderEscape: boolean;
  /** Existing 'setting' win → the result names the exact screen. */
  settingPointer: boolean;
  /** Card highlight + sticky-bar focal tier; null for ops / founder-conversation results. */
  fitTier: 'spec01' | 'spec02' | null;
}

/** Cold routing (09 § 3.2 method, v2 outcomes). Deterministic; ties resolve down. */
export function recommendCold(a: ColdAnswers): GuideResult {
  const migration = a.c2 === 'bring_history';
  const structural = a.c3 === 'multi_division';
  const automationSignal = a.c4 === 'weekly' || a.c4 === 'constant';
  const tradeToolSignal = a.c5 === 'yes';
  const doneForYou = a.c6 === 'do_for_me';

  let headline: GuideOutcome;
  let driver: GuideResult['driver'];

  if ((doneForYou && (structural || migration)) || (migration && structural)) {
    // A backbone problem: done-for-you with real scope, or a migration
    // across a structurally complex operation.
    headline = 'spec02';
    driver = structural ? 'structure' : 'migration';
  } else if (automationSignal && doneForYou) {
    // Re-typing pain + a stated done-for-you preference — the wedge tier.
    headline = 'spec01';
    driver = 're_typing';
  } else {
    headline = 'ops';
    driver =
      a.c6 === 'show_me' ? 'guided_self' : a.c6 === 'not_sure' ? 'deferred_unsure' : 'fits_oob';
  }

  return {
    branch: 'cold',
    headline,
    driver,
    // Simple history-move rides as the $399 add-on on ANY result — on a paid
    // headline it articulates the cheap floor; structural migration is
    // in-scope for the backbone instead.
    dataSetupRider: migration && !structural,
    spec01Door: headline === 'ops' && automationSignal,
    founderEscape: tradeToolSignal,
    settingPointer: false,
    fitTier: headline === 'spec01' ? 'spec01' : headline === 'spec02' ? 'spec02' : null,
  };
}

/** Existing-user routing (09 § 3.4 method, outcomes remapped per 10 § 7). */
export function recommendExisting(a: ExistingAnswers): GuideResult {
  // The disconfirm catches wrong-but-certain "OPS can't do X" beliefs before
  // any conversation verdict: re-route 'missing' to 'setting'.
  const walls = new Set(a.walls);
  if (walls.has('missing') && a.disconfirm === 'is_setting') {
    walls.delete('missing');
    walls.add('setting');
  }

  const missingSurvives = walls.has('missing');
  const featureGap = walls.has('stages') || walls.has('fields');
  const data = walls.has('data');
  const complexMigration = data && a.e2 === 'incumbent_complex';
  const simpleMigration = data && (a.e2 === 'simple' || a.e2 === 'incumbent_simple');

  // Max-commitment resolution, ties down:
  // conversation (missing) > backbone (feature gap / complex migration) > ops.
  let headline: GuideOutcome;
  let driver: GuideResult['driver'];

  if (missingSurvives) {
    headline = 'spec03_conversation';
    driver = a.e3 === 'several' ? 'several' : 'trade_tool';
  } else if (featureGap || complexMigration) {
    headline = 'spec02';
    driver = featureGap ? 'feature_gap' : 'migration';
  } else if (simpleMigration) {
    headline = 'ops';
    driver = 'data_setup';
  } else {
    headline = 'ops';
    driver = 'setting';
  }

  return {
    branch: 'existing',
    headline,
    driver,
    dataSetupRider: simpleMigration,
    spec01Door: false,
    // A feature gap inside OPS can run deeper than configuration — the
    // founder escape rides every SPEC-02 gap result and every conversation.
    founderEscape: headline === 'spec02' || headline === 'spec03_conversation',
    settingPointer: headline === 'ops' && driver === 'setting',
    fitTier: headline === 'spec02' ? 'spec02' : null,
  };
}
