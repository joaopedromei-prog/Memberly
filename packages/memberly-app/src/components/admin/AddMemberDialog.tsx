'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { X } from 'lucide-react';
import { useToastStore } from '@/stores/toast-store';
import { Dialog } from '@/components/ui/Dialog';

interface AddMemberDialogProps {
  products: { id: string; title: string }[];
  onClose: () => void;
}

export function AddMemberDialog({ products, onClose }: AddMemberDialogProps) {
  const router = useRouter();
  const addToast = useToastStore((s) => s.addToast);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [productId, setProductId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ fullName?: string; email?: string }>({});

  function validate(): boolean {
    const newErrors: { fullName?: string; email?: string } = {};

    if (!fullName.trim()) {
      newErrors.fullName = 'Nome completo é obrigatório';
    }

    if (!email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Formato de email inválido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: fullName.trim(),
          email: email.trim(),
          product_id: productId || undefined,
        }),
      });

      if (res.status === 409) {
        setErrors({ email: 'Este email já está cadastrado' });
        return;
      }

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error?.message || 'Erro ao criar membro');
      }

      addToast('Membro criado com sucesso!', 'success');
      router.refresh();
      onClose();
    } catch (err) {
      addToast(err instanceof Error ? err.message : 'Erro ao criar membro', 'error');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={true} onClose={onClose}>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900">Adicionar Membro</h2>
        <button
          type="button"
          onClick={onClose}
          className="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="add-member-name" className="mb-1 block text-sm font-medium text-gray-700">
            Nome completo <span className="text-red-500">*</span>
          </label>
          <input
            id="add-member-name"
            type="text"
            value={fullName}
            onChange={(e) => {
              setFullName(e.target.value);
              if (errors.fullName) setErrors((prev) => ({ ...prev, fullName: undefined }));
            }}
            className={`h-10 w-full rounded-lg border px-3 text-sm text-gray-900 focus:outline-none focus:ring-1 transition-all ${
              errors.fullName
                ? 'border-red-300 focus:border-red-500 focus:ring-red-500/30'
                : 'border-gray-200 focus:border-blue-500 focus:ring-blue-500/30'
            }`}
            placeholder="Nome do membro"
          />
          {errors.fullName && (
            <p className="mt-1 text-xs text-red-600">{errors.fullName}</p>
          )}
        </div>

        <div>
          <label htmlFor="add-member-email" className="mb-1 block text-sm font-medium text-gray-700">
            Email <span className="text-red-500">*</span>
          </label>
          <input
            id="add-member-email"
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
            }}
            className={`h-10 w-full rounded-lg border px-3 text-sm text-gray-900 focus:outline-none focus:ring-1 transition-all ${
              errors.email
                ? 'border-red-300 focus:border-red-500 focus:ring-red-500/30'
                : 'border-gray-200 focus:border-blue-500 focus:ring-blue-500/30'
            }`}
            placeholder="email@exemplo.com"
          />
          {errors.email && (
            <p className="mt-1 text-xs text-red-600">{errors.email}</p>
          )}
        </div>

        <div>
          <label htmlFor="add-member-product" className="mb-1 block text-sm font-medium text-gray-700">
            Produto (opcional)
          </label>
          <select
            id="add-member-product"
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
            className="h-10 w-full rounded-lg border border-gray-200 px-3 text-sm text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-all"
          >
            <option value="">Nenhum produto</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>{p.title}</option>
            ))}
          </select>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50 transition-colors"
          >
            {submitting ? 'Criando...' : 'Criar membro'}
          </button>
        </div>
      </form>
    </Dialog>
  );
}
