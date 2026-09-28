/**
 * /es/spec — Spanish route for the shared page in src/app/_localized/spec.tsx.
 */

import SpecPage, { specMetadata } from '@/app/_localized/spec';
import { setRequestLocale } from '@/i18n/server';

export function generateMetadata() {
  return specMetadata('es');
}

export default function Page({
  searchParams,
}: {
  searchParams: Promise<{ fit?: string }>;
}) {
  setRequestLocale('es');
  return <SpecPage searchParams={searchParams} />;
}
