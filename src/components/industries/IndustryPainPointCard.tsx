'use client';

import { useRef, useState, useCallback } from 'react';
import { Card } from '@/components/ui';
import WireframeIllustration from '@/components/animations/WireframeIllustration';
import type { WireframeVariant } from '@/lib/industries';

interface IndustryPainPointCardProps {
  title: string;
  bullets: string[];
  forLine: string;
  variant: WireframeVariant;
  isActive: boolean;
  onActivate: () => void;
  onDeactivate: () => void;
}

const MAX_TILT = 4;

export default function IndustryPainPointCard({
  title, bullets, forLine, variant,
  isActive, onActivate, onDeactivate,
}: IndustryPainPointCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0 });

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    setTilt({
      rotateX: (0.5 - y) * MAX_TILT * 2,
      rotateY: (x - 0.5) * MAX_TILT * 2,
    });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setTilt({ rotateX: 0, rotateY: 0 });
    onDeactivate();
  }, [onDeactivate]);

  return (
    <div ref={cardRef} onMouseEnter={onActivate} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}
      style={{ perspective: '800px' }}>
      <div style={{
        transform: `rotateX(${tilt.rotateX}deg) rotateY(${tilt.rotateY}deg)`,
        transition: isActive ? 'transform 0.2s ease-out' : 'transform 0.3s ease-out',
      }}>
        <Card hoverable={false} className={`p-8 h-full relative overflow-hidden transition-colors duration-200 ${isActive ? 'border-ops-border-hover' : ''}`}>
          <div className="relative z-10">
            <div className="mb-4">
              <WireframeIllustration variant={variant} isActive={isActive} size={200} />
            </div>
            <p className="font-heading font-bold text-ops-text-primary uppercase text-lg tracking-tight">{title}</p>
            <ul className="mt-3 space-y-1">
              {bullets.map((bullet, i) => (
                <li key={i} className="font-heading font-light text-ops-text-secondary text-sm leading-relaxed">&bull; {bullet}</li>
              ))}
            </ul>
            <p className="mt-4 font-caption text-[11px] text-ops-text-secondary italic">{forLine}</p>
          </div>
        </Card>
      </div>
    </div>
  );
}
