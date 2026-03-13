'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import {
  Heart,
  Check,
  Circle,
  FileText,
  Image as ImageIcon,
  Download,
  Eye,
  ChevronRight,
} from 'lucide-react';
import { PdfViewer } from '@/components/shared/PdfViewer';
import type { LessonAttachment } from '@/types/database';
import { sanitizeHtml } from '@/lib/utils/sanitize';

interface LessonInfoProps {
  lessonId: string;
  title: string;
  description: string;
  durationMinutes: number | null;
  pdfUrl: string | null;
  attachments?: LessonAttachment[];
  isCompleted: boolean;
  isBookmarked: boolean;
  breadcrumbs: { label: string; href?: string }[];
}

function getAttachmentIcon(type: string) {
  if (type === 'application/pdf') {
    return <FileText className="h-4 w-4 flex-shrink-0 text-primary" />;
  }
  if (type.startsWith('image/')) {
    return <ImageIcon className="h-4 w-4 flex-shrink-0 text-blue-500" />;
  }
  return <FileText className="h-4 w-4 flex-shrink-0 text-neutral-400" />;
}

export function LessonInfo({
  lessonId,
  title,
  description,
  durationMinutes,
  pdfUrl,
  attachments = [],
  isCompleted,
  isBookmarked: initialBookmarked,
  breadcrumbs,
}: LessonInfoProps) {
  const router = useRouter();
  const [completed, setCompleted] = useState(isCompleted);
  const [bookmarked, setBookmarked] = useState(initialBookmarked);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);

  async function toggleBookmark() {
    const prev = bookmarked;
    setBookmarked(!bookmarked);
    try {
      const res = await fetch(`/api/lessons/${lessonId}/bookmark`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setBookmarked(data.bookmarked);
      } else {
        setBookmarked(prev);
      }
    } catch {
      setBookmarked(prev);
    }
  }

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

  const pdfAttachments = attachments.filter((a) => a.type === 'application/pdf');
  const otherAttachments = attachments.filter((a) => a.type !== 'application/pdf');
  const hasAttachments = attachments.length > 0;
  const fallbackPdf = !hasAttachments && pdfUrl;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="mt-6"
    >
      {/* Breadcrumb */}
      <nav
        aria-label="Breadcrumb"
        className="mb-4 overflow-x-auto whitespace-nowrap pb-1"
      >
        <ol className="flex items-center gap-1 text-xs text-neutral-500">
          {breadcrumbs.map((crumb, i) => (
            <li key={i} className="flex items-center gap-1">
              {i > 0 && <ChevronRight className="h-3 w-3 flex-shrink-0" />}
              {crumb.href ? (
                <Link
                  href={crumb.href}
                  className="transition-colors hover:text-neutral-300"
                >
                  {crumb.label}
                </Link>
              ) : (
                <span className="text-neutral-300">{crumb.label}</span>
              )}
            </li>
          ))}
        </ol>
      </nav>

      {/* Title + bookmark */}
      <div className="flex items-start justify-between gap-3">
        <h1 className="flex-1 text-[32px] font-bold leading-tight text-white">
          {title}
        </h1>
        <motion.button
          type="button"
          whileTap={{ scale: 0.9 }}
          onClick={toggleBookmark}
          aria-label={bookmarked ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
          className="flex-shrink-0 rounded-full p-2 transition-colors hover:bg-dark-surface"
        >
          <motion.div
            animate={bookmarked ? { scale: [0.8, 1.1, 1] } : { scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <Heart
              className={`h-6 w-6 ${
                bookmarked
                  ? 'fill-primary text-primary'
                  : 'text-neutral-500 hover:text-neutral-300'
              }`}
            />
          </motion.div>
        </motion.button>
      </div>

      {/* Duration */}
      {durationMinutes && (
        <div className="mt-1 text-sm text-neutral-500">{durationMinutes} min</div>
      )}

      {/* Description */}
      {description && (
        <div className="mt-3">
          <div
            className={`lesson-description text-sm leading-relaxed text-neutral-300 ${
              expanded ? '' : 'line-clamp-3'
            }`}
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(description) }}
          />
          {description.length > 200 && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="mt-1 text-xs font-medium text-primary transition-colors hover:text-primary-hover"
            >
              {expanded ? 'ver menos' : 'ver mais'}
            </button>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="mt-4 flex gap-3">
        <button
          onClick={toggleComplete}
          disabled={loading}
          aria-pressed={completed}
          className={`flex min-h-[44px] items-center gap-2 rounded px-5 text-sm font-semibold transition-colors duration-200 ${
            completed
              ? 'bg-accent-success text-black'
              : 'bg-dark-surface text-white hover:bg-dark-card'
          }`}
        >
          {loading ? (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          ) : completed ? (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.3, 0.9, 1] }}
              transition={{ duration: 0.4 }}
            >
              <Check className="h-5 w-5" />
            </motion.div>
          ) : (
            <Circle className="h-5 w-5" />
          )}
          {completed ? 'Conclu\u00edda' : 'Marcar como conclu\u00edda'}
        </button>

        {fallbackPdf && <PdfViewer pdfUrl={pdfUrl!} />}
      </div>

      {/* Attachments */}
      {hasAttachments && (
        <div className="mt-8">
          <h3 className="mb-3 text-sm font-semibold text-neutral-400">
            Material da Aula
          </h3>
          <div className="space-y-2">
            {pdfAttachments.map((att, index) => (
              <motion.div
                key={`pdf-${index}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.05 }}
                className="flex items-center gap-3 rounded-lg border border-dark-border bg-dark-surface p-3"
              >
                {getAttachmentIcon(att.type)}
                <span className="flex-1 truncate text-sm text-neutral-300">
                  {att.name}
                </span>
                <PdfViewer pdfUrl={att.url} />
              </motion.div>
            ))}
            {otherAttachments.map((att, index) => (
              <motion.div
                key={`file-${index}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + (pdfAttachments.length + index) * 0.05 }}
                className="flex items-center gap-3 rounded-lg border border-dark-border bg-dark-surface p-3"
              >
                {getAttachmentIcon(att.type)}
                <span className="flex-1 truncate text-sm text-neutral-300">
                  {att.name}
                </span>
                <a
                  href={att.url}
                  download={att.name}
                  className="flex flex-shrink-0 items-center gap-2 rounded border border-dark-border bg-dark-card px-3 py-1.5 text-sm text-neutral-300 transition-colors hover:bg-dark-surface hover:text-white"
                >
                  <Download className="h-4 w-4" />
                  <span className="hidden sm:inline">Baixar</span>
                </a>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
