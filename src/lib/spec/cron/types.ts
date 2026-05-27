/**
 * Shared types for the SPEC daily cron at /api/cron/spec-nudges.
 *
 * Each task module returns a TaskResult that the route aggregates into
 * the run summary. The summary is written to spec_communications at the
 * end of the run so operators see exactly which actions fired on which
 * projects each day.
 */

export interface TaskResult {
  /** Task identifier — stable string used in logs + the run summary. */
  task: string;
  /** Rows that were considered (e.g. `count(*)` of candidate query). */
  considered: number;
  /** Rows that actually triggered the side effect this run. */
  fired: number;
  /** Rows that errored mid-process (non-fatal — task continues). */
  errored: number;
  /** Human-readable detail lines for the run summary. */
  details: string[];
}

export function emptyTaskResult(task: string): TaskResult {
  return { task, considered: 0, fired: 0, errored: 0, details: [] };
}

/**
 * Defensive wrapper around a single per-row mutation. Catches throws so
 * one bad row never aborts the rest of the task. The caller receives a
 * boolean (true = success) so it can decide whether to bump counters.
 */
export async function safeMutate<T>(
  result: TaskResult,
  rowKey: string,
  fn: () => Promise<T>,
): Promise<T | null> {
  try {
    const out = await fn();
    return out;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`[spec/cron] ${result.task} row ${rowKey} failed:`, msg);
    result.errored += 1;
    result.details.push(`error: ${rowKey} — ${msg.slice(0, 200)}`);
    return null;
  }
}
