/**
 * MobileMenu — Full-screen dark overlay with staggered link animation
 * Visible on mobile, hidden on desktop
 */

'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import type { Dictionary } from '@/i18n/types';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  commonDict: Dictionary;
}

const navLinkKeys = [
  { key: 'nav.platform', href: '/platform' },
  { key: 'nav.tools', href: '/tools' },
  { key: 'nav.plans', href: '/plans' },
  { key: 'nav.journal', href: '/journal' },
  { key: 'nav.resources', href: '/resources' },
  { key: 'nav.company', href: '/company' },
];

export default function MobileMenu({ isOpen, onClose, commonDict }: MobileMenuProps) {
  const t = (key: string) => {
    const value = commonDict[key];
    return typeof value === 'string' ? value : key;
  };

  const navLinks = navLinkKeys.map((link) => ({
    label: t(link.key),
    href: link.href,
  }));

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 bg-ops-background/[0.98] flex flex-col"
        >
          {/* Close button */}
          <div className="flex justify-end p-6">
            <button
              onClick={onClose}
              className="text-ops-text-primary p-2 cursor-pointer"
              aria-label={t('nav.closeMenu')}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Links */}
          <nav className="flex-1 flex flex-col justify-center px-12 gap-1">
            {navLinks.map((link, i) => (
              <motion.div
                key={link.href}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{
                  delay: 0.05 * i,
                  duration: 0.3,
                  ease: [0.22, 1, 0.36, 1],
                }}
              >
                <Link
                  href={link.href}
                  onClick={onClose}
                  className="block font-caption text-ops-text-primary uppercase tracking-[0.2em] text-lg py-4 border-b border-ops-border hover:text-ops-accent transition-colors"
                >
                  {link.label}
                </Link>
              </motion.div>
            ))}
          </nav>

          {/* Bottom CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.3 }}
            className="px-12 pb-12"
          >
            <Button variant="solid" href="https://app.opsapp.co" external className="w-full">
              {t('nav.getOps')}
            </Button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
