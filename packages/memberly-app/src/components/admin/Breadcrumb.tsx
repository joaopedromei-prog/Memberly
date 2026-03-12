'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const labelMap: Record<string, string> = {
  admin: 'Dashboard',
  products: 'Produtos',
  members: 'Membros',
  settings: 'Configurações',
  new: 'Novo',
};

export function Breadcrumb() {
  const pathname = usePathname();
  const segments = pathname.split('/').filter(Boolean);

  if (segments.length <= 1) return null;

  return (
    <nav className="mb-6 flex items-center gap-2 text-sm text-gray-500" aria-label="Breadcrumb">
      {segments.map((segment, index) => {
        const href = '/' + segments.slice(0, index + 1).join('/');
        const label = labelMap[segment] || segment;
        const isLast = index === segments.length - 1;

        return (
          <span key={href} className="flex items-center gap-2">
            {index > 0 && <span aria-hidden="true">/</span>}
            {isLast ? (
              <span className="font-medium text-gray-900">{label}</span>
            ) : (
              <Link href={href} className="hover:text-gray-700">
                {label}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}
