/**
 * /spec/billing-address — pre-Stripe eligibility-address capture for SPEC.
 *
 * Source: ops-software-bible/SPEC/04_CUSTOMER_UX.md § /spec/billing-address +
 *         SPEC/07_ROLLOUT.md § 4 (auth + billing-address + owner-approval gate).
 *
 * Server-component flow:
 *  1. Validate `tier` query param. Bad tier → redirect to /spec.
 *  2. Honor the Phase 0 master gate `SPEC_LIVE_DEPOSITS_ENABLED`. While
 *     false, send the buyer to the contact form (defensive — the marketing
 *     page already hides the Pay Deposit CTA in Phase 0).
 *  3. Resolve the signed-in user from cookies / Authorization header.
 *     No auth → redirect to OPS-Web sign-in with a returnTo.
 *  4. Run `resolveSpecCompanyForProject()` (the SPEC-NO-COMPANY-BUYER-FLOW-LOCK
 *     contract). No company → redirect to /setup?returnTo=/spec?tier=X.
 *  5. Render the BillingAddressForm (client component) prefilled with the
 *     buyer's email + company name + tier deposit summary.
 *
 * Server-side validation + spec_projects insert + Path A/B branching happen
 * in /api/spec/create-checkout-session.
 *
 * TRACKED FOLLOW-UP — ES i18n for the buyer flow (deferred):
 *   This page is the entry point to the SPEC paid buyer flow
 *   (billing-address → checkout → owner-approval → intake → confirmation).
 *   That entire flow is hardcoded English: its `metadata`, the
 *   BillingAddressForm / IntakeForm / OwnerApprovalForm copy, and the
 *   confirmation page do NOT read the locale dictionary, and these routes
 *   are deliberately excluded from TRANSLATED_PATHS (src/middleware.ts),
 *   so /es/spec/billing-address 308-redirects to the English URL.
 *
 *   This is intentionally safe while deposits are PAUSED (Phase 0): the
 *   `SPEC_LIVE_DEPOSITS_ENABLED` gate below sends every buyer — EN and ES
 *   alike — to the Spanish-aware /resources#contact CTA, so no ES user can
 *   reach an English checkout. The buyer flow is unreachable dead path.
 *
 *   WHEN SPEC_LIVE_DEPOSITS_ENABLED flips to 'true', this becomes a real
 *   gap: ES users would land in an English-only checkout. Before enabling
 *   live ES deposits, localize this flow — add these routes to
 *   TRANSLATED_PATHS, move all buyer-flow copy into the es/en dictionaries,
 *   and localize the Stripe Checkout `locale`. Until then, do NOT translate
 *   it speculatively (~600 lines of currently-dead path).
 */

import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import {
  getCurrentUserFromServerContext,
  buildOpsWebSignInUrl,
} from '@/lib/auth/get-current-user';
import { resolveSpecCompanyForProject } from '@/lib/spec/resolve-company';
import {
  isValidTier,
  tierDepositCents,
  tierTotalCents,
  SPEC_TIER_DISPLAY_NAMES,
  formatTierCents,
  type SpecTier,
} from '@/lib/spec/pricing';
import { BillingAddressForm } from '@/components/spec/BillingAddressForm';

export const metadata: Metadata = {
  title: 'OPS SPEC — Billing Address',
  description: 'Confirm your billing address before the SPEC deposit.',
  robots: { index: false, follow: false },
};

interface PageProps {
  searchParams: Promise<{ tier?: string }>;
}

export default async function BillingAddressPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const tierParam = params?.tier;

  if (!isValidTier(tierParam)) {
    redirect('/spec');
  }
  const tier = tierParam satisfies SpecTier;

  // Phase 0 safety net — page is reachable only when the marketing CTA wires
  // it up post-Phase-0, but redirect defensively anyway. NOTE: flipping this
  // gate on also exposes the English-only buyer flow to ES users — localize
  // it first (see the ES i18n tracked follow-up in the file docblock above).
  const depositsEnabled = process.env.SPEC_LIVE_DEPOSITS_ENABLED === 'true';
  if (!depositsEnabled) {
    redirect('/resources#contact');
  }

  const returnPath = `/spec/billing-address?tier=${tier}`;
  const signInUrl = buildOpsWebSignInUrl(returnPath);

  const currentUser = await getCurrentUserFromServerContext();
  if (!currentUser) {
    redirect(signInUrl);
  }

  const resolved = await resolveSpecCompanyForProject(currentUser.id, tier);
  if (!resolved.ok) {
    redirect(resolved.redirectTo);
  }

  const depositCents = tierDepositCents(tier);
  const totalCents = tierTotalCents(tier);
  const displayName = SPEC_TIER_DISPLAY_NAMES[tier];

  return (
    <main className="min-h-screen bg-ops-background text-ops-text-primary py-16 sm:py-24 px-6">
      <div className="max-w-[720px] mx-auto">
        <PreFormBanner
          tier={tier}
          displayName={displayName}
          depositCents={depositCents}
          totalCents={totalCents}
          isPathB={!resolved.isBuyerAccountHolder}
        />
        <BillingAddressForm
          tier={tier}
          buyerEmail={currentUser.email ?? ''}
          companyName={resolved.companyName}
          signInUrl={signInUrl}
        />
      </div>
    </main>
  );
}

function PreFormBanner({
  tier,
  displayName,
  depositCents,
  totalCents,
  isPathB,
}: {
  tier: SpecTier;
  displayName: string;
  depositCents: number;
  totalCents: number;
  isPathB: boolean;
}) {
  return (
    <div className="mb-10 border-l-2 border-ops-accent pl-4">
      <p className="font-caption text-[11px] uppercase tracking-[0.18em] text-ops-accent">
        {`// ${tier.toUpperCase()} · DEPOSIT`}
      </p>
      <p className="font-heading font-light text-base text-ops-text-secondary mt-2">
        {displayName} — paying{' '}
        <span className="font-mono text-ops-text-primary">
          {formatTierCents(depositCents)}
        </span>{' '}
        of{' '}
        <span className="font-mono text-ops-text-primary">
          {formatTierCents(totalCents)}
        </span>{' '}
        today.
      </p>
      {isPathB && (
        <p className="font-caption text-[11px] uppercase tracking-[0.12em] text-ops-tan mt-3">
          [Owner approval required before Stripe charges your card.]
        </p>
      )}
    </div>
  );
}
