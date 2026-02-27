/**
 * Leadership Assessment — AI Analysis Generation Engine
 *
 * Calls OpenAI gpt-4o to generate a personalized leadership analysis
 * from scored assessment data.
 */

import { openai } from '../openai';
import type {
  AIAnalysis,
  ArchetypeProfile,
  ScoreProfile,
  ValidityFlags,
  DemographicContext,
  AssessmentVersion,
  Dimension,
  DimensionSubScores,
  SubScore,
} from './types';
import { DIMENSIONS } from './types';

/* ------------------------------------------------------------------ */
/*  Input Type                                                         */
/* ------------------------------------------------------------------ */

export interface AnalysisInput {
  version: AssessmentVersion;
  scoreProfile: ScoreProfile;
  archetype: ArchetypeProfile;
  secondaryArchetype: ArchetypeProfile;
  responses: { question_text: string; answer_value: number | string; question_type: string }[];
  validityFlags: ValidityFlags;
  demographicContext: DemographicContext | null;
  needsTiebreak: boolean;
}

/* ------------------------------------------------------------------ */
/*  System Prompt Builder                                              */
/* ------------------------------------------------------------------ */

function buildSystemPrompt(input: AnalysisInput): string {
  const isDeep = input.version === 'deep';
  const flags = input.validityFlags;

  let prompt = `You are an executive leadership analyst writing a personalized leadership report.

CRITICAL RULE: Be brutally honest. Your job is to tell the truth, not to make people feel good. A flattering report that ignores real weaknesses is worthless — it actively harms the person by reinforcing blind spots.

Principles:
- ALWAYS reference specific scores by number. Don't say "you scored well in drive" — say "your drive score of 72 puts you in genuine strength territory." Ground every claim in the data.
- In the summary, call out the highest and lowest scores by name and number. The reader should immediately know where they stand.
- If scores are mediocre, say so. A 50 is average, not "solid." A 60 is slightly above average, not "strong."
- Blind spots should sting. If someone scored low in a dimension, explain what that actually costs them in real leadership situations. Reference the score.
- Do NOT hedge every negative with a positive. If the pattern is mostly negative, the summary should reflect that.
- Low scores in integrity, connection, or adaptability are serious leadership liabilities — treat them that way.
- High scores only in "drive" with low everything else often signals a bulldozer, not a leader. Say it.
- If someone scores uniformly high across all dimensions, be skeptical — real leaders have genuine weaknesses. Note this pattern.

Voice: confident, practical, working-class intelligence. Short sentences that hit hard. No filler words. No corporate jargon. Write like someone who's actually led teams and has fired people who couldn't see their own problems.

Score interpretation guide:
- 0-35: Significant weakness. This will hold them back.
- 36-50: Below average. Needs real work.
- 51-65: Average. Nothing to brag about.
- 66-80: Genuine strength. This is where they add value.
- 81-100: Exceptional. Rare territory.

You must respond with valid JSON matching this exact structure:
{
  "headline": "A punchy one-liner that captures their leadership identity (max 10 words). Can be unflattering if warranted.",
  "summary": "2-3 paragraph leadership summary. Be specific to their scores. If the profile has red flags (all high, all extreme, inconsistent), lead with that. Don't bury the lede.",
  "strengths": [
    { "title": "Short strength name", "description": "Why this matters and how it shows up. Only include genuine strengths backed by the data." }
  ],
  "blind_spots": [
    { "title": "Short blind spot name", "description": "How it hurts them and what it costs. Be specific about real-world consequences." }
  ],
  "growth_actions": [
    { "title": "Short action name", "description": "Concrete step they can take this week. If the issue is self-awareness, say so." }
  ],
  "under_pressure": "How they behave when stakes are high. Be specific. If the pattern suggests they crack, avoid, or bulldoze — say it.",
  "team_dynamics": "How they affect the people around them. What teammates actually experience working with this person. Include the negative if scores warrant it.",
  "deep_insight": "Analyze the full set of individual responses to find one non-obvious pattern. Something the person wouldn't expect the test to catch. Can be uncomfortable."
}`;

  // Dimensional deep dive for ALL versions (provides dimension descriptions for the sphere)
  prompt += `\n\nAlso include:
  "dimensional_deep_dive": { "drive": "paragraph", "resilience": "paragraph", "vision": "paragraph", "connection": "paragraph", "adaptability": "paragraph", "integrity": "paragraph" }

Each dimensional_deep_dive paragraph should explain what their specific score in that dimension means for their leadership — not a generic description of the dimension. If a score is low, explain the real cost. If it's average, don't dress it up.${isDeep ? ' Be thorough — 3-4 sentences per dimension.' : ' Keep each to 1-2 sentences.'}`;

  if (isDeep) {
    prompt += `\n\nIf population norms data is provided, also include:
  "population_comparison": { "drive": { "score": number, "percentile": number }, ... }
Copy the norms data as-is into population_comparison.`;
  }

  prompt += '\n\nProvide exactly 3 strengths, 2-3 blind_spots, and 3 growth_actions.';

  // Sub-scores for LeadershipSphere visualization
  prompt += `\n\nAlso include "sub_scores" — granular sub-dimension scores for each of the 6 leadership dimensions.
Use these fixed sub-dimension labels:
  - drive: ["Initiative", "Urgency", "Ambition"]
  - resilience: ["Recovery", "Composure"]
  - vision: ["Strategy", "Foresight", "Innovation"]
  - connection: ["Empathy", "Trust"]
  - adaptability: ["Flexibility", "Learning"]
  - integrity: ["Consistency", "Transparency", "Ethics"]

For each sub-dimension, assign a score (0-100) and a 1-2 sentence description based on the respondent's actual answers.
Format:
  "sub_scores": {
    "drive": [
      { "label": "Initiative", "score": 82, "description": "Specific insight about their initiative..." },
      ...
    ],
    ...
  }`;

  if (input.needsTiebreak) {
    prompt += `\n\nIMPORTANT: The respondent's scores matched two archetypes closely. Based on their actual responses, determine which is the better primary fit and explain why in the summary.`;
  }

  // Validity-based honesty instructions
  const concerns: string[] = [];

  if (flags.acquiescence_bias > 0.8) {
    concerns.push(`ACQUIESCENCE BIAS DETECTED (${Math.round(flags.acquiescence_bias * 100)}% of answers were "agree" or "strongly agree"): This person said yes to almost everything, including contradictory statements. Their scores are artificially inflated. The real scores are likely 15-25 points lower across the board.`);
  } else if (flags.acquiescence_bias > 0.7) {
    concerns.push(`High agreement tendency (${Math.round(flags.acquiescence_bias * 100)}% positive responses): Scores may be inflated by 5-15 points. Factor this into your analysis.`);
  }

  if (flags.impression_management > 0.7) {
    concerns.push(`IMPRESSION MANAGEMENT DETECTED (${Math.round(flags.impression_management * 100)}% "socially desirable" answers): This person was performing, not being honest. The social desirability items are designed to catch this. They told you what they think a good leader would say, not what they actually do.`);
  } else if (flags.impression_management > 0.5) {
    concerns.push(`Elevated impression management (${Math.round(flags.impression_management * 100)}%): Some degree of self-presentation bias. Scores in integrity and connection may be inflated.`);
  }

  if (flags.straight_line_pct > 0.6) {
    concerns.push(`STRAIGHT-LINING DETECTED (${Math.round(flags.straight_line_pct * 100)}% identical answers): This person clicked the same answer repeatedly without engaging with the questions. They either don't care about self-improvement or are afraid of what honest answers would reveal.`);
  }

  if (flags.extreme_response_pct > 0.7) {
    concerns.push(`EXTREME RESPONDING (${Math.round(flags.extreme_response_pct * 100)}% of answers at extremes): This person only uses "strongly agree" or "strongly disagree" — no nuance. Real leadership requires nuanced thinking. This pattern itself is diagnostic.`);
  }

  if (flags.inconsistency_index > 2.0) {
    concerns.push(`HIGH INCONSISTENCY (index: ${flags.inconsistency_index.toFixed(1)}): Contradicted themselves on paired questions. Either wasn't reading carefully or has poor self-awareness about their actual behavior vs. how they want to be seen.`);
  }

  if (flags.fast_response_pct > 0.5) {
    concerns.push(`Speed-running detected (${Math.round(flags.fast_response_pct * 100)}% under 2 seconds): Answered too fast to have genuinely reflected. Results should be taken with a grain of salt.`);
  }

  if (concerns.length > 0) {
    prompt += `\n\n⚠️ VALIDITY CONCERNS — YOU MUST ADDRESS THESE IN THE REPORT:\n`;
    prompt += concerns.map((c, i) => `${i + 1}. ${c}`).join('\n');
    prompt += `\n\nDo NOT gloss over these. The summary MUST lead with or prominently address these validity issues. If the data is unreliable, the person needs to know that — and needs to understand what the response pattern reveals about their self-awareness. A person who can't be honest on an anonymous assessment has a leadership problem worth naming.`;
    prompt += `\n\nAdjust your confidence in the scores accordingly. If acquiescence or impression management is high, mentally subtract 15-25 points from inflated dimensions when writing your analysis. Write about who they likely are, not who their inflated scores suggest.`;
  } else if (flags.overall_reliability === 'medium') {
    prompt += `\n\nNote: Response reliability is moderate. Some validity indicators are slightly elevated. Mention this briefly if relevant patterns appear in the data.`;
  }

  return prompt;
}

/* ------------------------------------------------------------------ */
/*  Fallback Analysis                                                  */
/* ------------------------------------------------------------------ */

function buildFallbackAnalysis(input: AnalysisInput): AIAnalysis {
  const { archetype, secondaryArchetype, scoreProfile } = input;

  const strengths = archetype.strengths.slice(0, 3).map((s, i) => ({
    title: s,
    description: i === 0
      ? `This is a core part of your leadership identity as a ${archetype.name}.`
      : `This strength supports your effectiveness in team settings.`,
  }));

  const blindSpots = archetype.blind_spots.slice(0, 3).map((b) => ({
    title: b,
    description: `Something to watch — common for ${archetype.name} leaders.`,
  }));

  const growthActions = archetype.growth_actions.slice(0, 3).map((a) => ({
    title: a,
    description: 'A practical step you can start this week.',
  }));

  // Find top and bottom dimensions
  const sorted = [...DIMENSIONS].sort(
    (a, b) => scoreProfile[b].score - scoreProfile[a].score,
  );
  const topDim = sorted[0];
  const bottomDim = sorted[sorted.length - 1];

  return {
    headline: archetype.name,
    summary: archetype.description_template,
    strengths,
    blind_spots: blindSpots,
    growth_actions: growthActions,
    under_pressure: `Under pressure, ${archetype.name} leaders tend to lean harder into ${topDim}. Watch for over-indexing there.`,
    team_dynamics: `Your team likely sees a leader strong in ${topDim} who could invest more in ${bottomDim}.`,
    deep_insight: `Your secondary archetype (${secondaryArchetype.name}) suggests you have more range than a typical ${archetype.name}. That's worth exploring.`,
  };
}

/* ------------------------------------------------------------------ */
/*  Response Parser                                                    */
/* ------------------------------------------------------------------ */

function parseAnalysisResponse(raw: string, version: AssessmentVersion): AIAnalysis | null {
  try {
    const parsed = JSON.parse(raw);

    // Validate required fields
    if (
      typeof parsed.headline !== 'string' ||
      typeof parsed.summary !== 'string' ||
      !Array.isArray(parsed.strengths) ||
      !Array.isArray(parsed.blind_spots) ||
      !Array.isArray(parsed.growth_actions) ||
      typeof parsed.under_pressure !== 'string' ||
      typeof parsed.team_dynamics !== 'string' ||
      typeof parsed.deep_insight !== 'string'
    ) {
      return null;
    }

    // Validate array items have title + description
    for (const arr of [parsed.strengths, parsed.blind_spots, parsed.growth_actions]) {
      for (const item of arr) {
        if (typeof item.title !== 'string' || typeof item.description !== 'string') {
          return null;
        }
      }
    }

    const analysis: AIAnalysis = {
      headline: parsed.headline,
      summary: parsed.summary,
      strengths: parsed.strengths,
      blind_spots: parsed.blind_spots,
      growth_actions: parsed.growth_actions,
      under_pressure: parsed.under_pressure,
      team_dynamics: parsed.team_dynamics,
      deep_insight: parsed.deep_insight,
    };

    // Dimensional deep dive (available for all versions)
    if (parsed.dimensional_deep_dive && typeof parsed.dimensional_deep_dive === 'object') {
      const dive: Record<string, string> = {};
      let valid = true;
      for (const dim of DIMENSIONS) {
        if (typeof parsed.dimensional_deep_dive[dim] === 'string') {
          dive[dim] = parsed.dimensional_deep_dive[dim];
        } else {
          valid = false;
          break;
        }
      }
      if (valid) {
        analysis.dimensional_deep_dive = dive as Record<Dimension, string>;
      }
    }

    // Deep version optional fields
    if (version === 'deep') {
      if (parsed.population_comparison && typeof parsed.population_comparison === 'object') {
        const comp: Record<string, { score: number; percentile: number }> = {};
        let valid = true;
        for (const dim of DIMENSIONS) {
          const entry = parsed.population_comparison[dim];
          if (
            entry &&
            typeof entry.score === 'number' &&
            typeof entry.percentile === 'number'
          ) {
            comp[dim] = { score: entry.score, percentile: entry.percentile };
          } else {
            valid = false;
            break;
          }
        }
        if (valid) {
          analysis.population_comparison = comp as Record<Dimension, { score: number; percentile: number }>;
        }
      }
    }

    // Sub-scores (optional, for LeadershipSphere visualization)
    if (parsed.sub_scores && typeof parsed.sub_scores === 'object') {
      const subScores: Partial<DimensionSubScores> = {};
      let allValid = true;

      for (const dim of DIMENSIONS) {
        const dimArr = parsed.sub_scores[dim];
        if (!Array.isArray(dimArr) || dimArr.length === 0) {
          allValid = false;
          break;
        }

        const validSubs: SubScore[] = [];
        for (const item of dimArr) {
          if (
            typeof item.label === 'string' &&
            typeof item.score === 'number' &&
            item.score >= 0 &&
            item.score <= 100
          ) {
            validSubs.push({
              label: item.label,
              score: item.score,
              description: typeof item.description === 'string' ? item.description : undefined,
            });
          } else {
            allValid = false;
            break;
          }
        }

        if (!allValid) break;
        subScores[dim] = validSubs;
      }

      if (allValid) {
        analysis.sub_scores = subScores as DimensionSubScores;
      }
    }

    return analysis;
  } catch {
    return null;
  }
}

/* ------------------------------------------------------------------ */
/*  Main Export                                                         */
/* ------------------------------------------------------------------ */

/**
 * Generates a personalized AI leadership analysis via OpenAI gpt-4o.
 *
 * - Builds a tailored system prompt based on the version, validity, and tiebreak state
 * - Sends the full AnalysisInput as the user message
 * - Retries once on failure (parse error or API error)
 * - Falls back to a template-based analysis if both attempts fail
 */
export async function generateAnalysis(params: AnalysisInput): Promise<AIAnalysis> {
  const systemPrompt = buildSystemPrompt(params);
  const maxTokens = params.version === 'deep' ? 5000 : 3000;

  const userMessage = JSON.stringify({
    version: params.version,
    archetype: {
      id: params.archetype.id,
      name: params.archetype.name,
      tagline: params.archetype.tagline,
      description_template: params.archetype.description_template,
      strengths: params.archetype.strengths,
      blind_spots: params.archetype.blind_spots,
      growth_actions: params.archetype.growth_actions,
      compatible_with: params.archetype.compatible_with,
      tension_with: params.archetype.tension_with,
    },
    secondaryArchetype: {
      id: params.secondaryArchetype.id,
      name: params.secondaryArchetype.name,
      tagline: params.secondaryArchetype.tagline,
    },
    scoreProfile: params.scoreProfile,
    responses: params.responses,
    validityFlags: params.validityFlags,
    demographicContext: params.demographicContext,
    needsTiebreak: params.needsTiebreak,
  });

  // Attempt up to 2 times (initial + 1 retry)
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const response = await openai.chat.completions.create(
        {
          model: 'gpt-4o',
          temperature: 0.7,
          max_tokens: maxTokens,
          response_format: { type: 'json_object' },
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userMessage },
          ],
        },
        {
          timeout: 30_000,
        },
      );

      const content = response.choices[0]?.message?.content;
      if (!content) {
        // Empty response — retry
        continue;
      }

      const analysis = parseAnalysisResponse(content, params.version);
      if (analysis) {
        return analysis;
      }

      // Parse failed — will retry on next iteration
    } catch (error) {
      // API error — will retry on next iteration
      if (attempt === 0) {
        // Brief pause before retry
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }
  }

  // Both attempts failed — return fallback
  return buildFallbackAnalysis(params);
}
