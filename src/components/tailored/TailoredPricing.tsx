'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { theme } from '@/lib/theme';
import { SectionLabel } from '@/components/ui';
import PackageCard, { type PackageExample } from './PackageCard';

const ease = theme.animation.easing as [number, number, number, number];

export interface PackageData {
  tier: 'setup' | 'build' | 'enterprise';
  name: string;
  tagline: string;
  price: string;
  deposit: string;
  features: string[];
  examples: PackageExample[];
  ongoing: string;
  ctaText: string;
  recommended?: boolean;
}

interface TailoredPricingProps {
  sectionLabel: string;
  packages: PackageData[];
  onTierSelect?: (tier: string | null) => void;
}

export default function TailoredPricing({
  sectionLabel,
  packages,
  onTierSelect,
}: TailoredPricingProps) {
  const [expandedTier, setExpandedTier] = useState<string | null>(null);

  function handleToggle(tier: string) {
    const newTier = expandedTier === tier ? null : tier;
    setExpandedTier(newTier);
    onTierSelect?.(newTier);
  }

  async function handleDeposit(tier: string) {
    try {
      const res = await fetch('/api/tailored/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ package: tier }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      console.error('Checkout error:', err);
    }
  }

  return (
    <section id="packages" className="py-24 md:py-32 bg-ops-background">
      <div className="max-w-[1400px] mx-auto px-6 sm:px-10 md:px-16 lg:px-24">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease }}
          viewport={{ once: true, amount: 0.3 }}
        >
          <SectionLabel label={sectionLabel} className="mb-12" />
        </motion.div>

        <div className="flex gap-16 lg:gap-24">
          {/* Left: Pricing cards */}
          <div className="flex-1 max-w-[720px] flex flex-col gap-3">
            {packages.map((pkg, index) => (
              <motion.div
                key={pkg.tier}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.08, ease }}
                viewport={{ once: true, amount: 0.2 }}
              >
                <PackageCard
                  {...pkg}
                  isExpanded={expandedTier === pkg.tier}
                  isOtherExpanded={expandedTier !== null && expandedTier !== pkg.tier}
                  onToggle={() => handleToggle(pkg.tier)}
                  onDeposit={handleDeposit}
                />
              </motion.div>
            ))}
          </div>

          {/* Right: Phone placeholder — Phase B */}
          <div className="hidden lg:block w-[280px] flex-shrink-0">
            {/* 3D phone will show selected package here in Phase B */}
          </div>
        </div>
      </div>
    </section>
  );
}
