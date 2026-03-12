'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { RichTextEditor } from '@/components/ui/RichTextEditor';
import { BulkFileUpload } from '@/components/admin/BulkFileUpload';
import { VideoPlayer } from '@/components/shared/VideoPlayer';
import { extractVideoId } from '@/lib/utils/video';
import { useToastStore } from '@/stores/toast-store';
import type { Lesson, VideoProvider, LessonAttachment } from '@/types/database';

interface LessonFormProps {
  moduleId: string;
  lesson?: Lesson;
  onSuccess: () => void;
  onCancel: () => void;
}

export function LessonForm({
  moduleId,
  lesson,
  onSuccess,
  onCancel,
}: LessonFormProps) {
  const addToast = useToastStore((s) => s.addToast);
  const isEditing = !!lesson;

  const [title, setTitle] = useState(lesson?.title ?? '');
  const [description, setDescription] = useState(lesson?.description ?? '');
  const [videoProvider, setVideoProvider] = useState<VideoProvider>(
    lesson?.video_provider ?? 'youtube'
  );
  const [videoInput, setVideoInput] = useState(lesson?.video_id ?? '');
  const [videoId, setVideoId] = useState(lesson?.video_id ?? '');
  const [durationMinutes, setDurationMinutes] = useState<string>(
    lesson?.duration_minutes?.toString() ?? ''
  );
  const [attachments, setAttachments] = useState<LessonAttachment[]>(
    lesson?.attachments ?? []
  );
  const [isPublished, setIsPublished] = useState(lesson?.is_published ?? false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const extracted = extractVideoId(videoProvider, videoInput);
    setVideoId(extracted ?? '');
  }, [videoInput, videoProvider]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      setError('Título é obrigatório');
      return;
    }

    setIsSubmitting(true);
    setError('');

    // Derive pdf_url from attachments for backward compatibility
    const firstPdf = attachments.find((a) => a.type === 'application/pdf');

    const payload = {
      title,
      description,
      video_provider: videoProvider,
      video_id: videoId,
      duration_minutes: durationMinutes ? parseInt(durationMinutes, 10) : null,
      pdf_url: firstPdf?.url ?? null,
      attachments,
      is_published: isPublished,
    };

    try {
      const url = isEditing
        ? `/api/lessons/${lesson.id}`
        : `/api/modules/${moduleId}/lessons`;
      const method = isEditing ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error?.message || 'Erro ao salvar aula');
      }

      addToast(
        isEditing ? 'Aula atualizada com sucesso' : 'Aula criada com sucesso',
        'success'
      );
      onSuccess();
    } catch (err) {
      addToast(
        err instanceof Error ? err.message : 'Erro ao salvar aula',
        'error'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <h3 className="mb-4 text-lg font-semibold text-gray-900">
        {isEditing ? 'Editar Aula' : 'Nova Aula'}
      </h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="lesson-title"
            className="block text-sm font-medium text-gray-700"
          >
            Título *
          </label>
          <input
            id="lesson-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="Ex: Aula 1 — Introdução"
          />
          {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Descrição
          </label>
          <RichTextEditor
            content={description}
            onChange={setDescription}
            placeholder="Descreva a aula..."
          />
        </div>

        <div>
          <label
            htmlFor="lesson-provider"
            className="block text-sm font-medium text-gray-700"
          >
            Provider de Vídeo
          </label>
          <select
            id="lesson-provider"
            value={videoProvider}
            onChange={(e) => setVideoProvider(e.target.value as VideoProvider)}
            className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="youtube">YouTube</option>
            <option value="pandavideo">Panda Video</option>
          </select>
        </div>

        <div>
          <label
            htmlFor="lesson-video"
            className="block text-sm font-medium text-gray-700"
          >
            ID ou URL do Vídeo
          </label>
          <input
            id="lesson-video"
            type="text"
            value={videoInput}
            onChange={(e) => setVideoInput(e.target.value)}
            className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder={
              videoProvider === 'youtube'
                ? 'Ex: https://youtube.com/watch?v=dQw4w9WgXcQ'
                : 'Ex: a1b2c3d4-e5f6-7890-abcd-ef1234567890'
            }
          />
          {videoId && (
            <p className="mt-1 text-xs text-green-600">
              ID extraído: {videoId}
            </p>
          )}
        </div>

        {videoId && (
          <div>
            <p className="mb-1 text-sm font-medium text-gray-700">Preview</p>
            <VideoPlayer
              provider={videoProvider}
              videoId={videoId}
              className="max-w-md"
            />
          </div>
        )}

        <div>
          <label
            htmlFor="lesson-duration"
            className="block text-sm font-medium text-gray-700"
          >
            Duração (minutos)
          </label>
          <input
            id="lesson-duration"
            type="number"
            min="0"
            value={durationMinutes}
            onChange={(e) => setDurationMinutes(e.target.value)}
            className="mt-1 block w-32 rounded-lg border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="Ex: 15"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Arquivos (opcional)
          </label>
          <div className="mt-1">
            <BulkFileUpload value={attachments} onFilesChanged={setAttachments} />
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 p-4">
          <label className="relative inline-flex cursor-pointer items-center">
            <input
              type="checkbox"
              checked={isPublished}
              onChange={(e) => setIsPublished(e.target.checked)}
              className="peer sr-only"
            />
            <div className="peer h-6 w-11 rounded-full bg-gray-300 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-green-500 peer-checked:after:translate-x-full" />
          </label>
          <div>
            <span className="text-sm font-medium text-gray-700">Publicada</span>
            <p className="text-xs text-gray-500">
              {isPublished
                ? 'A aula está visível para os membros'
                : 'A aula está em rascunho e não será visível'}
            </p>
          </div>
          {isPublished ? (
            <span className="ml-auto inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
              Publicada
            </span>
          ) : (
            <span className="ml-auto inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
              Rascunho
            </span>
          )}
        </div>

        <div className="flex gap-3">
          <Button type="submit" isLoading={isSubmitting}>
            {isEditing ? 'Salvar' : 'Criar Aula'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
        </div>
      </form>
    </div>
  );
}
