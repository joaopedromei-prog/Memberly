'use client';

import Image from 'next/image';
import Link from 'next/link';

interface ModuleCardProps {
  moduleId: string;
  productSlug: string;
  title: string;
  description: string;
  bannerUrl: string | null;
  totalLessons: number;
  completedLessons: number;
  nextLessonUrl: string | null;
}

export function ModuleCard({
  productSlug,
  title,
  bannerUrl,
  totalLessons,
  completedLessons,
  nextLessonUrl,
}: ModuleCardProps) {
  const progress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
  const isComplete = progress === 100;
  const href = nextLessonUrl || `/products/${productSlug}`;

  return (
    <Link href={href}>
      <article
        aria-label={`Módulo: ${title} — ${completedLessons}/${totalLessons} aulas concluídas`}
        className="group relative aspect-[5/7] overflow-hidden rounded-lg transition-transform duration-300 hover:scale-105 hover:ring-1 hover:ring-white/20"
      >
        {/* Banner Image */}
        {bannerUrl ? (
          <Image
            src={bannerUrl}
            alt={`Banner do módulo ${title}`}
            fill
            className="object-cover"
            sizes="(max-width: 639px) 100vw, (max-width: 767px) 50vw, (max-width: 1279px) 33vw, 25vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-neutral-800 to-neutral-900">
            <span className="text-center text-lg font-bold text-neutral-400">{title}</span>
          </div>
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        {/* Completed badge */}
        {isComplete && (
          <div className="absolute right-2 top-2">
            <span className="rounded bg-[#46D369] px-2 py-0.5 text-xs font-semibold text-black">
              ✓ Concluído
            </span>
          </div>
        )}

        {/* Title + progress at bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h3 className="text-lg font-bold text-white drop-shadow-md">
            {title}
          </h3>
          <p className="mt-1 text-xs text-neutral-300">
            {completedLessons}/{totalLessons} aulas
          </p>
          {/* Thin progress bar */}
          {totalLessons > 0 && (
            <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-white/20">
              <div
                className="h-full rounded-full bg-[#46D369] transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}
        </div>
      </article>
    </Link>
  );
}
