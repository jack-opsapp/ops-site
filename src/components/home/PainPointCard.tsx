'use client';

/**
 * PainPointCard — Hoverable card showing a pain point with animated wireframe
 *
 * Uses the shared Card component as wrapper. On hover the wireframe
 * illustration activates its animation sequence.
 */

import { useState } from 'react';
import { Card } from '@/components/ui';
import WireframeIllustration from '@/components/animations/WireframeIllustration';

interface PainPointCardProps {
  title: string;
  description: string;
  variant: 'messages' | 'dashboard' | 'apps';
}

export default function PainPointCard({ title, description, variant }: PainPointCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Card hoverable={true} className="p-8 h-full">
        {/* Title — Kosugi caps */}
        <p className="font-caption text-ops-text-secondary uppercase tracking-[0.15em] text-xs">
          {title}
        </p>

        {/* Description — Mohave Light */}
        <p className="font-heading font-light text-ops-text-primary text-base mt-3 leading-relaxed">
          {description}
        </p>

        {/* Animated wireframe illustration */}
        <div className="mt-6 flex justify-start">
          <WireframeIllustration variant={variant} isActive={isHovered} size={200} />
        </div>
      </Card>
    </div>
  );
}
