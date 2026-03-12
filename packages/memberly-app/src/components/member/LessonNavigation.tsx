import Link from 'next/link';

interface LessonNavigationProps {
  prevLessonUrl: string | null;
  nextLessonUrl: string | null;
}

export function LessonNavigation({ prevLessonUrl, nextLessonUrl }: LessonNavigationProps) {
  return (
    <div className="mt-8 flex flex-col gap-2 border-t border-neutral-800 pt-6 sm:flex-row sm:justify-between">
      {prevLessonUrl ? (
        <Link
          href={prevLessonUrl}
          className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded border border-dark-border px-4 py-2 text-sm text-neutral-300 transition-colors hover:bg-dark-surface hover:text-white"
          aria-label="Aula anterior"
        >
          &larr; Aula Anterior
        </Link>
      ) : (
        <button
          disabled
          className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded border border-dark-border px-4 py-2 text-sm text-neutral-600 opacity-50"
          aria-label="Aula anterior"
        >
          &larr; Aula Anterior
        </button>
      )}
      {nextLessonUrl ? (
        <Link
          href={nextLessonUrl}
          className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded bg-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-hover"
          aria-label="Próxima aula"
        >
          Próxima Aula &rarr;
        </Link>
      ) : (
        <button
          disabled
          className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded bg-dark-surface px-4 py-2 text-sm text-neutral-600 opacity-50"
          aria-label="Próxima aula"
        >
          Próxima Aula &rarr;
        </button>
      )}
    </div>
  );
}
