import Link from 'next/link';
import { StatCard } from '@/components/admin/StatCard';

export default function AdminDashboardPage() {
  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Dashboard</h1>

      {/* Stat Cards Grid */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2">
        <StatCard
          title="Total de Membros"
          value={0}
          icon={
            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
            </svg>
          }
        />
        <StatCard
          title="Total de Produtos"
          value={0}
          icon={
            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          }
        />
      </div>

      {/* Recent Members */}
      <div className="mb-8 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Membros Recentes</h2>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="h-8 w-8 animate-pulse rounded-full bg-gray-200" />
              <div className="flex-1">
                <div className="h-4 w-32 animate-pulse rounded bg-gray-200" />
              </div>
              <div className="h-4 w-20 animate-pulse rounded bg-gray-200" />
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Ações Rápidas</h2>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/admin/products/new"
            className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
          >
            Novo Produto
          </Link>
          <Link
            href="/admin/members"
            className="inline-flex items-center rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            Gerenciar Membros
          </Link>
        </div>
      </div>
    </div>
  );
}
