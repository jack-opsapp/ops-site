/**
 * SPEC confirmation — per-tier payment-schedule presentation.
 * Authority: ops-software-bible/SPEC/10_TIER_MODEL_V2.md § 2/§ 5/§ 6.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  buildConfirmationSchedule,
  confirmationTotalDisplay,
  stopStatusLabel,
  type ScheduleProjectState,
} from '../confirmation-schedule';

const NO_PROJECT = null;

function projectState(
  overrides: Partial<ScheduleProjectState> = {}
): ScheduleProjectState {
  return {
    scope_doc_signed_at: null,
    midpoint_accepted_at: null,
    walkthrough_completed_at: null,
    locked_total_cents: null,
    ...overrides,
  };
}

test('spec01 runs 3 stops — 50/50 with an evidence-only scope sign-off', () => {
  const stops = buildConfirmationSchedule({ tier: 'spec01', project: NO_PROJECT });
  assert.deepEqual(
    stops.map((s) => s.key),
    ['p1', 'p2', 'p4']
  );
  assert.deepEqual(
    stops.map((s) => s.ordinalLabel),
    ['01', '02', '03']
  );
  assert.deepEqual(
    stops.map((s) => s.amountLabel),
    ['$1,000', null, '$1,000']
  );
  assert.deepEqual(
    stops.map((s) => s.kind),
    ['payment', 'evidence', 'payment']
  );
  assert.deepEqual(
    stops.map((s) => s.status),
    ['complete', 'current', 'upcoming']
  );
});

test('spec01 completed scope stop reads SIGNED, payments read PAID', () => {
  const stops = buildConfirmationSchedule({
    tier: 'spec01',
    project: projectState({ scope_doc_signed_at: '2026-07-16T00:00:00Z' }),
  });
  assert.deepEqual(
    stops.map((s) => s.status),
    ['complete', 'complete', 'current']
  );
  assert.equal(stopStatusLabel(stops[0]), 'PAID');
  assert.equal(stopStatusLabel(stops[1]), 'SIGNED');
  assert.equal(stopStatusLabel(stops[2]), 'CURRENT');
});

test('spec01 ignores midpoint timestamps — no midpoint stop exists', () => {
  const stops = buildConfirmationSchedule({
    tier: 'spec01',
    project: projectState({ midpoint_accepted_at: '2026-07-16T00:00:00Z' }),
  });
  assert.deepEqual(
    stops.map((s) => s.status),
    ['complete', 'current', 'upcoming']
  );
});

test('spec01 walkthrough completes the rail', () => {
  const stops = buildConfirmationSchedule({
    tier: 'spec01',
    project: projectState({ walkthrough_completed_at: '2026-07-16T00:00:00Z' }),
  });
  assert.deepEqual(
    stops.map((s) => s.status),
    ['complete', 'complete', 'complete']
  );
});

test('spec02 runs 4 equal checkpoints of $1,875', () => {
  const stops = buildConfirmationSchedule({ tier: 'spec02', project: NO_PROJECT });
  assert.deepEqual(
    stops.map((s) => s.key),
    ['p1', 'p2', 'p3', 'p4']
  );
  assert.deepEqual(
    stops.map((s) => s.ordinalLabel),
    ['P1', 'P2', 'P3', 'P4']
  );
  assert.deepEqual(
    stops.map((s) => s.amountLabel),
    ['$1,875', '$1,875', '$1,875', '$1,875']
  );
  assert.ok(stops.every((s) => s.kind === 'payment'));
});

test('completion is monotone — a later timestamp completes earlier stops', () => {
  const stops = buildConfirmationSchedule({
    tier: 'spec02',
    project: projectState({ midpoint_accepted_at: '2026-07-16T00:00:00Z' }),
  });
  assert.deepEqual(
    stops.map((s) => s.status),
    ['complete', 'complete', 'complete', 'current']
  );
});

test('spec03 before lock — deposit fixed, later amounts are the — empty state', () => {
  const stops = buildConfirmationSchedule({ tier: 'spec03', project: NO_PROJECT });
  assert.deepEqual(
    stops.map((s) => s.amountLabel),
    ['$6,250', '—', '—', '—']
  );
  assert.equal(stops[1].detail, 'Your total locks here.');
  assert.ok(stops.every((s) => s.kind === 'payment'));
});

test('spec03 after lock — exact thirds from the locked total', () => {
  const stops = buildConfirmationSchedule({
    tier: 'spec03',
    project: projectState({ locked_total_cents: 4_000_000 }),
  });
  assert.deepEqual(
    stops.map((s) => s.amountLabel),
    ['$6,250', '$11,250', '$11,250', '$11,250']
  );
  assert.equal(stops[1].detail, 'Funds build kickoff.');
});

test('spec03 rejects malformed locked totals (below floor / non-integer)', () => {
  for (const locked_total_cents of [100_000, 2_499_999, 2_500_000.5]) {
    const stops = buildConfirmationSchedule({
      tier: 'spec03',
      project: projectState({ locked_total_cents }),
    });
    assert.deepEqual(
      stops.map((s) => s.amountLabel),
      ['$6,250', '—', '—', '—'],
      `locked_total_cents=${locked_total_cents} must degrade to unlocked`
    );
  }
});

test('unknown tier degrades to the generic rail with no amounts', () => {
  for (const tier of [null, 'setup', 'build', 'enterprise', 'spec04']) {
    const stops = buildConfirmationSchedule({ tier, project: NO_PROJECT });
    assert.equal(stops.length, 4, `tier=${tier}`);
    assert.ok(stops.every((s) => s.amountLabel === null));
    assert.deepEqual(
      stops.map((s) => s.ordinalLabel),
      ['P1', 'P2', 'P3', 'P4']
    );
  }
});

test('total cell — fixed tiers', () => {
  assert.deepEqual(
    confirmationTotalDisplay({ tier: 'spec01', project: NO_PROJECT, fullPriceCents: null }),
    { value: '$2,000', hint: '50/50 · second half at delivery' }
  );
  assert.deepEqual(
    confirmationTotalDisplay({ tier: 'spec02', project: NO_PROJECT, fullPriceCents: null }),
    { value: '$7,500', hint: 'across 4 checkpoints' }
  );
});

test('total cell — spec03 shows the floor until locked, exact after', () => {
  assert.deepEqual(
    confirmationTotalDisplay({ tier: 'spec03', project: NO_PROJECT, fullPriceCents: null }),
    { value: 'from $25,000', hint: 'locks at scope sign-off' }
  );
  assert.deepEqual(
    confirmationTotalDisplay({
      tier: 'spec03',
      project: projectState({ locked_total_cents: 4_000_000 }),
      fullPriceCents: null,
    }),
    { value: '$40,000', hint: 'locked at scope sign-off' }
  );
});

test('total cell — spec03 honors metadata full_price as fallback, guarded', () => {
  assert.deepEqual(
    confirmationTotalDisplay({ tier: 'spec03', project: NO_PROJECT, fullPriceCents: 3_000_000 }),
    { value: '$30,000', hint: 'locked at scope sign-off' }
  );
  // Below the floor → not a legitimate locked total.
  assert.deepEqual(
    confirmationTotalDisplay({ tier: 'spec03', project: NO_PROJECT, fullPriceCents: 100_000 }),
    { value: 'from $25,000', hint: 'locks at scope sign-off' }
  );
});

test('total cell — unknown tier is the bare empty state', () => {
  assert.deepEqual(
    confirmationTotalDisplay({ tier: 'setup', project: NO_PROJECT, fullPriceCents: null }),
    { value: '—', hint: null }
  );
});
