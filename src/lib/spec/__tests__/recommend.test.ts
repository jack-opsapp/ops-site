import assert from 'node:assert/strict';
import { test } from 'node:test';

import { recommend, type FitAnswers } from '../recommend';

test('coherent answer sets map to their tier', () => {
  assert.equal(
    recommend({ scope: 'configure', timeline: 'rush', team: 'solo', budget: 'low' }),
    'setup',
  );
  assert.equal(
    recommend({ scope: 'one_module', timeline: 'few_weeks', team: 'small', budget: 'mid' }),
    'build',
  );
  assert.equal(
    recommend({ scope: 'rebuild', timeline: 'no_rush', team: 'large', budget: 'high' }),
    'enterprise',
  );
});

test('ties bias to Build (the middle tier)', () => {
  // scope=configure (setup+2) vs timeline+team pulling build (+2) → setup/build tie.
  assert.equal(
    recommend({ scope: 'configure', timeline: 'few_weeks', team: 'small', budget: 'high' }),
    'build',
  );
  // No answers at all → every tier tied at 0 → Build.
  assert.equal(recommend({}), 'build');
});

test('a tie without Build resolves to the more conservative tier', () => {
  // setup+2 (configure) vs enterprise+2 (no_rush + large), build 0 → setup, not enterprise.
  assert.equal(
    recommend({ scope: 'configure', timeline: 'no_rush', team: 'large', budget: 'high' }),
    'setup',
  );
});

test('budget is a ceiling — never recommends above the stated band', () => {
  const enterpriseNeed: FitAnswers = { scope: 'rebuild', timeline: 'no_rush', team: 'large' };
  // Same enterprise-shaped need, three budgets → clamped down, never up.
  assert.equal(recommend({ ...enterpriseNeed, budget: 'high' }), 'enterprise');
  assert.equal(recommend({ ...enterpriseNeed, budget: 'mid' }), 'build');
  assert.equal(recommend({ ...enterpriseNeed, budget: 'low' }), 'setup');
});

test('budget never inflates a small need', () => {
  // Setup-shaped need + the biggest budget still recommends Setup.
  assert.equal(
    recommend({ scope: 'configure', timeline: 'rush', team: 'solo', budget: 'high' }),
    'setup',
  );
});

test('missing budget leaves the need unclamped', () => {
  assert.equal(recommend({ scope: 'rebuild', timeline: 'no_rush', team: 'large' }), 'enterprise');
  assert.equal(recommend({ scope: 'one_module' }), 'build');
});
