/**
 * Task 7 — conversion_event_outbox retry / dispatch.
 *
 * Source: SPEC/07_ROLLOUT.md § 10 + open item #8 (Meta CAPI + Google
 * Enhanced credentials).
 *
 * Picks up rows in `conversion_event_outbox` that are eligible for a
 * send attempt. Dispatches to Google Enhanced Conversions when env tokens
 * are present.
 *
 * Per the brief: if Google credentials are absent, the row stays pending
 * and attempts are NOT bumped. Meta CAPI is not wired in this task, so
 * Meta-only credentials must not drain rows.
 */

import type { SupabaseClient } from '@supabase/supabase-js';

import { sendGoogleEnhancedConversion } from '@/lib/spec/google-enhanced-conversions';
import type { SpecConversionEventName } from '@/lib/spec/conversion-events';
import { emptyTaskResult, safeMutate, type TaskResult } from './types';

const TASK = 'conversion_event_outbox_retry';
const MAX_ATTEMPTS = 5;
const RETRY_COOLDOWN_MS = 60 * 60 * 1000;
const MAX_ROWS_PER_RUN = 500;

interface ConversionRow {
  id: string;
  event_name: string;
  payload: Record<string, unknown>;
  attempts: number;
}

export async function runConversionEventOutboxRetry(
  db: SupabaseClient,
  now: Date,
): Promise<TaskResult> {
  const result = emptyTaskResult(TASK);

  const hasMeta = Boolean(
    process.env.META_CAPI_PIXEL_ID && process.env.META_CAPI_ACCESS_TOKEN,
  );
  const hasGoogle = Boolean(
    process.env.GOOGLE_ADS_DEVELOPER_TOKEN &&
      process.env.GOOGLE_ADS_CUSTOMER_ID &&
      process.env.GOOGLE_ADS_REFRESH_TOKEN &&
      process.env.GOOGLE_ADS_CLIENT_ID &&
      process.env.GOOGLE_ADS_CLIENT_SECRET,
  );

  // Per spec: if Google credentials are absent, leave rows pending and
  // do not bump attempts. Count candidates so the run summary shows the backlog.
  const cooldownIso = new Date(now.getTime() - RETRY_COOLDOWN_MS).toISOString();
  const { data: rows, error } = await db
    .from('conversion_event_outbox')
    .select('id, event_name, payload, attempts, last_attempt_at')
    .in('status', ['pending', 'failed'])
    .lt('attempts', MAX_ATTEMPTS)
    .or(`last_attempt_at.is.null,last_attempt_at.lt.${cooldownIso}`)
    .order('created_at', { ascending: true })
    .limit(MAX_ROWS_PER_RUN);

  if (error) {
    result.details.push(`query error: ${error.message}`);
    result.errored += 1;
    return result;
  }
  const candidates = (rows ?? []) as Array<ConversionRow & { last_attempt_at: string | null }>;
  result.considered = candidates.length;

  if (!hasGoogle) {
    result.details.push(
      `${hasMeta ? 'Meta CAPI env vars present, but sender is not wired; Google Enhanced env vars absent' : 'Google Enhanced env vars absent'} — ${candidates.length} pending rows left untouched (per SPEC/07_ROLLOUT.md open item #8). No attempts bumped.`,
    );
    return result;
  }

  // Google credentials are present. Google Enhanced Conversion is the
  // Phase 1 paid validation path and remains outbox-first.
  for (const row of candidates) {
    await safeMutate(result, row.id, async () => {
      const sendOutcome = await sendGoogleEnhancedConversion(
        row.event_name as SpecConversionEventName,
        row.payload,
      );
      const nextAttempts = row.attempts + 1;
      const reachedCap = nextAttempts >= MAX_ATTEMPTS;

      if (sendOutcome.ok) {
        const { error: upErr } = await db
          .from('conversion_event_outbox')
          .update({ status: 'sent', sent_at: now.toISOString(), last_attempt_at: now.toISOString(), last_error: null })
          .eq('id', row.id);
        if (upErr) throw new Error(`success update failed: ${upErr.message}`);
        if (sendOutcome.sent) {
          result.fired += 1;
        } else {
          result.details.push(`processed without Google dispatch: ${row.id}`);
        }
        return;
      }

      const { error: upErr } = await db
        .from('conversion_event_outbox')
        .update({
          status: reachedCap ? 'permanent_failure' : 'failed',
          attempts: nextAttempts,
          last_attempt_at: now.toISOString(),
          last_error: (sendOutcome.error ?? 'google_send_failed').slice(0, 400),
        })
        .eq('id', row.id);
      if (upErr) throw new Error(`failure update failed: ${upErr.message}`);
    });
  }

  return result;
}
