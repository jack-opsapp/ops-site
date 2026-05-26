/**
 * Find an OPS `users` row by auth credentials with fallback chain:
 * auth_id → firebase_uid → email.
 *
 * Mirrors the pattern in `OPS-Web/src/lib/supabase/find-user-by-auth.ts`.
 * Server-only — never import from client code.
 */

import { getSupabaseAdmin } from '@/lib/supabase-admin';

export async function findUserByAuth(
  uid: string,
  email?: string,
  select = 'id, company_id, email, first_name, last_name, phone',
): Promise<Record<string, unknown> | null> {
  const db = getSupabaseAdmin();

  const { data: byAuthId } = await db
    .from('users')
    .select(select)
    .eq('auth_id', uid)
    .is('deleted_at', null)
    .maybeSingle();
  if (byAuthId) return byAuthId as unknown as Record<string, unknown>;

  const { data: byFirebaseUid } = await db
    .from('users')
    .select(select)
    .eq('firebase_uid', uid)
    .is('deleted_at', null)
    .maybeSingle();
  if (byFirebaseUid) return byFirebaseUid as unknown as Record<string, unknown>;

  if (email) {
    const { data: byEmail } = await db
      .from('users')
      .select(select)
      .eq('email', email)
      .is('deleted_at', null)
      .maybeSingle();
    if (byEmail) return byEmail as unknown as Record<string, unknown>;
  }

  return null;
}
