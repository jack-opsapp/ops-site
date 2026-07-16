'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import type { Dictionary } from '@/i18n/types';
import SpecHero from './SpecHero';
import SpecPricing, { type PackageData } from './SpecPricing';
import SpecWhiteLabel from './SpecWhiteLabel';
import WhatsIncluded from './WhatsIncluded';
import SpecFAQ from './SpecFAQ';
import SpecBottomCTA from './SpecBottomCTA';
import SpecOpsBoard, { type SpecOpsBoardCopy } from './SpecOpsBoard';
import SpecGuarantees from './SpecGuarantees';
import SpecStickyDepositBar from './SpecStickyDepositBar';
import SpecFitQuestionnaire from './SpecFitQuestionnaire';
import { SpecPageAnalytics } from './SpecPageAnalytics';
import SpecPhoneWrapper from './phone-scene/SpecPhoneWrapper';
import { isSpecTierId, type SpecPhase, type SpecTierId } from './phone-scene/constants';
import type { SpecBoardSnapshot, SpecBoardTier } from '@/lib/spec/board';
import {
  TIER_MILESTONE_SHAPE,
  computeTierCheckpoints,
  formatCad,
  type SpecTier,
} from '@/lib/spec/pricing';
import type { GuideResult } from '@/lib/spec/recommend';

interface SpecPageContentProps {
  dict: Dictionary;
  /**
   * Phase 0 safety flag. When false, package CTAs become "Talk to the
   * founder" links pointing at the contact form, the Stripe API returns
   * 503, and no automated deposits can fire.
   */
  depositsEnabled: boolean;
  /** Server-fetched OPS BOARD snapshot. May be empty + stale on Supabase outage. */
  boardSnapshot: SpecBoardSnapshot;
  /** Fit tier from the ?fit= URL param (shareable questionnaire result), or null. */
  initialFit: SpecTier | null;
}

function t(dict: Dictionary, key: string): string {
  const value = dict[key];
  return typeof value === 'string' ? value : key;
}


export function SpecPageContent({
  dict,
  depositsEnabled,
  boardSnapshot,
  initialFit,
}: SpecPageContentProps) {
  const [phonePhase, setPhonePhase] = useState<SpecPhase>('home');
  const [phoneTier, setPhoneTier] = useState<SpecTierId | null>(null);
  const [isInHero, setIsInHero] = useState(true);
  const [fit, setFit] = useState<SpecTier | null>(initialFit);
  const [questionnaireOpen, setQuestionnaireOpen] = useState(false);

  const heroRef = useRef<HTMLDivElement>(null);
  const phoneScopeRef = useRef<HTMLDivElement>(null);
  const phoneContainerRef = useRef<HTMLDivElement>(null);
  const ladderZoneRef = useRef<HTMLDivElement>(null);
  const boardZoneRef = useRef<HTMLDivElement>(null);
  const buildingZoneRef = useRef<HTMLDivElement>(null);

  // Track hero visibility — phone constrains rotation when hero scrolls out
  useEffect(() => {
    const el = heroRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setIsInHero(entry.isIntersecting),
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // The phone rides out with the hero (its scope) — v2 sections below are
  // full-width, so there is no side lane past the fold. The phase state
  // still tracks the zones and persists, so returning to the hero shows the
  // screen for wherever the visitor explored (a DETAILS click runs that
  // tier's app up here).
  useEffect(() => {
    const handleScroll = () => {
      const scope = phoneScopeRef.current;
      const phone = phoneContainerRef.current;
      if (!scope || !phone) return;

      const rect = scope.getBoundingClientRect();
      if (rect.bottom < window.innerHeight) {
        phone.style.transform = `translateY(${rect.bottom - window.innerHeight}px)`;
      } else {
        phone.style.transform = '';
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Phase choreography — the phone scene morphs as the page's zones cross
  // the viewport's center band (same vocabulary the retired process section
  // used, re-bound to the v2 section order). Tier selects override to
  // 'custom'. Deliberately no reset on zone exit: the last phase persists,
  // which is what lets the hero phone mirror the visitor's journey.
  useEffect(() => {
    const zoneEls: Array<[SpecPhase, HTMLDivElement | null]> = [
      ['packages', ladderZoneRef.current],
      ['analysis', boardZoneRef.current],
      ['building', buildingZoneRef.current],
    ];
    const observers: IntersectionObserver[] = [];
    for (const [phase, el] of zoneEls) {
      if (!el) continue;
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setPhonePhase(phase);
            setPhoneTier(null);
          }
        },
        { rootMargin: '-40% 0px -40% 0px' },
      );
      observer.observe(el);
      observers.push(observer);
    }
    return () => observers.forEach((o) => o.disconnect());
  }, []);

  const handleTierSelect = useCallback((tier: string | null) => {
    setPhonePhase('custom');
    // The scene speaks v2 natively (spec01/spec02/spec03); anything else
    // falls back to the scene's default tier story.
    setPhoneTier(isSpecTierId(tier) ? tier : null);
  }, []);

  const openQuestionnaire = useCallback(() => setQuestionnaireOpen(true), []);

  // Fires the moment the guide computes a result (the modal stays open on
  // its result screen). Applies the card highlight + sticky focal tier for
  // spec01/spec02 fits and persists the shareable ?fit= param — a co-owner
  // opening /spec?fit=<tier> lands on the same highlight. OPS results write
  // ?fit=ops (no card is recommended — the free floor is the answer);
  // founder-conversation results carry no deep link.
  const handleGuideResult = useCallback((result: GuideResult) => {
    setFit(result.fitTier);
    const url = new URL(window.location.href);
    if (result.fitTier) {
      url.searchParams.set('fit', result.fitTier);
    } else if (result.headline === 'ops') {
      url.searchParams.set('fit', 'ops');
    } else {
      url.searchParams.delete('fit');
    }
    window.history.replaceState({}, '', url);
    if (result.fitTier) {
      // Pre-scroll the ladder behind the modal so closing lands on the card.
      const prefersReduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
      requestAnimationFrame(() => {
        document
          .getElementById('packages')
          ?.scrollIntoView({ behavior: prefersReduced ? 'auto' : 'smooth', block: 'start' });
      });
    }
  }, []);

  const checkpointLabels = {
    p1: t(dict, 'packages.milestones.p1'),
    p2: t(dict, 'packages.milestones.p2'),
    p3: t(dict, 'packages.milestones.p3'),
    p4: t(dict, 'packages.milestones.p4'),
  } as const;

  const packages: PackageData[] = (['spec01', 'spec02', 'spec03'] as const).map((tier) => ({
    tier,
    designation: t(dict, `packages.${tier}.designation`),
    tagline: t(dict, `packages.${tier}.tagline`),
    totalLine: t(dict, `packages.${tier}.totalLine`),
    paymentLine: t(dict, `packages.${tier}.paymentLine`),
    careLine: t(dict, `packages.${tier}.careLine`),
    // The real per-tier schedule from pricing.ts. On the floor shape the
    // non-deposit amounts stay "—" — the total locks at scope sign-off.
    checkpoints: computeTierCheckpoints(tier).map((checkpoint) => ({
      key: checkpoint.key,
      label: checkpointLabels[checkpoint.key],
      amount:
        TIER_MILESTONE_SHAPE[tier] === 'floor_quarters' && checkpoint.key !== 'p1'
          ? '—'
          : formatCad(checkpoint.cents),
      isDeposit: checkpoint.key === 'p1',
    })),
    features: (dict[`packages.${tier}.features`] as string[]) ?? [],
    examples: (dict[`packages.${tier}.examples`] as unknown as Array<{ trade: string; desc: string }>) ?? [],
    // When deposits are paused, blank the CTA label so the rendered
    // HTML doesn't leak "Pay $X Deposit" claims to crawlers and AI
    // agents — the visible UI shows "Talk to the founder" instead.
    ctaText: depositsEnabled ? t(dict, `packages.${tier}.ctaText`) : '',
    recommended: tier === 'spec02',
    whiteLabel:
      tier === 'spec03'
        ? {
            label: t(dict, 'whiteLabel.label'),
            line: t(dict, 'whiteLabel.line'),
            priceLine: t(dict, 'whiteLabel.priceLine'),
          }
        : undefined,
  }));

  const boardCopy: SpecOpsBoardCopy = {
    sectionLabel: t(dict, 'board.sectionLabel'),
    subEyebrow: t(dict, 'board.subEyebrow'),
    liveLabel: t(dict, 'board.liveLabel'),
    staleLabel: t(dict, 'board.staleLabel'),
    updatedPrefix: t(dict, 'board.updatedPrefix'),
    updatedJustNow: t(dict, 'board.updatedJustNow'),
    updatedMinAgo: t(dict, 'board.updatedMinAgo'),
    updatedHrAgo: t(dict, 'board.updatedHrAgo'),
    updatedDaysAgo: t(dict, 'board.updatedDaysAgo'),
    unavailableNote: t(dict, 'board.unavailableNote'),
    headers: {
      tier: t(dict, 'board.headers.tier'),
      availability: t(dict, 'board.headers.availability'),
      waitlist: t(dict, 'board.headers.waitlist'),
      nextIntake: t(dict, 'board.headers.nextIntake'),
      yourDelivery: t(dict, 'board.headers.yourDelivery'),
    },
    timeline: {
      today: t(dict, 'board.timeline.today'),
      discovery: t(dict, 'board.timeline.discovery'),
      build: t(dict, 'board.timeline.build'),
      delivery: t(dict, 'board.timeline.delivery'),
    },
    status: {
      open: t(dict, 'board.status.open'),
      limited: t(dict, 'board.status.limited'),
      waitlist: t(dict, 'board.status.waitlist'),
      closed: t(dict, 'board.status.closed'),
    },
    waitlist: {
      zero: t(dict, 'board.waitlist.zero'),
      range: t(dict, 'board.waitlist.range'),
      many: t(dict, 'board.waitlist.many'),
    },
    closedPrefix: t(dict, 'board.closedPrefix'),
    nextStartPrefix: t(dict, 'board.nextStartPrefix'),
    deliveryPrefix: t(dict, 'board.deliveryPrefix'),
    deliveryUnknown: t(dict, 'board.deliveryUnknown'),
    fallback: (['spec01', 'spec02', 'spec03'] as const).reduce(
      (acc, tier) => {
        acc[tier] = {
          nextIntake: t(dict, `board.fallback.${tier}.nextIntake`),
          delivery: t(dict, `board.fallback.${tier}.delivery`),
        };
        return acc;
      },
      {} as Record<SpecBoardTier, { nextIntake: string; delivery: string }>,
    ),
    tierLabels: {
      spec01: t(dict, 'board.tierLabels.spec01'),
      spec02: t(dict, 'board.tierLabels.spec02'),
      spec03: t(dict, 'board.tierLabels.spec03'),
    },
  };

  return (
    <main className="bg-ops-background">
      <SpecPageAnalytics />
      {/* Fixed phone — separate layer, immune to content layout shifts */}
      <div
        ref={phoneContainerRef}
        className="hidden lg:block fixed z-20 top-0 right-0 w-[55%] h-screen will-change-transform"
        aria-hidden="true"
      >
        <SpecPhoneWrapper phase={phonePhase} tier={phoneTier} isInHero={isInHero} />
      </div>

      {/* Content scope — tracked for phone visibility */}
      <div ref={phoneScopeRef}>
        <div className="relative z-10 lg:w-[55%]">
          <div ref={heroRef}>
            <SpecHero
              eyebrow={t(dict, 'hero.eyebrow')}
              heading={t(dict, 'hero.heading')}
              subtitle={t(dict, 'hero.subtitle')}
              ctaPackages={t(dict, 'hero.ctaPackages')}
              ctaGuide={t(dict, 'questionnaire.entryCta')}
              onOpenGuide={openQuestionnaire}
              founderEyebrow={t(dict, 'hero.founderEyebrow')}
              founderLine={t(dict, 'hero.founderLine')}
            />
          </div>
        </div>
      </div>

      {/* v2 section order (10 § 8): ladder + guide entry lead; the board
          follows as proof of live capacity. */}
      <div ref={ladderZoneRef}>
        <SpecPricing
          sectionLabel={t(dict, 'packages.sectionLabel')}
          packages={packages}
        checkpointsLabel={t(dict, 'packages.milestones.label')}
        checkpointsNote={t(dict, 'packages.milestonesNote')}
        examplesLabel={t(dict, 'packages.examplesLabel')}
        careLabel={t(dict, 'packages.retainerLabel')}
        careNote={t(dict, 'packages.retainerNote')}
        subscriptionFootnote={t(dict, 'ongoing.subscriptionNote')}
        guaranteeBadge={t(dict, 'packages.guaranteeBadge')}
        recommendedBadge={t(dict, 'packages.recommendedBadge')}
        detailsToggle={t(dict, 'packages.detailsToggle')}
        depositLedger={t(dict, 'packages.depositLedger')}
        onTierSelect={handleTierSelect}
        depositsEnabled={depositsEnabled}
        contactCtaText={t(dict, 'packages.contactCta')}
        contactCtaHref="/resources#contact"
        highlightedTier={fit}
        yourFitLabel={t(dict, 'questionnaire.resultEyebrow')}
        fitRationale={fit ? t(dict, `questionnaire.rationale.${fit}`) : ''}
        retakeLabel={t(dict, 'questionnaire.retake')}
        entryPrompt={t(dict, 'questionnaire.entryPrompt')}
        entryCta={t(dict, 'questionnaire.entryCta')}
        onOpenQuestionnaire={openQuestionnaire}
        />
      </div>

      {/* OPS BOARD — live capacity proof, after the ladder (10 § 8.4). */}
      <div ref={boardZoneRef}>
        <SpecOpsBoard initialSnapshot={boardSnapshot} copy={boardCopy} />
      </div>

      <div ref={buildingZoneRef}>
        {/* White-label strip — quiet, after the SPEC-03 card zone (10 § 8.6). */}
        <SpecWhiteLabel
          label={t(dict, 'whiteLabel.label')}
          line={t(dict, 'whiteLabel.line')}
          priceLine={t(dict, 'whiteLabel.priceLine')}
          detail={t(dict, 'whiteLabel.detail')}
        />

        <WhatsIncluded
          sectionLabel={t(dict, 'included.sectionLabel')}
          items={(dict['included.every'] as string[]) ?? []}
          ongoingLabel={t(dict, 'included.ongoingLabel')}
          ongoingItems={(dict['included.ongoing'] as string[]) ?? []}
          ongoingFinePrint={[t(dict, 'ongoing.careStartNote'), t(dict, 'ongoing.overageNote')]}
        />
      </div>

      <SpecGuarantees
        sectionLabel={t(dict, 'guarantees.sectionLabel')}
        columns={[
          { title: t(dict, 'guarantees.col1.title'), body: t(dict, 'guarantees.col1.body') },
          { title: t(dict, 'guarantees.col2.title'), body: t(dict, 'guarantees.col2.body') },
          { title: t(dict, 'guarantees.col3.title'), body: t(dict, 'guarantees.col3.body') },
        ]}
        footerPrefix={t(dict, 'guarantees.footerPrefix')}
        footerLinkText={t(dict, 'guarantees.footerLinkText')}
        footerLinkHref={t(dict, 'guarantees.footerLinkHref')}
      />

      {/*
        SocialProof intentionally removed per SPEC/07_ROLLOUT.md § Phase 1 § 3:
        the 500+ / 12,000+ / 85,000+ / $14M+ stats are unverified and must
        come out of both the en/es dictionaries and the page until real
        verifiable numbers exist.
      */}

      <SpecFAQ
        sectionLabel={t(dict, 'faq.sectionLabel')}
        items={(dict['faq.items'] as unknown as Array<{ question: string; answer: string }>) ?? []}
      />

      <SpecBottomCTA
        heading={t(dict, 'bottomCta.heading')}
        subtitle={t(dict, 'bottomCta.subtitle')}
        ctaText={t(dict, 'bottomCta.ctaText')}
        defaultOpsText={t(dict, 'bottomCta.defaultOpsText')}
        defaultOpsHref={t(dict, 'bottomCta.defaultOpsHref')}
      />

      {/* Persistent deposit CTA — reveals after the hero scrolls out. Focal
          tier defaults to SPEC-02 (recommended); the guide repoints it. */}
      <SpecStickyDepositBar
        depositsEnabled={depositsEnabled}
        focalTier={fit ?? 'spec02'}
        boardSnapshot={boardSnapshot}
        copy={boardCopy}
        reserveTemplate={t(dict, 'stickyBar.reserveTemplate')}
        ariaLabel={t(dict, 'stickyBar.ariaLabel')}
        contactCtaText={t(dict, 'packages.contactCta')}
        contactCtaHref="/resources#contact"
        revealAfterRef={heroRef}
        onHelpMeChoose={openQuestionnaire}
        helpMeChooseLabel={t(dict, 'questionnaire.barCta')}
      />

      <SpecFitQuestionnaire
        open={questionnaireOpen}
        dict={dict}
        onClose={() => setQuestionnaireOpen(false)}
        onResult={handleGuideResult}
      />
    </main>
  );
}
