'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { PdfViewer } from '@/components/shared/PdfViewer';

interface LessonInfoProps {
  lessonId: string;
  title: string;
  description: string;
  durationMinutes: number | null;
  pdfUrl: string | null;
  isCompleted: boolean;
  prevLessonUrl: string | null;
  nextLessonUrl: string | null;
  breadcrumbs: { label: string; href?: string }[];
}

export function LessonInfo({
  lessonId,
  title,
  description,
  durationMinutes,
  pdfUrl,
  isCompleted,
  prevLessonUrl,
  nextLessonUrl,
  breadcrumbs,
}: LessonInfoProps) {
  const router = useRouter();
  const [completed, setCompleted] = useState(isCompleted);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);

  async function toggleComplete() {
    setLoading(true);
    try {
      const res = await fetch(`/api/progress/${lessonId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: !completed }),
      });
      if (res.ok) {
        setCompleted(!completed);
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-4">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="mb-3">
        <ol className="flex flex-wrap items-center gap-1 text-xs text-neutral-500">
          {breadcrumbs.map((crumb, i) => (
            <li key={i} className="flex items-center gap-1">
              {i > 0 && <span>›</span>}
              {crumb.href ? (
                <Link href={crumb.href} className="hover:text-neutral-300">
                  {crumb.label}
                </Link>
              ) : (
                <span className="text-neutral-300">{crumb.label}</span>
              )}
            </li>
          ))}
        </ol>
      </nav>

      {/* Title + duration */}
      <h1 className="text-[2rem] font-bold leading-tight text-white">
        {title}
      </h1>
      {durationMinutes && (
        <p className="mt-1 text-sm text-neutral-500">{durationMinutes} min</p>
      )}

      {/* Description */}
      {description && (
        <div className="mt-3">
          <p
            className={`text-sm leading-relaxed text-neutral-300 ${
              expanded ? '' : 'line-clamp-3'
            }`}
          >
            {description}
          </p>
          {description.length > 200 && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="mt-1 text-xs text-primary hover:text-primary-hover"
            >
              {expanded ? 'ver menos' : 'ver mais'}
            </button>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <button
          onClick={toggleComplete}
          disabled={loading}
          aria-pressed={completed}
          className={`inline-flex min-h-[44px] items-center justify-center gap-2 rounded px-5 py-2.5 text-sm font-semibold transition-all ${
            completed
              ? 'bg-[#46D369] text-black'
              : 'bg-dark-surface text-white hover:bg-dark-card'
          }`}
        >
          {loading ? (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          ) : completed ? (
            <span className="inline-block animate-[checkmark-pop_400ms_cubic-bezier(0.34,1.56,0.64,1)]">✓</span>
          ) : (
            <span>○</span>
          )}
          {completed ? 'Concluída' : 'Marcar como concluída'}
        </button>

        {pdfUrl && <PdfViewer pdfUrl={pdfUrl} />}
      </div>

      {/* Navigation */}
      <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-between">
        {prevLessonUrl ? (
          <Link
            href={prevLessonUrl}
            className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded border border-dark-border px-4 py-2 text-sm text-neutral-300 transition-colors hover:bg-dark-surface hover:text-white"
            aria-label="Aula anterior"
          >
            ← Aula Anterior
          </Link>
        ) : (
          <button
            disabled
            className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded border border-dark-border px-4 py-2 text-sm text-neutral-600 opacity-50"
            aria-label="Aula anterior"
          >
            ← Aula Anterior
          </button>
        )}
        {nextLessonUrl ? (
          <Link
            href={nextLessonUrl}
            className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded bg-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-hover"
            aria-label="Próxima aula"
          >
            Próxima Aula →
          </Link>
        ) : (
          <button
            disabled
            className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded bg-dark-surface px-4 py-2 text-sm text-neutral-600 opacity-50"
            aria-label="Próxima aula"
          >
            Próxima Aula →
          </button>
        )}
      </div>
    </div>
  );
}
