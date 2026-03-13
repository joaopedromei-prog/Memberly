import { notFound } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { ProductPageClient } from '@/components/admin/ProductPageClient';
import type { ModuleWithLessons } from '@/types/api';

interface EditProductPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditProductPage({ params }: EditProductPageProps) {
  const { id } = await params;
  const supabase = await createServerSupabaseClient();

  const { data: product, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !product) {
    notFound();
  }

  // Fetch modules with their lessons in a single query
  const { data: modules } = await supabase
    .from('modules')
    .select('*, lessons(*)')
    .eq('product_id', id)
    .order('sort_order')
    .order('sort_order', { referencedTable: 'lessons' });

  const moduleList = (modules as ModuleWithLessons[]) ?? [];

  // Fetch member count for this product
  const { count: memberCount } = await supabase
    .from('member_access')
    .select('id', { count: 'exact', head: true })
    .eq('product_id', id);

  // Count total lessons across all modules
  const totalLessons = moduleList.reduce(
    (sum, m) => sum + (m.lessons?.length ?? 0),
    0
  );

  return (
    <ProductPageClient
      product={product}
      modules={moduleList}
      memberCount={memberCount ?? 0}
      totalLessons={totalLessons}
    />
  );
}
