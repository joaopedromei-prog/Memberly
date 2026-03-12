import Link from 'next/link';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { StatCard } from '@/components/admin/StatCard';
import { ProductStatusBadge } from '@/components/admin/ProductStatusBadge';

export default async function AdminDashboardPage() {
  const supabase = await createServerSupabaseClient();

  const [
    { count: totalProducts },
    { count: totalMembers },
    { count: publishedProducts },
    { count: totalLessons },
    { data: recentProducts },
    { data: alertProducts },
  ] = await Promise.all([
    supabase.from('products').select('*', { count: 'exact', head: true }),
    supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'member'),
    supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('is_published', true),
    supabase.from('lessons').select('*', { count: 'exact', head: true }),
    supabase
      .from('products')
      .select('id, title, slug, is_published, created_at, modules(id)')
      .order('created_at', { ascending: false })
      .limit(5),
    supabase
      .from('products')
      .select('id, title, slug, is_published, modules(count)')
      .order('created_at', { ascending: false }),
  ]);

  // Build attention items
  const attentionItems: { id: string; title: string; issue: string; href: string }[] = [];
  if (alertProducts) {
    for (const p of alertProducts) {
      const moduleCount = Array.isArray(p.modules)
        ? (p.modules[0] as { count: number })?.count ?? 0
        : 0;
      if (moduleCount === 0) {
        attentionItems.push({
          id: p.id,
          title: p.title,
          issue: 'Sem módulos',
          href: `/admin/products/${p.id}`,
        });
      } else if (!p.is_published) {
        attentionItems.push({
          id: p.id,
          title: p.title,
          issue: 'Rascunho',
          href: `/admin/products/${p.id}`,
        });
      }
    }
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <Link
          href="/admin/products/new"
          className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          + Novo Produto
        </Link>
      </div>

      {/* Stat Cards */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total de Produtos"
          value={totalProducts ?? 0}
          icon={
            <svg
              className="h-8 w-8"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
              />
            </svg>
          }
        />
        <StatCard
          title="Total de Membros"
          value={totalMembers ?? 0}
          icon={
            <svg
              className="h-8 w-8"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"
              />
            </svg>
          }
        />
        <StatCard
          title="Publicados"
          value={publishedProducts ?? 0}
          icon={
            <svg
              className="h-8 w-8"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          }
        />
        <StatCard
          title="Total de Aulas"
          value={totalLessons ?? 0}
          icon={
            <svg
              className="h-8 w-8"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z"
              />
            </svg>
          }
        />
      </div>

      {/* Attention Needed */}
      {attentionItems.length > 0 && (
        <div className="mb-8">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-400">
            Atenção Necessária
          </h2>
          <div className="space-y-2">
            {attentionItems.slice(0, 5).map((item) => (
              <Link
                key={item.id}
                href={item.href}
                className="flex items-center justify-between rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 transition-colors hover:bg-amber-100"
              >
                <span className="text-sm font-medium text-gray-900">
                  {item.title}
                </span>
                <span className="rounded-full bg-amber-200 px-2.5 py-0.5 text-xs font-medium text-amber-800">
                  {item.issue}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Recent Products */}
      <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400">
            Produtos Recentes
          </h2>
          <Link
            href="/admin/products"
            className="text-sm font-medium text-blue-600 hover:text-blue-800"
          >
            Ver todos
          </Link>
        </div>
        {recentProducts && recentProducts.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {recentProducts.map((product) => (
              <Link
                key={product.id}
                href={`/admin/products/${product.id}`}
                className="flex items-center justify-between px-6 py-4 transition-colors hover:bg-gray-50"
              >
                <div>
                  <p className="font-medium text-gray-900">{product.title}</p>
                  <p className="text-sm text-gray-500">
                    {Array.isArray(product.modules)
                      ? product.modules.length
                      : 0}{' '}
                    módulo
                    {Array.isArray(product.modules) &&
                    product.modules.length === 1
                      ? ''
                      : 's'}
                  </p>
                </div>
                <ProductStatusBadge isPublished={product.is_published} />
              </Link>
            ))}
          </div>
        ) : (
          <div className="px-6 py-8 text-center text-sm text-gray-500">
            Nenhum produto criado ainda.{' '}
            <Link
              href="/admin/products/new"
              className="text-blue-600 hover:text-blue-800"
            >
              Criar primeiro produto
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
