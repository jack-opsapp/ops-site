# Leadership Assessment Framework
## Psychological Model & Content Design Specification

---

## 1. Psychological Model: 6 Dimensions × 16 Sub-Dimensions

### Dimension Architecture

Each dimension measures a distinct leadership capacity. Sub-dimensions provide the granularity needed for the AI analyst to generate specific, non-generic insights.

| Dimension | Sub-Dimensions | What It Actually Measures |
|-----------|---------------|--------------------------|
| **Drive** | Initiative, Urgency, Ambition | Energy allocation, bias toward action, goal orientation. NOT just "how hard you work" — measures WHERE you direct effort and WHY. |
| **Resilience** | Recovery, Composure | Emotional regulation under pressure, bounce-back speed, stress processing style. NOT "toughness" — measures HOW you handle setbacks, not whether you can survive them. |
| **Vision** | Strategy, Foresight, Innovation | Pattern recognition, time horizon, systems thinking. NOT "having big ideas" — measures whether you can connect today's action to tomorrow's outcome. |
| **Connection** | Empathy, Trust | Relational intelligence, emotional attunement, trust-building behavior. NOT "being nice" — measures whether you can read people AND act on what you see. |
| **Adaptability** | Flexibility, Learning | Response to novelty, identity flexibility, learning velocity. NOT "going with the flow" — measures whether change triggers growth or survival mode. |
| **Integrity** | Consistency, Transparency, Ethics | Behavioral alignment, values under pressure, accountability patterns. NOT "being honest" — measures whether your behavior matches your stated values when it costs something. |

### Curvilinear Effects (Critical for Analysis)

Every dimension has a "too much" failure mode:

| Dimension | Sweet Spot (65-85) | Over-indexed (90+) | Under-indexed (<35) |
|-----------|-------------------|---------------------|---------------------|
| Drive | Productive execution | Burnout, bulldozing, workaholism | Passivity, stagnation |
| Resilience | Steady under pressure | Emotional suppression, denial | Fragility, reactivity |
| Vision | Strategic clarity | Analysis paralysis, ivory tower | Short-sighted, reactive |
| Connection | Trust & loyalty | People-pleasing, conflict avoidance | Isolation, transactional |
| Adaptability | Flexible execution | Lack of follow-through, chaos | Rigidity, brittleness |
| Integrity | Principled consistency | Rigidity, moral superiority | Unreliable, situational ethics |

---

## 2. Question Design Philosophy

### What Makes a Question "Uncannily Accurate"

The goal is NOT to ask what someone thinks about themselves. The goal is to observe how they RESPOND to specific situations, choices, and tensions — then infer what that reveals about their leadership wiring.

#### Five Design Principles:

1. **Cross-Dimensional Tension**: The best questions force a genuine tradeoff between two good things. "Your top performer is burning out but you need them for a critical deadline" — this pits Drive against Connection. There's no right answer. The PATTERN of which dimension wins across multiple tension questions reveals the person's actual hierarchy of values.

2. **Behavioral Specificity**: "I am a good communicator" = useless. "In the last month, I delivered critical feedback to someone within 24 hours of the issue" = measurable. Past behavior is the best predictor of future behavior.

3. **Cognitive Probing**: Questions that reveal HOW someone processes, not just what they prefer. "When you're uncertain about a decision, what happens first?" reveals thinking style. "Do you like making decisions?" reveals nothing.

4. **Emotional Granularity**: Not "do you handle stress well?" but "When a project you invested months in gets cancelled, is your first reaction anger, relief, or curiosity?" The specific emotion reveals the underlying motivation.

5. **Shadow Detection**: Every strength has a shadow. Questions that catch when a strength has become pathological. "I hold my team to high standards" is transparent. "My team would say I sometimes hold standards higher than the situation requires" is shadow-aware.

### What Makes a Question BAD

- **Transparent intent**: The "right" answer is obvious
- **Self-report of trait**: "I am resilient" — people don't know
- **Universal agreement**: >80% of people would say the same thing
- **Corporate jargon**: "I leverage synergies" — meaningless
- **Lazy stems**: "Which describes you better?" for every forced-choice
- **No tension**: Only one dimension is engaged
- **Aspirational framing**: "I always..." or "I never..." (except for impression management detection)

---

## 3. Question Type Strategy

### Likert (5-point scale: Strongly Disagree → Strongly Agree)
- **Purpose**: Efficient broad measurement, statistical power
- **Best for**: Behavioral frequency, attitude measurement, reverse scoring
- **Design rule**: Each item should be specific enough that two people with different scores would behave observably differently
- **Target**: ~150 likert questions (25 per dimension)

### Situational Judgment (4 options, radial selector)
- **Purpose**: Cross-dimensional tension, behavioral prediction
- **Best for**: Revealing value hierarchies when good things conflict
- **Design rule**: All 4 options must be defensible. No "obviously wrong" answer. Each option should load on 2 dimensions (primary + secondary)
- **Target**: ~100 situational questions (16-17 per dimension)

### Forced Choice (2 options, binary fork)
- **Purpose**: Ipsative measurement, controlling acquiescence bias
- **Best for**: Revealing relative dimension priority when forced to choose
- **Design rule**: Both options equally socially desirable. Unique, vivid stems — never repeat "Which describes you better?"
- **Target**: ~60 forced-choice questions (10 per dimension)

---

## 4. Validity & Integrity System

### Validity Pairs (Target: 8 pairs for deep version)
Pairs of questions measuring the same construct from different angles. Inconsistent responses flag unreliable data.

Example pair:
- "When rules change unexpectedly, I adjust my approach without much difficulty" (adaptability, forward-scored)
- "When plans change at the last minute, I need significant time to regroup before I can be productive" (adaptability, reverse-scored)

### Impression Management Items (Target: 6 items)
Statements that are socially desirable but almost never universally true. High agreement flags "faking good."

Design rule: Must be plausible enough that some genuine high-scorers exist, but statistically rare to strongly agree with more than 1-2.

Examples:
- "I have never lost my patience with a colleague, even in the most stressful situations"
- "I always embrace change immediately, without any period of adjustment"
- "I have never made a decision I later regretted"

### Reverse Scoring
~30% of likert items should be reverse-scored to control acquiescence bias and detect straight-lining.

### Fast Response Detection
Responses under 2000ms are flagged. Too many fast responses suggest disengagement.

### Straight-Line Detection
Same answer for >60% of likert items flags mechanical responding.

---

## 5. Difficulty Calibration

Difficulty (0.0–1.0) represents how likely a high-scorer is to endorse the item.

| Difficulty | Meaning | Use Case |
|-----------|---------|----------|
| 0.2–0.3 | Easy — most people agree | Warm-up, confidence building |
| 0.4–0.5 | Medium — genuine variance | Core measurement |
| 0.6–0.7 | Hard — requires real self-awareness | Differentiating high scorers |
| 0.8–0.9 | Very hard — catches impression management | Validity items, shadow detection |

Seed chunk (first chunk) should use difficulty 0.3–0.5 (ascending) to ease the user in.

---

## 6. Sub-Dimension Coverage Requirements

Each sub-dimension needs minimum coverage for the AI to generate meaningful sub-scores:

| Sub-Dimension | Min Questions | Target |
|---------------|---------------|--------|
| Drive: Initiative | 5 | 8 |
| Drive: Urgency | 5 | 8 |
| Drive: Ambition | 5 | 8 |
| Resilience: Recovery | 6 | 10 |
| Resilience: Composure | 6 | 10 |
| Vision: Strategy | 5 | 8 |
| Vision: Foresight | 5 | 8 |
| Vision: Innovation | 5 | 8 |
| Connection: Empathy | 6 | 10 |
| Connection: Trust | 6 | 10 |
| Adaptability: Flexibility | 6 | 10 |
| Adaptability: Learning | 6 | 10 |
| Flexibility: Consistency | 5 | 8 |
| Integrity: Transparency | 5 | 8 |
| Integrity: Ethics | 5 | 8 |

---

## 7. Archetype System (8 Profiles)

Current 8 archetypes are well-designed. Key improvements:

### Shadow Profiles
Each archetype needs a "dark side" description — what happens when their pattern becomes pathological. This is what makes analysis feel "uncanny."

### Red Flag Refinement
Red flags should include BOTH below AND above thresholds for dimensions where over-indexing is harmful.

### Compatibility & Tension
Should inform the "team_dynamics" section of the AI analysis.

---

## 8. Analysis Generation Signal

### What Gets Sent to GPT-4o
Every individual response (question_text, answer_value, question_type) is sent to the AI analyst. This means:

1. **Question text matters** — vivid, specific scenarios give the AI more to work with
2. **Cross-dimensional tension questions** — the AI can see WHICH dimension won in each conflict
3. **Behavioral specificity** — the AI can reference actual behaviors the user reported
4. **Emotional responses** — the AI can identify emotional patterns across situations

### Signal Density Target
Each question should contribute to at least 2 analytical insights:
- Primary dimension score
- Sub-dimension differentiation
- Cross-dimensional pattern
- Behavioral prediction
- Shadow/dark-side detection

---

## 9. ID Naming Convention

Questions follow: `{dimension}_{type}_{number}`
- `drive_likert_01`, `drive_situational_01`, `drive_forced_01`
- Numbers are zero-padded to 2 digits
- Validity pairs: `{dimension}_vp_{number}`

---

## 10. Target Distribution Summary

| | Likert | Situational | Forced Choice | Total |
|---|--------|------------|---------------|-------|
| Drive | 25 | 17 | 10 | 52 |
| Resilience | 25 | 17 | 10 | 52 |
| Vision | 25 | 17 | 10 | 52 |
| Connection | 25 | 17 | 10 | 52 |
| Adaptability | 25 | 17 | 10 | 52 |
| Integrity | 25 | 17 | 10 | 52 |
| **Total** | **150** | **102** | **60** | **312** |

Of these:
- ~45 reverse-scored (30% of likert)
- 6 impression management items (1 per dimension)
- 8 validity pairs (16 items total)
- ~80% available in both quick + deep, ~20% deep-only
