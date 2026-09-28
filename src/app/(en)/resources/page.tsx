/**
 * /resources — English route for the shared page in src/app/_localized/resources.tsx.
 */

import ResourcesPage, { resourcesMetadata } from '@/app/_localized/resources';
import { setRequestLocale } from '@/i18n/server';

export function generateMetadata() {
  return resourcesMetadata('en');
}

export default function Page() {
  setRequestLocale('en');
  return <ResourcesPage />;
}
