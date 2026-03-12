'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/Button';
import { apiRequest, ApiRequestError } from '@/lib/utils/api';
import { useToastStore } from '@/stores/toast-store';
import type { ProductMapping } from '@/types/database';

interface ProductMappingsProps {
  productId: string;
}

export function ProductMappings({ productId }: ProductMappingsProps) {
  const addToast = useToastStore((s) => s.addToast);
  const [mappings, setMappings] = useState<ProductMapping[]>([]);
  const [newExternalId, setNewExternalId] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);

  const fetchMappings = useCallback(async () => {
    try {
      const data = await apiRequest<ProductMapping[]>(
        `/api/products/${productId}/mappings`
      );
      setMappings(data);
    } catch {
      addToast('Erro ao carregar mapeamentos', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [productId, addToast]);

  useEffect(() => {
    fetchMappings();
  }, [fetchMappings]);

  async function handleAdd() {
    const trimmed = newExternalId.trim();
    if (!trimmed) return;

    setIsAdding(true);
    try {
      await apiRequest(`/api/products/${productId}/mappings`, {
        method: 'POST',
        body: JSON.stringify({ external_product_id: trimmed, gateway: 'payt' }),
      });
      setNewExternalId('');
      addToast('Mapeamento adicionado', 'success');
      await fetchMappings();
    } catch (err) {
      if (err instanceof ApiRequestError && err.code === 'DUPLICATE_MAPPING') {
        addToast('Este ID externo já está mapeado', 'error');
      } else {
        addToast('Erro ao adicionar mapeamento', 'error');
      }
    } finally {
      setIsAdding(false);
    }
  }

  async function handleRemove(mappingId: string) {
    try {
      await apiRequest(`/api/products/${productId}/mappings/${mappingId}`, {
        method: 'DELETE',
      });
      addToast('Mapeamento removido', 'success');
      await fetchMappings();
    } catch {
      addToast('Erro ao remover mapeamento', 'error');
    }
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">
        Integrações Externas
      </h3>
      <p className="text-sm text-gray-500">
        Mapeie IDs de produto da Payt para este produto. Um produto pode ter
        múltiplos IDs (diferentes ofertas).
      </p>

      {isLoading ? (
        <p className="text-sm text-gray-400">Carregando...</p>
      ) : (
        <>
          {mappings.length > 0 && (
            <ul className="space-y-2">
              {mappings.map((m) => (
                <li
                  key={m.id}
                  className="flex items-center justify-between rounded-lg border border-gray-200 px-3 py-2"
                >
                  <div>
                    <span className="text-sm font-medium text-gray-900">
                      {m.external_product_id}
                    </span>
                    <span className="ml-2 rounded bg-blue-100 px-1.5 py-0.5 text-xs text-blue-700">
                      {m.gateway}
                    </span>
                  </div>
                  <button
                    onClick={() => handleRemove(m.id)}
                    className="text-sm text-red-500 hover:text-red-700"
                    aria-label={`Remover mapeamento ${m.external_product_id}`}
                  >
                    Remover
                  </button>
                </li>
              ))}
            </ul>
          )}

          <div className="flex gap-2">
            <input
              type="text"
              value={newExternalId}
              onChange={(e) => setNewExternalId(e.target.value)}
              placeholder="ID do produto na Payt (ex: prod_abc123)"
              className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAdd();
                }
              }}
            />
            <Button
              type="button"
              onClick={handleAdd}
              isLoading={isAdding}
              disabled={!newExternalId.trim()}
              className="!w-auto whitespace-nowrap"
            >
              Adicionar ID
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
