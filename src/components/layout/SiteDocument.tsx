/**
 * SiteDocument — the <html>/<body> shell shared by both root layouts
 * (src/app/(en)/layout.tsx and src/app/(es)/es/layout.tsx).
 *
 * Renders navigation + footer (PageLayout), the sitewide Organization and
 * WebSite JSON-LD, and analytics. The locale comes from the root layout, so
 * the shell renders statically.
 */

import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { mohave, jetbrainsMono, cakemono } from '@/lib/fonts';
import PageLayout from '@/components/layout/PageLayout';
import GoogleAnalytics from '@/components/layout/GoogleAnalytics';
import MarketingAnalytics from '@/components/layout/MarketingAnalytics';
import BugReportShortcut from '@/components/shared/BugReportShortcut';
import { LanguageProvider } from '@/i18n/client';
import type { Locale } from '@/i18n/types';
import '@/app/globals.css';

export default function SiteDocument({
  locale,
  children,
}: Readonly<{
  locale: Locale;
  children: React.ReactNode;
}>) {
  return (
    <html lang={locale} className={`${mohave.variable} ${jetbrainsMono.variable} ${cakemono.variable}`}>
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
                "logo": "https://opsapp.co/brand/ops-lockup-email.png",
                "description": "Field-first job management app built by trades for service-based businesses and field crews. Project tracking, crew scheduling, photo documentation, and invoicing — no training required.",
                "founder": {
                  "@type": "Person",
                  "name": "Jack"
                },
                "foundingDate": "2024",
                "sameAs": [
                  "https://instagram.com/opsapp.co",
                  "https://linkedin.com/company/opsapp",
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
        <MarketingAnalytics />
        <BugReportShortcut />
      </body>
    </html>
  );
}
