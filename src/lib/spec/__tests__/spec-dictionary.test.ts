import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import {
  SPEC_TIERS,
  formatCad,
  tierDepositCents,
  tierTotalCents,
  type SpecTier,
} from '../pricing';

type SpecDictionary = Record<string, unknown>;

function loadDict(locale: 'en' | 'es'): SpecDictionary {
  const url = new URL(`../../../i18n/dictionaries/${locale}/spec.json`, import.meta.url);
  return JSON.parse(readFileSync(url, 'utf8')) as SpecDictionary;
}

function requiredString(dict: SpecDictionary, key: string): string {
  const value = dict[key];
  if (typeof value !== 'string') {
    assert.fail(`${key} must be a string`);
  }
  assert.notEqual(value, key, `${key} must not render as its translation key`);
  assert.notEqual(value.trim(), '', `${key} must not be blank`);
  return value;
}

function escaped(value: string): RegExp {
  return new RegExp(value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
}

function assertTierCopy(dict: SpecDictionary, tier: SpecTier) {
  const deposit = formatCad(tierDepositCents(tier));
  const total = formatCad(tierTotalCents(tier));

  assert.match(requiredString(dict, `packages.${tier}.startFrom`), escaped(deposit));
  assert.match(requiredString(dict, `packages.${tier}.headlineSub`), escaped(total));
  assert.equal(requiredString(dict, `packages.${tier}.milestoneAmount`), deposit);
  assert.match(requiredString(dict, `packages.${tier}.ctaText`), escaped(deposit));

  // v2 schema (10_TIER_MODEL_V2 § 2): designation lockup, total, payment
  // shape, and care line — the four numbers-facing strings every card renders.
  assert.match(requiredString(dict, `packages.${tier}.designation`), /^SPEC-0[123] · /);
  assert.match(requiredString(dict, `packages.${tier}.totalLine`), escaped(total));
  assert.match(requiredString(dict, `packages.${tier}.paymentLine`), escaped(deposit));
  requiredString(dict, `packages.${tier}.careLine`);
  requiredString(dict, `packages.${tier}.tagline`);
}

test('SPEC dictionaries expose all customer-facing package pricing keys', () => {
  for (const locale of ['en', 'es'] as const) {
    const dict = loadDict(locale);

    for (const tier of SPEC_TIERS) assertTierCopy(dict, tier);

    for (const key of [
      'hero.founderEyebrow',
      'hero.founderLine',
      'packages.milestones.label',
      'packages.milestones.p1',
      'packages.milestones.p2',
      'packages.milestones.p3',
      'packages.milestones.p4',
      'packages.milestonesNote',
      'packages.examplesLabel',
      'packages.subscriptionLabel',
      'packages.subscriptionNote',
      'packages.retainerLabel',
      'packages.retainerNote',
      'packages.guaranteeBadge',
      'board.sectionLabel',
      'board.subEyebrow',
      'board.liveLabel',
      'board.staleLabel',
      'board.updatedPrefix',
      'board.updatedJustNow',
      'board.updatedMinAgo',
      'board.updatedHrAgo',
      'board.updatedDaysAgo',
      'board.unavailableNote',
      'board.headers.tier',
      'board.headers.availability',
      'board.headers.waitlist',
      'board.headers.nextIntake',
      'board.headers.yourDelivery',
      'board.timeline.today',
      'board.timeline.discovery',
      'board.timeline.build',
      'board.timeline.delivery',
      'board.status.open',
      'board.status.limited',
      'board.status.waitlist',
      'board.status.closed',
      'board.waitlist.zero',
      'board.waitlist.range',
      'board.waitlist.many',
      'board.closedPrefix',
      'board.nextStartPrefix',
      'board.deliveryPrefix',
      'board.deliveryUnknown',
      'guarantees.sectionLabel',
      'guarantees.col1.title',
      'guarantees.col1.body',
      'guarantees.col2.title',
      'guarantees.col2.body',
      'guarantees.col3.title',
      'guarantees.col3.body',
      'guarantees.footerPrefix',
      'guarantees.footerLinkText',
      'guarantees.footerLinkHref',
      'bottomCta.heading',
      'bottomCta.subtitle',
      'bottomCta.ctaText',
      'bottomCta.defaultOpsText',
      'bottomCta.defaultOpsHref',
    ]) {
      requiredString(dict, key);
    }

    for (const tier of SPEC_TIERS) {
      requiredString(dict, `board.fallback.${tier}.nextIntake`);
      requiredString(dict, `board.fallback.${tier}.delivery`);
      requiredString(dict, `board.tierLabels.${tier}`);
    }

    // v2 white-label strip + ongoing-costs fine print (flat numbers only).
    for (const key of [
      'whiteLabel.label',
      'whiteLabel.line',
      'whiteLabel.priceLine',
      'whiteLabel.detail',
      'ongoing.overageNote',
      'ongoing.careStartNote',
      'ongoing.subscriptionNote',
    ]) {
      requiredString(dict, key);
    }

    // v2 retired the per-tier percentage payment claim — process step 1 must
    // carry no percentage at all (payment shapes differ per tier) and no
    // "may increase" hedging survives anywhere in the ongoing strings.
    assert.doesNotMatch(requiredString(dict, 'process.step1.desc'), /\d+\s?%/);
    const ongoingItems = (dict['included.ongoing'] as unknown as string[]) ?? [];
    assert.ok(ongoingItems.length >= 4, 'included.ongoing must carry the flat-number list');
    for (const line of [
      ...ongoingItems,
      requiredString(dict, 'ongoing.overageNote'),
      requiredString(dict, 'ongoing.subscriptionNote'),
    ]) {
      assert.doesNotMatch(line, /may increase|puede aumentar/i);
    }
  }
});
