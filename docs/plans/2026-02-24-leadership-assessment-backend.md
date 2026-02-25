# Leadership Assessment — Backend & Question Base Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build the complete backend for the OPS Leadership Assessment tool — database schema, question pool, scoring engine, AI adaptive selection, archetype matching, analysis generation, and synthetic baseline population.

**Architecture:** Next.js Server Actions call a scoring engine and OpenAI (gpt-4o) for adaptive question selection and final analysis generation. All data persisted in Supabase (project: `ijeekuhbatykdomumfjx`). Question pool stored in Supabase with in-memory caching. Synthetic baseline of 200 profiles seeds normative data at launch.

**Tech Stack:** Next.js 16 Server Actions, Supabase (Postgres + RLS), OpenAI gpt-4o, TypeScript

**Design Doc:** `docs/plans/2026-02-24-leadership-assessment-design.md`

**Existing Patterns:**
- Server-side Supabase client: see `src/lib/blog.ts` — uses `createClient` from `@supabase/supabase-js` with `SUPABASE_SERVICE_ROLE_KEY`
- No API routes exist yet — this project uses Server Components and will use Server Actions
- Supabase project ID: `ijeekuhbatykdomumfjx`

---

## Task 1: Install OpenAI SDK

**Files:**
- Modify: `package.json`

**Step 1: Install the dependency**

Run:
```bash
cd "/Users/jacksonsweet/Desktop/OPS LTD./ops-site" && npm install openai
```

**Step 2: Add env variable**

Add to `.env.local`:
```
OPENAI_API_KEY=<key>
```

Ask the user for their OpenAI API key. Do NOT proceed without it.

**Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "feat: add openai sdk dependency"
```

---

## Task 2: Create Database Schema (Supabase Migration)

**Files:**
- Creates 5 tables via Supabase migration

Apply this as a single Supabase migration named `create_leadership_assessment_schema` on project `ijeekuhbatykdomumfjx`:

```sql
-- ============================================================
-- LEADERSHIP ASSESSMENT SCHEMA
-- ============================================================

-- 1. Question Pool — the calibrated item bank
CREATE TABLE question_pool (
  id TEXT PRIMARY KEY,
  dimension TEXT NOT NULL CHECK (dimension IN ('drive', 'resilience', 'vision', 'connection', 'adaptability', 'integrity')),
  secondary_dimension TEXT CHECK (secondary_dimension IN ('drive', 'resilience', 'vision', 'connection', 'adaptability', 'integrity', NULL)),
  type TEXT NOT NULL CHECK (type IN ('likert', 'situational', 'forced_choice')),
  text TEXT NOT NULL,
  options JSONB, -- for situational/forced_choice: [{ key, text, scores }]
  scoring_weights JSONB NOT NULL, -- maps answer values to dimensional score contributions
  difficulty FLOAT NOT NULL DEFAULT 0.5 CHECK (difficulty >= 0 AND difficulty <= 1),
  reverse_scored BOOLEAN NOT NULL DEFAULT FALSE,
  validity_pair_id TEXT, -- links paired items for inconsistency detection
  is_impression_management BOOLEAN NOT NULL DEFAULT FALSE,
  version_availability TEXT[] NOT NULL DEFAULT '{quick,deep}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_question_pool_dimension ON question_pool(dimension);
CREATE INDEX idx_question_pool_type ON question_pool(type);
CREATE INDEX idx_question_pool_version ON question_pool USING GIN(version_availability);

-- 2. Archetype Profiles — the 8 leadership archetypes
CREATE TABLE archetype_profiles (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  tagline TEXT NOT NULL,
  ideal_scores JSONB NOT NULL, -- { drive: 90, resilience: 85, ... }
  red_flags JSONB NOT NULL DEFAULT '{}', -- anti-pattern scores
  description_template TEXT NOT NULL,
  strengths TEXT[] NOT NULL DEFAULT '{}',
  blind_spots TEXT[] NOT NULL DEFAULT '{}',
  growth_actions TEXT[] NOT NULL DEFAULT '{}',
  compatible_with TEXT[] NOT NULL DEFAULT '{}',
  tension_with TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Assessment Sessions — one row per assessment attempt
CREATE TABLE assessment_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token TEXT UNIQUE NOT NULL,
  first_name TEXT,
  email TEXT,
  version TEXT NOT NULL CHECK (version IN ('quick', 'deep')),
  status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'abandoned')),
  current_chunk INT NOT NULL DEFAULT 1,
  total_chunks INT NOT NULL,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  archetype TEXT REFERENCES archetype_profiles(id),
  secondary_archetype TEXT REFERENCES archetype_profiles(id),
  scores JSONB, -- { drive: 78, resilience: 65, ... }
  score_details JSONB, -- per-dimension: { score, confidence, standard_error, responses_count }
  ai_analysis JSONB, -- full structured analysis from OpenAI
  validity_flags JSONB DEFAULT '{}', -- { inconsistency_index, impression_management, straight_line_pct }
  demographic_context JSONB, -- optional: { team_size, years_leadership, industry }
  metadata JSONB DEFAULT '{}', -- browser, referrer, UTM, AI selection reasoning
  is_synthetic BOOLEAN NOT NULL DEFAULT FALSE,
  persona_type TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_sessions_token ON assessment_sessions(token);
CREATE INDEX idx_sessions_email ON assessment_sessions(email);
CREATE INDEX idx_sessions_status ON assessment_sessions(status);
CREATE INDEX idx_sessions_synthetic ON assessment_sessions(is_synthetic);

-- 4. Assessment Responses — every individual answer
CREATE TABLE assessment_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES assessment_sessions(id) ON DELETE CASCADE,
  chunk_number INT NOT NULL,
  question_id TEXT NOT NULL REFERENCES question_pool(id),
  question_type TEXT NOT NULL,
  question_text TEXT NOT NULL,
  answer_value JSONB NOT NULL,
  dimension_target TEXT NOT NULL,
  secondary_dimension_target TEXT,
  response_time_ms INT,
  answered_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_responses_session ON assessment_responses(session_id);
CREATE INDEX idx_responses_question ON assessment_responses(question_id);

-- 5. Score Norms — percentile data for population comparison
CREATE TABLE score_norms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dimension TEXT NOT NULL,
  segment TEXT NOT NULL DEFAULT 'all',
  percentile_map JSONB NOT NULL, -- { "10": 32, "25": 45, "50": 58, "75": 72, "90": 84 }
  sample_size INT NOT NULL DEFAULT 0,
  computed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_norms_dimension_segment ON score_norms(dimension, segment);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE question_pool ENABLE ROW LEVEL SECURITY;
ALTER TABLE archetype_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE score_norms ENABLE ROW LEVEL SECURITY;

-- Question pool: read-only for anon
CREATE POLICY "question_pool_read" ON question_pool FOR SELECT TO anon USING (true);

-- Archetype profiles: read-only for anon
CREATE POLICY "archetype_profiles_read" ON archetype_profiles FOR SELECT TO anon USING (true);

-- Assessment sessions: anon can insert and select by token
CREATE POLICY "sessions_insert" ON assessment_sessions FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "sessions_select_by_token" ON assessment_sessions FOR SELECT TO anon USING (true);
CREATE POLICY "sessions_update_own" ON assessment_sessions FOR UPDATE TO anon USING (true) WITH CHECK (true);

-- Assessment responses: anon can insert
CREATE POLICY "responses_insert" ON assessment_responses FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "responses_select" ON assessment_responses FOR SELECT TO anon USING (true);

-- Score norms: read-only for anon
CREATE POLICY "norms_read" ON score_norms FOR SELECT TO anon USING (true);

-- Service role bypasses RLS automatically
```

**Step 1: Apply migration via Supabase MCP tool**

Use `apply_migration` with project_id `ijeekuhbatykdomumfjx`, name `create_leadership_assessment_schema`, and the SQL above.

**Step 2: Verify tables created**

Use `list_tables` to confirm all 5 tables exist.

**Step 3: Run security advisors**

Use `get_advisors` with type `security` to check for any RLS issues.

---

## Task 3: Seed Archetype Profiles

**Files:**
- Populates `archetype_profiles` table

Execute this SQL on project `ijeekuhbatykdomumfjx` using `execute_sql`:

```sql
INSERT INTO archetype_profiles (id, name, tagline, ideal_scores, red_flags, description_template, strengths, blind_spots, growth_actions, compatible_with, tension_with) VALUES

('the_architect', 'The Architect', 'Designs the blueprint others build on',
  '{"drive": 60, "resilience": 65, "vision": 92, "connection": 55, "adaptability": 60, "integrity": 88}',
  '{"vision": {"below": 40}, "integrity": {"below": 35}}',
  'You lead with foresight and principle. Where others see chaos, you see systems waiting to be designed. Your strength is building frameworks that outlast any single project — structures that guide teams long after you''ve moved on. You don''t just plan; you architect outcomes. Your decisions are rooted in conviction, and your team trusts you because your standards never shift based on convenience.',
  ARRAY['Systems thinking that sees the whole picture', 'Principled decision-making under pressure', 'Long-range strategic planning', 'Building frameworks others can follow'],
  ARRAY['Can over-plan and delay action', 'May dismiss ideas that don''t fit your framework', 'Risk of rigidity when flexibility is needed'],
  ARRAY['Set a weekly "bias to action" checkpoint — identify one thing you''ve been planning that needs to ship now', 'Practice asking "what am I not seeing?" before finalizing major decisions', 'Deliberately invite input from team members who think differently than you'],
  ARRAY['the_driver', 'the_operator', 'the_sage'],
  ARRAY['the_trailblazer', 'the_catalyst']
),

('the_driver', 'The Driver', 'Forward is the only direction',
  '{"drive": 92, "resilience": 85, "vision": 55, "connection": 45, "adaptability": 58, "integrity": 65}',
  '{"drive": {"below": 40}, "resilience": {"below": 35}}',
  'You lead from the front. Output isn''t a metric for you — it''s a reflex. When things stall, you''re the force that breaks through. Your team knows that with you at the helm, deadlines aren''t suggestions and excuses don''t fly. You set the pace, and the pace is relentless. What others call intense, you call Tuesday.',
  ARRAY['Relentless execution and follow-through', 'High accountability — for yourself and everyone around you', 'Thrives under pressure and tight deadlines', 'Bias toward action over analysis paralysis'],
  ARRAY['Can burn out yourself and your team', 'May steamroll quieter voices in pursuit of speed', 'Relationships can feel transactional when you''re locked on a target'],
  ARRAY['Schedule deliberate recovery time — for you and your crew. Sustainable pace beats burnout every time.', 'Before pushing harder, ask: "Does my team have what they need to execute?"', 'Practice pausing 5 seconds before responding in meetings — let others speak first'],
  ARRAY['the_architect', 'the_operator', 'the_catalyst'],
  ARRAY['the_diplomat', 'the_anchor']
),

('the_diplomat', 'The Diplomat', 'Builds the crew that builds the project',
  '{"drive": 50, "resilience": 58, "vision": 55, "connection": 92, "adaptability": 85, "integrity": 65}',
  '{"connection": {"below": 40}, "adaptability": {"below": 35}}',
  'You lead through people. Not in a soft, hand-holding way — in the way that actually gets crews to show up, buy in, and give a damn. You read rooms. You navigate conflict before it explodes. You build teams that trust each other because they trust you first. In a world that confuses leadership with volume, you prove that influence is quieter than authority — and more powerful.',
  ARRAY['Reads people and situations with precision', 'Builds high-trust teams that self-organize', 'Navigates conflict and competing interests', 'Adapts communication style to the audience'],
  ARRAY['May avoid necessary confrontation to preserve harmony', 'Can spread yourself thin managing everyone''s needs', 'Risk of being seen as indecisive when trying to find consensus'],
  ARRAY['Practice delivering hard truths within 24 hours — delay makes it worse', 'Identify your top 3 priorities each week and protect them from being diluted by people-pleasing', 'Build a decision framework: when consensus matters vs when you just need to call it'],
  ARRAY['the_anchor', 'the_sage', 'the_trailblazer'],
  ARRAY['the_driver', 'the_operator']
),

('the_operator', 'The Operator', 'Runs it like a machine',
  '{"drive": 82, "resilience": 70, "vision": 45, "connection": 50, "adaptability": 45, "integrity": 90}',
  '{"integrity": {"below": 40}, "drive": {"below": 35}}',
  'You are the reason things actually work. Not the flashy vision, not the inspiring speech — the disciplined, repeatable execution that turns chaos into clockwork. You build processes that don''t break. You hold standards that don''t bend. Your team doesn''t have to guess what''s expected because you''ve already made it clear, documented it, and held everyone to it — yourself first.',
  ARRAY['Builds reliable, repeatable systems', 'Holds standards consistently without exception', 'Discipline that earns respect, not resentment', 'Detail-oriented execution that catches what others miss'],
  ARRAY['Can resist change even when the old process is broken', 'May prioritize consistency over creativity', 'Risk of micromanaging when you should be delegating'],
  ARRAY['Schedule monthly "process audits" — ask your team what''s working and what''s friction', 'Identify one area each quarter where you deliberately let someone else own the process their way', 'Practice distinguishing between "wrong" and "different than how I''d do it"'],
  ARRAY['the_architect', 'the_driver', 'the_anchor'],
  ARRAY['the_trailblazer', 'the_catalyst']
),

('the_trailblazer', 'The Trailblazer', 'Finds the path nobody else sees',
  '{"drive": 70, "resilience": 60, "vision": 90, "connection": 50, "adaptability": 92, "integrity": 55}',
  '{"vision": {"below": 40}, "adaptability": {"below": 35}}',
  'You see around corners. While everyone else is solving today''s problem, you''re already three moves ahead, asking "why are we even doing it this way?" You challenge assumptions not to be difficult, but because you genuinely believe there''s a better path — and you''re usually right. Your team might not always understand your ideas immediately, but they''ve learned to trust your instincts.',
  ARRAY['Sees opportunities others miss entirely', 'Comfortable with ambiguity and uncharted territory', 'Challenges assumptions that need challenging', 'Brings energy and excitement to new directions'],
  ARRAY['Can chase too many ideas without finishing any', 'May leave your team behind if you move too fast conceptually', 'Risk of dismissing proven methods just because they''re not new'],
  ARRAY['For every new idea, write down what you''ll STOP doing to make room for it', 'Build a "translation layer" — practice explaining your vision in concrete, step-by-step terms', 'Partner with an Operator or Architect to turn your ideas into executable plans'],
  ARRAY['the_diplomat', 'the_catalyst', 'the_sage'],
  ARRAY['the_operator', 'the_architect']
),

('the_anchor', 'The Anchor', 'Holds it together when things fall apart',
  '{"drive": 55, "resilience": 92, "vision": 50, "connection": 85, "adaptability": 60, "integrity": 72}',
  '{"resilience": {"below": 40}, "connection": {"below": 35}}',
  'When everything goes sideways — and it always does — you''re the one who stays calm. Not because you don''t feel the pressure, but because you''ve learned that panic is contagious and composure is too. Your team looks to you not for the loudest voice, but for the steadiest one. You absorb the chaos so others can focus. That''s not passive. That''s the hardest kind of strength.',
  ARRAY['Unshakeable composure under pressure', 'Emotionally intelligent — reads and stabilizes the room', 'Creates psychological safety that unlocks honesty', 'Steady decision-making when stakes are highest'],
  ARRAY['Can absorb too much — risk of quiet burnout', 'May be too patient with underperformance', 'Comfort with stability can look like lack of ambition'],
  ARRAY['Set hard boundaries on what you absorb — not every crisis needs your emotional bandwidth', 'Practice initiating difficult conversations instead of waiting for them to become unavoidable', 'Identify one ambitious goal per quarter that pushes you outside your comfort zone'],
  ARRAY['the_operator', 'the_diplomat', 'the_driver'],
  ARRAY['the_catalyst', 'the_trailblazer']
),

('the_catalyst', 'The Catalyst', 'Sparks the change others follow',
  '{"drive": 88, "resilience": 65, "vision": 88, "connection": 60, "adaptability": 72, "integrity": 55}',
  '{"drive": {"below": 40}, "vision": {"below": 40}}',
  'You make things happen that weren''t happening before. Not through force — through energy. You walk into a stalled project and something shifts. You articulate a future state so clearly that people want to run toward it. Your superpower isn''t just having ideas — it''s making other people believe in them badly enough to act. Momentum follows you like a shadow.',
  ARRAY['Generates momentum from nothing', 'Inspires action through vision and energy', 'Breaks through organizational inertia', 'Attracts and energizes talented people'],
  ARRAY['Can lose interest once the initial spark fades', 'May overpromise in the excitement of a new direction', 'Risk of leaving others to handle the details and follow-through'],
  ARRAY['For every initiative you spark, assign an owner who will carry it to completion — and stay accountable to them', 'Build a personal "promise tracker" — write down every commitment and review weekly', 'Practice staying engaged through the boring middle of a project, not just the exciting start'],
  ARRAY['the_driver', 'the_trailblazer', 'the_architect'],
  ARRAY['the_operator', 'the_anchor']
),

('the_sage', 'The Sage', 'Knowledge dies unshared',
  '{"drive": 50, "resilience": 65, "vision": 58, "connection": 88, "adaptability": 55, "integrity": 92}',
  '{"connection": {"below": 35}, "integrity": {"below": 40}}',
  'You play the long game. While others optimize for this quarter, you''re developing the people who will lead next year. You teach, not because it''s efficient, but because it''s the only thing that compounds. Your team doesn''t just perform under you — they grow. The leaders you develop become your legacy, and that matters more to you than any individual result.',
  ARRAY['Develops people who become leaders themselves', 'Builds culture that outlasts any single person', 'Leads with consistency and earned moral authority', 'Creates environments where people do their best work'],
  ARRAY['Can prioritize development over immediate results', 'May be too patient — waiting for growth when the situation needs speed', 'Risk of being taken advantage of by those who mistake generosity for softness'],
  ARRAY['Set clear performance thresholds — development and accountability aren''t mutually exclusive', 'Identify situations that need a directive decision, not a teaching moment', 'Protect your own growth — schedule time for your development, not just your team''s'],
  ARRAY['the_diplomat', 'the_architect', 'the_trailblazer'],
  ARRAY['the_driver', 'the_catalyst']
);
```

**Step 1: Execute the SQL**

Use `execute_sql` on project `ijeekuhbatykdomumfjx`.

**Step 2: Verify**

Run: `SELECT id, name, tagline FROM archetype_profiles ORDER BY name;`

---

## Task 4: Create the Question Pool

This is the most critical task. 120 questions across 6 dimensions, 3 question types, with cross-loading, reverse scoring, validity pairs, and impression management items.

**Files:**
- Populates `question_pool` table via SQL

The question pool must be constructed with extreme care. Each item must:
- Measure what it claims to measure
- Use behavioral anchoring (not self-description)
- Use temporal specificity where applicable
- Be balanced in social desirability for forced-choice pairs
- Cross-load where realistic (leadership behaviors span dimensions)

**Step 1: Generate and insert DRIVE dimension items (20 items)**

Execute SQL inserting 20 items for the `drive` dimension:
- 12 Likert items (5 reverse-scored, 2 cross-loading with resilience, 1 cross-loading with vision)
- 5 situational judgment items (each with 4 options scoring across multiple dimensions)
- 3 forced-choice items (paired with connection or adaptability items)
- 1 impression management item
- 1 validity pair (paired with another drive likert)

Likert scoring_weights format:
```json
{
  "1": {"drive": 0}, "2": {"drive": 25}, "3": {"drive": 50}, "4": {"drive": 75}, "5": {"drive": 100}
}
```
For reverse-scored:
```json
{
  "1": {"drive": 100}, "2": {"drive": 75}, "3": {"drive": 50}, "4": {"drive": 25}, "5": {"drive": 0}
}
```
For cross-loaded (e.g., 70% drive, 30% resilience):
```json
{
  "1": {"drive": 0, "resilience": 0}, "2": {"drive": 17.5, "resilience": 7.5}, "3": {"drive": 35, "resilience": 15}, "4": {"drive": 52.5, "resilience": 22.5}, "5": {"drive": 70, "resilience": 30}
}
```

Situational options format:
```json
[
  {"key": "a", "text": "Option A text", "scores": {"drive": 80, "connection": 20}},
  {"key": "b", "text": "Option B text", "scores": {"drive": 40, "connection": 70}},
  {"key": "c", "text": "Option C text", "scores": {"drive": 60, "connection": 50}},
  {"key": "d", "text": "Option D text", "scores": {"drive": 20, "connection": 80}}
]
```

Forced-choice options format:
```json
[
  {"key": "a", "text": "Statement A", "scores": {"drive": 80, "connection": 30}},
  {"key": "b", "text": "Statement B", "scores": {"drive": 30, "connection": 80}}
]
```

**IMPORTANT:** The actual question text must be written by an agent using the OPS copywriter voice AND psychometric best practices. Each question must:
- Use behavioral language ("When deadlines are tight, I..." not "I am driven")
- Be specific and concrete
- Not have an obviously "correct" answer
- Be appropriate for both trades professionals and general audience

Use a subagent to generate the full set of 20 drive items with all metadata, review for quality, then insert.

**Step 2-6: Repeat for RESILIENCE, VISION, CONNECTION, ADAPTABILITY, INTEGRITY**

Same structure as Step 1. 20 items per dimension.

Cross-loading map (which dimensions pair together):
- Drive + Resilience (5 cross-loaded items total across both)
- Vision + Adaptability (5 cross-loaded)
- Connection + Integrity (5 cross-loaded)
- Drive + Vision (3 cross-loaded — for Catalyst archetype differentiation)
- Resilience + Connection (3 cross-loaded — for Anchor archetype differentiation)
- Drive + Integrity (3 cross-loaded — for Operator archetype differentiation)

**Step 7: Insert validity pairs and impression management items**

6 validity pairs (12 items total — already included in the per-dimension counts above, just need the `validity_pair_id` linked):
- 1 pair per dimension
- Paired items measure the same thing with different wording

6 impression management items (already included in per-dimension counts):
- 1 per dimension
- Universally desirable statements that are statistically rare to honestly endorse strongly

**Step 8: Verify pool integrity**

Run verification queries:
```sql
-- Total count should be ~120
SELECT COUNT(*) FROM question_pool;

-- Per dimension should be ~20
SELECT dimension, COUNT(*) FROM question_pool GROUP BY dimension ORDER BY dimension;

-- Per type should be roughly 60% likert, 25% situational, 15% forced_choice
SELECT type, COUNT(*), ROUND(COUNT(*)::numeric / (SELECT COUNT(*) FROM question_pool) * 100, 1) as pct FROM question_pool GROUP BY type;

-- Cross-loaded count should be ~19
SELECT COUNT(*) FROM question_pool WHERE secondary_dimension IS NOT NULL;

-- Reverse scored should be ~40% of likert items
SELECT COUNT(*) FILTER (WHERE reverse_scored) as reversed, COUNT(*) as total FROM question_pool WHERE type = 'likert';

-- Validity pairs should have 6 unique pair IDs
SELECT COUNT(DISTINCT validity_pair_id) FROM question_pool WHERE validity_pair_id IS NOT NULL;

-- Impression management should be 6
SELECT COUNT(*) FROM question_pool WHERE is_impression_management = TRUE;

-- Version availability
SELECT unnest(version_availability) as version, COUNT(*) FROM question_pool GROUP BY version;
```

---

## Task 5: Create the Supabase Admin Client Module

**Files:**
- Create: `src/lib/supabase-admin.ts`

Following the pattern in `src/lib/blog.ts`:

```typescript
/**
 * Server-side Supabase client with service role key.
 * Bypasses RLS. Only use in Server Actions and Route Handlers.
 */

import { createClient } from '@supabase/supabase-js';

export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
```

**Step 1: Create the file**

Write the file above to `src/lib/supabase-admin.ts`.

**Step 2: Refactor blog.ts to use shared client**

Update `src/lib/blog.ts` to import from `supabase-admin.ts` instead of creating its own client:

Replace:
```typescript
import { createClient } from '@supabase/supabase-js';
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
```
With:
```typescript
import { supabaseAdmin } from './supabase-admin';
```

**Step 3: Verify blog still works**

Run: `npm run build` — should compile without errors.

**Step 4: Commit**

```bash
git add src/lib/supabase-admin.ts src/lib/blog.ts
git commit -m "refactor: extract shared supabase admin client"
```

---

## Task 6: Create TypeScript Types

**Files:**
- Create: `src/lib/assessment/types.ts`

```typescript
/**
 * Leadership Assessment — Core Types
 */

/* ------------------------------------------------------------------ */
/*  Enums / Literals                                                   */
/* ------------------------------------------------------------------ */

export type Dimension = 'drive' | 'resilience' | 'vision' | 'connection' | 'adaptability' | 'integrity';

export type QuestionType = 'likert' | 'situational' | 'forced_choice';

export type AssessmentVersion = 'quick' | 'deep';

export type SessionStatus = 'in_progress' | 'completed' | 'abandoned';

export const DIMENSIONS: Dimension[] = ['drive', 'resilience', 'vision', 'connection', 'adaptability', 'integrity'];

export const CHUNKS_PER_VERSION: Record<AssessmentVersion, number> = {
  quick: 3,
  deep: 10,
};

export const QUESTIONS_PER_CHUNK = 5;

/* ------------------------------------------------------------------ */
/*  Question Pool                                                      */
/* ------------------------------------------------------------------ */

export interface ScoringWeights {
  [answerValue: string]: { [dim in Dimension]?: number };
}

export interface QuestionOption {
  key: string;
  text: string;
  scores: { [dim in Dimension]?: number };
}

export interface PoolQuestion {
  id: string;
  dimension: Dimension;
  secondary_dimension: Dimension | null;
  type: QuestionType;
  text: string;
  options: QuestionOption[] | null;
  scoring_weights: ScoringWeights;
  difficulty: number;
  reverse_scored: boolean;
  validity_pair_id: string | null;
  is_impression_management: boolean;
  version_availability: AssessmentVersion[];
}

/* ------------------------------------------------------------------ */
/*  Scoring                                                            */
/* ------------------------------------------------------------------ */

export interface DimensionScore {
  score: number;          // 0-100 best estimate
  confidence: number;     // 0-1
  standard_error: number; // measurement error estimate
  responses_count: number;
  raw_sum: number;
  max_possible: number;
}

export type ScoreProfile = Record<Dimension, DimensionScore>;

export type SimpleScores = Record<Dimension, number>;

/* ------------------------------------------------------------------ */
/*  Validity                                                           */
/* ------------------------------------------------------------------ */

export interface ValidityFlags {
  inconsistency_index: number;       // average delta between paired items
  impression_management: number;     // % of IM items endorsed at 4-5
  straight_line_pct: number;         // % of likert answers that are the same value
  fast_response_pct: number;         // % of answers under 2 seconds
  overall_reliability: 'high' | 'medium' | 'low';
}

/* ------------------------------------------------------------------ */
/*  Archetype                                                          */
/* ------------------------------------------------------------------ */

export interface ArchetypeProfile {
  id: string;
  name: string;
  tagline: string;
  ideal_scores: SimpleScores;
  red_flags: { [dim in Dimension]?: { below?: number; above?: number } };
  description_template: string;
  strengths: string[];
  blind_spots: string[];
  growth_actions: string[];
  compatible_with: string[];
  tension_with: string[];
}

/* ------------------------------------------------------------------ */
/*  AI Analysis Output                                                 */
/* ------------------------------------------------------------------ */

export interface AnalysisStrength {
  title: string;
  description: string;
}

export interface AnalysisBlindSpot {
  title: string;
  description: string;
}

export interface AnalysisGrowthAction {
  title: string;
  description: string;
}

export interface AIAnalysis {
  headline: string;
  summary: string;
  strengths: AnalysisStrength[];
  blind_spots: AnalysisBlindSpot[];
  growth_actions: AnalysisGrowthAction[];
  under_pressure: string;
  team_dynamics: string;
  deep_insight: string;
  dimensional_deep_dive?: Record<Dimension, string>; // deep version only
  population_comparison?: Record<Dimension, { score: number; percentile: number }>; // when norms available
}

/* ------------------------------------------------------------------ */
/*  Session & Response                                                 */
/* ------------------------------------------------------------------ */

export interface AssessmentSession {
  id: string;
  token: string;
  first_name: string | null;
  email: string | null;
  version: AssessmentVersion;
  status: SessionStatus;
  current_chunk: number;
  total_chunks: number;
  started_at: string;
  completed_at: string | null;
  archetype: string | null;
  secondary_archetype: string | null;
  scores: SimpleScores | null;
  score_details: ScoreProfile | null;
  ai_analysis: AIAnalysis | null;
  validity_flags: ValidityFlags | null;
  demographic_context: DemographicContext | null;
  metadata: Record<string, unknown>;
  is_synthetic: boolean;
}

export interface DemographicContext {
  team_size?: 'solo' | '2-5' | '6-15' | '16-50' | '50+';
  years_leadership?: '<1' | '1-3' | '4-10' | '10+';
  industry?: 'construction' | 'trades' | 'tech' | 'healthcare' | 'other';
}

export interface AssessmentResponse {
  id: string;
  session_id: string;
  chunk_number: number;
  question_id: string;
  question_type: QuestionType;
  question_text: string;
  answer_value: number | string; // number for likert, string key for situational/forced_choice
  dimension_target: Dimension;
  secondary_dimension_target: Dimension | null;
  response_time_ms: number | null;
  answered_at: string;
}

/* ------------------------------------------------------------------ */
/*  Client-facing (what the UI receives)                               */
/* ------------------------------------------------------------------ */

export interface ClientQuestion {
  id: string;
  type: QuestionType;
  text: string;
  options?: { key: string; text: string }[]; // no scores exposed to client
}

export interface ChunkSubmission {
  question_id: string;
  answer_value: number | string;
  response_time_ms: number;
}

export interface AssessmentResult {
  archetype: ArchetypeProfile;
  secondary_archetype: ArchetypeProfile;
  scores: SimpleScores;
  score_details: ScoreProfile;
  analysis: AIAnalysis;
  validity: ValidityFlags;
  version: AssessmentVersion;
  first_name: string;
  completed_at: string;
  norms: Record<Dimension, { percentile: number }> | null;
}
```

**Step 1: Create the file**

**Step 2: Commit**

```bash
git add src/lib/assessment/types.ts
git commit -m "feat: add leadership assessment type definitions"
```

---

## Task 7: Build the Scoring Engine

**Files:**
- Create: `src/lib/assessment/scoring.ts`

This module implements:
1. `initializeScoreProfile()` — creates a blank score profile with priors
2. `scoreResponse()` — scores a single response against a question's weights
3. `updateProfile()` — Bayesian update of a score profile with a new response
4. `scoreBatch()` — scores an entire chunk of 5 responses
5. `computeValidityFlags()` — computes inconsistency, IM, straight-lining from all responses
6. `getConfidenceLevel()` — returns 'high' | 'medium' | 'low' per dimension based on SE

The scoring logic:
- Bayesian estimation: `new_score = (prior_score * prior_confidence + new_data * item_reliability) / (prior_confidence + item_reliability)`
- Confidence accumulates per item answered: `new_confidence = min(1.0, prior_confidence + item_reliability)`
- Standard error: `SE = sqrt(1 / total_information)` where information = sum of item difficulties answered
- Cross-loading: when a question has `secondary_dimension`, score both dimensions per the weights
- Reverse scoring: handled by the `scoring_weights` in the question pool (already inverted at the data level)

**Step 1: Write the scoring engine**

The agent should implement each function with the exact logic described above. Key details:
- Initial prior: score=50, confidence=0.1, SE=0.5 for all dimensions
- `item_reliability` = question difficulty (0-1)
- For Likert: answer value is 1-5, look up in `scoring_weights[answer_value.toString()]`
- For situational/forced_choice: answer is the option key, look up in `options.find(o => o.key === answer).scores`
- Validity: track all responses, compute inconsistency from paired items, IM from IM items, straight-line from Likert answers

**Step 2: Commit**

```bash
git add src/lib/assessment/scoring.ts
git commit -m "feat: implement bayesian scoring engine"
```

---

## Task 8: Build the Archetype Matching Engine

**Files:**
- Create: `src/lib/assessment/archetypes.ts`

Implements:
1. `cosineSimilarity(a, b, weights?)` — cosine similarity between two 6D vectors, optionally weighted by confidence
2. `matchArchetype(scoreProfile, archetypeProfiles)` — returns primary + secondary match with scores
3. `applyRedFlagPenalties(similarities, scoreProfile, archetypeProfiles)` — penalizes archetypes whose red flags are triggered

Logic:
- Convert `ScoreProfile` to a 6D vector of scores
- Convert each `ArchetypeProfile.ideal_scores` to a 6D vector
- Compute cosine similarity, weighting each dimension by its confidence
- Apply red flag penalties: if user's score on dimension X is below archetype's `red_flags[X].below`, subtract 0.15 from similarity
- Sort by similarity descending
- Primary = highest, secondary = second highest
- If top two are within 0.05: flag for AI tie-breaking (return both with a `needs_tiebreak: true` flag)

**Step 1: Write the module**

**Step 2: Commit**

```bash
git add src/lib/assessment/archetypes.ts
git commit -m "feat: implement archetype matching with cosine similarity"
```

---

## Task 9: Build the Adaptive Selection Engine (OpenAI)

**Files:**
- Create: `src/lib/assessment/adaptive-selection.ts`

Implements:
1. `selectNextChunk(scoreProfile, answeredQuestionIds, availablePool, chunkNumber, totalChunks, validityFlags)` — calls OpenAI to select next 5 questions
2. `selectSeedChunk(version)` — deterministic first chunk selection (broad coverage across all 6 dimensions, mixed types)
3. `deterministicFallback(scoreProfile, availablePool)` — fallback if OpenAI fails (Fisher information selection)

The OpenAI call:
- Model: `gpt-4o`
- Temperature: 0.0 (deterministic selection)
- System prompt: detailed instructions on the 5 selection priorities (reduce uncertainty, resolve archetype ambiguity, cross-validate, mix types, detect gaming)
- User message: JSON with current scores, confidence intervals, answered IDs, available pool (IDs + dimensions + types + difficulty), response patterns
- Response format: JSON with `{ selected_ids: string[], reasoning: string }`
- Timeout: 8 seconds, fallback to deterministic

The seed chunk selection (no AI needed):
- Pick 1 question per dimension (6 total — but we only need 5)
- Drop the dimension with the most items available (it can wait)
- Prefer one situational or forced-choice in the mix
- Sort by difficulty ascending (start easy)

**Step 1: Create OpenAI client helper**

Create `src/lib/openai.ts`:
```typescript
import OpenAI from 'openai';

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});
```

**Step 2: Write the adaptive selection module**

**Step 3: Commit**

```bash
git add src/lib/openai.ts src/lib/assessment/adaptive-selection.ts
git commit -m "feat: implement AI adaptive question selection engine"
```

---

## Task 10: Build the Analysis Generation Engine (OpenAI)

**Files:**
- Create: `src/lib/assessment/analysis-generator.ts`

Implements:
1. `generateAnalysis(session, responses, archetype, secondaryArchetype, scoreProfile, validityFlags, demographicContext, version)` — calls OpenAI to generate the full personalized analysis
2. Returns `AIAnalysis` type

The OpenAI call:
- Model: `gpt-4o`
- Temperature: 0.7 (creative variation in writing)
- System prompt: leadership analyst persona, OPS voice (direct, practical, no jargon, honest), output structure enforced
- User message: all session data, every individual response (question + answer), scores, archetypes, validity flags, demographics
- Response format: JSON matching the `AIAnalysis` type exactly
- For `deep` version: include `dimensional_deep_dive` and `population_comparison` fields
- Timeout: 30 seconds with 1 retry
- The system prompt must include the OPS voice rules (from the brand voice bible): direct, practical, no corporate jargon, write like someone who's actually led teams

**Step 1: Write the module**

**Step 2: Commit**

```bash
git add src/lib/assessment/analysis-generator.ts
git commit -m "feat: implement AI analysis generation engine"
```

---

## Task 11: Build the Question Pool Cache

**Files:**
- Create: `src/lib/assessment/question-cache.ts`

Implements:
1. `getQuestionPool(version)` — loads the full pool from Supabase, caches in module-level variable
2. `getAvailableQuestions(version, excludeIds)` — returns pool minus already-asked questions
3. `getQuestionById(id)` — lookup single question
4. Cache invalidation: reload if cache is older than 1 hour

This prevents hitting Supabase for the question pool on every chunk submission. Module-level caching works in Next.js server context.

**Step 1: Write the module**

**Step 2: Commit**

```bash
git add src/lib/assessment/question-cache.ts
git commit -m "feat: add question pool caching layer"
```

---

## Task 12: Build the Server Actions

**Files:**
- Create: `src/lib/assessment/actions.ts`

This is the main entry point. Implements 4 Server Actions using `'use server'` directive:

### `startAssessment(version, demographicContext?)`
1. Generate unique token (nanoid or crypto.randomUUID short form)
2. Determine total_chunks from version
3. Insert row into `assessment_sessions`
4. Call `selectSeedChunk(version)` to get first 5 questions
5. Return `{ sessionId, token, questions: ClientQuestion[], totalChunks }`

### `submitChunkAndGetNext(sessionId, responses: ChunkSubmission[])`
1. Validate session exists and is `in_progress`
2. Insert 5 response rows into `assessment_responses`
3. Fetch all prior responses for this session
4. Run scoring engine: `scoreBatch()` on all responses to get updated `ScoreProfile`
5. Compute running `ValidityFlags`
6. Update `score_details` and `validity_flags` on the session
7. If this is the last chunk: return `{ complete: true, currentChunk }`
8. Otherwise: call adaptive selection engine for next 5 questions
9. Increment `current_chunk` on session
10. Return `{ complete: false, questions: ClientQuestion[], currentChunk, totalChunks }`

### `submitEmailAndGenerateResults(sessionId, firstName, email)`
1. Validate session has all chunks completed
2. Store `first_name` and `email` on session
3. Fetch all responses
4. Run final scoring (full recalculation with all responses)
5. Fetch archetype profiles from DB
6. Run archetype matching
7. If tie-breaking needed: include both archetypes in AI analysis call
8. Call analysis generation engine
9. Fetch score norms (if available)
10. Update session: `status='completed'`, `completed_at=now()`, `archetype`, `secondary_archetype`, `scores`, `score_details`, `ai_analysis`
11. Return `{ token }`

### `getResults(token)`
1. Fetch session by token
2. If not completed, return error
3. Fetch archetype profiles for primary + secondary
4. Fetch score norms
5. Return `AssessmentResult`

**Step 1: Install nanoid for token generation**

```bash
npm install nanoid
```

**Step 2: Write the server actions module**

**Step 3: Verify build**

```bash
npm run build
```

**Step 4: Commit**

```bash
git add src/lib/assessment/actions.ts package.json package-lock.json
git commit -m "feat: implement assessment server actions"
```

---

## Task 13: Build the Synthetic Population Seed Script

**Files:**
- Create: `scripts/seed-synthetic-population.ts`

This is a standalone script that:
1. Defines the 9 persona types with centers and counts
2. Defines the 6x6 correlation matrix
3. Generates 200 synthetic score profiles using multivariate normal distribution
4. For each profile: simulates responses by sampling from the question pool
5. Inserts all sessions and responses into Supabase
6. Computes initial percentile norms
7. Inserts norms into `score_norms`
8. Runs sanity checks and outputs summary

**Dependencies for the script:**
- `@supabase/supabase-js` (already installed)
- Multivariate normal: implement Cholesky decomposition inline (it's ~20 lines of math, no external dep needed)

**Running the script:**
```bash
npx tsx scripts/seed-synthetic-population.ts
```

This needs `tsx` to run TypeScript directly:
```bash
npm install -D tsx
```

**Step 1: Install tsx**

**Step 2: Write the seed script**

Key implementation details:
- Cholesky decomposition of the 6x6 correlation matrix
- For each persona: generate N profiles by sampling `z ~ N(0, I)`, then `x = L * z` (where L is Cholesky factor), then scale and shift to persona center with SD of 10-14
- Clamp scores to 0-100
- Assign archetype using the matching engine (import from `src/lib/assessment/archetypes.ts`)
- Generate dummy timestamps spread over the past 90 days
- Mark `is_synthetic = true` and `persona_type = <name>`
- Compute percentile norms: for each dimension, sort all 200 scores, compute p10/p25/p50/p75/p90

**Step 3: Run the script**

```bash
npx tsx scripts/seed-synthetic-population.ts
```

**Step 4: Verify**

```sql
SELECT COUNT(*) FROM assessment_sessions WHERE is_synthetic = TRUE;
-- Should be 200

SELECT dimension, percentile_map, sample_size FROM score_norms ORDER BY dimension;
-- Should have 6 rows with sample_size = 200

SELECT archetype, COUNT(*) FROM assessment_sessions WHERE is_synthetic = TRUE GROUP BY archetype ORDER BY COUNT(*) DESC;
-- All 8 archetypes should appear, each with at least 10
```

**Step 5: Commit**

```bash
git add scripts/seed-synthetic-population.ts package.json package-lock.json
git commit -m "feat: add synthetic population seed script with 200 baseline profiles"
```

---

## Task 14: Create the Assessment Module Barrel Export

**Files:**
- Create: `src/lib/assessment/index.ts`

```typescript
/**
 * Leadership Assessment — Public API
 */

export * from './types';
export { startAssessment, submitChunkAndGetNext, submitEmailAndGenerateResults, getResults } from './actions';
```

**Step 1: Create the file**

**Step 2: Commit**

```bash
git add src/lib/assessment/index.ts
git commit -m "feat: add assessment module barrel export"
```

---

## Task 15: End-to-End Verification

**Step 1: Build check**

```bash
cd "/Users/jacksonsweet/Desktop/OPS LTD./ops-site" && npm run build
```

Must compile without errors.

**Step 2: Manual integration test via Supabase SQL**

Verify the full data flow works by checking:
```sql
-- Question pool populated
SELECT COUNT(*) FROM question_pool;

-- Archetype profiles populated
SELECT COUNT(*) FROM archetype_profiles;

-- Synthetic sessions populated
SELECT COUNT(*) FROM assessment_sessions WHERE is_synthetic = TRUE;

-- Norms populated
SELECT COUNT(*) FROM score_norms;

-- Responses populated for synthetic sessions
SELECT COUNT(*) FROM assessment_responses;
```

**Step 3: Lint check**

```bash
npm run lint
```

**Step 4: Final commit if any fixes needed**

---

## Summary

After all 15 tasks, the backend will have:
- 5 Supabase tables with RLS
- 8 archetype profiles with full descriptions, strengths, blind spots, growth actions, and compatibility maps
- ~120 question items across 6 dimensions, 3 types, with cross-loading, reverse scoring, validity pairs, and IM detection
- Bayesian scoring engine with confidence intervals
- Cosine similarity archetype matching with red flag penalties
- AI adaptive question selection (OpenAI gpt-4o)
- AI analysis generation with structured output
- In-memory question pool caching
- 4 Server Actions (start, submit chunk, submit email, get results)
- 200 synthetic baseline profiles with normative percentile data
- Full TypeScript type coverage

**File structure when complete:**
```
src/lib/
  assessment/
    index.ts              — barrel export
    types.ts              — all TypeScript types
    scoring.ts            — Bayesian scoring engine
    archetypes.ts         — cosine similarity matching
    adaptive-selection.ts — OpenAI question selection
    analysis-generator.ts — OpenAI analysis generation
    question-cache.ts     — in-memory pool caching
    actions.ts            — Server Actions (public API)
  openai.ts               — OpenAI client
  supabase-admin.ts       — shared server Supabase client
scripts/
  seed-synthetic-population.ts — one-time seed script
```
