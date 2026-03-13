'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, useReducedMotion } from 'motion/react';

interface ProductHeroProps {
  title: string;
  description: string;
  bannerUrl: string | null;
  totalModules: number;
  totalLessons: number;
  nextLessonUrl: string | null;
  completedLessons?: number;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: 'easeOut' as const },
  },
};

export function ProductHero({
  title,
  description,
  bannerUrl,
  totalModules,
  totalLessons,
  nextLessonUrl,
  completedLessons = 0,
}: ProductHeroProps) {
  const [expanded, setExpanded] = useState(false);
  const shouldReduceMotion = useReducedMotion();
  const progress =
    totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  return (
    <section className="relative">
      {/* Banner */}
      <div className="relative aspect-[3/2] md:aspect-[16/9] xl:aspect-[21/9] w-full overflow-hidden bg-dark-bg">
        {bannerUrl ? (
          <motion.div
            className="absolute inset-0"
            animate={
              shouldReduceMotion ? { scale: 1 } : { scale: [1, 1.03, 1] }
            }
            transition={{
              duration: 15,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            <Image
              src={bannerUrl}
              alt={`Banner do produto ${title}`}
              fill
              className="object-cover"
              priority
              sizes="100vw"
            />
          </motion.div>
        ) : (
          <motion.div
            className="absolute inset-0 bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460]"
            animate={
              shouldReduceMotion ? { scale: 1 } : { scale: [1, 1.03, 1] }
            }
            transition={{
              duration: 15,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            <div className="flex h-full items-center justify-center">
              <span className="text-6xl">🎬</span>
            </div>
          </motion.div>
        )}
        {/* Gradient overlay */}
        <div className="absolute inset-x-0 bottom-0 h-[60%] bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/60 to-transparent" />
      </div>

      {/* Content overlay */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 -mt-24 md:-mt-36 px-4 sm:px-6 lg:px-16"
      >
        <div className="mx-auto max-w-7xl">
          <motion.h1
            variants={itemVariants}
            className="text-[28px] xl:text-[40px] font-bold text-white leading-tight"
          >
            {title}
          </motion.h1>

          <motion.div
            variants={itemVariants}
            className="flex items-center gap-2 sm:gap-4 mt-2 flex-wrap"
          >
            <span className="text-[14px] text-[#B3B3B3]">
              {totalModules} módulos · {totalLessons} aulas
            </span>
            {completedLessons > 0 && (
              <>
                <span className="text-[14px] text-[#737373]">·</span>
                <span className="text-[14px] text-[#46D369] font-medium">
                  {progress}% concluído
                </span>
                <div className="hidden sm:block w-24 h-1.5 rounded-full bg-dark-card overflow-hidden ml-2">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{
                      duration: 0.8,
                      delay: shouldReduceMotion ? 0 : 0.8,
                      ease: 'easeOut',
                    }}
                    className="h-full bg-[#46D369]"
                  />
                </div>
              </>
            )}
          </motion.div>

          {/* Description with expand/collapse */}
          {description && (
            <motion.div variants={itemVariants} className="mt-4 max-w-2xl">
              <p
                className={`text-[14px] text-[#B3B3B3] leading-relaxed transition-all duration-200 ease-out ${
                  expanded ? '' : 'line-clamp-2'
                }`}
              >
                {description}
              </p>
              {description.length > 150 && (
                <button
                  onClick={() => setExpanded(!expanded)}
                  className="text-[12px] text-primary hover:text-primary-hover transition-colors font-medium py-2 -my-2 mt-1 inline-block min-h-[44px]"
                >
                  {expanded ? 'ver menos' : 'ver mais'}
                </button>
              )}
            </motion.div>
          )}

          {/* Continue button */}
          {nextLessonUrl && (
            <motion.div variants={itemVariants} className="mt-6">
              <Link
                href={nextLessonUrl}
                className="bg-primary hover:bg-primary-hover text-white font-semibold rounded-lg px-6 h-11 w-full sm:w-auto transition-all duration-200 hover:-translate-y-[1px] hover:shadow-lg hover:shadow-primary/20 inline-flex items-center justify-center min-h-[44px]"
              >
                Continuar de onde parei
              </Link>
            </motion.div>
          )}
        </div>
      </motion.div>
    </section>
  );
}
