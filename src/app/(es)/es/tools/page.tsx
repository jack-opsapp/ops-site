/**
 * /es/tools — Spanish route for the shared page in src/app/_localized/tools.tsx.
 */

import ToolsPage, { toolsMetadata } from '@/app/_localized/tools';
import { setRequestLocale } from '@/i18n/server';

export function generateMetadata() {
  return toolsMetadata('es');
}

export default function Page() {
  setRequestLocale('es');
  return <ToolsPage />;
}
