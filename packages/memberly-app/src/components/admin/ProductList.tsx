'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ProductStatusBadge } from '@/components/admin/ProductStatusBadge';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { apiRequest, ApiRequestError } from '@/lib/utils/api';
import { useToastStore } from '@/stores/toast-store';
import type { ProductWithModuleCount } from '@/types/api';

interface ProductListProps {
  products: ProductWithModuleCount[];
}

export function ProductList({ products: initialProducts }: ProductListProps) {
  const addToast = useToastStore((s) => s.addToast);
  const [products, setProducts] = useState(initialProducts);
  const [deleteTarget, setDeleteTarget] = useState<ProductWithModuleCount | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const moduleCount = (product: ProductWithModuleCount) =>
    product.modules?.[0]?.count ?? 0;

  const handleTogglePublish = async (product: ProductWithModuleCount) => {
    setTogglingId(product.id);
    // Optimistic update
    setProducts((prev) =>
      prev.map((p) =>
        p.id === product.id ? { ...p, is_published: !p.is_published } : p
      )
    );

    try {
      await apiRequest(`/api/products/${product.id}/publish`, {
        method: 'PATCH',
      });
      addToast(
        product.is_published ? 'Produto despublicado' : 'Produto publicado',
        'success'
      );
    } catch (err) {
      // Revert optimistic update
      setProducts((prev) =>
        prev.map((p) =>
          p.id === product.id ? { ...p, is_published: product.is_published } : p
        )
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
      await apiRequest(`/api/products/${deleteTarget.id}`, { method: 'DELETE' });
      setProducts((prev) => prev.filter((p) => p.id !== deleteTarget.id));
      addToast('Produto excluído com sucesso', 'success');
      setDeleteTarget(null);
    } catch (err) {
      addToast(
        err instanceof ApiRequestError ? err.message : 'Erro ao excluir produto',
        'error'
      );
    } finally {
      setIsDeleting(false);
    }
  };

  if (products.length === 0) {
    return (
      <div className="rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
        <p className="text-lg font-medium text-gray-500">Nenhum produto criado</p>
        <p className="mt-1 text-sm text-gray-400">
          Comece criando seu primeiro produto.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Produto
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Módulos
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Criado em
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {products.map((product) => (
              <tr key={product.id} className="hover:bg-gray-50">
                <td className="whitespace-nowrap px-6 py-4">
                  <div className="flex items-center gap-3">
                    {product.banner_url ? (
                      <img
                        src={product.banner_url}
                        alt=""
                        className="h-10 w-16 rounded object-cover"
                      />
                    ) : (
                      <div className="flex h-10 w-16 items-center justify-center rounded bg-gray-100 text-xs text-gray-400">
                        Sem img
                      </div>
                    )}
                    <span className="font-medium text-gray-900">
                      {product.title}
                    </span>
                  </div>
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  <button
                    onClick={() => handleTogglePublish(product)}
                    disabled={togglingId === product.id}
                    className="disabled:opacity-50"
                  >
                    <ProductStatusBadge isPublished={product.is_published} />
                  </button>
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                  {moduleCount(product)}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                  {new Date(product.created_at).toLocaleDateString('pt-BR')}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-right text-sm">
                  <div className="flex justify-end gap-2">
                    <Link
                      href={`/admin/products/${product.id}`}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      Editar
                    </Link>
                    <button
                      onClick={() => setDeleteTarget(product)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Excluir
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Excluir Produto"
        message={
          deleteTarget && moduleCount(deleteTarget) > 0
            ? `Tem certeza? "${deleteTarget.title}" possui ${moduleCount(deleteTarget)} módulo(s) vinculado(s). Esta ação é irreversível e excluirá todos os módulos e aulas associados.`
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
