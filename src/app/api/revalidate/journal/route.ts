/**
 * POST /api/revalidate/journal — refresh the static journal pages now.
 *
 * Called by ops-web after every write to `blog_posts`. Contract, auth and
 * the list of revalidated routes: src/lib/journal-revalidation.ts.
 */

import { revalidatePath } from 'next/cache';
import { handleJournalRevalidation } from '@/lib/journal-revalidation';

export const dynamic = 'force-dynamic';

export async function POST(request: Request): Promise<Response> {
  return handleJournalRevalidation(request, {
    secret: process.env.OPS_SITE_REVALIDATE_SECRET,
    revalidatePath,
  });
}
