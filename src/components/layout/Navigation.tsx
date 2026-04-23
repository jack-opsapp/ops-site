/**
 * Navigation — Fixed nav bar
 * Transparent over hero, solidifies on scroll
 * Left: OPS logo, Center: nav links, Right: auth state
 */

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import UserDropdown from './UserDropdown';
import MobileMenu from './MobileMenu';
import Button from '@/components/ui/Button';
import CartIcon from '@/components/shop/CartIcon';
import CartDrawer from '@/components/shop/CartDrawer';
import { OpsMark } from '@/components/brand/OpsMark';
import { OpsLockup } from '@/components/brand/OpsLockup';
import type { Dictionary } from '@/i18n/types';

const baseNavLinks = [
  { key: 'nav.platform', href: '/platform' },
  { key: 'nav.tools', href: '/tools' },
  { key: 'nav.shop', href: '/shop', shopOnly: true },
  { key: 'nav.plans', href: '/plans' },
  { key: 'nav.journal', href: '/journal' },
  { key: 'nav.resources', href: '/resources' },
  { key: 'nav.company', href: '/company' },
];

interface NavigationProps {
  commonDict: Dictionary;
  shopLive?: boolean;
}

export default function Navigation({ commonDict, shopLive = false }: NavigationProps) {
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState<{ name: string } | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const pathname = usePathname();

  const t = (key: string) => {
    const value = commonDict[key];
    return typeof value === 'string' ? value : key;
  };

  // Light-background pages need inverted nav colors before scroll
  const isLightPage = pathname === '/legal';

  // Scroll listener — solidify nav on scroll
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Lightweight auth check
  useEffect(() => {
    const supabase = createClient();
    if (!supabase) return;
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

  const navLinkKeys = baseNavLinks.filter((link) => !link.shopOnly || shopLive);
  const navLinks = navLinkKeys.map((link) => ({
    label: t(link.key),
    href: link.href,
  }));

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          scrolled
            ? 'border-b border-white/[0.08]'
            : 'bg-transparent border-b border-transparent'
        }`}
        style={scrolled ? {
          background: 'rgba(10, 10, 10, 0.70)',
          backdropFilter: 'blur(20px) saturate(1.2)',
          WebkitBackdropFilter: 'blur(20px) saturate(1.2)',
        } : undefined}
      >
        <div className="max-w-[1400px] mx-auto px-6 md:px-10 flex items-center justify-between h-16">
          {/* Left: Lockup at rest, collapses to mark on scroll.
               Inline SVG uses currentColor, so text color controls logo color. */}
          <Link
            href="/"
            className={`flex-shrink-0 transition-colors duration-300 ${
              isLightPage && !scrolled ? 'text-ops-text-dark' : 'text-ops-text-primary'
            }`}
            aria-label="OPS — home"
          >
            <div className="relative h-5 w-[100px]">
              {/* Lockup (mark + wordmark) — shown at top of page */}
              <OpsLockup
                className={`absolute inset-0 h-full w-full transition-opacity duration-200 ${
                  scrolled ? 'opacity-0 pointer-events-none' : 'opacity-100'
                }`}
                title=""
              />
              {/* Mark only — shown while scrolling, aligned left */}
              <OpsMark
                className={`absolute inset-y-0 left-0 h-full transition-opacity duration-200 ${
                  scrolled ? 'opacity-100' : 'opacity-0 pointer-events-none'
                }`}
                title="OPS — home"
              />
            </div>
          </Link>

          {/* Center: Nav links — desktop only */}
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`font-caption uppercase tracking-[0.15em] text-[11px] transition-colors ${
                  isLightPage && !scrolled
                    ? pathname === link.href
                      ? 'text-ops-text-dark hover:text-ops-text-dark'
                      : 'text-ops-text-dark/60 hover:text-ops-text-dark'
                    : pathname === link.href
                      ? 'text-ops-text-primary hover:text-ops-text-primary'
                      : 'text-ops-text-secondary hover:text-ops-text-primary'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right: Cart + Auth state — desktop */}
          <div className="hidden lg:flex items-center gap-4">
            {shopLive && (
              <CartIcon
                onClick={() => setCartOpen(true)}
                isLight={isLightPage && !scrolled}
              />
            )}
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
                {t('nav.getOps')}
              </Button>
            )}
          </div>

          {/* Hamburger — mobile only */}
          <button
            onClick={() => setMobileOpen(true)}
            className={`lg:hidden p-2 cursor-pointer transition-colors duration-300 ${
              isLightPage && !scrolled ? 'text-ops-text-dark' : 'text-ops-text-primary'
            }`}
            aria-label={t('nav.openMenu')}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M3 8h18M3 16h18" />
            </svg>
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      <MobileMenu
        isOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
        commonDict={commonDict}
      />

      {/* Cart drawer — only when shop is live */}
      {shopLive && <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />}
    </>
  );
}
