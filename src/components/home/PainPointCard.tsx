'use client';

/**
 * PainPointCard — Hoverable card showing a pain point with animated wireframe
 *
 * Uses the shared Card component as wrapper. On hover the wireframe
 * illustration activates its animation sequence.
 * Updated to bullet-point format with "For:" line per try-ops authority.
 */

import { useState } from 'react';
import { Card } from '@/components/ui';
import WireframeIllustration from '@/components/animations/WireframeIllustration';

interface PainPointCardProps {
  title: string;
  bullets: string[];
  forLine: string;
  variant: 'messages' | 'dashboard' | 'apps';
}

export default function PainPointCard({ title, bullets, forLine, variant }: PainPointCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Card hoverable={true} className="p-8 h-full">
        {/* Animated wireframe illustration */}
        <div className="mb-4">
          <WireframeIllustration variant={variant} isActive={isHovered} size={200} />
        </div>

        {/* Title */}
        <p className="font-heading font-bold text-ops-text-primary uppercase text-lg tracking-tight">
          {title}
        </p>

        {/* Bullets */}
        <ul className="mt-3 space-y-1">
          {bullets.map((bullet, i) => (
            <li key={i} className="font-heading font-light text-ops-text-secondary text-sm leading-relaxed">
              &bull; {bullet}
            </li>
          ))}
        </ul>

        {/* For line */}
        <p className="mt-4 font-caption text-[11px] text-ops-text-secondary italic">
          {forLine}
        </p>
      </Card>
    </div>
  );
}
