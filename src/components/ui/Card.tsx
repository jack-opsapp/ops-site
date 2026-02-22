/**
 * Card — Dark surface with ultra-thin border
 * On hover: border brightens. Smooth transition.
 */

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hoverable?: boolean;
}

export default function Card({
  children,
  className = '',
  hoverable = true,
}: CardProps) {
  return (
    <div
      className={`
        bg-ops-surface border border-ops-border rounded-[3px]
        ${hoverable ? 'transition-[border-color] duration-300 hover:border-ops-border-hover' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
}
