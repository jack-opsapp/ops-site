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
  // it up post-Phase-0, but redirect defensively anyway.
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
