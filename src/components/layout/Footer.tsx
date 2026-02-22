/**
 * Footer — Link grid with dramatic warm gradient at bottom
 * 4 columns: PRODUCT, RESOURCES, COMPANY, CONNECT
 * Warm sunset gradient finish at the very bottom
 */

import Link from 'next/link';
import Image from 'next/image';

const columns = [
  {
    title: 'PRODUCT',
    links: [
      { label: 'Platform', href: '/platform' },
      { label: 'Tools', href: '/tools' },
      { label: 'Plans', href: '/plans' },
    ],
  },
  {
    title: 'RESOURCES',
    links: [
      { label: 'Journal', href: '/journal' },
      { label: 'Help', href: '/resources' },
      { label: 'Contact', href: '/resources#contact' },
    ],
  },
  {
    title: 'COMPANY',
    links: [
      { label: 'About', href: '/company' },
      { label: 'Careers', href: '/company' },
      { label: 'Legal', href: '/legal?page=terms' },
    ],
  },
  {
    title: 'CONNECT',
    links: [
      { label: 'App Store', href: 'https://apps.apple.com/app/ops-app/id6504890498', external: true },
      { label: 'Web App', href: 'https://app.opsapp.co', external: true },
      { label: 'Instagram', href: 'https://instagram.com/ops.app.co', external: true },
      { label: 'LinkedIn', href: 'https://linkedin.com/company/ops-app', external: true },
    ],
  },
];

export default function Footer() {
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

        {/* Bottom bar */}
        <div className="mt-16 pt-6 border-t border-ops-border flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Image
              src="/images/ops-logo-white.png"
              alt="OPS"
              width={36}
              height={15}
              className="object-contain opacity-50"
            />
            <span className="font-body text-ops-text-secondary text-xs">
              &copy; {new Date().getFullYear()} OPS Technologies Inc.
            </span>
          </div>
          <div className="flex items-center gap-6">
            <Link
              href="/legal?page=privacy"
              className="font-caption text-ops-text-secondary uppercase tracking-[0.1em] text-[10px] hover:text-ops-text-primary transition-colors"
            >
              Privacy
            </Link>
            <Link
              href="/legal?page=terms"
              className="font-caption text-ops-text-secondary uppercase tracking-[0.1em] text-[10px] hover:text-ops-text-primary transition-colors"
            >
              Terms
            </Link>
            <Link
              href="/legal?page=eula"
              className="font-caption text-ops-text-secondary uppercase tracking-[0.1em] text-[10px] hover:text-ops-text-primary transition-colors"
            >
              EULA
            </Link>
          </div>
        </div>
      </div>

      {/* Dramatic warm gradient at the very bottom */}
      <div
        className="h-32 w-full"
        style={{
          background: 'linear-gradient(to bottom, #0A0A0A 0%, #1a0f05 40%, #2a1508 70%, #1a0f05 100%)',
        }}
        aria-hidden="true"
      />
    </footer>
  );
}
