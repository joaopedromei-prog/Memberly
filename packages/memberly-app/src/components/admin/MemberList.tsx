'use client';

import { useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { SearchInput } from '@/components/ui/SearchInput';
import { Pagination } from '@/components/ui/Pagination';
import type { MemberWithAccessCount, ProductWithModuleCount } from '@/types/api';

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
      // Reset to page 1 on filter change
      if ('search' in updates || 'product_id' in updates) {
        params.delete('page');
      }
      router.push(`/admin/members?${params.toString()}`);
    },
    [router, searchParams]
  );

  const handleSearch = useCallback(
    (value: string) => {
      updateParams({ search: value });
    },
    [updateParams]
  );

  const handleProductFilter = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      updateParams({ product_id: e.target.value });
    },
    [updateParams]
  );

  const handlePageChange = useCallback(
    (newPage: number) => {
      updateParams({ page: String(newPage) });
    },
    [updateParams]
  );

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <SearchInput
          value={initialSearch}
          onChange={handleSearch}
          placeholder="Buscar por nome..."
          className="flex-1"
        />
        <select
          value={initialProductId}
          onChange={handleProductFilter}
          className="rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Todos os produtos</option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.title}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-gray-200 bg-gray-50">
            <tr>
              <th className="px-4 py-3 font-medium text-gray-600">Nome</th>
              <th className="hidden px-4 py-3 font-medium text-gray-600 sm:table-cell">
                Data de Registro
              </th>
              <th className="px-4 py-3 text-right font-medium text-gray-600">Produtos</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {members.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-4 py-8 text-center text-gray-500">
                  Nenhum membro encontrado.
                </td>
              </tr>
            ) : (
              members.map((member) => (
                <tr key={member.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/members/${member.id}`}
                      className="font-medium text-gray-900 hover:text-blue-600"
                    >
                      {member.full_name || 'Sem nome'}
                    </Link>
                  </td>
                  <td className="hidden px-4 py-3 text-gray-500 sm:table-cell">
                    {new Date(member.created_at).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-500">
                    {member.member_access?.[0]?.count ?? 0}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <Pagination
        page={page}
        totalPages={totalPages}
        totalItems={total}
        onPageChange={handlePageChange}
      />
    </div>
  );
}
