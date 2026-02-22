/**
 * UserDropdown — Dark dropdown for logged-in users
 * Dashboard, Account, Sign Out
 * Dismisses on click-outside
 */

'use client';

import { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@/lib/supabase';

interface UserDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  userName: string;
}

const links = [
  { label: 'DASHBOARD', href: 'https://app.opsapp.co' },
  { label: 'ACCOUNT', href: 'https://app.opsapp.co/settings' },
];

export default function UserDropdown({ isOpen, onClose, userName }: UserDropdownProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    onClose();
    window.location.reload();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.15, ease: [0.22, 1, 0.36, 1] }}
          className="absolute right-0 top-full mt-2 w-48 bg-ops-surface border border-ops-border rounded-[3px] overflow-hidden z-50"
        >
          <div className="px-4 py-3 border-b border-ops-border">
            <p className="font-caption text-ops-text-secondary uppercase tracking-[0.1em] text-[10px]">
              SIGNED IN AS
            </p>
            <p className="font-body text-ops-text-primary text-sm mt-1 truncate">
              {userName}
            </p>
          </div>
          {links.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="block px-4 py-2.5 font-caption text-ops-text-secondary uppercase tracking-[0.1em] text-[11px] hover:bg-ops-surface-elevated hover:text-ops-text-primary transition-colors"
            >
              {link.label}
            </a>
          ))}
          <button
            onClick={handleSignOut}
            className="w-full text-left px-4 py-2.5 font-caption text-ops-text-secondary uppercase tracking-[0.1em] text-[11px] hover:bg-ops-surface-elevated hover:text-ops-text-primary transition-colors border-t border-ops-border cursor-pointer"
          >
            SIGN OUT
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
