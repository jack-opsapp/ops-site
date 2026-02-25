/**
 * Leadership Assessment — Demo / Element Testbed
 *
 * Showcases interactive assessment elements as they are built.
 * Route: /tools/leadership/demo
 */

'use client';

import { useState } from 'react';
import { SectionLabel, FadeInUp, Divider, Button } from '@/components/ui';
import LikertRadialGauge from '@/components/assessment/LikertRadialGauge';
import SituationalGrid from '@/components/assessment/SituationalGrid';
import ForcedChoiceFork from '@/components/assessment/ForcedChoiceFork';
import ChunkTransition from '@/components/assessment/ChunkTransition';
import GeneratingState from '@/components/assessment/GeneratingState';
import LeadershipSphere from '@/components/assessment/LeadershipSphere';
import type { Dimension, SimpleScores, DimensionSubScores } from '@/lib/assessment/types';

/* ------------------------------------------------------------------ */
/*  Placeholder container for components not yet built                  */
/* ------------------------------------------------------------------ */

function PlaceholderContainer({
  label,
  description,
  height = 'h-[320px]',
}: {
  label: string;
  description: string;
  height?: string;
}) {
  return (
    <FadeInUp>
      <section className="py-[48px]">
        <SectionLabel label={label} className="mb-[16px]" />
        <p className="font-body text-ops-text-secondary text-sm mb-[24px]">
          {description}
        </p>
        <div
          className={`${height} w-full border border-ops-border rounded-[3px] flex items-center`}
        >
          <p className="font-caption text-ops-text-secondary uppercase tracking-[0.2em] text-xs px-[24px]">
            [ NOT YET BUILT ]
          </p>
        </div>
      </section>
    </FadeInUp>
  );
}

/* ------------------------------------------------------------------ */
/*  Live component demos                                               */
/* ------------------------------------------------------------------ */

const MOCK_SCORES: SimpleScores = {
  drive: 78,
  resilience: 65,
  vision: 82,
  connection: 71,
  adaptability: 58,
  integrity: 88,
};

const MOCK_SUB_SCORES: DimensionSubScores = {
  drive: [
    { label: 'Initiative', score: 82, description: 'You consistently step up without being asked. Your ability to identify and act on opportunities before others notice them sets a strong pace for those around you.' },
    { label: 'Urgency', score: 71, description: 'You maintain a solid sense of momentum, though there are moments where higher-priority items could be escalated faster. Building tighter feedback loops will sharpen this.' },
    { label: 'Ambition', score: 80, description: 'Your goal-setting is aspirational and grounded. You set targets that stretch your team without breaking morale — a balance many leaders struggle to find.' },
  ],
  resilience: [
    { label: 'Recovery', score: 60, description: 'Setbacks tend to linger longer than necessary. Developing structured recovery routines — post-mortems, reframing exercises — will help you bounce back faster.' },
    { label: 'Composure', score: 70, description: 'You generally stay steady under pressure, though high-stakes situations can cause visible tension. Intentional breathing and preparation rituals will strengthen this further.' },
  ],
  vision: [
    { label: 'Strategy', score: 85, description: 'You naturally connect short-term actions to long-term objectives. Your strategic instincts allow you to prioritize effectively even with incomplete information.' },
    { label: 'Foresight', score: 78, description: 'You spot emerging trends before they reach the mainstream, giving your team a consistent planning advantage. Expanding your information sources will sharpen this edge.' },
    { label: 'Innovation', score: 83, description: 'You generate creative solutions and encourage experimentation. Your comfort with unconventional approaches inspires your team to think beyond standard playbooks.' },
  ],
  connection: [
    { label: 'Empathy', score: 75, description: 'You read emotional cues well and adjust your communication accordingly. People feel heard in your presence, which builds genuine rapport across teams.' },
    { label: 'Trust', score: 67, description: 'Trust-building is a growth area. Consistent follow-through on smaller commitments will compound into deeper trust over time. Focus on reliability in the day-to-day.' },
  ],
  adaptability: [
    { label: 'Flexibility', score: 55, description: 'You tend to favor proven approaches, which provides stability but can limit responsiveness to change. Experimenting with small pivots in low-risk situations will build this muscle.' },
    { label: 'Learning', score: 61, description: 'Your learning agility is developing. Seeking out unfamiliar challenges and reflecting on what worked (and what didn\'t) will accelerate your growth in new domains.' },
  ],
  integrity: [
    { label: 'Consistency', score: 90, description: 'You are remarkably consistent in your behavior and standards. People know exactly what to expect from you, which is the foundation of organizational trust.' },
    { label: 'Transparency', score: 85, description: 'You communicate openly about decisions, reasoning, and trade-offs. This transparency reduces uncertainty and empowers your team to act with confidence.' },
    { label: 'Ethics', score: 89, description: 'Your ethical compass is strong and unwavering. You make principled decisions even when they carry a personal cost, earning deep respect from those around you.' },
  ],
};

const MOCK_DESCRIPTIONS: Record<Dimension, string> = {
  drive: 'Your Drive score reflects strong initiative (82) and ambition (80), with a steady sense of urgency (71). You consistently push toward goals and take ownership of outcomes without waiting to be asked.',
  resilience: 'Resilience shows room for growth. Your composure under pressure (70) is solid, but recovery from setbacks (60) could strengthen. Building deliberate recovery routines will help you bounce back faster.',
  vision: 'Vision is a clear strength. Strategic thinking (85) and innovation (83) are both high, supported by strong foresight (78). You naturally see the bigger picture and connect emerging trends to long-term opportunity.',
  connection: 'Connection scores show genuine empathy (75) balanced with developing trust-building skills (67). Deepening trust through consistent follow-through will amplify your natural ability to read and relate to others.',
  adaptability: 'Adaptability is your most significant growth area. Both flexibility (55) and learning agility (61) suggest a preference for proven approaches. Experimenting with small, low-risk changes can build this muscle.',
  integrity: 'Integrity is your highest dimension. Consistency (90), ethics (89), and transparency (85) are all exceptional. People around you know exactly what to expect, which is the foundation of lasting leadership influence.',
};

const SITUATIONAL_MOCK = [
  { key: 'a', text: 'Stop the workaround immediately and retrain the team on the proper procedure' },
  { key: 'b', text: 'Report the issue to leadership and propose a compliant alternative that still saves time' },
  { key: 'c', text: 'Allow the workaround to continue while you research whether the guideline is outdated' },
  { key: 'd', text: 'Discuss the situation openly with the team to understand why they made that choice' },
];

const FORCED_CHOICE_MOCK = [
  { key: 'a', text: 'I would rather deliver exactly what I promised, even if it means missing a bigger opportunity.' },
  { key: 'b', text: 'I would rather adapt my commitments when a clearly better opportunity comes along.' },
];

function SituationalGridDemo() {
  const [selected, setSelected] = useState<string | null>(null);
  const [resetKey, setResetKey] = useState(0);

  return (
    <FadeInUp>
      <section className="py-[48px]">
        <SectionLabel label="SITUATIONAL GRID" className="mb-[16px]" />
        <p className="font-body text-ops-text-secondary text-sm mb-[24px]">
          Radial Canvas starburst with 4 interactive nodes at organic cardinal positions.
          Selecting a node triggers angular redistribution — adjacent nodes compress toward the selection.
          DOM text panel below with frosted glass styling.
        </p>
        <SituationalGrid
          key={resetKey}
          options={SITUATIONAL_MOCK}
          onSelect={(key) => setSelected(key)}
        />
        {selected && (
          <p className="font-body text-ops-text-secondary text-sm mt-[16px]">
            Selected: <span className="text-ops-accent">{selected.toUpperCase()}</span>
          </p>
        )}
        <div className="mt-[16px]">
          <Button
            variant="ghost"
            onClick={() => {
              setSelected(null);
              setResetKey((k) => k + 1);
            }}
          >
            Reset
          </Button>
        </div>
      </section>
    </FadeInUp>
  );
}

function ForcedChoiceForkDemo() {
  const [selected, setSelected] = useState<string | null>(null);
  const [resetKey, setResetKey] = useState(0);

  return (
    <FadeInUp>
      <section className="py-[48px]">
        <SectionLabel label="FORCED CHOICE FORK" className="mb-[16px]" />
        <p className="font-body text-ops-text-secondary text-sm mb-[24px]">
          Binary forced-choice selector. Two frosted glass cards; selection highlights one and dims the other.
        </p>
        <ForcedChoiceFork
          key={resetKey}
          options={FORCED_CHOICE_MOCK}
          onSelect={(key) => setSelected(key)}
        />
        {selected && (
          <p className="font-body text-ops-text-secondary text-sm mt-[16px]">
            Selected: <span className="text-ops-accent">{selected.toUpperCase()}</span>
          </p>
        )}
        <div className="mt-[16px]">
          <Button
            variant="ghost"
            onClick={() => {
              setSelected(null);
              setResetKey((k) => k + 1);
            }}
          >
            Reset
          </Button>
        </div>
      </section>
    </FadeInUp>
  );
}

function LikertRadialGaugeDemo() {
  const [selected, setSelected] = useState<number | null>(null);
  const [resetKey, setResetKey] = useState(0);

  return (
    <FadeInUp>
      <section className="py-[48px]">
        <SectionLabel label="LIKERT RADIAL GAUGE" className="mb-[16px]" />
        <p className="font-body text-ops-text-secondary text-sm mb-[24px]">
          Semicircular arc with 5 interactive nodes, ~40 atmospheric background rays with breathing
          animation and mouse proximity effects. Selection triggers a meter fill effect with animated
          fill angle lerp and particle stream along the selected ray.
        </p>
        <div className="w-full border border-ops-border rounded-[3px] overflow-hidden">
          <LikertRadialGauge
            key={resetKey}
            onSelect={(value) => setSelected(value)}
          />
        </div>
        <p className="font-body text-ops-text-secondary text-sm mt-[16px]">
          {selected
            ? <>Selected: <span className="text-ops-accent">{selected}</span></>
            : 'Select a response'
          }
        </p>
        <div className="mt-[16px]">
          <Button
            variant="ghost"
            onClick={() => {
              setSelected(null);
              setResetKey((k) => k + 1);
            }}
          >
            Reset
          </Button>
        </div>
      </section>
    </FadeInUp>
  );
}

function ChunkTransitionDemo() {
  const [completed, setCompleted] = useState(false);
  const [resetKey, setResetKey] = useState(0);

  return (
    <FadeInUp>
      <section className="py-[48px]">
        <SectionLabel label="CHUNK TRANSITION" className="mb-[16px]" />
        <p className="font-body text-ops-text-secondary text-sm mb-[24px]">
          Transition animation between assessment chunks. Particles converge from edges to center, hold briefly, then signal completion.
        </p>
        <div className="h-[400px] w-full border border-ops-border rounded-[3px] overflow-hidden">
          <ChunkTransition
            key={resetKey}
            chunkNumber={2}
            totalChunks={5}
            onComplete={() => setCompleted(true)}
          />
        </div>
        {completed && (
          <p className="font-body text-ops-text-secondary text-sm mt-[16px]">
            Status: <span className="text-ops-accent">COMPLETE</span>
          </p>
        )}
        <div className="mt-[16px]">
          <Button
            variant="ghost"
            onClick={() => {
              setCompleted(false);
              setResetKey((k) => k + 1);
            }}
          >
            Reset
          </Button>
        </div>
      </section>
    </FadeInUp>
  );
}

function GeneratingStateDemo() {
  return (
    <FadeInUp>
      <section className="py-[48px]">
        <SectionLabel label="GENERATING STATE" className="mb-[16px]" />
        <p className="font-body text-ops-text-secondary text-sm mb-[24px]">
          Loading state shown while AI generates analysis. 3D rotating radial burst with ~60 Fibonacci-sphere
          lines, depth-based color gradient, and overlaid status text.
        </p>
        <div className="h-[400px] w-full border border-ops-border rounded-[3px] overflow-hidden">
          <GeneratingState />
        </div>
      </section>
    </FadeInUp>
  );
}

function LeadershipSphereDemo() {
  const [clickedDim, setClickedDim] = useState<string | null>(null);

  return (
    <FadeInUp>
      <section className="py-[48px]">
        <SectionLabel label="LEADERSHIP SPHERE" className="mb-[16px]" />
        <p className="font-body text-ops-text-secondary text-sm mb-[24px]">
          Interactive 3D sphere with 6 dimension vectors in octahedral layout. Free rotation, zoom-to-focus,
          colored sub-nodes with hover scores, and a description panel. Click a node to focus — sub-nodes
          fan out with unique colors. Hover sub-nodes for score values. Drag to rotate freely.
        </p>
        <div className="h-[600px] w-full border border-ops-border rounded-[3px] overflow-hidden">
          <LeadershipSphere
            scores={MOCK_SCORES}
            subScores={MOCK_SUB_SCORES}
            dimensionDescriptions={MOCK_DESCRIPTIONS}
            onDimensionClick={(dim) => setClickedDim(dim)}
            className="w-full h-full"
          />
        </div>
        {clickedDim && (
          <p className="font-body text-ops-text-secondary text-sm mt-[16px]">
            Clicked: <span className="text-ops-accent">{clickedDim.toUpperCase()}</span>
          </p>
        )}
      </section>
    </FadeInUp>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function LeadershipDemoPage() {
  return (
    <main className="bg-ops-background min-h-screen px-[24px] md:px-[48px] lg:px-[96px] py-[64px]">
      {/* Header */}
      <FadeInUp>
        <SectionLabel label="DEMO" className="mb-[16px]" />
        <h1 className="font-heading text-ops-text-primary text-4xl md:text-5xl font-semibold mb-[8px]">
          Assessment Element Demo
        </h1>
        <p className="font-body text-ops-text-secondary text-base mb-[48px]">
          Interactive element testbed for refinement
        </p>
      </FadeInUp>

      <Divider />

      {/* Likert Radial Gauge */}
      <LikertRadialGaugeDemo />

      <Divider />

      {/* Situational Grid */}
      <SituationalGridDemo />

      <Divider />

      {/* Forced Choice Fork */}
      <ForcedChoiceForkDemo />

      <Divider />

      {/* Chunk Transition */}
      <ChunkTransitionDemo />

      <Divider />

      {/* Generating State */}
      <GeneratingStateDemo />

      <Divider />

      {/* Leadership Sphere */}
      <LeadershipSphereDemo />
    </main>
  );
}
