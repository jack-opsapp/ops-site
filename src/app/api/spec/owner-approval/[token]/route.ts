/**
 * POST /api/spec/owner-approval/[token]
 *
 * Source: ops-software-bible/SPEC/07_ROLLOUT.md § 6 (owner-approval flow) +
 *         SPEC/04_CUSTOMER_UX.md § /spec/owner-approval +
 *         SPEC/02_DATA_MODEL.md § spec_owner_approval_requests.
 *
 * Hard rules — every one is a security boundary:
 *  1. Token comparison is hash-based (sha256, constant-time). The DB never
 *     stores plaintext.
 *  2. The signed-in user MUST match `account_holder_user_id`. We do NOT trust
 *     anything in the URL or body to identify the actor.
 *  3. The row MUST be in status `pending`. Re-acted requests return 409.
 *  4. The request MUST be within the 7-day TTL. Expired → 410 Gone.
 *  5. All DB writes go through the service-role client; SPEC tables are
 *     RLS-locked and anon / authenticated SDKs cannot bypass.
 *
 * On approve:
 *  - Update `spec_owner_approval_requests` (status, decided_at, IP, UA,
 *    buyer_checkout_token_hash, buyer_checkout_expires_at).
 *  - Update `spec_projects` (status='awaiting_deposit', owner_approved_at,
 *    checkout_token_issued_at, checkout_token_expires_at).
 *  - Insert `spec_acceptance_events` row with event_type='owner_purchase_approved'
 *    (signature_method='click_in_app' per the live DB CHECK constraint).
 *  - Queue `spec.owner_approval_granted` to the buyer with the plaintext
 *    checkout token.
 *  - Fire `owner_approval_requested`-style follow-up event (we use the
 *    existing `owner_approval_requested` event name — the cron + dashboards
 *    aggregate per the existing taxonomy; the actor side is encoded in payload).
 *
 * On decline:
 *  - Update `spec_owner_approval_requests` (status='declined', decided_at,
 *    IP, UA).
 *  - Update `spec_projects` (status='cancelled', cancellation_reason='owner_declined',
 *    cancelled_at, owner_declined_at).
 *  - Queue `spec.owner_approval_declined` to the buyer.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { getCurrentUserFromRequest } from '@/lib/auth/get-current-user';
import {
  hashApprovalToken,
  generateApprovalToken,
} from '@/lib/spec/token-hash';
import { SPEC_TERMS_VERSION_HASH } from '@/lib/spec/tos-version';
import { queueSpecEmail } from '@/lib/spec/email-outbox';
import { sendConversionEvent } from '@/lib/spec/conversion-events';
import {
  SPEC_TIER_DISPLAY_NAMES,
  isValidTier,
  type SpecTier,
} from '@/lib/spec/pricing';

const APPROVAL_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
const BUYER_CHECKOUT_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

const OPS_SITE_DEFAULT_ORIGIN = 'https://opsapp.co';

function getOrigin(req: NextRequest): string {
  return (
    req.headers.get('origin') ??
    process.env.NEXT_PUBLIC_OPS_SITE_URL?.replace(/\/$/, '') ??
    OPS_SITE_DEFAULT_ORIGIN
  );
}

function getRequestIp(req: NextRequest): string | null {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) {
    const head = forwarded.split(',')[0]?.trim();
    if (head) return head;
  }
  const real = req.headers.get('x-real-ip');
  if (real) return real.trim();
  return null;
}

interface RequestBody {
  action?: string;
  decline_reason?: string;
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
  is_test: boolean;
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> },
): Promise<NextResponse> {
  const { token: rawToken } = await params;
  const plainToken = decodeURIComponent(rawToken ?? '');

  if (!plainToken || plainToken.length < 16 || plainToken.length > 200) {
    return NextResponse.json({ error: 'Invalid token.' }, { status: 404 });
  }

  // ── 1. Parse body ─────────────────────────────────────────────────────
  let body: RequestBody;
  try {
    body = (await req.json()) as RequestBody;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }
  const action = body.action;
  if (action !== 'approve' && action !== 'decline') {
    return NextResponse.json(
      { error: "Invalid action. Must be 'approve' or 'decline'." },
      { status: 400 },
    );
  }

  // ── 2. Auth — we resolve the user BEFORE the DB lookup so token-only
  //     probes hit a 401 rather than a 404 + 401 leak combo. ────────────
  const currentUser = await getCurrentUserFromRequest(req);
  if (!currentUser) {
    return NextResponse.json(
      { error: 'You must be signed in to act on this request.' },
      { status: 401 },
    );
  }

  // ── 3. Token lookup (hash + select) ───────────────────────────────────
  const db = getSupabaseAdmin();
  const tokenHash = hashApprovalToken(plainToken);
  const { data: approval, error: lookupErr } = await db
    .from('spec_owner_approval_requests')
    .select(
      'id, spec_project_id, buyer_user_id, account_holder_user_id, linked_company_id, tier, approved_total_cents, approved_deposit_cents, approved_tos_version_hash, status, requested_at, is_test',
    )
    .eq('approval_token_hash', tokenHash)
    .maybeSingle();

  if (lookupErr) {
    console.error('[spec/owner-approval] lookup failed', lookupErr);
    return NextResponse.json(
      { error: 'Could not load the approval request.' },
      { status: 500 },
    );
  }
  if (!approval) {
    return NextResponse.json({ error: 'Invalid token.' }, { status: 404 });
  }
  const row = approval as unknown as ApprovalRow;

  // ── 4. Account-holder match — this is the authorization line. ─────────
  if (currentUser.id !== row.account_holder_user_id) {
    return NextResponse.json(
      {
        error:
          'This approval link belongs to a different OPS account. Sign in as the account holder to continue.',
      },
      { status: 403 },
    );
  }

  // ── 5. Status check — must be pending. ────────────────────────────────
  if (row.status !== 'pending') {
    return NextResponse.json(
      {
        error:
          row.status === 'approved'
            ? 'This request has already been approved.'
            : row.status === 'declined'
              ? 'This request has already been declined.'
              : 'This approval link has expired.',
        code: `already_${row.status}`,
      },
      { status: 409 },
    );
  }

  // ── 6. TTL check — soft expiry from requested_at + 7d. ────────────────
  const requestedAtMs = new Date(row.requested_at).getTime();
  if (!Number.isFinite(requestedAtMs) || Date.now() > requestedAtMs + APPROVAL_TTL_MS) {
    // Flip the status so future hits short-circuit at the status check.
    await db
      .from('spec_owner_approval_requests')
      .update({ status: 'expired' })
      .eq('id', row.id)
      .eq('status', 'pending');
    return NextResponse.json(
      { error: 'This approval link has expired.', code: 'expired' },
      { status: 410 },
    );
  }

  const ip = getRequestIp(req);
  const userAgent = req.headers.get('user-agent') ?? null;
  const tier: SpecTier = isValidTier(row.tier) ? row.tier : 'spec02';
  const tierDisplay = SPEC_TIER_DISPLAY_NAMES[tier];

  if (action === 'approve') {
    return handleApprove({
      req,
      db,
      row,
      ip,
      userAgent,
      tier,
      tierDisplay,
      buyerUserId: row.buyer_user_id,
      accountHolderUserId: row.account_holder_user_id,
    });
  }

  return handleDecline({
    db,
    row,
    ip,
    userAgent,
    tierDisplay,
    declineReason:
      typeof body.decline_reason === 'string'
        ? body.decline_reason.trim().slice(0, 500)
        : null,
  });
}

// ─── Approve ────────────────────────────────────────────────────────────────

interface ApproveArgs {
  req: NextRequest;
  db: ReturnType<typeof getSupabaseAdmin>;
  row: ApprovalRow;
  ip: string | null;
  userAgent: string | null;
  tier: SpecTier;
  tierDisplay: string;
  buyerUserId: string;
  accountHolderUserId: string;
}

async function handleApprove(args: ApproveArgs): Promise<NextResponse> {
  const { req, db, row, ip, userAgent, tier, tierDisplay, buyerUserId, accountHolderUserId } =
    args;
  const decidedAt = new Date();
  const buyerCheckoutTokenPlain = generateApprovalToken();
  const buyerCheckoutTokenHash = hashApprovalToken(buyerCheckoutTokenPlain);
  const buyerCheckoutExpiresAt = new Date(decidedAt.getTime() + BUYER_CHECKOUT_TTL_MS);

  // Atomic-ish: guard the update with `status='pending'` so a racing request
  // can't double-approve. Supabase's PATCH with eq() acts as the lock.
  const { data: updatedReq, error: updateErr } = await db
    .from('spec_owner_approval_requests')
    .update({
      status: 'approved',
      decided_at: decidedAt.toISOString(),
      decided_ip: ip,
      decided_user_agent: userAgent,
      buyer_checkout_token_hash: buyerCheckoutTokenHash,
      buyer_checkout_expires_at: buyerCheckoutExpiresAt.toISOString(),
    })
    .eq('id', row.id)
    .eq('status', 'pending')
    .select('id')
    .single();

  if (updateErr || !updatedReq) {
    console.error('[spec/owner-approval] approve update failed', updateErr);
    return NextResponse.json(
      {
        error: 'Could not approve the request. It may have already been acted on.',
        code: 'approve_conflict',
      },
      { status: 409 },
    );
  }

  // Update spec_projects: status flip + lifecycle stamps.
  const { error: projectErr } = await db
    .from('spec_projects')
    .update({
      status: 'awaiting_deposit',
      owner_approved_at: decidedAt.toISOString(),
      checkout_token_issued_at: decidedAt.toISOString(),
      checkout_token_expires_at: buyerCheckoutExpiresAt.toISOString(),
    })
    .eq('id', row.spec_project_id);
  if (projectErr) {
    console.error('[spec/owner-approval] spec_projects approve update failed', projectErr);
    // Don't roll back — the request row is the authoritative state. Operators
    // can reconcile manually if this rare race happens.
  }

  // Insert the binding acceptance event for the account_holder side. The
  // signature_method MUST be one of the live DB CHECK constraint values
  // ('click_in_app', 'docusign', 'email_reply'). 'click_in_app' is the
  // right one — the operator clicked Approve inside a signed-in browser session.
  const { error: eventErr } = await db.from('spec_acceptance_events').insert({
    spec_project_id: row.spec_project_id,
    event_type: 'owner_purchase_approved',
    accepted_by_user_id: accountHolderUserId,
    accepted_at: decidedAt.toISOString(),
    accepted_ip: ip,
    accepted_user_agent: userAgent,
    signature_method: 'click_in_app',
    payload_hash: row.approved_tos_version_hash ?? SPEC_TERMS_VERSION_HASH,
    is_test: row.is_test,
  });
  if (eventErr) {
    console.error('[spec/owner-approval] acceptance event insert failed', eventErr);
    // Same posture — the operator can reconcile, but this should never happen
    // because the schema is permissive on accepted_at + ip + UA.
  }

  // Email the buyer with the checkout link.
  const origin = getOrigin(req);
  const checkoutUrl = `${origin}/spec/checkout/${encodeURIComponent(buyerCheckoutTokenPlain)}`;

  const buyerRow = await loadBuyer(db, buyerUserId);
  const accountHolderRow = await loadHolder(db, accountHolderUserId);
  const companyName = await loadCompanyName(db, row.linked_company_id);

  if (buyerRow.email) {
    await queueSpecEmail({
      templateId: 'spec.owner_approval_granted',
      recipientEmail: buyerRow.email,
      recipientUserId: buyerUserId,
      specProjectId: row.spec_project_id,
      isTest: row.is_test,
      payload: {
        buyer_first_name: buyerRow.firstName || 'Operator',
        owner_first_name: accountHolderRow.firstName || 'Your owner',
        company_name: companyName,
        tier,
        tier_display_name: tierDisplay,
        deposit_cents: row.approved_deposit_cents,
        total_cents: row.approved_total_cents,
        checkout_url: checkoutUrl,
        checkout_expires_at: buyerCheckoutExpiresAt.toISOString(),
        tos_version_hash: SPEC_TERMS_VERSION_HASH,
      },
    });
  }

  // Conversion-funnel signal (low priority — used for funnel attribution).
  await sendConversionEvent('owner_approval_requested', {
    user_id: buyerUserId,
    company_id: row.linked_company_id,
    tier,
    spec_project_id: row.spec_project_id,
    email: buyerRow.email ?? undefined,
    outcome: 'approved',
  });

  return NextResponse.json({ status: 'approved' });
}

// ─── Decline ────────────────────────────────────────────────────────────────

interface DeclineArgs {
  db: ReturnType<typeof getSupabaseAdmin>;
  row: ApprovalRow;
  ip: string | null;
  userAgent: string | null;
  tierDisplay: string;
  declineReason: string | null;
}

async function handleDecline(args: DeclineArgs): Promise<NextResponse> {
  const { db, row, ip, userAgent, tierDisplay, declineReason } = args;
  const decidedAt = new Date();

  const { data: updatedReq, error: updateErr } = await db
    .from('spec_owner_approval_requests')
    .update({
      status: 'declined',
      decided_at: decidedAt.toISOString(),
      decided_ip: ip,
      decided_user_agent: userAgent,
    })
    .eq('id', row.id)
    .eq('status', 'pending')
    .select('id')
    .single();

  if (updateErr || !updatedReq) {
    console.error('[spec/owner-approval] decline update failed', updateErr);
    return NextResponse.json(
      {
        error: 'Could not decline the request. It may have already been acted on.',
        code: 'decline_conflict',
      },
      { status: 409 },
    );
  }

  // Cancel the project. `cancellation_reason` is the free-text reason field
  // on spec_projects; we encode the structured cause and append any
  // operator-supplied note.
  const cancellationReason = declineReason
    ? `owner_declined: ${declineReason}`
    : 'owner_declined';

  const { error: projectErr } = await db
    .from('spec_projects')
    .update({
      status: 'cancelled',
      cancellation_reason: cancellationReason,
      cancelled_at: decidedAt.toISOString(),
      owner_declined_at: decidedAt.toISOString(),
    })
    .eq('id', row.spec_project_id);
  if (projectErr) {
    console.error('[spec/owner-approval] spec_projects decline update failed', projectErr);
  }

  // Email the buyer that the request was declined.
  const buyerRow = await loadBuyer(db, row.buyer_user_id);
  const accountHolderRow = await loadHolder(db, row.account_holder_user_id);
  const companyName = await loadCompanyName(db, row.linked_company_id);

  if (buyerRow.email) {
    await queueSpecEmail({
      templateId: 'spec.owner_approval_declined',
      recipientEmail: buyerRow.email,
      recipientUserId: row.buyer_user_id,
      specProjectId: row.spec_project_id,
      isTest: row.is_test,
      payload: {
        buyer_first_name: buyerRow.firstName || 'Operator',
        owner_first_name: accountHolderRow.firstName || 'Your owner',
        company_name: companyName,
        tier: row.tier,
        tier_display_name: tierDisplay,
      },
    });
  }

  await sendConversionEvent('owner_approval_requested', {
    user_id: row.buyer_user_id,
    company_id: row.linked_company_id,
    tier: row.tier,
    spec_project_id: row.spec_project_id,
    email: buyerRow.email ?? undefined,
    outcome: 'declined',
  });

  return NextResponse.json({ status: 'declined' });
}

// ─── Helpers ────────────────────────────────────────────────────────────────

interface UserSnapshot {
  firstName: string;
  email: string | null;
}

async function loadBuyer(
  db: ReturnType<typeof getSupabaseAdmin>,
  buyerUserId: string,
): Promise<UserSnapshot> {
  const { data } = await db
    .from('users')
    .select('first_name, email')
    .eq('id', buyerUserId)
    .maybeSingle();
  return {
    firstName: typeof data?.first_name === 'string' ? data.first_name : '',
    email: typeof data?.email === 'string' ? data.email.trim().toLowerCase() : null,
  };
}

async function loadHolder(
  db: ReturnType<typeof getSupabaseAdmin>,
  accountHolderUserId: string,
): Promise<UserSnapshot> {
  return loadBuyer(db, accountHolderUserId);
}

async function loadCompanyName(
  db: ReturnType<typeof getSupabaseAdmin>,
  companyId: string,
): Promise<string> {
  const { data } = await db
    .from('companies')
    .select('name')
    .eq('id', companyId)
    .maybeSingle();
  return typeof data?.name === 'string' ? data.name : '—';
}
