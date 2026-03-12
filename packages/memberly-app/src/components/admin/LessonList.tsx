'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SortableList } from '@/components/ui/SortableList';
import { LessonForm } from '@/components/admin/LessonForm';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Button } from '@/components/ui/Button';
import { apiRequest, ApiRequestError } from '@/lib/utils/api';
import { useToastStore } from '@/stores/toast-store';
import type { Lesson } from '@/types/database';

interface LessonListProps {
  moduleId: string;
  lessons: Lesson[];
}

function ProviderBadge({ provider }: { provider: string }) {
  if (provider === 'youtube') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
        YouTube
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
      Panda
    </span>
  );
}

function PublishBadge({ isPublished }: { isPublished: boolean }) {
  if (isPublished) {
    return (
      <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
        Publicada
      </span>
    );
  }
  return (
    <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
      Rascunho
    </span>
  );
}

export function LessonList({
  moduleId,
  lessons: initialLessons,
}: LessonListProps) {
  const router = useRouter();
  const addToast = useToastStore((s) => s.addToast);
  const [lessons, setLessons] = useState(initialLessons);
  const [showForm, setShowForm] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Lesson | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleReorder = async (newItems: Lesson[]) => {
    const items = newItems.map((item, index) => ({
      id: item.id,
      sort_order: index,
    }));

    try {
      await apiRequest(`/api/modules/${moduleId}/lessons/reorder`, {
        method: 'PATCH',
        body: JSON.stringify({ items }),
      });
    } catch (err) {
      addToast(
        err instanceof ApiRequestError ? err.message : 'Erro ao reordenar',
        'error'
      );
      setLessons(initialLessons);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);

    try {
      await apiRequest(`/api/lessons/${deleteTarget.id}`, { method: 'DELETE' });
      setLessons((prev) => prev.filter((l) => l.id !== deleteTarget.id));
      addToast('Aula excluída com sucesso', 'success');
      setDeleteTarget(null);
    } catch (err) {
      addToast(
        err instanceof ApiRequestError ? err.message : 'Erro ao excluir aula',
        'error'
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const handleTogglePublish = async (lesson: Lesson) => {
    try {
      await apiRequest(`/api/lessons/${lesson.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ is_published: !lesson.is_published }),
      });
      setLessons((prev) =>
        prev.map((l) =>
          l.id === lesson.id ? { ...l, is_published: !l.is_published } : l
        )
      );
      addToast(
        lesson.is_published ? 'Aula despublicada' : 'Aula publicada',
        'success'
      );
    } catch (err) {
      addToast(
        err instanceof ApiRequestError ? err.message : 'Erro ao alterar status',
        'error'
      );
    }
  };

  const handleDuplicate = async (lesson: Lesson) => {
    try {
      const data = await apiRequest<Lesson>(`/api/lessons/${lesson.id}/duplicate`, {
        method: 'POST',
      });
      setLessons((prev) => [...prev, data]);
      addToast('Aula duplicada com sucesso', 'success');
    } catch (err) {
      addToast(
        err instanceof ApiRequestError ? err.message : 'Erro ao duplicar aula',
        'error'
      );
    }
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingLesson(null);
    router.refresh();
  };

  if (showForm || editingLesson) {
    return (
      <LessonForm
        moduleId={moduleId}
        lesson={editingLesson ?? undefined}
        onSuccess={handleFormSuccess}
        onCancel={() => {
          setShowForm(false);
          setEditingLesson(null);
        }}
      />
    );
  }

  if (lessons.length === 0) {
    return (
      <div>
        <div className="mb-4 flex justify-end">
          <Button onClick={() => setShowForm(true)}>Nova Aula</Button>
        </div>
        <div className="rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
          <p className="text-lg font-medium text-gray-500">
            Nenhuma aula criada
          </p>
          <p className="mt-1 text-sm text-gray-400">
            Comece adicionando a primeira aula deste módulo.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="mb-4 flex justify-end">
        <Button onClick={() => setShowForm(true)}>Nova Aula</Button>
      </div>

      <SortableList
        items={lessons}
        onReorder={handleReorder}
        renderItem={(lesson, dragHandleProps) => (
          <div className="mb-2 flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <button
              type="button"
              className="cursor-grab touch-none text-gray-400 hover:text-gray-600"
              aria-label="Arrastar para reordenar"
              {...dragHandleProps}
            >
              ⠿
            </button>

            <div className="flex-1">
              <p className="font-medium text-gray-900">{lesson.title}</p>
              <div className="mt-1 flex items-center gap-2">
                <PublishBadge isPublished={lesson.is_published} />
                <ProviderBadge provider={lesson.video_provider} />
                {lesson.duration_minutes && (
                  <span className="text-xs text-gray-500">
                    {lesson.duration_minutes} min
                  </span>
                )}
                {lesson.attachments && lesson.attachments.length > 0 && (
                  <span className="text-xs text-blue-600">
                    {lesson.attachments.length} arquivo{lesson.attachments.length !== 1 ? 's' : ''}
                  </span>
                )}
                {!lesson.attachments?.length && lesson.pdf_url && (
                  <span className="text-xs text-blue-600">PDF</span>
                )}
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => handleTogglePublish(lesson)}
                className={`text-sm ${lesson.is_published ? 'text-amber-600 hover:text-amber-800' : 'text-green-600 hover:text-green-800'}`}
              >
                {lesson.is_published ? 'Despublicar' : 'Publicar'}
              </button>
              <button
                onClick={() => handleDuplicate(lesson)}
                className="text-sm text-purple-600 hover:text-purple-800"
              >
                Duplicar
              </button>
              <button
                onClick={() => setEditingLesson(lesson)}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Editar
              </button>
              <button
                onClick={() => setDeleteTarget(lesson)}
                className="text-sm text-red-600 hover:text-red-800"
              >
                Excluir
              </button>
            </div>
          </div>
        )}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        title="Excluir Aula"
        message={`Tem certeza que deseja excluir "${deleteTarget?.title}"? Esta ação é irreversível.`}
        confirmLabel="Excluir"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        isLoading={isDeleting}
      />
    </>
  );
}
