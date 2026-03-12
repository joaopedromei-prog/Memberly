'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { ImageUpload } from '@/components/admin/ImageUpload';
import { slugify } from '@/lib/utils/slugify';
import { apiRequest, ApiRequestError } from '@/lib/utils/api';
import { useToastStore } from '@/stores/toast-store';
import type { Product } from '@/types/database';

interface ProductFormProps {
  product?: Product;
}

export function ProductForm({ product }: ProductFormProps) {
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
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">
          Título *
        </label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          placeholder="Ex: Protocolo Saúde Total"
        />
        {errors.title && (
          <p className="mt-1 text-sm text-red-600">{errors.title}</p>
        )}
      </div>

      <div>
        <label htmlFor="slug" className="block text-sm font-medium text-gray-700">
          Slug
        </label>
        <input
          id="slug"
          type="text"
          value={slug}
          onChange={(e) => {
            setSlug(e.target.value);
            setSlugManuallyEdited(true);
          }}
          className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          placeholder="protocolo-saude-total"
        />
        {errors.slug && (
          <p className="mt-1 text-sm text-red-600">{errors.slug}</p>
        )}
        <p className="mt-1 text-xs text-gray-400">
          Gerado automaticamente do título. Edite se necessário.
        </p>
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Descrição
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          placeholder="Descreva o produto..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Banner</label>
        <div className="mt-1">
          <ImageUpload
            value={bannerUrl}
            onChange={setBannerUrl}
            onError={(msg) => addToast(msg, 'error')}
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
