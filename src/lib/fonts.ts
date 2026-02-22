import { Mohave, Kosugi } from 'next/font/google';

export const mohave = Mohave({
  subsets: ['latin'],
  variable: '--font-mohave',
  display: 'swap',
  weight: ['300', '400', '500', '600', '700'],
});

export const kosugi = Kosugi({
  subsets: ['latin'],
  variable: '--font-kosugi',
  display: 'swap',
  weight: ['400'],
});
