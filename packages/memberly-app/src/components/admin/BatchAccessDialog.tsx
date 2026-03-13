'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToastStore } from '@/stores/toast-store';
import { Dialog } from '@/components/ui/Dialog';

interface Product {
  id: string;
  title: string;
}

interface BatchAccessDialogProps {
  action: 'grant' | 'revoke';
  profileIds: string[];
  products: Product[];
  onClose: () => void;
}

export function BatchAccessDialog({
  action,
  profileIds,
  products,
  onClose,
}: BatchAccessDialogProps) {
  const router = useRouter();
  const addToast = useToastStore((s) => s.addToast);
  const [productId, setProductId] = useState('');
  const [confirmText, setConfirmText] = useState('');
  const [loading, setLoading] = useState(false);

  const isRevoke = action === 'revoke';
  const canSubmit = productId && (!isRevoke || confirmText === 'REVOGAR');

  async function handleSubmit() {
    if (!canSubmit) return;
    setLoading(true);
    try {
      const res = await fetch('/api/members/batch-access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile_ids: profileIds, product_id: productId, action }),
      });
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      const label = isRevoke ? 'Acesso revogado de' : 'Acesso concedido a';
      addToast(`${label} ${data.affected} membro${data.affected !== 1 ? 's' : ''}`, 'success');
      router.refresh();
      onClose();
    } catch {
      addToast(`Erro ao ${isRevoke ? 'revogar' : 'conceder'} acesso`, 'error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={true} onClose={onClose}>
      <Dialog.Header>
        {isRevoke ? 'Revogar Acesso' : 'Conceder Acesso'}
      </Dialog.Header>
      <Dialog.Body>
        <p className="mb-4 text-sm text-gray-600">
          {isRevoke
            ? `Revogar acesso de ${profileIds.length} membro${profileIds.length !== 1 ? 's' : ''} ao produto selecionado.`
            : `Conceder acesso a ${profileIds.length} membro${profileIds.length !== 1 ? 's' : ''} ao produto selecionado.`}
        </p>

        <label htmlFor="batch-product" className="block text-sm font-medium text-gray-700">
          Produto
        </label>
        <select
          id="batch-product"
          value={productId}
          onChange={(e) => setProductId(e.target.value)}
          className="mt-1 mb-4 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="">Selecione um produto...</option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>{p.title}</option>
          ))}
        </select>

        {isRevoke && (
          <div className="mb-4">
            <p className="mb-2 text-sm text-red-600">
              Esta ação não pode ser desfeita. Digite <strong>REVOGAR</strong> para confirmar.
            </p>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              className="block w-full rounded-lg border border-red-300 px-3 py-2 text-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
              placeholder="REVOGAR"
            />
          </div>
        )}
      </Dialog.Body>
      <Dialog.Footer>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading || !canSubmit}
          className={`rounded-lg px-4 py-2 text-sm font-medium text-white disabled:opacity-50 ${
            isRevoke
              ? 'bg-red-600 hover:bg-red-700'
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {loading ? 'Processando...' : isRevoke ? 'Revogar' : 'Conceder'}
        </button>
      </Dialog.Footer>
    </Dialog>
  );
}
