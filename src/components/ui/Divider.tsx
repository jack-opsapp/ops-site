/**
 * Divider — Thin horizontal rule, 1px at 10% white opacity
 */

interface DividerProps {
  className?: string;
}

export default function Divider({ className = '' }: DividerProps) {
  return (
    <hr
      className={`border-0 h-px bg-ops-border w-full ${className}`}
    />
  );
}
