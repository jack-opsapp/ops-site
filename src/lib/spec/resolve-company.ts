/**
 * resolveSpecCompanyForProject — the locked company gate for SPEC deposits.
 *
 * Source: ops-software-bible/SPEC/07_ROLLOUT.md § Gate resolutions →
 * SPEC-NO-COMPANY-BUYER-FLOW-LOCK (2026-05-25).
 *
 * Every SPEC engagement requires `users.company_id` populated AND the company
 * is not soft-deleted AND the company has an account_holder_id. If any of
 * those fail, the buyer is routed to OPS-Web /setup before the deposit form
 * can render. This guarantees `spec_projects.linked_company_id` is non-null
 * on every row and that Path A vs Path B branching always has a defined
 * `account_holder_user_id`.
 *
 * Server-only — never import from client code.
 */

import { getSupabaseAdmin } from '@/lib/supabase-admin';

export type { SpecTier } from './pricing';
import type { SpecTier } from './pricing';

export type ResolveResult =
  | {
      ok: true;
      companyId: string;
      companyName: string;
      accountHolderUserId: string;
      isBuyerAccountHolder: boolean;
    }
  | {
      ok: false;
      reason: 'no_company' | 'company_deleted' | 'no_account_holder';
      redirectTo: string;
    };

export async function resolveSpecCompanyForProject(
  buyerUserId: string,
  tier: SpecTier,
): Promise<ResolveResult> {
  const db = getSupabaseAdmin();

  const { data: user } = await db
    .from('users')
    .select('id, company_id, deleted_at')
    .eq('id', buyerUserId)
    .is('deleted_at', null)
    .maybeSingle();

  if (!user || !user.company_id) {
    return {
      ok: false,
      reason: 'no_company',
      redirectTo: `/setup?source=spec&returnTo=${encodeURIComponent(`/spec?tier=${tier}`)}`,
    };
  }

  const { data: company } = await db
    .from('companies')
    .select('id, name, account_holder_id, deleted_at')
    .eq('id', user.company_id as string)
    .is('deleted_at', null)
    .maybeSingle();

  if (!company) {
    return {
      ok: false,
      reason: 'company_deleted',
      redirectTo: `/setup?source=spec&returnTo=${encodeURIComponent(`/spec?tier=${tier}`)}`,
    };
  }

  if (!company.account_holder_id) {
    return {
      ok: false,
      reason: 'no_account_holder',
      redirectTo: '/account-type',
    };
  }

  // companies.account_holder_id is `text` (stores users.id::text); compare as strings.
  const accountHolderId = String(company.account_holder_id);
  const buyerIdAsString = String(buyerUserId);

  return {
    ok: true,
    companyId: company.id as string,
    companyName: company.name as string,
    accountHolderUserId: accountHolderId,
    isBuyerAccountHolder: accountHolderId === buyerIdAsString,
  };
}
