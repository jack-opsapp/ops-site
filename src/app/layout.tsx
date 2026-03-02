import type { Metadata } from 'next';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { mohave, kosugi } from '@/lib/fonts';
import PageLayout from '@/components/layout/PageLayout';
import GoogleAnalytics from '@/components/layout/GoogleAnalytics';
import { getLocale } from '@/i18n/server';
import { LanguageProvider } from '@/i18n/client';
import './globals.css';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  return {
    metadataBase: new URL('https://opsapp.co'),
    title: {
      default: locale === 'es'
        ? 'OPS — Sistema Operativo de Proyectos'
        : 'OPS — Operational Project System',
      template: '%s | OPS',
    },
    description: locale === 'es'
      ? 'Dirige tu operación. Hecho para los oficios.'
      : 'Run your operation. Built for the trades.',
    openGraph: {
      type: 'website',
      locale: locale === 'es' ? 'es_MX' : 'en_US',
      url: 'https://opsapp.co',
      siteName: 'OPS',
    },
    twitter: {
      card: 'summary_large_image',
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();

  return (
    <html lang={locale} className={`${mohave.variable} ${kosugi.variable}`}>
      <body className="font-body antialiased">
        <LanguageProvider locale={locale}>
          <PageLayout>{children}</PageLayout>
        </LanguageProvider>
        <Analytics />
        <SpeedInsights />
        <GoogleAnalytics />
      </body>
    </html>
  );
}
