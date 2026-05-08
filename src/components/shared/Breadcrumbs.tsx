import Link from 'next/link';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  variant?: 'dark' | 'light';
}

export default function Breadcrumbs({ items, variant = 'dark' }: BreadcrumbsProps) {
  const secondary = variant === 'light' ? 'text-ops-text-dark/50' : 'text-ops-text-secondary';
  const primary = variant === 'light' ? 'text-ops-text-dark' : 'text-ops-text-primary';
  const hover = variant === 'light' ? 'hover:text-ops-text-dark' : 'hover:text-ops-text-primary';

  return (
    <nav aria-label="Breadcrumb" className="max-w-[1100px] mx-auto px-6 md:px-10 pt-24 md:pt-28">
      <ol className={`flex items-center gap-1.5 font-caption text-[10px] uppercase tracking-wide ${secondary}`}>
        {items.map((item, i) => (
          <li key={i} className="flex items-center gap-1.5">
            {i > 0 && <span aria-hidden="true">/</span>}
            {item.href ? (
              <Link href={item.href} className={`${hover} transition-colors`}>
                {item.label}
              </Link>
            ) : (
              <span className={primary}>{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
