/**
 * /tools — English route for the shared page in src/app/_localized/tools.tsx.
 */

import ToolsPage, { toolsMetadata } from '@/app/_localized/tools';
import { setRequestLocale } from '@/i18n/server';

export function generateMetadata() {
  return toolsMetadata('en');
}

export default function Page() {
  setRequestLocale('en');
  return <ToolsPage />;
}
