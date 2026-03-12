import { Skeleton } from '@/components/ui/Skeleton';

export function ProductCardSkeleton() {
  return (
    <div className="w-[250px] flex-shrink-0 snap-start sm:w-[300px] lg:w-[350px]">
      <Skeleton variant="image" />
      <Skeleton variant="text" className="mt-2 h-4 w-3/4" />
      <Skeleton variant="text" className="mt-2 h-1 w-full" />
    </div>
  );
}
