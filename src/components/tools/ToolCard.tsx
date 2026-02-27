/**
 * ToolCard — Individual tool card with hover-activated illustration
 *
 * Client component (hover state). Dark surface with ultra-thin border.
 * Passes isActive to illustration children via cloneElement.
 */

'use client';

import { useState, cloneElement, isValidElement, ReactElement } from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';

interface ToolCardProps {
  name: string;
  description: string;
  status: 'available' | 'development';
  href?: string;
  external?: boolean;
  illustration: React.ReactNode;
}

export default function ToolCard({
  name,
  description,
  status,
  href,
  external,
  illustration,
}: ToolCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Card hoverable className="p-8 h-full flex flex-col">
        {/* Tool name */}
        <span className="font-caption uppercase text-[11px] tracking-[0.15em] text-ops-text-secondary">
          {name}
        </span>

        {/* Description */}
        <p className="font-heading font-light text-base text-ops-text-secondary mt-3">
          {description}
        </p>

        {/* Illustration area */}
        <div className="mt-6 h-40 flex items-center justify-center">
          {isValidElement(illustration)
            ? cloneElement(illustration as ReactElement<{ isActive?: boolean }>, {
                isActive: isHovered,
              })
            : illustration}
        </div>

        {/* Status indicator */}
        <div className="mt-auto pt-6">
          <span
            className={`font-caption uppercase text-[10px] tracking-[0.1em] ${
              status === 'available'
                ? 'text-ops-text-primary'
                : 'text-ops-text-secondary'
            }`}
          >
            {status === 'available' ? 'AVAILABLE' : 'IN DEVELOPMENT'}
          </span>

          {/* CTA button for available tools */}
          {status === 'available' && href && (
            <div className="mt-4">
              <Button variant="ghost" href={href} external={external}>
                {external ? 'EXPLORE' : 'TRY IT'}
              </Button>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
