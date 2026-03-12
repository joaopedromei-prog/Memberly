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
