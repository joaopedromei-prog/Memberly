import { ModuleCardSkeleton } from '@/components/member/ModuleCardSkeleton';

export default function ProductLoading() {
  return (
    <div>
      {/* Hero skeleton */}
      <div className="relative aspect-[21/9] w-full animate-shimmer bg-gradient-to-r from-dark-card via-dark-border to-dark-card bg-[length:200%_100%] sm:aspect-[3/1]" />

      <div className="-mt-32 px-4 sm:-mt-40 sm:px-6 lg:px-16">
        <div className="mx-auto max-w-7xl">
          <div className="h-8 w-2/3 animate-shimmer rounded bg-gradient-to-r from-dark-card via-dark-border to-dark-card bg-[length:200%_100%]" />
          <div className="mt-3 h-4 w-1/4 animate-shimmer rounded bg-gradient-to-r from-dark-card via-dark-border to-dark-card bg-[length:200%_100%]" />
          <div className="mt-4 h-10 w-48 animate-shimmer rounded bg-gradient-to-r from-dark-card via-dark-border to-dark-card bg-[length:200%_100%]" />
        </div>
      </div>

      {/* Module list skeleton */}
      <div className="mt-8 px-4 sm:px-6 lg:px-16">
        <div className="mx-auto max-w-7xl">
          <div className="h-6 w-32 animate-shimmer rounded bg-gradient-to-r from-dark-card via-dark-border to-dark-card bg-[length:200%_100%]" />
          <div className="mt-4 flex flex-col gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <ModuleCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
