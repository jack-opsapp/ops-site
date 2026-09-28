/**
 * /company — English route for the shared page in src/app/_localized/company.tsx.
 */

import CompanyPage, { companyMetadata } from '@/app/_localized/company';
import { setRequestLocale } from '@/i18n/server';

export function generateMetadata() {
  return companyMetadata('en');
}

export default function Page() {
  setRequestLocale('en');
  return <CompanyPage />;
}
