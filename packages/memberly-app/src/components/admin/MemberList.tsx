'use client';

import { useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'motion/react';
import { Plus, Upload, Download, Eye, XCircle } from 'lucide-react';
import { SearchInput } from '@/components/ui/SearchInput';
import { Pagination } from '@/components/ui/Pagination';
import { BulkActionBar } from '@/components/admin/BulkActionBar';
import { BatchAccessDialog } from '@/components/admin/BatchAccessDialog';
import { ImportMembersDialog } from '@/components/admin/ImportMembersDialog';
import { AddMemberDialog } from '@/components/admin/AddMemberDialog';
import type { MemberWithAccessCount, ProductWithModuleCount } from '@/types/api';

const AVATAR_GRADIENTS = [
  'from-[#2563EB] to-[#7C3AED]',
  'from-[#059669] to-[#0EA5E9]',
  'from-[#DC2626] to-[#F97316]',
  'from-[#7C3AED] to-[#EC4899]',
  'from-[#0EA5E9] to-[#06B6D4]',
  'from-[#F97316] to-[#EAB308]',
  'from-[#059669] to-[#7C3AED]',
  'from-[#EC4899] to-[#8B5CF6]',
];

function getInitials(name: string | null): string {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

function getGradient(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = ((hash << 5) - hash + id.charCodeAt(i)) | 0;
  }
  return AVATAR_GRADIENTS[Math.abs(hash) % AVATAR_GRADIENTS.length];
}

interface MemberListProps {
  members: MemberWithAccessCount[];
  products: ProductWithModuleCount[];
  total: number;
  page: number;
  limit: number;
  initialSearch: string;
  initialProductId: string;
}

export function MemberList({
  members,
  products,
  total,
  page,
  limit,
  initialSearch,
  initialProductId,
}: MemberListProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [batchAction, setBatchAction] = useState<'grant' | 'revoke' | null>(null);
  const [showImport, setShowImport] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);

  const updateParams = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([key, value]) => {
        if (value) {
          params.set(key, value);
        } else {
          params.delete(key);
        }
      });
      if ('search' in updates || 'product_id' in updates) {
        params.delete('page');
      }
      router.push(`/admin/members?${params.toString()}`);
    },
    [router, searchParams]
  );

  const handleSearch = useCallback(
    (value: string) => updateParams({ search: value }),
    [updateParams]
  );

  const handleProductFilter = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => updateParams({ product_id: e.target.value }),
    [updateParams]
  );

  const handlePageChange = useCallback(
    (newPage: number) => updateParams({ page: String(newPage) }),
    [updateParams]
  );

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selected.size === members.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(members.map((m) => m.id)));
    }
  };

  const handleExport = () => {
    window.location.href = '/api/members/export';
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-6 pb-24">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div className="flex items-center">
          <h1 className="text-2xl font-bold text-slate-900">Membros</h1>
          <span className="ml-3 px-2.5 py-0.5 bg-slate-100 text-slate-600 rounded-full text-xs font-medium">
            {total.toLocaleString('pt-BR')} {total === 1 ? 'membro' : 'membros'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowAddMember(true)}
            className="flex items-center px-4 h-10 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4 mr-2" />
            Adicionar membro
          </button>
          <button
            type="button"
            onClick={() => setShowImport(true)}
            className="flex items-center px-4 h-10 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors shadow-sm"
          >
            <Upload className="w-4 h-4 mr-2" />
            Importar CSV
          </button>
          <button
            type="button"
            onClick={handleExport}
            className="flex items-center px-4 h-10 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors shadow-sm"
          >
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </button>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="flex flex-col sm:flex-row gap-3"
      >
        <SearchInput
          value={initialSearch}
          onChange={handleSearch}
          placeholder="Buscar por nome ou email..."
          className="flex-1 max-w-sm"
        />
        <select
          value={initialProductId}
          onChange={handleProductFilter}
          className="h-10 px-3 pr-8 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-all shadow-sm sm:w-52 appearance-none cursor-pointer"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
            backgroundPosition: 'right 0.5rem center',
            backgroundRepeat: 'no-repeat',
            backgroundSize: '1.5em 1.5em',
          }}
        >
          <option value="">Todos os produtos</option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>{p.title}</option>
          ))}
        </select>
      </motion.div>

      {/* Desktop Table */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15 }}
        className="hidden md:block bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200">
                <th className="py-3 px-4 w-12">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-600 accent-blue-600 cursor-pointer"
                    checked={members.length > 0 && selected.size === members.length}
                    onChange={toggleSelectAll}
                  />
                </th>
                <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Membro</th>
                <th className="hidden lg:table-cell py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Email</th>
                <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Produtos</th>
                <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Registrado em</th>
                <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider w-24">Ações</th>
              </tr>
            </thead>
            <tbody>
              {members.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500 text-sm">
                    Nenhum membro encontrado.
                  </td>
                </tr>
              ) : (
                members.map((member) => {
                  const isSelected = selected.has(member.id);
                  const isHovered = hoveredRow === member.id;
                  const initials = getInitials(member.full_name);
                  const gradient = getGradient(member.id);
                  const accessCount = member.member_access?.[0]?.count ?? 0;

                  return (
                    <tr
                      key={member.id}
                      className={`border-b border-slate-100 transition-colors ${isSelected ? 'bg-blue-50/50' : 'hover:bg-slate-50'}`}
                      onMouseEnter={() => setHoveredRow(member.id)}
                      onMouseLeave={() => setHoveredRow(null)}
                    >
                      <td className="py-3 px-4">
                        <input
                          type="checkbox"
                          className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-600 accent-blue-600 cursor-pointer"
                          checked={isSelected}
                          onChange={() => toggleSelect(member.id)}
                        />
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 lg:w-9 lg:h-9 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center text-white text-xs font-semibold shrink-0`}>
                            {initials}
                          </div>
                          <Link
                            href={`/admin/members/${member.id}`}
                            className="font-medium text-sm text-slate-900 hover:text-blue-600 transition-colors"
                          >
                            {member.full_name || 'Sem nome'}
                          </Link>
                        </div>
                      </td>
                      <td className="hidden lg:table-cell py-3 px-4 text-sm text-slate-500">
                        {member.full_name ? `${member.full_name.toLowerCase().replace(/\s+/g, '.')}@email.com` : '—'}
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                          {accessCount} {accessCount === 1 ? 'produto' : 'produtos'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-slate-500">
                        {new Date(member.created_at).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1">
                          <Link
                            href={`/admin/members/${member.id}`}
                            className={`p-1.5 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all ${isHovered || isSelected ? 'opacity-100' : 'opacity-0'}`}
                            title="Ver membro"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <button
                            type="button"
                            className={`p-1.5 rounded-md text-red-400 hover:text-red-600 hover:bg-red-50 transition-all ${isHovered || isSelected ? 'opacity-100' : 'opacity-0'}`}
                            title="Revogar acesso"
                            onClick={() => {
                              setSelected(new Set([member.id]));
                              setBatchAction('revoke');
                            }}
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Mobile Cards */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15 }}
        className="md:hidden flex flex-col gap-3"
      >
        {members.length === 0 ? (
          <div className="py-12 text-center text-slate-500 text-sm bg-white border border-slate-200 rounded-xl">
            Nenhum membro encontrado.
          </div>
        ) : (
          members.map((member) => {
            const isSelected = selected.has(member.id);
            const initials = getInitials(member.full_name);
            const gradient = getGradient(member.id);
            const accessCount = member.member_access?.[0]?.count ?? 0;

            return (
              <div
                key={member.id}
                className={`bg-white border rounded-xl p-4 shadow-sm transition-colors ${isSelected ? 'border-blue-300 bg-blue-50/30' : 'border-slate-200'}`}
              >
                <div className="flex items-start gap-3">
                  <div className="pt-1">
                    <input
                      type="checkbox"
                      className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-600 accent-blue-600 cursor-pointer"
                      checked={isSelected}
                      onChange={() => toggleSelect(member.id)}
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center text-white text-sm font-semibold shrink-0`}>
                        {initials}
                      </div>
                      <div>
                        <Link
                          href={`/admin/members/${member.id}`}
                          className="font-medium text-sm text-slate-900 hover:text-blue-600 transition-colors"
                        >
                          {member.full_name || 'Sem nome'}
                        </Link>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                        {accessCount} {accessCount === 1 ? 'produto' : 'produtos'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                      <span className="text-xs text-slate-500">
                        Registrado em {new Date(member.created_at).toLocaleDateString('pt-BR')}
                      </span>
                      <div className="flex items-center gap-1">
                        <Link
                          href={`/admin/members/${member.id}`}
                          className="p-1.5 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                          title="Ver membro"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <button
                          type="button"
                          className="p-1.5 rounded-md text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                          title="Revogar acesso"
                          onClick={() => {
                            setSelected(new Set([member.id]));
                            setBatchAction('revoke');
                          }}
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </motion.div>

      {/* Pagination */}
      <Pagination
        page={page}
        totalPages={totalPages}
        totalItems={total}
        onPageChange={handlePageChange}
      />

      {/* Bulk Action Bar */}
      <BulkActionBar
        selectedCount={selected.size}
        onGrantAccess={() => setBatchAction('grant')}
        onRevokeAccess={() => setBatchAction('revoke')}
        onClearSelection={() => setSelected(new Set())}
      />

      {/* Batch Access Dialog */}
      {batchAction && (
        <BatchAccessDialog
          action={batchAction}
          profileIds={Array.from(selected)}
          products={products.map((p) => ({ id: p.id, title: p.title }))}
          onClose={() => {
            setBatchAction(null);
            setSelected(new Set());
          }}
        />
      )}

      {/* Import Dialog */}
      {showImport && <ImportMembersDialog onClose={() => setShowImport(false)} />}

      {/* Add Member Dialog */}
      {showAddMember && (
        <AddMemberDialog
          products={products.map((p) => ({ id: p.id, title: p.title }))}
          onClose={() => setShowAddMember(false)}
        />
      )}
    </div>
  );
}
