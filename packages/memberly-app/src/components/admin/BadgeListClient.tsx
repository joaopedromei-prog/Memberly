'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { apiRequest, ApiRequestError } from '@/lib/utils/api';
import { useToastStore } from '@/stores/toast-store';
import type { Badge } from '@/types/database';

interface BadgeListClientProps {
  badges: Badge[];
}

const CRITERIA_LABELS: Record<string, string> = {
  FIRST_LESSON: 'Primeira aula',
  COURSE_COMPLETE: 'Curso completo',
  STREAK_7: 'Streak 7 dias',
  STREAK_30: 'Streak 30 dias',
  COMMENTS_10: '10 comentarios',
  EXPLORER_3: 'Explorador 3 produtos',
  LESSONS_50: '50 aulas',
};

export function BadgeListClient({ badges: initialBadges }: BadgeListClientProps) {
  const addToast = useToastStore((s) => s.addToast);
  const [badges, setBadges] = useState(initialBadges);
  const [deleteTarget, setDeleteTarget] = useState<Badge | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const handleToggleActive = async (badge: Badge) => {
    setTogglingId(badge.id);
    const newActive = !badge.active;

    // Optimistic update
    setBadges((prev) =>
      prev.map((b) => (b.id === badge.id ? { ...b, active: newActive } : b))
    );

    try {
      await apiRequest(`/api/admin/badges/${badge.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ active: newActive }),
      });
      addToast(
        newActive ? 'Badge ativado' : 'Badge desativado',
        'success'
      );
    } catch (err) {
      // Revert on error
      setBadges((prev) =>
        prev.map((b) => (b.id === badge.id ? { ...b, active: badge.active } : b))
      );
      addToast(
        err instanceof ApiRequestError ? err.message : 'Erro ao alterar status',
        'error'
      );
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);

    try {
      await apiRequest(`/api/admin/badges/${deleteTarget.id}`, { method: 'DELETE' });
      setBadges((prev) => prev.filter((b) => b.id !== deleteTarget.id));
      addToast('Badge excluido com sucesso', 'success');
      setDeleteTarget(null);
    } catch (err) {
      addToast(
        err instanceof ApiRequestError ? err.message : 'Erro ao excluir badge',
        'error'
      );
    } finally {
      setIsDeleting(false);
    }
  };

  if (badges.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-12 text-center">
        <p className="text-base font-medium text-slate-500">Nenhum badge criado</p>
        <p className="mt-1 text-sm text-slate-400">Comece criando seu primeiro badge.</p>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="border-b border-slate-200 bg-slate-50/80">
              <tr>
                <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Badge
                </th>
                <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Criterio
                </th>
                <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500 text-center">
                  Threshold
                </th>
                <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500 text-center">
                  Status
                </th>
                <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Criado em
                </th>
                <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500 text-right">
                  Acoes
                </th>
              </tr>
            </thead>
            <tbody>
              {badges.map((badge) => {
                const criteria = badge.criteria as Record<string, unknown>;
                return (
                  <tr
                    key={badge.id}
                    className="group border-b border-slate-100 last:border-none transition-colors duration-150 hover:bg-slate-50"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {badge.icon_url ? (
                          <img
                            src={badge.icon_url}
                            alt=""
                            className="h-8 w-8 rounded-md object-cover"
                          />
                        ) : (
                          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-amber-100 text-amber-600">
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                            </svg>
                          </div>
                        )}
                        <div>
                          <div className="text-sm font-medium text-slate-900">{badge.name}</div>
                          {badge.description && (
                            <div className="mt-0.5 text-xs text-slate-400 line-clamp-1">
                              {badge.description}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {CRITERIA_LABELS[criteria.type as string] ?? (criteria.type as string)}
                    </td>
                    <td className="px-6 py-4 text-center text-sm text-slate-600">
                      {criteria.threshold as number}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        type="button"
                        role="switch"
                        aria-checked={badge.active}
                        disabled={togglingId === badge.id}
                        onClick={() => handleToggleActive(badge)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors disabled:opacity-50 ${
                          badge.active ? 'bg-emerald-500' : 'bg-gray-300'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            badge.active ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500 whitespace-nowrap">
                      {new Date(badge.created_at).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/admin/badges/${badge.id}/edit`}
                          title="Editar"
                          className="flex h-8 w-8 items-center justify-center rounded-md text-admin-primary transition-colors hover:bg-blue-50"
                        >
                          <Pencil className="h-4 w-4" />
                        </Link>
                        <Button
                          variant="icon"
                          size="sm"
                          title="Excluir"
                          onClick={() => setDeleteTarget(badge)}
                          className="text-red-500 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile List */}
        <div className="divide-y divide-slate-100 md:hidden">
          {badges.map((badge) => {
            const criteria = badge.criteria as Record<string, unknown>;
            return (
              <div key={badge.id} className="p-4 transition-colors duration-150 hover:bg-slate-50">
                <div className="mb-3 flex items-start gap-3">
                  {badge.icon_url ? (
                    <img
                      src={badge.icon_url}
                      alt=""
                      className="h-10 w-10 rounded-md object-cover"
                    />
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-md bg-amber-100 text-amber-600">
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                      </svg>
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium text-slate-900">{badge.name}</div>
                    {badge.description && (
                      <div className="mt-0.5 text-xs text-slate-400 truncate">
                        {badge.description}
                      </div>
                    )}
                  </div>
                </div>

                <div className="mb-3 flex flex-wrap items-center gap-3 pl-[52px]">
                  <span className="text-xs text-slate-500">
                    {CRITERIA_LABELS[criteria.type as string] ?? (criteria.type as string)}
                  </span>
                  <span className="text-xs text-slate-500">•</span>
                  <span className="text-xs text-slate-500">
                    Threshold: {criteria.threshold as number}
                  </span>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={badge.active}
                    disabled={togglingId === badge.id}
                    onClick={() => handleToggleActive(badge)}
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors disabled:opacity-50 ${
                      badge.active ? 'bg-emerald-500' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                        badge.active ? 'translate-x-[18px]' : 'translate-x-0.5'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between pl-[52px]">
                  <span className="text-xs text-slate-400">
                    {new Date(badge.created_at).toLocaleDateString('pt-BR')}
                  </span>
                  <div className="flex items-center gap-1">
                    <Link
                      href={`/admin/badges/${badge.id}/edit`}
                      className="flex h-8 w-8 items-center justify-center rounded-md text-admin-primary transition-colors hover:bg-blue-50"
                    >
                      <Pencil className="h-4 w-4" />
                    </Link>
                    <Button
                      variant="icon"
                      size="sm"
                      onClick={() => setDeleteTarget(badge)}
                      className="text-red-500 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Delete Confirm Dialog */}
      <ConfirmDialog
        open={!!deleteTarget}
        title="Excluir Badge"
        message={`Tem certeza que deseja excluir "${deleteTarget?.name}"? Membros que desbloquearam este badge perderao o registro. Esta acao e irreversivel.`}
        confirmLabel="Excluir"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        isLoading={isDeleting}
      />
    </>
  );
}
