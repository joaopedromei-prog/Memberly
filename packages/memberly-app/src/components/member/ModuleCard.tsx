'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ProgressBar } from '@/components/ui/ProgressBar';

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
  moduleId,
  productSlug,
  title,
  description,
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
        className="group flex flex-col overflow-hidden rounded-lg border border-transparent bg-dark-surface transition-all duration-150 ease-out hover:border-dark-border hover:bg-dark-card hover:shadow-lg sm:flex-row"
      >
        {/* Banner */}
        <div className="relative aspect-video w-full flex-shrink-0 sm:aspect-video sm:w-[150px] lg:w-[200px]">
          {bannerUrl ? (
            <Image
              src={bannerUrl}
              alt={`Banner do módulo ${title}`}
              fill
              className="object-cover"
              sizes="(max-width: 639px) 100vw, (max-width: 1023px) 150px, 200px"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-dark-card text-neutral-500">
              <span className="text-2xl">📚</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex min-w-0 flex-1 flex-col justify-center p-4">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-lg font-semibold text-white lg:text-xl">
              {title}
            </h3>
            {isComplete && (
              <span className="flex-shrink-0 rounded bg-[#46D369] px-2 py-0.5 text-xs font-semibold text-black">
                ✓ Concluído
              </span>
            )}
          </div>
          {description && (
            <p className="mt-1 line-clamp-2 text-sm text-neutral-400">
              {description}
            </p>
          )}
          <p className="mt-2 text-xs text-neutral-500">
            {totalLessons} aulas · {completedLessons}/{totalLessons} concluídas
          </p>
          <ProgressBar value={progress} className="mt-2" />
        </div>
      </article>
    </Link>
  );
}
