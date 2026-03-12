import { Skeleton } from '@/components/ui/Skeleton';

export function HeroBannerSkeleton() {
  return (
    <div className="relative h-[56vw] max-h-[70vh] min-h-[250px] w-full sm:aspect-video sm:h-auto">
      <Skeleton variant="image" className="absolute inset-0 h-full w-full rounded-none" />
      <div className="absolute inset-0 bg-gradient-to-t from-dark-bg via-dark-bg/60 to-transparent" />
      <div className="absolute bottom-0 left-0 w-full p-4 sm:p-6 lg:p-16">
        <Skeleton variant="text" className="h-8 w-64" />
        <Skeleton variant="text" className="mt-3 h-4 w-96 max-w-full" />
        <Skeleton variant="text" className="mt-4 h-11 w-40 rounded" />
      </div>
    </div>
  );
}
