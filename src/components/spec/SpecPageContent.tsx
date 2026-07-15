'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import type { Dictionary } from '@/i18n/types';
import SpecHero from './SpecHero';
import HowItWorks from './HowItWorks';
import SpecPricing, { type PackageData } from './SpecPricing';
import WhatsIncluded from './WhatsIncluded';
import SpecFAQ from './SpecFAQ';
import SpecBottomCTA from './SpecBottomCTA';
import SpecOpsBoard, { type SpecOpsBoardCopy } from './SpecOpsBoard';
import SpecGuarantees from './SpecGuarantees';
import SpecStickyDepositBar from './SpecStickyDepositBar';
import SpecFitQuestionnaire, { type FitQuestionnaireCopy } from './SpecFitQuestionnaire';
import { SpecPageAnalytics } from './SpecPageAnalytics';
import SpecPhoneWrapper from './phone-scene/SpecPhoneWrapper';
import type { SpecPhase } from './phone-scene/constants';
import type { SpecBoardSnapshot, SpecBoardTier } from '@/lib/spec/board';
import {
  TIER_MILESTONE_SHAPE,
  computeTierCheckpoints,
  formatCad,
  type SpecTier,
} from '@/lib/spec/pricing';

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

const STEP_PHASES: SpecPhase[] = ['packages', 'analysis', 'building', 'custom'];

export function SpecPageContent({
  dict,
  depositsEnabled,
  boardSnapshot,
  initialFit,
}: SpecPageContentProps) {
  const [phonePhase, setPhonePhase] = useState<SpecPhase>('home');
  const [phoneTier, setPhoneTier] = useState<string | null>(null);
  const [isInHero, setIsInHero] = useState(true);
  const [fit, setFit] = useState<SpecTier | null>(initialFit);
  const [questionnaireOpen, setQuestionnaireOpen] = useState(false);

  const heroRef = useRef<HTMLDivElement>(null);
  const phoneScopeRef = useRef<HTMLDivElement>(null);
  const phoneContainerRef = useRef<HTMLDivElement>(null);

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

  // Phone scrolls up and out of view when user passes pricing
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

  const handleStepChange = useCallback((step: number) => {
    setPhonePhase(STEP_PHASES[step] ?? 'home');
    setPhoneTier(null);
  }, []);

  const handleTierSelect = useCallback((tier: string | null) => {
    setPhonePhase('custom');
    // The phone scene (another team's surface — read-only here) keys its
    // tier-reactive screens on the v1 slugs. Bridge v2 → v1 at the mount so
    // its visuals keep working without touching phone-scene internals.
    const PHONE_SCENE_TIER: Record<string, string> = {
      spec01: 'setup',
      spec02: 'build',
      spec03: 'enterprise',
    };
    setPhoneTier(tier ? (PHONE_SCENE_TIER[tier] ?? tier) : null);
  }, []);

  const openQuestionnaire = useCallback(() => setQuestionnaireOpen(true), []);

  const handleFitComplete = useCallback((tier: SpecTier) => {
    setFit(tier);
    setQuestionnaireOpen(false);
    // Persist the result to a shareable URL param (a co-owner opening
    // /spec?fit=<tier> lands on the same highlight). replaceState keeps the
    // back button clean.
    const url = new URL(window.location.href);
    url.searchParams.set('fit', tier);
    window.history.replaceState({}, '', url);
    // Resolve by scrolling to the packages — reduced-motion aware.
    const prefersReduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    requestAnimationFrame(() => {
      document
        .getElementById('packages')
        ?.scrollIntoView({ behavior: prefersReduced ? 'auto' : 'smooth', block: 'start' });
    });
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

  const fitQuestionnaireCopy: FitQuestionnaireCopy = {
    eyebrow: t(dict, 'questionnaire.eyebrow'),
    title: t(dict, 'questionnaire.title'),
    back: t(dict, 'questionnaire.back'),
    close: t(dict, 'questionnaire.close'),
    questions: [
      {
        key: 'scope',
        question: t(dict, 'questionnaire.q1.question'),
        options: [
          { value: 'configure', label: t(dict, 'questionnaire.q1.configure') },
          { value: 'one_module', label: t(dict, 'questionnaire.q1.one_module') },
          { value: 'rebuild', label: t(dict, 'questionnaire.q1.rebuild') },
        ],
      },
      {
        key: 'timeline',
        question: t(dict, 'questionnaire.q2.question'),
        options: [
          { value: 'rush', label: t(dict, 'questionnaire.q2.rush') },
          { value: 'few_weeks', label: t(dict, 'questionnaire.q2.few_weeks') },
          { value: 'no_rush', label: t(dict, 'questionnaire.q2.no_rush') },
        ],
      },
      {
        key: 'team',
        question: t(dict, 'questionnaire.q3.question'),
        options: [
          { value: 'solo', label: t(dict, 'questionnaire.q3.solo') },
          { value: 'small', label: t(dict, 'questionnaire.q3.small') },
          { value: 'large', label: t(dict, 'questionnaire.q3.large') },
        ],
      },
      {
        key: 'budget',
        question: t(dict, 'questionnaire.q4.question'),
        options: [
          { value: 'low', label: t(dict, 'questionnaire.q4.low') },
          { value: 'mid', label: t(dict, 'questionnaire.q4.mid') },
          { value: 'high', label: t(dict, 'questionnaire.q4.high') },
        ],
      },
    ],
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
              ctaHowItWorks={t(dict, 'hero.ctaHowItWorks')}
              founderEyebrow={t(dict, 'hero.founderEyebrow')}
              founderLine={t(dict, 'hero.founderLine')}
            />
          </div>

          <div className="max-w-[720px] px-6 sm:px-10 md:px-16 lg:px-24">
            <HowItWorks
              sectionLabel={t(dict, 'process.sectionLabel')}
              steps={[
                { number: t(dict, 'process.step1.number'), title: t(dict, 'process.step1.title'), desc: t(dict, 'process.step1.desc') },
                { number: t(dict, 'process.step2.number'), title: t(dict, 'process.step2.title'), desc: t(dict, 'process.step2.desc') },
                { number: t(dict, 'process.step3.number'), title: t(dict, 'process.step3.title'), desc: t(dict, 'process.step3.desc') },
                { number: t(dict, 'process.step4.number'), title: t(dict, 'process.step4.title'), desc: t(dict, 'process.step4.desc') },
              ]}
              onActiveStepChange={handleStepChange}
            />
          </div>
        </div>
      </div>

      {/* OPS BOARD — full-width, breaks out of the 55% column so the
          tactical table reads end-to-end on desktop and the timeline
          has room to breathe. */}
      <SpecOpsBoard initialSnapshot={boardSnapshot} copy={boardCopy} />

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

      <WhatsIncluded
        sectionLabel={t(dict, 'included.sectionLabel')}
        items={(dict['included.every'] as string[]) ?? []}
        ongoingLabel={t(dict, 'included.ongoingLabel')}
        ongoingItems={(dict['included.ongoing'] as string[]) ?? []}
      />

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
        copy={fitQuestionnaireCopy}
        onClose={() => setQuestionnaireOpen(false)}
        onComplete={handleFitComplete}
      />
    </main>
  );
}
