'use client';

import { useState } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils/cn';

export interface SidebarLesson {
  id: string;
  title: string;
  durationMinutes: number | null;
  completed: boolean;
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

  const listContent = (
    <ul className="flex flex-col">
      {lessons.map((lesson, index) => {
        const isCurrent = lesson.id === currentLessonId;
        return (
          <li key={lesson.id}>
            <Link
              href={`/products/${productSlug}/lessons/${lesson.id}`}
              aria-current={isCurrent ? 'page' : undefined}
              className={cn(
                'flex min-h-[44px] items-center gap-3 border-l-2 px-4 py-3 text-sm transition-colors',
                isCurrent
                  ? 'border-primary bg-dark-card text-white'
                  : 'border-transparent text-neutral-400 hover:bg-dark-surface hover:text-neutral-200'
              )}
            >
              <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center">
                {lesson.completed ? (
                  <CheckIcon />
                ) : isCurrent ? (
                  <PlayIcon />
                ) : (
                  <CircleIcon />
                )}
              </span>
              <span className="flex-1 truncate">
                <span className="text-neutral-500">{index + 1}. </span>
                {lesson.title}
              </span>
              {lesson.durationMinutes && (
                <span className="flex-shrink-0 text-xs text-neutral-500">
                  {lesson.durationMinutes} min
                </span>
              )}
            </Link>
          </li>
        );
      })}
    </ul>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <nav
        aria-label="Aulas do módulo"
        className="hidden rounded-lg bg-[#1a1a1a] lg:block"
      >
        <div className="border-b border-neutral-800 p-4">
          <h3 className="text-lg font-semibold text-white">{moduleName}</h3>
          <p className="mt-1 text-xs text-neutral-400">
            {completedCount}/{lessons.length} aulas concluídas
          </p>
        </div>
        <div className="scrollbar-dark overflow-y-auto">
          {listContent}
        </div>
      </nav>

      {/* Mobile/tablet accordion */}
      <div className="lg:hidden">
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="flex w-full min-h-[44px] items-center justify-between rounded-lg bg-[#1a1a1a] px-4 py-3 text-sm text-white"
          aria-expanded={mobileOpen}
        >
          <span>Outras aulas deste módulo ({completedCount}/{lessons.length})</span>
          <span className={cn('transition-transform duration-200', mobileOpen && 'rotate-180')}>
            ▼
          </span>
        </button>
        <div
          className={cn(
            'overflow-hidden transition-all duration-200 ease-out',
            mobileOpen ? 'max-h-[2000px]' : 'max-h-0'
          )}
        >
          <nav aria-label="Aulas do módulo" className="rounded-b-lg bg-[#1a1a1a]">
            {listContent}
          </nav>
        </div>
      </div>
    </>
  );
}

function CheckIcon() {
  return (
    <svg className="h-4 w-4 text-[#46D369]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3} aria-label="Aula concluída">
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

function PlayIcon() {
  return (
    <svg className="h-4 w-4 text-primary" fill="currentColor" viewBox="0 0 24 24" aria-label="Aula atual">
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}

function CircleIcon() {
  return (
    <svg className="h-4 w-4 text-neutral-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-label="Aula pendente">
      <circle cx="12" cy="12" r="9" />
    </svg>
  );
}
