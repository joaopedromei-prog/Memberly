import Link from 'next/link';
import { ArrowLeft, ArrowRight } from 'lucide-react';

interface LessonNavigationProps {
  prevLessonUrl: string | null;
  nextLessonUrl: string | null;
  prevLessonTitle?: string | null;
  nextLessonTitle?: string | null;
}

export function LessonNavigation({
  prevLessonUrl,
  nextLessonUrl,
  prevLessonTitle,
  nextLessonTitle,
}: LessonNavigationProps) {
  return (
    <div className="mt-8 flex flex-col gap-4 border-t border-dark-card pt-6 sm:flex-row sm:justify-between">
      {prevLessonUrl ? (
        <Link
          href={prevLessonUrl}
          className="group flex w-full flex-col items-start rounded-lg px-4 py-3 transition-colors hover:bg-dark-surface sm:w-auto"
          aria-label="Aula anterior"
        >
          <span className="flex items-center gap-2 text-sm text-neutral-400 transition-colors group-hover:text-white">
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Aula Anterior
          </span>
          {prevLessonTitle && (
            <span className="mt-1 text-xs text-neutral-600">{prevLessonTitle}</span>
          )}
        </Link>
      ) : (
        <div className="w-full sm:w-auto" />
      )}
      {nextLessonUrl ? (
        <Link
          href={nextLessonUrl}
          className="group flex w-full flex-col items-end rounded-lg px-4 py-3 text-right transition-colors hover:bg-dark-surface sm:w-auto"
          aria-label="Próxima aula"
        >
          <span className="flex items-center gap-2 text-sm text-neutral-400 transition-colors group-hover:text-white">
            Próxima Aula
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </span>
          {nextLessonTitle && (
            <span className="mt-1 text-xs text-neutral-600">{nextLessonTitle}</span>
          )}
        </Link>
      ) : (
        <div className="w-full sm:w-auto" />
      )}
    </div>
  );
}
