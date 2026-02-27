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
        heading="STOP HUNTING THROUGH TEXTS FOR JOB DETAILS"
        body="Photos buried in your camera roll. Notes in three different group chats. Scope changes nobody saw. OPS keeps everything about a job in one place — photos, notes, tasks, budget. Your crew opens a project and the whole picture is right there."
        direction="left"
      />

      <Divider />

      <FeatureBlock
        label="SCHEDULING"
        heading={'NO MORE \u201CWHERE AM I GOING TODAY?\u201D'}
        body="Monday morning. Five texts before 7am. 'What's the address?' 'Who am I riding with?' 'Did the scope change?' OPS puts the daily schedule, job details, and site address in front of your crew before they leave the driveway."
        direction="right"
      />

      <Divider />

      <FeatureBlock
        label="TEAM MANAGEMENT"
        heading="STOP CALLING AROUND TO FIND YOUR CREW"
        body="Job site needs another hand. You call three guys to find one who's available. OPS shows your whole crew at a glance — who's on which job, who's free, who's en route. Reassign in one tap, not five phone calls."
        direction="left"
      />

      <Divider />

      <FeatureBlock
        label="CLIENT MANAGEMENT"
        heading={'CLIENT CALLS. YOU\u2019RE NOT SCRAMBLING.'}
        body="Client calls about their project. You're scrolling through texts trying to remember what you promised last week. OPS keeps every client's contact info, project history, and notes in one place. One tap and you sound like you've got it together — because you do."
        direction="right"
      />

      <Divider />

      <FeatureBlock
        label="INVOICING"
        heading={'THE JOB\u2019S DONE. WHY HAVEN\u2019T YOU INVOICED.'}
        body="You finished the job two weeks ago. The invoice is still in your head. That's money sitting on someone else's table. OPS lets you build estimates, convert to invoices, and send to clients — right from the job site. Track what's paid and what's outstanding without a spreadsheet."
        direction="left"
      />

      <Divider />

      <FeatureBlock
        label="JOB BOARD"
        heading="NOTHING FALLS THROUGH THE CRACKS"
        body="That lead from three weeks ago. The follow-up you forgot. The job that's been 'almost done' for a month. OPS shows every job from first call to final invoice. You see exactly where everything stands and what needs attention next."
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
