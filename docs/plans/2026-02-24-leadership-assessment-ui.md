# Leadership Assessment UI — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build the full assessment UI with custom Canvas 2D interactive elements, matching the OPS design system and StarburstCanvas animation patterns.

**Architecture:** 5-screen flow orchestrated by a client-side state machine (`AssessmentShell`). Canvas 2D for interactive elements (radial gauge, chunk transitions, results sphere, share card). Framer Motion for DOM transitions. Server Actions for all backend calls. Results page is a separate route with shareable token URL.

**Tech Stack:** Next.js 16 (App Router), React 19, Canvas 2D API, Framer Motion 12, Tailwind 4, TypeScript, existing UI components (`Card`, `Button`, `SectionLabel`, `FadeInUp`)

---

## Reference Files

Before starting any task, read these files to understand the codebase patterns:

| File | Why |
|------|-----|
| `src/components/animations/StarburstCanvas.tsx` | Canvas 2D pattern: DPI handling, RAF loop, 3D rotation, drag physics, resize, hover detection |
| `src/lib/theme.ts` | Design tokens: colors, fonts, spacing, animation configs |
| `src/app/globals.css` | Tailwind v4 `@theme` tokens, reduced-motion media query |
| `src/components/ui/index.ts` | Available UI components: `Card`, `Button`, `SectionLabel`, `FadeInUp`, `Divider` |
| `src/components/ui/Card.tsx` | Card pattern: `bg-ops-surface border border-ops-border rounded-[3px]` |
| `src/components/ui/Button.tsx` | Button pattern: solid + ghost variants, Kosugi caps |
| `src/components/ui/FadeInUp.tsx` | Framer Motion scroll reveal with OPS easing |
| `src/lib/assessment/types.ts` | All assessment types: `ClientQuestion`, `ChunkSubmission`, `AssessmentResult`, etc. |
| `src/lib/assessment/actions.ts` | Server Actions: `startAssessment()`, `submitChunkAndGetNext()`, `submitEmailAndGenerateResults()`, `getResults()` |
| `.interface-design/system.md` | Full design system rules |

## Design System Rules (Non-Negotiable)

- **Text: LEFT-ALIGNED ONLY. NEVER CENTER.** (Exception: Canvas-rendered text is positioned contextually)
- **Colors:** `#0A0A0A` background, `#0D0D0D` surface, `#597794` accent (SPARINGLY), `#999999` secondary text
- **Borders:** `1px solid rgba(255,255,255,0.10)`, hover to `rgba(255,255,255,0.25)`
- **Radius:** `rounded-[3px]` everywhere
- **Typography:** Mohave for headings/body, Kosugi for labels/CTAs (ALL CAPS, tracked)
- **Section labels:** `[ LABEL ]` pattern via `SectionLabel` component
- **Depth:** frosted glass for overlays: `rgba(10,10,10,0.70)` + `backdrop-filter: blur(20px) saturate(1.2)`
- **Animation:** Framer Motion `fadeInUp`, easing `[0.22, 1, 0.36, 1]`, viewport-triggered, once
- **Reduced motion:** ALL Canvas animations must check `prefers-reduced-motion` and render static fallback

## Canvas 2D Pattern (from StarburstCanvas)

Every Canvas component follows this exact architecture:

```typescript
'use client';
import { useRef, useEffect, useCallback } from 'react';

// 1. Types for scene objects
// 2. Constants (colors, physics, dimensions)
// 3. generateScene() — creates static scene data ONCE
// 4. rotate(px, py, pz, yaw, tilt) — 3D rotation (Y-axis then X-axis)
// 5. project(x, y, z, cx, cy) — perspective projection with FOCAL_LENGTH
// 6. lerpColor() — depth-based color interpolation

export default function CanvasComponent({ className }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef(null);
  const animRef = useRef(0);

  // Generate scene once
  if (!sceneRef.current) sceneRef.current = generateScene();

  // DPI-aware resize
  const resize = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const dpr = window.devicePixelRatio || 1;
    const rect = container.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;
    const ctx = canvas.getContext('2d');
    if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }, []);

  useEffect(() => {
    resize();
    window.addEventListener('resize', resize);

    // Check reduced motion
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function draw(timestamp: number) {
      // ... RAF loop: clear, compute, sort, draw
      if (!prefersReduced) animRef.current = requestAnimationFrame(draw);
    }

    if (prefersReduced) {
      // Draw single static frame
      draw(0);
    } else {
      animRef.current = requestAnimationFrame(draw);
    }

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', resize);
    };
  }, [resize]);

  return (
    <div ref={containerRef} className={className} style={{ position: 'relative' }}>
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%' }} />
    </div>
  );
}
```

---

## Task 1: Assessment Shell — Flow Orchestrator

**Files:**
- Create: `src/components/assessment/AssessmentShell.tsx`
- Create: `src/components/assessment/useAssessmentFlow.ts`

**What it does:** Client-side state machine managing the entire assessment flow. Tracks: current step (landing-select → demographics → questions → email → generating → results-redirect), session data, questions, chunk progress.

**State machine steps:**
1. `version-select` — user picks quick/deep (on landing page, not in shell)
2. `demographics` — optional demographics (skippable)
3. `questions` — question flow (chunk by chunk)
4. `email` — email capture
5. `generating` — AI analysis in progress
6. `complete` — redirect to results page

**Step 1: Create the hook `useAssessmentFlow.ts`**

```typescript
'use client';

import { useState, useCallback, useRef } from 'react';
import type {
  AssessmentVersion,
  DemographicContext,
  ClientQuestion,
  ChunkSubmission,
} from '@/lib/assessment/types';
import {
  startAssessment,
  submitChunkAndGetNext,
  submitEmailAndGenerateResults,
} from '@/lib/assessment/actions';

export type FlowStep = 'demographics' | 'questions' | 'chunk-transition' | 'email' | 'generating';

interface FlowState {
  step: FlowStep;
  version: AssessmentVersion;
  sessionId: string | null;
  token: string | null;
  questions: ClientQuestion[];
  currentChunk: number;
  totalChunks: number;
  questionIndex: number; // 0-4 within chunk
  isLoading: boolean;
  error: string | null;
}

export function useAssessmentFlow(version: AssessmentVersion) {
  const [state, setState] = useState<FlowState>({
    step: 'demographics',
    version,
    sessionId: null,
    token: null,
    questions: [],
    currentChunk: 0,
    totalChunks: 0,
    questionIndex: 0,
    isLoading: false,
    error: null,
  });

  const chunkResponsesRef = useRef<ChunkSubmission[]>([]);
  const questionStartTimeRef = useRef<number>(Date.now());

  const begin = useCallback(async (demographics?: DemographicContext) => {
    setState(s => ({ ...s, isLoading: true, error: null }));
    try {
      const result = await startAssessment(version, demographics);
      setState(s => ({
        ...s,
        step: 'questions',
        sessionId: result.sessionId,
        token: result.token,
        questions: result.questions,
        currentChunk: 1,
        totalChunks: result.totalChunks,
        questionIndex: 0,
        isLoading: false,
      }));
      chunkResponsesRef.current = [];
      questionStartTimeRef.current = Date.now();
    } catch (err) {
      setState(s => ({ ...s, isLoading: false, error: (err as Error).message }));
    }
  }, [version]);

  const answerQuestion = useCallback(async (answerValue: number | string) => {
    const { questions, questionIndex, sessionId, currentChunk, totalChunks } = state;
    if (!sessionId) return;

    const question = questions[questionIndex];
    const responseTime = Date.now() - questionStartTimeRef.current;

    chunkResponsesRef.current.push({
      question_id: question.id,
      answer_value: answerValue,
      response_time_ms: responseTime,
    });

    // If not last question in chunk, advance to next question
    if (questionIndex < questions.length - 1) {
      setState(s => ({ ...s, questionIndex: s.questionIndex + 1 }));
      questionStartTimeRef.current = Date.now();
      return;
    }

    // Last question in chunk — submit chunk
    setState(s => ({ ...s, step: 'chunk-transition', isLoading: true }));

    try {
      const result = await submitChunkAndGetNext(sessionId, chunkResponsesRef.current);
      chunkResponsesRef.current = [];

      if (result.complete) {
        setState(s => ({ ...s, step: 'email', isLoading: false }));
      } else {
        setState(s => ({
          ...s,
          step: 'questions',
          questions: result.questions!,
          currentChunk: result.currentChunk,
          questionIndex: 0,
          isLoading: false,
        }));
        questionStartTimeRef.current = Date.now();
      }
    } catch (err) {
      setState(s => ({ ...s, isLoading: false, error: (err as Error).message }));
    }
  }, [state]);

  const submitEmail = useCallback(async (firstName: string, email: string) => {
    if (!state.sessionId) return;
    setState(s => ({ ...s, step: 'generating', isLoading: true }));
    try {
      const { token } = await submitEmailAndGenerateResults(state.sessionId, firstName, email);
      // Return token for redirect
      return token;
    } catch (err) {
      setState(s => ({ ...s, isLoading: false, error: (err as Error).message }));
      return null;
    }
  }, [state.sessionId]);

  return {
    ...state,
    begin,
    answerQuestion,
    submitEmail,
    resetQuestionTimer: () => { questionStartTimeRef.current = Date.now(); },
  };
}
```

**Step 2: Create `AssessmentShell.tsx`**

```typescript
'use client';

import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import type { AssessmentVersion } from '@/lib/assessment/types';
import { useAssessmentFlow } from './useAssessmentFlow';
import DemographicsStep from './DemographicsStep';
import QuestionStep from './QuestionStep';
import ChunkTransition from './ChunkTransition';
import EmailCapture from './EmailCapture';
import GeneratingState from './GeneratingState';

const pageVariants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
};

const pageTransition = {
  duration: 0.4,
  ease: [0.22, 1, 0.36, 1] as const,
};

interface AssessmentShellProps {
  version: AssessmentVersion;
}

export default function AssessmentShell({ version }: AssessmentShellProps) {
  const router = useRouter();
  const flow = useAssessmentFlow(version);

  const handleChunkTransitionComplete = () => {
    // The flow state already has the next questions loaded
    // This just signals the animation is done
  };

  const handleEmailSubmit = async (firstName: string, email: string) => {
    const token = await flow.submitEmail(firstName, email);
    if (token) {
      router.push(`/tools/leadership/${token}`);
    }
  };

  return (
    <div className="min-h-screen bg-ops-background">
      {/* Progress bar — visible during questions */}
      {(flow.step === 'questions' || flow.step === 'chunk-transition') && (
        <ProgressIndicator
          currentChunk={flow.currentChunk}
          totalChunks={flow.totalChunks}
          questionIndex={flow.questionIndex}
          questionsPerChunk={flow.questions.length}
        />
      )}

      <AnimatePresence mode="wait">
        {flow.step === 'demographics' && (
          <motion.div key="demographics" {...pageVariants} transition={pageTransition}>
            <DemographicsStep
              onSubmit={(demo) => flow.begin(demo)}
              onSkip={() => flow.begin()}
              isLoading={flow.isLoading}
            />
          </motion.div>
        )}

        {flow.step === 'questions' && (
          <motion.div key={`q-${flow.currentChunk}-${flow.questionIndex}`} {...pageVariants} transition={pageTransition}>
            <QuestionStep
              question={flow.questions[flow.questionIndex]}
              onAnswer={flow.answerQuestion}
              questionNumber={flow.questionIndex + 1}
              totalInChunk={flow.questions.length}
            />
          </motion.div>
        )}

        {flow.step === 'chunk-transition' && (
          <motion.div key="chunk-transition" {...pageVariants} transition={pageTransition}>
            <ChunkTransition
              chunkNumber={flow.currentChunk}
              totalChunks={flow.totalChunks}
              onComplete={handleChunkTransitionComplete}
            />
          </motion.div>
        )}

        {flow.step === 'email' && (
          <motion.div key="email" {...pageVariants} transition={pageTransition}>
            <EmailCapture onSubmit={handleEmailSubmit} isLoading={flow.isLoading} />
          </motion.div>
        )}

        {flow.step === 'generating' && (
          <motion.div key="generating" {...pageVariants} transition={pageTransition}>
            <GeneratingState />
          </motion.div>
        )}
      </AnimatePresence>

      {flow.error && (
        <div className="fixed bottom-6 left-6 right-6 md:left-auto md:right-6 md:w-96 bg-ops-surface border border-red-500/30 rounded-[3px] p-4 text-sm font-body text-red-400">
          {flow.error}
        </div>
      )}
    </div>
  );
}

/* ---- Progress Indicator ---- */

function ProgressIndicator({
  currentChunk,
  totalChunks,
  questionIndex,
  questionsPerChunk,
}: {
  currentChunk: number;
  totalChunks: number;
  questionIndex: number;
  questionsPerChunk: number;
}) {
  const totalQuestions = totalChunks * questionsPerChunk;
  const answeredSoFar = (currentChunk - 1) * questionsPerChunk + questionIndex;
  const progress = totalQuestions > 0 ? answeredSoFar / totalQuestions : 0;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-[2px] bg-ops-surface">
      <motion.div
        className="h-full bg-ops-accent"
        initial={{ width: 0 }}
        animate={{ width: `${progress * 100}%` }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      />
    </div>
  );
}
```

**Step 3: Run build to verify no import errors**

```bash
cd "/Users/jacksonsweet/Desktop/OPS LTD./ops-site" && npx next build 2>&1 | head -30
```

Note: Build will fail because imported components don't exist yet — that's expected. Verify only TypeScript/import resolution errors at this stage, not missing module errors.

**Step 4: Commit**

```bash
git add src/components/assessment/useAssessmentFlow.ts src/components/assessment/AssessmentShell.tsx
git commit -m "feat(assessment): add flow orchestrator hook and shell component"
```

---

## Task 2: Landing Page — Version Selection

**Files:**
- Create: `src/app/tools/leadership/page.tsx`
- Create: `src/components/assessment/AmbientBurst.tsx`
- Modify: `src/app/tools/page.tsx` (update leadership card link)

**What it does:** The `/tools/leadership` landing page with hero section, two version selection cards, and an ambient Canvas background animation.

**Step 1: Create `AmbientBurst.tsx` — ambient background Canvas**

A simplified starburst: ~60 lines, no nodes, no hover, slow rotation. Pure atmosphere.

```typescript
'use client';

import { useRef, useEffect, useCallback } from 'react';

const LINE_COUNT = 60;
const ROTATION_PERIOD_S = 120;
const TILT_ANGLE = 0.25;
const FOCAL_LENGTH = 2000;
const ACCENT = { r: 89, g: 119, b: 148 };
const GREY = { r: 80, g: 80, b: 80 };

interface AmbientLine {
  dx: number; dy: number; dz: number;
  length: number; // 0.2–0.6
  opacity: number;
}

function generateLines(): AmbientLine[] {
  const lines: AmbientLine[] = [];
  const GOLDEN_ANGLE = Math.PI * (1 + Math.sqrt(5));
  for (let i = 0; i < LINE_COUNT; i++) {
    const phi = Math.acos(1 - 2 * (i + 0.5) / LINE_COUNT);
    const theta = GOLDEN_ANGLE * i;
    lines.push({
      dx: Math.sin(phi) * Math.cos(theta),
      dy: Math.sin(phi) * Math.sin(theta),
      dz: Math.cos(phi),
      length: 0.2 + Math.random() * 0.4,
      opacity: 0.06 + Math.random() * 0.08,
    });
  }
  return lines;
}

function rotate(px: number, py: number, pz: number, yaw: number, tilt: number) {
  const x1 = px * Math.cos(yaw) + pz * Math.sin(yaw);
  const z1 = -px * Math.sin(yaw) + pz * Math.cos(yaw);
  const y1 = py;
  return {
    x: x1,
    y: y1 * Math.cos(tilt) - z1 * Math.sin(tilt),
    z: y1 * Math.sin(tilt) + z1 * Math.cos(tilt),
  };
}

function lerp(a: number, b: number, t: number) { return a + (b - a) * t; }

function lerpColor(back: typeof GREY, front: typeof ACCENT, t: number) {
  return {
    r: Math.round(lerp(back.r, front.r, t)),
    g: Math.round(lerp(back.g, front.g, t)),
    b: Math.round(lerp(back.b, front.b, t)),
  };
}

export default function AmbientBurst({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const linesRef = useRef<AmbientLine[] | null>(null);
  const animRef = useRef(0);

  if (!linesRef.current) linesRef.current = generateLines();

  const resize = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const dpr = window.devicePixelRatio || 1;
    const rect = container.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;
    const ctx = canvas.getContext('2d');
    if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }, []);

  useEffect(() => {
    resize();
    window.addEventListener('resize', resize);
    const lines = linesRef.current!;
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let prevTs: number | null = null;
    let yaw = 0;
    const speed = (Math.PI * 2) / ROTATION_PERIOD_S;

    function draw(ts: number) {
      if (prevTs === null) prevTs = ts;
      const dt = (ts - prevTs) / 1000;
      prevTs = ts;
      yaw = (yaw + speed * dt) % (Math.PI * 2);

      const canvas = canvasRef.current;
      if (!canvas) { animRef.current = requestAnimationFrame(draw); return; }
      const ctx = canvas.getContext('2d');
      if (!ctx) { animRef.current = requestAnimationFrame(draw); return; }

      const w = parseFloat(canvas.style.width) || canvas.width;
      const h = parseFloat(canvas.style.height) || canvas.height;
      const cx = w / 2;
      const cy = h / 2;
      const radius = Math.min(w, h) * 0.45;

      ctx.clearRect(0, 0, w, h);

      for (const line of lines) {
        const ex = line.dx * radius * line.length;
        const ey = line.dy * radius * line.length;
        const ez = line.dz * radius * line.length;
        const r = rotate(ex, ey, ez, yaw, TILT_ANGLE);
        const depthNorm = (r.z / radius + 1) / 2;
        const scale = FOCAL_LENGTH / (FOCAL_LENGTH - r.z);
        const sx = cx + r.x * scale;
        const sy = cy + r.y * scale;
        const { r: cr, g: cg, b: cb } = lerpColor(GREY, ACCENT, depthNorm);

        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(sx, sy);
        ctx.strokeStyle = `rgba(${cr}, ${cg}, ${cb}, ${line.opacity * (0.5 + depthNorm * 0.5)})`;
        ctx.lineWidth = 0.3 + depthNorm * 0.3;
        ctx.stroke();
      }

      if (!prefersReduced) animRef.current = requestAnimationFrame(draw);
    }

    if (prefersReduced) {
      draw(0);
    } else {
      animRef.current = requestAnimationFrame(draw);
    }

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', resize);
    };
  }, [resize]);

  return (
    <div ref={containerRef} className={className} style={{ position: 'relative' }}>
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%' }} />
    </div>
  );
}
```

**Step 2: Create `src/app/tools/leadership/page.tsx`**

```typescript
import type { Metadata } from 'next';
import LeadershipLanding from '@/components/assessment/LeadershipLanding';

export const metadata: Metadata = {
  title: 'Leadership Assessment | OPS',
  description: 'Discover your leadership archetype. AI-adaptive assessment built on validated psychology research. Quick 5-minute or comprehensive 20-minute versions.',
};

export default function LeadershipPage() {
  return <LeadershipLanding />;
}
```

**Step 3: Create `src/components/assessment/LeadershipLanding.tsx`**

This is a `'use client'` component because it handles navigation to the assessment flow. Contains:
- Full-viewport hero with AmbientBurst background
- `[ LEADERSHIP ]` section label
- Headline + subtext (Mohave, left-aligned)
- Two version cards (frosted glass, ultra-thin border)
- Clicking a card navigates into the `AssessmentShell` (or we can use client-side state to toggle)

Architecture decision: Rather than separate pages for each step, the landing page renders `LeadershipLanding` which, when a version is selected, swaps to render `AssessmentShell`. This keeps the URL clean at `/tools/leadership` throughout the flow. Only the results page has a different URL (`/tools/leadership/[token]`).

```typescript
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SectionLabel } from '@/components/ui';
import type { AssessmentVersion } from '@/lib/assessment/types';
import AmbientBurst from './AmbientBurst';
import AssessmentShell from './AssessmentShell';

export default function LeadershipLanding() {
  const [selectedVersion, setSelectedVersion] = useState<AssessmentVersion | null>(null);

  if (selectedVersion) {
    return <AssessmentShell version={selectedVersion} />;
  }

  return (
    <section className="relative min-h-screen flex items-end bg-ops-background overflow-hidden">
      {/* Ambient burst background */}
      <AmbientBurst className="absolute inset-0 opacity-60" />

      {/* Content anchored lower-left */}
      <div className="relative z-10 max-w-[1400px] mx-auto px-6 md:px-10 pb-24 pt-32 w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <SectionLabel label="LEADERSHIP" className="mb-6" />

          <h1 className="font-heading text-4xl md:text-6xl lg:text-7xl font-bold text-ops-text-primary mb-4 max-w-3xl">
            What kind of leader are you?
          </h1>

          <p className="font-body text-lg md:text-xl text-ops-text-secondary mb-12 max-w-xl">
            AI-adaptive assessment built on validated psychology research.
            No account required.
          </p>
        </motion.div>

        {/* Version cards */}
        <div className="flex flex-col md:flex-row gap-4 max-w-2xl">
          <VersionCard
            title="QUICK READ"
            detail="5 minutes. 15 questions. Know your type."
            delay={0.15}
            onClick={() => setSelectedVersion('quick')}
          />
          <VersionCard
            title="DEEP DIVE"
            detail="20 minutes. 50 questions. Know yourself."
            delay={0.25}
            onClick={() => setSelectedVersion('deep')}
          />
        </div>
      </div>
    </section>
  );
}

function VersionCard({
  title,
  detail,
  delay,
  onClick,
}: {
  title: string;
  detail: string;
  delay: number;
  onClick: () => void;
}) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay }}
      onClick={onClick}
      className="
        flex-1 text-left p-6
        bg-[rgba(10,10,10,0.70)] backdrop-blur-[20px] saturate-[1.2]
        border border-ops-border rounded-[3px]
        transition-[border-color] duration-300 hover:border-ops-border-hover
        cursor-pointer group
      "
    >
      <p className="font-caption text-xs uppercase tracking-[0.15em] text-ops-accent mb-2">
        {title}
      </p>
      <p className="font-body text-sm text-ops-text-secondary group-hover:text-ops-text-primary transition-colors duration-300">
        {detail}
      </p>
    </motion.button>
  );
}
```

**Step 4: Update tools page leadership card to link**

In `src/app/tools/page.tsx`, update the leadership tool entry to include an `href`:
```
// Change status from 'development' to 'live' and add href
{
  name: 'LEADERSHIP ASSESSMENT',
  description: 'Evaluate leadership aptitude and team dynamics...',
  status: 'live' as const,
  href: '/tools/leadership',
  illustration: <LeadershipIllustration />,
}
```

(The ToolCard component may need a minor update to support `href` — check its current implementation and add a wrapping Link if needed.)

**Step 5: Commit**

```bash
git add src/app/tools/leadership/page.tsx src/components/assessment/AmbientBurst.tsx src/components/assessment/LeadershipLanding.tsx
git commit -m "feat(assessment): add landing page with ambient burst background and version selection"
```

---

## Task 3: Demographics Step

**Files:**
- Create: `src/components/assessment/DemographicsStep.tsx`

**What it does:** Optional demographics collection. Three rows of pill selectors (team size, years, industry). Skip link at bottom.

**Step 1: Create `DemographicsStep.tsx`**

```typescript
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import type { DemographicContext } from '@/lib/assessment/types';
import { Button, SectionLabel } from '@/components/ui';

const TEAM_SIZES = [
  { value: 'solo', label: 'Solo' },
  { value: '2-5', label: '2-5' },
  { value: '6-15', label: '6-15' },
  { value: '16-50', label: '16-50' },
  { value: '50+', label: '50+' },
] as const;

const YEARS = [
  { value: '<1', label: '< 1 year' },
  { value: '1-3', label: '1-3 years' },
  { value: '4-10', label: '4-10 years' },
  { value: '10+', label: '10+ years' },
] as const;

const INDUSTRIES = [
  { value: 'construction', label: 'Construction' },
  { value: 'trades', label: 'Trades' },
  { value: 'tech', label: 'Tech' },
  { value: 'healthcare', label: 'Healthcare' },
  { value: 'other', label: 'Other' },
] as const;

interface DemographicsStepProps {
  onSubmit: (demo: DemographicContext) => void;
  onSkip: () => void;
  isLoading: boolean;
}

export default function DemographicsStep({ onSubmit, onSkip, isLoading }: DemographicsStepProps) {
  const [teamSize, setTeamSize] = useState<DemographicContext['team_size']>();
  const [years, setYears] = useState<DemographicContext['years_leadership']>();
  const [industry, setIndustry] = useState<DemographicContext['industry']>();

  const handleContinue = () => {
    onSubmit({ team_size: teamSize, years_leadership: years, industry });
  };

  return (
    <div className="min-h-screen flex items-center bg-ops-background">
      <div className="max-w-xl mx-auto px-6 w-full py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <SectionLabel label="ABOUT YOU" className="mb-6" />
          <h2 className="font-heading text-2xl md:text-3xl font-semibold text-ops-text-primary mb-2">
            Help us calibrate your results
          </h2>
          <p className="font-body text-sm text-ops-text-secondary mb-10">
            Optional. Your results are personalized either way.
          </p>
        </motion.div>

        <div className="space-y-8">
          <PillRow
            label="TEAM SIZE"
            options={TEAM_SIZES}
            selected={teamSize}
            onSelect={setTeamSize}
            delay={0.1}
          />
          <PillRow
            label="YEARS LEADING"
            options={YEARS}
            selected={years}
            onSelect={setYears}
            delay={0.15}
          />
          <PillRow
            label="INDUSTRY"
            options={INDUSTRIES}
            selected={industry}
            onSelect={setIndustry}
            delay={0.2}
          />
        </div>

        <motion.div
          className="mt-12 flex items-center gap-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.4 }}
        >
          <Button variant="solid" onClick={handleContinue}>
            {isLoading ? 'STARTING...' : 'CONTINUE'}
          </Button>
          <button
            onClick={onSkip}
            className="font-caption text-xs uppercase tracking-[0.15em] text-ops-text-secondary hover:text-ops-text-primary transition-colors"
            disabled={isLoading}
          >
            Skip
          </button>
        </motion.div>
      </div>
    </div>
  );
}

function PillRow<T extends string>({
  label,
  options,
  selected,
  onSelect,
  delay,
}: {
  label: string;
  options: readonly { value: T; label: string }[];
  selected: T | undefined;
  onSelect: (v: T) => void;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay }}
    >
      <p className="font-caption text-[10px] uppercase tracking-[0.2em] text-ops-text-secondary mb-3">
        {label}
      </p>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onSelect(opt.value)}
            className={`
              px-4 py-2 rounded-[3px] text-sm font-body
              border transition-all duration-200 cursor-pointer
              ${selected === opt.value
                ? 'border-ops-accent text-ops-text-primary bg-ops-accent/10'
                : 'border-ops-border text-ops-text-secondary hover:border-ops-border-hover hover:text-ops-text-primary'
              }
            `}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </motion.div>
  );
}
```

**Step 2: Commit**

```bash
git add src/components/assessment/DemographicsStep.tsx
git commit -m "feat(assessment): add demographics step with pill selectors"
```

---

## Task 4: Question Step — Presenter + Likert Radial Gauge

**Files:**
- Create: `src/components/assessment/QuestionStep.tsx`
- Create: `src/components/assessment/LikertRadialGauge.tsx`
- Create: `src/components/assessment/SituationalGrid.tsx`
- Create: `src/components/assessment/ForcedChoiceFork.tsx`

**What it does:** The core question presentation. `QuestionStep` renders the question text and dispatches to the appropriate answer component based on question type.

The **LikertRadialGauge** is the signature Canvas element: a semicircular arc with 5 nodes radiating from a center point, with hover/selection animations.

**Step 1: Create `QuestionStep.tsx`**

```typescript
'use client';

import type { ClientQuestion } from '@/lib/assessment/types';
import LikertRadialGauge from './LikertRadialGauge';
import SituationalGrid from './SituationalGrid';
import ForcedChoiceFork from './ForcedChoiceFork';

interface QuestionStepProps {
  question: ClientQuestion;
  onAnswer: (value: number | string) => void;
  questionNumber: number;
  totalInChunk: number;
}

export default function QuestionStep({
  question,
  onAnswer,
  questionNumber,
  totalInChunk,
}: QuestionStepProps) {
  return (
    <div className="min-h-screen flex items-center bg-ops-background">
      <div className="max-w-3xl mx-auto px-6 w-full py-24">
        {/* Chunk question counter */}
        <p className="font-caption text-[10px] uppercase tracking-[0.2em] text-ops-text-secondary mb-8">
          {questionNumber} of {totalInChunk}
        </p>

        {/* Question text */}
        <h2 className="font-heading text-xl md:text-2xl lg:text-3xl font-medium text-ops-text-primary mb-12 max-w-2xl leading-snug">
          {question.text}
        </h2>

        {/* Answer component */}
        {question.type === 'likert' && (
          <LikertRadialGauge onSelect={(value) => onAnswer(value)} />
        )}

        {question.type === 'situational' && question.options && (
          <SituationalGrid
            options={question.options}
            onSelect={(key) => onAnswer(key)}
          />
        )}

        {question.type === 'forced_choice' && question.options && (
          <ForcedChoiceFork
            options={question.options}
            onSelect={(key) => onAnswer(key)}
          />
        )}
      </div>
    </div>
  );
}
```

**Step 2: Create `LikertRadialGauge.tsx` — The signature Canvas interaction**

This is the most important custom animation. A semicircular arc with 5 nodes. Each node sits at the end of a thin ray extending from a center point. Nodes correspond to the 1-5 Likert scale.

Architecture:
- Canvas 2D, DPI-aware
- 5 rays arranged in a ~160° arc (from -80° to +80° from top)
- Each ray has a small square node at its tip
- Hover: node pulses, accent color, line brightens
- Click/tap: selected node expands with accent glow, particles stream from center to node
- Other nodes dim on selection
- Labels rendered on canvas below each node

```typescript
'use client';

import { useRef, useEffect, useCallback, useState } from 'react';

const ACCENT = { r: 89, g: 119, b: 148 };
const GREY = { r: 100, g: 100, b: 100 };
const WHITE = { r: 255, g: 255, b: 255 };

const LABELS = ['Strongly\nDisagree', 'Disagree', 'Neutral', 'Agree', 'Strongly\nAgree'];
const NODE_COUNT = 5;
const ARC_SPAN = Math.PI * 0.85; // ~153 degrees total arc
const BASE_NODE_SIZE = 6;
const HOVER_NODE_SIZE = 10;
const SELECTED_NODE_SIZE = 12;
const RAY_LENGTH_FRACTION = 0.7; // fraction of radius

// Particle system for selected state
interface Particle {
  progress: number; // 0-1 along ray
  speed: number;
  opacity: number;
}

interface LikertRadialGaugeProps {
  onSelect: (value: number) => void;
}

export default function LikertRadialGauge({ onSelect }: LikertRadialGaugeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animRef = useRef(0);
  const hoveredRef = useRef(-1);
  const selectedRef = useRef(-1);
  const particlesRef = useRef<Particle[][]>(Array.from({ length: NODE_COUNT }, () => []));
  const [, forceRender] = useState(0);

  const resize = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const dpr = window.devicePixelRatio || 1;
    const rect = container.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;
    const ctx = canvas.getContext('2d');
    if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }, []);

  const getNodePositions = useCallback((w: number, h: number) => {
    const cx = w / 2;
    const cy = h * 0.85; // Center point near bottom
    const radius = Math.min(w * 0.42, h * 0.7);
    const startAngle = -Math.PI / 2 - ARC_SPAN / 2;

    return Array.from({ length: NODE_COUNT }, (_, i) => {
      const angle = startAngle + (ARC_SPAN / (NODE_COUNT - 1)) * i;
      const rayLen = radius * RAY_LENGTH_FRACTION;
      return {
        x: cx + Math.cos(angle) * rayLen,
        y: cy + Math.sin(angle) * rayLen,
        cx, cy, angle, rayLen,
      };
    });
  }, []);

  const handleInteraction = useCallback((clientX: number, clientY: number, isClick: boolean) => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const rect = container.getBoundingClientRect();
    const mx = clientX - rect.left;
    const my = clientY - rect.top;
    const w = parseFloat(canvas.style.width);
    const h = parseFloat(canvas.style.height);
    const positions = getNodePositions(w, h);

    let closest = -1;
    let closestDist = 24; // hit radius

    for (let i = 0; i < positions.length; i++) {
      const dx = mx - positions[i].x;
      const dy = my - positions[i].y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < closestDist) {
        closestDist = dist;
        closest = i;
      }
    }

    if (isClick && closest >= 0) {
      selectedRef.current = closest;
      // Spawn particles for selected ray
      particlesRef.current[closest] = Array.from({ length: 8 }, () => ({
        progress: Math.random() * 0.3,
        speed: 0.008 + Math.random() * 0.006,
        opacity: 0.6 + Math.random() * 0.4,
      }));
      forceRender(n => n + 1);
      // Delay the callback to let the selection animation play
      setTimeout(() => onSelect(closest + 1), 600);
    }

    hoveredRef.current = closest;
  }, [getNodePositions, onSelect]);

  useEffect(() => {
    resize();
    window.addEventListener('resize', resize);
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function draw() {
      const canvas = canvasRef.current;
      if (!canvas) { animRef.current = requestAnimationFrame(draw); return; }
      const ctx = canvas.getContext('2d');
      if (!ctx) { animRef.current = requestAnimationFrame(draw); return; }

      const w = parseFloat(canvas.style.width) || canvas.width;
      const h = parseFloat(canvas.style.height) || canvas.height;
      const positions = getNodePositions(w, h);
      const hovered = hoveredRef.current;
      const selected = selectedRef.current;

      ctx.clearRect(0, 0, w, h);

      // Draw rays and nodes
      for (let i = 0; i < NODE_COUNT; i++) {
        const pos = positions[i];
        const isHovered = hovered === i && selected < 0;
        const isSelected = selected === i;
        const isDimmed = selected >= 0 && !isSelected;

        // Ray line
        const lineAlpha = isSelected ? 0.6 : isHovered ? 0.4 : isDimmed ? 0.08 : 0.15;
        const lineColor = isSelected || isHovered ? ACCENT : GREY;
        ctx.beginPath();
        ctx.moveTo(pos.cx, pos.cy);
        ctx.lineTo(pos.x, pos.y);
        ctx.strokeStyle = `rgba(${lineColor.r}, ${lineColor.g}, ${lineColor.b}, ${lineAlpha})`;
        ctx.lineWidth = isSelected ? 1.5 : 0.8;
        ctx.stroke();

        // Node
        const nodeSize = isSelected ? SELECTED_NODE_SIZE : isHovered ? HOVER_NODE_SIZE : BASE_NODE_SIZE;
        const nodeAlpha = isSelected ? 0.9 : isHovered ? 0.7 : isDimmed ? 0.15 : 0.35;
        const nodeColor = isSelected || isHovered ? ACCENT : GREY;

        // Glow on selected
        if (isSelected) {
          ctx.shadowColor = `rgba(${ACCENT.r}, ${ACCENT.g}, ${ACCENT.b}, 0.5)`;
          ctx.shadowBlur = 16;
        }

        ctx.fillStyle = `rgba(${nodeColor.r}, ${nodeColor.g}, ${nodeColor.b}, ${nodeAlpha})`;
        ctx.fillRect(pos.x - nodeSize / 2, pos.y - nodeSize / 2, nodeSize, nodeSize);

        if (isSelected) {
          ctx.shadowColor = 'transparent';
          ctx.shadowBlur = 0;
        }

        // Particles along selected ray
        if (isSelected) {
          const particles = particlesRef.current[i];
          for (const p of particles) {
            p.progress += p.speed;
            if (p.progress > 1) {
              p.progress = 0;
              p.opacity = 0.4 + Math.random() * 0.5;
            }
            const px = pos.cx + (pos.x - pos.cx) * p.progress;
            const py = pos.cy + (pos.y - pos.cy) * p.progress;
            const pSize = 2 + p.progress * 2;
            ctx.fillStyle = `rgba(${ACCENT.r}, ${ACCENT.g}, ${ACCENT.b}, ${p.opacity * (1 - p.progress * 0.5)})`;
            ctx.fillRect(px - pSize / 2, py - pSize / 2, pSize, pSize);
          }
        }

        // Label below node
        const labelAlpha = isSelected ? 0.9 : isHovered ? 0.7 : isDimmed ? 0.2 : 0.5;
        ctx.font = '400 10px "Kosugi", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillStyle = `rgba(255, 255, 255, ${labelAlpha})`;

        const labelLines = LABELS[i].split('\n');
        labelLines.forEach((line, li) => {
          ctx.fillText(line, pos.x, pos.y + nodeSize / 2 + 8 + li * 13);
        });
      }

      // Center dot
      ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
      ctx.fillRect(positions[0].cx - 2, positions[0].cy - 2, 4, 4);

      if (!prefersReduced) animRef.current = requestAnimationFrame(draw);
    }

    if (prefersReduced) {
      draw();
    } else {
      animRef.current = requestAnimationFrame(draw);
    }

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', resize);
    };
  }, [resize, getNodePositions]);

  return (
    <div
      ref={containerRef}
      className="w-full h-[300px] md:h-[360px]"
      style={{ position: 'relative', cursor: 'pointer' }}
      onMouseMove={(e) => handleInteraction(e.clientX, e.clientY, false)}
      onMouseLeave={() => { hoveredRef.current = -1; }}
      onClick={(e) => handleInteraction(e.clientX, e.clientY, true)}
      onTouchEnd={(e) => {
        const t = e.changedTouches[0];
        if (t) handleInteraction(t.clientX, t.clientY, true);
      }}
    >
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%' }} />
    </div>
  );
}
```

**Step 3: Create `SituationalGrid.tsx`**

```typescript
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

interface SituationalGridProps {
  options: { key: string; text: string }[];
  onSelect: (key: string) => void;
}

export default function SituationalGrid({ options, onSelect }: SituationalGridProps) {
  const [selected, setSelected] = useState<string | null>(null);

  const handleSelect = (key: string) => {
    setSelected(key);
    setTimeout(() => onSelect(key), 400);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {options.map((opt, i) => {
        const isSelected = selected === opt.key;
        const isDimmed = selected !== null && !isSelected;

        return (
          <motion.button
            key={opt.key}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: isDimmed ? 0.4 : 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1], delay: i * 0.06 }}
            onClick={() => !selected && handleSelect(opt.key)}
            disabled={!!selected}
            className={`
              text-left p-5 rounded-[3px] transition-all duration-200 cursor-pointer
              bg-[rgba(10,10,10,0.70)] backdrop-blur-[20px] saturate-[1.2]
              border
              ${isSelected
                ? 'border-ops-accent'
                : 'border-ops-border hover:border-ops-border-hover'
              }
            `}
          >
            <span className={`
              font-caption text-xs uppercase tracking-[0.15em] block mb-2
              ${isSelected ? 'text-ops-accent' : 'text-ops-text-secondary'}
            `}>
              {opt.key.toUpperCase()}
            </span>
            <span className="font-body text-sm text-ops-text-primary leading-relaxed">
              {opt.text}
            </span>
          </motion.button>
        );
      })}
    </div>
  );
}
```

**Step 4: Create `ForcedChoiceFork.tsx`**

```typescript
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

interface ForcedChoiceForkProps {
  options: { key: string; text: string }[];
  onSelect: (key: string) => void;
}

export default function ForcedChoiceFork({ options, onSelect }: ForcedChoiceForkProps) {
  const [selected, setSelected] = useState<string | null>(null);

  const handleSelect = (key: string) => {
    setSelected(key);
    setTimeout(() => onSelect(key), 400);
  };

  return (
    <div className="flex flex-col md:flex-row gap-3 md:gap-4">
      {options.map((opt, i) => {
        const isSelected = selected === opt.key;
        const isDimmed = selected !== null && !isSelected;

        return (
          <motion.button
            key={opt.key}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: isDimmed ? 0.35 : 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1], delay: i * 0.08 }}
            onClick={() => !selected && handleSelect(opt.key)}
            disabled={!!selected}
            className={`
              flex-1 text-left p-6 md:p-8 rounded-[3px] transition-all duration-200 cursor-pointer
              bg-[rgba(10,10,10,0.70)] backdrop-blur-[20px] saturate-[1.2]
              border min-h-[120px]
              ${isSelected
                ? 'border-ops-accent bg-ops-accent/5'
                : 'border-ops-border hover:border-ops-border-hover'
              }
            `}
          >
            <span className="font-body text-sm md:text-base text-ops-text-primary leading-relaxed">
              {opt.text}
            </span>
          </motion.button>
        );
      })}
    </div>
  );
}
```

**Step 5: Commit**

```bash
git add src/components/assessment/QuestionStep.tsx src/components/assessment/LikertRadialGauge.tsx src/components/assessment/SituationalGrid.tsx src/components/assessment/ForcedChoiceFork.tsx
git commit -m "feat(assessment): add question step with radial gauge, situational grid, and forced choice fork"
```

---

## Task 5: Chunk Transition + Email Capture + Generating State

**Files:**
- Create: `src/components/assessment/ChunkTransition.tsx`
- Create: `src/components/assessment/EmailCapture.tsx`
- Create: `src/components/assessment/GeneratingState.tsx`

**What it does:** Three intermediate screens:
1. **ChunkTransition** — Canvas particle converge/burst animation between question chunks
2. **EmailCapture** — Name + email form before results reveal
3. **GeneratingState** — Loading animation while AI generates analysis

**Step 1: Create `ChunkTransition.tsx`**

Canvas animation: particles converge from edges to center (1.5s), hold briefly, then burst outward. During this time the next chunk is being loaded by the server.

```typescript
'use client';

import { useRef, useEffect, useCallback } from 'react';
import { SectionLabel } from '@/components/ui';

const ACCENT = { r: 89, g: 119, b: 148 };
const PARTICLE_COUNT = 40;

interface TransitParticle {
  startX: number; startY: number;
  x: number; y: number;
  speed: number;
  progress: number;
  size: number;
  opacity: number;
}

interface ChunkTransitionProps {
  chunkNumber: number;
  totalChunks: number;
  onComplete: () => void;
}

export default function ChunkTransition({ chunkNumber, totalChunks, onComplete }: ChunkTransitionProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animRef = useRef(0);

  const resize = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const dpr = window.devicePixelRatio || 1;
    const rect = container.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;
    const ctx = canvas.getContext('2d');
    if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }, []);

  useEffect(() => {
    resize();
    window.addEventListener('resize', resize);
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReduced) {
      // Skip animation, just wait briefly
      const t = setTimeout(onComplete, 800);
      return () => { clearTimeout(t); window.removeEventListener('resize', resize); };
    }

    const canvas = canvasRef.current!;
    const w = parseFloat(canvas.style.width) || 400;
    const h = parseFloat(canvas.style.height) || 400;
    const cx = w / 2;
    const cy = h / 2;

    // Generate particles from random edge positions
    const particles: TransitParticle[] = Array.from({ length: PARTICLE_COUNT }, () => {
      const angle = Math.random() * Math.PI * 2;
      const edgeDist = Math.max(w, h) * 0.6;
      return {
        startX: cx + Math.cos(angle) * edgeDist,
        startY: cy + Math.sin(angle) * edgeDist,
        x: 0, y: 0,
        speed: 0.006 + Math.random() * 0.004,
        progress: 0,
        size: 2 + Math.random() * 3,
        opacity: 0.3 + Math.random() * 0.5,
      };
    });

    let phase: 'converge' | 'hold' | 'done' = 'converge';
    let holdStart = 0;

    function draw(ts: number) {
      const ctx = canvas.getContext('2d');
      if (!ctx) { animRef.current = requestAnimationFrame(draw); return; }

      ctx.clearRect(0, 0, w, h);

      let allConverged = true;

      for (const p of particles) {
        if (phase === 'converge') {
          p.progress = Math.min(1, p.progress + p.speed);
          if (p.progress < 1) allConverged = false;
          // Ease-in-out
          const t = p.progress < 0.5
            ? 2 * p.progress * p.progress
            : 1 - Math.pow(-2 * p.progress + 2, 2) / 2;
          p.x = p.startX + (cx - p.startX) * t;
          p.y = p.startY + (cy - p.startY) * t;
        }

        const alpha = p.opacity * (phase === 'converge' ? p.progress : 1);
        ctx.fillStyle = `rgba(${ACCENT.r}, ${ACCENT.g}, ${ACCENT.b}, ${alpha})`;
        ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
      }

      if (phase === 'converge' && allConverged) {
        phase = 'hold';
        holdStart = ts;
      }

      if (phase === 'hold' && ts - holdStart > 400) {
        phase = 'done';
        onComplete();
        return;
      }

      animRef.current = requestAnimationFrame(draw);
    }

    animRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', resize);
    };
  }, [resize, onComplete]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-ops-background relative">
      <div ref={containerRef} className="absolute inset-0">
        <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%' }} />
      </div>
      <div className="relative z-10 text-center">
        <p className="font-caption text-xs uppercase tracking-[0.2em] text-ops-text-secondary">
          Analyzing responses...
        </p>
        <p className="font-caption text-[10px] uppercase tracking-[0.15em] text-ops-text-secondary/50 mt-2">
          Chunk {chunkNumber} of {totalChunks}
        </p>
      </div>
    </div>
  );
}
```

**Step 2: Create `EmailCapture.tsx`**

```typescript
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button, SectionLabel } from '@/components/ui';

interface EmailCaptureProps {
  onSubmit: (firstName: string, email: string) => void;
  isLoading: boolean;
}

export default function EmailCapture({ onSubmit, isLoading }: EmailCaptureProps) {
  const [firstName, setFirstName] = useState('');
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (firstName.trim() && email.trim()) {
      onSubmit(firstName.trim(), email.trim());
    }
  };

  return (
    <div className="min-h-screen flex items-center bg-ops-background">
      <div className="max-w-md mx-auto px-6 w-full py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <SectionLabel label="RESULTS" className="mb-6" />

          <h2 className="font-heading text-3xl md:text-4xl font-bold text-ops-text-primary mb-3">
            Your results are ready.
          </h2>

          <p className="font-body text-sm text-ops-text-secondary mb-10">
            Enter your name and email. We will send you a unique link to revisit your results anytime.
          </p>
        </motion.div>

        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
          className="space-y-4"
        >
          <div>
            <label className="font-caption text-[10px] uppercase tracking-[0.2em] text-ops-text-secondary block mb-2">
              First name
            </label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
              className="
                w-full bg-transparent border-b border-ops-border
                text-ops-text-primary font-body text-base
                pb-2 outline-none
                focus:border-ops-border-hover transition-colors
                placeholder:text-ops-text-secondary/40
              "
              placeholder="Jack"
            />
          </div>

          <div>
            <label className="font-caption text-[10px] uppercase tracking-[0.2em] text-ops-text-secondary block mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="
                w-full bg-transparent border-b border-ops-border
                text-ops-text-primary font-body text-base
                pb-2 outline-none
                focus:border-ops-border-hover transition-colors
                placeholder:text-ops-text-secondary/40
              "
              placeholder="jack@company.com"
            />
          </div>

          <div className="pt-6">
            <Button variant="solid" onClick={() => {}}>
              {isLoading ? 'GENERATING...' : 'REVEAL MY RESULTS'}
            </Button>
          </div>
        </motion.form>
      </div>
    </div>
  );
}
```

**Step 3: Create `GeneratingState.tsx`**

A loading state shown while AI generates the analysis. Features a building radar/hexagon animation.

```typescript
'use client';

import { useRef, useEffect, useCallback } from 'react';

const ACCENT = { r: 89, g: 119, b: 148 };
const DIMENSIONS = 6;

export default function GeneratingState() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animRef = useRef(0);

  const resize = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const dpr = window.devicePixelRatio || 1;
    const rect = container.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;
    const ctx = canvas.getContext('2d');
    if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }, []);

  useEffect(() => {
    resize();
    window.addEventListener('resize', resize);
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let startTs: number | null = null;

    function draw(ts: number) {
      if (!startTs) startTs = ts;
      const elapsed = (ts - startTs) / 1000;

      const canvas = canvasRef.current;
      if (!canvas) { animRef.current = requestAnimationFrame(draw); return; }
      const ctx = canvas.getContext('2d');
      if (!ctx) { animRef.current = requestAnimationFrame(draw); return; }

      const w = parseFloat(canvas.style.width) || canvas.width;
      const h = parseFloat(canvas.style.height) || canvas.height;
      const cx = w / 2;
      const cy = h / 2;
      const maxRadius = Math.min(w, h) * 0.3;

      ctx.clearRect(0, 0, w, h);

      // Draw building hexagonal radar
      for (let ring = 0; ring < 3; ring++) {
        const ringRadius = maxRadius * ((ring + 1) / 3);
        const alpha = 0.06 + ring * 0.02;
        ctx.beginPath();
        for (let i = 0; i <= DIMENSIONS; i++) {
          const angle = (Math.PI * 2 / DIMENSIONS) * i - Math.PI / 2;
          const x = cx + Math.cos(angle) * ringRadius;
          const y = cy + Math.sin(angle) * ringRadius;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.strokeStyle = `rgba(${ACCENT.r}, ${ACCENT.g}, ${ACCENT.b}, ${alpha})`;
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }

      // Animated fill shape — grows and morphs
      ctx.beginPath();
      for (let i = 0; i <= DIMENSIONS; i++) {
        const angle = (Math.PI * 2 / DIMENSIONS) * (i % DIMENSIONS) - Math.PI / 2;
        const phase = elapsed * 0.8 + i * 1.2;
        const extent = 0.3 + 0.5 * (0.5 + 0.5 * Math.sin(phase));
        const r = maxRadius * extent;
        const x = cx + Math.cos(angle) * r;
        const y = cy + Math.sin(angle) * r;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.fillStyle = `rgba(${ACCENT.r}, ${ACCENT.g}, ${ACCENT.b}, 0.06)`;
      ctx.fill();
      ctx.strokeStyle = `rgba(${ACCENT.r}, ${ACCENT.g}, ${ACCENT.b}, 0.25)`;
      ctx.lineWidth = 1;
      ctx.stroke();

      // Dimension axis lines
      for (let i = 0; i < DIMENSIONS; i++) {
        const angle = (Math.PI * 2 / DIMENSIONS) * i - Math.PI / 2;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + Math.cos(angle) * maxRadius, cy + Math.sin(angle) * maxRadius);
        ctx.strokeStyle = `rgba(255, 255, 255, 0.06)`;
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }

      if (!prefersReduced) animRef.current = requestAnimationFrame(draw);
    }

    if (prefersReduced) {
      draw(0);
    } else {
      animRef.current = requestAnimationFrame(draw);
    }

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', resize);
    };
  }, [resize]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-ops-background relative">
      <div ref={containerRef} className="absolute inset-0">
        <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%' }} />
      </div>
      <div className="relative z-10">
        <p className="font-caption text-xs uppercase tracking-[0.2em] text-ops-text-secondary">
          Generating your leadership profile...
        </p>
      </div>
    </div>
  );
}
```

**Step 4: Commit**

```bash
git add src/components/assessment/ChunkTransition.tsx src/components/assessment/EmailCapture.tsx src/components/assessment/GeneratingState.tsx
git commit -m "feat(assessment): add chunk transition, email capture, and generating state"
```

---

## Task 6: Results Page — Route + Data Fetching

**Files:**
- Create: `src/app/tools/leadership/[token]/page.tsx`
- Create: `src/components/assessment/results/ResultsView.tsx`

**What it does:** The `/tools/leadership/[token]` route. Server component that fetches results via `getResults(token)`, then renders the client-side `ResultsView`.

**Step 1: Create `src/app/tools/leadership/[token]/page.tsx`**

```typescript
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getResults } from '@/lib/assessment/actions';
import ResultsView from '@/components/assessment/results/ResultsView';

interface ResultsPageProps {
  params: Promise<{ token: string }>;
}

export async function generateMetadata({ params }: ResultsPageProps): Promise<Metadata> {
  const { token } = await params;
  const result = await getResults(token);

  if ('error' in result) {
    return { title: 'Results Not Found | OPS' };
  }

  return {
    title: `${result.archetype.name} — Leadership Assessment | OPS`,
    description: result.analysis.headline,
  };
}

export default async function ResultsPage({ params }: ResultsPageProps) {
  const { token } = await params;
  const result = await getResults(token);

  if ('error' in result) {
    notFound();
  }

  return <ResultsView result={result} token={token} />;
}
```

**Step 2: Create `ResultsView.tsx` — orchestrates the results layout**

```typescript
'use client';

import { useRef } from 'react';
import { motion } from 'framer-motion';
import type { AssessmentResult } from '@/lib/assessment/types';
import { SectionLabel, FadeInUp } from '@/components/ui';
import LeadershipSphere from './LeadershipSphere';
import ArchetypeProfile from './ArchetypeProfile';
import ShareSection from './ShareSection';

interface ResultsViewProps {
  result: AssessmentResult;
  token: string;
}

export default function ResultsView({ result, token }: ResultsViewProps) {
  return (
    <div className="min-h-screen bg-ops-background">
      {/* Section A: The Leadership Sphere */}
      <section className="relative">
        <div className="max-w-[1400px] mx-auto px-6 md:px-10 pt-28 pb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <SectionLabel label="YOUR RESULTS" className="mb-4" />
            <p className="font-body text-sm text-ops-text-secondary mb-2">
              {result.first_name}, you are
            </p>
            <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-ops-text-primary mb-1">
              {result.archetype.name}
            </h1>
            <p className="font-caption text-xs uppercase tracking-[0.15em] text-ops-accent">
              {result.archetype.tagline}
            </p>
          </motion.div>
        </div>

        {/* Interactive sphere */}
        <LeadershipSphere
          scores={result.scores}
          scoreDetails={result.score_details}
          norms={result.norms}
          analysis={result.analysis}
          className="w-full h-[60vh] md:h-[70vh]"
        />
      </section>

      {/* Section B: Archetype Profile */}
      <section className="py-16">
        <div className="max-w-[1000px] mx-auto px-6 md:px-10">
          <ArchetypeProfile result={result} />
        </div>
      </section>

      {/* Section C: Share & Actions */}
      <section className="py-16 border-t border-ops-border">
        <div className="max-w-[1000px] mx-auto px-6 md:px-10">
          <ShareSection result={result} token={token} />
        </div>
      </section>
    </div>
  );
}
```

**Step 3: Commit**

```bash
git add src/app/tools/leadership/[token]/page.tsx src/components/assessment/results/ResultsView.tsx
git commit -m "feat(assessment): add results page route and results view layout"
```

---

## Task 7: The Leadership Sphere — Interactive 3D Canvas

**Files:**
- Create: `src/components/assessment/results/LeadershipSphere.tsx`
- Create: `src/components/assessment/results/DimensionPanel.tsx`

**What it does:** THE showstopper. An interactive Canvas 2D element displaying 6 dimension vectors radiating from center in 3D space. Auto-rotates, draggable (same physics as StarburstCanvas). Clickable dimension nodes open a slide-in panel.

This is the most complex component. It reuses all 3D math from StarburstCanvas: `rotate()`, `project()`, `lerpColor()`, Fibonacci-based direction vectors, drag with spring decay, hover detection.

**Architecture:**

- 6 dimension vectors arranged at fixed 3D positions (vertices of an octahedron, roughly)
- Each vector length = score/100 * maxRadius
- Thin mesh lines connecting adjacent vector endpoints
- ~80 ambient fill lines (like starburst) at low opacity
- Dimension labels rendered on Canvas near nodes
- Auto-rotation (120s period), draggable (same DRAG_SENSITIVITY, SPRING_DECAY constants)
- Particle streams along high-score vectors
- Click detection on front-hemisphere nodes → opens DimensionPanel

Due to the size and complexity of this component (~400-500 lines), the implementer should:

1. Start with the basic sphere structure (6 vectors, rotation, projection) — get it rendering
2. Add drag interaction (copy pattern from StarburstCanvas lines 279-395)
3. Add ambient fill lines
4. Add mesh connections between adjacent dimensions
5. Add hover detection and visual feedback
6. Add particle streams on high-score vectors
7. Add click handler that triggers DimensionPanel

**Key constants:**
```typescript
const ACCENT = { r: 89, g: 119, b: 148 };
const GREY = { r: 100, g: 100, b: 100 };
const FOCAL_LENGTH = 2000;
const ROTATION_PERIOD_S = 120;
const TILT_ANGLE = 0.25;
const DRAG_SENSITIVITY = 0.005;
const SPRING_DECAY = 0.96;
const DRAG_THRESHOLD = 3;
const HOVER_RADIUS = 28;
const AMBIENT_LINE_COUNT = 80;
const MIN_VECTOR_LENGTH = 0.3; // minimum even at score=0
const MAX_VECTOR_LENGTH = 0.9; // at score=100
```

**Dimension positions (3D unit vectors — distribute 6 points roughly evenly):**
```typescript
const DIMENSION_DIRS: Record<Dimension, { dx: number; dy: number; dz: number }> = {
  drive:        { dx: 0.0,   dy: -0.85, dz: 0.53  },  // upper front
  resilience:   { dx: 0.75,  dy: -0.25, dz: 0.61  },  // right front
  vision:       { dx: 0.75,  dy: 0.45,  dz: -0.49 },  // right back
  connection:   { dx: -0.75, dy: 0.45,  dz: -0.49 },  // left back
  adaptability: { dx: -0.75, dy: -0.25, dz: 0.61  },  // left front
  integrity:    { dx: 0.0,   dy: 0.85,  dz: -0.53 },  // lower back
};
```

**Score-to-color mapping:** Higher scores = brighter accent. `lerpColor(GREY, ACCENT, score/100)`

**Mesh connections (adjacent pairs):**
```typescript
const MESH_PAIRS: [Dimension, Dimension][] = [
  ['drive', 'resilience'],
  ['resilience', 'vision'],
  ['vision', 'integrity'],
  ['integrity', 'connection'],
  ['connection', 'adaptability'],
  ['adaptability', 'drive'],
];
```

**DimensionPanel — Slide-in detail panel:**

When a dimension node is clicked, a panel slides in from the right showing:
- Dimension name + score + percentile
- Confidence indicator
- AI deep insight for that dimension
- Score bar with population comparison

```typescript
'use client';

import { motion, AnimatePresence } from 'framer-motion';
import type { Dimension, ScoreProfile, AIAnalysis } from '@/lib/assessment/types';

const DIMENSION_LABELS: Record<Dimension, string> = {
  drive: 'Drive',
  resilience: 'Resilience',
  vision: 'Vision',
  connection: 'Connection',
  adaptability: 'Adaptability',
  integrity: 'Integrity',
};

interface DimensionPanelProps {
  dimension: Dimension | null;
  scoreDetails: ScoreProfile;
  norms: Record<Dimension, { percentile: number }> | null;
  analysis: AIAnalysis;
  onClose: () => void;
}

export default function DimensionPanel({
  dimension,
  scoreDetails,
  norms,
  analysis,
  onClose,
}: DimensionPanelProps) {
  return (
    <AnimatePresence>
      {dimension && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="
              fixed right-0 top-0 bottom-0 z-50
              w-full max-w-md
              bg-[rgba(10,10,10,0.85)] backdrop-blur-[24px] saturate-[1.2]
              border-l border-ops-border
              overflow-y-auto
              p-8
            "
          >
            <button
              onClick={onClose}
              className="font-caption text-xs uppercase tracking-[0.15em] text-ops-text-secondary hover:text-ops-text-primary transition-colors mb-8"
            >
              Close
            </button>

            <h3 className="font-heading text-3xl font-bold text-ops-text-primary mb-1">
              {DIMENSION_LABELS[dimension]}
            </h3>

            <div className="flex items-baseline gap-3 mb-6">
              <span className="font-heading text-5xl font-bold text-ops-accent">
                {Math.round(scoreDetails[dimension].score)}
              </span>
              {norms?.[dimension] && (
                <span className="font-caption text-xs uppercase tracking-[0.15em] text-ops-text-secondary">
                  {norms[dimension].percentile}th percentile
                </span>
              )}
            </div>

            {/* Confidence */}
            <div className="mb-8">
              <p className="font-caption text-[10px] uppercase tracking-[0.2em] text-ops-text-secondary mb-2">
                Confidence
              </p>
              <div className="h-[2px] bg-ops-surface w-full rounded-full overflow-hidden">
                <div
                  className="h-full bg-ops-accent"
                  style={{ width: `${scoreDetails[dimension].confidence * 100}%` }}
                />
              </div>
              <p className="font-body text-xs text-ops-text-secondary mt-1">
                Based on {scoreDetails[dimension].responses_count} responses
              </p>
            </div>

            {/* Score bar */}
            <div className="mb-8">
              <p className="font-caption text-[10px] uppercase tracking-[0.2em] text-ops-text-secondary mb-2">
                Score
              </p>
              <div className="h-[3px] bg-ops-surface w-full rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-ops-accent"
                  initial={{ width: 0 }}
                  animate={{ width: `${scoreDetails[dimension].score}%` }}
                  transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                />
              </div>
            </div>

            {/* AI insight */}
            {analysis.dimensional_deep_dive?.[dimension] && (
              <div className="bg-ops-surface border border-ops-border rounded-[3px] p-5">
                <p className="font-caption text-[10px] uppercase tracking-[0.2em] text-ops-text-secondary mb-3">
                  Insight
                </p>
                <p className="font-body text-sm text-ops-text-primary leading-relaxed">
                  {analysis.dimensional_deep_dive[dimension]}
                </p>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
```

**Step: Commit**

```bash
git add src/components/assessment/results/LeadershipSphere.tsx src/components/assessment/results/DimensionPanel.tsx
git commit -m "feat(assessment): add interactive leadership sphere with dimension panels"
```

---

## Task 8: Archetype Profile Layout

**Files:**
- Create: `src/components/assessment/results/ArchetypeProfile.tsx`
- Create: `src/components/assessment/results/ScoreBar.tsx`

**What it does:** The full archetype analysis section below the sphere. AI-generated content rendered in the OPS design system.

**ArchetypeProfile layout:**
- AI headline (Mohave, medium)
- Summary paragraphs
- Two-column grid: Strengths (left) + Blind Spots (right) — each as a Card with title + description
- Growth Actions — numbered list
- Under Pressure + Team Dynamics — two elevated surface cards
- Deep Insight — callout card with accent top border

All sections use `FadeInUp` with staggered delays.

**ScoreBar:** Horizontal bar showing a single dimension score with percentile label. Used inline in the archetype profile and in DimensionPanel.

```typescript
// ScoreBar.tsx
'use client';

import { motion } from 'framer-motion';
import type { Dimension } from '@/lib/assessment/types';

const LABELS: Record<Dimension, string> = {
  drive: 'Drive', resilience: 'Resilience', vision: 'Vision',
  connection: 'Connection', adaptability: 'Adaptability', integrity: 'Integrity',
};

interface ScoreBarProps {
  dimension: Dimension;
  score: number;
  percentile?: number;
}

export default function ScoreBar({ dimension, score, percentile }: ScoreBarProps) {
  return (
    <div className="mb-4">
      <div className="flex items-baseline justify-between mb-1">
        <span className="font-caption text-[10px] uppercase tracking-[0.2em] text-ops-text-secondary">
          {LABELS[dimension]}
        </span>
        <div className="flex items-baseline gap-2">
          <span className="font-heading text-sm font-semibold text-ops-text-primary">
            {Math.round(score)}
          </span>
          {percentile !== undefined && (
            <span className="font-caption text-[9px] uppercase tracking-[0.15em] text-ops-text-secondary">
              {percentile}th %ile
            </span>
          )}
        </div>
      </div>
      <div className="h-[2px] bg-ops-surface w-full rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-ops-accent"
          initial={{ width: 0 }}
          whileInView={{ width: `${score}%` }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
        />
      </div>
    </div>
  );
}
```

**Step: Commit**

```bash
git add src/components/assessment/results/ArchetypeProfile.tsx src/components/assessment/results/ScoreBar.tsx
git commit -m "feat(assessment): add archetype profile layout with score bars"
```

---

## Task 9: Share Card + Share Section

**Files:**
- Create: `src/components/assessment/results/ShareCard.tsx`
- Create: `src/components/assessment/results/ShareSection.tsx`

**What it does:**
- **ShareCard** — Canvas-rendered downloadable archetype card (1200x630px for social sharing). Dark background, archetype name + tagline, mini radar chart, OPS branding, results URL.
- **ShareSection** — DOM section with "Share Your Results" button (triggers ShareCard download), "Take the Deep Dive" upsell (if quick version), retake notice.

**ShareCard Canvas rendering approach:**
1. Create an offscreen canvas (1200x630)
2. Draw dark gradient background
3. Draw mini radar chart (6-axis) with user's scores
4. Render text: archetype name (Mohave Bold), tagline (Kosugi), OPS logo
5. Render results URL at bottom
6. Export as PNG blob → trigger download via anchor click

The implementer should use `canvas.toBlob()` + `URL.createObjectURL()` for the download.

**Step: Commit**

```bash
git add src/components/assessment/results/ShareCard.tsx src/components/assessment/results/ShareSection.tsx
git commit -m "feat(assessment): add shareable archetype card with Canvas rendering"
```

---

## Task 10: Integration, Polish, and Build Verification

**Files:**
- Modify: `src/components/assessment/AssessmentShell.tsx` (if needed for integration fixes)
- Modify: `src/app/tools/page.tsx` (link leadership card)
- Create: `src/components/assessment/index.ts` (barrel export)

**What it does:** Wire everything together, verify the full flow works end-to-end, fix any build errors.

**Steps:**

1. **Create barrel export** `src/components/assessment/index.ts`:
   ```typescript
   export { default as AssessmentShell } from './AssessmentShell';
   export { default as LeadershipLanding } from './LeadershipLanding';
   ```

2. **Verify build passes:**
   ```bash
   cd "/Users/jacksonsweet/Desktop/OPS LTD./ops-site" && npx next build
   ```

3. **Fix any TypeScript or import errors**

4. **Verify the tools page links correctly to /tools/leadership**

5. **Test the full flow locally:**
   ```bash
   npx next dev
   ```
   Then navigate to `http://localhost:3000/tools/leadership` and test:
   - Landing page renders with ambient burst
   - Version selection works
   - Demographics step shows/skips properly
   - Questions render with correct interaction type
   - Likert radial gauge is interactive
   - Situational grid and forced choice work
   - Chunk transitions fire
   - Email capture submits
   - Results page renders with sphere
   - Sphere is draggable, clickable
   - Dimension panel slides in
   - Share card downloads

6. **Commit**

```bash
git add -A
git commit -m "feat(assessment): complete UI integration and polish"
```

---

## Task 11: Reduced Motion & Accessibility Pass

**Files:**
- Modify: all Canvas components (AmbientBurst, LikertRadialGauge, ChunkTransition, GeneratingState, LeadershipSphere, ShareCard)

**What it does:** Verify every Canvas component properly handles `prefers-reduced-motion`:
- Single static frame instead of RAF loop
- No particle animations
- Immediate state changes instead of animated transitions

Also verify:
- All form inputs have labels
- Button components have accessible names
- Color contrast meets WCAG AA on all text
- Keyboard navigation works for question selection
- Screen reader can navigate the question flow

**Step: Commit**

```bash
git commit -m "fix(assessment): accessibility and reduced motion compliance pass"
```

---

## Task 12: Mobile Responsive Polish

**Files:**
- Modify: all components as needed

**What it does:** Verify and fix mobile layout:
- Landing page: cards stack vertically
- Demographics: pills wrap properly
- Radial gauge: scales to smaller viewport (reduce ray length on mobile)
- Situational grid: 1-column on mobile
- Forced choice: stacks vertically
- Leadership sphere: touch drag works, adequate height on mobile
- Dimension panel: full-width on mobile
- Archetype profile: single column
- Share card: responsive download

Test at 375px (iPhone SE), 390px (iPhone 14), 430px (iPhone 14 Pro Max), 768px (iPad).

**Step: Commit**

```bash
git commit -m "fix(assessment): mobile responsive polish across all screens"
```

---

## Summary

| Task | Component | Type | Estimated Complexity |
|------|-----------|------|---------------------|
| 1 | AssessmentShell + useAssessmentFlow | State machine | Medium |
| 2 | Landing page + AmbientBurst | Page + Canvas | Medium |
| 3 | DemographicsStep | DOM | Low |
| 4 | QuestionStep + LikertRadialGauge + SituationalGrid + ForcedChoiceFork | DOM + Canvas | High |
| 5 | ChunkTransition + EmailCapture + GeneratingState | Canvas + DOM | Medium |
| 6 | Results route + ResultsView | Server + Client | Low |
| 7 | LeadershipSphere + DimensionPanel | Canvas + DOM | **Very High** |
| 8 | ArchetypeProfile + ScoreBar | DOM | Medium |
| 9 | ShareCard + ShareSection | Canvas + DOM | Medium |
| 10 | Integration + Build | Polish | Medium |
| 11 | Accessibility | All | Low |
| 12 | Mobile responsive | All | Medium |

**Critical path:** Tasks 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8 → 9 → 10 → 11 → 12

Task 7 (LeadershipSphere) is the most complex and is the "awe-inspiring" centerpiece. Budget extra time for it.
