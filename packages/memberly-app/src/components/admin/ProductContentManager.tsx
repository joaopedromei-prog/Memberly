'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SortableList } from '@/components/ui/SortableList';
import { SlideOver } from '@/components/ui/SlideOver';
import { DropdownMenu } from '@/components/ui/DropdownMenu';
import { ModuleForm } from '@/components/admin/ModuleForm';
import { LessonForm } from '@/components/admin/LessonForm';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Button } from '@/components/ui/Button';
import { apiRequest, ApiRequestError } from '@/lib/utils/api';
import { useToastStore } from '@/stores/toast-store';
import type { Lesson } from '@/types/database';
import type { ModuleWithLessons } from '@/types/api';

interface ProductContentManagerProps {
  productId: string;
  modules: ModuleWithLessons[];
}

type SlideOverState = {
  type: 'module' | 'lesson';
  mode: 'create' | 'edit';
  moduleId?: string;
  module?: ModuleWithLessons;
  lesson?: Lesson;
} | null;

type DeleteTarget = {
  type: 'module' | 'lesson';
  id: string;
  title: string;
  hasChildren?: boolean;
  childCount?: number;
} | null;

export function ProductContentManager({
  productId,
  modules: initialModules,
}: ProductContentManagerProps) {
  const router = useRouter();
  const addToast = useToastStore((s) => s.addToast);

  const [modules, setModules] = useState(initialModules);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [slideOver, setSlideOver] = useState<SlideOverState>(null);
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // --- Expand/Collapse ---
  const toggleExpand = (moduleId: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(moduleId)) next.delete(moduleId);
      else next.add(moduleId);
      return next;
    });
  };

  // --- Module Operations ---
  const handleModuleReorder = async (newItems: ModuleWithLessons[]) => {
    setModules(newItems);
    const items = newItems.map((item, index) => ({
      id: item.id,
      sort_order: index,
    }));
    try {
      await apiRequest(`/api/products/${productId}/modules/reorder`, {
        method: 'PATCH',
        body: JSON.stringify({ items }),
      });
    } catch (err) {
      addToast(
        err instanceof ApiRequestError ? err.message : 'Erro ao reordenar',
        'error'
      );
      setModules(initialModules);
    }
  };

  const handleModuleDuplicate = async (module: ModuleWithLessons) => {
    try {
      await apiRequest(`/api/modules/${module.id}/duplicate`, {
        method: 'POST',
      });
      addToast('Módulo duplicado', 'success');
      router.refresh();
    } catch (err) {
      addToast(
        err instanceof ApiRequestError ? err.message : 'Erro ao duplicar',
        'error'
      );
    }
  };

  // --- Lesson Operations ---
  const handleLessonReorder = async (
    moduleId: string,
    newLessons: Lesson[]
  ) => {
    setModules((prev) =>
      prev.map((m) =>
        m.id === moduleId ? { ...m, lessons: newLessons } : m
      )
    );
    const items = newLessons.map((item, index) => ({
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
      router.refresh();
    }
  };

  const handleLessonTogglePublish = async (lesson: Lesson) => {
    setModules((prev) =>
      prev.map((m) => ({
        ...m,
        lessons: m.lessons.map((l) =>
          l.id === lesson.id
            ? { ...l, is_published: !l.is_published }
            : l
        ),
      }))
    );
    try {
      await apiRequest(`/api/lessons/${lesson.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ is_published: !lesson.is_published }),
      });
      addToast(
        lesson.is_published ? 'Aula despublicada' : 'Aula publicada',
        'success'
      );
    } catch (err) {
      addToast(
        err instanceof ApiRequestError
          ? err.message
          : 'Erro ao alterar status',
        'error'
      );
      router.refresh();
    }
  };

  const handleLessonDuplicate = async (lesson: Lesson) => {
    try {
      await apiRequest(`/api/lessons/${lesson.id}/duplicate`, {
        method: 'POST',
      });
      addToast('Aula duplicada', 'success');
      router.refresh();
    } catch (err) {
      addToast(
        err instanceof ApiRequestError ? err.message : 'Erro ao duplicar',
        'error'
      );
    }
  };

  // --- Delete ---
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const endpoint =
        deleteTarget.type === 'module'
          ? `/api/modules/${deleteTarget.id}`
          : `/api/lessons/${deleteTarget.id}`;
      await apiRequest(endpoint, { method: 'DELETE' });

      if (deleteTarget.type === 'module') {
        setModules((prev) => prev.filter((m) => m.id !== deleteTarget.id));
      } else {
        setModules((prev) =>
          prev.map((m) => ({
            ...m,
            lessons: m.lessons.filter((l) => l.id !== deleteTarget.id),
          }))
        );
      }

      addToast(
        `${deleteTarget.type === 'module' ? 'Módulo' : 'Aula'} excluído(a)`,
        'success'
      );
      setDeleteTarget(null);
    } catch (err) {
      addToast(
        err instanceof ApiRequestError ? err.message : 'Erro ao excluir',
        'error'
      );
    } finally {
      setIsDeleting(false);
    }
  };

  // --- Form Success ---
  const handleFormSuccess = () => {
    setSlideOver(null);
    router.refresh();
  };

  const totalLessons = modules.reduce(
    (sum, m) => sum + m.lessons.length,
    0
  );

  const slideOverTitle = slideOver
    ? slideOver.type === 'module'
      ? slideOver.mode === 'create'
        ? 'Novo Módulo'
        : 'Editar Módulo'
      : slideOver.mode === 'create'
        ? 'Nova Aula'
        : 'Editar Aula'
    : '';

  return (
    <>
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3 text-sm text-gray-500">
          <span>
            {modules.length} módulo{modules.length !== 1 ? 's' : ''}
          </span>
          <span aria-hidden="true">&middot;</span>
          <span>
            {totalLessons} aula{totalLessons !== 1 ? 's' : ''}
          </span>
        </div>
        <Button
          onClick={() => setSlideOver({ type: 'module', mode: 'create' })}
        >
          + Novo Módulo
        </Button>
      </div>

      {/* Empty State */}
      {modules.length === 0 ? (
        <div className="rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
            <svg
              className="h-6 w-6 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 4.5v15m7.5-7.5h-15"
              />
            </svg>
          </div>
          <p className="text-lg font-medium text-gray-500">
            Nenhum módulo criado
          </p>
          <p className="mt-1 text-sm text-gray-400">
            Comece adicionando o primeiro módulo do seu curso.
          </p>
        </div>
      ) : (
        /* Module Accordion List */
        <SortableList
          items={modules}
          onReorder={handleModuleReorder}
          renderItem={(module, dragHandleProps) => {
            const isExpanded = expandedIds.has(module.id);
            const lessonCount = module.lessons.length;

            return (
              <div className="mb-3 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
                {/* Module Header */}
                <div className="flex items-center gap-3 px-4 py-3">
                  {/* Drag Handle */}
                  <button
                    type="button"
                    className="cursor-grab touch-none text-gray-300 hover:text-gray-500"
                    aria-label="Arrastar para reordenar"
                    {...dragHandleProps}
                  >
                    <svg
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M7 2a2 2 0 100 4 2 2 0 000-4zm6 0a2 2 0 100 4 2 2 0 000-4zM7 8a2 2 0 100 4 2 2 0 000-4zm6 0a2 2 0 100 4 2 2 0 000-4zM7 14a2 2 0 100 4 2 2 0 000-4zm6 0a2 2 0 100 4 2 2 0 000-4z" />
                    </svg>
                  </button>

                  {/* Expand/Collapse + Info */}
                  <button
                    type="button"
                    onClick={() => toggleExpand(module.id)}
                    className="flex flex-1 items-center gap-3 text-left"
                  >
                    <svg
                      className={`h-4 w-4 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">
                        {module.title}
                      </p>
                      <p className="text-xs text-gray-500">
                        {lessonCount} aula{lessonCount !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </button>

                  {/* Actions */}
                  <DropdownMenu
                    items={[
                      {
                        label: 'Editar módulo',
                        onClick: () =>
                          setSlideOver({
                            type: 'module',
                            mode: 'edit',
                            module,
                          }),
                      },
                      {
                        label: 'Duplicar módulo',
                        onClick: () => handleModuleDuplicate(module),
                      },
                      {
                        label: 'Excluir módulo',
                        onClick: () =>
                          setDeleteTarget({
                            type: 'module',
                            id: module.id,
                            title: module.title,
                            hasChildren: lessonCount > 0,
                            childCount: lessonCount,
                          }),
                        variant: 'danger',
                      },
                    ]}
                  />
                </div>

                {/* Expanded: Lesson List */}
                {isExpanded && (
                  <div className="border-t border-gray-100 bg-gray-50/50 px-4 py-3">
                    <div className="mb-3 flex items-center justify-between">
                      <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                        Aulas
                      </p>
                      <button
                        type="button"
                        onClick={() =>
                          setSlideOver({
                            type: 'lesson',
                            mode: 'create',
                            moduleId: module.id,
                          })
                        }
                        className="inline-flex items-center gap-1 rounded-md bg-blue-600 px-2.5 py-1.5 text-xs font-medium text-white hover:bg-blue-700"
                      >
                        + Nova Aula
                      </button>
                    </div>

                    {module.lessons.length === 0 ? (
                      <p className="py-6 text-center text-sm text-gray-400">
                        Nenhuma aula neste módulo.
                      </p>
                    ) : (
                      <SortableList
                        items={module.lessons}
                        onReorder={(newLessons) =>
                          handleLessonReorder(module.id, newLessons)
                        }
                        renderItem={(lesson, lessonDragProps) => (
                          <div className="mb-1.5 flex items-center gap-2 rounded-md border border-gray-200 bg-white px-3 py-2.5">
                            {/* Lesson Drag Handle */}
                            <button
                              type="button"
                              className="cursor-grab touch-none text-gray-300 hover:text-gray-500"
                              aria-label="Arrastar para reordenar"
                              {...lessonDragProps}
                            >
                              <svg
                                className="h-4 w-4"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                              >
                                <path d="M7 2a2 2 0 100 4 2 2 0 000-4zm6 0a2 2 0 100 4 2 2 0 000-4zM7 8a2 2 0 100 4 2 2 0 000-4zm6 0a2 2 0 100 4 2 2 0 000-4zM7 14a2 2 0 100 4 2 2 0 000-4zm6 0a2 2 0 100 4 2 2 0 000-4z" />
                              </svg>
                            </button>

                            {/* Lesson Info */}
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-medium text-gray-900">
                                {lesson.title}
                              </p>
                              <div className="mt-0.5 flex items-center gap-1.5">
                                <span
                                  className={`inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-medium ${
                                    lesson.is_published
                                      ? 'bg-green-100 text-green-700'
                                      : 'bg-gray-100 text-gray-500'
                                  }`}
                                >
                                  {lesson.is_published
                                    ? 'Publicada'
                                    : 'Rascunho'}
                                </span>
                                {lesson.duration_minutes && (
                                  <span className="text-[10px] text-gray-400">
                                    {lesson.duration_minutes} min
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Lesson Actions */}
                            <DropdownMenu
                              items={[
                                {
                                  label: lesson.is_published
                                    ? 'Despublicar'
                                    : 'Publicar',
                                  onClick: () =>
                                    handleLessonTogglePublish(lesson),
                                },
                                {
                                  label: 'Editar aula',
                                  onClick: () =>
                                    setSlideOver({
                                      type: 'lesson',
                                      mode: 'edit',
                                      moduleId: module.id,
                                      lesson,
                                    }),
                                },
                                {
                                  label: 'Duplicar aula',
                                  onClick: () =>
                                    handleLessonDuplicate(lesson),
                                },
                                {
                                  label: 'Excluir aula',
                                  onClick: () =>
                                    setDeleteTarget({
                                      type: 'lesson',
                                      id: lesson.id,
                                      title: lesson.title,
                                    }),
                                  variant: 'danger',
                                },
                              ]}
                            />
                          </div>
                        )}
                      />
                    )}
                  </div>
                )}
              </div>
            );
          }}
        />
      )}

      {/* SlideOver for Forms */}
      <SlideOver
        open={!!slideOver}
        onClose={() => setSlideOver(null)}
        title={slideOverTitle}
        width="lg"
      >
        {slideOver?.type === 'module' && (
          <ModuleForm
            productId={productId}
            module={slideOver.module ?? undefined}
            onSuccess={handleFormSuccess}
            onCancel={() => setSlideOver(null)}
            embedded
          />
        )}
        {slideOver?.type === 'lesson' && slideOver.moduleId && (
          <LessonForm
            moduleId={slideOver.moduleId}
            lesson={slideOver.lesson ?? undefined}
            onSuccess={handleFormSuccess}
            onCancel={() => setSlideOver(null)}
            embedded
          />
        )}
      </SlideOver>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!deleteTarget}
        title={`Excluir ${deleteTarget?.type === 'module' ? 'Módulo' : 'Aula'}`}
        message={
          deleteTarget?.hasChildren
            ? `Tem certeza? "${deleteTarget.title}" contém ${deleteTarget.childCount} aula(s) que também serão excluídas. Esta ação é irreversível.`
            : `Tem certeza que deseja excluir "${deleteTarget?.title}"? Esta ação é irreversível.`
        }
        confirmLabel="Excluir"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        isLoading={isDeleting}
      />
    </>
  );
}
