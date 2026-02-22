/**
 * FeatheredImage — Image with gradient edges that dissolve into background
 * Uses next/image for optimization
 */

import Image from 'next/image';

interface FeatheredImageProps {
  src: string;
  alt: string;
  gradient?: 'bottom' | 'all-edges' | 'left' | 'right';
  className?: string;
  priority?: boolean;
  fill?: boolean;
  width?: number;
  height?: number;
}

const gradientStyles: Record<string, string> = {
  bottom:
    'after:absolute after:inset-0 after:bg-gradient-to-t after:from-ops-background after:via-transparent after:to-transparent',
  'all-edges': `
    after:absolute after:inset-0
    after:[background:radial-gradient(ellipse_at_center,transparent_30%,#0A0A0A_80%)]
  `,
  left: 'after:absolute after:inset-0 after:bg-gradient-to-r after:from-ops-background after:via-transparent after:to-transparent',
  right:
    'after:absolute after:inset-0 after:bg-gradient-to-l after:from-ops-background after:via-transparent after:to-transparent',
};

export default function FeatheredImage({
  src,
  alt,
  gradient = 'bottom',
  className = '',
  priority = false,
  fill = false,
  width,
  height,
}: FeatheredImageProps) {
  return (
    <div className={`relative overflow-hidden ${gradientStyles[gradient]} ${className}`}>
      {fill ? (
        <Image
          src={src}
          alt={alt}
          fill
          priority={priority}
          className="object-cover"
          sizes="100vw"
        />
      ) : (
        <Image
          src={src}
          alt={alt}
          width={width ?? 800}
          height={height ?? 600}
          priority={priority}
          className="object-cover w-full h-auto"
        />
      )}
    </div>
  );
}
