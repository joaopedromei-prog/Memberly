'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { BannerGenerator } from '@/components/admin/BannerGenerator';
import { slugify } from '@/lib/utils/slugify';
import { apiRequest, ApiRequestError } from '@/lib/utils/api';
import { useToastStore } from '@/stores/toast-store';
import type { Product } from '@/types/database';

interface ProductFormProps {
  product?: Product;
  embedded?: boolean;
}

export function ProductForm({ product, embedded }: ProductFormProps) {
  const router = useRouter();
  const addToast = useToastStore((s) => s.addToast);
  const isEditing = !!product;

  const [title, setTitle] = useState(product?.title ?? '');
  const [description, setDescription] = useState(product?.description ?? '');
  const [slug, setSlug] = useState(product?.slug ?? '');
  const [bannerUrl, setBannerUrl] = useState<string | null>(
    product?.banner_url ?? null
  );
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!slugManuallyEdited && !isEditing) {
      setSlug(slugify(title));
    }
  }, [title, slugManuallyEdited, isEditing]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!title.trim()) {
      newErrors.title = 'Título é obrigatório';
    }
    if (slug && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
      newErrors.slug = 'Slug deve conter apenas letras minúsculas, números e hífens';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      if (isEditing) {
        await apiRequest(`/api/products/${product.id}`, {
          method: 'PATCH',
          body: JSON.stringify({ title, description, slug, banner_url: bannerUrl }),
        });
        addToast('Produto atualizado com sucesso', 'success');
      } else {
        await apiRequest('/api/products', {
          method: 'POST',
          body: JSON.stringify({ title, description, slug, banner_url: bannerUrl }),
        });
        addToast('Produto criado com sucesso', 'success');
      }
      router.push('/admin/products');
      router.refresh();
    } catch (err) {
      if (err instanceof ApiRequestError && err.code === 'DUPLICATE_SLUG') {
        setErrors({ slug: 'Este slug já está em uso' });
      } else {
        addToast(
          err instanceof ApiRequestError ? err.message : 'Erro ao salvar produto',
          'error'
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Input
        id="title"
        label="Título *"
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Ex: Protocolo Saúde Total"
        error={errors.title}
      />

      <div>
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
        >
          <svg
            className={`h-4 w-4 transition-transform ${showAdvanced ? 'rotate-90' : ''}`}
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
          </svg>
          Configurações avançadas
        </button>
        {showAdvanced && (
          <div className="mt-3 rounded-lg border border-gray-200 bg-gray-50 p-4">
            <Input
              id="slug"
              label="Slug (URL)"
              type="text"
              value={slug}
              onChange={(e) => {
                setSlug(e.target.value);
                setSlugManuallyEdited(true);
              }}
              className="bg-white"
              placeholder="protocolo-saude-total"
              error={errors.slug}
              helperText="Gerado automaticamente do título. Edite apenas se necessário."
            />
          </div>
        )}
      </div>

      <Textarea
        id="description"
        label="Descrição"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows={4}
        placeholder="Descreva o produto..."
      />

      <div>
        <label className="block text-sm font-medium text-gray-700">Banner</label>
        <div className="mt-1">
          <BannerGenerator
            currentBannerUrl={bannerUrl ?? undefined}
            defaultPrompt={title ? `${title} - banner profissional, moderno, 16:9` : ''}
            onBannerGenerated={(url) => setBannerUrl(url)}
            onBannerRemoved={() => setBannerUrl(null)}
            entityType="product"
            entityName={title}
            productSlug={slug || undefined}
          />
        </div>
      </div>

      <div className="flex gap-3">
        <Button type="submit" isLoading={isSubmitting}>
          {isEditing ? 'Salvar Alterações' : 'Criar Produto'}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push('/admin/products')}
          disabled={isSubmitting}
        >
          Cancelar
        </Button>
      </div>
    </form>
  );
}
