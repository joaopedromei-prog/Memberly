'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/Button';
import { SortableList } from '@/components/ui/SortableList';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { InlineEditableField } from '@/components/admin/ai-wizard/InlineEditableField';
import { PlaceholderBanner } from '@/components/admin/ai-wizard/PlaceholderBanner';
import type { GeneratedStructure, WizardBanners, BannerState } from '@/types/ai';

// === Internal types with ai_generated flag and id for dnd ===

interface EditableLesson {
  id: string;
  title: string;
  description: string;
  durationMinutes: number;
  ai_generated: boolean;
}

interface EditableModule {
  id: string;
  title: string;
  description: string;
  bannerSuggestion: string;
  ai_generated: boolean;
  lessons: EditableLesson[];
}

interface EditableStructure {
  product: {
    title: string;
    description: string;
    bannerSuggestion: string;
  };
  modules: EditableModule[];
}

function toEditable(structure: GeneratedStructure): EditableStructure {
  return {
    product: { ...structure.product },
    modules: structure.modules.map((m, mi) => ({
      id: `module-${mi}-${Date.now()}`,
      title: m.title,
      description: m.description,
      bannerSuggestion: m.bannerSuggestion,
      ai_generated: true,
      lessons: m.lessons.map((l, li) => ({
        id: `lesson-${mi}-${li}-${Date.now()}`,
        title: l.title,
        description: l.description,
        durationMinutes: l.durationMinutes,
        ai_generated: true,
      })),
    })),
  };
}

function toGeneratedStructure(editable: EditableStructure): GeneratedStructure {
  return {
    product: editable.product,
    modules: editable.modules.map((m) => ({
      title: m.title,
      description: m.description,
      bannerSuggestion: m.bannerSuggestion,
      lessons: m.lessons.map((l) => ({
        title: l.title,
        description: l.description,
        durationMinutes: l.durationMinutes,
      })),
    })),
  };
}

// === AI Badge ===

function AiBadge() {
  return (
    <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-medium text-indigo-600">
      <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
      </svg>
      IA
    </span>
  );
}

// === Drag Handle ===

function DragHandle(props: Record<string, unknown>) {
  return (
    <button
      type="button"
      className="cursor-grab touch-none text-gray-400 hover:text-gray-600"
      aria-label="Arrastar para reordenar"
      {...props}
    >
      <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <circle cx="7" cy="4" r="1.5" />
        <circle cx="13" cy="4" r="1.5" />
        <circle cx="7" cy="10" r="1.5" />
        <circle cx="13" cy="10" r="1.5" />
        <circle cx="7" cy="16" r="1.5" />
        <circle cx="13" cy="16" r="1.5" />
      </svg>
    </button>
  );
}

// === Banner Preview ===

function BannerPreviewItem({
  banner,
  title,
  onReject,
  onRegenerate,
  isRegenerating,
}: {
  banner: BannerState;
  title: string;
  onReject: () => void;
  onRegenerate: () => void;
  isRegenerating: boolean;
}) {
  if (banner.status === 'rejected' || banner.status === 'failed' || !banner.url) {
    return (
      <div className="space-y-1">
        <PlaceholderBanner title={title} className="w-full" />
        <button
          type="button"
          onClick={onRegenerate}
          disabled={isRegenerating}
          className="text-xs text-purple-600 hover:text-purple-800 disabled:opacity-50"
        >
          {isRegenerating ? 'Gerando...' : 'Regenerar banner'}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <div className="aspect-video overflow-hidden rounded-lg">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={banner.url} alt={`Banner: ${title}`} className="h-full w-full object-cover" />
      </div>
      <div className="flex gap-2">
        <button type="button" onClick={onReject} className="text-xs text-gray-500 hover:text-red-600">
          Rejeitar
        </button>
        <button
          type="button"
          onClick={onRegenerate}
          disabled={isRegenerating}
          className="text-xs text-purple-600 hover:text-purple-800 disabled:opacity-50"
        >
          {isRegenerating ? 'Gerando...' : 'Regenerar'}
        </button>
      </div>
    </div>
  );
}

// === Main Component ===

interface AiWizardStep3Props {
  structure: GeneratedStructure;
  banners: WizardBanners | null;
  onApprove: (edited: GeneratedStructure, banners?: WizardBanners | null) => void;
  onRegenerate: () => void;
  onBack: () => void;
  isSaving: boolean;
}

export function AiWizardStep3({
  structure,
  banners,
  onApprove,
  onRegenerate,
  onBack,
  isSaving,
}: AiWizardStep3Props) {
  const [data, setData] = useState<EditableStructure>(() => toEditable(structure));
  const [bannerState, setBannerState] = useState<WizardBanners | null>(banners);
  const [regeneratingIndex, setRegeneratingIndex] = useState<number | null>(null);
  const [expandedModules, setExpandedModules] = useState<Set<string>>(
    new Set(data.modules.map((m) => m.id))
  );
  const [confirmRemove, setConfirmRemove] = useState<{
    type: 'module' | 'lesson';
    moduleId: string;
    lessonId?: string;
    hasChildren: boolean;
  } | null>(null);

  // === Module operations ===

  const updateModule = useCallback(
    (moduleId: string, updates: Partial<EditableModule>) => {
      setData((prev) => ({
        ...prev,
        modules: prev.modules.map((m) =>
          m.id === moduleId ? { ...m, ...updates, ai_generated: false } : m
        ),
      }));
    },
    []
  );

  const addModule = useCallback(() => {
    const newModule: EditableModule = {
      id: `module-new-${Date.now()}`,
      title: 'Novo Módulo',
      description: 'Descrição do módulo',
      bannerSuggestion: '',
      ai_generated: false,
      lessons: [
        {
          id: `lesson-new-${Date.now()}`,
          title: 'Nova Aula',
          description: 'Descrição da aula',
          durationMinutes: 15,
          ai_generated: false,
        },
      ],
    };
    setData((prev) => ({
      ...prev,
      modules: [...prev.modules, newModule],
    }));
    setExpandedModules((prev) => new Set([...prev, newModule.id]));
  }, []);

  const removeModule = useCallback((moduleId: string) => {
    setData((prev) => ({
      ...prev,
      modules: prev.modules.filter((m) => m.id !== moduleId),
    }));
    setConfirmRemove(null);
  }, []);

  const reorderModules = useCallback((reordered: EditableModule[]) => {
    setData((prev) => ({ ...prev, modules: reordered }));
  }, []);

  // === Lesson operations ===

  const updateLesson = useCallback(
    (moduleId: string, lessonId: string, updates: Partial<EditableLesson>) => {
      setData((prev) => ({
        ...prev,
        modules: prev.modules.map((m) =>
          m.id === moduleId
            ? {
                ...m,
                lessons: m.lessons.map((l) =>
                  l.id === lessonId ? { ...l, ...updates, ai_generated: false } : l
                ),
              }
            : m
        ),
      }));
    },
    []
  );

  const addLesson = useCallback((moduleId: string) => {
    const newLesson: EditableLesson = {
      id: `lesson-new-${Date.now()}`,
      title: 'Nova Aula',
      description: 'Descrição da aula',
      durationMinutes: 15,
      ai_generated: false,
    };
    setData((prev) => ({
      ...prev,
      modules: prev.modules.map((m) =>
        m.id === moduleId ? { ...m, lessons: [...m.lessons, newLesson] } : m
      ),
    }));
  }, []);

  const removeLesson = useCallback((moduleId: string, lessonId: string) => {
    setData((prev) => ({
      ...prev,
      modules: prev.modules.map((m) =>
        m.id === moduleId
          ? { ...m, lessons: m.lessons.filter((l) => l.id !== lessonId) }
          : m
      ),
    }));
    setConfirmRemove(null);
  }, []);

  const reorderLessons = useCallback(
    (moduleId: string, reordered: EditableLesson[]) => {
      setData((prev) => ({
        ...prev,
        modules: prev.modules.map((m) =>
          m.id === moduleId ? { ...m, lessons: reordered } : m
        ),
      }));
    },
    []
  );

  // === Banner operations ===

  async function regenerateBanner(
    entityType: 'product' | 'module',
    index: number,
    description: string,
    entityName: string
  ) {
    const regenIdx = entityType === 'product' ? -1 : index;
    setRegeneratingIndex(regenIdx);

    try {
      const response = await fetch('/api/ai/generate-banner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description,
          entityType,
          entityName,
          productSlug: data.product.title,
          index,
        }),
      });

      const newBanner: BannerState = response.ok
        ? { status: 'generated', url: (await response.json()).bannerUrl }
        : { status: 'failed', url: null };

      setBannerState((prev) => {
        if (!prev) {
          // Create initial banner state if none exists
          const initial: WizardBanners = {
            product: { status: 'pending', url: null },
            modules: data.modules.map(() => ({ status: 'pending', url: null })),
          };
          if (entityType === 'product') return { ...initial, product: newBanner };
          const modules = [...initial.modules];
          modules[index] = newBanner;
          return { ...initial, modules };
        }
        if (entityType === 'product') return { ...prev, product: newBanner };
        const modules = [...prev.modules];
        modules[index] = newBanner;
        return { ...prev, modules };
      });
    } catch {
      // Keep current state on error
    } finally {
      setRegeneratingIndex(null);
    }
  }

  function rejectBanner(entityType: 'product' | 'module', index: number) {
    setBannerState((prev) => {
      if (!prev) return prev;
      const rejected: BannerState = { status: 'rejected', url: null };
      if (entityType === 'product') return { ...prev, product: rejected };
      const modules = [...prev.modules];
      modules[index] = rejected;
      return { ...prev, modules };
    });
  }

  const hasBanners = bannerState !== null;

  // === Toggle expand ===

  function toggleModule(moduleId: string) {
    setExpandedModules((prev) => {
      const next = new Set(prev);
      if (next.has(moduleId)) {
        next.delete(moduleId);
      } else {
        next.add(moduleId);
      }
      return next;
    });
  }

  // === Counts ===

  const totalLessons = data.modules.reduce((sum, m) => sum + m.lessons.length, 0);

  // === Confirm remove handler ===

  function handleRemoveRequest(
    type: 'module' | 'lesson',
    moduleId: string,
    lessonId?: string
  ) {
    if (type === 'module') {
      const mod = data.modules.find((m) => m.id === moduleId);
      if (mod && mod.lessons.length > 0) {
        setConfirmRemove({ type, moduleId, hasChildren: true });
        return;
      }
    }
    // Direct remove for lessons or empty modules
    if (type === 'lesson' && lessonId) {
      removeLesson(moduleId, lessonId);
    } else {
      removeModule(moduleId);
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-gray-900">Revise a Estrutura Gerada</h2>
        <p className="mt-1 text-sm text-gray-500">
          {data.modules.length} módulos, {totalLessons} aulas no total — clique para editar
        </p>
      </div>

      {/* Product Header */}
      <div className="rounded-lg border border-purple-200 bg-purple-50 p-4">
        <div className={hasBanners ? 'flex gap-4' : ''}>
          {hasBanners && (
            <div className="w-40 flex-shrink-0">
              <BannerPreviewItem
                banner={bannerState.product}
                title={data.product.title}
                onReject={() => rejectBanner('product', 0)}
                onRegenerate={() =>
                  regenerateBanner('product', 0, data.product.bannerSuggestion, data.product.title)
                }
                isRegenerating={regeneratingIndex === -1}
              />
            </div>
          )}
          <div className="flex-1">
            <InlineEditableField
              value={data.product.title}
              onChange={(title) =>
                setData((prev) => ({ ...prev, product: { ...prev.product, title } }))
              }
              as="h3"
              className="font-semibold text-purple-900"
              inputClassName="text-base font-semibold"
            />
            <InlineEditableField
              value={data.product.description}
              onChange={(description) =>
                setData((prev) => ({
                  ...prev,
                  product: { ...prev.product, description },
                }))
              }
              as="p"
              className="mt-1 text-sm text-purple-700"
              inputClassName="text-sm"
              multiline
            />
          </div>
        </div>
      </div>

      {/* Module Tree with drag-and-drop */}
      <div className="space-y-3">
        <SortableList
          items={data.modules}
          onReorder={reorderModules}
          renderItem={(module, dragHandleProps) => {
            const moduleIndex = data.modules.findIndex((m) => m.id === module.id);
            return (
              <div className="mb-3 rounded-lg border border-gray-200 bg-white">
                {/* Module Header */}
                <div className="flex items-center gap-2 p-4">
                  <DragHandle {...dragHandleProps} />
                  <button
                    type="button"
                    onClick={() => toggleModule(module.id)}
                    className="flex flex-1 items-center gap-3 text-left"
                  >
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-purple-100 text-xs font-semibold text-purple-700">
                      {moduleIndex + 1}
                    </span>
                    <div className="flex-1">
                      <div className="flex items-center">
                        <span className="font-medium text-gray-900">{module.title}</span>
                        {module.ai_generated && <AiBadge />}
                      </div>
                      <span className="text-xs text-gray-500">
                        {module.lessons.length} aulas
                      </span>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemoveRequest('module', module.id)}
                    className="rounded p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500"
                    aria-label={`Remover módulo ${module.title}`}
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                  <svg
                    className={`h-5 w-5 shrink-0 text-gray-400 transition-transform ${
                      expandedModules.has(module.id) ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                    onClick={() => toggleModule(module.id)}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>

                {/* Module Content (expanded) */}
                {expandedModules.has(module.id) && (
                  <div className="border-t border-gray-100 px-4 pb-4">
                    {hasBanners && bannerState.modules[moduleIndex] && (
                      <div className="py-3">
                        <div className="w-40">
                          <BannerPreviewItem
                            banner={bannerState.modules[moduleIndex]}
                            title={module.title}
                            onReject={() => rejectBanner('module', moduleIndex)}
                            onRegenerate={() =>
                              regenerateBanner('module', moduleIndex, module.bannerSuggestion, module.title)
                            }
                            isRegenerating={regeneratingIndex === moduleIndex}
                          />
                        </div>
                      </div>
                    )}
                    <div className="py-2">
                      <InlineEditableField
                        value={module.title}
                        onChange={(title) => updateModule(module.id, { title })}
                        as="h4"
                        className="font-medium text-gray-900"
                        inputClassName="text-sm font-medium"
                      />
                      <InlineEditableField
                        value={module.description}
                        onChange={(description) =>
                          updateModule(module.id, { description })
                        }
                        as="p"
                        className="mt-1 text-sm text-gray-600"
                        inputClassName="text-sm"
                        multiline
                      />
                    </div>

                    {/* Lessons with drag-and-drop */}
                    <SortableList
                      items={module.lessons}
                      onReorder={(reordered) =>
                        reorderLessons(module.id, reordered)
                      }
                      renderItem={(lesson, lessonDragProps) => {
                        const lessonIndex = module.lessons.findIndex(
                          (l) => l.id === lesson.id
                        );
                        return (
                          <div className="mb-2 flex items-start gap-2 rounded-md bg-gray-50 p-3">
                            <DragHandle {...lessonDragProps} />
                            <span className="mt-0.5 text-xs font-medium text-gray-400">
                              {moduleIndex + 1}.{lessonIndex + 1}
                            </span>
                            <div className="flex-1">
                              <div className="flex items-center">
                                <InlineEditableField
                                  value={lesson.title}
                                  onChange={(title) =>
                                    updateLesson(module.id, lesson.id, { title })
                                  }
                                  as="span"
                                  className="text-sm font-medium text-gray-800"
                                  inputClassName="text-sm"
                                />
                                {lesson.ai_generated && <AiBadge />}
                              </div>
                              <InlineEditableField
                                value={lesson.description}
                                onChange={(description) =>
                                  updateLesson(module.id, lesson.id, {
                                    description,
                                  })
                                }
                                as="p"
                                className="text-xs text-gray-500"
                                inputClassName="text-xs"
                                multiline
                              />
                            </div>
                            <span className="whitespace-nowrap text-xs text-gray-400">
                              {lesson.durationMinutes} min
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                handleRemoveRequest('lesson', module.id, lesson.id)
                              }
                              className="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-500"
                              aria-label={`Remover aula ${lesson.title}`}
                            >
                              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        );
                      }}
                    />

                    {/* Add Lesson button */}
                    <button
                      type="button"
                      onClick={() => addLesson(module.id)}
                      className="mt-2 inline-flex items-center gap-1 rounded px-3 py-1.5 text-xs font-medium text-purple-600 hover:bg-purple-50"
                    >
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                      </svg>
                      Adicionar Aula
                    </button>
                  </div>
                )}
              </div>
            );
          }}
        />

        {/* Add Module button */}
        <button
          type="button"
          onClick={addModule}
          className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-300 py-3 text-sm font-medium text-gray-500 hover:border-purple-400 hover:text-purple-600"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Adicionar Módulo
        </button>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Button variant="outline" onClick={onBack} disabled={isSaving} className="flex-1">
          Voltar
        </Button>
        <Button variant="outline" onClick={onRegenerate} disabled={isSaving} className="flex-1">
          Regenerar
        </Button>
        <Button
          onClick={() => onApprove(toGeneratedStructure(data), bannerState)}
          isLoading={isSaving}
          className="flex-1 bg-green-600 hover:bg-green-700 focus:ring-green-500"
        >
          Aprovar e Criar
        </Button>
      </div>

      {/* Confirm Dialog */}
      <ConfirmDialog
        open={!!confirmRemove}
        title="Remover Módulo"
        message={
          confirmRemove?.hasChildren
            ? 'Este módulo contém aulas. Ao removê-lo, todas as aulas serão excluídas também. Deseja continuar?'
            : 'Deseja remover este módulo?'
        }
        confirmLabel="Remover"
        onConfirm={() => {
          if (confirmRemove) removeModule(confirmRemove.moduleId);
        }}
        onCancel={() => setConfirmRemove(null)}
      />
    </div>
  );
}
