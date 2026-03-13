'use client';

import { useState } from 'react';
import { apiRequest } from '@/lib/utils/api';
import { useToastStore } from '@/stores/toast-store';
import { Button } from '@/components/ui/Button';
import { Dialog } from '@/components/ui/Dialog';

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
    <Dialog open={open} onClose={onClose}>
      <Dialog.Header>Atribuir Acesso</Dialog.Header>
      <Dialog.Body>
        <p className="mb-4 text-sm text-gray-500">
          Selecione um produto para liberar acesso ao membro.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
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
      </Dialog.Body>
    </Dialog>
  );
}
