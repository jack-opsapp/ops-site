/**
 * Leadership Assessment — Demo / Element Testbed
 *
 * Showcases interactive assessment elements as they are built.
 * Route: /tools/leadership/demo
 */

'use client';

import { useState } from 'react';
import { SectionLabel, FadeInUp, Divider, Button } from '@/components/ui';
import AmbientBurst from '@/components/assessment/AmbientBurst';
import LikertRadialGauge from '@/components/assessment/LikertRadialGauge';
import SituationalGrid from '@/components/assessment/SituationalGrid';
import ForcedChoiceFork from '@/components/assessment/ForcedChoiceFork';
import ChunkTransition from '@/components/assessment/ChunkTransition';
import GeneratingState from '@/components/assessment/GeneratingState';
import LeadershipSphere from '@/components/assessment/LeadershipSphere';
import type { SimpleScores } from '@/lib/assessment/types';

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
          2x2 frosted glass grid for situational judgment questions. Tap to select; unselected options dim.
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
          Radial gauge for Likert-scale responses. Semicircular arc with 5 interactive square nodes.
          Hover highlights, click selects with particle animation along the ray.
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
          Loading/processing state shown while AI generates analysis. Building hexagonal radar animation.
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
          Interactive 3D sphere with 6 dimension vectors. Draggable, hoverable, clickable nodes.
          Vector lengths correspond to scores. High-score vectors have particle streams.
        </p>
        <div className="h-[500px] w-full border border-ops-border rounded-[3px] overflow-hidden">
          <LeadershipSphere
            scores={MOCK_SCORES}
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

      {/* Ambient Burst */}
      <FadeInUp>
        <section className="py-[48px]">
          <SectionLabel label="AMBIENT BURST" className="mb-[16px]" />
          <p className="font-body text-ops-text-secondary text-sm mb-[24px]">
            Simplified 3D radial burst for atmospheric background. ~60 lines,
            Fibonacci sphere distribution, depth-based color, slow rotation.
          </p>
          <div className="h-[500px] w-full border border-ops-border rounded-[3px] overflow-hidden">
            <AmbientBurst className="w-full h-full" />
          </div>
        </section>
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
