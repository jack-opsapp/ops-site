/**
 * Tier guide v2 — persona war-game.
 *
 * Routing authority: 09_TIER_GUIDE_DESIGN § 3 (method) with outcomes
 * remapped per 10_TIER_MODEL_V2 § 7. Honest-floor rules are load-bearing:
 * ties resolve DOWN, `not_sure` is never monetized, SPEC-03 is never a
 * cold headline, and the free floor leads every non-forced result.
 */
import assert from 'node:assert/strict';
import { test } from 'node:test';

import { recommendCold, recommendExisting } from '../recommend';

// ── Cold path ──────────────────────────────────────────────────────────────

test('paper solo DIY → OPS floor (fits_oob)', () => {
  const r = recommendCold({ c1: 'manual', c2: 'na', c3: 'solo', c4: 'rarely', c5: 'no', c6: 'myself' });
  assert.equal(r.headline, 'ops');
  assert.equal(r.driver, 'fits_oob');
  assert.equal(r.dataSetupRider, false);
  assert.equal(r.spec01Door, false);
  assert.equal(r.founderEscape, false);
  assert.equal(r.fitTier, null);
});

test('inbox-drowning + do-for-me → SPEC-01 headline', () => {
  const r = recommendCold({ c1: 'light_tool', c2: 'start_clean', c3: 'solo', c4: 'constant', c5: 'no', c6: 'do_for_me' });
  assert.equal(r.headline, 'spec01');
  assert.equal(r.driver, 're_typing');
  assert.equal(r.fitTier, 'spec01');
});

test('inbox-drowning + myself → OPS + SPEC-01 also-door', () => {
  const r = recommendCold({ c1: 'light_tool', c2: 'start_clean', c3: 'multi_crew', c4: 'weekly', c5: 'no', c6: 'myself' });
  assert.equal(r.headline, 'ops');
  assert.equal(r.spec01Door, true);
});

test('multi-division + migration → SPEC-02 headline, no rider', () => {
  const r = recommendCold({ c1: 'light_tool', c2: 'bring_history', c3: 'multi_division', c4: 'rarely', c5: 'no', c6: 'myself' });
  assert.equal(r.headline, 'spec02');
  assert.equal(r.dataSetupRider, false); // structural migration is in-scope, not the add-on
  assert.equal(r.fitTier, 'spec02');
});

test('do-for-me + migration (no structure) → SPEC-02 headline + Data Setup floor rider', () => {
  const r = recommendCold({ c1: 'light_tool', c2: 'bring_history', c3: 'multi_crew', c4: 'rarely', c5: 'no', c6: 'do_for_me' });
  assert.equal(r.headline, 'spec02');
  assert.equal(r.dataSetupRider, true); // the honest cheap floor under the paid rec
});

test('trade-tool yes NEVER produces a SPEC-03 headline cold — founder escape only', () => {
  const r = recommendCold({ c1: 'manual', c2: 'na', c3: 'solo', c4: 'rarely', c5: 'yes', c6: 'show_me' });
  assert.equal(r.headline, 'ops');
  assert.equal(r.driver, 'guided_self');
  assert.equal(r.founderEscape, true);
});

test('trade-tool yes on a do-for-me automation profile keeps the SPEC-01 headline + escape', () => {
  const r = recommendCold({ c1: 'light_tool', c2: 'start_clean', c3: 'solo', c4: 'constant', c5: 'yes', c6: 'do_for_me' });
  assert.equal(r.headline, 'spec01');
  assert.equal(r.founderEscape, true);
});

test('not_sure is never monetized — even with every paid signal lit', () => {
  const r = recommendCold({ c1: 'light_tool', c2: 'bring_history', c3: 'solo', c4: 'constant', c5: 'yes', c6: 'not_sure' });
  assert.equal(r.headline, 'ops');
  assert.equal(r.driver, 'deferred_unsure');
  assert.equal(r.dataSetupRider, true);
  assert.equal(r.founderEscape, true);
});

test('simple bring-my-history → OPS + $399 Data Setup rider, not a paid tier', () => {
  const r = recommendCold({ c1: 'light_tool', c2: 'bring_history', c3: 'solo', c4: 'rarely', c5: 'no', c6: 'myself' });
  assert.equal(r.headline, 'ops');
  assert.equal(r.dataSetupRider, true);
});

test('anti-upsell guard: do-for-me on a trivial profile stays on the free floor', () => {
  const r = recommendCold({ c1: 'manual', c2: 'na', c3: 'solo', c4: 'rarely', c5: 'no', c6: 'do_for_me' });
  assert.equal(r.headline, 'ops');
});

test('multi_division alone never pulls a self-server off the free floor', () => {
  const r = recommendCold({ c1: 'light_tool', c2: 'start_clean', c3: 'multi_division', c4: 'constant', c5: 'no', c6: 'myself' });
  assert.equal(r.headline, 'ops');
  assert.equal(r.spec01Door, true);
});

test('do-for-me + structure (no migration) → SPEC-02 headline', () => {
  const r = recommendCold({ c1: 'manual', c2: 'na', c3: 'multi_division', c4: 'rarely', c5: 'no', c6: 'do_for_me' });
  assert.equal(r.headline, 'spec02');
  assert.equal(r.driver, 'structure');
});

// ── Existing path ──────────────────────────────────────────────────────────

test('existing: setting only → OPS with the exact-screen pointer', () => {
  const r = recommendExisting({ walls: ['setting'] });
  assert.equal(r.headline, 'ops');
  assert.equal(r.driver, 'setting');
  assert.equal(r.settingPointer, true);
});

test('existing: feature gap (stages) → SPEC-02 headline + founder escape', () => {
  const r = recommendExisting({ walls: ['stages'] });
  assert.equal(r.headline, 'spec02');
  assert.equal(r.driver, 'feature_gap');
  assert.equal(r.founderEscape, true);
});

test('existing: stages AND fields both register (multi-lock, still SPEC-02)', () => {
  const r = recommendExisting({ walls: ['stages', 'fields'] });
  assert.equal(r.headline, 'spec02');
});

test('existing: simple history move → OPS + Data Setup rider, never a $7,500 backbone', () => {
  const r = recommendExisting({ walls: ['data'], e2: 'simple' });
  assert.equal(r.headline, 'ops');
  assert.equal(r.dataSetupRider, true);
  assert.equal(r.driver, 'data_setup');
});

test('existing: incumbent platform, one business → still the $399 add-on', () => {
  const r = recommendExisting({ walls: ['data'], e2: 'incumbent_simple' });
  assert.equal(r.headline, 'ops');
  assert.equal(r.dataSetupRider, true);
});

test('existing: complex migration (platform + divisions) → SPEC-02 backbone', () => {
  const r = recommendExisting({ walls: ['data'], e2: 'incumbent_complex' });
  assert.equal(r.headline, 'spec02');
  assert.equal(r.driver, 'migration');
});

test('existing: wrong-Build belief self-corrects — missing → disconfirm → OPS', () => {
  const r = recommendExisting({ walls: ['missing'], disconfirm: 'is_setting' });
  assert.equal(r.headline, 'ops');
  assert.equal(r.settingPointer, true);
});

test('existing: genuine whole-capability → SPEC-03 founder conversation', () => {
  const r = recommendExisting({ walls: ['missing'], disconfirm: 'genuinely_missing', e3: 'one_module' });
  assert.equal(r.headline, 'spec03_conversation');
  assert.equal(r.fitTier, null); // no deposit card handoff from the guide
});

test('existing: several missing pieces → still a founder conversation', () => {
  const r = recommendExisting({ walls: ['missing'], disconfirm: 'genuinely_missing', e3: 'several' });
  assert.equal(r.headline, 'spec03_conversation');
  assert.equal(r.driver, 'several');
});

test('existing: stages + simple data → SPEC-02 headline carrying the rider', () => {
  const r = recommendExisting({ walls: ['stages', 'data'], e2: 'simple' });
  assert.equal(r.headline, 'spec02');
  assert.equal(r.dataSetupRider, true);
});

test('existing: multi-lock resolves by max-commitment — fields + missing → conversation', () => {
  const r = recommendExisting({ walls: ['fields', 'missing'], disconfirm: 'genuinely_missing', e3: 'one_module' });
  assert.equal(r.headline, 'spec03_conversation');
});

// ── The firewall ───────────────────────────────────────────────────────────

test('firewall: no cold answer combination can produce a spec03 headline', () => {
  const c1s = ['manual', 'light_tool'] as const;
  const c2s = ['start_clean', 'bring_history', 'na'] as const;
  const c3s = ['solo', 'multi_crew', 'multi_division'] as const;
  const c4s = ['rarely', 'weekly', 'constant'] as const;
  const c5s = ['no', 'yes'] as const;
  const c6s = ['show_me', 'myself', 'not_sure', 'do_for_me'] as const;
  for (const c1 of c1s)
    for (const c2 of c2s)
      for (const c3 of c3s)
        for (const c4 of c4s)
          for (const c5 of c5s)
            for (const c6 of c6s) {
              const r = recommendCold({ c1, c2, c3, c4, c5, c6 });
              assert.notEqual(r.headline, 'spec03_conversation');
              // not_sure never CAUSES monetization — it can never upgrade a
              // result. The one exception that may override it is the hard
              // capability lock (migration AND structure → backbone), which
              // the result screen softens with the free-trial dual affordance.
              const hardLock = c2 === 'bring_history' && c3 === 'multi_division';
              if (c6 === 'not_sure' && !hardLock) assert.equal(r.headline, 'ops');
            }
});
