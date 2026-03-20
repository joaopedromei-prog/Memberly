'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useUnsavedChanges } from '@/hooks/useUnsavedChanges';
import { Textarea } from '@/components/ui/Textarea';
import { BannerGenerator } from '@/components/admin/BannerGenerator';
import { apiRequest, ApiRequestError } from '@/lib/utils/api';
import { useToastStore } from '@/stores/toast-store';
import type { Module } from '@/types/database';

interface ModuleFormProps {
  productId: string;
  module?: Module;
  onSuccess: () => void;
  onCancel: () => void;
  embedded?: boolean;
}

export function ModuleForm({
  productId,
  module,
  onSuccess,
  onCancel,
  embedded,
}: ModuleFormProps) {
  const addToast = useToastStore((s) => s.addToast);
  const isEditing = !!module;

  const [title, setTitle] = useState(module?.title ?? '');
  const [description, setDescription] = useState(module?.description ?? '');
  const [bannerUrl, setBannerUrl] = useState<string | null>(
    module?.banner_url ?? null
  );
  const [dripDays, setDripDays] = useState<string>(
    module?.drip_days?.toString() ?? ''
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [isDirty, setIsDirty] = useState(false);
  useUnsavedChanges(isDirty);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      setError('Título é obrigatório');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      if (isEditing) {
        await apiRequest(`/api/modules/${module.id}`, {
          method: 'PATCH',
          body: JSON.stringify({ title, description, banner_url: bannerUrl, drip_days: dripDays ? parseInt(dripDays, 10) : null }),
        });
        addToast('Módulo atualizado com sucesso', 'success');
      } else {
        await apiRequest(`/api/products/${productId}/modules`, {
          method: 'POST',
          body: JSON.stringify({ title, description, banner_url: bannerUrl, drip_days: dripDays ? parseInt(dripDays, 10) : null }),
        });
        addToast('Módulo criado com sucesso', 'success');
      }
      onSuccess();
    } catch (err) {
      addToast(
        err instanceof ApiRequestError ? err.message : 'Erro ao salvar módulo',
        'error'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const formContent = (
    <form onSubmit={handleSubmit} onChange={() => setIsDirty(true)} className="space-y-4">
      <Input
        id="module-title"
        label="Título *"
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Ex: Módulo 1 — Fundamentos"
        error={error}
      />

      <Textarea
        id="module-description"
        label="Descrição"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows={3}
        placeholder="Descreva o módulo..."
      />

      <Input
        id="module-drip"
        label="Disponível após X dias da compra"
        type="number"
        min={0}
        value={dripDays}
        onChange={(e) => setDripDays(e.target.value)}
        className="w-32"
        placeholder="0"
        helperText="Deixe vazio para disponibilizar imediatamente. Aulas herdam este valor como mínimo."
      />

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Banner
        </label>
        <div className="mt-1">
          <BannerGenerator
            currentBannerUrl={bannerUrl ?? undefined}
            defaultPrompt={title ? `${title} - banner profissional, moderno, 16:9` : ''}
            onBannerGenerated={(url) => setBannerUrl(url)}
            onBannerRemoved={() => setBannerUrl(null)}
            entityType="module"
            entityName={title}
          />
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="submit" isLoading={isSubmitting}>
          {isEditing ? 'Salvar' : 'Criar Módulo'}
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
        {isEditing ? 'Editar Módulo' : 'Novo Módulo'}
      </h3>
      {formContent}
    </div>
  );
}
