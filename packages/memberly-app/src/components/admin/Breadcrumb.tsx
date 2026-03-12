'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUIStore } from '@/stores/ui-store';

const labelMap: Record<string, string> = {
  admin: 'Dashboard',
  products: 'Produtos',
  members: 'Membros',
  new: 'Novo',
  modules: 'Módulos',
  lessons: 'Aulas',
};

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isUuid(segment: string) {
  return UUID_REGEX.test(segment);
}

export function Breadcrumb() {
  const pathname = usePathname();
  const breadcrumbLabels = useUIStore((s) => s.breadcrumbLabels);
  const segments = pathname.split('/').filter(Boolean);

  if (segments.length <= 1) return null;

  const items: { label: string; href: string; isLast: boolean }[] = [];

  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i];
    const href = '/' + segments.slice(0, i + 1).join('/');
    const isLast = i === segments.length - 1;

    if (isUuid(segment)) {
      // Show UUID segments if a label was provided via store
      const dynamicLabel = breadcrumbLabels[segment];
      if (dynamicLabel) {
        items.push({ label: dynamicLabel, href, isLast });
      }
      continue;
    }

    const label = labelMap[segment] || segment;
    items.push({ label, href, isLast });
  }

  // Update isLast flag after filtering
  if (items.length > 0) {
    items.forEach((item) => (item.isLast = false));
    items[items.length - 1].isLast = true;
  }

  if (items.length <= 1) return null;

  return (
    <nav className="mb-6 flex items-center gap-2 text-sm text-gray-500" aria-label="Breadcrumb">
      {items.map((item, index) => (
        <span key={item.href} className="flex items-center gap-2">
          {index > 0 && (
            <svg className="h-4 w-4 text-gray-300" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
            </svg>
          )}
          {item.isLast ? (
            <span className="font-medium text-gray-900">{item.label}</span>
          ) : (
            <Link href={item.href} className="hover:text-gray-700">
              {item.label}
            </Link>
          )}
        </span>
      ))}
    </nav>
  );
}
