'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { RichTextEditor } from '@/components/ui/RichTextEditor';
import { BulkFileUpload } from '@/components/admin/BulkFileUpload';
import { VideoPlayer } from '@/components/shared/VideoPlayer';
import { extractVideoId } from '@/lib/utils/video';
import { useToastStore } from '@/stores/toast-store';
import type { Lesson, VideoProvider, LessonAttachment } from '@/types/database';

interface LessonFormProps {
  moduleId: string;
  lesson?: Lesson;
  moduleDripDays?: number | null;
  onSuccess: () => void;
  onCancel: () => void;
  embedded?: boolean;
}

export function LessonForm({
  moduleId,
  lesson,
  moduleDripDays,
  onSuccess,
  onCancel,
  embedded,
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
  const [dripDays, setDripDays] = useState<string>(
    lesson?.drip_days?.toString() ?? ''
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
      drip_days: dripDays ? parseInt(dripDays, 10) : null,
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

  const formContent = (
    <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          id="lesson-title"
          label="Título *"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Ex: Aula 1 — Introdução"
          error={error}
        />

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

        <Select
          id="lesson-provider"
          label="Provider de Vídeo"
          value={videoProvider}
          onChange={(e) => setVideoProvider(e.target.value as VideoProvider)}
        >
          <option value="youtube">YouTube</option>
          <option value="pandavideo">Panda Video</option>
        </Select>

        <div>
          <Input
            id="lesson-video"
            label="ID ou URL do Vídeo"
            type="text"
            value={videoInput}
            onChange={(e) => setVideoInput(e.target.value)}
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

        <Input
          id="lesson-duration"
          label="Duração (minutos)"
          type="number"
          min={0}
          value={durationMinutes}
          onChange={(e) => setDurationMinutes(e.target.value)}
          className="w-32"
          placeholder="Ex: 15"
        />

        <div>
          <Input
            id="lesson-drip"
            label="Disponível após X dias da compra"
            type="number"
            min={0}
            value={dripDays}
            onChange={(e) => setDripDays(e.target.value)}
            className="w-32"
            placeholder="0"
          />
          {moduleDripDays != null && moduleDripDays > 0 && (
            <p className="mt-1 text-xs text-amber-600">
              Mínimo herdado do módulo: {moduleDripDays} dias
            </p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            Deixe vazio para usar o valor do módulo pai ou disponibilizar imediatamente.
          </p>
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

        <div className="flex gap-3 pt-2">
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
  );

  if (embedded) return formContent;

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <h3 className="mb-4 text-lg font-semibold text-gray-900">
        {isEditing ? 'Editar Aula' : 'Nova Aula'}
      </h3>
      {formContent}
    </div>
  );
}
