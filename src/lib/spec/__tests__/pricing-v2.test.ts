/**
 * SPEC Tier Model v2 — pricing constants + per-tier checkpoint shapes.
 * Authority: ops-software-bible/SPEC/10_TIER_MODEL_V2.md § 2/§ 6.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  SPEC_TIERS,
  TIER_TOTAL_CENTS,
  TIER_MILESTONE_SHAPE,
  TIER_CARE_MONTHLY_CENTS,
  TIER_CARE_CHANGE_HOURS,
  WHITE_LABEL_ONE_TIME_CENTS,
  WHITE_LABEL_CARE_BUMP_CENTS,
  CARE_OVERAGE_HOURLY_CENTS,
  computeTierCheckpoints,
  tierDepositCents,
  isValidTier,
} from '../pricing';

test('v2 slugs', () => assert.deepEqual([...SPEC_TIERS], ['spec01', 'spec02', 'spec03']));

test('totals: 2k / 7.5k / 25k floor', () => {
  assert.equal(TIER_TOTAL_CENTS.spec01, 200_000);
  assert.equal(TIER_TOTAL_CENTS.spec02, 750_000);
  assert.equal(TIER_TOTAL_CENTS.spec03, 2_500_000);
});

test('milestone shapes declared per tier', () => {
  assert.deepEqual(TIER_MILESTONE_SHAPE, {
    spec01: 'half_half',
    spec02: 'quarters',
    spec03: 'floor_quarters',
  });
});

test('spec01 is 50/50', () => {
  const c = computeTierCheckpoints('spec01');
  assert.deepEqual(
    c.map((x) => x.cents),
    [100_000, 100_000],
  );
  assert.deepEqual(
    c.map((x) => x.key),
    ['p1', 'p4'],
  ); // deposit + delivery; scope sign-off carries no payment
});

test('spec02 is quarters of 7500', () => {
  assert.deepEqual(
    computeTierCheckpoints('spec02').map((x) => x.cents),
    [187_500, 187_500, 187_500, 187_500],
  );
});

test('spec03 floor: p1 fixed, remainder split on locked total', () => {
  const c = computeTierCheckpoints('spec03', 3_100_000); // $31,000 locked
  assert.equal(c[0].cents, 625_000);
  assert.equal(
    c.slice(1).reduce((s, x) => s + x.cents, 0),
    3_100_000 - 625_000,
  );
  assert.equal(
    Math.max(...c.slice(1).map((x) => x.cents)) - Math.min(...c.slice(1).map((x) => x.cents)) <= 1,
    true,
  ); // residual cents on p4 only
  assert.deepEqual(computeTierCheckpoints('spec03').map((x) => x.cents)[0], 625_000); // no locked total yet → floor
});

test('deposits: 1000 / 1875 / 6250 dollars', () => {
  assert.equal(tierDepositCents('spec01'), 100_000);
  assert.equal(tierDepositCents('spec02'), 187_500);
  assert.equal(tierDepositCents('spec03'), 625_000);
});

test('care: none / 395 (2h) / 750 (3h); white label +4000 / +200; overage 200', () => {
  assert.equal(TIER_CARE_MONTHLY_CENTS.spec01, null);
  assert.equal(TIER_CARE_MONTHLY_CENTS.spec02, 39_500);
  assert.equal(TIER_CARE_MONTHLY_CENTS.spec03, 75_000);
  assert.deepEqual(TIER_CARE_CHANGE_HOURS, { spec01: null, spec02: 2, spec03: 3 });
  assert.equal(WHITE_LABEL_ONE_TIME_CENTS, 400_000);
  assert.equal(WHITE_LABEL_CARE_BUMP_CENTS, 20_000);
  assert.equal(CARE_OVERAGE_HOURLY_CENTS, 20_000);
});

test('old slugs rejected', () => {
  assert.equal(isValidTier('setup'), false);
  assert.equal(isValidTier('spec02'), true);
});
