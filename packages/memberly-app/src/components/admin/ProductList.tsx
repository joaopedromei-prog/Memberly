'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search,
  Plus,
  LayoutGrid,
  Pencil,
  Copy,
  Trash2,
  ChevronDown,
} from 'lucide-react';
import { ProductStatusBadge } from '@/components/admin/ProductStatusBadge';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { DuplicateProductDialog } from '@/components/admin/DuplicateProductDialog';
import { apiRequest, ApiRequestError } from '@/lib/utils/api';
import { useToastStore } from '@/stores/toast-store';
import { PRODUCT_LIST_GRADIENTS } from '@/lib/constants/gradients';

export interface ProductListItem {
  id: string;
  title: string;
  slug: string;
  banner_url: string | null;
  is_published: boolean;
  created_at: string;
  moduleCount: number;
  lessonCount: number;
}

interface ProductListProps {
  products: ProductListItem[];
}

type StatusFilter = 'all' | 'published' | 'draft';

function gradientForProduct(title: string): string {
  let hash = 0;
  for (let i = 0; i < title.length; i++) {
    hash = title.charCodeAt(i) + ((hash << 5) - hash);
  }
  return PRODUCT_LIST_GRADIENTS[Math.abs(hash) % PRODUCT_LIST_GRADIENTS.length];
}

export function ProductList({ products: initialProducts }: ProductListProps) {
  const addToast = useToastStore((s) => s.addToast);
  const [products, setProducts] = useState(initialProducts);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [deleteTarget, setDeleteTarget] = useState<ProductListItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [duplicateTarget, setDuplicateTarget] = useState<ProductListItem | null>(null);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'published' && p.is_published) ||
        (statusFilter === 'draft' && !p.is_published);
      return matchesSearch && matchesStatus;
    });
  }, [products, searchQuery, statusFilter]);

  const totalCount = products.length;
  const publishedCount = products.filter((p) => p.is_published).length;
  const draftCount = products.filter((p) => !p.is_published).length;

  const isAllSelected = filteredProducts.length > 0 && selectedIds.size === filteredProducts.length;
  const isSomeSelected = selectedIds.size > 0 && selectedIds.size < filteredProducts.length;

  const handleToggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredProducts.map((p) => p.id)));
    }
  };

  const handleToggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedIds(next);
  };

  const handleTogglePublish = async (product: ProductListItem) => {
    setTogglingId(product.id);
    setProducts((prev) =>
      prev.map((p) =>
        p.id === product.id ? { ...p, is_published: !p.is_published } : p
      )
    );

    try {
      await apiRequest(`/api/products/${product.id}/publish`, { method: 'PATCH' });
      addToast(
        product.is_published ? 'Produto despublicado' : 'Produto publicado',
        'success'
      );
    } catch (err) {
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
      selectedIds.delete(deleteTarget.id);
      setSelectedIds(new Set(selectedIds));
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

  const handleBulkPublish = async () => {
    const ids = [...selectedIds];
    setProducts((prev) =>
      prev.map((p) => (ids.includes(p.id) ? { ...p, is_published: true } : p))
    );
    setSelectedIds(new Set());

    for (const id of ids) {
      try {
        await apiRequest(`/api/products/${id}/publish`, { method: 'PATCH' });
      } catch {
        // Silently continue — optimistic update already applied
      }
    }
    addToast(`${ids.length} produto(s) publicado(s)`, 'success');
  };

  const handleBulkUnpublish = async () => {
    const ids = [...selectedIds];
    setProducts((prev) =>
      prev.map((p) => (ids.includes(p.id) ? { ...p, is_published: false } : p))
    );
    setSelectedIds(new Set());

    for (const id of ids) {
      try {
        await apiRequest(`/api/products/${id}/publish`, { method: 'PATCH' });
      } catch {
        // Silently continue
      }
    }
    addToast(`${ids.length} produto(s) despublicado(s)`, 'success');
  };

  const handleBulkDelete = async () => {
    const ids = [...selectedIds];
    setProducts((prev) => prev.filter((p) => !ids.includes(p.id)));
    setSelectedIds(new Set());

    for (const id of ids) {
      try {
        await apiRequest(`/api/products/${id}`, { method: 'DELETE' });
      } catch {
        // Silently continue
      }
    }
    addToast(`${ids.length} produto(s) excluído(s)`, 'success');
  };

  return (
    <div className="pb-24">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Produtos</h1>
          <Link
            href="/admin/products/new"
            className="inline-flex items-center justify-center gap-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-lg px-4 h-10 font-medium text-sm transition-all duration-200 hover:-translate-y-[1px] hover:shadow-md hover:shadow-blue-500/20 w-full sm:w-auto"
          >
            <Plus className="w-4 h-4" />
            Novo Produto
          </Link>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Buscar produtos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 bg-white border border-slate-200 rounded-lg pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]/30 transition-shadow"
            />
          </div>

          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
              className="appearance-none w-full sm:w-44 h-10 bg-white border border-slate-200 rounded-lg pl-3 pr-10 text-sm text-slate-700 focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]/30 cursor-pointer"
            >
              <option value="all">Todos os status</option>
              <option value="published">Publicados</option>
              <option value="draft">Rascunhos</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
          </div>

          <div className="hidden sm:block ml-auto text-sm text-slate-500">
            {filteredProducts.length} {filteredProducts.length === 1 ? 'produto' : 'produtos'}
          </div>
        </div>
      </motion.div>

      {/* Stats Bar */}
      <div className="flex flex-wrap gap-3 mb-5">
        {[
          { label: `${totalCount} total`, color: 'bg-slate-400' },
          { label: `${publishedCount} publicados`, color: 'bg-emerald-500' },
          { label: `${draftCount} rascunhos`, color: 'bg-amber-500' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.1 + i * 0.05 }}
            className="flex items-center gap-2 bg-white border border-slate-200 rounded-full px-4 py-2"
          >
            <span className={`w-2 h-2 rounded-full ${stat.color}`} />
            <span className="text-sm font-medium text-slate-700">{stat.label}</span>
          </motion.div>
        ))}
      </div>

      {/* Product Table / List */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15 }}
      >
        {filteredProducts.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
            <p className="text-base font-medium text-slate-500">
              {products.length === 0 ? 'Nenhum produto criado' : 'Nenhum produto encontrado'}
            </p>
            {products.length === 0 && (
              <p className="mt-1 text-sm text-slate-400">Comece criando seu primeiro produto.</p>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50/80 border-b border-slate-200">
                  <tr>
                    <th className="py-3.5 px-6 w-12 text-center">
                      <input
                        type="checkbox"
                        checked={isAllSelected}
                        ref={(input) => {
                          if (input) input.indeterminate = isSomeSelected;
                        }}
                        onChange={handleToggleSelectAll}
                        className="w-4 h-4 rounded border-slate-300 text-[#2563EB] focus:ring-[#2563EB] cursor-pointer accent-[#2563EB]"
                      />
                    </th>
                    <th className="py-3.5 px-6 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Produto
                    </th>
                    <th className="py-3.5 px-6 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Status
                    </th>
                    <th className="py-3.5 px-6 text-xs font-semibold uppercase tracking-wider text-slate-500 text-center">
                      Módulos
                    </th>
                    <th className="py-3.5 px-6 text-xs font-semibold uppercase tracking-wider text-slate-500 text-center">
                      Aulas
                    </th>
                    <th className="py-3.5 px-6 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Criado em
                    </th>
                    <th className="py-3.5 px-6 text-xs font-semibold uppercase tracking-wider text-slate-500 text-right">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((product) => (
                    <tr
                      key={product.id}
                      className={`group border-b border-slate-100 last:border-none transition-colors duration-150 ${
                        selectedIds.has(product.id) ? 'bg-blue-50' : 'hover:bg-slate-50'
                      }`}
                    >
                      <td className="py-4 px-6 text-center">
                        <input
                          type="checkbox"
                          checked={selectedIds.has(product.id)}
                          onChange={() => handleToggleSelect(product.id)}
                          className="w-4 h-4 rounded border-slate-300 text-[#2563EB] focus:ring-[#2563EB] cursor-pointer accent-[#2563EB]"
                        />
                      </td>
                      <td className="py-4 px-6">
                        <Link href={`/admin/products/${product.id}`} className="flex items-center gap-3">
                          {product.banner_url ? (
                            <img
                              src={product.banner_url}
                              alt=""
                              className="w-12 h-8 lg:w-16 lg:h-10 rounded-md object-cover shrink-0"
                            />
                          ) : (
                            <div
                              className="w-12 h-8 lg:w-16 lg:h-10 rounded-md shrink-0"
                              style={{ background: gradientForProduct(product.title) }}
                            />
                          )}
                          <div>
                            <div className="font-medium text-sm text-slate-900 group-hover:text-[#2563EB] transition-colors">
                              {product.title}
                            </div>
                            <div className="text-xs text-slate-400 mt-0.5 hidden lg:block">
                              /{product.slug}
                            </div>
                          </div>
                        </Link>
                      </td>
                      <td className="py-4 px-6">
                        <button
                          onClick={() => handleTogglePublish(product)}
                          disabled={togglingId === product.id}
                          className="disabled:opacity-50 cursor-pointer"
                        >
                          <ProductStatusBadge isPublished={product.is_published} />
                        </button>
                      </td>
                      <td className="py-4 px-6 text-sm text-slate-600 text-center">
                        {product.moduleCount}
                      </td>
                      <td className="py-4 px-6 text-sm text-slate-600 text-center">
                        {product.lessonCount}
                      </td>
                      <td className="py-4 px-6 text-sm text-slate-500 whitespace-nowrap">
                        {new Date(product.created_at).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center justify-end gap-1">
                          <Link
                            href={`/admin/products/${product.id}/modules`}
                            title="Módulos"
                            className="w-8 h-8 flex items-center justify-center rounded-md text-purple-600 hover:bg-purple-50 transition-colors"
                          >
                            <LayoutGrid className="w-4 h-4" />
                          </Link>
                          <Link
                            href={`/admin/products/${product.id}`}
                            title="Editar"
                            className="w-8 h-8 flex items-center justify-center rounded-md text-[#2563EB] hover:bg-blue-50 transition-colors"
                          >
                            <Pencil className="w-4 h-4" />
                          </Link>
                          <button
                            title="Duplicar"
                            onClick={() => setDuplicateTarget(product)}
                            className="w-8 h-8 flex items-center justify-center rounded-md text-slate-500 hover:bg-slate-100 transition-colors"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                          <button
                            title="Excluir"
                            onClick={() => setDeleteTarget(product)}
                            className="w-8 h-8 flex items-center justify-center rounded-md text-red-500 hover:bg-red-50 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile List */}
            <div className="md:hidden divide-y divide-slate-100">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className={`p-4 transition-colors duration-150 ${
                    selectedIds.has(product.id) ? 'bg-blue-50' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-start gap-3 mb-3">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(product.id)}
                      onChange={() => handleToggleSelect(product.id)}
                      className="mt-1 w-4 h-4 rounded border-slate-300 text-[#2563EB] focus:ring-[#2563EB] cursor-pointer accent-[#2563EB] shrink-0"
                    />
                    {product.banner_url ? (
                      <img
                        src={product.banner_url}
                        alt=""
                        className="w-16 h-10 rounded-md object-cover shrink-0"
                      />
                    ) : (
                      <div
                        className="w-16 h-10 rounded-md shrink-0"
                        style={{ background: gradientForProduct(product.title) }}
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/admin/products/${product.id}`}
                        className="font-medium text-sm text-slate-900 truncate block hover:text-[#2563EB] transition-colors"
                      >
                        {product.title}
                      </Link>
                      <div className="text-xs text-slate-400 truncate mt-0.5">
                        /{product.slug}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 mb-3 pl-7">
                    <button
                      onClick={() => handleTogglePublish(product)}
                      disabled={togglingId === product.id}
                      className="disabled:opacity-50 cursor-pointer"
                    >
                      <ProductStatusBadge isPublished={product.is_published} />
                    </button>
                    <span className="text-xs text-slate-500">{product.moduleCount} módulos</span>
                    <span className="text-xs text-slate-500">•</span>
                    <span className="text-xs text-slate-500">{product.lessonCount} aulas</span>
                  </div>

                  <div className="flex items-center justify-between pl-7">
                    <span className="text-xs text-slate-400">
                      {new Date(product.created_at).toLocaleDateString('pt-BR')}
                    </span>
                    <div className="flex items-center gap-1">
                      <Link
                        href={`/admin/products/${product.id}/modules`}
                        className="w-8 h-8 flex items-center justify-center rounded-md text-purple-600 hover:bg-purple-50 transition-colors"
                      >
                        <LayoutGrid className="w-4 h-4" />
                      </Link>
                      <Link
                        href={`/admin/products/${product.id}`}
                        className="w-8 h-8 flex items-center justify-center rounded-md text-[#2563EB] hover:bg-blue-50 transition-colors"
                      >
                        <Pencil className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => setDuplicateTarget(product)}
                        className="w-8 h-8 flex items-center justify-center rounded-md text-slate-500 hover:bg-slate-100 transition-colors"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(product)}
                        className="w-8 h-8 flex items-center justify-center rounded-md text-red-500 hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </motion.div>

      {/* Bulk Actions Bar */}
      <AnimatePresence>
        {selectedIds.size > 0 && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-4 left-4 right-4 md:left-1/2 md:-translate-x-1/2 md:right-auto bg-slate-900 text-white rounded-xl shadow-2xl px-4 md:px-6 py-3 flex flex-wrap items-center justify-center gap-3 md:gap-4 z-50"
          >
            <span className="text-sm font-medium whitespace-nowrap">
              {selectedIds.size} selecionado(s)
            </span>
            <div className="w-px h-5 bg-slate-700 hidden sm:block" />
            <div className="flex items-center gap-2 md:gap-4">
              <button
                onClick={handleBulkPublish}
                className="text-sm font-medium text-emerald-400 hover:text-emerald-300 transition-colors cursor-pointer"
              >
                Publicar
              </button>
              <button
                onClick={handleBulkUnpublish}
                className="text-sm font-medium text-amber-400 hover:text-amber-300 transition-colors cursor-pointer"
              >
                Despublicar
              </button>
              <button
                onClick={handleBulkDelete}
                className="text-sm font-medium text-red-400 hover:text-red-300 transition-colors cursor-pointer"
              >
                Excluir
              </button>
              <button
                onClick={() => setSelectedIds(new Set())}
                className="text-sm font-medium text-slate-400 hover:text-slate-300 transition-colors cursor-pointer"
              >
                Limpar
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirm Dialog */}
      <ConfirmDialog
        open={!!deleteTarget}
        title="Excluir Produto"
        message={
          deleteTarget && deleteTarget.moduleCount > 0
            ? `Tem certeza? "${deleteTarget.title}" possui ${deleteTarget.moduleCount} módulo(s) e ${deleteTarget.lessonCount} aula(s). Esta ação é irreversível.`
            : `Tem certeza que deseja excluir "${deleteTarget?.title}"? Esta ação é irreversível.`
        }
        confirmLabel="Excluir"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        isLoading={isDeleting}
      />

      {/* Duplicate Dialog */}
      {duplicateTarget && (
        <DuplicateProductDialog
          productId={duplicateTarget.id}
          productTitle={duplicateTarget.title}
          onClose={() => setDuplicateTarget(null)}
        />
      )}
    </div>
  );
}
