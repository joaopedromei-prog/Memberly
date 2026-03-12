export function ModuleCardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-lg bg-dark-surface sm:flex-row">
      {/* Banner skeleton */}
      <div className="aspect-video w-full flex-shrink-0 animate-shimmer bg-gradient-to-r from-dark-card via-dark-border to-dark-card bg-[length:200%_100%] sm:w-[150px] lg:w-[200px]" />

      {/* Content skeleton */}
      <div className="flex flex-1 flex-col justify-center p-4">
        <div className="h-5 w-3/4 animate-shimmer rounded bg-gradient-to-r from-dark-card via-dark-border to-dark-card bg-[length:200%_100%]" />
        <div className="mt-2 h-4 w-full animate-shimmer rounded bg-gradient-to-r from-dark-card via-dark-border to-dark-card bg-[length:200%_100%]" />
        <div className="mt-1 h-4 w-2/3 animate-shimmer rounded bg-gradient-to-r from-dark-card via-dark-border to-dark-card bg-[length:200%_100%]" />
        <div className="mt-3 h-3 w-1/3 animate-shimmer rounded bg-gradient-to-r from-dark-card via-dark-border to-dark-card bg-[length:200%_100%]" />
        <div className="mt-2 h-1 w-full animate-shimmer rounded-full bg-gradient-to-r from-dark-card via-dark-border to-dark-card bg-[length:200%_100%]" />
      </div>
    </div>
  );
}
