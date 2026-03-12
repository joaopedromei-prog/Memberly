import Link from 'next/link';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { StatCard } from '@/components/admin/StatCard';
import { ProductStatusBadge } from '@/components/admin/ProductStatusBadge';

export default async function AdminDashboardPage() {
  const supabase = await createServerSupabaseClient();

  // Fetch all stats in parallel
  const [
    { count: totalProducts },
    { count: totalMembers },
    { count: publishedProducts },
    { count: totalLessons },
    { data: recentProducts },
  ] = await Promise.all([
    supabase.from('products').select('*', { count: 'exact', head: true }),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'member'),
    supabase.from('products').select('*', { count: 'exact', head: true }).eq('is_published', true),
    supabase.from('lessons').select('*', { count: 'exact', head: true }),
    supabase
      .from('products')
      .select('id, title, slug, is_published, created_at, modules(id)')
      .order('created_at', { ascending: false })
      .limit(5),
  ]);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Dashboard</h1>

      {/* Stat Cards Grid */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total de Produtos"
          value={totalProducts ?? 0}
          icon={
            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          }
        />
        <StatCard
          title="Total de Membros"
          value={totalMembers ?? 0}
          icon={
            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
            </svg>
          }
        />
        <StatCard
          title="Produtos Publicados"
          value={publishedProducts ?? 0}
          icon={
            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <StatCard
          title="Total de Aulas"
          value={totalLessons ?? 0}
          icon={
            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
            </svg>
          }
        />
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Acoes Rapidas</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <Link
            href="/admin/products/new"
            className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-5 shadow-sm transition-colors hover:border-blue-300 hover:bg-blue-50"
          >
            <span className="text-2xl" role="img" aria-label="Novo Produto">+</span>
            <div>
              <p className="font-medium text-gray-900">Novo Produto</p>
              <p className="text-sm text-gray-500">Criar um novo produto</p>
            </div>
          </Link>
          <Link
            href="/admin/products"
            className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-5 shadow-sm transition-colors hover:border-blue-300 hover:bg-blue-50"
          >
            <span className="text-2xl" role="img" aria-label="Gerenciar Produtos">
              <svg className="h-7 w-7 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </span>
            <div>
              <p className="font-medium text-gray-900">Gerenciar Produtos</p>
              <p className="text-sm text-gray-500">Ver e editar produtos</p>
            </div>
          </Link>
          <Link
            href="/admin/members"
            className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-5 shadow-sm transition-colors hover:border-blue-300 hover:bg-blue-50"
          >
            <span className="text-2xl" role="img" aria-label="Gerenciar Membros">
              <svg className="h-7 w-7 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
              </svg>
            </span>
            <div>
              <p className="font-medium text-gray-900">Gerenciar Membros</p>
              <p className="text-sm text-gray-500">Ver e gerenciar membros</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Recent Products */}
      <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">Produtos Recentes</h2>
          <Link href="/admin/products" className="text-sm font-medium text-blue-600 hover:text-blue-800">
            Ver todos
          </Link>
        </div>
        {recentProducts && recentProducts.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {recentProducts.map((product) => (
              <div key={product.id} className="flex items-center justify-between px-6 py-4">
                <div className="flex items-center gap-4">
                  <div>
                    <p className="font-medium text-gray-900">{product.title}</p>
                    <p className="text-sm text-gray-500">
                      {Array.isArray(product.modules) ? product.modules.length : 0}{' '}
                      {Array.isArray(product.modules) && product.modules.length === 1 ? 'modulo' : 'modulos'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <ProductStatusBadge isPublished={product.is_published} />
                  <Link
                    href={`/admin/products/${product.id}`}
                    className="text-sm font-medium text-blue-600 hover:text-blue-800"
                  >
                    Editar
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="px-6 py-8 text-center text-sm text-gray-500">
            Nenhum produto criado ainda.{' '}
            <Link href="/admin/products/new" className="text-blue-600 hover:text-blue-800">
              Criar primeiro produto
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
