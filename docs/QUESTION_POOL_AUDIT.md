# Leadership Assessment — Question Pool Audit & Content Agent Brief

**Audit date**: 2026-02-24
**Audited by**: Claude (code review)
**Pool location**: `src/lib/assessment/questions/*.json`
**Seed SQL**: `scripts/seed-question-pool.sql`

---

## Current State Summary

| Metric | Value | Status |
|---|---|---|
| Total questions | 312 (52 per dimension) | Pass |
| Unique IDs | 312 / 312 | Pass |
| Schema errors | 0 | Pass |
| Type distribution | 25 likert + 17 situational + 10 FC per dim | Pass |
| Quick-eligible | ~257 | Pass |
| Deep-only | ~46 | Pass |
| Broken items | 1 (flat scoring) | Fix required |
| Weak items | 8 (low differentiation) | Fix required |
| Scoring depth | Shallow | Rework needed |
| Voice consistency | Mixed 1st/2nd person | Rework needed |
| Sub-dimension targeting | Not designed | Rework needed |
| Difficulty distribution | Over-clustered | Rework needed |
| Validity pairs | 6 total | Needs more for deep |
| Archetype profiles | In Supabase only — not auditable here | Verify separately |

---

## CRITICAL: Broken Item

### `adaptability_likert_09` — Zero signal

```json
{
  "id": "adaptability_likert_09",
  "text": "I always embrace change immediately, without any period of adjustment or discomfort.",
  "is_impression_management": true,
  "scoring_weights": {
    "1": { "adaptability": 50 },
    "2": { "adaptability": 50 },
    "3": { "adaptability": 50 },
    "4": { "adaptability": 50 },
    "5": { "adaptability": 50 }
  }
}
```

**Problem**: Every answer option produces identical scores. This item contributes nothing to the score profile — it pushes adaptability toward 50 regardless of response. The Bayesian engine treats every response identically.

**Fix**: This is an impression management item. IM items still need valid scoring weights. The question is reverse-keyed (agreeing strongly = socially desirable = suspicious), so scores should be inverted:

```json
"scoring_weights": {
  "1": { "adaptability": 100 },
  "2": { "adaptability": 75 },
  "3": { "adaptability": 50 },
  "4": { "adaptability": 25 },
  "5": { "adaptability": 0 }
}
```

The `is_impression_management: true` flag handles the validity detection separately — it counts answers of 4 or 5 toward the impression management ratio. The scoring weights should still reflect the actual construct measurement.

---

## 8 Forced Choice Items With Low Differentiation

These items have less than 30 points of scoring spread between the two options on any single dimension. The Bayesian engine receives near-equal contributions regardless of which option the user picks, making these items weak discriminators.

### The items:

| ID | Text (truncated) | Option A scores | Option B scores | Max spread |
|---|---|---|---|---|
| `connection_forced_07` | A peer confides they're burnt out... | connection:80, integrity:60 | connection:55, integrity:80 | 25 (conn), 20 (int) |
| `drive_forced_07` | Manager gives you a goal you think is too easy... | drive:85, integrity:45 | drive:60, vision:65 | 25 (drive) |
| `integrity_forced_07` | You strongly disagree with a new policy... | integrity:75, connection:50 | integrity:50, adaptability:70 | 25 (int) |
| `integrity_forced_08` | Two people deserve a promotion, one slot... | integrity:75, drive:65 | integrity:60, connection:70 | 15 (int) |
| `resilience_forced_02` | You just lost your biggest client... | resilience:70, drive:75 | resilience:75, integrity:55 | 5 (res) |
| `resilience_forced_05` | Morning after a professional failure... | resilience:65, vision:70 | resilience:75, integrity:50 | 10 (res) |
| `resilience_forced_06` | Team member made a costly error... | resilience:85, adaptability:40 | resilience:65, integrity:75 | 20 (res) |
| `resilience_forced_10` | Everything falls apart, people look to you... | resilience:75, vision:70 | resilience:70, connection:80 | 5 (res) |

**Why this matters**: Forced choice items are the most valuable item type because they force a trade-off. When both options score similarly on the primary dimension, the forced trade-off disappears. The engine can't tell which option the user prefers because the Bayesian contribution is nearly the same either way.

**Fix**: For each forced choice item, one option should score HIGH on the primary dimension (70–90) and LOW on the other (20–40), and vice versa. The whole point of forced choice is to create a genuine tension:

```
Option A: { resilience: 85, drive: 30 }    ← "I process and recover"
Option B: { resilience: 35, drive: 85 }    ← "I push through immediately"
```

Not:

```
Option A: { resilience: 70, drive: 75 }    ← nearly identical
Option B: { resilience: 75, integrity: 55 } ← nearly identical
```

---

## Scoring Depth Problems

### Problem 1: 78% of likert items use identical linear weights

117 of 150 likert items use the exact same scoring pattern:

```json
{ "1": { "dim": 0 }, "2": { "dim": 25 }, "3": { "dim": 50 }, "4": { "dim": 75 }, "5": { "dim": 100 } }
```

Or its reverse:

```json
{ "1": { "dim": 100 }, "2": { "dim": 75 }, "3": { "dim": 50 }, "4": { "dim": 25 }, "5": { "dim": 0 } }
```

**Why this matters**: Every likert question becomes interchangeable. The engine can't distinguish a "decisive action" drive question from a "sustained effort" drive question because they all map 1→0, 2→25, 3→50, 4→75, 5→100 on the drive dimension. The adaptive selection picks questions based on difficulty and dimension targeting, but the scoring engine treats them identically.

**What good non-linear scoring looks like**:

For a question measuring drive through initiative-taking:
```json
{
  "1": { "drive": 0 },
  "2": { "drive": 15 },
  "3": { "drive": 40 },
  "4": { "drive": 70 },
  "5": { "drive": 95 }
}
```
(Slightly concave — answering 4 shows much more drive than answering 3, but 5 isn't much more than 4)

For a question measuring drive through urgency/impatience:
```json
{
  "1": { "drive": 10 },
  "2": { "drive": 30 },
  "3": { "drive": 55 },
  "4": { "drive": 80 },
  "5": { "drive": 85 }
}
```
(Ceiling effect — extreme urgency doesn't indicate proportionally more drive, it may indicate poor judgment)

For a cross-loaded question (drive + connection tension):
```json
{
  "1": { "drive": 0, "connection": 80 },
  "2": { "drive": 20, "connection": 65 },
  "3": { "drive": 45, "connection": 45 },
  "4": { "drive": 70, "connection": 25 },
  "5": { "drive": 90, "connection": 10 }
}
```
(Trade-off — high drive answer implies low connection, creating richer signal)

### Problem 2: 68% of likert items score only 1 dimension

102 of 150 likert items contribute to a single dimension. Only 48 cross-load to a secondary dimension.

**Why this matters**: The model has 6 dimensions and 16 sub-dimensions. Single-dimension items give the Bayesian engine isolated data points. Cross-loaded items reveal the interplay between dimensions — how a person's drive relates to their integrity, or how their adaptability trades off against their vision. The AI analyst receives all response data and uses it to generate sub-scores and the "deep_insight" (non-obvious pattern). Single-dimension items give the AI less to work with.

**Recommendation**: At least 40–50% of likert items should cross-load. Primary dimension should always get the dominant weight. Secondary dimension gets 20–40% of the primary's weight.

---

## Voice Inconsistency

**~110 questions use first person** ("I...", "In the last month, I...", "When I...")
**~75 questions use second person** ("You...", "When you...", "Your team...")

The split is not random — certain dimension files lean one way:
- **drive, resilience, connection, integrity**: Predominantly first person
- **vision, adaptability**: Predominantly second person

**Why this matters**: Switching between "I find myself..." and "You find yourself..." mid-assessment is disorienting. It also introduces a subtle measurement bias — first-person framing triggers self-reflection, second-person framing triggers self-evaluation. These are different cognitive processes that can produce different response patterns.

**Fix**: Pick one POV and apply it to all 312 questions. Recommendation: **first person**. It's more natural for self-assessment and the majority of questions already use it. Rewrite the ~75 second-person questions to match.

---

## Sub-Dimension Coverage Gap

The AI analysis prompt requests sub-scores using 16 fixed sub-dimension labels:

| Dimension | Sub-dimensions |
|---|---|
| drive | Initiative, Urgency, Ambition |
| resilience | Recovery, Composure |
| vision | Strategy, Foresight, Innovation |
| connection | Empathy, Trust |
| adaptability | Flexibility, Learning |
| integrity | Consistency, Transparency, Ethics |

**Current coverage by direct keyword mention in question text**:

| Sub-dimension | Questions mentioning it |
|---|---|
| Initiative | 2 |
| Urgency | 0 |
| Ambition | 0 |
| Recovery | 1 |
| Composure | 0 |
| Strategy | 0 |
| Foresight | 0 |
| Innovation | 0 |
| Empathy | 0 |
| Trust | 0 |
| Flexibility | 0 |
| Learning | 2 |
| Consistency | 0 |
| Transparency | 0 |
| Ethics | 0 |

**Note**: Keyword absence doesn't mean the construct isn't measured — a question about "staying calm when things go wrong" implicitly measures Composure without using the word. But the near-total absence of deliberate sub-dimension targeting means the AI is inferring sub-scores from broad dimension data rather than from specific behavioral indicators.

**Why this matters**: The LeadershipSphere visualization renders sub-nodes for each dimension. If the AI generates sub-scores of 72, 68, 75 for Drive's three sub-dimensions, the user sees meaningful variation. But if the AI has no response data that specifically differentiates Initiative from Urgency from Ambition, those sub-scores will be semi-random guesses dressed up as insight.

**Recommendation**: For each of the 16 sub-dimensions, design at least 3–4 questions that specifically target that construct. You don't need to use the keyword in the question text — you need to design the behavioral scenario to isolate that sub-construct.

Examples for Drive sub-dimensions:

- **Initiative**: "In the last month, I started working on a problem before anyone asked me to." (already exists as `drive_likert_01`)
- **Urgency**: "When a deadline is two weeks away, I feel uncomfortable if significant work hasn't started by the end of the first week."
- **Ambition**: "I regularly set goals for myself that are more aggressive than what my role requires."

Each sub-dimension should have questions at different difficulty levels (easy + medium + hard) so the adaptive engine can probe deeper when uncertainty is high.

---

## Difficulty Distribution

| Range | Count | Percentage |
|---|---|---|
| Easy (0.00–0.33) | 15 | 5% |
| Medium (0.34–0.66) | 267 | 86% |
| Hard (0.67–1.00) | 30 | 10% |

**Problem**: The distribution is heavily clustered in the medium range. The adaptive selection engine uses difficulty as a key ranking factor — it computes `information_value = difficulty × dimension_priority_multiplier`. When 86% of items have similar difficulty, this ranking loses precision.

The Bayesian scoring engine also uses difficulty as `itemReliability` in the update formula:

```
newScore = (prior.score × prior.confidence + contribution × itemReliability) / (prior.confidence + itemReliability)
```

Items with difficulty 0.35 and 0.55 produce nearly identical reliability weights. The engine needs a wider range to properly weight item contributions.

**Recommendation**: Aim for a flatter distribution:
- Easy (0.10–0.33): ~20% of pool (~60 items)
- Medium (0.34–0.66): ~50% of pool (~155 items)
- Hard (0.67–0.90): ~30% of pool (~95 items)

Easy items should be obvious, face-valid statements that almost everyone answers the same way — they establish a baseline. Hard items should present genuine dilemmas or counter-intuitive framings where the "right" answer isn't obvious.

---

## Validity System — Needs Expansion for Deep Version

**Current**: 6 validity pairs (1 per dimension), 6 impression management items (1 per dimension)

**Problem for deep assessment**: The deep version uses 50 questions across 10 chunks. With only 6 validity pairs and 6 IM items, the validity system has very thin data. The `inconsistency_index` is computed as the mean absolute difference across all validity pairs — with only 6 pairs and some potentially not being selected by the adaptive engine, you might get 3–4 actual pair comparisons. That's not enough to reliably flag inconsistent respondents.

**Recommendations**:
- **Validity pairs**: Increase to 3–4 per dimension (18–24 total). Ensure pairs span different difficulty levels so the adaptive engine is likely to select at least one member of each pair.
- **Impression management items**: Increase to 2–3 per dimension (12–18 total). Current IM items are good ("I have never procrastinated on an important task", "I never feel stressed or overwhelmed") but more are needed for statistical reliability.
- **Design note**: Validity pairs don't need to be obviously similar in text. They should measure the same underlying construct through different behavioral lenses. Example pair for resilience:
  - "After a setback, I can usually refocus within an hour" (direct)
  - "When something goes wrong at work, I find myself dwelling on it for days" (reverse-scored, same construct)

---

## Situational Questions — Option Count Verification

All 102 situational questions have exactly 4 options. Pass.
All 60 forced choice questions have exactly 2 options. Pass.
All option objects have valid `key`, `text`, and `scores` fields. Pass.

No issues here.

---

## Archetype Profiles — Cannot Audit

Archetype profiles are loaded from the Supabase `archetype_profiles` table at runtime (`actions.ts:313`). There is no local JSON or seed SQL for archetypes in the codebase.

**Action required**: Verify the following in Supabase:
1. Table exists and contains data
2. Each profile has all required fields: `id`, `name`, `tagline`, `ideal_scores` (all 6 dimensions), `red_flags`, `description_template`, `strengths` (array), `blind_spots` (array), `growth_actions` (array), `compatible_with`, `tension_with`
3. `ideal_scores` values create meaningful separation between archetypes (if two archetypes have nearly identical ideal_scores, the cosine similarity matcher can't distinguish them)
4. `red_flags` thresholds are calibrated — each triggered flag subtracts 0.15 from similarity score. Too many flags = archetype becomes unreachable. Too few = archetype matches people it shouldn't.
5. Fallback content (`description_template`, `strengths`, `blind_spots`, `growth_actions`) matches the OPS voice: "confident, practical, working-class intelligence. Short sentences that hit hard."

---

## Synthetic Population Script

The `scripts/seed-synthetic-population.ts` script generates 200 synthetic profiles across 9 persona types using multivariate normal sampling with a Cholesky-decomposed correlation matrix. This is well-implemented and will provide good percentile norm data — **but it depends on both the question pool AND archetype profiles existing in Supabase first**. It should be re-run after any significant changes to the question pool.

---

## Priority Action List for Content Agent

### Must fix (before launch)
1. Fix `adaptability_likert_09` flat scoring weights
2. Fix 8 low-spread forced choice items — widen scoring gaps to ≥40 points on primary dimension
3. Verify archetype profiles exist and are properly structured in Supabase

### Should fix (before public launch)
4. Unify voice to first person across all 312 questions
5. Redesign scoring weights — reduce linear 0/25/50/75/100 from 78% to under 40%; introduce non-linear curves and more cross-loading
6. Flatten difficulty distribution — more easy (0.10–0.30) and hard (0.70–0.90) items
7. Add 12–18 more validity pairs (target 3–4 per dimension)
8. Add 6–12 more impression management items

### Should do (for assessment quality)
9. Design 3–4 questions per sub-dimension (48–64 targeted questions across 16 sub-dimensions)
10. Re-run synthetic population seeder after pool changes
11. Create archetype seed SQL so profiles are version-controlled, not only in Supabase
