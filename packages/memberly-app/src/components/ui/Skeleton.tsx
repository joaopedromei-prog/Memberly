import { cn } from '@/lib/utils/cn';

interface SkeletonProps {
  variant?: 'text' | 'image' | 'card';
  className?: string;
}

export function Skeleton({ variant = 'text', className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-shimmer rounded bg-dark-card bg-[length:200%_100%] bg-[linear-gradient(90deg,_var(--color-dark-card)_25%,_var(--color-dark-surface)_50%,_var(--color-dark-card)_75%)]',
        variant === 'text' && 'h-4 w-full',
        variant === 'image' && 'aspect-video w-full',
        variant === 'card' && 'h-48 w-full',
        className
      )}
    />
  );
}
