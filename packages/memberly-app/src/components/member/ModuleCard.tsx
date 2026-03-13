'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, useReducedMotion } from 'motion/react';
import { Check, Lock } from 'lucide-react';
import { DripCountdownToast } from '@/components/member/DripCountdownToast';
import { MODULE_CARD_GRADIENTS } from '@/lib/constants/gradients';

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' as const },
  },
};

interface ModuleCardProps {
  moduleId: string;
  productSlug: string;
  title: string;
  description: string;
  bannerUrl: string | null;
  totalLessons: number;
  completedLessons: number;
  nextLessonUrl: string | null;
  isLocked?: boolean;
  grantedAt?: string | null;
  effectiveDripDays?: number;
  index?: number;
}

export function ModuleCard({
  productSlug,
  title,
  bannerUrl,
  totalLessons,
  completedLessons,
  nextLessonUrl,
  isLocked,
  grantedAt,
  effectiveDripDays,
  index = 0,
}: ModuleCardProps) {
  const [showDripToast, setShowDripToast] = useState(false);
  const shouldReduceMotion = useReducedMotion();
  const progress =
    totalLessons > 0
      ? Math.round((completedLessons / totalLessons) * 100)
      : 0;
  const isComplete = progress === 100;
  const href = nextLessonUrl || `/products/${productSlug}`;
  const gradient = MODULE_CARD_GRADIENTS[index % MODULE_CARD_GRADIENTS.length];

  function handleLockedClick(e: React.MouseEvent) {
    e.preventDefault();
    setShowDripToast(true);
  }

  const card = (
    <motion.article
      variants={cardVariants}
      aria-label={`Módulo: ${title} — ${completedLessons}/${totalLessons} aulas concluídas${isLocked ? ' (bloqueado)' : ''}`}
      className={`aspect-[5/7] rounded-xl overflow-hidden relative transition-all duration-300 ${
        isLocked
          ? 'cursor-not-allowed opacity-50'
          : `cursor-pointer group ${!shouldReduceMotion ? 'hover:scale-105' : ''} hover:shadow-2xl hover:ring-1 hover:ring-white/15`
      }`}
    >
      {/* Background */}
      {bannerUrl ? (
        <Image
          src={bannerUrl}
          alt={`Banner do módulo ${title}`}
          fill
          className="object-cover"
          sizes="(max-width: 639px) 100vw, (max-width: 767px) 50vw, (max-width: 1279px) 33vw, 25vw"
        />
      ) : (
        <div
          className={`absolute inset-0 bg-gradient-to-br ${isLocked ? 'from-[#1f1f1f] to-[#0a0a0a]' : gradient}`}
        />
      )}

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

      {/* Completed badge */}
      {isComplete && !isLocked && (
        <div className="absolute top-3 right-3 bg-[#46D369] text-[#0A0A0A] text-xs font-semibold rounded-md px-2.5 py-1 flex items-center gap-1 z-20">
          <Check className="w-3 h-3" /> Concluído
        </div>
      )}

      {/* Lock icon */}
      {isLocked && (
        <div className="absolute top-3 right-3 z-20">
          <Lock className="w-6 h-6 text-[#F59E0B]" />
        </div>
      )}

      {/* Title + progress at bottom */}
      <div className="absolute bottom-0 p-4 w-full z-20">
        <h3 className="text-[18px] font-bold text-white drop-shadow-md leading-tight">
          {title}
        </h3>
        {!isLocked && (
          <>
            <p className="text-[12px] text-[#B3B3B3] mt-1.5">
              {completedLessons}/{totalLessons} aulas
            </p>
            {totalLessons > 0 && (
              <div className="h-1 w-full rounded-full bg-white/20 mt-2.5 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: `${progress}%` }}
                  viewport={{ once: true }}
                  transition={{
                    duration: 0.8,
                    delay: shouldReduceMotion ? 0 : 0.5,
                    ease: 'easeOut',
                  }}
                  className="h-full bg-[#46D369]"
                />
              </div>
            )}
          </>
        )}
      </div>
    </motion.article>
  );

  return (
    <>
      {isLocked ? (
        <div onClick={handleLockedClick}>{card}</div>
      ) : (
        <Link href={href}>{card}</Link>
      )}
      {showDripToast && grantedAt && effectiveDripDays && (
        <DripCountdownToast
          grantedAt={grantedAt}
          dripDays={effectiveDripDays}
          onClose={() => setShowDripToast(false)}
        />
      )}
    </>
  );
}
