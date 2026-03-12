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
  const isEs = locale === 'es';
  return {
    metadataBase: new URL('https://opsapp.co'),
    title: {
      default: isEs
        ? 'OPS — Sistema Operativo de Proyectos'
        : 'OPS — Operational Project System',
      template: '%s | OPS',
    },
    description: isEs
      ? 'Dirige tu operación. Hecho para los oficios.'
      : 'Run your operation. Built for the trades.',
    openGraph: {
      type: 'website',
      locale: isEs ? 'es_MX' : 'en_US',
      url: 'https://opsapp.co',
      siteName: 'OPS',
      images: [
        {
          url: '/images/og-image.png',
          width: 1200,
          height: 630,
          alt: 'OPS — Operational Project System',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      images: ['/images/og-image.png'],
    },
    other: {
      'theme-color': '#0D0D0D',
      'format-detection': 'telephone=no',
    },
    alternates: {
      canonical: 'https://opsapp.co',
      languages: {
        'en': 'https://opsapp.co',
        'es': 'https://opsapp.co',
      },
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();

  // Static JSON-LD — all values are hardcoded string literals, safe from injection
  const orgJsonLd = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'OPS',
    alternateName: 'Operational Project System',
    url: 'https://opsapp.co',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'iOS, Web',
    description: 'Project management and crew operations platform built for the trades.',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
      description: 'Free trial, then from $29/month',
    },
    publisher: {
      '@type': 'Organization',
      name: 'OPS',
      url: 'https://opsapp.co',
      logo: {
        '@type': 'ImageObject',
        url: 'https://opsapp.co/images/ops-logo-white.png',
      },
    },
  });

  return (
    <html lang={locale} className={`${mohave.variable} ${kosugi.variable}`}>
      <body className="font-body antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: orgJsonLd }}
        />
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
