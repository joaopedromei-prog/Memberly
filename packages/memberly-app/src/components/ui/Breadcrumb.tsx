import Link from 'next/link';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav
      className="mb-6 flex items-center gap-2 text-sm text-gray-500"
      aria-label="Breadcrumb"
    >
      {items.map((item, index) => (
        <span key={index} className="flex items-center gap-2">
          {index > 0 && (
            <span aria-hidden="true" className="text-gray-400">
              /
            </span>
          )}
          {item.href ? (
            <Link href={item.href} className="hover:text-gray-700">
              {item.label}
            </Link>
          ) : (
            <span className="font-medium text-gray-900">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
