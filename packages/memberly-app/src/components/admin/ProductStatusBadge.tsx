import { cn } from '@/lib/utils/cn';

interface ProductStatusBadgeProps {
  isPublished: boolean;
}

export function ProductStatusBadge({ isPublished }: ProductStatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 transition-opacity hover:opacity-80',
        isPublished
          ? 'bg-emerald-50 text-emerald-700 ring-emerald-200'
          : 'bg-slate-100 text-slate-600 ring-slate-200'
      )}
    >
      {isPublished ? 'Publicado' : 'Rascunho'}
    </span>
  );
}
