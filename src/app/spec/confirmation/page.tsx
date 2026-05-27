/**
 * SPEC deposit confirmation page.
 *
 * Route: /spec/confirmation?session_id=<stripe_session_id>
 *
 * Shown after successful Stripe Checkout. Looks up the session via
 * /api/spec/checkout-session and renders SpecConfirmation with the
 * recorded package + deposit amount.
 */

import type { Metadata } from 'next';
import { getTDict } from '@/i18n/server';
import SpecConfirmation from '@/components/spec/SpecConfirmation';

export const metadata: Metadata = {
  title: 'Deposit Confirmed — OPS SPEC',
  robots: { index: false },
};

// The confirmation page is keyed on `?session_id=<stripe_session_id>` —
// it can never be meaningfully prerendered at build time. Force dynamic
// so Next doesn't try to statically render SpecConfirmation (which uses
// useSearchParams and would otherwise need a Suspense bailout).
// Stage D rewrites this page; the directive is harmless to keep.
export const dynamic = 'force-dynamic';

export default async function ConfirmationPage() {
  const dict = await getTDict('spec');
  return <SpecConfirmation dict={dict} />;
}
