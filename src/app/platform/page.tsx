/**
 * Platform page — Feature deep-dive with alternating FeatureBlocks,
 * competitor comparison table, and bottom CTA.
 */

import type { Metadata } from 'next';
import PlatformHero from '@/components/platform/PlatformHero';
import FeatureBlock from '@/components/platform/FeatureBlock';
import ComparisonSection from '@/components/platform/ComparisonSection';
import BottomCTA from '@/components/shared/BottomCTA';
import { Divider } from '@/components/ui';

export const metadata: Metadata = {
  title: 'Platform',
  description:
    'Every tool your crew needs. Project management, scheduling, invoicing, and more — built for the trades.',
};

export default function PlatformPage() {
  return (
    <>
      <PlatformHero />

      <FeatureBlock
        label="PROJECT MANAGEMENT"
        heading="EVERY JOB. ORGANIZED."
        body="Photos, notes, tasks, budget — all in one place. Your crew opens a project and sees everything they need. No hunting through emails."
        direction="left"
      />

      <Divider />

      <FeatureBlock
        label="SCHEDULING"
        heading="YOUR CREW KNOWS WHERE TO GO"
        body="Daily schedule, job details, site address. Open the app, see today's work. No Monday morning group texts."
        direction="right"
      />

      <Divider />

      <FeatureBlock
        label="TEAM MANAGEMENT"
        heading="KNOW WHO'S WHERE"
        body="See your whole crew at a glance. Who's on which job, who's available, who's on the way. Real-time, no phone calls."
        direction="left"
      />

      <Divider />

      <FeatureBlock
        label="CLIENT MANAGEMENT"
        heading="YOUR CLIENTS. YOUR WAY."
        body="Contact info, project history, communication log. Everything about a client in one tap."
        direction="right"
      />

      <Divider />

      <FeatureBlock
        label="INVOICING"
        heading="GET PAID. MOVE ON."
        body="Create estimates, convert to invoices, send to client. Track what's paid and what's outstanding. No spreadsheet required."
        direction="left"
      />

      <Divider />

      <FeatureBlock
        label="JOB BOARD"
        heading="YOUR PIPELINE. VISUALIZED."
        body="See every job from lead to completion. Drag, drop, done. Know exactly where every project stands."
        direction="right"
      />

      <ComparisonSection />

      <BottomCTA
        heading="START RUNNING YOUR OPERATION"
        buttonText="SEE PLANS"
        buttonHref="/plans"
      />
    </>
  );
}
