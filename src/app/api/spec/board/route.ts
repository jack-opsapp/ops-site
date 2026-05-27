/**
 * GET /api/spec/board
 *
 * Public, unauthenticated endpoint that exposes the sanitized OPS BOARD
 * snapshot. Reads from `public.spec_public_board_snapshot` (refreshed
 * every 5 min by `pg_cron`). Spec: 04_CUSTOMER_UX.md § 3 + 07_ROLLOUT.md
 * Phase 1 § 3.
 *
 * Response shape:
 *   {
 *     tiers: SpecBoardTierRow[],
 *     refreshed_at: string | null,
 *     is_stale: boolean
 *   }
 *
 * Failure mode: never returns a 5xx to the marketing page. On Supabase
 * outage, returns 200 with `{ tiers: [], refreshed_at: null, is_stale:
 * true }` so the SpecOpsBoard component renders the dictionary-driven
 * static fallback.
 *
 * Cache: `public, max-age=300, s-maxage=300, stale-while-revalidate=60`
 * so most reads land on the Vercel edge cache and the Supabase round
 * trip happens at most once every 5 min per edge region.
 */
import { NextResponse } from 'next/server';
import { getSpecBoardSnapshot } from '@/lib/spec/board';

// This route reads upstream snapshot state, so we never want to pin
// its output at build time. Force dynamic to make the s-maxage header
// the authoritative cache directive (the Vercel edge respects it).
export const dynamic = 'force-dynamic';
export const revalidate = 0;

const CACHE_HEADER = 'public, max-age=300, s-maxage=300, stale-while-revalidate=60';

export async function GET() {
  const snapshot = await getSpecBoardSnapshot();
  return NextResponse.json(snapshot, {
    status: 200,
    headers: { 'Cache-Control': CACHE_HEADER },
  });
}
