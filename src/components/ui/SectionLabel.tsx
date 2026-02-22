/**
 * SectionLabel — The `[ LABEL ]` pattern used site-wide
 * Kosugi, all caps, tracked spacing, bracketed
 */

interface SectionLabelProps {
  label: string;
  className?: string;
}

export default function SectionLabel({ label, className = '' }: SectionLabelProps) {
  return (
    <p
      className={`font-caption text-ops-text-secondary uppercase tracking-[0.2em] text-xs ${className}`}
    >
      [ {label} ]
    </p>
  );
}
