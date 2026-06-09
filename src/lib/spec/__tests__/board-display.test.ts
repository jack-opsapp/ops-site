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
    setup: { nextIntake: 'NEXT OPEN SLOT', delivery: '1-2 WEEKS' },
    build: { nextIntake: 'NEXT OPEN SLOT', delivery: '2-3 WEEKS' },
    enterprise: { nextIntake: 'NEXT OPEN SLOT', delivery: '4-6 WEEKS' },
  },
  tierLabels: { setup: 'SETUP', build: 'BUILD', enterprise: 'ENTERPRISE' },
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
        tier: 'build',
        availability: 'LIMITED',
        waitlist_bucket: '1-2',
        next_start_week: '2026-02', // Monday 2026-01-05
        is_accepting_bookings: true,
        public_note: null,
      },
      {
        tier: 'setup',
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
  const build = rows.find((r) => r.tier === 'build')!;
  const setup = rows.find((r) => r.tier === 'setup')!;
  const enterprise = rows.find((r) => r.tier === 'enterprise')!;

  // Build: LIMITED, dated next-intake + a projected delivery window.
  // discovery [5,7] + build [14,21] → +19d (JAN 24) to +28d (FEB 02).
  assert.equal(build.availability, 'LIMITED');
  assert.equal(build.waitlistText, '1-2 WAITING');
  assert.equal(build.nextIntakeText, 'STARTS JAN 05');
  assert.equal(build.deliveryText, 'JAN 24 — FEB 02');
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
