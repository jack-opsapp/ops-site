/**
 * GradientOverlay — Linear gradient overlay for hero sections
 * Absolute positioned, covers parent container
 * Linear only. NEVER radial (per design spec).
 */

interface GradientOverlayProps {
  direction?: 'to-bottom' | 'to-top' | 'to-left' | 'to-right';
  opacity?: number;
  className?: string;
}

const directionMap: Record<string, string> = {
  'to-bottom': 'bg-gradient-to-b',
  'to-top': 'bg-gradient-to-t',
  'to-left': 'bg-gradient-to-l',
  'to-right': 'bg-gradient-to-r',
};

export default function GradientOverlay({
  direction = 'to-bottom',
  opacity = 1,
  className = '',
}: GradientOverlayProps) {
  return (
    <div
      className={`absolute inset-0 ${directionMap[direction]} from-transparent to-ops-background ${className}`}
      style={{ opacity }}
      aria-hidden="true"
    />
  );
}
