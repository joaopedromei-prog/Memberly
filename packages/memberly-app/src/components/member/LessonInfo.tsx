'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { PdfViewer } from '@/components/shared/PdfViewer';
import type { LessonAttachment } from '@/types/database';

interface LessonInfoProps {
  lessonId: string;
  title: string;
  description: string;
  durationMinutes: number | null;
  pdfUrl: string | null;
  attachments?: LessonAttachment[];
  isCompleted: boolean;
  breadcrumbs: { label: string; href?: string }[];
}

function getAttachmentIcon(type: string) {
  if (type === 'application/pdf') {
    return (
      <svg className="h-4 w-4 flex-shrink-0 text-red-400" fill="currentColor" viewBox="0 0 20 20">
        <path d="M4 18h12a2 2 0 002-2V6l-4-4H4a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    );
  }
  if (type.startsWith('image/')) {
    return (
      <svg className="h-4 w-4 flex-shrink-0 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    );
  }
  if (type.startsWith('video/')) {
    return (
      <svg className="h-4 w-4 flex-shrink-0 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
      </svg>
    );
  }
  return (
    <svg className="h-4 w-4 flex-shrink-0 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
    </svg>
  );
}

export function LessonInfo({
  lessonId,
  title,
  description,
  durationMinutes,
  pdfUrl,
  attachments = [],
  isCompleted,
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

  // Separate PDFs (which get inline viewer) from other attachments
  const pdfAttachments = attachments.filter((a) => a.type === 'application/pdf');
  const otherAttachments = attachments.filter((a) => a.type !== 'application/pdf');
  const hasAttachments = attachments.length > 0;

  // Fallback: if no attachments but pdfUrl exists (backward compat)
  const fallbackPdf = !hasAttachments && pdfUrl;

  return (
    <div className="mt-4">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="mb-3">
        <ol className="flex flex-wrap items-center gap-1 text-xs text-neutral-500">
          {breadcrumbs.map((crumb, i) => (
            <li key={i} className="flex items-center gap-1">
              {i > 0 && <span>&rsaquo;</span>}
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
          <div
            className={`lesson-description text-sm leading-relaxed text-neutral-300 ${
              expanded ? '' : 'line-clamp-3'
            }`}
            dangerouslySetInnerHTML={{ __html: description }}
          />
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
            <span className="inline-block animate-[checkmark-pop_400ms_cubic-bezier(0.34,1.56,0.64,1)]">&#10003;</span>
          ) : (
            <span>&#9675;</span>
          )}
          {completed ? 'Conclu\u00edda' : 'Marcar como conclu\u00edda'}
        </button>

        {/* Fallback PDF viewer for backward compatibility */}
        {fallbackPdf && <PdfViewer pdfUrl={pdfUrl!} />}
      </div>

      {/* Attachments list */}
      {hasAttachments && (
        <div className="mt-5">
          <h3 className="mb-2 text-sm font-semibold text-neutral-400">
            Material da Aula
          </h3>
          <div className="space-y-2">
            {/* PDF attachments with inline viewer */}
            {pdfAttachments.map((att, index) => (
              <div
                key={`pdf-${index}`}
                className="flex items-center gap-3 rounded-lg border border-dark-border bg-dark-surface p-3"
              >
                {getAttachmentIcon(att.type)}
                <span className="flex-1 truncate text-sm text-neutral-300">
                  {att.name}
                </span>
                <PdfViewer pdfUrl={att.url} />
              </div>
            ))}

            {/* Non-PDF attachments with download link */}
            {otherAttachments.map((att, index) => (
              <div
                key={`file-${index}`}
                className="flex items-center gap-3 rounded-lg border border-dark-border bg-dark-surface p-3"
              >
                {getAttachmentIcon(att.type)}
                <span className="flex-1 truncate text-sm text-neutral-300">
                  {att.name}
                </span>
                <a
                  href={att.url}
                  download={att.name}
                  className="inline-flex min-h-[36px] items-center gap-2 rounded border border-dark-border bg-dark-card px-3 py-1.5 text-sm text-neutral-300 transition-colors hover:bg-dark-surface hover:text-white"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Baixar
                </a>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
