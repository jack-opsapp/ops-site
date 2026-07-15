/**
 * Resolve the spec_projects row a plaintext intake URL token points at.
 *
 * The intake URL is `/spec/intake/{plaintext_token}`. The DB stores only the
 * SHA-256 hash (`spec_projects.intake_token_hash`). Stage C.2's webhook
 * generates the plaintext at deposit_paid and emits it inside the
 * `spec.deposit_confirmed` email link; Stage C.3's approval handler may also
 * issue at owner-approved buyer-checkout consumption.
 *
 * A valid intake token resolves to exactly one project row where:
 *   intake_token_hash = sha256(plaintext) AND intake_completed_at IS NULL.
 *
 * Already-completed intakes resolve to `{ completed: true }` so the page can
 * render a friendly "you're done" state without re-disclosing project data.
 *
 * Anything else returns `{ ok: false }` — generic 404 from the caller; never
 * disclose whether the token was malformed, unknown, or already consumed.
 *
 * Server-only — never import from client code.
 */

import { hashApprovalToken } from '@/lib/spec/token-hash';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

export interface IntakeProjectRow {
  id: string;
  tier: 'spec01' | 'spec02' | 'spec03';
  status: string;
  buyer_user_id: string;
  account_holder_user_id: string | null;
  linked_company_id: string | null;
  customer_email: string;
  customer_name: string | null;
  intake_responses: Record<string, unknown> | null;
  intake_files: string[];
  intake_completed_at: string | null;
  billing_province: string | null;
  is_test: boolean;
}

interface CompletedProject {
  ok: true;
  completed: true;
  project: Pick<IntakeProjectRow, 'id' | 'tier' | 'customer_email'>;
}

interface ActiveProject {
  ok: true;
  completed: false;
  project: IntakeProjectRow;
  companyName: string | null;
}

interface NotFound {
  ok: false;
}

export type IntakeTokenResolution = ActiveProject | CompletedProject | NotFound;

/**
 * SHA-256 a plaintext token and query for the matching spec_projects row.
 * Constant cost; never throws to the caller.
 */
export async function resolveIntakeToken(
  plaintextToken: string,
): Promise<IntakeTokenResolution> {
  if (typeof plaintextToken !== 'string' || plaintextToken.length < 16) {
    return { ok: false };
  }

  let hash: string;
  try {
    hash = hashApprovalToken(plaintextToken);
  } catch {
    return { ok: false };
  }

  const db = getSupabaseAdmin();
  const { data, error } = await db
    .from('spec_projects')
    .select(
      'id, tier, status, buyer_user_id, account_holder_user_id, linked_company_id, customer_email, customer_name, intake_responses, intake_files, intake_completed_at, billing_province, is_test',
    )
    .eq('intake_token_hash', hash)
    .maybeSingle();

  if (error) {
    console.error('[spec/intake-token] lookup failed', error);
    return { ok: false };
  }
  if (!data) return { ok: false };

  if (data.intake_completed_at) {
    return {
      ok: true,
      completed: true,
      project: {
        id: data.id as string,
        tier: data.tier as IntakeProjectRow['tier'],
        customer_email: data.customer_email as string,
      },
    };
  }

  const row: IntakeProjectRow = {
    id: data.id as string,
    tier: data.tier as IntakeProjectRow['tier'],
    status: data.status as string,
    buyer_user_id: data.buyer_user_id as string,
    account_holder_user_id:
      (data.account_holder_user_id as string | null) ?? null,
    linked_company_id: (data.linked_company_id as string | null) ?? null,
    customer_email: data.customer_email as string,
    customer_name: (data.customer_name as string | null) ?? null,
    intake_responses:
      (data.intake_responses as Record<string, unknown> | null) ?? null,
    intake_files: Array.isArray(data.intake_files)
      ? (data.intake_files as string[])
      : [],
    intake_completed_at: null,
    billing_province: (data.billing_province as string | null) ?? null,
    is_test: Boolean(data.is_test),
  };

  let companyName: string | null = null;
  if (row.linked_company_id) {
    const { data: companyRow } = await db
      .from('companies')
      .select('name')
      .eq('id', row.linked_company_id)
      .maybeSingle();
    if (companyRow && typeof companyRow.name === 'string') {
      companyName = companyRow.name;
    }
  }

  return { ok: true, completed: false, project: row, companyName };
}
