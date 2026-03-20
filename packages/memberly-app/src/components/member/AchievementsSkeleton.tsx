import { Skeleton } from '@/components/ui/Skeleton';

export function AchievementsSkeleton() {
  return (
    <section className="px-4 sm:px-8 lg:px-12">
      <Skeleton variant="text" className="mb-4 h-7 w-40" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-dark-border bg-dark-card p-4"
          >
            <Skeleton
              className="mx-auto mb-3 h-16 w-16 rounded-full"
            />
            <Skeleton variant="text" className="mx-auto h-4 w-24" />
            <Skeleton variant="text" className="mx-auto mt-2 h-3 w-32" />
          </div>
        ))}
      </div>
    </section>
  );
}
