'use client';

/**
 * PricingCard — Individual pricing tier card
 *
 * Dark surface fill with ultra-thin border.
 * Recommended tier gets accent top border.
 * Updated to include user count, annual pricing, and "Best for" line.
 */

import { useState } from 'react';
import { Button, Divider } from '@/components/ui';

interface PricingCardProps {
  name: string;
  price: string;
  interval: string;
  users: string;
  bestFor: string;
  features: string[];
  recommended?: boolean;
  ctaText: string;
  ctaHref: string;
}

function Checkmark() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className="shrink-0"
    >
      <path
        d="M3 8.5L6.5 12L13 4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-ops-text-primary"
      />
    </svg>
  );
}

export default function PricingCard({
  name,
  price,
  interval,
  users,
  bestFor,
  features,
  recommended = false,
  ctaText,
  ctaHref,
}: PricingCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const isExternal = ctaHref.startsWith('http');

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`
        bg-ops-surface rounded-[3px] p-8 flex flex-col
        border transition-colors duration-200
        ${recommended ? 'border-t-2 border-t-ops-accent' : ''}
        ${isHovered ? 'border-ops-border-hover' : 'border-ops-border'}
      `}
    >
      {/* Tier name */}
      <span className="font-caption uppercase text-[11px] tracking-[0.15em] text-ops-text-secondary">
        {name}
      </span>

      {/* Price */}
      <span className="font-heading font-bold text-5xl text-ops-text-primary mt-4">
        {price}
      </span>

      {/* Interval */}
      <span className="font-heading font-light text-sm text-ops-text-secondary mt-1">
        {interval}
      </span>

      {/* Users */}
      <span className="font-caption uppercase text-[11px] tracking-[0.15em] text-ops-text-secondary mt-3">
        {users}
      </span>

      {/* Best for */}
      <p className="font-heading font-light text-xs text-ops-text-secondary italic mt-3">
        Best for: {bestFor}
      </p>

      <Divider className="my-6" />

      {/* Features */}
      <ul className="flex flex-col gap-3 flex-1">
        {features.map((feature, index) => (
          <li key={index} className="flex items-center gap-3">
            <Checkmark />
            <span className="font-heading font-light text-sm text-ops-text-primary">
              {feature}
            </span>
          </li>
        ))}
      </ul>

      {/* CTA */}
      <div className="mt-8">
        <Button
          variant={recommended ? 'solid' : 'ghost'}
          href={ctaHref}
          external={isExternal}
          className="w-full"
        >
          {ctaText}
        </Button>
      </div>
    </div>
  );
}
