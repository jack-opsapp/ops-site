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

export default async function CheckoutPage() {
  const shippingMethods = await getShippingMethods();

  return <CheckoutClient shippingMethods={shippingMethods} />;
}
