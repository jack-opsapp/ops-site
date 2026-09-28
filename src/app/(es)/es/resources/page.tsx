/**
 * /es/resources — Spanish route for the shared page in src/app/_localized/resources.tsx.
 */

import ResourcesPage, { resourcesMetadata } from '@/app/_localized/resources';
import { setRequestLocale } from '@/i18n/server';

export function generateMetadata() {
  return resourcesMetadata('es');
}

export default function Page() {
  setRequestLocale('es');
  return <ResourcesPage />;
}
