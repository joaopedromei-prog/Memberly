'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToastStore } from '@/stores/toast-store';
import { Dialog } from '@/components/ui/Dialog';

interface DuplicateProductDialogProps {
  productId: string;
  productTitle: string;
  onClose: () => void;
}

export function DuplicateProductDialog({
  productId,
  productTitle,
  onClose,
}: DuplicateProductDialogProps) {
  const [title, setTitle] = useState(`Cópia de ${productTitle}`);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const addToast = useToastStore((s) => s.addToast);

  async function handleDuplicate() {
    if (!title.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/products/${productId}/duplicate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title }),
      });
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      addToast('Produto duplicado com sucesso', 'success');
      router.push(`/admin/products/${data.id}`);
    } catch {
      addToast('Erro ao duplicar produto', 'error');
      setLoading(false);
    }
  }

  return (
    <Dialog open={true} onClose={onClose}>
      <Dialog.Header>Duplicar Produto</Dialog.Header>
      <Dialog.Body>
        <p className="mb-4 text-sm text-gray-600">
          Todos os módulos e aulas serão copiados. O novo produto será criado como rascunho.
        </p>
        <label htmlFor="dup-title" className="block text-sm font-medium text-gray-700">
          Título do novo produto
        </label>
        <input
          id="dup-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
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
          onClick={handleDuplicate}
          disabled={loading || !title.trim()}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Duplicando...' : 'Duplicar'}
        </button>
      </Dialog.Footer>
    </Dialog>
  );
}
