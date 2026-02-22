/**
 * Navigation — Fixed nav bar
 * Transparent over hero, solidifies on scroll
 * Left: OPS logo, Center: nav links, Right: auth state
 */

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import UserDropdown from './UserDropdown';
import MobileMenu from './MobileMenu';
import Button from '@/components/ui/Button';

const navLinks = [
  { label: 'PLATFORM', href: '/platform' },
  { label: 'TOOLS', href: '/tools' },
  { label: 'PLANS', href: '/plans' },
  { label: 'JOURNAL', href: '/journal' },
  { label: 'RESOURCES', href: '/resources' },
  { label: 'COMPANY', href: '/company' },
];

export default function Navigation() {
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState<{ name: string } | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  // Scroll listener — solidify nav on scroll
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Lightweight auth check
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user: authUser } }) => {
      if (authUser) {
        setUser({
          name:
            authUser.user_metadata?.full_name ||
            authUser.user_metadata?.name ||
            authUser.email?.split('@')[0] ||
            'User',
        });
      }
    });
  }, []);

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          scrolled
            ? 'bg-ops-background/95 backdrop-blur-sm border-b border-ops-border'
            : 'bg-transparent border-b border-transparent'
        }`}
      >
        <div className="max-w-[1400px] mx-auto px-6 md:px-10 flex items-center justify-between h-16">
          {/* Left: Logo */}
          <Link href="/" className="flex-shrink-0">
            <Image
              src="/images/ops-logo-white.png"
              alt="OPS"
              width={48}
              height={20}
              className="object-contain"
              priority
            />
          </Link>

          {/* Center: Nav links — desktop only */}
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className={`font-caption uppercase tracking-[0.15em] text-[11px] transition-colors hover:text-ops-text-primary ${
                  pathname === link.href
                    ? 'text-ops-text-primary'
                    : 'text-ops-text-secondary'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right: Auth state — desktop */}
          <div className="hidden lg:flex items-center">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="font-body text-ops-text-primary text-sm underline underline-offset-4 decoration-ops-border hover:decoration-ops-border-hover transition-colors cursor-pointer"
                >
                  {user.name}
                </button>
                <UserDropdown
                  isOpen={dropdownOpen}
                  onClose={() => setDropdownOpen(false)}
                  userName={user.name}
                />
              </div>
            ) : (
              <Button variant="solid" href="https://app.opsapp.co" external>
                GET OPS
              </Button>
            )}
          </div>

          {/* Hamburger — mobile only */}
          <button
            onClick={() => setMobileOpen(true)}
            className="lg:hidden text-ops-text-primary p-2 cursor-pointer"
            aria-label="Open menu"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M3 8h18M3 16h18" />
            </svg>
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      <MobileMenu isOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
    </>
  );
}
