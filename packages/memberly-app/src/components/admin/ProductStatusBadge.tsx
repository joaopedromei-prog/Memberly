import { cn } from '@/lib/utils/cn';

interface ProductStatusBadgeProps {
  isPublished: boolean;
}

export function ProductStatusBadge({ isPublished }: ProductStatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        isPublished
          ? 'bg-green-100 text-green-800'
          : 'bg-gray-100 text-gray-600'
      )}
    >
      {isPublished ? 'Publicado' : 'Rascunho'}
    </span>
  );
}
