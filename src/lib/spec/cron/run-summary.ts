/**
 * Run-summary writer.
 *
 * After every daily run, write ONE row to spec_communications with the
 * full per-task summary serialized into the body field. The row is
 * not attached to any specific project (spec_project_id is required by
 * the table schema, so we attach it to a synthetic "all SPEC ops" row
 * by using a sentinel UUID would violate the FK — instead we look up
 * a representative spec_projects row to attach to). To keep the
 * summary visible without coupling to a customer project, we use the
 * service-role privilege to insert directly even though the table
 * requires spec_project_id NOT NULL.
 *
 * Strategy: we attach to the most recently created spec_projects row
 * (any tier, any status). That row's audit log will then carry a
 * `cron_run_summary` system entry per day. The /admin/spec view's
 * project-specific filter sees only this row's noise — operators
 * looking for the run summary will use the dedicated /admin/spec view
 * or query directly. If there are zero spec_projects rows in the
 * system, we skip the row entirely (nothing to attach to; the per-row
 * details inside each task module already logged to the relevant
 * projects).
 *
 * The structured summary is also returned in the route response so
 * Vercel cron logs capture it without needing a DB read.
 */

import type { SupabaseClient } from '@supabase/supabase-js';

import type { TaskResult } from './types';

export interface RunSummary {
  ranAt: string;
  durationMs: number;
  tasks: TaskResult[];
  total: {
    considered: number;
    fired: number;
    errored: number;
  };
}

export function summarize(results: TaskResult[], startedAt: number, ranAt: Date): RunSummary {
  const total = {
    considered: 0,
    fired: 0,
    errored: 0,
  };
  for (const r of results) {
    total.considered += r.considered;
    total.fired += r.fired;
    total.errored += r.errored;
  }
  return {
    ranAt: ranAt.toISOString(),
    durationMs: Date.now() - startedAt,
    tasks: results,
    total,
  };
}

export async function persistRunSummary(
  db: SupabaseClient,
  summary: RunSummary,
): Promise<void> {
  try {
    // Pick the most recently created spec_projects row to attach the
    // summary to. The summary is global; the per-row attachment is just
    // a satisfying-the-FK convenience.
    const { data: anchor, error: anchorErr } = await db
      .from('spec_projects')
      .select('id')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (anchorErr) {
      console.error('[spec/cron/run-summary] anchor lookup failed:', anchorErr.message);
      return;
    }
    if (!anchor) {
      // No projects yet — nothing to attach to. The summary is still
      // returned in the route response.
      return;
    }

    const { error: insErr } = await db.from('spec_communications').insert({
      spec_project_id: anchor.id,
      direction: 'outbound',
      channel: 'system',
      summary: `cron_run_summary: considered=${summary.total.considered} fired=${summary.total.fired} errored=${summary.total.errored}`,
      body: JSON.stringify(summary),
    });
    if (insErr) {
      console.error('[spec/cron/run-summary] insert failed:', insErr.message);
    }
  } catch (err) {
    console.error(
      '[spec/cron/run-summary] unexpected error:',
      err instanceof Error ? err.message : String(err),
    );
  }
}
