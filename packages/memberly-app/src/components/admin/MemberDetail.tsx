'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiRequest } from '@/lib/utils/api';
import { useToastStore } from '@/stores/toast-store';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { GrantAccessModal } from '@/components/admin/GrantAccessModal';
import { Button } from '@/components/ui/Button';
import type { MemberAccessWithProduct } from '@/types/api';
import type { Database } from '@/types/database';

type Profile = Database['public']['Tables']['profiles']['Row'];

interface MemberDetailProps {
  profile: Profile;
  access: MemberAccessWithProduct[];
  allProducts: { id: string; title: string }[];
}

export function MemberDetail({ profile, access, allProducts }: MemberDetailProps) {
  const router = useRouter();
  const addToast = useToastStore((s) => s.addToast);
  const [showGrantModal, setShowGrantModal] = useState(false);
  const [revokeTarget, setRevokeTarget] = useState<{ productId: string; productTitle: string } | null>(null);
  const [isRevoking, setIsRevoking] = useState(false);

  const accessProductIds = access.map((a) => a.product_id);
  const availableProducts = allProducts.filter((p) => !accessProductIds.includes(p.id));

  async function handleRevoke() {
    if (!revokeTarget) return;
    setIsRevoking(true);
    try {
      await apiRequest(`/api/members/${profile.id}/access/${revokeTarget.productId}`, {
        method: 'DELETE',
      });
      addToast('Acesso removido com sucesso', 'success');
      router.refresh();
    } catch {
      addToast('Erro ao remover acesso', 'error');
    } finally {
      setIsRevoking(false);
      setRevokeTarget(null);
    }
  }

  return (
    <div className="space-y-6">
      {/* Profile Info */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-4">
          {profile.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt={profile.full_name}
              className="h-16 w-16 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-200 text-xl font-bold text-gray-500">
              {profile.full_name?.charAt(0)?.toUpperCase() || '?'}
            </div>
          )}
          <div>
            <h2 className="text-xl font-bold text-gray-900">{profile.full_name || 'Sem nome'}</h2>
            <p className="text-sm text-gray-500">
              Membro desde {new Date(profile.created_at).toLocaleDateString('pt-BR')}
            </p>
            <span className="mt-1 inline-block rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700">
              {profile.role}
            </span>
          </div>
        </div>
      </div>

      {/* Access List */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            Produtos com Acesso ({access.length})
          </h3>
          <Button
            variant="primary"
            onClick={() => setShowGrantModal(true)}
            disabled={availableProducts.length === 0}
            className="w-auto"
          >
            Atribuir Acesso
          </Button>
        </div>

        {access.length === 0 ? (
          <p className="text-sm text-gray-500">Nenhum acesso atribuído.</p>
        ) : (
          <div className="divide-y divide-gray-100">
            {access.map((item) => (
              <div key={item.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="font-medium text-gray-900">{item.products.title}</p>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-gray-500">
                    <span>
                      Liberado em {new Date(item.granted_at).toLocaleDateString('pt-BR')}
                    </span>
                    <span
                      className={`rounded-full px-2 py-0.5 font-medium ${
                        item.granted_by === 'webhook'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}
                    >
                      {item.granted_by}
                    </span>
                    {item.transaction_id && (
                      <span className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-gray-600">
                        tx: {item.transaction_id}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setRevokeTarget({
                      productId: item.product_id,
                      productTitle: item.products.title,
                    })
                  }
                  className="text-sm text-red-600 hover:text-red-700"
                >
                  Remover
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Grant Access Modal */}
      <GrantAccessModal
        open={showGrantModal}
        memberId={profile.id}
        products={availableProducts}
        onClose={() => setShowGrantModal(false)}
        onSuccess={() => {
          setShowGrantModal(false);
          addToast('Acesso atribuído com sucesso', 'success');
          router.refresh();
        }}
      />

      {/* Revoke Confirm Dialog */}
      <ConfirmDialog
        open={!!revokeTarget}
        title="Remover Acesso"
        message={`O membro perderá acesso ao produto "${revokeTarget?.productTitle}". Esta ação pode ser revertida atribuindo o acesso novamente.`}
        confirmLabel="Remover Acesso"
        onConfirm={handleRevoke}
        onCancel={() => setRevokeTarget(null)}
        isLoading={isRevoking}
      />
    </div>
  );
}
