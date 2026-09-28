/**
 * / — English route for the shared page in src/app/_localized/home.tsx.
 */

import HomePage, { homeMetadata } from '@/app/_localized/home';
import { setRequestLocale } from '@/i18n/server';

// ISR: 5 min for blog data (the root layout sets the same window).
export const revalidate = 300;

export function generateMetadata() {
  return homeMetadata('en');
}

export default function Page() {
  setRequestLocale('en');
  return <HomePage />;
}
