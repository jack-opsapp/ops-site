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

  let prompt = `You are a leadership analyst writing a personalized assessment report.

Core principle: Be factual and objective. Report what the data shows without flattery or hostility. Your job is to give the respondent an accurate mirror — not to make them feel good, and not to punish them. Let the scores speak.

Principles:
- ALWAYS reference specific scores by number. Say "your drive score of 72 is in the strength range" — ground every claim in data.
- In the summary, state the highest and lowest scores by name and number upfront. The reader should immediately know where they stand.
- Use the score interpretation guide below literally. A 50 is average. A 60 is slightly above average. A 75 is a genuine strength. Don't inflate or deflate.
- For low scores, explain the practical implications for leadership — what opportunities might be missed, what behaviors might be absent. Be specific, not punitive.
- For high scores, explain the practical value. Also note if a score is high enough (90+) that the associated behaviors may be over-indexed.
- If the overall pattern is weak, reflect that. If it's strong, reflect that. Match the tone to the data.
- Every dimension has a "too much" failure mode. Scores 90+ warrant noting this. Very high drive without connection may indicate a tendency to push through people. Very high connection without drive may indicate difficulty making hard calls.

Voice: direct, plain-spoken, practical. No corporate jargon. No filler. Write in clear, concise sentences that a working professional would respect. Confident but not aggressive.

Score interpretation guide (use these ranges consistently):
- 0-35: Well below average. A meaningful gap in this area.
- 36-50: Below average. Room for development.
- 51-65: Average range. Functional but not a differentiator.
- 66-80: Above average. A genuine strength.
- 81-100: Exceptional. Top-tier in this area.

You must respond with valid JSON matching this exact structure:
{
  "headline": "A concise one-liner that captures their leadership profile (max 10 words). Factual, not promotional.",
  "summary": "2-3 paragraph leadership summary. Lead with the most important finding — could be a strength, a gap, or a pattern. Be specific to their scores.",
  "strengths": [
    { "title": "Short strength name", "description": "What this means practically and how it shows up. Only include genuine strengths supported by the data." }
  ],
  "blind_spots": [
    { "title": "Short blind spot name", "description": "What this gap costs in practice. Be specific about situations where it matters." }
  ],
  "growth_actions": [
    { "title": "Short action name", "description": "A concrete, actionable step. Be practical." }
  ],
  "under_pressure": "How their score profile suggests they behave under pressure. Reference specific dimension interactions.",
  "team_dynamics": "How their profile likely affects the people around them. Both the positive and negative impacts their tendencies create.",
  "deep_insight": "Analyze the full set of individual responses to find one non-obvious pattern — something the scores alone wouldn't reveal but the specific response choices do."
}`;

  // Dimensional deep dive for ALL versions
  prompt += `\n\nAlso include:
  "dimensional_deep_dive": { "drive": "paragraph", "resilience": "paragraph", "vision": "paragraph", "connection": "paragraph", "adaptability": "paragraph", "integrity": "paragraph" }

Each dimensional_deep_dive paragraph should explain what their specific score in that dimension means for their leadership. State the score, place it in the interpretation range, and describe the practical implications.${isDeep ? ' Be thorough — 3-4 sentences per dimension.' : ' Keep each to 1-2 sentences.'}`;

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

  // Validity observations — factual, non-judgmental, research-informed
  const observations: string[] = [];
  const mitigations: string[] = [];

  // Check for mitigating factors first
  const hasAdequateTime = flags.adequate_response_time ?? (flags.fast_response_pct < 0.3);
  // Only trust reverse discrimination if the field was computed (i.e., at least 1 reverse item existed).
  // This matches the guard in scoring.ts: `reverseLikertAnswers.length >= 1 && rate > 0.5`
  const hasReverseDiscrimination =
    flags.reverse_discrimination_rate !== undefined && flags.reverse_discrimination_rate > 0.5;

  if (hasAdequateTime) {
    mitigations.push('Response times indicate the respondent spent adequate time on most items (>2 seconds per item), suggesting engaged rather than mechanical responding.');
  }
  if (hasReverseDiscrimination) {
    mitigations.push(`Reverse-scored item performance (${Math.round((flags.reverse_discrimination_rate ?? 0) * 100)}% correctly differentiated) suggests the respondent was reading and engaging with item content, not simply agreeing with everything.`);
  }

  // Acquiescence
  if (flags.acquiescence_bias > 0.8) {
    if (hasReverseDiscrimination) {
      observations.push(`High agreement rate (${Math.round(flags.acquiescence_bias * 100)}% of Likert items answered "agree" or "strongly agree"). However, the respondent correctly differentiated on reverse-scored items, which suggests this pattern reflects a genuinely agreeable disposition rather than indiscriminate agreement. Scores should be interpreted at face value, though the respondent may benefit from reflecting on whether their natural agreeableness makes it harder to identify genuine weaknesses.`);
    } else {
      observations.push(`High agreement rate (${Math.round(flags.acquiescence_bias * 100)}% of Likert items answered "agree" or "strongly agree") without consistent differentiation on reverse-scored items. This pattern may indicate acquiescence bias — a tendency to agree regardless of content. Scores in this profile may be somewhat elevated. Note this context when interpreting the results, particularly for dimensions where the respondent's actual behavior may differ from their self-report.`);
    }
  } else if (flags.acquiescence_bias > 0.7) {
    observations.push(`Elevated agreement tendency (${Math.round(flags.acquiescence_bias * 100)}% positive responses). This is above the typical range and may indicate a slight positive response bias. Factor this context into your analysis.`);
  }

  // Impression management
  if (flags.impression_management > 0.7) {
    observations.push(`Elevated social desirability responding (${Math.round(flags.impression_management * 100)}% of impression management items endorsed positively). The respondent endorsed statements that are statistically uncommon to fully agree with. This may indicate a tendency toward idealized self-presentation, or it may reflect a genuinely high-functioning individual on these dimensions. Interpret integrity and connection scores with this context in mind.`);
  } else if (flags.impression_management > 0.5) {
    observations.push(`Moderately elevated impression management (${Math.round(flags.impression_management * 100)}%). Some tendency toward positive self-presentation. This is common and not necessarily indicative of inaccurate responding.`);
  }

  // Straight-lining
  if (flags.straight_line_pct > 0.6) {
    if (hasAdequateTime) {
      observations.push(`The most common Likert response accounts for ${Math.round(flags.straight_line_pct * 100)}% of answers. While this is a high concentration, response times indicate the respondent was taking adequate time per item, suggesting genuine consistency rather than disengaged clicking.`);
    } else {
      observations.push(`The most common Likert response accounts for ${Math.round(flags.straight_line_pct * 100)}% of answers, combined with rapid response times. This pattern is consistent with reduced engagement — the respondent may not have fully considered each item. Results should be interpreted with some caution.`);
    }
  }

  // Extreme responding
  if (flags.extreme_response_pct > 0.7) {
    observations.push(`${Math.round(flags.extreme_response_pct * 100)}% of Likert responses were at the extremes (1 or 5). This response style produces more polarized scores. The respondent may have strong convictions, or may tend toward black-and-white thinking on self-assessment items.`);
  }

  // Inconsistency
  if (flags.inconsistency_index > 2.0) {
    observations.push(`Inconsistency index of ${flags.inconsistency_index.toFixed(1)} on paired validity items (items measuring the same construct from different angles). Scores above 2.0 indicate the respondent gave meaningfully different answers to questions that should have aligned. This may reflect difficulty with self-assessment on certain dimensions, or genuinely context-dependent behavior.`);
  }

  // Fast responding
  if (flags.fast_response_pct > 0.5) {
    observations.push(`${Math.round(flags.fast_response_pct * 100)}% of responses were under 2 seconds. Research indicates that responses below this threshold may not reflect full consideration of the item. Results should be interpreted with reduced confidence.`);
  }

  if (observations.length > 0) {
    prompt += `\n\nRESPONSE PATTERN OBSERVATIONS:\n`;
    if (mitigations.length > 0) {
      prompt += `\nMitigating factors:\n`;
      prompt += mitigations.map((m, i) => `- ${m}`).join('\n');
      prompt += '\n';
    }
    prompt += `\nObservations:\n`;
    prompt += observations.map((o, i) => `${i + 1}. ${o}`).join('\n');
    prompt += `\n\nIncorporate these observations into your report where relevant. If mitigating factors are present, give the respondent appropriate benefit of the doubt. Do NOT moralize about the response pattern or make character judgments based on how someone answered a questionnaire. Describe patterns factually and let the reader draw their own conclusions. Report the scores as they are — do not mentally adjust or subtract from them.`;
  } else if (flags.overall_reliability === 'medium') {
    prompt += `\n\nNote: Some validity indicators are slightly elevated but within acceptable range. Mention briefly if a relevant pattern is visible in the response data.`;
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
