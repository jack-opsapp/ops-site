/**
 * Footer — Link grid with dramatic warm gradient at bottom
 * 4 columns: PRODUCT, RESOURCES, COMPANY, CONNECT
 * Warm sunset gradient finish at the very bottom
 */

import Link from 'next/link';
import NewsletterSignup from '@/components/shared/NewsletterSignup';
import LanguageToggle from './LanguageToggle';
import { OpsMark } from '@/components/brand/OpsMark';
import type { Dictionary } from '@/i18n/types';

interface FooterProps {
  commonDict: Dictionary;
  shopLive?: boolean;
}

export default function Footer({ commonDict, shopLive = false }: FooterProps) {
  const t = (key: string) => {
    const value = commonDict[key];
    return typeof value === 'string' ? value : key;
  };

  const columns = [
    {
      title: t('footer.product'),
      links: [
        { label: t('footer.platform'), href: '/platform' },
        { label: t('footer.tools'), href: '/tools' },
        { label: t('footer.plans'), href: '/plans' },
        ...(shopLive ? [{ label: t('footer.shop'), href: '/shop' }] : []),
      ],
    },
    {
      title: t('footer.resources'),
      links: [
        { label: t('footer.journal'), href: '/journal' },
        { label: t('footer.help'), href: '/resources' },
        { label: t('footer.contact'), href: '/resources#contact' },
      ],
    },
    {
      title: t('footer.company'),
      links: [
        { label: t('footer.about'), href: '/company' },
        { label: t('footer.careers'), href: '/company' },
        { label: t('footer.legal'), href: '/legal?page=terms' },
      ],
    },
    {
      title: t('footer.connect'),
      links: [
        { label: t('footer.appStore'), href: 'https://apps.apple.com/us/app/ops-job-crew-management/id6746662078', external: true },
        { label: t('footer.webApp'), href: 'https://app.opsapp.co', external: true },
        { label: t('footer.instagram'), href: 'https://instagram.com/opsapp.co', external: true },
        { label: t('footer.linkedin'), href: 'https://linkedin.com/company/opsapp', external: true },
      ],
    },
  ];

  return (
    <footer className="relative">
      {/* Top border */}
      <div className="h-px bg-ops-border" />

      {/* Content */}
      <div className="max-w-[1400px] mx-auto px-6 md:px-10 pt-16 pb-12">
        {/* Link grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 md:gap-8">
          {columns.map((column) => (
            <div key={column.title}>
              <h3 className="font-caption text-ops-text-secondary uppercase tracking-[0.15em] text-[11px] mb-5">
                {column.title}
              </h3>
              <ul className="space-y-3">
                {column.links.map((link) => {
                  const isExternal = 'external' in link && link.external;
                  return (
                    <li key={link.label}>
                      {isExternal ? (
                        <a
                          href={link.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-body text-ops-text-secondary text-sm hover:text-ops-text-primary transition-colors"
                        >
                          {link.label}
                        </a>
                      ) : (
                        <Link
                          href={link.href}
                          className="font-body text-ops-text-secondary text-sm hover:text-ops-text-primary transition-colors"
                        >
                          {link.label}
                        </Link>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>

        {/* Newsletter */}
        <div className="mt-14 pt-8 border-t border-ops-border">
          <div className="max-w-md">
            <h3 className="font-caption text-ops-text-secondary uppercase tracking-[0.15em] text-[11px] mb-2">
              {t('footer.stayInTheLoop')}
            </h3>
            <p className="font-body text-ops-text-secondary/60 text-xs mb-4">
              {t('footer.newsletterSubtext')}
            </p>
            <NewsletterSignup source="footer" compact commonDict={commonDict} />
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 pt-6 border-t border-ops-border flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-ops-text-secondary">
            <OpsMark className="h-[15px] w-auto opacity-50" title="" />
            <span className="font-body text-xs">
              &copy; {new Date().getFullYear()} {t('footer.copyright')}
            </span>
          </div>
          <div className="flex items-center gap-6">
            <Link
              href="/legal?page=privacy"
              className="font-caption text-ops-text-secondary uppercase tracking-[0.1em] text-[10px] hover:text-ops-text-primary transition-colors"
            >
              {t('footer.privacy')}
            </Link>
            <Link
              href="/legal?page=terms"
              className="font-caption text-ops-text-secondary uppercase tracking-[0.1em] text-[10px] hover:text-ops-text-primary transition-colors"
            >
              {t('footer.terms')}
            </Link>
            <Link
              href="/legal?page=eula"
              className="font-caption text-ops-text-secondary uppercase tracking-[0.1em] text-[10px] hover:text-ops-text-primary transition-colors"
            >
              {t('footer.eula')}
            </Link>
            <LanguageToggle />
          </div>
        </div>
      </div>

      {/* Solar horizon glow at the very bottom */}
      <div
        className="h-56 w-full relative overflow-hidden"
        aria-hidden="true"
      >
        {/* Accent core glow */}
        <div
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse 100% 150% at 50% 100%, rgba(111, 148, 176, 0.10) 0%, rgba(111, 148, 176, 0.04) 25%, transparent 60%)',
          }}
        />
        {/* Warm orange mid-layer */}
        <div
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse 80% 130% at 50% 100%, rgba(212, 98, 43, 0.06) 0%, rgba(212, 98, 43, 0.025) 30%, transparent 55%)',
          }}
        />
        {/* Tight bright core at the very bottom */}
        <div
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse 50% 80% at 50% 100%, rgba(111, 148, 176, 0.12) 0%, rgba(212, 98, 43, 0.05) 40%, transparent 70%)',
          }}
        />
      </div>
    </footer>
  );
}
