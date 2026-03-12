'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface ProductHeroProps {
  title: string;
  description: string;
  bannerUrl: string | null;
  totalModules: number;
  totalLessons: number;
  nextLessonUrl: string | null;
}

export function ProductHero({
  title,
  description,
  bannerUrl,
  totalModules,
  totalLessons,
  nextLessonUrl,
}: ProductHeroProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <section className="relative">
      {/* Banner */}
      <div className="relative aspect-[21/9] w-full overflow-hidden sm:aspect-[3/1]">
        {bannerUrl ? (
          <Image
            src={bannerUrl}
            alt={`Banner do produto ${title}`}
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-dark-card">
            <span className="text-6xl">🎬</span>
          </div>
        )}
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-dark-bg via-dark-bg/60 to-transparent" />
      </div>

      {/* Content overlay */}
      <div className="relative -mt-32 px-4 sm:-mt-40 sm:px-6 lg:px-16">
        <div className="mx-auto max-w-7xl">
          <h1 className="text-2xl font-bold text-white sm:text-3xl lg:text-4xl">
            {title}
          </h1>
          <p className="mt-2 text-sm text-neutral-400">
            {totalModules} módulos · {totalLessons} aulas
          </p>

          {/* Description with expand/collapse */}
          {description && (
            <div className="mt-3">
              <p
                className={`text-sm leading-relaxed text-neutral-300 transition-all duration-200 ease-out ${
                  expanded ? '' : 'line-clamp-3'
                }`}
              >
                {description}
              </p>
              {description.length > 150 && (
                <button
                  onClick={() => setExpanded(!expanded)}
                  className="mt-1 text-sm font-medium text-primary hover:text-primary-hover"
                >
                  {expanded ? 'ver menos' : 'ver mais'}
                </button>
              )}
            </div>
          )}

          {/* Continue button */}
          {nextLessonUrl && (
            <Link
              href={nextLessonUrl}
              className="mt-4 inline-flex min-h-[44px] items-center rounded bg-primary px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-hover"
            >
              Continuar de onde parei
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
