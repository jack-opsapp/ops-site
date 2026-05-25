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

export default async function ConfirmationPage() {
  const dict = await getTDict('spec');
  return <SpecConfirmation dict={dict} />;
}
