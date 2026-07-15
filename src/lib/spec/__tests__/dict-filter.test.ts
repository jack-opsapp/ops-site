/**
 * Phase-0 dictionary filter — deposit-claim scoping.
 *
 * The filter exists so crawlers + AI agents never see "Pay $X Deposit"
 * claims in the RSC payload while SPEC_LIVE_DEPOSITS_ENABLED is false.
 * It must strip ONLY package deposit claims + the confirmation flow —
 * never generic `.ctaText` keys (the live BOTTOMCTA.CTATEXT bug,
 * 10_TIER_MODEL_V2 § 8.10).
 */
import assert from 'node:assert/strict';
import { test } from 'node:test';

import { filterDepositClaims } from '../dict-filter';

const SAMPLE: Record<string, unknown> = {
  'bottomCta.ctaText': 'SEE THE PACKAGES',
  'bottomCta.heading': 'THE MACHINE IS WAITING.',
  'packages.spec01.ctaText': 'Pay $1,000 Deposit',
  'packages.spec01.deposit': '$1,000 deposit',
  'packages.spec02.ctaText': 'Pay $1,875 Deposit',
  'packages.spec03.deposit': '$6,250 deposit',
  'packages.spec01.name': 'SPEC-01',
  'packages.spec02.tagline': 'Your operation’s backbone, run for you',
  'confirmation.heading': 'DEPOSIT CONFIRMED',
  'confirmation.timeline.spec01': 'Slot locked',
  'questionnaire.entryCta': 'START',
  'guide.result.ctaTrial': 'START FREE — 30 DAYS',
};

test('bottomCta.ctaText and other non-package CTAs survive', () => {
  const filtered = filterDepositClaims(SAMPLE);
  assert.equal(filtered['bottomCta.ctaText'], 'SEE THE PACKAGES');
  assert.equal(filtered['bottomCta.heading'], 'THE MACHINE IS WAITING.');
  assert.equal(filtered['questionnaire.entryCta'], 'START');
  assert.equal(filtered['guide.result.ctaTrial'], 'START FREE — 30 DAYS');
});

test('package deposit claims are stripped', () => {
  const filtered = filterDepositClaims(SAMPLE);
  assert.equal(filtered['packages.spec01.ctaText'], undefined);
  assert.equal(filtered['packages.spec01.deposit'], undefined);
  assert.equal(filtered['packages.spec02.ctaText'], undefined);
  assert.equal(filtered['packages.spec03.deposit'], undefined);
});

test('non-deposit package copy survives', () => {
  const filtered = filterDepositClaims(SAMPLE);
  assert.equal(filtered['packages.spec01.name'], 'SPEC-01');
  assert.equal(filtered['packages.spec02.tagline'], 'Your operation’s backbone, run for you');
});

test('the confirmation flow is stripped wholesale', () => {
  const filtered = filterDepositClaims(SAMPLE);
  assert.equal(filtered['confirmation.heading'], undefined);
  assert.equal(filtered['confirmation.timeline.spec01'], undefined);
});
