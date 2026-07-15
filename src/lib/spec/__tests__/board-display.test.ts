import assert from 'node:assert/strict';
import { test } from 'node:test';

import type { SpecBoardSnapshot } from '../board';
import {
  availabilityLabel,
  availabilityTone,
  parseIsoYearWeek,
  selectDisplayRows,
  type SpecOpsBoardCopy,
} from '../board-display';

/** Minimal copy fixture mirroring the en/spec.json board keys. */
const copy: SpecOpsBoardCopy = {
  sectionLabel: 'OPS BOARD',
  subEyebrow: 'Current SPEC intake capacity',
  liveLabel: 'LIVE',
  staleLabel: 'FALLBACK',
  updatedPrefix: 'UPDATED',
  updatedJustNow: 'JUST NOW',
  updatedMinAgo: 'MIN AGO',
  updatedHrAgo: 'HR AGO',
  updatedDaysAgo: 'DAYS AGO',
  unavailableNote: 'Live board offline. Static intake windows shown.',
  headers: {
    tier: 'TIER',
    availability: 'AVAILABILITY',
    waitlist: 'WAITLIST',
    nextIntake: 'NEXT INTAKE',
    yourDelivery: 'YOUR DELIVERY',
  },
  timeline: { today: 'TODAY', discovery: 'DISCOVERY', build: 'BUILD', delivery: 'DELIVERY' },
  status: { open: 'OPEN', limited: 'LIMITED', waitlist: 'WAITLIST', closed: 'CLOSED' },
  waitlist: { zero: '0 WAITING', range: '1-2 WAITING', many: '3+ WAITING' },
  closedPrefix: 'CLOSED — RESUMES',
  nextStartPrefix: 'STARTS',
  deliveryPrefix: 'DELIVERS',
  deliveryUnknown: 'DELIVERY TBD',
  fallback: {
    spec01: { nextIntake: 'NEXT OPEN SLOT', delivery: '1-2 WEEKS' },
    spec02: { nextIntake: 'NEXT OPEN SLOT', delivery: '2-3 WEEKS' },
    spec03: { nextIntake: 'NEXT OPEN SLOT', delivery: '4-6 WEEKS' },
  },
  tierLabels: { spec01: 'SPEC-01', spec02: 'SPEC-02', spec03: 'SPEC-03' },
};

test('parseIsoYearWeek resolves the ISO-8601 Monday', () => {
  // 2026-01-01 is a Thursday → week 1's Monday is 2025-12-29.
  assert.deepEqual(parseIsoYearWeek('2026-01'), new Date(Date.UTC(2025, 11, 29)));
  assert.deepEqual(parseIsoYearWeek('2026-02'), new Date(Date.UTC(2026, 0, 5)));
  assert.equal(parseIsoYearWeek('not-a-week'), null);
  assert.equal(parseIsoYearWeek('2026-99'), null);
});

test('selectDisplayRows falls back to dictionary defaults when no tiers', () => {
  const snapshot: SpecBoardSnapshot = { tiers: [], refreshed_at: null, is_stale: true };
  const rows = selectDisplayRows(snapshot, copy);
  assert.equal(rows.length, 3);
  for (const row of rows) {
    assert.equal(row.availability, 'OPEN');
    assert.equal(row.waitlistText, '0 WAITING');
    assert.equal(row.startMonday, null);
    assert.equal(row.nextIntakeText, 'NEXT OPEN SLOT');
  }
});

test('selectDisplayRows projects dated windows for a populated snapshot', () => {
  const snapshot: SpecBoardSnapshot = {
    tiers: [
      {
        tier: 'spec02',
        availability: 'LIMITED',
        waitlist_bucket: '1-2',
        next_start_week: '2026-02', // Monday 2026-01-05
        is_accepting_bookings: true,
        public_note: null,
      },
      {
        tier: 'spec01',
        availability: 'OPEN',
        waitlist_bucket: '0',
        next_start_week: null,
        is_accepting_bookings: false,
        public_note: 'Q3',
      },
    ],
    refreshed_at: '2026-01-01T00:00:00.000Z',
    is_stale: false,
  };

  const rows = selectDisplayRows(snapshot, copy);
  const build = rows.find((r) => r.tier === 'spec02')!;
  const setup = rows.find((r) => r.tier === 'spec01')!;
  const enterprise = rows.find((r) => r.tier === 'spec03')!;

  // SPEC-02: LIMITED, dated next-intake + a projected delivery window.
  // discovery [5,10] + build [15,25] → +20d (JAN 25) to +35d (FEB 09).
  assert.equal(build.availability, 'LIMITED');
  assert.equal(build.waitlistText, '1-2 WAITING');
  assert.equal(build.nextIntakeText, 'STARTS JAN 05');
  assert.equal(build.deliveryText, 'JAN 25 — FEB 09');
  assert.deepEqual(build.startMonday, new Date(Date.UTC(2026, 0, 5)));

  // Setup: not accepting → CLOSED with the public note + unknown delivery.
  assert.equal(setup.availability, 'CLOSED');
  assert.equal(setup.isAcceptingBookings, false);
  assert.equal(setup.nextIntakeText, 'CLOSED — RESUMES Q3');
  assert.equal(setup.deliveryText, 'DELIVERY TBD');

  // Enterprise absent from the snapshot → OPEN dictionary defaults.
  assert.equal(enterprise.availability, 'OPEN');
  assert.equal(enterprise.nextIntakeText, 'NEXT OPEN SLOT');
});

test('availability tone + label map to tokens and copy', () => {
  assert.equal(availabilityTone('OPEN'), 'text-ops-olive');
  assert.equal(availabilityTone('LIMITED'), 'text-ops-tan');
  assert.equal(availabilityTone('WAITLIST'), 'text-ops-tan');
  assert.equal(availabilityTone('CLOSED'), 'text-ops-rose');
  assert.equal(availabilityLabel('OPEN', copy), 'OPEN');
  assert.equal(availabilityLabel('CLOSED', copy), 'CLOSED');
});
