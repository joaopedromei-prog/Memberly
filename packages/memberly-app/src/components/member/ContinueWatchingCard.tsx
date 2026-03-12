'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ProgressBar } from '@/components/ui/ProgressBar';

interface ContinueWatchingCardProps {
  productSlug: string;
  productTitle: string;
  productBannerUrl: string | null;
  nextLessonId: string;
  nextLessonTitle: string;
  progressPercent: number;
}

export function ContinueWatchingCard({
  productSlug,
  productTitle,
  productBannerUrl,
  nextLessonId,
  nextLessonTitle,
  progressPercent,
}: ContinueWatchingCardProps) {
  return (
    <Link
      href={`/products/${productSlug}/lessons/${nextLessonId}`}
      className="group flex w-[350px] flex-shrink-0 snap-start gap-3 rounded-lg bg-dark-surface p-3 transition-transform duration-150 ease-out hover:scale-105 hover:shadow-lg sm:w-[400px]"
    >
      <div className="relative h-20 w-32 flex-shrink-0 overflow-hidden rounded">
        {productBannerUrl ? (
          <Image
            src={productBannerUrl}
            alt={productTitle}
            fill
            className="object-cover"
            sizes="128px"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-dark-card text-neutral-500">
            <span className="text-xl">🎬</span>
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col justify-center">
        <p className="text-sm font-medium text-white group-hover:text-primary">
          {productTitle}
        </p>
        <p className="mt-0.5 line-clamp-1 text-xs text-neutral-400">
          {nextLessonTitle}
        </p>
        <ProgressBar value={progressPercent} showLabel className="mt-2" />
      </div>
    </Link>
  );
}
