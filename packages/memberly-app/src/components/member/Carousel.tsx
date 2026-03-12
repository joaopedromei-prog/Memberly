'use client';

import { useRef, useState, useCallback, type ReactNode } from 'react';

interface CarouselProps {
  title: string;
  children: ReactNode;
}

export function Carousel({ title, children }: CarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const updateScrollState = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
  }, []);

  function scroll(direction: 'left' | 'right') {
    const el = scrollRef.current;
    if (!el) return;
    const amount = el.clientWidth * 0.8;
    el.scrollBy({
      left: direction === 'left' ? -amount : amount,
      behavior: 'smooth',
    });
  }

  return (
    <section role="region" aria-label={title} className="py-4">
      <h2 className="mb-3 text-lg font-semibold text-white md:text-xl">
        {title}
      </h2>
      <div className="group/carousel relative">
        {canScrollLeft && (
          <button
            onClick={() => scroll('left')}
            aria-label={`Scroll ${title} para esquerda`}
            className="absolute -left-2 top-1/2 z-10 hidden min-h-[44px] min-w-[44px] -translate-y-1/2 items-center justify-center rounded-full bg-black/70 text-white opacity-0 transition-opacity group-hover/carousel:opacity-100 md:flex"
          >
            ‹
          </button>
        )}

        <div
          ref={scrollRef}
          onScroll={updateScrollState}
          className="scrollbar-hide flex gap-3 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-4"
        >
          {children}
        </div>

        {canScrollRight && (
          <button
            onClick={() => scroll('right')}
            aria-label={`Scroll ${title} para direita`}
            className="absolute -right-2 top-1/2 z-10 hidden min-h-[44px] min-w-[44px] -translate-y-1/2 items-center justify-center rounded-full bg-black/70 text-white opacity-0 transition-opacity group-hover/carousel:opacity-100 md:flex"
          >
            ›
          </button>
        )}
      </div>
    </section>
  );
}
