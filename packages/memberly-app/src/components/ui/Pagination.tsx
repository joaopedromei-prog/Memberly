'use client';

import { cn } from '@/lib/utils/cn';

interface PaginationProps {
  page: number;
  totalPages: number;
  totalItems: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ page, totalPages, totalItems, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages = getPageNumbers(page, totalPages);

  return (
    <div className="flex items-center justify-between">
      <p className="text-sm text-gray-500">
        {totalItems} {totalItems === 1 ? 'resultado' : 'resultados'}
      </p>

      {/* Mobile: simplified */}
      <div className="flex items-center gap-2 sm:hidden">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm disabled:opacity-50"
        >
          Anterior
        </button>
        <span className="text-sm text-gray-600">
          {page} de {totalPages}
        </span>
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm disabled:opacity-50"
        >
          Próxima
        </button>
      </div>

      {/* Desktop: page numbers */}
      <div className="hidden items-center gap-1 sm:flex">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm disabled:opacity-50"
          aria-label="Página anterior"
        >
          ‹
        </button>
        {pages.map((p, i) =>
          p === '...' ? (
            <span key={`ellipsis-${i}`} className="px-2 text-gray-400">
              …
            </span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(p as number)}
              className={cn(
                'rounded-lg px-3 py-1.5 text-sm',
                p === page
                  ? 'bg-blue-600 text-white'
                  : 'border border-gray-300 hover:bg-gray-50'
              )}
            >
              {p}
            </button>
          )
        )}
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm disabled:opacity-50"
          aria-label="Próxima página"
        >
          ›
        </button>
      </div>
    </div>
  );
}

function getPageNumbers(current: number, total: number): (number | '...')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const pages: (number | '...')[] = [1];

  if (current > 3) pages.push('...');

  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);

  for (let i = start; i <= end; i++) pages.push(i);

  if (current < total - 2) pages.push('...');

  pages.push(total);

  return pages;
}
