/**
 * OPS Fonts (spec v2, 2026-04-17)
 *
 * Three families, each with one job:
 *   • Mohave            — body copy, hero headlines, display type
 *   • JetBrains Mono    — numbers, timestamps, // prefixes, [brackets], micro labels
 *   • Cake Mono Light   — uppercase display voice for tactical moments (badges, section marks)
 *
 * ops-site retains Mohave heavy weights (600/700) for marketing hero moments —
 * OPS-Web uses Cake Mono Light 300 instead. This is the one intentional divergence.
 *
 * Kosugi deprecated 2026-04-17 → former Kosugi roles now use JetBrains Mono.
 */

import { Mohave, JetBrains_Mono } from 'next/font/google';
import localFont from 'next/font/local';

export const mohave = Mohave({
  subsets: ['latin'],
  variable: '--font-mohave',
  display: 'swap',
  weight: ['300', '400', '500', '600', '700'],
});

export const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
  weight: ['400', '500', '600'],
});

/**
 * Cake Mono Light 300 — OPS's uppercase display voice.
 *
 * Self-hosted from /src/fonts/CakeMono-Light.woff2. Product UI uses weight 300 only;
 * Regular (400) and Bold (700) are not shipped to keep ops-site lean. If you need them,
 * add the matching woff/woff2 files and additional `src` entries.
 */
export const cakemono = localFont({
  variable: '--font-cakemono',
  display: 'swap',
  src: [
    {
      path: '../fonts/CakeMono-Light.woff2',
      weight: '300',
      style: 'normal',
    },
    {
      path: '../fonts/CakeMono-Light.woff',
      weight: '300',
      style: 'normal',
    },
  ],
});
