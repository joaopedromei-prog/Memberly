'use client';

import type { Lesson } from '@/types/database';

interface CourseCompletionWidgetProps {
  lessons: Lesson[];
}

function ProgressBar({
  label,
  current,
  total,
}: {
  label: string;
  current: number;
  total: number;
}) {
  const percentage = total > 0 ? Math.round((current / total) * 100) : 0;

  let barColor = 'bg-red-500';
  let textColor = 'text-red-700';
  let bgColor = 'bg-red-100';
  if (percentage > 80) {
    barColor = 'bg-green-500';
    textColor = 'text-green-700';
    bgColor = 'bg-green-100';
  } else if (percentage >= 50) {
    barColor = 'bg-yellow-500';
    textColor = 'text-yellow-700';
    bgColor = 'bg-yellow-100';
  }

  return (
    <div>
      <div className="mb-1 flex items-center justify-between">
        <span className="text-sm text-gray-700">{label}</span>
        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${bgColor} ${textColor}`}>
          {current}/{total}
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
        <div
          className={`h-full rounded-full transition-all duration-500 ${barColor}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

export function CourseCompletionWidget({ lessons }: CourseCompletionWidgetProps) {
  const total = lessons.length;

  if (total === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900">Progresso do Curso</h3>
        <p className="mt-2 text-sm text-gray-500">
          Nenhuma aula criada ainda.
        </p>
      </div>
    );
  }

  const withVideo = lessons.filter((l) => l.video_id && l.video_id.trim() !== '').length;
  const withDescription = lessons.filter(
    (l) => l.description && l.description.trim() !== ''
  ).length;
  const published = lessons.filter((l) => l.is_published).length;
  const withAttachments = lessons.filter(
    (l) =>
      (l.attachments && l.attachments.length > 0) ||
      (l.pdf_url && l.pdf_url.trim() !== '')
  ).length;

  // Overall completion: average of all metrics
  const metrics = [withVideo, withDescription, published, withAttachments];
  const overallPercent = Math.round(
    (metrics.reduce((sum, m) => sum + m, 0) / (total * metrics.length)) * 100
  );

  let overallColor = 'text-red-600';
  let overallBg = 'bg-red-100';
  if (overallPercent > 80) {
    overallColor = 'text-green-600';
    overallBg = 'bg-green-100';
  } else if (overallPercent >= 50) {
    overallColor = 'text-yellow-600';
    overallBg = 'bg-yellow-100';
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          Progresso do Curso
        </h3>
        <span
          className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-bold ${overallBg} ${overallColor}`}
        >
          {overallPercent}%
        </span>
      </div>

      <div className="space-y-4">
        <ProgressBar
          label={`Aulas com video`}
          current={withVideo}
          total={total}
        />
        <ProgressBar
          label={`Aulas com descricao`}
          current={withDescription}
          total={total}
        />
        <ProgressBar
          label={`Aulas publicadas`}
          current={published}
          total={total}
        />
        <ProgressBar
          label={`Aulas com arquivos anexos`}
          current={withAttachments}
          total={total}
        />
      </div>

      <div className="mt-4 border-t border-gray-100 pt-3">
        <p className="text-xs text-gray-500">
          {total} aula{total !== 1 ? 's' : ''} no total
        </p>
      </div>
    </div>
  );
}
