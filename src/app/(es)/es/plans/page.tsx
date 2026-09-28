/**
 * /es/plans — Spanish route for the shared page in src/app/_localized/plans.tsx.
 */

import PlansPage, { plansMetadata } from '@/app/_localized/plans';
import { setRequestLocale } from '@/i18n/server';

export function generateMetadata() {
  return plansMetadata('es');
}

export default function Page() {
  setRequestLocale('es');
  return <PlansPage />;
}
