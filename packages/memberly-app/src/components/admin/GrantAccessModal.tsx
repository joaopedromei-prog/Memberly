'use client';

import { useState } from 'react';
import { apiRequest } from '@/lib/utils/api';
import { useToastStore } from '@/stores/toast-store';
import { Button } from '@/components/ui/Button';

interface GrantAccessModalProps {
  open: boolean;
  memberId: string;
  products: { id: string; title: string }[];
  onClose: () => void;
  onSuccess: () => void;
}

export function GrantAccessModal({
  open,
  memberId,
  products,
  onClose,
  onSuccess,
}: GrantAccessModalProps) {
  const addToast = useToastStore((s) => s.addToast);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!open) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedProductId) return;

    setIsLoading(true);
    try {
      await apiRequest(`/api/members/${memberId}/access`, {
        method: 'POST',
        body: JSON.stringify({ product_id: selectedProductId }),
      });
      setSelectedProductId('');
      onSuccess();
    } catch {
      addToast('Erro ao atribuir acesso', 'error');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} aria-hidden="true" />
      <div className="relative z-10 w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        <h2 className="text-lg font-semibold text-gray-900">Atribuir Acesso</h2>
        <p className="mt-1 text-sm text-gray-500">
          Selecione um produto para liberar acesso ao membro.
        </p>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <select
            value={selectedProductId}
            onChange={(e) => setSelectedProductId(e.target.value)}
            className="block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Selecione um produto</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title}
              </option>
            ))}
          </select>

          <div className="flex justify-end gap-3">
            <Button variant="outline" type="button" onClick={onClose} disabled={isLoading}>
              Cancelar
            </Button>
            <Button type="submit" isLoading={isLoading} disabled={!selectedProductId}>
              Confirmar
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
