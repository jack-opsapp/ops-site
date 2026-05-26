/**
 * /spec/checkout/[buyer_checkout_token] — Path B final step.
 *
 * Source: ops-software-bible/SPEC/04_CUSTOMER_UX.md § /spec/checkout +
 *         SPEC/07_ROLLOUT.md § 6.
 *
 * Server-component flow:
 *  1. Hash the URL token. Look up the matching `spec_owner_approval_requests`
 *     row by `buyer_checkout_token_hash`. No match → friendly error page.
 *  2. Require auth — no signed-in user → redirect to OPS-Web sign-in with a
 *     returnTo back to this URL.
 *  3. The signed-in user MUST match `buyer_user_id`. Otherwise → friendly
 *     wrong-user error.
 *  4. The request MUST be `status='approved'` and `buyer_checkout_expires_at > now()`.
 *     Anything else → friendly expired / consumed error with a "Request a new
 *     approval" CTA.
 *  5. Single-use enforcement: nullify the `buyer_checkout_token_hash` BEFORE
 *     creating the Stripe Session. This means a parallel race on the same
 *     token resolves to "consumed" on the loser. Once nullified, the token
 *     can never resolve again.
 *  6. Read the `spec_projects` row for billing fields (populated at C.1).
 *  7. Create the Stripe Checkout Session via the shared helper (locked
 *     SPEC-STRIPE-ADDRESS-TAX-SPIKE contract).
 *  8. 302 redirect to the Stripe URL.
 *
 * If the Stripe call fails, we restore the token hash so the buyer can retry.
 * The restore is best-effort — a totally broken Stripe state requires
 * operator intervention either way.
 */

import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import {
  getCurrentUserFromServerContext,
  buildOpsWebSignInUrl,
} from '@/lib/auth/get-current-user';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { hashApprovalToken } from '@/lib/spec/token-hash';
import { isValidTier, type SpecTier } from '@/lib/spec/pricing';
import { createSpecStripeCheckoutSession } from '@/lib/spec/stripe-session';
import { sendConversionEvent } from '@/lib/spec/conversion-events';
import { readAttributionCookie } from '@/lib/spec/attribution';
import { cookies as nextCookies, headers as nextHeaders } from 'next/headers';

export const metadata: Metadata = {
  title: 'OPS SPEC — Complete Payment',
  description: 'Complete your SPEC deposit payment.',
  robots: { index: false, follow: false },
};

const OPS_SITE_DEFAULT_ORIGIN = 'https://opsapp.co';

/** Module-scope time check — keeps server-component render free of impure `Date.now()` calls. */
function isCheckoutExpired(expiresAt: string | null): boolean {
  if (!expiresAt) return true;
  const ms = new Date(expiresAt).getTime();
  if (!Number.isFinite(ms)) return true;
  return ms <= Date.now();
}

interface PageProps {
  params: Promise<{ buyer_checkout_token: string }>;
}

interface ApprovalRow {
  id: string;
  spec_project_id: string;
  buyer_user_id: string;
  account_holder_user_id: string;
  linked_company_id: string;
  tier: string;
  status: 'pending' | 'approved' | 'declined' | 'expired';
  buyer_checkout_expires_at: string | null;
}

interface ProjectRow {
  id: string;
  stripe_customer_id: string | null;
  billing_address_line1: string | null;
  billing_address_line2: string | null;
  billing_city: string | null;
  billing_province: string | null;
  billing_postal_code: string | null;
  billing_country: string | null;
  customer_email: string;
  status: string;
}

interface CompanyRow {
  name: string | null;
  stripe_customer_id: string | null;
}

async function loadApprovalByCheckoutToken(plainToken: string): Promise<ApprovalRow | null> {
  if (!plainToken || plainToken.length < 16 || plainToken.length > 200) return null;
  const db = getSupabaseAdmin();
  const tokenHash = hashApprovalToken(plainToken);
  const { data } = await db
    .from('spec_owner_approval_requests')
    .select(
      'id, spec_project_id, buyer_user_id, account_holder_user_id, linked_company_id, tier, status, buyer_checkout_expires_at',
    )
    .eq('buyer_checkout_token_hash', tokenHash)
    .maybeSingle();
  return data ? (data as unknown as ApprovalRow) : null;
}

async function loadProject(specProjectId: string): Promise<ProjectRow | null> {
  const db = getSupabaseAdmin();
  const { data } = await db
    .from('spec_projects')
    .select(
      'id, stripe_customer_id, billing_address_line1, billing_address_line2, billing_city, billing_province, billing_postal_code, billing_country, customer_email, status',
    )
    .eq('id', specProjectId)
    .maybeSingle();
  return data ? (data as unknown as ProjectRow) : null;
}

async function loadCompany(companyId: string): Promise<CompanyRow | null> {
  const db = getSupabaseAdmin();
  const { data } = await db
    .from('companies')
    .select('name, stripe_customer_id')
    .eq('id', companyId)
    .maybeSingle();
  return data ? (data as unknown as CompanyRow) : null;
}

/**
 * Atomically consume the token: nullify the hash, but only if the row is
 * still in approved state with a non-null hash. Returns true if we won the
 * race (and may proceed to create the Stripe session).
 */
async function consumeCheckoutToken(approvalId: string, tokenHash: string): Promise<boolean> {
  const db = getSupabaseAdmin();
  const { data, error } = await db
    .from('spec_owner_approval_requests')
    .update({ buyer_checkout_token_hash: null })
    .eq('id', approvalId)
    .eq('status', 'approved')
    .eq('buyer_checkout_token_hash', tokenHash)
    .select('id')
    .maybeSingle();
  if (error) {
    console.error('[spec/checkout] consume token failed', error);
    return false;
  }
  return Boolean(data);
}

async function restoreCheckoutToken(approvalId: string, tokenHash: string): Promise<void> {
  const db = getSupabaseAdmin();
  // Best-effort: only restore if still null + status=approved + not expired.
  const nowIso = new Date().toISOString();
  await db
    .from('spec_owner_approval_requests')
    .update({ buyer_checkout_token_hash: tokenHash })
    .eq('id', approvalId)
    .eq('status', 'approved')
    .is('buyer_checkout_token_hash', null)
    .gt('buyer_checkout_expires_at', nowIso);
}

async function readOriginFromRequest(): Promise<string> {
  try {
    const h = await nextHeaders();
    const origin = h.get('origin');
    if (origin) return origin.replace(/\/$/, '');
    const host = h.get('host');
    const proto = h.get('x-forwarded-proto') ?? 'https';
    if (host) return `${proto}://${host}`.replace(/\/$/, '');
  } catch {
    // fall through
  }
  return (
    process.env.NEXT_PUBLIC_OPS_SITE_URL?.replace(/\/$/, '') ?? OPS_SITE_DEFAULT_ORIGIN
  );
}

async function readAttributionFromContext() {
  try {
    const c = await nextCookies();
    return readAttributionCookie({
      get: (name: string) => {
        const v = c.get(name);
        return v ? { value: v.value } : undefined;
      },
    });
  } catch {
    return {};
  }
}

export default async function BuyerCheckoutPage({ params }: PageProps) {
  const { buyer_checkout_token: rawToken } = await params;
  const plainToken = decodeURIComponent(rawToken ?? '');

  const approval = await loadApprovalByCheckoutToken(plainToken);

  // ── Token not found / consumed / never issued ─────────────────────────
  if (!approval) {
    return <CheckoutError kind="invalid" />;
  }

  // ── Expiry check ───────────────────────────────────────────────────────
  if (isCheckoutExpired(approval.buyer_checkout_expires_at)) {
    return <CheckoutError kind="expired" tier={approval.tier} />;
  }

  // ── Status must be approved ────────────────────────────────────────────
  if (approval.status !== 'approved') {
    return (
      <CheckoutError
        kind={approval.status === 'declined' ? 'declined' : 'invalid'}
        tier={approval.tier}
      />
    );
  }

  // ── Auth ──────────────────────────────────────────────────────────────
  const returnPath = `/spec/checkout/${encodeURIComponent(plainToken)}`;
  const currentUser = await getCurrentUserFromServerContext();
  if (!currentUser) {
    redirect(buildOpsWebSignInUrl(returnPath));
  }

  // ── Buyer-match check ─────────────────────────────────────────────────
  if (currentUser.id !== approval.buyer_user_id) {
    return <CheckoutError kind="wrong_user" />;
  }

  // ── Load project + company ────────────────────────────────────────────
  const project = await loadProject(approval.spec_project_id);
  if (!project) {
    console.error('[spec/checkout] spec_projects row missing', {
      specProjectId: approval.spec_project_id,
    });
    return <CheckoutError kind="invalid" />;
  }
  if (project.status !== 'awaiting_deposit') {
    // Already paid or further along — friendly redirect.
    if (project.status === 'deposit_paid') {
      redirect('/spec/confirmation');
    }
    return <CheckoutError kind="invalid" />;
  }
  if (
    !project.billing_address_line1 ||
    !project.billing_city ||
    !project.billing_province ||
    !project.billing_postal_code
  ) {
    console.error('[spec/checkout] missing billing fields on project', {
      specProjectId: approval.spec_project_id,
    });
    return <CheckoutError kind="invalid" />;
  }
  if (!isValidTier(approval.tier)) {
    return <CheckoutError kind="invalid" />;
  }
  const tier: SpecTier = approval.tier;

  const company = await loadCompany(approval.linked_company_id);
  if (!company) {
    return <CheckoutError kind="invalid" />;
  }

  // ── Single-use lock ───────────────────────────────────────────────────
  const tokenHash = hashApprovalToken(plainToken);
  const won = await consumeCheckoutToken(approval.id, tokenHash);
  if (!won) {
    return <CheckoutError kind="consumed" tier={tier} />;
  }

  // ── Build Stripe Session ──────────────────────────────────────────────
  const origin = await readOriginFromRequest();
  const attribution = await readAttributionFromContext();
  const buyerEmail = (currentUser.email ?? project.customer_email ?? '').trim().toLowerCase();
  const companyName = company.name ?? 'OPS Customer';
  const existingStripeCustomerId =
    project.stripe_customer_id ?? company.stripe_customer_id ?? null;

  try {
    const session = await createSpecStripeCheckoutSession({
      tier,
      buyerEmail,
      buyerUserId: currentUser.id,
      companyId: approval.linked_company_id,
      companyName,
      specProjectId: approval.spec_project_id,
      existingStripeCustomerId,
      billing: {
        line1: project.billing_address_line1,
        line2: project.billing_address_line2,
        city: project.billing_city,
        province: project.billing_province,
        postal_code: project.billing_postal_code,
        country: project.billing_country ?? 'CA',
      },
      attribution,
      origin,
    });

    await sendConversionEvent('stripe_checkout_opened', {
      user_id: currentUser.id,
      company_id: approval.linked_company_id,
      tier,
      spec_project_id: approval.spec_project_id,
      value_cents: session.depositCents,
      currency: 'CAD',
      email: buyerEmail || undefined,
      path: 'path_b_post_approval',
      ...attribution,
    });

    redirect(session.url);
  } catch (err) {
    // Next.js `redirect` throws — let it bubble.
    if (err instanceof Error && err.message === 'NEXT_REDIRECT') throw err;
    console.error('[spec/checkout] Stripe session create failed — restoring token', err);
    await restoreCheckoutToken(approval.id, tokenHash);
    return <CheckoutError kind="stripe_failed" tier={tier} />;
  }
}

// ─── Error page variants ────────────────────────────────────────────────────

function CheckoutError({
  kind,
  tier,
}: {
  kind: 'invalid' | 'expired' | 'consumed' | 'declined' | 'wrong_user' | 'stripe_failed';
  tier?: string;
}) {
  const lookup = {
    invalid: {
      tag: 'INVALID LINK',
      headline: 'This checkout link is no longer valid.',
      sub: 'The link may have already been used or never existed. Start the request again from the SPEC page.',
      showRetry: true,
    },
    expired: {
      tag: 'EXPIRED',
      headline: 'This checkout link has expired.',
      sub: 'Checkout links are good for 24 hours after approval. Ask your owner to approve again.',
      showRetry: true,
    },
    consumed: {
      tag: 'ALREADY USED',
      headline: 'This checkout link has already been used.',
      sub: 'If you completed payment, check your email for a receipt. If something failed mid-checkout, contact us so we can help.',
      showRetry: false,
    },
    declined: {
      tag: 'DECLINED',
      headline: 'This request was declined.',
      sub: 'The account holder declined the purchase. No charge was made.',
      showRetry: false,
    },
    wrong_user: {
      tag: 'WRONG ACCOUNT',
      headline: 'This checkout link belongs to a different OPS account.',
      sub: 'Sign in as the buyer to continue, or contact your account holder.',
      showRetry: false,
    },
    stripe_failed: {
      tag: 'TRY AGAIN',
      headline: 'Stripe hiccuped on us.',
      sub: 'Refresh this page in a moment to retry. If it keeps happening, contact us.',
      showRetry: false,
    },
  }[kind];

  const retryHref = `/spec${tier && isValidTier(tier) ? `?tier=${tier}` : ''}`;

  const accent =
    kind === 'declined' || kind === 'wrong_user'
      ? 'border-ops-rose text-ops-rose'
      : 'border-ops-tan text-ops-tan';

  return (
    <main className="min-h-screen bg-ops-background text-ops-text-primary py-20 sm:py-28 px-6">
      <div className="max-w-[560px] mx-auto">
        <div className={`border-l-2 pl-4 mb-10 ${accent}`}>
          <p className="font-caption text-[11px] uppercase tracking-[0.18em]">
            {`// CHECKOUT · ${lookup.tag}`}
          </p>
        </div>
        <h1 className="font-heading font-light text-3xl sm:text-4xl text-ops-text-primary tracking-tight leading-tight">
          {lookup.headline}
        </h1>
        <p className="font-heading font-light text-base text-ops-text-secondary mt-6 leading-relaxed">
          {lookup.sub}
        </p>
        <div className="mt-10 flex flex-wrap gap-4">
          {lookup.showRetry && (
            <a
              href={retryHref}
              className="inline-flex items-center justify-center font-caption text-[11px] uppercase tracking-[0.18em] px-6 py-3 rounded-[5px] bg-ops-accent text-ops-background hover:bg-ops-accent/90 transition-colors"
            >
              Request a new approval
            </a>
          )}
          <a
            href="/resources#contact"
            className="inline-flex items-center justify-center font-caption text-[11px] uppercase tracking-[0.18em] px-6 py-3 rounded-[5px] border border-ops-border text-ops-text-secondary hover:border-ops-border-hover hover:text-ops-text-primary transition-colors"
          >
            Contact us
          </a>
        </div>
      </div>
    </main>
  );
}
