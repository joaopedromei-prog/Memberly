import Link from 'next/link';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { ProductList, type ProductListItem } from '@/components/admin/ProductList';

export default async function ProductsPage() {
  const supabase = await createServerSupabaseClient();

  const { data: rawProducts } = await supabase
    .from('products')
    .select('id, title, description, banner_url, slug, is_published, sort_order, created_at, modules(id, lessons(count))')
    .order('sort_order');

  const products: ProductListItem[] = (rawProducts ?? []).map((p) => ({
    id: p.id,
    title: p.title,
    slug: p.slug,
    banner_url: p.banner_url,
    is_published: p.is_published,
    created_at: p.created_at,
    moduleCount: p.modules?.length ?? 0,
    lessonCount:
      p.modules?.reduce(
        (sum: number, m: { id: string; lessons: { count: number }[] }) =>
          sum + (m.lessons?.[0]?.count ?? 0),
        0
      ) ?? 0,
  }));

  return (
    <div>
      <ProductList products={products} />
    </div>
  );
}
