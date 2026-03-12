'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';

export interface HeroBannerItem {
  slug: string;
  title: string;
  description: string;
  bannerUrl: string | null;
}

interface HeroBannerProps {
  items: HeroBannerItem[];
}

export function HeroBanner({ items }: HeroBannerProps) {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const next = useCallback(() => {
    setCurrent((c) => (c + 1) % items.length);
  }, [items.length]);

  useEffect(() => {
    if (prefersReducedMotion || isPaused || items.length <= 1) return;

    intervalRef.current = setInterval(next, 6000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPaused, next, prefersReducedMotion, items.length]);

  if (items.length === 0) return null;

  const item = items[current];

  return (
    <section
      className="relative h-[56vw] max-h-[70vh] min-h-[250px] w-full sm:aspect-video sm:h-auto"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      aria-label="Banner em destaque"
    >
      {item.bannerUrl ? (
        <Image
          src={item.bannerUrl}
          alt={item.title}
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
      ) : (
        <div className="absolute inset-0 bg-dark-surface" />
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-dark-bg via-dark-bg/60 to-transparent" />

      <div className="absolute bottom-0 left-0 w-full p-4 sm:p-6 lg:p-16">
        <h1 className="text-2xl font-bold text-white md:text-4xl lg:text-5xl">
          {item.title}
        </h1>
        <p className="mt-2 line-clamp-2 max-w-xl text-sm text-neutral-300 md:text-base">
          {item.description}
        </p>
        <Link
          href={`/products/${item.slug}`}
          className="mt-4 inline-flex min-h-[44px] items-center rounded bg-primary px-6 text-sm font-semibold text-white transition-colors hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary"
        >
          Continuar Assistindo
        </Link>
      </div>

      {items.length > 1 && (
        <div className="absolute bottom-4 right-4 flex gap-2 sm:right-6 lg:right-16">
          {items.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              aria-label={`Ir para banner ${i + 1}`}
              className={`h-2 w-2 min-h-[44px] min-w-[44px] flex items-center justify-center sm:min-h-0 sm:min-w-0 sm:h-2 sm:w-2 rounded-full transition-colors ${
                i === current ? 'bg-white' : 'bg-white/40'
              }`}
            >
              <span className="block h-2 w-2 rounded-full sm:hidden" style={{ background: i === current ? 'white' : 'rgba(255,255,255,0.4)' }} />
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
