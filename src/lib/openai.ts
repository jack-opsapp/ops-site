/**
 * OpenAI client — Server-side only.
 * Used by the assessment scoring and analysis engines.
 *
 * Lazy-initialized to avoid crashing at import time when
 * OPENAI_API_KEY is not yet available (e.g. during static
 * page data collection at build time).
 */

import OpenAI from 'openai';

let _client: OpenAI | null = null;

export function getOpenAIClient(): OpenAI {
  if (!_client) {
    _client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY!,
    });
  }
  return _client;
}

/** @deprecated Use getOpenAIClient() instead */
export const openai = new Proxy({} as OpenAI, {
  get(_target, prop) {
    return (getOpenAIClient() as unknown as Record<string | symbol, unknown>)[prop];
  },
});
