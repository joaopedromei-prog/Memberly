'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'motion/react';
import {
  ChevronRight,
  Copy,
  Check,
  Calendar,
  PlusCircle,
  Trash,
} from 'lucide-react';
import { apiRequest } from '@/lib/utils/api';
import { useToastStore } from '@/stores/toast-store';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { GrantAccessModal } from '@/components/admin/GrantAccessModal';
import { AVATAR_GRADIENTS, PRODUCT_GRADIENTS } from '@/lib/constants/gradients';
import type { MemberAccessWithProduct } from '@/types/api';
import type { Database } from '@/types/database';

type Profile = Database['public']['Tables']['profiles']['Row'];

function getInitials(name: string | null): string {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

function getAvatarGradient(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = ((hash << 5) - hash + id.charCodeAt(i)) | 0;
  return AVATAR_GRADIENTS[Math.abs(hash) % AVATAR_GRADIENTS.length];
}

function getProductGradient(index: number): string {
  return PRODUCT_GRADIENTS[index % PRODUCT_GRADIENTS.length];
}

interface MemberDetailProps {
  profile: Profile;
  email: string | null;
  access: MemberAccessWithProduct[];
  allProducts: { id: string; title: string }[];
}

export function MemberDetail({ profile, email, access, allProducts }: MemberDetailProps) {
  const router = useRouter();
  const addToast = useToastStore((s) => s.addToast);
  const [showGrantModal, setShowGrantModal] = useState(false);
  const [revokeTarget, setRevokeTarget] = useState<{ productId: string; productTitle: string } | null>(null);
  const [isRevoking, setIsRevoking] = useState(false);
  const [copied, setCopied] = useState(false);

  const accessProductIds = access.map((a) => a.product_id);
  const availableProducts = allProducts.filter((p) => !accessProductIds.includes(p.id));

  const initials = getInitials(profile.full_name);
  const gradient = getAvatarGradient(profile.id);

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

  function handleCopyEmail() {
    if (!email) return;
    navigator.clipboard.writeText(email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  // Stats
  const stats = [
    { label: 'Produtos', value: String(access.length) },
    { label: 'Aulas Concluídas', value: '—' },
  ];

  return (
    <div className="space-y-6 pb-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-slate-500">
        <Link href="/admin/members" className="hover:text-slate-900 transition-colors">
          Membros
        </Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-slate-900 font-medium">{profile.full_name || 'Sem nome'}</span>
      </nav>

      {/* Profile Header */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col md:flex-row items-start md:items-center gap-5"
      >
        {profile.avatar_url ? (
          <img
            src={profile.avatar_url}
            alt={profile.full_name}
            className="w-16 h-16 md:w-20 md:h-20 shrink-0 rounded-2xl object-cover"
          />
        ) : (
          <div
            className={`w-16 h-16 md:w-20 md:h-20 shrink-0 rounded-2xl overflow-hidden flex items-center justify-center bg-gradient-to-br ${gradient}`}
          >
            <span className="text-xl md:text-2xl font-bold text-white">{initials}</span>
          </div>
        )}

        <div className="flex-1">
          <h1 className="text-xl md:text-2xl font-bold text-slate-900">
            {profile.full_name || 'Sem nome'}
          </h1>

          {email && (
            <div className="flex items-center gap-2 mt-0.5 relative">
              <span className="text-sm text-slate-500">{email}</span>
              <button
                onClick={handleCopyEmail}
                className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                aria-label="Copiar email"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
              </button>
              {copied && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute left-[calc(100%+8px)] bg-slate-800 text-white text-xs px-2 py-1 rounded shadow-sm whitespace-nowrap z-10"
                >
                  Copiado!
                </motion.div>
              )}
            </div>
          )}

          <div className="flex flex-wrap items-center gap-3 mt-2">
            <span className="bg-blue-50 text-blue-700 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-blue-200">
              {profile.role}
            </span>
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <Calendar className="w-3.5 h-3.5" />
              Membro desde {new Date(profile.created_at).toLocaleDateString('pt-BR')}
            </div>
            <span className="text-xs font-mono text-slate-400 bg-slate-50 rounded px-1.5 py-0.5">
              ID: {profile.id.slice(0, 8)}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 mt-4 md:mt-0 w-full md:w-auto">
          <button
            type="button"
            onClick={() => setShowGrantModal(true)}
            disabled={availableProducts.length === 0}
            className="flex-1 md:flex-none bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg h-9 px-4 text-sm font-medium transition-all hover:-translate-y-0.5 hover:shadow-md cursor-pointer"
          >
            Atribuir Acesso
          </button>
        </div>
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-6">
          {/* Product Access */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="bg-white rounded-xl border border-slate-200 p-6"
          >
            <div className="flex justify-between items-center">
              <h2 className="font-semibold text-slate-900 flex items-center gap-2">
                Produtos com Acesso
                <span className="text-slate-500 font-normal text-sm">({access.length})</span>
              </h2>
              <button
                type="button"
                onClick={() => setShowGrantModal(true)}
                disabled={availableProducts.length === 0}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Atribuir Acesso
              </button>
            </div>

            {access.length === 0 ? (
              <p className="text-sm text-slate-500 mt-4">Nenhum acesso atribuído.</p>
            ) : (
              <div className="divide-y divide-slate-100 mt-4">
                {access.map((item, index) => (
                  <div key={item.id} className="py-4 flex items-center gap-4 group">
                    <div
                      className="w-14 h-9 rounded-lg shrink-0"
                      style={{ background: getProductGradient(index) }}
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-slate-900 truncate">{item.products.title}</h3>
                      <div className="flex flex-wrap items-center gap-2 mt-1">
                        <span className="text-xs text-slate-500">
                          Liberado em {new Date(item.granted_at).toLocaleDateString('pt-BR')}
                        </span>
                        <span
                          className={`text-[10px] uppercase tracking-wider font-medium px-1.5 py-0.5 rounded-sm ring-1 ${
                            item.granted_by === 'webhook'
                              ? 'bg-emerald-50 text-emerald-700 ring-emerald-200'
                              : 'bg-amber-50 text-amber-700 ring-amber-200'
                          }`}
                        >
                          {item.granted_by}
                        </span>
                        {item.transaction_id && (
                          <span className="text-xs font-mono bg-slate-50 rounded px-1.5 py-0.5 text-slate-500">
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
                      className="text-sm text-red-500 hover:text-red-700 font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-150 cursor-pointer"
                    >
                      Remover
                    </button>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-5 xl:col-span-4 space-y-6">
          {/* Quick Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="bg-white rounded-xl border border-slate-200 p-6"
          >
            <h2 className="font-semibold text-slate-900">Resumo</h2>
            <div className="grid grid-cols-2 gap-4 mt-4">
              {stats.map((stat, i) => (
                <div key={i} className="bg-slate-50 rounded-xl p-4">
                  <div className="text-2xl font-bold text-slate-900">{stat.value}</div>
                  <div className="text-xs text-slate-500 mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.25 }}
            className="bg-white rounded-xl border border-slate-200 p-6"
          >
            <h2 className="font-semibold text-slate-900">Ações</h2>
            <div className="space-y-2 mt-3">
              <button
                type="button"
                onClick={() => setShowGrantModal(true)}
                disabled={availableProducts.length === 0}
                className="w-full flex items-center gap-3 p-3 rounded-lg text-left text-sm hover:bg-blue-50 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <PlusCircle className="w-4 h-4 text-blue-600" />
                <span className="text-slate-700 font-medium">Atribuir Acesso a Produto</span>
              </button>

              <div className="border-t border-slate-100 my-2" />

              <button
                type="button"
                className="w-full flex items-center gap-3 p-3 rounded-lg text-left text-sm hover:bg-red-50 transition-colors cursor-pointer"
                onClick={() => addToast('Funcionalidade em desenvolvimento', 'warning')}
              >
                <Trash className="w-4 h-4 text-red-500" />
                <span className="text-red-600 font-medium">Remover Membro</span>
              </button>
            </div>
          </motion.div>
        </div>
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
