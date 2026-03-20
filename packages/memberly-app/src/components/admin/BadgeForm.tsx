'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { apiRequest, ApiRequestError } from '@/lib/utils/api';
import { useToastStore } from '@/stores/toast-store';
import type { Badge } from '@/types/database';

const CRITERIA_OPTIONS = [
  { value: 'FIRST_LESSON', label: 'Primeira aula completada' },
  { value: 'COURSE_COMPLETE', label: 'Curso completo' },
  { value: 'STREAK_7', label: 'Streak de 7 dias' },
  { value: 'STREAK_30', label: 'Streak de 30 dias' },
  { value: 'COMMENTS_10', label: '10 comentarios' },
  { value: 'EXPLORER_3', label: 'Acessar 3 produtos' },
  { value: 'LESSONS_50', label: '50 aulas completadas' },
];

export interface BadgeFormData {
  name: string;
  description: string;
  icon_url: string;
  criteria_type: string;
  threshold: number;
  active: boolean;
}

interface BadgeFormProps {
  badge?: Badge;
}

export function BadgeForm({ badge }: BadgeFormProps) {
  const router = useRouter();
  const addToast = useToastStore((s) => s.addToast);
  const isEditing = !!badge;

  const badgeCriteria = badge?.criteria as Record<string, unknown> | undefined;

  const [name, setName] = useState(badge?.name ?? '');
  const [description, setDescription] = useState(badge?.description ?? '');
  const [iconUrl, setIconUrl] = useState(badge?.icon_url ?? '');
  const [criteriaType, setCriteriaType] = useState(
    (badgeCriteria?.type as string) ?? 'FIRST_LESSON'
  );
  const [threshold, setThreshold] = useState(
    (badgeCriteria?.threshold as number) ?? 1
  );
  const [active, setActive] = useState(badge?.active ?? true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) {
      newErrors.name = 'Nome e obrigatorio';
    }
    if (!criteriaType) {
      newErrors.criteria_type = 'Criterio e obrigatorio';
    }
    if (threshold < 1) {
      newErrors.threshold = 'Threshold deve ser pelo menos 1';
    }
    if (iconUrl && !iconUrl.startsWith('/')) {
      try {
        new URL(iconUrl);
      } catch {
        newErrors.icon_url = 'URL invalida';
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const payload = {
        name,
        description,
        icon_url: iconUrl || null,
        criteria_type: criteriaType,
        threshold,
        active,
      };

      if (isEditing) {
        await apiRequest(`/api/admin/badges/${badge.id}`, {
          method: 'PATCH',
          body: JSON.stringify(payload),
        });
        addToast('Badge atualizado com sucesso', 'success');
      } else {
        await apiRequest('/api/admin/badges', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
        addToast('Badge criado com sucesso', 'success');
      }
      router.push('/admin/badges');
      router.refresh();
    } catch (err) {
      addToast(
        err instanceof ApiRequestError ? err.message : 'Erro ao salvar badge',
        'error'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Input
        id="name"
        label="Nome *"
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Ex: Primeira Aula"
        error={errors.name}
      />

      <Textarea
        id="description"
        label="Descricao"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows={3}
        placeholder="Descreva o badge..."
      />

      <Input
        id="icon_url"
        label="URL do Icone"
        type="text"
        value={iconUrl}
        onChange={(e) => setIconUrl(e.target.value)}
        placeholder="https://example.com/icon.png ou /icons/badge.png"
        error={errors.icon_url}
      />

      <div>
        <label htmlFor="criteria_type" className="block text-sm font-medium text-gray-700">
          Criterio *
        </label>
        <select
          id="criteria_type"
          value={criteriaType}
          onChange={(e) => setCriteriaType(e.target.value)}
          className="mt-1 block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/30"
        >
          {CRITERIA_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {errors.criteria_type && (
          <p className="mt-1 text-sm text-red-600">{errors.criteria_type}</p>
        )}
      </div>

      <Input
        id="threshold"
        label="Threshold *"
        type="number"
        value={String(threshold)}
        onChange={(e) => setThreshold(parseInt(e.target.value, 10) || 1)}
        error={errors.threshold}
      />

      <div className="flex items-center gap-3">
        <label htmlFor="active" className="text-sm font-medium text-gray-700">
          Ativo
        </label>
        <button
          type="button"
          id="active"
          role="switch"
          aria-checked={active}
          onClick={() => setActive(!active)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            active ? 'bg-blue-600' : 'bg-gray-300'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              active ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>

      <div className="flex gap-3">
        <Button type="submit" isLoading={isSubmitting}>
          {isEditing ? 'Salvar Alteracoes' : 'Criar Badge'}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push('/admin/badges')}
          disabled={isSubmitting}
        >
          Cancelar
        </Button>
      </div>
    </form>
  );
}
