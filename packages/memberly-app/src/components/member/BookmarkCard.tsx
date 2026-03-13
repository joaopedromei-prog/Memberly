'use client';

import Link from 'next/link';
import { Play } from 'lucide-react';

interface BookmarkCardProps {
  lessonId: string;
  lessonTitle: string;
  moduleTitle: string;
  productTitle: string;
  productSlug: string;
  durationMinutes: number | null;
}

const CARD_GRADIENTS = [
  'linear-gradient(135deg, #1a1a2e 0%, #0f3460 100%)',
  'linear-gradient(135deg, #1a2e1a 0%, #0f6034 100%)',
  'linear-gradient(135deg, #2e1a2e 0%, #600f4a 100%)',
  'linear-gradient(135deg, #2e2e1a 0%, #604a0f 100%)',
  'linear-gradient(135deg, #1a2e2e 0%, #0f4a60 100%)',
];

function gradientFromTitle(title: string) {
  let hash = 0;
  for (let i = 0; i < title.length; i++) {
    hash = title.charCodeAt(i) + ((hash << 5) - hash);
  }
  return CARD_GRADIENTS[Math.abs(hash) % CARD_GRADIENTS.length];
}

export function BookmarkCard({
  lessonId,
  lessonTitle,
  moduleTitle,
  productTitle,
  productSlug,
  durationMinutes,
}: BookmarkCardProps) {
  return (
    <Link
      href={`/products/${productSlug}/lessons/${lessonId}`}
      className="group/card block w-[240px] sm:w-[280px] flex-shrink-0 snap-start cursor-pointer"
    >
      <div className="relative aspect-video rounded-lg overflow-hidden bg-dark-card transition-all duration-200 ease-out group-hover/card:scale-105 group-hover/card:shadow-2xl group-hover/card:z-10">
        <div
          className="absolute inset-0 transition-all duration-200 group-hover/card:brightness-110"
          style={{ background: gradientFromTitle(lessonTitle) }}
        />
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/card:opacity-100 transition-opacity duration-200 flex items-center justify-center">
          <div className="w-12 h-12 rounded-full border-2 border-white flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <Play size={24} className="text-white ml-1" fill="currentColor" />
          </div>
        </div>
      </div>
      <div className="mt-3 transition-transform duration-200 group-hover/card:translate-y-1">
        <h3 className="text-sm font-medium text-neutral-300 line-clamp-1">{lessonTitle}</h3>
        <p className="text-xs text-neutral-500 line-clamp-1 mt-0.5">{productTitle} · {moduleTitle}</p>
        {durationMinutes && (
          <p className="text-xs text-neutral-600 mt-0.5">{durationMinutes} min</p>
        )}
      </div>
    </Link>
  );
}
