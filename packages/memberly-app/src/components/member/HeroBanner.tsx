'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import { Play } from 'lucide-react';

export interface HeroBannerItem {
  slug: string;
  title: string;
  description: string;
  bannerUrl: string | null;
  context?: string;
  lessonUrl?: string;
}

interface HeroBannerProps {
  items: HeroBannerItem[];
}

const HERO_GRADIENTS = [
  'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
  'linear-gradient(135deg, #1a2e1a 0%, #163e21 50%, #0f6034 100%)',
  'linear-gradient(135deg, #2e1a2e 0%, #3e163e 50%, #600f4a 100%)',
];

const staggerVariants = {
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.3 } },
  hidden: { transition: { staggerChildren: 0.05, staggerDirection: -1 as const } },
};

const slideUpVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' as const } },
};

export function HeroBanner({ items }: HeroBannerProps) {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const next = useCallback(() => {
    setCurrent((c) => (c + 1) % items.length);
  }, [items.length]);

  useEffect(() => {
    if (isPaused || items.length <= 1) return;
    intervalRef.current = setInterval(next, 6000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPaused, next, items.length]);

  if (items.length === 0) return null;

  const item = items[current];

  return (
    <section
      className="relative w-full h-[56vw] max-h-[70vh] min-h-[300px] overflow-hidden bg-dark-bg"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      aria-label="Banner em destaque"
    >
      <AnimatePresence>
        <motion.div
          key={current}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.02 }}
          transition={{ duration: 0.8, ease: 'easeInOut' }}
          className="absolute inset-0 w-full h-full"
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
            <div
              className="absolute inset-0"
              style={{ background: HERO_GRADIENTS[current % HERO_GRADIENTS.length] }}
            />
          )}
        </motion.div>
      </AnimatePresence>

      <div className="absolute inset-0 bg-gradient-to-t from-dark-bg via-dark-bg/60 to-transparent" />

      <div className="absolute bottom-0 left-0 w-full p-4 sm:p-6 lg:p-16 z-10 pb-12 sm:pb-16 lg:pb-24">
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={staggerVariants}
            className="max-w-2xl"
          >
            <motion.h1
              variants={slideUpVariants}
              className="text-[28px] md:text-[48px] font-bold text-white leading-tight drop-shadow-lg mb-3"
            >
              {item.title}
            </motion.h1>
            <motion.p
              variants={slideUpVariants}
              className="text-sm md:text-base text-neutral-300 max-w-xl line-clamp-2 mb-6 drop-shadow-md"
            >
              {item.description}
            </motion.p>
            <motion.div variants={slideUpVariants}>
              <Link
                href={item.lessonUrl || `/products/${item.slug}`}
                className="inline-flex w-full sm:w-auto items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-white font-semibold rounded px-6 h-11 min-w-[44px] transition-colors"
              >
                <Play size={20} fill="currentColor" />
                Continuar Assistindo
              </Link>
              {item.context && (
                <p className="text-xs text-neutral-400 mt-3">{item.context}</p>
              )}
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>

      {items.length > 1 && (
        <div className="absolute bottom-4 sm:bottom-6 lg:bottom-16 right-4 sm:right-6 lg:right-16 flex gap-2 z-10">
          {items.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrent(idx)}
              className="h-2 rounded-full transition-all duration-300 cursor-pointer min-w-[24px] min-h-[24px] flex items-center justify-center"
              aria-label={`Ir para banner ${idx + 1}`}
            >
              <div
                className={`h-2 rounded-full transition-all duration-300 ${
                  idx === current
                    ? 'w-6 bg-white'
                    : 'w-2 bg-white/40 hover:bg-white/60'
                }`}
              />
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
