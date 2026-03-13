'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Play } from 'lucide-react';
import { getRelativeTime } from '@/lib/utils/relative-time';
import { CONTINUE_WATCHING_GRADIENTS } from '@/lib/constants/gradients';

interface ContinueWatchingCardProps {
  productSlug: string;
  productTitle: string;
  productBannerUrl: string | null;
  targetLessonId: string;
  targetLessonTitle: string;
  moduleName: string;
  lastWatchedAt: string | null;
  isContinue: boolean;
  progressPercent: number;
}

function gradientFromTitle(title: string) {
  let hash = 0;
  for (let i = 0; i < title.length; i++) {
    hash = title.charCodeAt(i) + ((hash << 5) - hash);
  }
  return CONTINUE_WATCHING_GRADIENTS[Math.abs(hash) % CONTINUE_WATCHING_GRADIENTS.length];
}

export function ContinueWatchingCard({
  productSlug,
  productTitle,
  productBannerUrl,
  targetLessonId,
  targetLessonTitle,
  moduleName,
  lastWatchedAt,
  isContinue,
  progressPercent,
}: ContinueWatchingCardProps) {
  const label = isContinue
    ? `Continue: ${targetLessonTitle}`
    : `Próxima: ${targetLessonTitle}`;

  const clamped = Math.min(100, Math.max(0, progressPercent));

  return (
    <Link
      href={`/products/${productSlug}/lessons/${targetLessonId}`}
      className="group/card block w-[250px] sm:w-[300px] md:w-[340px] flex-shrink-0 snap-start cursor-pointer"
    >
      <div className="relative aspect-video rounded-lg overflow-hidden bg-dark-card transition-all duration-200 ease-out group-hover/card:scale-105 group-hover/card:shadow-2xl group-hover/card:z-10">
        {productBannerUrl ? (
          <Image
            src={productBannerUrl}
            alt={productTitle}
            fill
            className="object-cover transition-all duration-200 group-hover/card:brightness-110"
            sizes="(max-width: 640px) 250px, (max-width: 768px) 300px, 340px"
          />
        ) : (
          <div
            className="absolute inset-0 transition-all duration-200 group-hover/card:brightness-110"
            style={{ background: gradientFromTitle(productTitle) }}
          />
        )}

        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/card:opacity-100 transition-opacity duration-200 flex items-center justify-center">
          <div className="w-12 h-12 rounded-full border-2 border-white flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <Play size={24} className="text-white ml-1" fill="currentColor" />
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0">
          <div className="h-1 bg-dark-border">
            <div
              className="h-full bg-primary rounded-full transition-all duration-700 ease-out"
              style={{ width: `${clamped}%` }}
            />
          </div>
        </div>
      </div>

      <div className="mt-3 transition-transform duration-200 group-hover/card:translate-y-1">
        <h3 className="text-sm font-medium text-neutral-300 line-clamp-1">{productTitle}</h3>
        <p className="text-xs text-neutral-500 line-clamp-1 mt-0.5">{label}</p>
        <p className="text-xs text-neutral-600 mt-0.5">
          {moduleName}
          {lastWatchedAt && ` · ${getRelativeTime(lastWatchedAt)}`}
        </p>
      </div>
    </Link>
  );
}
