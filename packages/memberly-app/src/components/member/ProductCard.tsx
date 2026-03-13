'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Play, Check } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { BANNER_FALLBACK_GRADIENTS } from '@/lib/constants/gradients';

interface ProductCardProps {
  slug: string;
  title: string;
  bannerUrl: string | null;
  progress: number;
}

function gradientFromTitle(title: string) {
  let hash = 0;
  for (let i = 0; i < title.length; i++) {
    hash = title.charCodeAt(i) + ((hash << 5) - hash);
  }
  return BANNER_FALLBACK_GRADIENTS[Math.abs(hash) % BANNER_FALLBACK_GRADIENTS.length];
}

export function ProductCard({ slug, title, bannerUrl, progress }: ProductCardProps) {
  const isComplete = progress === 100;
  const clamped = Math.min(100, Math.max(0, progress));

  return (
    <Link
      href={`/products/${slug}`}
      className="group/card block w-[250px] flex-shrink-0 snap-start sm:w-[300px] lg:w-[350px]"
    >
      <div className="relative aspect-video overflow-hidden rounded-lg bg-dark-card transition-all duration-200 ease-out group-hover/card:scale-105 group-hover/card:shadow-2xl group-hover/card:z-10">
        {bannerUrl ? (
          <Image
            src={bannerUrl}
            alt={title}
            fill
            className="object-cover transition-all duration-200 group-hover/card:brightness-110"
            sizes="(max-width: 640px) 250px, (max-width: 1024px) 300px, 350px"
          />
        ) : (
          <div
            className="absolute inset-0 transition-all duration-200 group-hover/card:brightness-110"
            style={{ background: gradientFromTitle(title) }}
          />
        )}

        {isComplete && (
          <div className="absolute top-2 right-2 bg-[#46D369] text-black text-[10px] sm:text-xs font-semibold rounded px-2 py-0.5 flex items-center gap-1 shadow-md">
            <Check size={12} strokeWidth={3} /> 100%
          </div>
        )}

        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/card:opacity-100 transition-opacity duration-200 flex items-center justify-center">
          <div className="w-12 h-12 rounded-full border-2 border-white flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <Play size={24} className="text-white ml-1" fill="currentColor" />
          </div>
        </div>
      </div>

      <div className="mt-3 transition-transform duration-200 group-hover/card:translate-y-1">
        <p className={cn('text-sm font-medium text-neutral-300 line-clamp-2', 'group-hover/card:text-white')}>
          {title}
        </p>
        <div className="mt-2 h-1 bg-dark-border rounded-full overflow-hidden">
          <div
            className={cn(
              'h-full rounded-full transition-all duration-700 ease-out',
              isComplete ? 'bg-[#46D369]' : 'bg-primary'
            )}
            style={{ width: `${clamped}%` }}
          />
        </div>
        <p className="text-xs text-neutral-500 mt-1">{clamped}% concluído</p>
      </div>
    </Link>
  );
}
