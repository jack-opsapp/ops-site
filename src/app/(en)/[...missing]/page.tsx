/**
 * Unmatched URLs — renders the 404 inside the English site shell.
 *
 * With two root layouts there is no app-wide not-found boundary, so every
 * URL no route claims lands here and hands off to (en)/not-found.tsx.
 * (Next's `global-not-found` is still experimental in 16.1.)
 */

import { notFound } from 'next/navigation';
import { setRequestLocale } from '@/i18n/server';

export default function MissingPage() {
  setRequestLocale('en');
  notFound();
}
