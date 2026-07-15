/**
 * /spec/awaiting-approval — Path B intermediate wait state.
 *
 * Source: ops-software-bible/SPEC/04_CUSTOMER_UX.md § /spec/awaiting-approval +
 *         SPEC/07_ROLLOUT.md § 6 (owner-approval flow).
 *
 * Server component flow:
 *  1. Resolve the signed-in user from cookies / Authorization header.
 *     No auth → redirect to OPS-Web sign-in with a returnTo.
 *  2. Look up the buyer's most-recent `pending` row in
 *     `spec_owner_approval_requests` (buyer_user_id = current user).
 *     If none, the buyer hit this URL directly without going through
 *     /api/spec/create-checkout-session — redirect to /spec.
 *  3. Render the wait-state copy with the account_holder's first name
 *     and the company name (snapshotted at request time).
 *
 * No CTA — this is a wait state. When the owner approves, an email goes
 * to the buyer with the `/spec/checkout/[buyer_checkout_token]` link.
 */

import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import {
  getCurrentUserFromServerContext,
  buildOpsWebSignInUrl,
} from '@/lib/auth/get-current-user';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import {
  SPEC_TIER_DISPLAY_NAMES,
  formatTierCents,
  isValidTier,
  type SpecTier,
} from '@/lib/spec/pricing';

export const metadata: Metadata = {
  title: 'OPS SPEC — Awaiting Approval',
  description: 'Your purchase request is waiting on owner approval.',
  robots: { index: false, follow: false },
};

interface PendingRow {
  id: string;
  spec_project_id: string;
  account_holder_user_id: string;
  tier: string;
  approved_total_cents: number;
  approved_deposit_cents: number;
  requested_at: string;
  account_holder_first_name: string | null;
  account_holder_email: string | null;
  company_name: string | null;
}

async function loadPendingForBuyer(buyerUserId: string): Promise<PendingRow | null> {
  const db = getSupabaseAdmin();
  const { data: req } = await db
    .from('spec_owner_approval_requests')
    .select(
      'id, spec_project_id, account_holder_user_id, linked_company_id, tier, approved_total_cents, approved_deposit_cents, requested_at',
    )
    .eq('buyer_user_id', buyerUserId)
    .eq('status', 'pending')
    .order('requested_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!req) return null;

  const [holderRes, companyRes] = await Promise.all([
    db
      .from('users')
      .select('first_name, email')
      .eq('id', req.account_holder_user_id)
      .maybeSingle(),
    db
      .from('companies')
      .select('name')
      .eq('id', req.linked_company_id)
      .maybeSingle(),
  ]);

  return {
    id: req.id as string,
    spec_project_id: req.spec_project_id as string,
    account_holder_user_id: req.account_holder_user_id as string,
    tier: req.tier as string,
    approved_total_cents: req.approved_total_cents as number,
    approved_deposit_cents: req.approved_deposit_cents as number,
    requested_at: req.requested_at as string,
    account_holder_first_name:
      typeof holderRes.data?.first_name === 'string' ? holderRes.data.first_name : null,
    account_holder_email:
      typeof holderRes.data?.email === 'string' ? holderRes.data.email : null,
    company_name:
      typeof companyRes.data?.name === 'string' ? companyRes.data.name : null,
  };
}

export default async function AwaitingApprovalPage() {
  const currentUser = await getCurrentUserFromServerContext();
  if (!currentUser) {
    redirect(buildOpsWebSignInUrl('/spec/awaiting-approval'));
  }

  const pending = await loadPendingForBuyer(currentUser.id);
  if (!pending) {
    redirect('/spec');
  }

  const tier: SpecTier = isValidTier(pending.tier) ? pending.tier : 'spec02';
  const ownerLabel =
    pending.account_holder_first_name?.trim() ||
    (pending.account_holder_email ? pending.account_holder_email.split('@')[0] : null) ||
    'Your owner';
  const companyLabel = pending.company_name ?? '—';

  return (
    <main className="min-h-screen bg-ops-background text-ops-text-primary py-20 sm:py-28 px-6">
      <div className="max-w-[640px] mx-auto">
        <div className="border-l-2 border-ops-tan pl-4 mb-10">
          <p className="font-caption text-[11px] uppercase tracking-[0.18em] text-ops-tan">
            {'// OWNER APPROVAL · PENDING'}
          </p>
          <p className="font-heading font-light text-base text-ops-text-secondary mt-2">
            Request logged at{' '}
            <span className="font-mono text-ops-text-primary">
              {new Date(pending.requested_at).toLocaleString('en-CA', {
                dateStyle: 'medium',
                timeStyle: 'short',
              })}
            </span>
          </p>
        </div>

        <h1 className="font-heading font-light text-3xl sm:text-4xl text-ops-text-primary tracking-tight leading-tight">
          {ownerLabel} needs to approve this purchase.
        </h1>

        <p className="font-heading font-light text-lg text-ops-text-secondary mt-6 leading-relaxed">
          We sent them an email. Once they approve, you&rsquo;ll get a link to complete payment.
        </p>

        <div className="mt-12 border border-ops-border rounded-[10px] bg-ops-surface p-6">
          <p className="font-caption text-[10px] uppercase tracking-[0.18em] text-ops-text-mute mb-4">
            {'// REQUEST DETAILS'}
          </p>
          <dl className="space-y-3">
            <DetailRow label="Tier" value={SPEC_TIER_DISPLAY_NAMES[tier]} />
            <DetailRow label="Company" value={companyLabel} />
            <DetailRow
              label="Deposit (P1)"
              value={formatTierCents(pending.approved_deposit_cents)}
              mono
            />
            <DetailRow
              label="Total"
              value={formatTierCents(pending.approved_total_cents)}
              mono
            />
          </dl>
        </div>

        <p className="font-heading font-light text-sm text-ops-text-tertiary mt-10 leading-relaxed">
          No charge until they approve. If you don&rsquo;t hear back within 24 hours, ping them
          directly or{' '}
          <a
            href="/resources#contact"
            className="text-ops-accent underline decoration-ops-accent/40 hover:decoration-ops-accent transition-colors"
          >
            contact us
          </a>
          .
        </p>
      </div>
    </main>
  );
}

function DetailRow({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <dt className="font-caption text-[11px] uppercase tracking-[0.14em] text-ops-text-tertiary">
        {label}
      </dt>
      <dd
        className={
          mono
            ? 'font-mono text-sm text-ops-text-primary tabular-nums'
            : 'font-heading font-light text-sm text-ops-text-primary'
        }
      >
        {value}
      </dd>
    </div>
  );
}
