/**
 * OpenAI client — Server-side only.
 * Used by the assessment scoring and analysis engines.
 */

import OpenAI from 'openai';

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});
