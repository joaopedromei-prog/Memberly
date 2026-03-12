export default function LessonLoading() {
  return (
    <div className="mx-auto max-w-7xl py-4 lg:px-6">
      <div className="flex flex-col lg:flex-row lg:gap-6">
        {/* Main content skeleton */}
        <div className="w-full lg:w-[70%]">
          {/* Player skeleton */}
          <div className="aspect-video w-full animate-shimmer rounded-lg bg-gradient-to-r from-dark-card via-dark-border to-dark-card bg-[length:200%_100%]" />

          <div className="px-4 pb-8 sm:px-6 lg:px-0">
            {/* Breadcrumb skeleton */}
            <div className="mt-4 h-3 w-48 animate-shimmer rounded bg-gradient-to-r from-dark-card via-dark-border to-dark-card bg-[length:200%_100%]" />
            {/* Title skeleton */}
            <div className="mt-3 h-8 w-3/4 animate-shimmer rounded bg-gradient-to-r from-dark-card via-dark-border to-dark-card bg-[length:200%_100%]" />
            {/* Duration skeleton */}
            <div className="mt-2 h-4 w-16 animate-shimmer rounded bg-gradient-to-r from-dark-card via-dark-border to-dark-card bg-[length:200%_100%]" />
            {/* Description skeleton */}
            <div className="mt-3 h-4 w-full animate-shimmer rounded bg-gradient-to-r from-dark-card via-dark-border to-dark-card bg-[length:200%_100%]" />
            <div className="mt-1 h-4 w-5/6 animate-shimmer rounded bg-gradient-to-r from-dark-card via-dark-border to-dark-card bg-[length:200%_100%]" />
            {/* Buttons skeleton */}
            <div className="mt-4 flex gap-3">
              <div className="h-11 w-48 animate-shimmer rounded bg-gradient-to-r from-dark-card via-dark-border to-dark-card bg-[length:200%_100%]" />
              <div className="h-11 w-40 animate-shimmer rounded bg-gradient-to-r from-dark-card via-dark-border to-dark-card bg-[length:200%_100%]" />
            </div>
          </div>
        </div>

        {/* Sidebar skeleton */}
        <div className="w-full px-4 pb-8 sm:px-6 lg:w-[30%] lg:px-0">
          <div className="rounded-lg bg-dark-surface p-4">
            <div className="h-5 w-3/4 animate-shimmer rounded bg-gradient-to-r from-dark-card via-dark-border to-dark-card bg-[length:200%_100%]" />
            <div className="mt-2 h-3 w-1/3 animate-shimmer rounded bg-gradient-to-r from-dark-card via-dark-border to-dark-card bg-[length:200%_100%]" />
            <div className="mt-4 space-y-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="h-10 w-full animate-shimmer rounded bg-gradient-to-r from-dark-card via-dark-border to-dark-card bg-[length:200%_100%]"
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
