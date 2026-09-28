/**
 * /es/platform — Spanish route for the shared page in src/app/_localized/platform.tsx.
 */

import PlatformPage, { platformMetadata } from '@/app/_localized/platform';
import { setRequestLocale } from '@/i18n/server';

export function generateMetadata() {
  return platformMetadata('es');
}

export default function Page() {
  setRequestLocale('es');
  return <PlatformPage />;
}
