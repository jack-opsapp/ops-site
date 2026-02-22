import type { Metadata } from 'next';
import { mohave, kosugi } from '@/lib/fonts';
import PageLayout from '@/components/layout/PageLayout';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://opsapp.co'),
  title: {
    default: 'OPS — Operational Project System',
    template: '%s | OPS',
  },
  description: 'Run your operation. Built for the trades.',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://opsapp.co',
    siteName: 'OPS',
  },
  twitter: {
    card: 'summary_large_image',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${mohave.variable} ${kosugi.variable}`}>
      <body className="font-body antialiased">
        <PageLayout>{children}</PageLayout>
      </body>
    </html>
  );
}
