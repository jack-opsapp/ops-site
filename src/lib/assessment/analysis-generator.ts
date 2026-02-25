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

  let prompt = `You are an executive leadership analyst writing a personalized leadership report.

Be direct, specific, and actionable. No corporate jargon. Write like someone who's actually led teams.

Voice: confident, practical, working-class intelligence. Short sentences that hit hard. No filler words.

You must respond with valid JSON matching this exact structure:
{
  "headline": "A punchy one-liner that captures their leadership identity (max 10 words)",
  "summary": "2-3 paragraph leadership summary. Specific to their scores, not generic.",
  "strengths": [
    { "title": "Short strength name", "description": "Why this matters and how it shows up" }
  ],
  "blind_spots": [
    { "title": "Short blind spot name", "description": "How it hurts them and what it costs" }
  ],
  "growth_actions": [
    { "title": "Short action name", "description": "Concrete step they can take this week" }
  ],
  "under_pressure": "How they behave when stakes are high. Be specific.",
  "team_dynamics": "How they affect the people around them. What teammates experience.",
  "deep_insight": "Analyze the full set of individual responses to find one non-obvious pattern. Something the person wouldn't expect the test to catch."`;

  if (isDeep) {
    prompt += `\n\nThis is a DEEP assessment. Also include:
  "dimensional_deep_dive": { "drive": "paragraph", "resilience": "paragraph", "vision": "paragraph", "connection": "paragraph", "adaptability": "paragraph", "integrity": "paragraph" }

Each dimensional_deep_dive paragraph should explain what their specific score in that dimension means for their leadership — not a generic description of the dimension.`;

    // Population comparison is included in the user message if norms data is available.
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

  if (input.validityFlags.overall_reliability === 'low') {
    prompt += `\n\nNote any reliability concerns diplomatically in the summary. The validity data shows potential issues with response consistency.`;
  } else if (input.validityFlags.overall_reliability === 'medium') {
    prompt += `\n\nNote any reliability concerns diplomatically in the summary if warranted by the validity data.`;
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
    headline: `The ${archetype.name}`,
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

    // Deep version optional fields
    if (version === 'deep') {
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
