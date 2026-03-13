'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Reorder, motion, AnimatePresence, useDragControls } from 'motion/react';
import {
  Plus,
  PlayCircle,
  Clock,
  GripVertical,
  Paperclip,
  Copy,
  Pencil,
  Trash2,
} from 'lucide-react';
import { LessonForm } from '@/components/admin/LessonForm';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { apiRequest, ApiRequestError } from '@/lib/utils/api';
import { useToastStore } from '@/stores/toast-store';
import type { Lesson } from '@/types/database';

interface LessonListProps {
  moduleId: string;
  moduleTitle: string;
  lessons: Lesson[];
}

function formatDuration(minutes: number): string {
  if (minutes === 0) return '0min';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}min`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}min`;
}

function attachmentCount(lesson: Lesson): number {
  let count = 0;
  if (lesson.attachments && lesson.attachments.length > 0) count += lesson.attachments.length;
  if (lesson.pdf_url) count += 1;
  return count;
}

function LessonRow({
  lesson,
  index,
  onToggleStatus,
  onDuplicate,
  onEdit,
  onDelete,
}: {
  lesson: Lesson;
  index: number;
  onToggleStatus: () => void;
  onDuplicate: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const dragControls = useDragControls();
  const attCount = attachmentCount(lesson);

  return (
    <Reorder.Item
      value={lesson}
      id={lesson.id}
      dragListener={false}
      dragControls={dragControls}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="group relative flex flex-col md:flex-row md:items-center px-4 py-3.5 border-b border-slate-100 bg-white hover:bg-slate-50 transition-colors cursor-default"
      whileDrag={{
        scale: 1.01,
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
        zIndex: 50,
        backgroundColor: '#ffffff',
      }}
    >
      {/* Drag Handle + Index + Title */}
      <div className="flex items-center w-full md:w-auto md:flex-1 gap-3 mb-3 md:mb-0">
        <div
          className="cursor-grab active:cursor-grabbing w-8 h-8 flex items-center justify-center text-slate-300 hover:text-slate-500 transition-colors shrink-0 touch-none"
          onPointerDown={(e) => dragControls.start(e)}
        >
          <GripVertical size={20} />
        </div>

        <div className="w-7 h-7 rounded-lg bg-slate-100 text-xs font-semibold text-slate-600 flex items-center justify-center shrink-0">
          {index + 1}
        </div>

        <div className="flex items-center gap-1.5 min-w-0">
          <span className="font-medium text-slate-900 truncate group-hover:text-blue-600 transition-colors">
            {lesson.title}
          </span>
          {attCount > 0 && (
            <Paperclip size={14} className="text-slate-400 shrink-0" />
          )}
        </div>
      </div>

      {/* Badges & Actions */}
      <div className="flex items-center justify-between md:justify-end w-full md:w-auto pl-11 md:pl-0 gap-4 md:gap-0">
        <div className="flex items-center gap-4 md:gap-0 flex-1 md:flex-none">
          {/* Provider */}
          <div className="md:w-24 shrink-0">
            {lesson.video_provider === 'youtube' ? (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-700 ring-1 ring-inset ring-red-200">
                YouTube
              </span>
            ) : (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200">
                Panda
              </span>
            )}
          </div>

          {/* Duration */}
          <div className="md:w-20 text-sm text-slate-500 md:text-center shrink-0">
            {lesson.duration_minutes ? `${lesson.duration_minutes} min` : '—'}
          </div>

          {/* Status toggle */}
          <div className="md:w-24 shrink-0">
            <button
              onClick={onToggleStatus}
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ring-1 ring-inset transition-opacity hover:opacity-80 ${
                lesson.is_published
                  ? 'bg-emerald-50 text-emerald-700 ring-emerald-200'
                  : 'bg-slate-100 text-slate-600 ring-slate-200'
              }`}
            >
              {lesson.is_published ? 'Publicada' : 'Rascunho'}
            </button>
          </div>

          {/* Drip days */}
          <div className="hidden lg:block md:w-20 text-center shrink-0">
            {lesson.drip_days ? (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700">
                {lesson.drip_days} dias
              </span>
            ) : (
              <span className="text-slate-300">&mdash;</span>
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div className="md:w-28 flex items-center justify-end gap-1 shrink-0">
          <Button
            variant="icon"
            size="sm"
            title="Duplicar"
            onClick={onDuplicate}
            className="text-purple-500 hover:bg-purple-50"
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

export function LessonList({
  moduleId,
  moduleTitle,
  lessons: initialLessons,
}: LessonListProps) {
  const router = useRouter();
  const addToast = useToastStore((s) => s.addToast);
  const [lessons, setLessons] = useState(initialLessons);
  const [showForm, setShowForm] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Lesson | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const publishedCount = lessons.filter((l) => l.is_published).length;
  const draftCount = lessons.length - publishedCount;
  const totalDuration = lessons.reduce((acc, l) => acc + (l.duration_minutes ?? 0), 0);

  const handleReorder = async (newItems: Lesson[]) => {
    setLessons(newItems);
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

  return (
    <>
      {/* Page header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6"
      >
        <h2 className="text-2xl font-bold text-slate-900">
          Aulas &mdash; {moduleTitle}
        </h2>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg h-10 px-4 font-medium text-sm transition-colors shadow-sm shrink-0"
        >
          <Plus size={18} />
          Nova Aula
        </button>
      </motion.div>

      {/* Stats bar */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="bg-white rounded-xl border border-slate-200 p-4 flex flex-wrap items-center gap-x-6 gap-y-3 mb-5 shadow-sm"
      >
        <div className="flex items-center gap-2">
          <PlayCircle size={20} className="text-slate-400" />
          <span className="text-sm font-medium text-slate-700">{lessons.length} aulas</span>
        </div>
        <div className="hidden sm:block w-px h-5 bg-slate-200" />
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500" />
          <span className="text-sm font-medium text-emerald-600">{publishedCount} publicadas</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-amber-500" />
          <span className="text-sm font-medium text-amber-600">{draftCount} rascunhos</span>
        </div>
        <div className="hidden sm:block w-px h-5 bg-slate-200" />
        <div className="flex items-center gap-2">
          <Clock size={20} className="text-slate-400" />
          <span className="text-sm font-medium text-slate-600">{formatDuration(totalDuration)} total</span>
        </div>
      </motion.div>

      {/* Lesson list */}
      {lessons.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="py-16 border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center bg-white"
        >
          <PlayCircle size={48} className="text-slate-300 mb-4" />
          <h3 className="text-lg font-medium text-slate-500 mb-1">Nenhuma aula criada</h3>
          <p className="text-sm text-slate-400 mb-4">
            Comece adicionando a primeira aula deste módulo.
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg h-10 px-4 font-medium text-sm transition-colors shadow-sm"
          >
            Criar Primeira Aula
          </button>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm"
        >
          {/* Table header (desktop) */}
          <div className="hidden md:flex items-center bg-slate-50/80 px-4 py-3 border-b border-slate-200">
            <div className="w-8 shrink-0" />
            <div className="flex-1 text-xs uppercase font-semibold tracking-wider text-slate-500">Aula</div>
            <div className="w-24 text-xs uppercase font-semibold tracking-wider text-slate-500">Provedor</div>
            <div className="w-20 text-xs uppercase font-semibold tracking-wider text-slate-500 text-center">Duração</div>
            <div className="w-24 text-xs uppercase font-semibold tracking-wider text-slate-500">Status</div>
            <div className="w-20 hidden lg:block text-xs uppercase font-semibold tracking-wider text-slate-500 text-center">Drip</div>
            <div className="w-28 text-xs uppercase font-semibold tracking-wider text-slate-500 text-right">Ações</div>
          </div>

          {/* Draggable rows */}
          <Reorder.Group axis="y" values={lessons} onReorder={handleReorder} className="flex flex-col">
            <AnimatePresence>
              {lessons.map((lesson, index) => (
                <LessonRow
                  key={lesson.id}
                  lesson={lesson}
                  index={index}
                  onToggleStatus={() => handleTogglePublish(lesson)}
                  onDuplicate={() => handleDuplicate(lesson)}
                  onEdit={() => setEditingLesson(lesson)}
                  onDelete={() => setDeleteTarget(lesson)}
                />
              ))}
            </AnimatePresence>
          </Reorder.Group>
        </motion.div>
      )}

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
