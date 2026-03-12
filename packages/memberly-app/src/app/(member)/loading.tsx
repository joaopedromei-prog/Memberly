import { HeroBannerSkeleton } from '@/components/member/HeroBannerSkeleton';
import { ProductCardSkeleton } from '@/components/member/ProductCardSkeleton';

export default function MemberLoading() {
  return (
    <div className="min-h-screen bg-dark-bg">
      <HeroBannerSkeleton />
      <div className="space-y-8 px-4 pt-4 sm:px-6 lg:px-16">
        <div>
          <div className="mb-3 h-6 w-48 animate-shimmer rounded bg-dark-card bg-[length:200%_100%] bg-[linear-gradient(90deg,_var(--color-dark-card)_25%,_var(--color-dark-surface)_50%,_var(--color-dark-card)_75%)]" />
          <div className="flex gap-3">
            {Array.from({ length: 5 }, (_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        </div>
        <div>
          <div className="mb-3 h-6 w-36 animate-shimmer rounded bg-dark-card bg-[length:200%_100%] bg-[linear-gradient(90deg,_var(--color-dark-card)_25%,_var(--color-dark-surface)_50%,_var(--color-dark-card)_75%)]" />
          <div className="flex gap-3">
            {Array.from({ length: 5 }, (_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
