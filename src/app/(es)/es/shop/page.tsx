/**
 * /es/shop — Spanish route for the shared page in src/app/_localized/shop.tsx.
 */

import ShopPage, { shopMetadata } from '@/app/_localized/shop';
import { setRequestLocale } from '@/i18n/server';

// ISR: 5 min for catalog data (the root layout sets the same window).
export const revalidate = 300;

export function generateMetadata() {
  return shopMetadata('es');
}

export default function Page() {
  setRequestLocale('es');
  return <ShopPage />;
}
