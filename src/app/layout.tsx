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
      ? 'App de gestión de trabajo para negocios de servicio y equipos de campo. Seguimiento de proyectos, programación de equipos, documentación fotográfica y facturación. Sin entrenamiento necesario.'
      : 'Job management app for service-based businesses and field crews. Project tracking, crew scheduling, photo documentation, and invoicing. No training required — your crew opens it and knows what to do.',
    openGraph: {
      type: 'website',
      locale: locale === 'es' ? 'es_MX' : 'en_US',
      url: 'https://opsapp.co',
      siteName: 'OPS',
      images: [{ url: 'https://opsapp.co/images/og-image.png', width: 1200, height: 630, alt: 'OPS — Job management built for trades crews' }],
    },
    twitter: {
      card: 'summary_large_image',
      images: ['https://opsapp.co/images/og-image.png'],
    },
    alternates: {
      languages: {
        en: 'https://opsapp.co',
        es: 'https://opsapp.co?lang=es',
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

  return (
    <html lang={locale} className={`${mohave.variable} ${kosugi.variable}`}>
      <body className="font-body antialiased">
        <LanguageProvider locale={locale}>
          <PageLayout>{children}</PageLayout>
        </LanguageProvider>
        {/* Sitewide structured data — Organization + WebSite */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([
              {
                "@context": "https://schema.org",
                "@type": "Organization",
                "name": "OPS",
                "url": "https://opsapp.co",
                "logo": "https://opsapp.co/images/ops-logo-white.png",
                "description": "Field-first job management app built by trades for service-based businesses and field crews. Project tracking, crew scheduling, photo documentation, and invoicing — no training required.",
                "founder": {
                  "@type": "Person",
                  "name": "Jack"
                },
                "foundingDate": "2024",
                "sameAs": [
                  "https://instagram.com/ops.app.co",
                  "https://linkedin.com/company/ops-app",
                  "https://apps.apple.com/us/app/ops-job-crew-management/id6746662078"
                ],
                "contactPoint": {
                  "@type": "ContactPoint",
                  "contactType": "customer support",
                  "url": "https://opsapp.co/resources"
                }
              },
              {
                "@context": "https://schema.org",
                "@type": "WebSite",
                "name": "OPS",
                "url": "https://opsapp.co",
                "description": "Job management software built for service-based businesses and field crews. Track projects, schedule crews, document with photos, and manage your operation from one app.",
                "publisher": {
                  "@type": "Organization",
                  "name": "OPS"
                }
              }
            ])
          }}
        />
        <Analytics />
        <SpeedInsights />
        <GoogleAnalytics />
      </body>
    </html>
  );
}
