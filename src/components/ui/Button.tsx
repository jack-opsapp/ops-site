/**
 * Button — Solid and ghost variants
 * Kosugi caps, sharp radius, renders as <a> if href provided
 */

import Link from 'next/link';

interface ButtonProps {
  variant: 'solid' | 'ghost';
  href?: string;
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
  external?: boolean;
}

export default function Button({
  variant,
  href,
  onClick,
  children,
  className = '',
  external = false,
}: ButtonProps) {
  const base =
    'inline-flex items-center justify-center font-caption uppercase tracking-[0.15em] text-xs px-6 py-3 rounded-[3px] transition-all duration-200 cursor-pointer';

  const variants = {
    solid:
      'bg-ops-text-primary text-ops-background hover:bg-white/90 active:bg-white/80',
    ghost:
      'bg-transparent text-ops-text-primary border border-ops-border hover:border-ops-border-hover active:border-white/40',
  };

  const classes = `${base} ${variants[variant]} ${className}`;

  if (href) {
    if (external) {
      return (
        <a href={href} target="_blank" rel="noopener noreferrer" className={classes}>
          {children}
        </a>
      );
    }
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button onClick={onClick} className={classes}>
      {children}
    </button>
  );
}
