'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { cn } from '@/lib/utils/cn';

interface ProductCardProps {
  slug: string;
  title: string;
  bannerUrl: string | null;
  progress: number;
}

export function ProductCard({ slug, title, bannerUrl, progress }: ProductCardProps) {
  const isComplete = progress === 100;

  return (
    <Link
      href={`/products/${slug}`}
      className="group block w-[250px] flex-shrink-0 snap-start sm:w-[300px] lg:w-[350px]"
    >
      <div className="relative aspect-video overflow-hidden rounded bg-dark-card transition-transform duration-150 ease-out group-hover:scale-105 group-hover:shadow-lg">
        {bannerUrl ? (
          <Image
            src={bannerUrl}
            alt={title}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 250px, (max-width: 1024px) 300px, 350px"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-neutral-500">
            <span className="text-3xl">🎬</span>
          </div>
        )}
        {isComplete && (
          <div className="absolute right-2 top-2 rounded bg-[#46D369] px-2 py-0.5 text-xs font-semibold text-black">
            ✓ 100%
          </div>
        )}
      </div>
      <p className={cn('mt-2 line-clamp-2 text-sm text-neutral-300', 'group-hover:text-white')}>
        {title}
      </p>
      <ProgressBar value={progress} showLabel className="mt-1" />
    </Link>
  );
}
