'use client';

import { useRef, useState, useCallback, type ReactNode } from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CarouselProps {
  title: string;
  icon?: ReactNode;
  children: ReactNode;
}

export function Carousel({ title, icon, children }: CarouselProps) {
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
    <motion.section
      role="region"
      aria-label={title}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="py-6 group relative"
    >
      <div className="px-4 sm:px-6 lg:px-16 mb-3 flex items-center gap-2">
        <h2 className="text-xl font-semibold text-white">{title}</h2>
        {icon}
      </div>

      <div className="relative">
        {canScrollLeft && (
          <button
            onClick={() => scroll('left')}
            aria-label={`Scroll ${title} para esquerda`}
            className="absolute left-4 sm:left-6 lg:left-16 top-1/2 -translate-y-1/2 w-11 h-11 bg-black/70 rounded-full text-white backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-20 hidden md:flex cursor-pointer hover:bg-black/90 hover:scale-110"
          >
            <ChevronLeft size={24} />
          </button>
        )}

        <div
          ref={scrollRef}
          onScroll={updateScrollState}
          className="scrollbar-hide flex gap-3 overflow-x-auto snap-x snap-mandatory pl-4 sm:pl-6 lg:pl-16 pb-8 pt-4 -mt-4"
        >
          {children}
          <div className="min-w-4 sm:min-w-6 lg:min-w-16 flex-shrink-0" aria-hidden="true" />
        </div>

        {canScrollRight && (
          <button
            onClick={() => scroll('right')}
            aria-label={`Scroll ${title} para direita`}
            className="absolute right-4 sm:right-6 lg:right-16 top-1/2 -translate-y-1/2 w-11 h-11 bg-black/70 rounded-full text-white backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-20 hidden md:flex cursor-pointer hover:bg-black/90 hover:scale-110"
          >
            <ChevronRight size={24} />
          </button>
        )}
      </div>
    </motion.section>
  );
}
