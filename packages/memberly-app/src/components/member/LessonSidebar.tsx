'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import { Check, Circle, Play, Lock, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export interface SidebarLesson {
  id: string;
  title: string;
  durationMinutes: number | null;
  completed: boolean;
  isLocked?: boolean;
}

interface LessonSidebarProps {
  moduleName: string;
  productSlug: string;
  lessons: SidebarLesson[];
  currentLessonId: string;
  completedCount: number;
}

export function LessonSidebar({
  moduleName,
  productSlug,
  lessons,
  currentLessonId,
  completedCount,
}: LessonSidebarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const progressPercent =
    lessons.length > 0 ? Math.round((completedCount / lessons.length) * 100) : 0;

  const listContent = (
    <div className="py-2">
      {lessons.map((lesson, index) => {
        const isCurrent = lesson.id === currentLessonId;
        const locked = lesson.isLocked && !isCurrent;

        if (locked) {
          return (
            <div
              key={lesson.id}
              className="relative flex min-h-[44px] cursor-not-allowed items-center gap-3 px-4 py-3 text-sm text-neutral-600"
            >
              <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center">
                <Lock className="h-4 w-4 text-[#F59E0B]" />
              </span>
              <span className="flex-1 truncate">
                <span className="text-neutral-700">{index + 1}. </span>
                {lesson.title}
              </span>
              {lesson.durationMinutes && (
                <span className="flex-shrink-0 text-xs text-neutral-500">
                  {lesson.durationMinutes} min
                </span>
              )}
            </div>
          );
        }

        return (
          <Link
            key={lesson.id}
            href={`/products/${productSlug}/lessons/${lesson.id}`}
            aria-current={isCurrent ? 'page' : undefined}
            className={cn(
              'relative flex min-h-[44px] items-center gap-3 px-4 py-3 text-sm transition-colors duration-150',
              isCurrent
                ? 'bg-[#2A2A2A] text-white'
                : 'text-neutral-400 hover:bg-[#1A1A1A] hover:text-neutral-200'
            )}
          >
            {/* Active indicator line */}
            {isCurrent && (
              <motion.div
                layoutId="activeLesson"
                className="absolute bottom-0 left-0 top-0 w-[2px] bg-[#E50914]"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
              />
            )}

            <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center">
              {isCurrent ? (
                <Play className="h-4 w-4 fill-[#E50914] text-[#E50914]" />
              ) : lesson.completed ? (
                <Check className="h-4 w-4 text-[#46D369]" />
              ) : (
                <Circle className="h-4 w-4 text-neutral-600" />
              )}
            </span>

            <span className="flex-1 truncate">
              <span className={isCurrent ? 'text-white' : 'text-neutral-500'}>
                {index + 1}.
              </span>{' '}
              {lesson.title}
            </span>

            {lesson.durationMinutes && (
              <span className="flex-shrink-0 text-xs text-neutral-500">
                {lesson.durationMinutes} min
              </span>
            )}
          </Link>
        );
      })}
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <motion.nav
        aria-label="Aulas do módulo"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="hidden flex-col rounded-lg bg-[#1A1A1A] lg:flex"
      >
        <div className="shrink-0 border-b border-[#333333] p-4">
          <h3 className="text-lg font-semibold text-white">{moduleName}</h3>
          <div className="mt-1 text-xs text-neutral-400">
            {completedCount}/{lessons.length} aulas concluídas
          </div>
          <div className="mt-3 h-1 overflow-hidden rounded-full bg-[#2A2A2A]">
            <div
              className="h-full bg-[#46D369] transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
        <div className="scrollbar-dark overflow-y-auto">{listContent}</div>
      </motion.nav>

      {/* Mobile/tablet accordion */}
      <div className="lg:hidden">
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="flex w-full min-h-[44px] items-center justify-between rounded-lg bg-[#1A1A1A] px-4 py-3 text-sm text-white"
          aria-expanded={mobileOpen}
        >
          <span>
            Outras aulas deste módulo ({completedCount}/{lessons.length})
          </span>
          <ChevronDown
            className={cn(
              'h-4 w-4 transition-transform duration-200',
              mobileOpen && 'rotate-180'
            )}
          />
        </button>
        <div
          className={cn(
            'grid transition-[grid-template-rows] duration-200',
            mobileOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
          )}
        >
          <div className="overflow-hidden">
            <nav
              aria-label="Aulas do módulo"
              className="rounded-b-lg bg-[#1A1A1A]"
            >
              {listContent}
            </nav>
          </div>
        </div>
      </div>
    </>
  );
}
