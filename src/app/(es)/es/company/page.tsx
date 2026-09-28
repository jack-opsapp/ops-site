/**
 * /es/company — Spanish route for the shared page in src/app/_localized/company.tsx.
 */

import CompanyPage, { companyMetadata } from '@/app/_localized/company';
import { setRequestLocale } from '@/i18n/server';

export function generateMetadata() {
  return companyMetadata('es');
}

export default function Page() {
  setRequestLocale('es');
  return <CompanyPage />;
}
