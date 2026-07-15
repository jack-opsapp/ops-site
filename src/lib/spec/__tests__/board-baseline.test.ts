import assert from 'node:assert/strict';
import { test } from 'node:test';

import { parseIsoYearWeek } from '../board-display';
import { toUtcDay, upcomingMonday } from '../timeline';
import {
  SPEC_BOARD_BASELINE,
  buildBaselineSnapshot,
  toIsoYearWeek,
} from '../board-baseline';

test('baseline is a FALLBACK snapshot, never marked live', () => {
  const snap = buildBaselineSnapshot(new Date(Date.UTC(2026, 5, 9)));
  assert.equal(snap.is_stale, true);
  assert.equal(snap.refreshed_at, null);
  assert.equal(snap.tiers.length, 3);
});

test('baseline is not a dead all-OPEN / 0-waitlist grid', () => {
  const snap = buildBaselineSnapshot(new Date(Date.UTC(2026, 5, 9)));
  const byTier = Object.fromEntries(snap.tiers.map((t) => [t.tier, t]));
  assert.equal(byTier.setup.availability, 'OPEN');
  assert.equal(byTier.build.availability, 'LIMITED');
  assert.equal(byTier.enterprise.availability, 'WAITLIST');
  assert.equal(byTier.build.waitlist_bucket, '1-2');
  assert.equal(byTier.enterprise.waitlist_bucket, '3+');
  for (const row of snap.tiers) assert.equal(row.is_accepting_bookings, true);
});

test('baseline rolls each tier next-intake forward from today', () => {
  const today = new Date(Date.UTC(2026, 5, 9, 15, 30)); // mid-day UTC, any weekday
  const snap = buildBaselineSnapshot(today);
  const baseMonday = upcomingMonday(toUtcDay(today));

  for (const b of SPEC_BOARD_BASELINE) {
    const row = snap.tiers.find((t) => t.tier === b.tier)!;
    assert.equal(row.availability, b.availability);
    assert.equal(row.waitlist_bucket, b.waitlist_bucket);

    const expectedStart = new Date(baseMonday);
    expectedStart.setUTCDate(baseMonday.getUTCDate() + b.startOffsetWeeks * 7);
    assert.notEqual(row.next_start_week, null);
    assert.deepEqual(
      parseIsoYearWeek(row.next_start_week as string),
      expectedStart,
      `${b.tier} next_start_week must round-trip to its rolled Monday`,
    );
  }
});

test('toIsoYearWeek round-trips Mondays across a year boundary', () => {
  // Walk 60 consecutive Mondays from late 2025 into 2026; each must survive
  // toIsoYearWeek → parseIsoYearWeek unchanged (this is what guarantees the
  // baseline dates render correctly through buildLiveRows).
  let monday = upcomingMonday(new Date(Date.UTC(2025, 11, 1)));
  for (let i = 0; i < 60; i++) {
    const iso = toIsoYearWeek(monday);
    assert.deepEqual(parseIsoYearWeek(iso), monday, `round-trip failed for ${iso}`);
    const next = new Date(monday);
    next.setUTCDate(monday.getUTCDate() + 7);
    monday = next;
  }
});
