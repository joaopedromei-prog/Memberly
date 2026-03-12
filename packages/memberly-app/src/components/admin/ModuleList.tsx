'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SortableList } from '@/components/ui/SortableList';
import { ModuleForm } from '@/components/admin/ModuleForm';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Button } from '@/components/ui/Button';
import { apiRequest, ApiRequestError } from '@/lib/utils/api';
import { useToastStore } from '@/stores/toast-store';
import type { ModuleWithLessonCount } from '@/types/api';

interface ModuleListProps {
  productId: string;
  modules: ModuleWithLessonCount[];
}

export function ModuleList({
  productId,
  modules: initialModules,
}: ModuleListProps) {
  const router = useRouter();
  const addToast = useToastStore((s) => s.addToast);
  const [modules, setModules] = useState(initialModules);
  const [showForm, setShowForm] = useState(false);
  const [editingModule, setEditingModule] = useState<ModuleWithLessonCount | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ModuleWithLessonCount | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const lessonCount = (m: ModuleWithLessonCount) => m.lessons?.[0]?.count ?? 0;

  const handleReorder = async (newItems: ModuleWithLessonCount[]) => {
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

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);

    try {
      await apiRequest(`/api/modules/${deleteTarget.id}`, { method: 'DELETE' });
      setModules((prev) => prev.filter((m) => m.id !== deleteTarget.id));
      addToast('Módulo excluído com sucesso', 'success');
      setDeleteTarget(null);
    } catch (err) {
      addToast(
        err instanceof ApiRequestError ? err.message : 'Erro ao excluir módulo',
        'error'
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingModule(null);
    router.refresh();
  };

  if (showForm || editingModule) {
    return (
      <ModuleForm
        productId={productId}
        module={editingModule ?? undefined}
        onSuccess={handleFormSuccess}
        onCancel={() => {
          setShowForm(false);
          setEditingModule(null);
        }}
      />
    );
  }

  if (modules.length === 0) {
    return (
      <div>
        <div className="mb-4 flex justify-end">
          <Button onClick={() => setShowForm(true)}>Novo Módulo</Button>
        </div>
        <div className="rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
          <p className="text-lg font-medium text-gray-500">
            Nenhum módulo criado
          </p>
          <p className="mt-1 text-sm text-gray-400">
            Comece adicionando o primeiro módulo deste produto.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="mb-4 flex justify-end">
        <Button onClick={() => setShowForm(true)}>Novo Módulo</Button>
      </div>

      <SortableList
        items={modules}
        onReorder={handleReorder}
        renderItem={(module, dragHandleProps) => (
          <div className="mb-2 flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <button
              type="button"
              className="cursor-grab touch-none text-gray-400 hover:text-gray-600"
              aria-label="Arrastar para reordenar"
              {...dragHandleProps}
            >
              ⠿
            </button>

            {module.banner_url ? (
              <img
                src={module.banner_url}
                alt=""
                className="h-12 w-20 rounded object-cover"
              />
            ) : (
              <div className="flex h-12 w-20 items-center justify-center rounded bg-gray-100 text-xs text-gray-400">
                Sem img
              </div>
            )}

            <div className="flex-1">
              <p className="font-medium text-gray-900">{module.title}</p>
              <p className="text-sm text-gray-500">
                {lessonCount(module)} aula{lessonCount(module) !== 1 ? 's' : ''}
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setEditingModule(module)}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Editar
              </button>
              <button
                onClick={() => setDeleteTarget(module)}
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
        title="Excluir Módulo"
        message={
          deleteTarget && lessonCount(deleteTarget) > 0
            ? `Tem certeza? "${deleteTarget.title}" contém ${lessonCount(deleteTarget)} aula(s) que também serão excluídas. Esta ação é irreversível.`
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
