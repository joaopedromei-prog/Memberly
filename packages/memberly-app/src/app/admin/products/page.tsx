import Link from 'next/link';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { ProductList } from '@/components/admin/ProductList';
import type { ProductWithModuleCount } from '@/types/api';

export default async function ProductsPage() {
  const supabase = await createServerSupabaseClient();

  const { data: products } = await supabase
    .from('products')
    .select('*, modules(count)')
    .order('sort_order');

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Produtos</h2>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/products/ai-wizard"
            className="inline-flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z" />
              <path d="M18 14l1 3 3 1-3 1-1 3-1-3-3-1 3-1 1-3z" />
            </svg>
            Criar com IA
          </Link>
          <Link
            href="/admin/products/new"
            className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Novo Produto
          </Link>
        </div>
      </div>
      <ProductList products={(products as ProductWithModuleCount[]) ?? []} />
    </div>
  );
}
