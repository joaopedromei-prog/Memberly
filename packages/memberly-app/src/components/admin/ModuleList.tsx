'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Reorder, useDragControls } from 'motion/react';
import { motion } from 'motion/react';
import {
  Plus,
  PlayCircle,
  Copy,
  Pencil,
  Trash2,
  GripVertical,
  LayoutGrid,
} from 'lucide-react';
import { ModuleForm } from '@/components/admin/ModuleForm';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { apiRequest, ApiRequestError } from '@/lib/utils/api';
import { useToastStore } from '@/stores/toast-store';
import { MODULE_LIST_GRADIENTS } from '@/lib/constants/gradients';

export interface ModuleListItem {
  id: string;
  title: string;
  description: string;
  banner_url: string | null;
  sort_order: number;
  product_id: string;
  drip_days: number | null;
  created_at: string;
  lessonCount: number;
  publishedCount: number;
  draftCount: number;
}

interface ModuleListProps {
  productId: string;
  modules: ModuleListItem[];
}

function gradientForModule(title: string): string {
  let hash = 0;
  for (let i = 0; i < title.length; i++) {
    hash = title.charCodeAt(i) + ((hash << 5) - hash);
  }
  return MODULE_LIST_GRADIENTS[Math.abs(hash) % MODULE_LIST_GRADIENTS.length];
}

function ModuleCard({
  module,
  productId,
  onEdit,
  onDelete,
  onDuplicate,
}: {
  module: ModuleListItem;
  productId: string;
  onEdit: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
}) {
  const controls = useDragControls();
  const publishedPercent = module.lessonCount > 0
    ? Math.round((module.publishedCount / module.lessonCount) * 100)
    : 0;

  const allPublished = module.lessonCount > 0 && module.publishedCount === module.lessonCount;
  const statusText = allPublished
    ? 'Todas publicadas'
    : `${module.draftCount} rascunho${module.draftCount !== 1 ? 's' : ''}`;
  const statusType = allPublished ? 'success' : 'warning';

  return (
    <Reorder.Item
      value={module}
      id={module.id}
      dragListener={false}
      dragControls={controls}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileDrag={{
        scale: 1.02,
        rotate: 1,
        boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
        opacity: 0.9,
        zIndex: 50,
      }}
      className="group relative bg-white rounded-xl border border-slate-200 p-4 flex flex-col md:flex-row md:items-center gap-4 shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-200"
    >
      {/* Drag handle + Thumbnail + Title (mobile) */}
      <div className="flex items-center gap-4 w-full md:w-auto">
        <div
          className="cursor-grab active:cursor-grabbing text-slate-300 hover:text-slate-500 touch-none flex items-center justify-center w-6 h-10 md:h-auto"
          onPointerDown={(e) => controls.start(e)}
        >
          <GripVertical size={20} />
        </div>

        {module.banner_url ? (
          <img
            src={module.banner_url}
            alt=""
            className="w-20 h-12 rounded-lg shrink-0 object-cover"
          />
        ) : (
          <div
            className="w-20 h-12 rounded-lg shrink-0"
            style={{ background: gradientForModule(module.title) }}
          />
        )}

        {/* Mobile-only title + stats */}
        <div className="flex-1 min-w-0 md:hidden">
          <Link
            href={`/admin/products/${productId}/modules/${module.id}/lessons`}
            className="font-medium text-slate-900 truncate block hover:text-blue-600 transition-colors"
          >
            {module.title}
          </Link>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <span className="flex items-center gap-1 text-xs text-slate-500">
              <PlayCircle size={12} /> {module.lessonCount} aulas
            </span>
          </div>
        </div>
      </div>

      {/* Desktop title + stats */}
      <div className="hidden md:block flex-1 min-w-0">
        <Link
          href={`/admin/products/${productId}/modules/${module.id}/lessons`}
          className="font-medium text-slate-900 truncate block hover:text-blue-600 transition-colors"
        >
          {module.title}
        </Link>
        <div className="flex items-center gap-3 mt-0.5">
          <span className="flex items-center gap-1 text-xs text-slate-500">
            <PlayCircle size={12} /> {module.lessonCount} aulas
          </span>
          <span className="flex items-center gap-1.5">
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                statusType === 'success' ? 'bg-emerald-500' : 'bg-amber-500'
              }`}
            />
            <span
              className={`text-xs ${
                statusType === 'success' ? 'text-emerald-600' : 'text-amber-600'
              }`}
            >
              {statusText}
            </span>
          </span>
        </div>
      </div>

      {/* Actions area */}
      <div className="flex items-center justify-between md:justify-end gap-4 w-full md:w-auto pl-10 md:pl-0 mt-2 md:mt-0">
        {/* Mobile status */}
        <div className="md:hidden flex items-center gap-1.5">
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              statusType === 'success' ? 'bg-emerald-500' : 'bg-amber-500'
            }`}
          />
          <span
            className={`text-xs ${
              statusType === 'success' ? 'text-emerald-600' : 'text-amber-600'
            }`}
          >
            {statusText}
          </span>
        </div>

        {/* Desktop progress bar */}
        <div className="hidden md:flex flex-col gap-1 w-24 shrink-0">
          <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-500"
              style={{ width: `${publishedPercent}%` }}
            />
          </div>
          <span className="text-xs text-slate-400">{publishedPercent}%</span>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-1 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
          <Link
            href={`/admin/products/${productId}/modules/${module.id}/lessons`}
            className="bg-blue-50 text-blue-700 rounded-lg px-3 py-1.5 text-sm font-medium hover:bg-blue-100 transition-colors"
          >
            Aulas ({module.lessonCount})
          </Link>
          <Button
            variant="icon"
            size="sm"
            title="Duplicar"
            onClick={onDuplicate}
            className="text-purple-600 hover:bg-purple-50"
          >
            <Copy size={16} />
          </Button>
          <Button
            variant="icon"
            size="sm"
            title="Editar"
            onClick={onEdit}
            className="text-blue-600 hover:bg-blue-50"
          >
            <Pencil size={16} />
          </Button>
          <Button
            variant="icon"
            size="sm"
            title="Excluir"
            onClick={onDelete}
            className="text-red-500 hover:bg-red-50"
          >
            <Trash2 size={16} />
          </Button>
        </div>
      </div>
    </Reorder.Item>
  );
}

export function ModuleList({ productId, modules: initialModules }: ModuleListProps) {
  const router = useRouter();
  const addToast = useToastStore((s) => s.addToast);
  const [modules, setModules] = useState(initialModules);
  const [showForm, setShowForm] = useState(false);
  const [editingModule, setEditingModule] = useState<ModuleListItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ModuleListItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleReorder = async (newItems: ModuleListItem[]) => {
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

  const handleDuplicate = async (mod: ModuleListItem) => {
    try {
      await apiRequest(`/api/modules/${mod.id}/duplicate`, { method: 'POST' });
      addToast('Módulo duplicado com sucesso', 'success');
      router.refresh();
    } catch (err) {
      addToast(
        err instanceof ApiRequestError ? err.message : 'Erro ao duplicar módulo',
        'error'
      );
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

  return (
    <>
      {/* Header with button */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="flex items-center justify-end mb-4"
      >
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center justify-center gap-2 bg-blue-600 text-white rounded-lg h-10 px-4 font-medium text-sm hover:bg-blue-700 hover:-translate-y-0.5 hover:shadow-md transition-all shrink-0"
        >
          <Plus size={18} />
          Novo Módulo
        </button>
      </motion.div>

      {/* Module list */}
      {modules.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 border-dashed p-12 flex flex-col items-center justify-center text-center">
          <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mb-4">
            <LayoutGrid size={24} className="text-slate-400" />
          </div>
          <h3 className="text-sm font-medium text-slate-900 mb-1">Nenhum módulo encontrado</h3>
          <p className="text-sm text-slate-500 mb-4">
            Comece criando o primeiro módulo do seu curso.
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 rounded-lg h-9 px-4 text-sm font-medium hover:bg-slate-50 transition-colors"
          >
            <Plus size={16} />
            Criar Módulo
          </button>
        </div>
      ) : (
        <Reorder.Group
          axis="y"
          values={modules}
          onReorder={handleReorder}
          className="flex flex-col gap-3"
        >
          {modules.map((mod) => (
            <ModuleCard
              key={mod.id}
              module={mod}
              productId={productId}
              onEdit={() => setEditingModule(mod)}
              onDelete={() => setDeleteTarget(mod)}
              onDuplicate={() => handleDuplicate(mod)}
            />
          ))}
        </Reorder.Group>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Excluir Módulo"
        message={
          deleteTarget && deleteTarget.lessonCount > 0
            ? `Tem certeza? "${deleteTarget.title}" contém ${deleteTarget.lessonCount} aula(s) que também serão excluídas. Esta ação é irreversível.`
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
