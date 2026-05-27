/**
 * /spec/owner-approval/[approval_token] — owner-approval landing page.
 *
 * Source: ops-software-bible/SPEC/04_CUSTOMER_UX.md § /spec/owner-approval +
 *         SPEC/07_ROLLOUT.md § 6.
 *
 * Server-component flow (order matters — every check must pass before the
 * Approve / Decline UI renders):
 *
 *  1. Hash the URL token. Look up the matching row by `approval_token_hash`.
 *     No match → 404. (We never disclose which side failed.)
 *  2. If row exists but `status != 'pending'` (already approved / declined /
 *     expired), render the already-acted state, no CTAs.
 *  3. Compute soft-expiry from `requested_at + 7 days` per the cron policy in
 *     06_CONTRACT_AND_EMAILS.md. If past expiry, render an "expired" state
 *     even if the cron hasn't flipped status yet.
 *  4. Require auth — no signed-in user → redirect to OPS-Web sign-in with a
 *     returnTo back to this URL.
 *  5. The signed-in user MUST match `account_holder_user_id`. Anything else
 *     (buyer hitting their own link, wrong user signed in) → 403 with a
 *     friendly explanation. Never reveal who the right person is.
 *  6. Render buyer name + tier + cost breakdown + ToS reference + the
 *     Approve / Decline client form.
 *
 * The POST to /api/spec/owner-approval/[token] does the authoritative writes —
 * this page is read-only.
 */

import { notFound, redirect } from 'next/navigation';
import type { Metadata } from 'next';
import {
  getCurrentUserFromServerContext,
  buildOpsWebSignInUrl,
} from '@/lib/auth/get-current-user';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { hashApprovalToken } from '@/lib/spec/token-hash';
import {
  SPEC_TIER_DISPLAY_NAMES,
  formatTierCents,
  isValidTier,
  type SpecTier,
} from '@/lib/spec/pricing';
import { OwnerApprovalForm } from '@/components/spec/OwnerApprovalForm';

export const metadata: Metadata = {
  title: 'OPS SPEC — Owner Approval',
  description: 'Approve or decline a team member SPEC purchase request.',
  robots: { index: false, follow: false },
};

const APPROVAL_TTL_DAYS = 7;

interface PageProps {
  params: Promise<{ approval_token: string }>;
}

interface ApprovalRow {
  id: string;
  spec_project_id: string;
  buyer_user_id: string;
  account_holder_user_id: string;
  linked_company_id: string;
  tier: string;
  approved_total_cents: number;
  approved_deposit_cents: number;
  approved_tos_version_hash: string | null;
  status: 'pending' | 'approved' | 'declined' | 'expired';
  requested_at: string;
}

function withinTtl(requestedAt: string): boolean {
  const requested = new Date(requestedAt).getTime();
  if (Number.isNaN(requested)) return false;
  const expiresAt = requested + APPROVAL_TTL_DAYS * 24 * 60 * 60 * 1000;
  return Date.now() < expiresAt;
}

async function loadApproval(plainToken: string): Promise<ApprovalRow | null> {
  if (!plainToken || plainToken.length < 16 || plainToken.length > 200) return null;
  const db = getSupabaseAdmin();
  const tokenHash = hashApprovalToken(plainToken);
  const { data } = await db
    .from('spec_owner_approval_requests')
    .select(
      'id, spec_project_id, buyer_user_id, account_holder_user_id, linked_company_id, tier, approved_total_cents, approved_deposit_cents, approved_tos_version_hash, status, requested_at',
    )
    .eq('approval_token_hash', tokenHash)
    .maybeSingle();
  if (!data) return null;
  return data as unknown as ApprovalRow;
}

async function loadBuyerAndCompany(buyerUserId: string, companyId: string) {
  const db = getSupabaseAdmin();
  const [buyerRes, companyRes] = await Promise.all([
    db
      .from('users')
      .select('first_name, last_name, email')
      .eq('id', buyerUserId)
      .maybeSingle(),
    db.from('companies').select('name').eq('id', companyId).maybeSingle(),
  ]);
  const buyer = buyerRes.data;
  const company = companyRes.data;
  const buyerFirst = typeof buyer?.first_name === 'string' ? buyer.first_name : '';
  const buyerLast = typeof buyer?.last_name === 'string' ? buyer.last_name : '';
  const buyerEmail = typeof buyer?.email === 'string' ? buyer.email : '';
  const buyerLabel =
    [buyerFirst, buyerLast].filter((s) => s.trim().length > 0).join(' ').trim() ||
    buyerEmail ||
    'A team member';
  const companyName = typeof company?.name === 'string' ? company.name : '—';
  return { buyerLabel, buyerEmail, companyName };
}

export default async function OwnerApprovalPage({ params }: PageProps) {
  const { approval_token: rawToken } = await params;
  const plainToken = decodeURIComponent(rawToken ?? '');

  const approval = await loadApproval(plainToken);
  if (!approval) notFound();

  // ── Status / expiry gating before requiring auth — these states are
  //    informative, not sensitive, and don't need a signed-in user. ────────
  if (approval.status === 'approved') {
    return <AlreadyActed kind="approved" />;
  }
  if (approval.status === 'declined') {
    return <AlreadyActed kind="declined" />;
  }
  if (approval.status === 'expired' || !withinTtl(approval.requested_at)) {
    return <AlreadyActed kind="expired" />;
  }

  // ── Auth + holder match ────────────────────────────────────────────────
  const returnPath = `/spec/owner-approval/${encodeURIComponent(plainToken)}`;
  const signInUrl = buildOpsWebSignInUrl(returnPath);

  const currentUser = await getCurrentUserFromServerContext();
  if (!currentUser) {
    redirect(signInUrl);
  }

  if (currentUser.id !== approval.account_holder_user_id) {
    return <WrongUser />;
  }

  // ── Render Approve / Decline UI ────────────────────────────────────────
  const tier: SpecTier = isValidTier(approval.tier) ? approval.tier : 'build';
  const { buyerLabel, buyerEmail, companyName } = await loadBuyerAndCompany(
    approval.buyer_user_id,
    approval.linked_company_id,
  );

  const milestoneCents = approval.approved_deposit_cents;

  return (
    <main className="min-h-screen bg-ops-background text-ops-text-primary py-16 sm:py-24 px-6">
      <div className="max-w-[720px] mx-auto">
        <div className="mb-10 border-l-2 border-ops-accent pl-4">
          <p className="font-caption text-[11px] uppercase tracking-[0.18em] text-ops-accent">
            {'// OWNER APPROVAL · REQUIRED'}
          </p>
          <p className="font-heading font-light text-base text-ops-text-secondary mt-2">
            Request received{' '}
            <span className="font-mono text-ops-text-primary">
              {new Date(approval.requested_at).toLocaleDateString('en-CA', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </span>
          </p>
        </div>

        <h1 className="font-heading font-light text-3xl sm:text-4xl text-ops-text-primary tracking-tight leading-tight">
          {buyerLabel} requested {SPEC_TIER_DISPLAY_NAMES[tier]} for {companyName}.
        </h1>

        <p className="font-heading font-light text-base text-ops-text-secondary mt-6 leading-relaxed">
          Approve to release a checkout link to {buyerEmail || 'them'}. Decline to cancel the
          request — no charge will be made.
        </p>

        {/* Cost breakdown */}
        <section className="mt-12 border border-ops-border rounded-[10px] bg-ops-surface p-6">
          <p className="font-caption text-[10px] uppercase tracking-[0.18em] text-ops-text-mute mb-5">
            {'// COST · 4-MILESTONE PAYMENT'}
          </p>
          <div className="space-y-3">
            <CostRow label="Total" value={formatTierCents(approval.approved_total_cents)} accent />
            <div className="h-px bg-ops-border my-2" />
            <CostRow label="P1 · Deposit · today" value={formatTierCents(milestoneCents)} />
            <CostRow label="P2 · Scope sign-off" value={formatTierCents(milestoneCents)} />
            <CostRow label="P3 · Midpoint demo" value={formatTierCents(milestoneCents)} />
            <CostRow label="P4 · Delivery walkthrough" value={formatTierCents(milestoneCents)} />
          </div>
          <p className="font-heading font-light text-xs text-ops-text-tertiary mt-5 leading-relaxed">
            P1 is charged at checkout. P2 — P4 fire as Stripe Invoices after each acceptance
            event. Card stays on file for the milestone schedule.
          </p>
        </section>

        {/* ToS reference */}
        <section className="mt-8 border border-ops-border rounded-[10px] bg-ops-surface p-6">
          <p className="font-caption text-[10px] uppercase tracking-[0.18em] text-ops-text-mute mb-3">
            {'// TERMS OF SERVICE'}
          </p>
          <p className="font-heading font-light text-sm text-ops-text-secondary leading-relaxed">
            By approving, you accept the SPEC Terms of Service on behalf of {companyName}.{' '}
            {buyerLabel} will separately accept at Stripe checkout. Both acceptances are recorded
            in the engagement&rsquo;s dispute-evidence chain.{' '}
            <a
              href="/legal?page=spec-terms"
              target="_blank"
              rel="noopener noreferrer"
              className="text-ops-accent underline decoration-ops-accent/40 hover:decoration-ops-accent transition-colors"
            >
              Read the SPEC Terms
            </a>
            .
          </p>
        </section>

        <div className="mt-10">
          <OwnerApprovalForm
            approvalToken={plainToken}
            buyerLabel={buyerLabel}
            tierDisplayName={SPEC_TIER_DISPLAY_NAMES[tier]}
            companyName={companyName}
          />
        </div>
      </div>
    </main>
  );
}

function CostRow({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <span
        className={
          accent
            ? 'font-heading font-light text-base text-ops-text-primary'
            : 'font-caption text-[11px] uppercase tracking-[0.14em] text-ops-text-tertiary'
        }
      >
        {label}
      </span>
      <span
        className={
          accent
            ? 'font-mono text-base text-ops-text-primary tabular-nums'
            : 'font-mono text-sm text-ops-text-secondary tabular-nums'
        }
      >
        {value}
      </span>
    </div>
  );
}

function AlreadyActed({ kind }: { kind: 'approved' | 'declined' | 'expired' }) {
  const lookup = {
    approved: {
      tag: 'APPROVED',
      headline: 'This request has already been approved.',
      sub:
        'A checkout link was sent to the buyer. If they have not completed payment yet, they can use the link from that email.',
    },
    declined: {
      tag: 'DECLINED',
      headline: 'This request has already been declined.',
      sub: 'The purchase was cancelled. No charge was made.',
    },
    expired: {
      tag: 'EXPIRED',
      headline: 'This approval link has expired.',
      sub:
        'Approval links are good for 7 days. Ask the buyer to start the request again from the SPEC page.',
    },
  }[kind];

  const accent = kind === 'approved' ? 'border-ops-olive text-ops-olive' : 'border-ops-tan text-ops-tan';

  return (
    <main className="min-h-screen bg-ops-background text-ops-text-primary py-20 sm:py-28 px-6">
      <div className="max-w-[560px] mx-auto">
        <div className={`border-l-2 pl-4 mb-10 ${accent}`}>
          <p className="font-caption text-[11px] uppercase tracking-[0.18em]">
            {`// OWNER APPROVAL · ${lookup.tag}`}
          </p>
        </div>
        <h1 className="font-heading font-light text-3xl sm:text-4xl text-ops-text-primary tracking-tight leading-tight">
          {lookup.headline}
        </h1>
        <p className="font-heading font-light text-base text-ops-text-secondary mt-6 leading-relaxed">
          {lookup.sub}
        </p>
        <div className="mt-10">
          <a
            href="/spec"
            className="font-caption text-[11px] uppercase tracking-[0.18em] text-ops-accent underline decoration-ops-accent/40 hover:decoration-ops-accent transition-colors"
          >
            Back to SPEC
          </a>
        </div>
      </div>
    </main>
  );
}

function WrongUser() {
  return (
    <main className="min-h-screen bg-ops-background text-ops-text-primary py-20 sm:py-28 px-6">
      <div className="max-w-[560px] mx-auto">
        <div className="border-l-2 border-ops-rose pl-4 mb-10">
          <p className="font-caption text-[11px] uppercase tracking-[0.18em] text-ops-rose">
            {'// OWNER APPROVAL · WRONG ACCOUNT'}
          </p>
        </div>
        <h1 className="font-heading font-light text-3xl sm:text-4xl text-ops-text-primary tracking-tight leading-tight">
          This link is for the company&rsquo;s account holder.
        </h1>
        <p className="font-heading font-light text-base text-ops-text-secondary mt-6 leading-relaxed">
          You&rsquo;re signed in, but this approval link belongs to a different OPS account.
          Sign in as the account holder to approve, or ignore this link and let it expire.
        </p>
        <div className="mt-10">
          <a
            href="/spec"
            className="font-caption text-[11px] uppercase tracking-[0.18em] text-ops-accent underline decoration-ops-accent/40 hover:decoration-ops-accent transition-colors"
          >
            Back to SPEC
          </a>
        </div>
      </div>
    </main>
  );
}
