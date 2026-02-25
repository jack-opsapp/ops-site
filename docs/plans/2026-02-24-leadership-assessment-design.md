# Leadership Assessment Tool — Design Document

**Date:** 2026-02-24
**Status:** Approved
**Stack:** Next.js 16 + Supabase + OpenAI (gpt-4o) + Framer Motion

---

## Overview

An AI-adaptive leadership assessment tool hosted on the OPS website at `/tools/leadership`. Two versions: a 5-minute "Quick Read" (viral, general public) and a 20-minute "Deep Dive" (small business leaders, serious self-improvement). Uses OpenAI to adaptively select questions in chunks of 5 based on prior responses, then generates a personalized leadership analysis.

## Key Decisions

- **Audience:** Quick = general public (viral play), Deep = small business leaders / genuine improvement seekers
- **Business goal:** Lead generation (email capture before results)
- **AI interaction:** Structured questions with AI-powered adaptive selection (not chatbot)
- **Persistence:** Email capture only (name + email), no account creation. Unique token URL for revisiting results.
- **Archetypes:** 8 OPS-branded archetypes backed by validated science (Big Five + EI + Transformational Leadership)
- **Sharing:** Shareable archetype image card (downloadable/social)
- **Question delivery:** Chunks of 5, AI selects next chunk based on prior answers

---

## The 6 Scoring Dimensions

| Dimension | Based On | What It Measures |
|-----------|----------|-----------------|
| **Drive** | Big Five: Conscientiousness + Extraversion | Ambition, energy, initiative, bias toward action |
| **Resilience** | Big Five: Emotional Stability (inverse Neuroticism) | Composure under pressure, stress management, recovery |
| **Vision** | Big Five: Openness + Transformational: Inspirational Motivation | Strategic thinking, creativity, ability to see the bigger picture |
| **Connection** | Goleman EI: Empathy + Relationship Management | Empathy, trust-building, team cohesion, communication |
| **Adaptability** | DDI 5Cs: Curiosity + Creativity | Learning agility, comfort with ambiguity, willingness to change |
| **Integrity** | Servant Leadership: Ethical Behavior + Transformational: Idealized Influence | Consistency, accountability, ethical decision-making |

## The 8 Leadership Archetypes

| Archetype | Tagline | High Dimensions | Profile |
|-----------|---------|----------------|---------|
| **The Architect** | "Designs the blueprint others build on" | Vision, Integrity | Strategic planner, systems thinker, principled |
| **The Driver** | "Forward is the only direction" | Drive, Resilience | Execution-focused, high-output, accountable |
| **The Diplomat** | "Builds the crew that builds the project" | Connection, Adaptability | Relationship-first, team-builder, communicator |
| **The Operator** | "Runs it like a machine" | Drive, Integrity | Process-oriented, reliable, disciplined |
| **The Trailblazer** | "Finds the path nobody else sees" | Vision, Adaptability | Innovative, risk-tolerant, future-focused |
| **The Anchor** | "Holds it together when things fall apart" | Resilience, Connection | Calm under fire, emotionally intelligent, stabilizer |
| **The Catalyst** | "Sparks the change others follow" | Drive, Vision | Energizer, inspirational, momentum-builder |
| **The Sage** | "Knowledge dies unshared" | Connection, Integrity | Mentor, servant-leader, culture-builder |

---

## Data Model (Supabase)

### assessment_sessions

| Column | Type | Notes |
|--------|------|-------|
| id | uuid (PK) | Auto-generated |
| token | text (unique) | Short unique string for results URL |
| first_name | text | Captured at end |
| email | text | Captured at end |
| version | text | 'quick' or 'deep' |
| status | text | 'in_progress', 'completed', 'abandoned' |
| current_chunk | int | Which chunk they're on (1-indexed) |
| started_at | timestamptz | When they hit START |
| completed_at | timestamptz | When they submitted email |
| archetype | text | Assigned archetype name |
| secondary_archetype | text | Second-best match |
| scores | jsonb | { drive: 78, resilience: 65, ... } |
| score_details | jsonb | Per-dimension: { score, confidence, standard_error, responses_count } |
| ai_analysis | jsonb | Full structured analysis from OpenAI |
| validity_flags | jsonb | { inconsistency_index, impression_management, straight_line_pct } |
| demographic_context | jsonb | Optional: { team_size, years_leadership, industry } |
| metadata | jsonb | Browser, referrer, UTM params, AI selection reasoning |
| is_synthetic | boolean | Default false. True for seeded baseline data |
| persona_type | text | Null for real users. Persona name for synthetic |

### assessment_responses

| Column | Type | Notes |
|--------|------|-------|
| id | uuid (PK) | Auto-generated |
| session_id | uuid (FK) | Links to assessment_sessions |
| chunk_number | int | Which chunk (1-3 for quick, 1-10 for deep) |
| question_id | text | Identifier from the item pool |
| question_type | text | 'likert', 'situational', 'forced_choice' |
| question_text | text | The actual question shown |
| answer_value | jsonb | Raw answer |
| dimension_target | text | Primary dimension measured |
| response_time_ms | int | Time to answer (gaming detection) |
| answered_at | timestamptz | Timestamp |

### question_pool

| Column | Type | Notes |
|--------|------|-------|
| id | text (PK) | e.g., 'drive_likert_01' |
| dimension | text | Primary dimension |
| secondary_dimension | text | Optional cross-loading dimension |
| type | text | 'likert', 'situational', 'forced_choice' |
| text | text | The question/statement |
| options | jsonb | For situational/forced_choice: array of { key, text, scores } |
| scoring_weights | jsonb | How answer maps to dimension scores |
| difficulty | float | 0-1, for adaptive selection |
| reverse_scored | boolean | Whether this item is reverse-keyed |
| validity_pair_id | text | Links paired items for inconsistency detection |
| is_impression_management | boolean | Flag for IM detection items |
| version_availability | text[] | ['quick', 'deep'] or ['deep'] |

### archetype_profiles

| Column | Type | Notes |
|--------|------|-------|
| id | text (PK) | e.g., 'the_driver' |
| name | text | Display name |
| tagline | text | Tagline |
| ideal_scores | jsonb | Ideal dimensional profile |
| red_flags | jsonb | Anti-pattern scores that disqualify |
| description_template | text | Base description |
| strengths | text[] | Top strengths |
| blind_spots | text[] | Common blind spots |
| growth_actions | text[] | Recommended development actions |
| compatible_with | text[] | Complementary archetype IDs |
| tension_with | text[] | Friction archetype IDs |

### score_norms

| Column | Type | Notes |
|--------|------|-------|
| id | uuid (PK) | Auto-generated |
| dimension | text | Which dimension |
| segment | text | 'all', or demographic segment |
| percentile_map | jsonb | { "10": 32, "25": 45, "50": 58, "75": 72, "90": 84 } |
| sample_size | int | How many sessions contributed |
| computed_at | timestamptz | Last update |

### RLS Policies

- assessment_sessions: public insert, select by token only
- assessment_responses: insert linked to active session, no public select
- question_pool: read-only for API, admin-write only
- archetype_profiles: read-only public
- score_norms: read-only public

---

## Scoring Engine

Bayesian estimation that updates after every chunk:

Per dimension tracked:
- score (0-100 best estimate)
- confidence (0-1, increases with items)
- responses_count
- raw_sum (weighted sum of responses)
- max_possible (maximum possible weighted sum)
- standard_error (estimated measurement error)

Scoring per response:
1. Likert: answer (1-5) x weight factor x difficulty modifier
2. Situational: each option has pre-assigned cross-dimensional score contributions
3. Forced choice: chosen option scores positively on target dimension, unchosen provides inverse signal

Cross-loading: questions can load on two dimensions (e.g., 70% Connection / 30% Resilience).

Reverse-scored items: ~40% per dimension, automatically inverted.

Validity checks (running):
- Response time per question (too fast = random clicking)
- Consistency across same-dimension items
- Straight-line detection (>60% same Likert value)
- Inconsistency index from paired items (delta > 2.0 flags unreliable)
- Impression management detection (>75% endorsement of IM items)

## Adaptive Selection Engine (OpenAI)

After each chunk, gpt-4o selects the next 5 questions. Input includes:
- Current scores with confidence intervals
- Questions already asked
- Available question pool
- Response patterns (extreme responding, midpoint tendency, etc.)
- Dimensions with highest standard error

Selection priorities:
1. Reduce maximum uncertainty (target highest SE dimensions)
2. Resolve archetype ambiguity (differentiate between close archetypes)
3. Cross-validate (re-test moderate-confidence dimensions)
4. Mix question types (no 5 Likert in a row)
5. Detect gaming (subtle forced-choice if social desirability detected)

Fallback: deterministic Fisher information selection if OpenAI unavailable.

## Archetype Matching Engine

1. Compute 6D score vector for user
2. Cosine similarity against all 8 archetype ideal_scores
3. Weight by confidence per dimension
4. Penalty for red_flag anti-patterns
5. Assign primary + secondary archetype
6. Tie-breaking (within 0.05 similarity): AI determines from actual answer content

## Analysis Generation Engine (OpenAI)

gpt-4o generates structured analysis with:
- headline: one sentence capturing their leadership identity
- summary: 2-3 paragraphs
- strengths: 2 items with specific answer references
- blind_spots: 2 items, honest but constructive
- growth_actions: 3 specific actionable items
- under_pressure: stress response patterns
- team_dynamics: interaction with other archetypes
- deep_insight: non-obvious observation from answer pattern analysis

Deep version adds: dimensional deep-dive, leadership under different conditions, suggested resources, population percentile comparisons.

## Synthetic Baseline Population

200 synthetic sessions across 9 persona types:
- First-year founder (25), Established owner-operator (35), Scaling operator (30)
- Career foreman (25), Office-to-field crossover (20), Reluctant leader (20)
- Serial entrepreneur (15), Second-generation owner (15), Military-to-trades (15)

Score generation uses multivariate normal distribution with known correlations:
- Drive-Resilience: +0.45
- Vision-Adaptability: +0.40
- Connection-Integrity: +0.35
- Drive-Connection: -0.15
- Resilience-Adaptability: +0.20

Synthetic weight decay: weight = is_synthetic ? max(0.5, 1 - (real_count / 400)) : 1.0

## Pre-Assessment Demographics (Optional)

3 optional questions before first chunk:
1. Team size (Solo / 2-5 / 6-15 / 16-50 / 50+)
2. Years in leadership (<1 / 1-3 / 4-10 / 10+)
3. Industry (Construction / Trades / Tech / Healthcare / Other)

Don't affect scoring. Provide context for AI analysis and future norm segmentation.

## Question Pool Requirements

90-120 total items:
- 6 dimensions x 15-20 items each
- Items at varying difficulty levels
- All 3 question types per dimension
- ~30% cross-loaded on two dimensions
- ~40% reverse-scored per dimension
- 4-6 inconsistency detection pairs
- 4-6 impression management items
- Behavioral anchoring over self-description
- Temporal specificity
- Social desirability matching for forced-choice pairs

## Rate Limiting & Cost

- Quick: ~4 OpenAI calls (~$0.08-0.12 per session)
- Deep: ~11 OpenAI calls (~$0.25-0.40 per session)
- Max 5 active sessions per IP per hour
- Question pool cached in-memory
- 8s timeout on selection, 30s on analysis with retry

## User Flow

1. /tools/leadership landing page with Quick Read / Deep Dive options
2. Optional 3 demographic questions (skippable)
3. Chunk 1: 5 questions (pre-selected starter set)
4. Submit -> transition animation -> AI selects next chunk
5. Repeat (quick: 3 chunks / deep: 10 chunks)
6. Enter name + email
7. Results page: archetype card, radar chart, full AI analysis
8. Share: downloadable archetype image card
9. Deep dive upsell (if quick version taken)

## Test-Retest

- 30-day minimum interval between retakes
- 60%+ new items on retake
- Score delta tracking and trend visualization after 3+ attempts

## Confidence-Gated Results

- High confidence (SE < 0.10): specific score + full narrative
- Medium confidence (SE 0.10-0.20): score range + partial narrative
- Low confidence (SE > 0.20): qualitative label + caveat
