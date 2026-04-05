/**
 * Tailored deposit confirmation page.
 * Shows after successful Stripe Checkout.
 */

import type { Metadata } from 'next';
import { getTDict } from '@/i18n/server';
import TailoredConfirmation from '@/components/tailored/TailoredConfirmation';

export const metadata: Metadata = {
  title: 'Deposit Confirmed — OPS Tailored',
  robots: { index: false },
};

export default async function ConfirmationPage() {
  const dict = await getTDict('tailored');
  return <TailoredConfirmation dict={dict} />;
}
