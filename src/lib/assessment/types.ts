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
  score: number;
  confidence: number;
  standard_error: number;
  responses_count: number;
  raw_sum: number;
  max_possible: number;
}

export type ScoreProfile = Record<Dimension, DimensionScore>;

export type SimpleScores = Record<Dimension, number>;

export interface SubScore {
  label: string;
  score: number; // 0-100
}

export type DimensionSubScores = Record<Dimension, SubScore[]>;

/* ------------------------------------------------------------------ */
/*  Validity                                                           */
/* ------------------------------------------------------------------ */

export interface ValidityFlags {
  inconsistency_index: number;
  impression_management: number;
  straight_line_pct: number;
  fast_response_pct: number;
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
  dimensional_deep_dive?: Record<Dimension, string>;
  population_comparison?: Record<Dimension, { score: number; percentile: number }>;
}

/* ------------------------------------------------------------------ */
/*  Session & Response                                                 */
/* ------------------------------------------------------------------ */

export interface DemographicContext {
  team_size?: 'solo' | '2-5' | '6-15' | '16-50' | '50+';
  years_leadership?: '<1' | '1-3' | '4-10' | '10+';
  industry?: 'construction' | 'trades' | 'tech' | 'healthcare' | 'other';
}

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

export interface AssessmentResponse {
  id: string;
  session_id: string;
  chunk_number: number;
  question_id: string;
  question_type: QuestionType;
  question_text: string;
  answer_value: number | string;
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
  options?: { key: string; text: string }[];
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
