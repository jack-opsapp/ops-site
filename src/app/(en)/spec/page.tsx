/**
 * /spec — English route for the shared page in src/app/_localized/spec.tsx.
 */

import SpecPage, { specMetadata } from '@/app/_localized/spec';
import { setRequestLocale } from '@/i18n/server';

export function generateMetadata() {
  return specMetadata('en');
}

export default function Page({
  searchParams,
}: {
  searchParams: Promise<{ fit?: string }>;
}) {
  setRequestLocale('en');
  return <SpecPage searchParams={searchParams} />;
}
