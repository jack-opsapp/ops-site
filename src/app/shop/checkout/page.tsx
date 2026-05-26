/**
 * /shop/checkout — Checkout page
 *
 * Server component. Fetches shipping methods from Supabase,
 * passes to CheckoutClient for the stepped checkout flow.
 */

import { Metadata } from 'next';
import CheckoutClient from '../CheckoutClient';
import { getShippingMethods } from '@/lib/shop/queries';

export const metadata: Metadata = {
  title: 'Checkout — OPS Gear',
};

// Checkout reads live shipping methods from Supabase + needs cart state
// from the client. No value in prerendering — and prerendering crashes
// the build when env vars are absent (which is the case in local dev
// without .env.local). Force dynamic so the page renders at request
// time, after Vercel injects the env.
export const dynamic = 'force-dynamic';

export default async function CheckoutPage() {
  const shippingMethods = await getShippingMethods();

  return <CheckoutClient shippingMethods={shippingMethods} />;
}
