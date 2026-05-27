/**
 * Task 7 — conversion_event_outbox retry / dispatch.
 *
 * Source: SPEC/07_ROLLOUT.md § 10 + open item #8 (Meta CAPI + Google
 * Enhanced credentials).
 *
 * Picks up rows in `conversion_event_outbox` that are eligible for a
 * send attempt. Dispatches to Meta CAPI + Google Enhanced when env
 * tokens are present.
 *
 * Per the brief: if tokens are absent (open item #8 — credentials not
 * yet provisioned), the row stays pending and attempts are NOT bumped.
 * Once credentials land, the cron picks them up automatically.
 *
 * Conservative implementation:
 *   - For now (credentials absent at Phase 1 launch time per spec
 *     07_ROLLOUT.md § Known open items #8), the task short-circuits
 *     with a no-op when both Meta + Google env vars are missing.
 *   - When credentials land, the actual API senders are wired here.
 *     Stage C.1 conversion-events.ts intentionally left this as a stub;
 *     we honour that contract and keep the surface narrow.
 *
 * The cron logs a single "credentials absent" line per run so it's
 * visible in the run summary without flooding the log.
 */

import type { SupabaseClient } from '@supabase/supabase-js';

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
    process.env.GOOGLE_ADS_CONVERSION_ID && process.env.GOOGLE_ADS_DEVELOPER_TOKEN,
  );

  // Per spec: if neither credential set is present, leave rows pending
  // and do not bump attempts. Count candidates so the run summary
  // shows the backlog.
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

  if (!hasMeta && !hasGoogle) {
    result.details.push(
      `Meta CAPI + Google Enhanced env vars absent — ${candidates.length} pending rows left untouched (per SPEC/07_ROLLOUT.md open item #8). No attempts bumped.`,
    );
    return result;
  }

  // Credentials are present. Run the actual senders. The Meta CAPI +
  // Google Enhanced sender implementations are wired into helper
  // modules so this orchestrator stays focused on outbox bookkeeping.
  // Until those helpers land (see SPEC/07_ROLLOUT.md open item #8 for
  // procurement status), we mark a transient failure for any row when
  // env vars are set but the wiring isn't complete — that way it's
  // visible in operations but doesn't permanently lose rows.
  //
  // Today: import-time stub. When the senders ship, replace the stub
  // call with the typed sender invocations.
  for (const row of candidates) {
    await safeMutate(result, row.id, async () => {
      const sendOutcome = await sendConversionEventStub(row, { hasMeta, hasGoogle });
      const nextAttempts = row.attempts + 1;
      const reachedCap = nextAttempts >= MAX_ATTEMPTS;

      if (sendOutcome.ok) {
        const { error: upErr } = await db
          .from('conversion_event_outbox')
          .update({ status: 'sent', sent_at: now.toISOString(), last_attempt_at: now.toISOString(), last_error: null })
          .eq('id', row.id);
        if (upErr) throw new Error(`success update failed: ${upErr.message}`);
        result.fired += 1;
        return;
      }

      const { error: upErr } = await db
        .from('conversion_event_outbox')
        .update({
          status: reachedCap ? 'permanent_failure' : 'failed',
          attempts: nextAttempts,
          last_attempt_at: now.toISOString(),
          last_error: sendOutcome.error.slice(0, 400),
        })
        .eq('id', row.id);
      if (upErr) throw new Error(`failure update failed: ${upErr.message}`);
    });
  }

  return result;
}

interface SendOutcome {
  ok: boolean;
  error: string;
}

/**
 * Placeholder for the real Meta CAPI + Google Enhanced senders. Today
 * returns a transient failure that surfaces in last_error so it's
 * obvious in the admin /admin/spec view that credentials are present
 * but wiring is incomplete. Once the senders are implemented, this
 * function dispatches and returns `{ ok: true }` on success.
 */
async function sendConversionEventStub(
  row: ConversionRow,
  creds: { hasMeta: boolean; hasGoogle: boolean },
): Promise<SendOutcome> {
  // Reference parameters so the stub signature stays meaningful — the
  // real implementation will need both row and creds.
  void row;
  void creds;
  return {
    ok: false,
    error:
      'sender_not_implemented — env credentials present but Meta CAPI / Google Enhanced sender modules have not yet been wired. Tracked in SPEC/07_ROLLOUT.md open item #8.',
  };
}
